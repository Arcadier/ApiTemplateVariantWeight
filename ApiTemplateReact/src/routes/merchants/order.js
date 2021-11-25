'use strict';
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../../views/layouts/template');
var express = require('express');
var orderRouter = express.Router();
var store = require('../../redux/store');

var OrderHistoryComponent = require('../../views/merchant/order/history/index').OrderHistoryComponent;
var OrderDetailComponent = require('../../views/merchant/order/detail/index').OrderDetailComponent;

var authenticated = require('../../scripts/shared/authenticated');
var authorizedMerchant = require('../../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../../scripts/shared/onboarded-merchant');
var client = require('../../../sdk/client');

var EnumCoreModule = require('../../public/js/enum-core');

var handlers = [authenticated, authorizedMerchant, onboardedMerchant];

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../../scripts/shared/user-permissions');

const SuccessPaymentGatewayStatuses = 'Acknowledged,Refunded,Success,Waiting For Payment';

const viewOrderHistoryPage = {
    code: 'view-merchant-purchase-orders-api',
    renderSidebar: true
};

const viewOrderDetailPage = {
    code: 'view-merchant-purchase-order-details-api',
    renderSidebar: true
};

orderRouter.get('/history', ...handlers, isAuthorizedToAccessViewPage(viewOrderHistoryPage), function (req, res) {
    let user = req.user;

    if (req.user === null) {
        return;
    }

    const promiseOrderStatuses = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseFulfilmentStatuses = new Promise((resolve, reject) => {
        const options = {};
        client.Orders.getFulfilmentStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseBookingDuration = new Promise((resolve, reject) => {
        const options = {};
        client.Orders.getBookingDuration(options, function (err, result) {
            resolve(result);
        });
    });

    const promisePaymentStatuses = new Promise((resolve, reject) => {
        const options = {
            enabledOnly: false
        };
        client.Orders.getPaymentStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseOrderStatuses, promiseFulfilmentStatuses, promiseBookingDuration, promisePaymentStatuses]).then((responses) => {
        const orderStatuses = responses[0];
        const fulfilmentStatuses = responses[1];
        const bookingDuration = responses[2];
        const paymentStatuses = responses[3];

        var promiseHistory = null;

        if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
            promiseHistory = new Promise((resolve, reject) => {
                let options = {
                    userId: user.ID,
                    keywords: null,
                    pageNumber: 1,
                    pageSize: 20,
                }
                client.Orders.getHistoryB2B(options, function (err, result) {
                    resolve(result);
                });
            });
        } else {
            //let pStatuses = '';
            //if (paymentStatuses) {
            //    pStatuses = paymentStatuses.Records.map(s => s.Name).join(',');
            //}

            promiseHistory = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    keyword: '',
                    pageNumber: 1,
                    pageSize: 20,
                    statuses: SuccessPaymentGatewayStatuses,
                    paymentStatuses: null
                }
                client.Orders.getHistory(options, function (err, result) {
                    resolve(result);
                });
            });
        }

        Promise.all([promiseHistory]).then((responses) => {
            let history = responses[0];

            //EMpty History
            if (!history) {
                history = {
                    TotalRecords: 0
                };
            }
            let selectedSuppliers = "";
            let selectedOrderStatuses = "";
            let selectedDates = {};
            let keyword = "";
            let bookings = "";

            //ARC8304
            let suppliers = [];
            if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                if (history && history.Records) {
                    history.Records.forEach(function (data) {
                        if (suppliers) {
                            //remove dups
                            suppliers.map(function (supplier, i) {
                                if (data.ConsumerDetail && supplier.ID === data.ConsumerDetail.ID) {
                                    suppliers.splice(i, 1);
                                }
                            });
                            if (data.ConsumerDetail) {
                                suppliers.push(data.ConsumerDetail);
                            }
                        }
                    });
                }
            } else {
                if (history && history.Records) {
                    history.Records.forEach(function (data) {
                        if (suppliers) {
                            //remove dups
                            suppliers.map(function (supplier, i) {
                                if (data.Orders && data.Orders[0] && data.Orders[0].ConsumerDetail && supplier.ID === data.Orders[0].ConsumerDetail.ID) {
                                    suppliers.splice(i, 1);
                                }
                            });
                            if (data.Orders && data.Orders[0] && data.Orders[0].ConsumerDetail) {
                                suppliers.push(data.Orders[0].ConsumerDetail);
                            }
                        }
                    });
                }
            }

            getUserPermissionsOnPage(user, 'Purchase Orders', 'Merchant', (pagePermissions) => {
                const appString = 'merchant-order-history';
                const context = {};

                const s = store.createOrderStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    orderReducer: {
                        history: history,
                        keyword: keyword,
                        selectedOrders: [],
                        selectedFulfillmentStatuses: [],
                        selectedSuppliers: selectedSuppliers,
                        selectedOrderStatuses: selectedOrderStatuses,
                        statuses: orderStatuses,
                        fulfilmentStatuses: fulfilmentStatuses,
                        suppliers: suppliers,
                        selectedDates: selectedDates,
                        bookings: bookingDuration,
                        paymentStatuses: paymentStatuses
                    }
                });

                const reduxState = s.getState();

                let seoTitle = 'Order History';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const app = reactDom.renderToString(<OrderHistoryComponent
                    context={context}
                    pagePermissions={pagePermissions}
                    user={req.user} history={history} selectedOrders={[]}
                    selectedFulfillmentStatuses={[]} suppliers={suppliers}
                    selectedSuppliers={selectedSuppliers} selectedOrderStatuses={selectedOrderStatuses}
                    selectedDates={selectedDates}
                    bookingDuration={bookingDuration}
                    statuses={orderStatuses}
                    fulfilmentStatuses={fulfilmentStatuses}
                    paymentStatuses={paymentStatuses}
                />);
                res.send(template('page-seller purchase-order-history page-sidebar', seoTitle, app, appString, reduxState));
            });
        });
    });
});

orderRouter.get('/detail/orderid/:id', authenticated, isAuthorizedToAccessViewPage(viewOrderDetailPage), function (req, res) {
    let user = req.user;
    if (req.params.id === 'undefined') {
        return;
    }

    var promiseHistory = new Promise((resolve, reject) => {
        let options = {
            userId: user.ID,
            keyword: req.params.id,
            pageNumber: 1,
            pageSize: 20,
        }
        client.Orders.getHistoryB2B(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'ControlFlags'
        };
        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseOrderStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getStatuses(options, function (err, result) {
            if (result && result.Records) return resolve(result.Records);
            resolve([]);
        });
    });

    const promiseFulfilmentStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getFulfilmentStatuses(options, function (err, result) {
            if (result && result.Records) return resolve(result.Records);
            resolve([]);
        });
    });

    Promise.all([promiseHistory, promiseMarketplace, promiseOrderStatus, promiseFulfilmentStatus]).then((responses) => {
        const detail = responses[0];
        let marketPlaceInfo = responses[1];
        const orderStatuses = responses[2];
        const fulfilmentStatuses = responses[3];

        let enableReviewAndRating = marketPlaceInfo && marketPlaceInfo.ControlFlags ? marketPlaceInfo.ControlFlags.ReviewAndRating : null;
        const appString = 'merchant-order-detail';
        const context = {};
        let cartIds = [];
        detail.Records.map(o => {
            if (o.CartItemDetails) {
                cartIds.push(...o.CartItemDetails.map(c => c.ID));
            }

        });
        const promiseCartItemFeedback = (cartId) =>
            new Promise((resolve, reject) => {
                client.Carts.getCartFeedback({ userId: req.user.ID, cartId }, function (err, feedback) {
                    resolve({ cartId, feedback });
                })
            });
        let promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));

        Promise.all([promiseCartItemsFeedback]).then((responses) => {
            let feedback = responses[0];
            if (feedback && feedback.length > 0) {
                detail.Records.map(o => {
                    if (o.CartItemDetails && o.CartItemDetails.length > 0) {
                        o.CartItemDetails.map(cartItem => {
                            const cartFeedback = feedback.find(x => x.cartId === cartItem.ID);
                            if (cartFeedback != null || typeof cartFeedback !== 'undefined') {
                                cartItem.Feedback = cartFeedback.feedback;
                            }
                        })
                    }
                })
            }
            let purchaseDetail = detail.Records[0];

            getUserPermissionsOnPage(user, 'Purchase Order Details', 'Merchant', (pagePermissions) => {
                const s = store.createOrderStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    orderReducer: {
                        detail: purchaseDetail,
                        enableReviewAndRating: enableReviewAndRating,
                        orderStatuses: orderStatuses,
                        fulfilmentStatuses: fulfilmentStatuses

                    },
                    marketplaceReducer: { locationVariantGroupId: req.LocationVariantGroupId }
                });
                const reduxState = s.getState();

                let seoTitle = 'Purchase Order';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const app = reactDom.renderToString(
                    <OrderDetailComponent
                        pagePermissions={pagePermissions}
                        context={context}
                        categories={[]}
                        user={req.user}
                        detail={purchaseDetail}
                        enableReviewAndRating={enableReviewAndRating}
                        locationVariantGroupId={req.LocationVariantGroupId}
                        orderStatuses={orderStatuses}
                        fulfilmentStatuses={fulfilmentStatuses}
                    />);
                res.send(template('page-seller page-purchase-order-details page-sidebar', seoTitle, app, appString, reduxState));
            });
        });
    });
});

orderRouter.get('/detail/:id', ...handlers, isAuthorizedToAccessViewPage(viewOrderDetailPage), function (req, res) {
    let user = req.user;

    const options = {
        userId: user.ID,
        invoiceNo: req.params.id
    }

    if (req.params.id === 'undefined') {
        return;
    }

    var promiseDetail = new Promise((resolve, reject) => {
        client.Orders.getHistoryDetail(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'ControlFlags'
        };
        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });
    const promiseBookingDuration = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getBookingDuration(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseOrderStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getStatuses(options, function (err, result) {
            if (result && result.Records) return resolve(result.Records);
            resolve([]);
        });
    });

    const promiseFulfilmentStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getFulfilmentStatuses(options, function (err, result) {
            if (result && result.Records) return resolve(result.Records);
            resolve([]);
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

    Promise.all([promiseDetail, promiseMarketplace, promiseBookingDuration, promiseOrderStatus, promiseFulfilmentStatus, promisePaymentStatus]).then((responses) => {
        const detail = responses[0];
        let marketPlaceInfo = responses[1];
        let bookingDuration = responses[2];
        const orderStatuses = responses[3];
        const fulfilmentStatuses = responses[4];
        const paymentStatuses = responses[5];
 
        let enableReviewAndRating = marketPlaceInfo && marketPlaceInfo.ControlFlags ? marketPlaceInfo.ControlFlags.ReviewAndRating : null;
        const appString = 'merchant-order-detail';
        const context = {};
        let cartIds = [];
    
        detail.Orders.map(o => {
            if (o.CartItemDetails) {
                cartIds.push(...o.CartItemDetails.map(c => c.ID));
            }

        });
        const promiseCartItemFeedback = (cartId) =>
            new Promise((resolve, reject) => {
                client.Carts.getCartFeedback({ userId: req.user.ID, cartId }, function (err, feedback) {
                    resolve({ cartId, feedback });
                })
            });
        let promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));

        Promise.all([promiseCartItemsFeedback]).then((responses) => {
            let feedback = responses[0];
            if (feedback && feedback.length > 0) {
                detail.Orders.map(o => {
                    if (o.CartItemDetails && o.CartItemDetails.length > 0) {
                        o.CartItemDetails.map(cartItem => {
                            const cartFeedback = feedback.find(x => x.cartId === cartItem.ID);
                            if (cartFeedback != null || typeof cartFeedback !== 'undefined') {
                                cartItem.Feedback = cartFeedback.feedback;
                            }
                        })
                    }
                })
            }

            getUserPermissionsOnPage(user, 'Purchase Order Details', 'Merchant', (pagePermissions) => {
                const s = store.createOrderStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    orderReducer: {
                        detail: detail,
                        enableReviewAndRating: enableReviewAndRating,
                        bookings: bookingDuration,
                        orderStatuses: orderStatuses,
                        fulfilmentStatuses: fulfilmentStatuses,
                        paymentStatuses: paymentStatuses
                    },
                    marketplaceReducer: { locationVariantGroupId: req.LocationVariantGroupId }
                });

                const reduxState = s.getState();

                let seoTitle = 'Purchase Order';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const app = reactDom.renderToString(<OrderDetailComponent context={context}
                    pagePermissions={pagePermissions}
                    categories={[]} user={req.user} detail={detail} enableReviewAndRating={enableReviewAndRating}
                    locationVariantGroupId={req.LocationVariantGroupId}
                    bookingDuration={bookingDuration}
                    orderStatuses={orderStatuses}
                    fulfilmentStatuses={fulfilmentStatuses}
                    paymentStatuses={paymentStatuses}
                />);
                res.send(template('page-seller page-purchase-order-details page-sidebar', seoTitle, app, appString, reduxState));
            });
        });
    });
});

orderRouter.get('/history/search', ...handlers, isAuthorizedToAccessViewPage(viewOrderHistoryPage), function (req, res) {
    const promisePaymentStatuses = new Promise((resolve, reject) => {
        const options = {
            enabledOnly: false
        };
        client.Orders.getPaymentStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePaymentStatuses]).then((responses) => {
        const paymentStatuses = responses[0];

        const options = {
            userId: req.user.ID,
            keyword: req.query['keyword'],
            pageNumber: req.query['pageNumber'],
            pageSize: req.query['pageSize'],
            startDate: req.query['startDate'],
            endDate: req.query['endDate'],
            supplier: req.query['supplier'],
            orderStatuses: req.query['status']
        };
        var promiseHistory = null;

        //b2b
        if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
            promiseHistory = new Promise((resolve, reject) => {
                if (options.supplier) {
                    let suppliersplit = options.supplier.split(",");
                    let suppliers = [];

                    suppliersplit.map(function (supplier) {
                        suppliers.push(supplier);
                    });
                    options.supplier = suppliers;
                }

                if (options.orderStatuses) {
                    let statussplit = options.orderStatuses.split(",");
                    let statuspass = [];

                    statussplit.map(function (status) {
                        statuspass.push(status);
                    });
                    options.orderStatuses = statuspass;
                }

                client.Orders.getHistoryB2B(options, function (err, result) {
                    resolve(result);
                });
            });
        } else {
            // TODO: align all api parameter names to prevent confusion
            //ARC9981
            //options.cartItemFulfilmentStatuses = options.status;
            options.statuses = SuccessPaymentGatewayStatuses;

            //if (paymentStatuses) {
            //    options.paymentStatuses = paymentStatuses.Records.map(s => s.Name).join(',');
            //}

            promiseHistory = new Promise((resolve, reject) => {
                client.Orders.getHistory(options, function (err, history) {
                    resolve(history);
                });
            });
        }

        Promise.all([promiseHistory]).then((responses) => {
            const history = responses[0];
            res.send(history);
        });
    });
});

orderRouter.post('/history/updateStatus', ...handlers, isAuthorizedToPerformAction('edit-merchant-purchase-orders-api'), function (req, res) {
    const options = {
        userId: req.user.ID,
        invoices: req.body['invoices'],
        status: req.body['status'],
        statusGuid: req.body['statusGuid'],
        decrementStock: req.body['decrementStock'] ? req.body['decrementStock']: null
    };

    var promiseUpdate = new Promise((resolve, reject) => {
        client.Orders.updateHistoryOrderStatus(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateStatus', ...handlers, function (req, res) {
    const options = {
        userId: req.user.ID,
        invoices: req.body['invoices'],
        status: req.body['status'],
        statusGuid: req.body['statusGuid'],
        decrementStock: req.body['decrementStock'] ? req.body['decrementStock'] : null
    };

    var promiseUpdate = new Promise((resolve, reject) => {
        client.Orders.updateHistoryOrderStatus(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateTransactionInvoiceStatus', ...handlers, function (req, res) {
    const options = {
        invoiceNo: req.body['invoiceNo'],
        fulfilmentStatus: req.body['fulfilmentStatus'],
        paymentStatus: req.body['paymentStatus']
    };

    var promiseUpdate = new Promise((resolve, reject) => {
        client.Transactions.updateTransactionInvoiceStatus(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateStatusb2b', ...handlers, function (req, res) {
    const options = {
        orderId: req.body['orderId'],
        status: req.body['status'],
        orderStatusId: req.body['orderStatusId'],
        fulfilmentStatusId: req.body['fulfilmentStatusId']
    };
    var promiseUpdate = new Promise((resolve, reject) => {
        client.Orders.updateOrderStatusb2b(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/revertPayment', ...handlers, function (req, res) {
    let user = req.user;
    let body = req.body;

    const options = {
        orderId: req.body['id'],
        balance: req.body['balance'],
        fulfilmentStatus: req.body['fulfilmentStatus'],
        paymentStatusId: req.body['paymentStatusId'],
    };

    var promiseRefund = new Promise((resolve, reject) => {
        client.Orders.revertPayment(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRefund]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateBooking', ...handlers, function (req, res) {
 
    let user = req.user;
    let body = req.body;

    const options = {
        userId: req.user['ID'],
        cartitemid: req.body['ID'],
        Notes: req.body['Notes'],
        Quantity: req.body['Quantity'],
        ItemDetail: req.body['ItemDetail'],
        BookingSlot: req.body['BookingSlot'],
        ItemDetailID: req.body['ItemDetailID'],
    };
    var promiseBooking = new Promise((resolve, reject) => {
        client.Orders.updateBooking(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseBooking]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/edm/sendStatusEdm', ...handlers, function (req, res) {
    const user = req.user;
    const invoices = req.body['invoices'];
    const status = req.body['status'];
    const orderId = req.body['orderId'];

    if (EnumCoreModule.GetEdmOrderStatuses().indexOf(status) > -1) {
        let template = {};
        if (status === 'Acknowledged') {
            template = EnumCoreModule.GetEdmTemplates().OrderAcknowledged;
        } else if (status === 'Delivered') {
            template = EnumCoreModule.GetEdmTemplates().OrderShipped;
        } else if (status === 'Ready For Consumer Collection') {
            template = EnumCoreModule.GetEdmTemplates().OrderPickup;
        }

        var promiseMarketplace = new Promise((resolve, reject) => {
            const options = {
                includes: 'BusinessProfile'
            };

            client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseMarketplace]).then((responses) => {
            const marketplace = responses[0];
            let promiseDetails = [];
            let promiseEmails = [];
            if (invoices && process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
                invoices.forEach(function (invoice) {
                    promiseDetails.push(new Promise((resolve, reject) => {
                        const options = {
                            userId: user.ID,
                            invoiceNo: invoice
                        }

                        client.Orders.getHistoryDetail(options, function (err, result) {
                            resolve(result);
                        });
                    }));
                });
            }

            if (orderId && process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                //b2b
                promiseDetails.push(new Promise((resolve, reject) => {
                    let options = {
                        userId: user.ID,
                        keyword: orderId,
                        pageNumber: 1,
                        pageSize: 20,
                    }
                    client.Orders.getHistoryB2B(options, function (err, result) {
                        resolve(result);
                    });
                }));
            }

            Promise.all(promiseDetails).then((responses) => {
                if (orderId && process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                    //b2b
                    var response = responses[0];
                    const marketplaceParams = EnumCoreModule.MapMarketplaceToEdmParameters(marketplace);
                    const dataParams = EnumCoreModule.MapInvoiceToEdmParameters(response.Records[0], req.protocol, req.get('host'));
                    const params = marketplaceParams.concat(dataParams);
                    const edm = EnumCoreModule.MapEdmParametersToTemplate(Object.assign({}, template), params);
                    promiseEmails.push(new Promise((resolve, reject) => {
                        const options = {
                            from: edm.From,
                            to: edm.To,
                            subject: edm.Subject,
                            body: edm.Body
                        };

                        client.Emails.sendEdm(options, function (err, result) {
                            resolve(result);
                        });
                    }));

                    Promise.all(promiseEmails).then((responses) => {
                        res.send(true);
                    })
                } else {
                    responses.forEach(function (invoice) {
                        const marketplaceParams = EnumCoreModule.MapMarketplaceToEdmParameters(marketplace);
                        const invoiceParams = EnumCoreModule.MapInvoiceToEdmParameters(invoice, req.protocol, req.get('host'));
                        const params = marketplaceParams.concat(invoiceParams);
                        const edm = EnumCoreModule.MapEdmParametersToTemplate(Object.assign({}, template), params);

                        promiseEmails.push(new Promise((resolve, reject) => {
                            const options = {
                                from: edm.From,
                                to: edm.To,
                                subject: edm.Subject,
                                body: edm.Body
                            };

                            client.Emails.sendEdm(options, function (err, result) {
                                resolve(result);
                            });
                        }));
                    });
                }


                Promise.all(promiseEmails).then((responses) => {
                    res.send(true);
                })
            });
        });
    } else {
        res.send(true);
    }
});

module.exports = orderRouter;