'use strict';
var express = require('express');
var quotationRouter = express.Router();
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');
var QuotationListComponent = require('../views/quotation/quotation-list/index').QuotationListComponent;
var QuotationDetailComponent = require('../views/quotation/quotation-detail/index').QuotationDetailComponent;
var client = require('../../sdk/client');
var authenticated = require('../scripts/shared/authenticated');
var authorizedMerchant = require('../scripts/shared/authorized-merchant');
var authorizedUser = require('../scripts/shared/authorized-user');
var onboardedMerchant = require('../scripts/shared/onboarded-merchant');
var Store = require('../redux/store');
var EnumCoreModule = require('../public/js/enum-core');
var TwilioChat = require('twilio-chat');
const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

const handlers = [authenticated, authorizedUser, onboardedMerchant];

function getQuotations(userID, pageNumber, filters, callback) {
    const options = {
        userID: userID,
        pageNumber: pageNumber,
        filters: filters
    }
    const promiseQuotations = new Promise((resolve, reject) => {
        client.Quotations.getUserQuotations(options, function (err, quotations) {
            resolve(quotations);
        });
    });

    Promise.all([promiseQuotations]).then((responses) => {
        const quotationList = responses[0];
        callback(quotationList);
    });
}

const setListPagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-quotations-api`;

        next();
    };
}

const setDetailsPagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-quotation-details-api`;

        next();
    };
}

quotationRouter.get('/list', ...handlers, setListPagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), function (req, res) {
    const user = req.user;
    const isMerchantAccess = res.locals.isMerchantRoute;
    const pageType = isMerchantAccess ? 'Merchant' : 'Consumer';

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function (err, categories) {
            resolve(categories);
        });
    });
    const pageNumber = 1;
    const filters = {
        keywords: null,
        isAccepted: null,
        isPending: null,
        isCancelled: null,
        isDeclined: null,
        itemsPerPage: 20,
        isBuyerSideBar: !isMerchantAccess
    };

    getQuotations(user.ID, pageNumber, filters, function (quotationList) {
        Promise.all([promiseCategories]).then((responses) => {
            const appString = 'quotation-list';
            const categories = responses[0];

            getUserPermissionsOnPage(user, 'Quotations', pageType, (pagePermissions) => {
                const s = Store.createQuotationStore({
                    userReducer: {
                        user: user,
                        pagePermissions
                    },
                    quotationReducer: {
                        quotationList: quotationList,
                        isMerchantAccess: isMerchantAccess,
                        filters: filters
                    }
                });
                const reduxState = s.getState();
                const quotationListApp = reactDom.renderToString(
                    <QuotationListComponent quotationList={quotationList}
                        categories={categories}
                        user={user}
                        filters={ filters}
                        isMerchantAccess={isMerchantAccess}
                        pagePermissions={pagePermissions}
                    />
                );

                let seoTitle = 'Quotation List';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                res.send(template('page-seller requisition-list quotation-list page-sidebar', seoTitle, quotationListApp, appString, reduxState));
            });
        });
    });
});

quotationRouter.get('/filter', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    let user = req.user;
    const { keywords, isAccepted, isPending, isCancelled, isDeclined, itemsPerPage } = req.query;
    const pageNumber = 1;
    const filters = {
        keywords: keywords,
        isAccepted: isAccepted,
        isPending: isPending,
        isCancelled: isCancelled,
        isDeclined: isDeclined,
        itemsPerPage: itemsPerPage,
        isBuyerSideBar: !res.locals.isMerchantRoute
    };

    getQuotations(user.ID, pageNumber, filters, function (quotationList) {
        res.send(quotationList);
    });
});

quotationRouter.get('/paging', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    let user = req.user;
    const { keywords = null, isAccepted = null, isPending = null, isCancelled = null, isDeclined = null,
        itemsPerPage = 1, pageNumber = 1 } = req.query;

    const filters = {
        keywords: keywords,
        isAccepted: isAccepted,
        isPending: isPending,
        isCancelled: isCancelled,
        isDeclined: isDeclined,
        itemsPerPage: itemsPerPage,
        isBuyerSideBar: !res.locals.isMerchantRoute
    };

    getQuotations(user.ID, pageNumber, filters, function (quotationList) {
        res.send(quotationList);
    });
});

quotationRouter.get('/detail', ...handlers, setDetailsPagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), function (req, res) {
    const user = req.user;
    const isMerchantAccess = res.locals.isMerchantRoute;
    const pageType = isMerchantAccess ? 'Merchant' : 'Consumer';

    const quotationId = req.query['id'];
    let buyer = req.query['buyer'];

    if (!quotationId) {
        return res.redirect('/quotation/list?error=quotation-id-not-found');
    }

    let promiseQuotation = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            quotationId: quotationId,
            includes: ['CartItemDetail', 'ItemDetail', 'PaymentTerm']
        };

        client.Quotations.getQuotationById(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseQuotation]).then((responses) => {
        let quotationDetail = responses[0];
        if (buyer === undefined) {
            if (user && user.Roles) {
                if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
                    if (user.ID !== quotationDetail.FromUserID) {
                        buyer = "true";
                    }
                }
            }
        }

        if (!quotationDetail) {
            return res.redirect('/quotation/list?error=quotation-not-found');
        }
        getUserPermissionsOnPage(user, "Quotation Details", pageType, (pagePermissions) => {
            if (!quotationDetail.Accepted && !quotationDetail.Declined && quotationDetail.MessageType !== 'CANCELLED') {
                const Moment = require('moment');
                let validEndDate = typeof quotationDetail.ValidEndDate === 'number'
                    ? Moment.unix(quotationDetail.ValidEndDate).utc().local()
                    : Moment.utc(quotationDetail.ValidEndDate).local();

                const currentDate = Moment().utc().local();
                const isValidQuotation = validEndDate > currentDate;

                if (isValidQuotation) {
                    const reduxState = Store.createQuotationStore({
                        userReducer: {
                            user: user,
                            pagePermissions: pagePermissions
                        },
                        quotationReducer: {
                            quotationDetail: quotationDetail,
                            buyerdocs: buyer,
                            isMerchantAccess: isMerchantAccess
                        }
                    }).getState();

                    const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                    const app = reactDom.renderToString(<QuotationDetailComponent pagePermissions={pagePermissions} user={user} quotation={quotationDetail} buyerdocs={buyer} isMerchantAccess={isMerchantAccess}/>);

                    res.send(template('page-seller page-buyer-quotation-detail requisition-list page-sidebar', seoTitle, app, 'quotation-detail', reduxState));
                } else {
                    const promiseAccountOwner = new Promise((resolve, reject) => {
                        if (user.AccountOwnerID) {
                            const options = {
                                userId: user.AccountOwnerID
                            };

                            client.Users.getUserDetails(options, (err, result) => {
                                resolve(result);
                            });
                        } else {
                            resolve(user);
                        }
                    });

                    Promise.all([promiseAccountOwner]).then((responses) => {
                        const accountOwner = responses[0];
                        const cancelMessage = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
                            `<p class=\"chat-system-generated-msg\" data-msg-type=\"cancelled-quotation\">${accountOwner.DisplayName} has cancelled the quotation.</p>`;

                        const promiseCancelQuotation = new Promise((resolve, reject) => {
                            const options = {
                                userId: user.ID,
                                quotationId: quotationDetail.ID,
                                accepted: false,
                                declined: false,
                                messageType: 'CANCELLED',
                                message: cancelMessage
                            };

                            client.Quotations.updateQuotation(options, (err, result) => {
                                resolve(result);
                            });
                        });

                        const promiseChat = new Promise((resolve, reject) => {
                            client.Chat.getMessages(user.ID, quotationDetail.ChannelID, (err, result) => {
                                resolve(result);
                            });
                        });

                        Promise.all([promiseCancelQuotation, promiseChat]).then((responses) => {
                            const chat = responses[1];
                            const promiseUpdatedQuotation = new Promise((resolve, reject) => {
                                const options = {
                                    userId: user.ID,
                                    quotationId: responses[0].ID,
                                    includes: ['CartItemDetail', 'ItemDetail', 'PaymentTerm']
                                };

                                client.Quotations.getQuotationById(options, (err, result) => {
                                    resolve(result);
                                });
                            });

                            Promise.all([promiseUpdatedQuotation]).then((responses) => {
                                quotationDetail = responses[0];
                                if (!chat || !chat.Channel || !chat.Channel.Members) {
                                    return res.send('Chat channel is invalid');
                                }

                                let cancelQuotationMessage = null;
                                let chatMessageToUpdate = null;

                                if (quotationDetail.Message && quotationDetail.Message.indexOf('data-msg-type=\"sent-quotation\"') >= 0) {
                                    chatMessageToUpdate = chat.Messages.Records.find(m => m.Message == quotationDetail.Message && m.Sender == accountOwner.Email);

                                    if (chatMessageToUpdate) {
                                        cancelQuotationMessage = quotationMessage.substring(0, quotationMessage.indexOf('<button')) +
                                            '<button class=\"btn\" id=\"cancelled-quotation-button\">Quotation Cancelled</button>';
                                    }
                                }

                                const promiseNewMessage = new Promise((resolve, reject) => {
                                    const options = {
                                        userId: user.ID,
                                        channelId: quotationDetail.ChannelID,
                                        message: cancelMessage
                                    };

                                    client.Chat.createChannelMessage(options, (err, result) => {
                                        resolve(result);
                                    });
                                });

                                const promiseUpdateMessage = new Promise((resolve, reject) => {
                                    if (chatMessageToUpdate) {
                                        const options = {
                                            userId: user.ID,
                                            channelId: quotationDetail.ChannelID,
                                            messageId: chatMessageToUpdate.SID,
                                            message: cancelQuotationMessage
                                        };

                                        client.Chat.updateChannelMessage(options, (err, result) => {
                                            resolve(result);
                                        });
                                    } else {
                                        resolve(null);
                                    }
                                });

                                Promise.all([promiseNewMessage, promiseUpdateMessage]).then((responses) => {
                                    const reduxState = Store.createQuotationStore({
                                        userReducer: {
                                            user: user,
                                            pagePermissions: pagePermissions
                                        },
                                        quotationReducer: {
                                            quotationDetail: quotationDetail,
                                            buyerdocs: buyer,
                                            isMerchantAccess: isMerchantAccess
                                        }
                                    }).getState();

                                    const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                                    const app = reactDom.renderToString(<QuotationDetailComponent user={user} pagePermissions={pagePermissions} quotation={quotationDetail} buyerdocs={buyer} isMerchantAccess={isMerchantAccess} />);

                                    res.send(template('page-seller page-buyer-quotation-detail requisition-list page-sidebar', seoTitle, app, 'quotation-detail', reduxState));
                                });
                            });
                        });
                    });
                }
            } else {
                const reduxState = Store.createQuotationStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    quotationReducer: {
                        quotationDetail: quotationDetail,
                        buyerdocs: buyer
                    }
                }).getState();

                const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                const app = reactDom.renderToString(<QuotationDetailComponent user={user} pagePermissions={pagePermissions} quotation={quotationDetail} buyerdocs={buyer} />);

                res.send(template('page-seller page-buyer-quotation-detail requisition-list page-sidebar', seoTitle, app, 'quotation-detail', reduxState));
            }
        });
    });
});

quotationRouter.post('/cancel-quotation', ...handlers, authorizedMerchant, setDetailsPagePermissionCode('edit'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;
    const quotationId = req.body['quotationId'];
    const channelId = req.body['channelId'];
    const quotationMessage = req.body['quotationMessage'];

    const promiseAccountOwner = new Promise((resolve, reject) => {
        if (user.AccountOwnerID) {
            const options = {
                userId: user.AccountOwnerID
            };

            client.Users.getUserDetails(options, (err, result) => {
                resolve(result);
            });
        } else {
            resolve(user);
        }
    });

    Promise.all([promiseAccountOwner]).then((responses) => {
        const accountOwner = responses[0];
        const cancelMessage = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
            `<p class=\"chat-system-generated-msg\" data-msg-type=\"cancelled-quotation\">${accountOwner.DisplayName} has cancelled the quotation.</p>`;

        const promiseCancelQuotation = new Promise((resolve, reject) => {
            const options = {
                userId: user.ID,
                quotationId: quotationId,
                accepted: false,
                declined: false,
                messageType: 'CANCELLED',
                message: cancelMessage
            };

            client.Quotations.updateQuotation(options, (err, result) => {
                resolve(result);
            });
        });

        const promiseChat = new Promise((resolve, reject) => {
            client.Chat.getMessages(user.ID, channelId, (err, result) => {
                resolve(result);
            });
        });

        Promise.all([promiseCancelQuotation, promiseChat]).then((responses) => {
            const chat = responses[1];

            if (!chat || !chat.Channel || !chat.Channel.Members) {
                return res.send('Chat channel is invalid');
            }

            let cancelQuotationMessage = null;
            let chatMessageToUpdate = null;

            if (quotationMessage && quotationMessage.indexOf('data-msg-type=\"sent-quotation\"') >= 0) {
                chatMessageToUpdate = chat.Messages.Records.find(m => m.Message == quotationMessage && m.Sender == accountOwner.Email);

                if (chatMessageToUpdate) {
                    cancelQuotationMessage = quotationMessage.substring(0, quotationMessage.indexOf('<button')) +
                        '<button class=\"btn\" id=\"cancelled-quotation-button\">Quotation Cancelled</button>';
                }
            }

            const promiseNewMessage = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    channelId: channelId,
                    message: cancelMessage
                };

                client.Chat.createChannelMessage(options, (err, result) => {
                    resolve(result);
                });
            });

            const promiseUpdateMessage = new Promise((resolve, reject) => {
                if (chatMessageToUpdate) {
                    const options = {
                        userId: user.ID,
                        channelId: channelId,
                        messageId: chatMessageToUpdate.SID,
                        message: cancelQuotationMessage
                    };

                    client.Chat.updateChannelMessage(options, (err, result) => {
                        resolve(result);
                    });
                } else {
                    resolve(null);
                }
            });

            Promise.all([promiseNewMessage, promiseUpdateMessage]).then((responses) => {
                res.send();
            });
        });
    });
});

quotationRouter.post('/decline-accept-quotation', ...handlers, setDetailsPagePermissionCode('edit'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;
    const quotationId = req.body['quotationId'];
    const channelId = req.body['channelId'];
    const isAccepted = req.body['isAccepted'] == 'true';
    const isDeclined = req.body['isDeclined'] == 'true';
    const messageType = isAccepted ? "ACCEPTED" : "DECLINED";
    let message = '';
    if (isDeclined) {
        message = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
            `<p class=\"chat-system-generated-msg\" data-msg-type=\"declined-quotation\">Quotation has been declined!</p>`;
    }
    if (isAccepted) {
        message = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
            `<p class=\"chat-system-generated-msg\" data-msg-type=\"accepted-quotation\">Quotation has been accepted!</p>`;
    }

    const promiseQuotation = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            quotationId: quotationId,
            accepted: isAccepted,
            declined: isDeclined,
            messageType: messageType,
            message: message
        };

        client.Quotations.updateQuotation(options, (err, result) => {
            resolve(result);
        });
    });

    const promiseChat = new Promise((resolve, reject) => {
        client.Chat.getMessages(user.ID, channelId, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseQuotation, promiseChat]).then((responses) => {
        const chat = responses[1];

        if (!chat || !chat.Channel || !chat.Channel.Members) {
            return res.send('Chat channel is invalid');
        }

        if (message !== "") {
            const promiseNewMessage = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    channelId: channelId,
                    message: message
                };

                client.Chat.createChannelMessage(options, (err, result) => {
                    resolve(result);
                });
            });

            Promise.all([promiseNewMessage]).then((responses) => {
                res.send();
            });
        }

        res.send();
    });
});

module.exports = quotationRouter;