'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const express = require('express');
const merchantInvoiceRouter = express.Router();

const authenticated = require('../../scripts/shared/authenticated');
const authorizedMerchant = require('../../scripts/shared/authorized-merchant');
const onboardedMerchant = require('../../scripts/shared/onboarded-merchant');
const client = require('../../../sdk/client');
const handlers = [authenticated, authorizedMerchant, onboardedMerchant];

const Store = require('../../redux/store');
const template = require('../../views/layouts/template');
const InvoiceListComponent = require('../../views/invoice/list/index').InvoiceListComponent;
const InvoiceDetailsComponent = require('../../views/invoice/detail/index').InvoiceDetailsComponent;
const AddEditInvoiceComponent = require('../../views/invoice/add-edit/index').AddEditInvoiceComponent;

const validPaymentStatuses = ['Acknowledged', 'Processing', 'Waiting for Payment', 'Pending', 'Paid'];

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../../scripts/shared/user-permissions');

const viewInvoicesPage = {
    code: 'view-merchant-invoices-api',
    renderSidebar: true
};

const viewCreateInvoicePage = {
    code: 'view-merchant-create-invoice-api',
    renderSidebar: true
};

const viewInvoiceDetailsPage = {
    code: 'view-merchant-invoice-details-api',
    renderSidebar: true
};

merchantInvoiceRouter.get('/create', ...handlers, isAuthorizedToAccessViewPage(viewCreateInvoicePage), function (req, res) {
    const user = req.user;
    const purchaseOrderId = req.query['purchaseOrderId'];
    const promisePurchaseOrder = new Promise((resolve, reject) => {
        let options = {
            userId: user.ID,
            keyword: purchaseOrderId,
            pageNumber: 1,
            pageSize: 20,
        }
        client.Orders.getHistoryB2B(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePurchaseOrder]).then(responses => {
        const appString = 'create-invoice';
        const invoiceDetail = { Orders: responses[0].Records };

        getUserPermissionsOnPage(user, 'Create Invoice', 'Merchant', (pagePermissions) => {
            const store = Store.createInvoiceStore({
                userReducer: {
                    user,
                    pagePermissions
                },
                invoiceReducer: { invoiceDetail },
                marketplaceReducer: { locationVariantGroupId: req.LocationVariantGroupId }
            });

            const reduxState = store.getState();
            const app = reactDom.renderToString(
                <AddEditInvoiceComponent user={user} pagePermissions={pagePermissions} invoiceDetail={invoiceDetail} locationVariantGroupId={req.LocationVariantGroupId} />
            );

            let seoTitle = 'Create Invoice';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-seller page-sidebar page-create-invoice', seoTitle, app, appString, reduxState));
        })
    });
});

merchantInvoiceRouter.post('/create', ...handlers, isAuthorizedToPerformAction('add-merchant-create-invoice-api'), function (req, res) {
    var promiseInvoice = new Promise((resolve, reject) => {
        const options = {
            userId: req.user.ID,
            currencyCode: req.body['currencyCode'],
            total: req.body['total'],
            fee: 0,
            orderId: req.body['orderId'],
            payeeId: req.body['payeeId'],
            payerId: req.body['payerId'],
            paymentDueDateTime: req.body['paymentDueDateTime'],
            gatewayTransactionId: req.body['gatewayTransactionId'],
            status: 'Waiting for Payment'
        };

        client.Invoices.createInvoice(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoice]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

merchantInvoiceRouter.get('/list', ...handlers, isAuthorizedToAccessViewPage(viewInvoicesPage), (req, res) => {
    const user = req.user;

    const promisePurchaseOrders = new Promise((resolve, reject) => {
        function getPurchaseOrders(pageNumber = 1, records = []) {
            const promise = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    pageSize: 1000,
                    pageNumber: pageNumber,
                    status: orderStatuses,
                };

                client.Orders.getHistoryB2B(options, (err, result) => {
                    resolve(result);
                });
            });

            Promise.all([promise]).then((responses) => {
                const result = responses[0];
                records = records.concat(result.Records);

                if (result.PageNumber * result.PageSize < result.TotalRecords) {
                    getPurchaseOrders(result.PageNumber + 1, records);
                } else {
                    resolve(records);
                }
            });
        }

        let orderStatuses = [...new Set(process.env.DELIVERY_FULFILLMENT_STATUSES_b2b.split(',').concat(process.env.PICKUP_FULFILLMENT_STATUSES_b2b.split(',')))];
        orderStatuses = orderStatuses.filter((status) => status.toLowerCase() != 'rejected');

        getPurchaseOrders();
    });

    const promiseUsers = new Promise((resolve, reject) => {
        client.Orders.getConsumersFromOrdersB2B({ merchantId: user.ID }, function (err, result) {
            resolve(result);
        });
    });

    const promisePaymentGateways = new Promise((resolve, reject) => {
        client.Payments.getPaymentGateways(null, function (err, result) {
            resolve(result);
        });
    });

    getInvoices({
        userId: user.ID,
        keywords: null,
        pageNumber: 1,
        pageSize: 20,
        //status: 'Processing,Pending,Paid.Failed,Refunded,Created,Acknowledged,Waiting For Payment,Invoiced,Overdue'
    }, function (data) {
        Promise.all([promisePurchaseOrders, promiseUsers, promisePaymentGateways]).then(responses => {
            const appString = 'invoice-list';
            const invoices = data ? data : { Records: [] };
            const purchaseOrders = responses[0];
            let users = responses[1] || [];
            let paymentGateways = responses[2].Records || [];
            let statuses = validPaymentStatuses.map((status) => {
                return {
                    Name: status,
                    isChecked: false
                };
            })

            users.unshift({
                ID: 0,
                DisplayName: 'Select All'
            });
            users = users.map((item) => {
                item.isChecked = false;
                return item;
            });

            paymentGateways.unshift({
                Code: 0,
                Gateway: 'Select All'
            });
            paymentGateways = paymentGateways.map((item) => {
                item.isChecked = false;
                return item;
            });

            statuses.unshift({
                Name: 'Select All',
                isChecked: false
            });

            getUserPermissionsOnPage(user, 'Invoices', 'Merchant', (pagePermissions) => {
                const s = Store.createInvoiceStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    invoiceReducer: {
                        invoiceList: invoices,
                        purchaseOrders: purchaseOrders,
                        users: users,
                        paymentGateways: paymentGateways,
                        statuses: statuses,
                        isUserMerchant: true
                    }
                });

                const reduxState = s.getState();
                try {
                    const invoiceListApp = reactDom.renderToString(
                        <InvoiceListComponent
                            user={user}
                            pagePermissions={pagePermissions}
                            invoiceList={invoices}
                            purchaseOrders={purchaseOrders}
                            users={users}
                            paymentGateways={paymentGateways}
                            statuses={statuses}
                            isUserMerchant={true}
                        />
                    );

                    let seoTitle = 'Invoice List';
                    if (req.SeoTitle) {
                        seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                    }

                    res.send(template('page-seller goods-receipt-list invoice-list page-sidebar', seoTitle, invoiceListApp, appString, reduxState));
                }
                catch (e) {
                    console.log('error', e);
                }
            });
        });
    });
});

merchantInvoiceRouter.get('/filter', ...handlers, function (req, res) {
    const user = req.user;
    const filters = req.query;
    filters.userId = user.ID;
    getInvoices(filters, function (invoiceList) {
        res.send({
            invoiceList: invoiceList
        });
    });
});

merchantInvoiceRouter.get('/detail/:invoiceNo', ...handlers, isAuthorizedToAccessViewPage(viewInvoiceDetailsPage), (req, res) => {
    const user = req.user;
    const invoiceNo = req.params['invoiceNo'];
    if (!invoiceNo || typeof invoiceNo == 'undefined' || invoiceNo == 'undefined') return res.send('Invoice number is missing.');
    const includes = 'Transaction.Orders.PaymentDetails,Transaction.Orders.PaymentTerm';

    const promiseInvoice = new Promise((resolve, reject) => {
        let options = { invoiceNo, includes };

        client.Orders.getInvoiceNumberDetails(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoice]).then(responses => {
        const invoiceDetail = responses[0];
        if (!invoiceDetail) return res.send('Invoice not found.');
        const { MerchantDetail } = invoiceDetail.Orders[0];
        const paymentDetail = invoiceDetail.Orders[0].PaymentDetails.find(p => p.InvoiceNo == invoiceDetail.InvoiceNo);

        const promisePaymentAcceptanceMethods = new Promise((resolve, reject) => {
            const options = {
                merchantId: MerchantDetail.ID
            };

            client.Payments.getPaymentAcceptanceMethods(options, (err, result) => {
                resolve(result);
            });
        });

        Promise.all([promisePaymentAcceptanceMethods]).then(responses => {
            const appString = 'invoice-details';
            const paymentAcceptanceMethods = responses[0] ? responses[0].Records : [];
            const paymentMethods = [];
            if (paymentDetail && paymentAcceptanceMethods && paymentAcceptanceMethods.length > 0) {
                const payMethod = paymentAcceptanceMethods.find(p => p.PaymentGateway.Code == paymentDetail.Gateway.Code);
                if (payMethod) {
                    paymentMethods.push(payMethod);
                }
            }

            getUserPermissionsOnPage(user, 'Invoice Details', 'Merchant', (pagePermissions) => {
                const store = Store.createInvoiceStore({
                    userReducer: {
                        user,
                        pagePermissions
                    },
                    invoiceReducer: {
                        invoiceDetail: invoiceDetail,
                        paymentMethods: paymentMethods,
                        isUserMerchant: true
                    },
                    marketplaceReducer: {
                        locationVariantGroupId: req.LocationVariantGroupId
                    }
                });
                const reduxState = store.getState();
                const app = reactDom.renderToString(
                    <InvoiceDetailsComponent
                        user={user}
                        pagePermissions={pagePermissions}
                        invoiceDetail={invoiceDetail}
                        paymentMethods={paymentMethods}
                        isUserMerchant={true}
                        locationVariantGroupId={req.LocationVariantGroupId} />
                );

                let seoTitle = 'Invoice Details';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                res.send(template('page-seller page-invoice-view page-sidebar', seoTitle, app, appString, reduxState));
            });
        });
    });
});

merchantInvoiceRouter.put('/update-invoice-status', ...handlers, function (req, res) {
    const user = req.user;

    if (validPaymentStatuses.includes(req.body.status)) {
        const options = {
            invoiceNo: req.body.invoiceNo,
            status: req.body.status == 'Paid' ? 'Success' : req.body.status,
            userId: user.ID,
        }

        const promiseUpdateInvoiceStatus = new Promise((resolve, reject) => {
            client.Invoices.updateInvoiceStatus(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseUpdateInvoiceStatus]).then(responses => {
            res.send({ success: responses && responses[0] == true });
        });
    }
});

function getInvoices(options, callback) {
    const promiseInvoices = new Promise((resolve, reject) => {
        client.Orders.getHistory(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoices]).then((response) => {
        const invoices = response[0];
        callback(invoices);
    });
}

module.exports = merchantInvoiceRouter;