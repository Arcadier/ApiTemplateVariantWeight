'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const express = require('express');
const invoiceRouter = express.Router();
const Store = require('../redux/store');
const template = require('../views/layouts/template');
const crypto = require('crypto');
const requestApi = require('../scripts/shared/request-api');

const authenticated = require('../scripts/shared/authenticated');
const authorizedUser = require('../scripts/shared/authorized-user');
const onboardedMerchant = require('../scripts/shared/onboarded-merchant');
const client = require('../../sdk/client');

const InvoiceDetailsComponent = require('../views/invoice/detail/index').InvoiceDetailsComponent;
const InvoiceListComponent = require('../views/invoice/list/index').InvoiceListComponent;
const InvoicePaymentComponent = require('../views/invoice/payment/index').InvoicePaymentComponent;
const InvoiceTransactionCompleteComponent = require('../views/invoice/transaction-complete/index').InvoiceTransactionCompleteComponent;

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage } = require('../scripts/shared/user-permissions');

const EnumCoreModule = require('../public/js/enum-core');

const handlers = [authenticated, authorizedUser, onboardedMerchant];

const validPaymentStatuses = ['Acknowledged', 'Processing', 'Waiting for Payment', 'Pending', 'Paid'];

const viewInvoiceListData = {
    code: 'view-consumer-invoices-api',
    seoTitle: 'Invoice List',
    renderSidebar: true,
};

const viewInvoiceDetailsData = {
    code: 'view-consumer-invoice-details-api',
    seoTitle: 'Invoice Details',
    renderSidebar: true,
};

invoiceRouter.get('/payment/:invoiceNo', authenticated, authorizedUser, (req, res) => {
    const { user } = req;
    const { invoiceNo } = req.params;

    const promiseInvoice = new Promise((resolve, reject) => {
        const options = {
            invoiceNo: invoiceNo,
            includes: 'Transaction.Orders.PaymentDetails'
        };

        client.Orders.getInvoiceNumberDetails(options, (err, result) => {
            result.Orders.map((order) => {
                order.PaymentDetails = order.PaymentDetails.filter(p => p.InvoiceNo == options.invoiceNo);

                order.PaymentDetails.map((payment) => {
                    payment.Order = {
                        ID: order.ID
                    };
                });
            });

            resolve(result);
        });
    });

    Promise.all([promiseInvoice]).then((responses) => {
        const invoice = responses[0];
        const paymentDetail = invoice.Orders[0].PaymentDetails.find(p => p.InvoiceNo == invoice.InvoiceNo);

        if (!paymentDetail.Status || paymentDetail.Status.toLowerCase() != 'waiting for payment' || (paymentDetail.Status.toLowerCase() == 'waiting for payment' && paymentDetail.GatewayPayKey))
            return res.redirect(`/invoice/detail/${invoice.InvoiceNo}?error=invalid-payment-status`);

        getPaymentMethods(invoice, (paymentMethods) => {
            const reduxState = Store.createInvoiceStore({
                userReducer: {
                    user: user
                },
                invoiceReducer: {
                    invoiceDetail: invoice,
                    paymentMethods: paymentMethods
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<InvoicePaymentComponent
                user={user}
                invoiceDetail={invoice}
                paymentMethods={paymentMethods} />);

            res.send(template('page-payment', seoTitle, app, 'invoice-payment', reduxState));
        });
    });
});

invoiceRouter.post('/process-payment', authenticated, (req, res) => {
    const { invoiceNo, gatewayCode, stripe, omise } = req.body;

    const promiseInvoice = new Promise((resolve, reject) => {
        const options = {
            invoiceNo: invoiceNo,
            includes: 'Transaction.Orders.PaymentDetails'
        };

        client.Orders.getInvoiceNumberDetails(options, (err, result) => {
            result.Orders.map((order) => {
                order.PaymentDetails = order.PaymentDetails.filter(p => p.InvoiceNo == options.invoiceNo);

                order.PaymentDetails.map((payment) => {
                    payment.Order = {
                        ID: order.ID
                    };
                });
            });

            resolve(result);
        });
    });

    const promisePaymentGateways = new Promise((resolve, reject) => {
        client.Payments.getPaymentGateways(null, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseInvoice, promisePaymentGateways]).then((responses) => {
        const invoice = responses[0];
        const paymentGateways = responses[1].Records;
        const merchants = invoice.Orders.map((order) => order.MerchantDetail);

        const promisePaymentAcceptanceMethods = merchants.map((merchant) => {
            return new Promise((resolve, reject) => {
                const options = {
                    merchantId: merchant.ID
                };

                client.Payments.getPaymentAcceptanceMethods(options, (err, result) => {
                    result.UserID = options.merchantId;
                    resolve(result);
                });
            });
        });

        Promise.all(promisePaymentAcceptanceMethods).then((responses) => {
            const paymentAcceptanceMethods = responses.map((response) => {
                return {
                    UserID: response.UserID,
                    PaymentAcceptanceMethods: response.Records
                }
            });

            const paymentGateway = paymentGateways.find(g => g.Code == gatewayCode);
            const isCustomPayment = !EnumCoreModule.GetNonCustomGatewayCodes().includes(paymentGateway.Code);

            promiseUpdateInvoice(invoice, { gatewayCode: paymentGateway.Code }).then(() => {
                if (!isCustomPayment) {
                    const paymentRequest = buildPaymentRequest(req, invoice, paymentGateway, paymentAcceptanceMethods);

                    if (paymentRequest.settings.code.startsWith('stripe')) {
                        if (paymentRequest.settings.is3dsEnabled) {
                            payStripe3ds(invoice, paymentRequest, (error, sessionId, account) => {
                                res.send({ error: error, sessionId: sessionId, account: account });
                            });
                        } else {
                            promiseUpdateInvoice(invoice, { status: 'Pending' }).then(() => {
                                payStripe(JSON.parse(stripe), invoice, paymentRequest, (error) => {
                                    res.send({ error: error });
                                });
                            });
                        }
                    }
                    if (paymentRequest.settings.code.startsWith('omise')) {
                        promiseUpdateInvoice(invoice, { status: 'Pending' }).then(() => {
                            payOmise(JSON.parse(omise), invoice, paymentRequest, (error) => {
                                res.send({ error: error });
                            });
                        });
                    }
                } else {
                    if (paymentGateway.Code.indexOf('-cash-on-delivery-') >= 0) {
                        payCod(invoice, (error) => {
                            res.send({ error: error });
                        });
                    } else if (paymentGateway.Code.indexOf('-offline-payments-') >= 0) {
                        payOffline(invoice, (error) => {
                            res.send({ error: error });
                        });
                    } else {
                        payCustom(req, invoice, paymentGateway, (error, url) => {
                            res.send({ error: error, url: url });
                        });
                    }
                }
            });
        });
    });
});

invoiceRouter.get('/payment-gateway/success', authenticated, (req, res) => {
    const { gateway, invoiceNo } = req.query;
    const sessionId = req.query['session_id'];

    if (!gateway)
        return res.send('Gateway not found');

    if (!gateway.startsWith('stripe'))
        return res.send('Gateway not supported');

    if (!invoiceNo || !sessionId)
        return res.send('Required parameters not found');

    const promiseInvoice = new Promise((resolve, reject) => {
        const options = {
            invoiceNo: invoiceNo,
            includes: 'Transaction.Orders.PaymentDetails'
        };

        client.Orders.getInvoiceNumberDetails(options, (err, result) => {
            result.Orders.map((order) => {
                order.PaymentDetails = order.PaymentDetails.filter(p => p.InvoiceNo == options.invoiceNo);

                order.PaymentDetails.map((payment) => {
                    payment.Order = {
                        ID: order.ID
                    };
                });
            });

            resolve(result);
        });
    });

    const promisePaymentGateways = new Promise((resolve, reject) => {
        client.Payments.getPaymentGateways(null, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseInvoice, promisePaymentGateways]).then((responses) => {
        const invoice = responses[0];
        const paymentGateways = responses[1].Records;

        invoice.Orders.map((order) => {
            order.PaymentDetails.map((payment) => {
                if ((payment.Status && payment.Status.toLowerCase() == 'success') || payment.GatewayPayKey != sessionId) {
                    return res.send('Payment records not match');
                }
            });
        });

        const merchants = invoice.Orders.map((order) => order.MerchantDetail);

        const promisePaymentAcceptanceMethods = merchants.map((merchant) => {
            return new Promise((resolve, reject) => {
                const options = {
                    merchantId: merchant.ID
                };

                client.Payments.getPaymentAcceptanceMethods(options, (err, result) => {
                    result.UserID = options.merchantId;
                    resolve(result);
                });
            });
        });

        Promise.all(promisePaymentAcceptanceMethods).then((responses) => {
            const paymentAcceptanceMethods = responses.map((response) => {
                return {
                    UserID: response.UserID,
                    PaymentAcceptanceMethods: response.Records
                }
            });

            const paymentGateway = paymentGateways.find(g => g.Code == gateway);

            const paymentRequest = buildPaymentRequest(req, invoice, paymentGateway, paymentAcceptanceMethods);
            const settings = paymentRequest.settings;
            const payee = paymentRequest.payees[0];
            const admins = paymentRequest.admins;

            promiseUpdateInvoice(invoice, { status: 'Pending' }).then(() => {
                const stripe = require('stripe')(settings.secretKey);

                stripe.checkout.sessions.retrieve(sessionId, { stripeAccount: payee.gatewayAccount }).then((session) => {
                    stripe.paymentIntents.retrieve(session.payment_intent, { stripeAccount: payee.gatewayAccount }).then((paymentIntent) => {
                        //const promises = promiseUpdateOrders(invoice, { paymentStatus: 'Paid', balance: 0 });

                        Promise.all([]).then((responses) => {
                            const charge = paymentIntent.charges.data[0];
                            let requests = [];

                            requests.push({
                                orderId: invoice.Orders[0].ID,
                                payeeId: payee.internalUserId,
                                status: 'Success',
                                payKey: charge.id,
                                gatewayTimestamp: charge.created,
                                gatewayStatus: charge.status,
                                gatewayReceiverId: payee.gatewayAccount,
                                gatewaySenderId: charge.customer,
                                gatewayRef: charge.balance_transaction,
                            });

                            // TODO: remove this condition once we have admin fee
                            if (admins[0]) {
                                requests.push({
                                    orderId: invoice.Orders[0].ID,
                                    payeeId: admins[0].id,
                                    status: 'Success',
                                    payKey: charge.id,
                                    gatewayTimestamp: charge.created,
                                    gatewayStatus: charge.status,
                                    gatewayReceiverId: null,
                                    gatewaySenderId: charge.customer,
                                    gatewayRef: charge.id,
                                });
                            }

                            promiseUpdatePaymentDetails(invoice, requests).then((responses) => {
                                res.redirect(`/invoice/transaction-complete/${invoice.InvoiceNo}`)
                            });
                        });
                    }).catch((error) => {
                        res.send('stripe retrieve payment intent error: ' + error.raw.message);
                    });
                }).catch((error) => {
                    res.send('stripe retrieve session error: ' + error.raw.message);
                });
            });
        });
    });
});

invoiceRouter.get('/order-details', authenticated, (req, res) => {
    const { gateway, invoiceNo, payKey, hashKey } = req.query;

    if (gateway && invoiceNo && payKey && hashKey && isValidHashKey(gateway, invoiceNo, hashKey)) {
        const promiseInvoice = new Promise((resolve, reject) => {
            const options = {
                invoiceNo: invoiceNo,
                includes: 'Transaction.Orders.PaymentDetails'
            };

            client.Orders.getInvoiceNumberDetails(options, (err, result) => {
                result.Orders.map((order) => {
                    order.PaymentDetails = order.PaymentDetails.filter(p => p.InvoiceNo == options.invoiceNo);

                    order.PaymentDetails.map((payment) => {
                        payment.Order = {
                            ID: order.ID
                        };
                    });
                });

                resolve(result);
            });
        });

        Promise.all([promiseInvoice]).then((responses) => {
            const invoice = responses[0];
            let payeeInfos = [];

            invoice.Orders.map((order) => {
                order.PaymentDetails.map((payment) => {
                    if (payment.GatewayPayKey == payKey) {
                        if (payment.Payee.ID === order.MerchantDetail.ID) {
                            let items = [];

                            order.CartItemDetails.map((cart) => {
                                items.push({
                                    Id: order.ID + ' - ' + cart.ItemDetail.ID,
                                    ItemId: cart.ItemDetail.ID,
                                    Sku: cart.ItemDetail.SKU,
                                    Name: cart.ItemDetail.Name,
                                    Description: cart.ItemDetail.BuyerDescription,
                                    Currency: cart.CurrencyCode,
                                    Price: cart.ItemDetail.Price,
                                    Quantity: parseInt(cart.Quantity)
                                });
                            });

                            if (order.Freight && order.Freight > 0) {
                                items.push({
                                    Id: order.ID + ' - Freight',
                                    ItemId: '',
                                    Sku: '',
                                    Name: 'Freight Cost',
                                    Description: 'Freight Cost',
                                    Currency: order.CurrencyCode,
                                    Price: order.Freight,
                                    Quantity: 1
                                });
                            }

                            items.push({
                                Id: 'Admin Fee - Order ' + order.ID,
                                ItemId: '',
                                Sku: '',
                                Name: 'Fee (Deducted)',
                                Description: 'Admin Fee',
                                Currency: order.CurrencyCode,
                                Price: payment.Fee,
                                Quantity: 1
                            });

                            payeeInfos.push({
                                InternalUserId: payment.Payee.ID,
                                Total: payment.Total,
                                Currency: payment.CurrencyCode,
                                OrderId: order.ID,
                                Items: items,
                                Reference: invoice.InvoiceNo + '/' + order.ID,
                                Id: payment.Payee.ID,
                                Name: order.MerchantDetail.DisplayName || (order.MerchantDetail.FirstName + ' ' + order.MerchantDetail.LastName),
                                Email: order.MerchantDetail.Email
                            });
                        }
                    }
                });
            });

            let payer = null;

            if (invoice.Orders[0]) {
                const order = invoice.Orders[0];

                payer = {
                    Id: order.ConsumerDetail.ID,
                    Name: order.ConsumerDetail.DisplayName || (order.ConsumerDetail.FirstName + ' ' + order.ConsumerDetail.LastName),
                    Email: order.ConsumerDetail.Email
                }
            }

            res.send({
                PayeeInfos: payeeInfos,
                InvoiceNo: invoice.InvoiceNo,
                Payer: payer
            });
        });
    } else {
        res.send({});
    }
});

invoiceRouter.get('/current-status', authenticated, (req, res) => {
    const { invoiceNo } = req.query;

    const promiseInvoice = new Promise((resolve, reject) => {
        const options = {
            invoiceNo: invoiceNo,
            includes: 'Transaction.Orders.PaymentDetails'
        };

        client.Orders.getInvoiceNumberDetails(options, (err, result) => {
            result.Orders.map((order) => {
                order.PaymentDetails = order.PaymentDetails.filter(p => p.InvoiceNo == options.invoiceNo);

                order.PaymentDetails.map((payment) => {
                    payment.Order = {
                        ID: order.ID
                    };
                });
            });

            resolve(result);
        });
    });

    Promise.all([promiseInvoice]).then((responses) => {
        const invoice = responses[0];
        let hasUnsuccessfulPayment = false;

        invoice.Orders.map((order) => {
            order.PaymentDetails.map((payment) => {
                if (!payment.Status || payment.Status.toLowerCase() !== 'success') {
                    hasUnsuccessfulPayment = true;
                }
            });
        });

        if (!hasUnsuccessfulPayment) {
            return res.redirect(`/invoice/transaction-complete/${invoiceNo}`);
        }

        // TODO: show other appropriate pages based on payment status
        res.send('payment status is not successful yet');
    });
});

invoiceRouter.get('/transaction-status', authenticated, (req, res) => {
    const { gateway, invoiceNo, payKey, hashKey, status, isCallback } = req.query;

    const validStatuses = ['success', 'failed'];

    if (gateway && invoiceNo && payKey && hashKey && status && isValidHashKey(gateway, invoiceNo, hashKey) && validStatuses.includes(status.toLowerCase())) {
        const promiseInvoice = new Promise((resolve, reject) => {
            const options = {
                invoiceNo: invoiceNo,
                includes: 'Transaction.Orders.PaymentDetails'
            };

            client.Orders.getInvoiceNumberDetails(options, (err, result) => {
                result.Orders.map((order) => {
                    order.PaymentDetails = order.PaymentDetails.filter(p => p.InvoiceNo == options.invoiceNo);

                    order.PaymentDetails.map((payment) => {
                        payment.Order = {
                            ID: order.ID
                        };
                    });
                });

                resolve(result);
            });
        });

        Promise.all([promiseInvoice]).then((responses) => {
            const invoice = responses[0];
            let isValid = true;

            invoice.Orders.map((order) => {
                order.PaymentDetails.map((payment) => {
                    if (payment.InvoiceNo == invoiceNo) {
                        if (payment.GatewayPayKey != payKey || (payment.Status && payment.Status.toLowerCase() == 'success')) {
                            isValid = false;
                        }
                    }
                })
            });

            if (isValid) {
                let promises = [];

                if (status == 'success') {
                    //promises = promiseUpdateOrders(invoice, { paymentStatus: 'Paid', balance: 0 });
                } else {
                    //promises = promiseUpdateOrders(invoice, { paymentStatus: 'Failed' });
                }

                Promise.all(promises).then((responses) => {
                    const paymentStatus = status == 'success' ? 'Success' : 'Failed';
                    const timestamp = Math.floor(new Date().getTime() / 1000);

                    promiseUpdateInvoice(invoice, { status: paymentStatus, gatewayTimestamp: timestamp, gatewayStatus: paymentStatus }).then(() => {
                        if (isCallback) {
                            return res.send({ error: '' });
                        }

                        res.redirect(`/invoice/transaction-complete/${invoice.InvoiceNo}`);
                    });
                });
            } else {
                if (isCallback) {
                    return res.send({ error: 'Invalid request' });
                }

                const ErrorComponent = require('../views/error');
                res.send(reactDom.renderToString(<ErrorComponent message={'Invalid request'} />));
            }
        });
    } else {
        if (isCallback) {
            return res.send({ error: 'Invalid request' });
        }

        const ErrorComponent = require('../views/error');
        res.send(reactDom.renderToString(<ErrorComponent message={'Invalid request'} />));
    }
});

invoiceRouter.get('/transaction-complete/:invoiceNo', authenticated, (req, res) => {
    const { user } = req;
    const { invoiceNo } = req.params;

    if (!invoiceNo)
        return res.redirect(`/invoice/detail/${invoiceNo}`);

    const promiseInvoice = new Promise((resolve, reject) => {
        const options = {
            invoiceNo: invoiceNo,
            includes: 'Transaction.Orders.PaymentDetails'
        };

        client.Orders.getInvoiceNumberDetails(options, (err, result) => {
            result.Orders.map((order) => {
                order.PaymentDetails = order.PaymentDetails.filter(p => p.InvoiceNo == options.invoiceNo);

                order.PaymentDetails.map((payment) => {
                    payment.Order = {
                        ID: order.ID
                    };
                });
            });

            resolve(result);
        });
    });

    Promise.all([promiseInvoice]).then((responses) => {
        const invoice = responses[0];
        const { MerchantDetail } = invoice.Orders[0];
        const paymentDetail = invoice.Orders[0].PaymentDetails.find(p => p.InvoiceNo == invoice.InvoiceNo);

        if (!paymentDetail.Status || (paymentDetail.Status.toLowerCase() != 'success' && !(paymentDetail.GatewayPayKey && paymentDetail.Status.toLowerCase() == 'waiting for payment')))
            return res.redirect(`/invoice/detail/${invoice.InvoiceNo}?error=invalid-payment-status`);

        const promisePaymentAcceptanceMethods = new Promise((resolve, reject) => {
            const options = {
                merchantId: MerchantDetail.ID
            };

            client.Payments.getPaymentAcceptanceMethods(options, (err, result) => {
                resolve(result);
            });
        });

        Promise.all([promisePaymentAcceptanceMethods]).then((responses) => {
            const paymentAcceptanceMethods = responses[0].Records;
            const paymentMethod = paymentAcceptanceMethods.find(p => p.PaymentGateway.Code == paymentDetail.Gateway.Code);
            const isOfflinePayment = !EnumCoreModule.GetNonCustomGatewayCodes().includes(paymentMethod.PaymentGateway.Code) && paymentMethod.PaymentGateway.Code.indexOf('-offline-payments-') >= 0;

            const reduxState = Store.createInvoiceStore({
                userReducer: {
                    user: user
                },
                invoiceReducer: {
                    invoiceDetail: invoice,
                    paymentMethods: [paymentMethod]
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<InvoiceTransactionCompleteComponent
                user={user}
                invoiceDetail={invoice}
                paymentMethods={[paymentMethod]} />);

            const bodyClass = isOfflinePayment ? 'page-transaction-complete-offline' : 'page-transaction-complete-credit';

            res.send(template(bodyClass, seoTitle, app, 'invoice-transaction-complete', reduxState));
        });
    });
});

invoiceRouter.get('/detail/:invoiceNo', ...handlers, isAuthorizedToAccessViewPage(viewInvoiceDetailsData), (req, res) => {
    const user = req.user;
    const invoiceNo = req.params['invoiceNo'];
    if (!invoiceNo || typeof invoiceNo == 'undefined' || invoiceNo == 'undefined') return res.send('Invoice number is missing.');
    let includes = 'Transaction.Orders.PaymentDetails,Transaction.Orders.PaymentTerm';
    if (user && user.Roles && !(user.Roles.includes('Submerchant') || user.Roles.includes('Merchant'))) {
        includes += ',' + 'Transaction.Orders.ReceivingNotes,Transaction.Orders.RequisitionDetails';
    }

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
            getUserPermissionsOnPage(user, 'Invoice Details', 'Consumer', (pagePermissions) => {
                const store = Store.createInvoiceStore({
                    userReducer: {
                        user,
                        pagePermissions,
                    },
                    invoiceReducer: {
                        invoiceDetail: invoiceDetail,
                        paymentMethods: paymentMethods,
                    },
                    marketplaceReducer: {
                        locationVariantGroupId: req.LocationVariantGroupId
                    }
                });
                const reduxState = store.getState();
                const app = reactDom.renderToString(
                    <InvoiceDetailsComponent
                        user={user}
                        invoiceDetail={invoiceDetail}
                        paymentMethods={paymentMethods}
                        locationVariantGroupId={req.LocationVariantGroupId}
                        pagePermissions={pagePermissions}
                    />
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

invoiceRouter.get('/list', ...handlers, isAuthorizedToAccessViewPage(viewInvoiceListData), (req, res) => {
    const user = req.user;

    getMainStatus(null, (options) => {

        // list of purchase orders
        const promisePurchaseOrders = new Promise((resolve, reject) => {
            function getPurchaseOrders(pageNumber = 1, records = []) {
                const promise = new Promise((resolve, reject) => {
                    const options = {
                        userId: user.ID,
                        pageSize: 1000,
                        pageNumber: pageNumber,
                        //status: orderStatuses,
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

            let orderStatuses = [];
            if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {

                var fullfilmentTemp = Object.keys(options.fulfilmentStatus.Records).map(function (k) { return options.fulfilmentStatus.Records[k].Name })
                orderStatuses = fullfilmentTemp;
                //orderStatuses = orderStatuses.filter((status) => status.toLowerCase() != 'rejected');

                getPurchaseOrders();
            } else {
                resolve(new Array());
            }
        });

        // list of buyers/suppliers
        const promiseUsers = new Promise((resolve, reject) => {
            if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
                client.Orders.getConsumersFromOrdersB2B({ merchantId: user.ID }, function (err, result) {
                    resolve(result);
                });
            } else {
                client.Orders.getMerchantsFromOrdersB2B({ userId: user.ID }, function (err, result) {
                    resolve(result);
                });
            }
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
            //paymentStatuses: Object.keys(options.paymentStatus.Records).map(function (k) { return options.paymentStatus.Records[k].Name }).join(",")
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

                const s = Store.createInvoiceStore({
                    userReducer: {
                        user: user
                    },
                    invoiceReducer: {
                        invoiceList: invoices,
                        purchaseOrders: purchaseOrders,
                        users: users,
                        paymentGateways: paymentGateways,
                        statuses: statuses
                    }
                });

                const reduxState = s.getState();
                try {
                    const invoiceListApp = reactDom.renderToString(
                        <InvoiceListComponent
                            user={user}
                            invoiceList={invoices}
                            purchaseOrders={purchaseOrders}
                            users={users}
                            paymentGateways={paymentGateways}
                            statuses={statuses}
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

    })
});

function getMainStatus(options, callback) {
    const promiseStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseFulfilmentStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getFulfilmentStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    const promisePaymentStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getPaymentStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseStatus, promiseFulfilmentStatus, promisePaymentStatus]).then((response) => {
        const orderStatus = response[0];
        const fulfilmentStatus = response[1];
        const paymentStatus = response[2];
        callback({
            orderStatus,
            fulfilmentStatus,
            paymentStatus
        });
    });
}

invoiceRouter.get('/filter', authenticated, function (req, res) {
    const user = req.user;
    const filters = req.query;
    filters.userId = user.ID;
    getInvoices(filters, function (invoiceList) {
        res.send({
            invoiceList: invoiceList
        });
    });
});

function getHostname(req) {
    return req.protocol + '://' + req.get('host');
}

function getPaymentMethods(invoice, callback) {
    const merchants = invoice.Orders.map((order) => order.MerchantDetail);

    const promisePaymentGateways = new Promise((resolve, reject) => {
        client.Payments.getPaymentGateways(null, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promisePaymentGateways]).then((responses) => {
        const paymentGateways = responses[0].Records;

        const promisePaymentAcceptanceMethods = merchants.map((merchant) => {
            return new Promise((resolve, reject) => {
                const options = {
                    merchantId: merchant.ID
                };

                client.Payments.getPaymentAcceptanceMethods(options, (err, result) => {
                    result.UserID = options.merchantId;
                    resolve(result);
                });
            });
        });

        Promise.all(promisePaymentAcceptanceMethods).then((responses) => {
            const paymentAcceptanceMethods = responses.map((response) => {
                return {
                    UserID: response.UserID,
                    PaymentAcceptanceMethods: response.Records
                }
            });

            let gatewayCodes = paymentGateways.map((gateway) => gateway.Code);
            const merchantIds = paymentAcceptanceMethods.map((method) => method.UserID);

            for (let g = gatewayCodes.length - 1; g >= 0; --g) {
                for (let m = 0; m <= merchantIds.length - 1; ++m) {
                    const merchant = paymentAcceptanceMethods.find(a => a.UserID == merchantIds[m]);

                    if (!merchant.PaymentAcceptanceMethods.find(p => p.PaymentGateway.Code == gatewayCodes[g])) {
                        gatewayCodes.splice(g, 1);
                        break;
                    }
                }
            }

            const paymentMethods = gatewayCodes.map((code) => {
                const gateway = paymentGateways.find(g => g.Code == code);

                if (gateway) {
                    const settings = buildPaymentGatewaySettings(gateway);

                    return {
                        code: settings.code,
                        gateway: settings.gateway,
                        publicKey: settings.publicKey,
                        is3dsEnabled: settings.is3dsEnabled,
                        description: settings.description
                    };
                }
            });

            callback(paymentMethods);
        });
    });
}

function buildPaymentGatewaySettings(paymentGateway, returnUrl, cancelUrl) {
    const code = paymentGateway.Code.toLowerCase();
    const meta = paymentGateway.Meta;

    let settings = {
        code: paymentGateway.Code,
        gateway: paymentGateway.Gateway,
        description: paymentGateway.Description,
        secretKey: null,
        is3dsEnabled: null,
        accountType: null,
        returnUrl: !returnUrl ? null : returnUrl + (returnUrl.indexOf('?') >= 0 ? '&' : '?') + 'gateway=' + code,
        cancelUrl: !cancelUrl ? null : cancelUrl + (cancelUrl.indexOf('?') >= 0 ? '&' : '?') + 'gateway=' + code
    };

    if (code.startsWith('stripe')) {
        let is3dsEnabled = false;
        if (meta.hasOwnProperty('3dsEnabled')) {
            is3dsEnabled = meta['3dsEnabled'].toLowerCase() === 'true' ? true : false;
        }

        settings = Object.assign(settings, {
            publicKey: meta.publickey,
            secretKey: meta.secretkey,
            is3dsEnabled: is3dsEnabled,
            accountType: 'id',
            returnUrl: !settings.returnUrl ? null : settings.returnUrl + (is3dsEnabled ? '&session_id={CHECKOUT_SESSION_ID}' : ''),
        });
    } else if (code.startsWith('omise')) {
        settings = Object.assign(settings, {
            publicKey: meta.publickey,
            secretKey: meta.secretkey,
            accountType: 'id'
        });
    } else if (code.startsWith('paypal')) {
        // Add specific paypal settings here
    } else {
        // No settings for cod, custom, or offline payments
    }

    return settings;
}

function buildPaymentRequest(req, invoice, paymentGateway, paymentAcceptanceMethods) {
    function buildPayees(settings) {
        let payees = [];

        invoice.Orders.map((order) => {
            order.PaymentDetails.map((payment) => {
                if (payment.Payee.ID === order.MerchantDetail.ID) {
                    let payee = {
                        internalUserId: payment.Payee.ID,
                        currency: payment.CurrencyCode,
                        isPrimary: false,
                        total: payment.Total,
                        fee: payment.Fee,
                        reference: invoice.InvoiceNo + '/' + order.ID,
                        invoiceNo: invoice.InvoiceNo,
                        items: [],
                        gatewayAccount: null,
                        email: payment.Payee.Email,
                        CosmeticNo: payment.CosmeticNo
                    };

                    let items = [];

                    order.CartItemDetails.map((cart, index) => {
                        items.push({
                            id: 'Item' + (index + 1),
                            currency: cart.CurrencyCode,
                            description: cart.ItemDetail.BuyerDescription,
                            name: cart.ItemDetail.Name,
                            price: cart.ItemDetail.Price,
                            quantity: parseInt(cart.Quantity)
                        });
                    });

                    if (order.Freight && order.Freight > 0) {
                        items.push({
                            id: 'Freight',
                            currency: order.CurrencyCode,
                            description: 'Freight',
                            name: 'Freight',
                            price: order.Freight,
                            quantity: 1
                        });
                    }

                    if (payment.Fee && payment.Fee > 0) {
                        items.push({
                            id: 'AdminFee',
                            currency: order.CurrencyCode,
                            description: 'Admin Fee',
                            name: 'Fee (Deducted)',
                            price: payment.Fee,
                            quantity: 1
                        });
                    }

                    payee.items = items;

                    const merchantPaymentAcceptanceMethods = paymentAcceptanceMethods.find(m => m.UserID == order.MerchantDetail.ID);
                    const paymentAcceptanceMethod = merchantPaymentAcceptanceMethods.PaymentAcceptanceMethods.find(m => m.PaymentGateway.Code == paymentGateway.Code);

                    if (settings.accountType == 'id') {
                        payee.gatewayAccount = paymentAcceptanceMethod.ClientID;
                    } else {
                        payee.gatewayAccount = paymentAcceptanceMethod.Account;
                    }

                    payees.push(payee);
                }
            });
        });

        return payees;
    }

    function buildPayer() {
        const payer = invoice.Orders[0].PaymentDetails[0].Payer;

        return {
            id: payer.ID
        }
    }

    function buildAdmins() {
        let admins = [];

        invoice.Orders.forEach((order) => {
            order.PaymentDetails.forEach((payment) => {
                if (payment.Payee.ID != order.MerchantDetail.ID) {
                    admins.push({
                        id: payment.Payee.ID
                    })
                }
            });
        });

        return admins;
    }

    const returnUrl = `${getHostname(req)}/invoice/payment-gateway/success?invoiceNo=${invoice.InvoiceNo}`;
    const cancelUrl = `${getHostname(req)}/payment-gateway/cancel?invoiceNo=${invoice.InvoiceNo}`;
    const settings = buildPaymentGatewaySettings(paymentGateway, returnUrl, cancelUrl);

    return {
        payees: buildPayees(settings),
        payer: buildPayer(),
        admins: buildAdmins(),
        settings: settings
    }
}

function isValidHashKey(gateway, invoiceNo, hashKey, checkExpiry = false) {
    let isValid = false;
    const decoded = decodeURIComponent(hashKey);

    try {
        const decipher = crypto.createDecipher('aes128', process.env.CLIENT_SECRET);
        let decrypted = decipher.update(decoded, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        const token = JSON.parse(decrypted);

        if (token.code == gateway && token.invoiceNo == invoiceNo && (!checkExpiry || token.expirationDate >= Math.floor(new Date().getTime() / 1000))) {
            isValid = true;
        }
    } catch (err) {
        console.log(err);
    }

    return isValid;
}

function payStripe(stripeRequest, invoice, paymentRequest, callback) {
    function buildMetadata(payee) {
        let metadata = {};

        payee.items.map((item) => {
            metadata[item.id] = `${item.quantity} x ${item.name} - ${item.currency} ${item.price}`;
        });

        return metadata;
    }

    const settings = paymentRequest.settings;
    const payees = paymentRequest.payees;
    const admins = paymentRequest.admins;

    const is3dsEnabled = settings.is3dsEnabled;

    if (!is3dsEnabled) {
        const secretKey = settings.secretKey;
        const stripe = require('stripe')(secretKey);

        stripe.customers.create({ description: stripeRequest.email, source: stripeRequest.id }).then((customer) => {
            let promiseTokens = [];

            payees.map((payee) => {
                promiseTokens.push(stripe.tokens.create({ customer: customer.id }, { stripeAccount: payee.gatewayAccount }));
            });

            Promise.all(promiseTokens).then((tokens) => {
                let promiseCharges = [];

                payees.map((payee, index) => {
                    let amount = parseInt(payee.total);
                    let applicationFeeAmount = parseInt(payee.fee);
                    if (!EnumCoreModule.GetStripeCurrenciesNoMinors().includes(payee.currency)) {
                        amount = parseInt(payee.total * 100);
                        applicationFeeAmount = parseInt(payee.fee * 100);
                    }

                    const request = {
                        source: tokens[index].id,
                        capture: true,
                        amount: (amount + applicationFeeAmount),
                        currency: payee.currency,
                        description: payee.reference,
                        statement_descriptor: payee.invoiceNo,
                        application_fee_amount: applicationFeeAmount,
                        metadata: buildMetadata(payee)
                    };

                    promiseCharges.push(stripe.charges.create(request, { stripeAccount: payee.gatewayAccount }));
                });

                Promise.all(promiseCharges).then((charges) => {
                    //const promiseOrders = promiseUpdateOrders(invoice, { paymentStatus: 'Paid', balance: 0 });

                    Promise.all([]).then((responses) => {
                        let requests = [];

                        charges.map((charge, index) => {
                            requests.push({
                                orderId: charge.description.split('/')[1],
                                payeeId: payees[index].internalUserId,
                                status: 'Success',
                                payKey: charge.id,
                                gatewayTimestamp: charge.created,
                                gatewayStatus: charge.status,
                                gatewayReceiverId: payees[index].gatewayAccount,
                                gatewaySenderId: customer.id,
                                gatewayRef: charge.balance_transaction,
                            });

                            // TODO: remove this condition once we have admin fee
                            if (admins[index]) {
                                requests.push({
                                    orderId: charge.description.split('/')[1],
                                    payeeId: admins[index].id,
                                    status: 'Success',
                                    payKey: charge.id,
                                    gatewayTimestamp: charge.created,
                                    gatewayStatus: charge.status,
                                    gatewayReceiverId: null,
                                    gatewaySenderId: customer.id,
                                    gatewayRef: charge.id
                                });
                            }
                        });

                        promiseUpdatePaymentDetails(invoice, requests).then(() => {
                            callback();
                        });
                    });
                }).catch((error) => {
                    callback('stripe create charge error: ' + error.raw.message);
                });
            }).catch((error) => {
                callback('stripe create token error: ' + error.raw.message);
            });
        }).catch((error) => {
            callback('stripe create customer error: ' + error.raw.message);
        });
    }
}

function payStripe3ds(invoice, paymentRequest, callback) {
    const settings = paymentRequest.settings;
    const payees = paymentRequest.payees;

    const is3dsEnabled = settings.is3dsEnabled;

    if (is3dsEnabled) {
        const secretKey = settings.secretKey;
        const stripe = require('stripe')(secretKey);
        const payee = payees[0];

        stripe.accounts.retrieve(payee.gatewayAccount).then((account) => {
            let amount = parseInt(payee.total);
            let applicationFeeAmount = parseInt(payee.fee);
            if (!EnumCoreModule.GetStripeCurrenciesNoMinors().includes(payee.currency)) {
                amount = parseInt(payee.total * 100);
                applicationFeeAmount = parseInt(payee.fee * 100);
            }

            let descriptions = [];
            payee.items.map((item) => {
                if (item.id != 'Freight' && item.id != 'AdminFee') {
                    descriptions.push(`${item.quantity} x ${item.name}`);
                }
            });
            //ARC10131
            let request = {
                success_url: settings.returnUrl,
                cancel_url: settings.cancelUrl,
                payment_method_types: ['card'],
                line_items: [{
                    name: 'Invoice: ' + payee.CosmeticNo != null && payee.CosmeticNo != "" ? payee.CosmeticNo : payee.invoiceNo,
                    description: descriptions.join(', '),
                    currency: payee.currency,
                    amount: (amount + applicationFeeAmount),
                    quantity: 1
                }]
            };

            if (applicationFeeAmount > 0) {
                request['payment_intent_data'] = {
                    application_fee_amount: applicationFeeAmount
                };
            }

            stripe.checkout.sessions.create(request, { stripeAccount: payee.gatewayAccount }).then((session) => {
                promiseUpdateInvoice(invoice, { payKey: session.id, status: 'Processing' }).then(() => {
                    callback(null, session.id, payee.gatewayAccount);
                });
            }).catch((error) => {
                callback('stripe create session error: ' + error.raw.message);
            });

        }).catch((error) => {
            callback('stripe retrieve account error: ' + error.raw.message);
        });
    }
}

function payOmise(omiseRequest, invoice, paymentRequest, callback) {
    function hasSufficientTransferAmount(currencyCode, amount) {
        if (currencyCode.toLowerCase() == 'thb' && amount > 3000) {
            return true;
        } else if (currencyCode.toLowerCase() == 'jyp' && amount > 260) {
            return true;
        } else if (currencyCode.toLowerCase() == 'sgd' && amount > 100) {
            return true;
        }

        return false;
    }

    const settings = paymentRequest.settings;
    const payees = paymentRequest.payees;
    const admins = paymentRequest.admins;
    const secretKey = settings.secretKey;
    const omise = require('omise')({ secretKey: secretKey });

    omise.account.retrieve().then((account) => {
        const admin = account;

        let promiseRecipients = [];
        let transferRequests = [];
        let totalAmount = 0;
        let currencyCode = '';
        let invoiceNo = '';
        payees.map((payee) => {
            let amount = parseInt(payee.total);
            let fee = parseInt(payee.fee);
            if (!EnumCoreModule.GetOmiseCurrenciesNoMinors().includes(payee.currency)) {
                amount = parseInt(payee.total * 100);
                fee = parseInt(payee.fee * 100);
            }
            //ARC10131
            totalAmount += (amount + fee);
            currencyCode = payee.currency;
            invoiceNo = payee.CosmeticNo != null && payee.CosmeticNo != "" ? payee.CosmeticNo : payee.invoiceNo;

            transferRequests.push({
                amount: amount,
                fail_fast: false,
                recipient: payee.gatewayAccount
            });

            promiseRecipients.push(omise.recipients.retrieve(payee.gatewayAccount));
        });

        Promise.all(promiseRecipients).then((recipients) => {
            recipients.map((recipient) => {
                if (!recipient.active || !recipient.verified) {
                    return callback('merchant omise account is not active/verified');
                }
            });

            const chargeRequest = {
                amount: totalAmount,
                currency: currencyCode,
                card: omiseRequest.token,
                metadata: { invoiceNo: invoiceNo }
            };

            omise.charges.create(chargeRequest).then((charge) => {
                if (charge.paid) {
                    let promiseTransferAmounts = [];

                    transferRequests.map((request) => {
                        if (hasSufficientTransferAmount(currencyCode, request.amount)) {
                            promiseTransferAmounts.push(omise.transfers.create(request));
                        }
                    });

                    Promise.all(promiseTransferAmounts).then((transfers) => {
                        //const promiseOrders = promiseUpdateOrders(invoice, { paymentStatus: 'Paid', balance: 0 });

                        Promise.all([]).then((responses) => {
                            let requests = [];

                            payees.map((payee, index) => {
                                let transfer = transfers.length > 0 ? transfers.find(t => t.recipient == payee.gatewayAccount) : null;
                                if (transfer && transfer.failure_code) {
                                    return callback('omise transfer failed: ' + transfer.failure_message);
                                }

                                requests.push({
                                    orderId: payee.reference.split('/')[1],
                                    payeeId: payee.internalUserId,
                                    status: 'Success',
                                    payKey: transfer ? transfer.id : `Arcadier-${payee.reference}`,
                                    gatewayTimestamp: Math.floor(new Date().getTime() / 1000),
                                    gatewayStatus: 'Send'
                                });

                                // TODO: remove this condition once we have admin fee
                                if (admins[index]) {
                                    requests.push({
                                        orderId: payee.reference.split('/')[1],
                                        payeeId: admins[index].id,
                                        status: 'Success',
                                        payKey: transfer ? transfer.id : `Arcadier-${payee.reference}`,
                                        gatewayTimestamp: Math.floor(new Date().getTime() / 1000),
                                        gatewayStatus: 'Send'
                                    });
                                }
                            });

                            promiseUpdatePaymentDetails(invoice, requests).then(() => {
                                callback();
                            });
                        });
                    }).catch((error) => {
                        callback('omise transfer error: ' + error);
                    });
                } else {
                    callback('omise charge failed: ' + charge.failure_message);
                }
            }).catch((error) => {
                callback('omise charge error: ' + error.message);
            });
        }).catch((error) => {
            callback('omise retrieve recipient error: ' + error.message);
        });

    }).catch((error) => {
        callback('omise retrieve account error: ' + error.message);
    });
}

function payCod(invoice, callback) {
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const payKey = generateUUID();
    const timestamp = Math.floor(new Date().getTime() / 1000);

    promiseUpdateInvoice(invoice, { payKey: payKey, gatewayTimestamp: timestamp }).then(() => {
        callback();
    })
}

function payOffline(invoice, callback) {
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const payKey = generateUUID();
    const timestamp = Math.floor(new Date().getTime() / 1000);

    promiseUpdateInvoice(invoice, { payKey: payKey, gatewayTimestamp: timestamp }).then(() => {
        callback();
    })
}

function payCustom(req, invoice, paymentGateway, callback) {
    let hashKey = '';

    function generateCustomPayKey(callback) {
        const endpoint = paymentGateway.Meta.endpoint;
        const expirationDate = Math.floor(new Date().getTime() / 1000) + 10800;

        const token = {
            code: paymentGateway.Code,
            invoiceNo: invoice.InvoiceNo,
            expirationDate: expirationDate
        };

        const cipher = crypto.createCipher('aes128', process.env.CLIENT_SECRET);
        let encrypted = cipher.update(JSON.stringify(token), 'utf8', 'base64');
        encrypted += cipher.final('base64');

        if (process.env.NODE_ENV !== 'development') {
            const options = {
                url: endpoint,
                method: 'post',
                data: {
                    invoiceno: invoice.InvoiceNo,
                    currency: invoice.CurrencyCode,
                    total: invoice.Total.toString(),
                    hashkey: encodeURIComponent(encrypted),
                    gateway: paymentGateway.Code
                }
            };

            requestApi(options, (err, result) => {
                if (err) {
                    return callback();
                }

                callback(result);
            });
        } else {
            hashKey = encrypted;
            callback(`dev-${new Date().getTime()}`);
        }
    }

    generateCustomPayKey((payKey) => {
        if (!payKey) {
            return callback('no paykey found');
        }

        promiseUpdateInvoice(invoice, { status: 'Processing', payKey: payKey }).then(() => {
            if (process.env.NODE_ENV !== 'development') {
                const redirectUrl = paymentGateway.Meta.redirect + '?paykey=' + payKey + '&invoiceno=' + invoice.InvoiceNo;

                callback(null, redirectUrl);
            } else {
                const options = {
                    url: getHostname(req) + '/invoice/transaction-status',
                    method: 'get',
                    data: {
                        gateway: paymentGateway.Code,
                        invoiceNo: invoice.InvoiceNo,
                        payKey: payKey,
                        hashKey: hashKey,
                        status: 'success',
                        isCallback: true
                    }
                };

                requestApi(options, (err, result) => {
                    if (err) {
                        return callback(err);
                    } else if (result.error) {
                        return callback(result.error);
                    }

                    callback();
                });
            }
        });
    });
}

function promiseUpdateInvoice(invoice, request) {
    let options = {
        invoiceNo: invoice.InvoiceNo,
        payments: []
    };

    invoice.Orders.map((order) => {
        order.PaymentDetails.map((payment) => {
            options.payments.push({
                orderId: payment.Order.ID,
                payerId: payment.Payer.ID,
                payeeId: payment.Payee.ID,
                ...request
            });
        });
    });

    return new Promise((resolve, reject) => {
        client.Payments.updateMultiplePaymentDetails(options, function (err, result) {
            resolve(result);
        });
    });
}

function promiseUpdatePaymentDetails(invoice, requests) {
    let options = {
        invoiceNo: invoice.InvoiceNo,
        payments: []
    };

    invoice.Orders.map((order) => {
        order.PaymentDetails.map((payment) => {
            const request = requests.find(r => r.orderId == payment.Order.ID && r.payeeId == payment.Payee.ID);

            if (request) {
                options.payments.push({
                    orderId: payment.Order.ID,
                    payerId: payment.Payer.ID,
                    payeeId: payment.Payee.ID,
                    ...request
                });
            }
        });
    });

    return new Promise((resolve, reject) => {
        client.Payments.updateMultiplePaymentDetails(options, function (err, result) {
            resolve(result);
        });
    });
}

function promiseUpdateOrders(invoice, request) {
    let promises = [];

    invoice.Orders.map(order => {
        let promise = new Promise((resolve, reject) => {
            const options = {
                orders: [{
                    orderId: order.ID,
                    ...request
                }]
            };

            client.Orders.updateOrderDetails(options, function (err, result) {
                resolve(result);
            });
        });

        promises.push(promise);
    });

    return promises;
}

function getInvoices(options, callback) {
    const promiseInvoices = new Promise((resolve, reject) => {
        client.Purchases.getHistory(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoices]).then((response) => {
        const invoices = response[0];
        callback(invoices);
    });
}

module.exports = invoiceRouter;