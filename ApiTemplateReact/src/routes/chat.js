'use strict';
var express = require('express');
var chatRouter = express.Router();
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');
var ChatComponent = require('../views/chat/index').ChatComponent;
var ChatInboxPage = require('../views/chat/inbox/main').ChatComponent;
var ChatQuotationComponent = require('../views/chat/quotation/index').ChatQuotationComponent;
var client = require('../../sdk/client');
var authenticated = require('../scripts/shared/authenticated');
var authorizedMerchant = require('../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../scripts/shared/onboarded-merchant');
var authorizedUser = require('../scripts/shared/authorized-user');
var Store = require('../redux/store');
var EnumCoreModule = require('../public/js/enum-core');
var CustomFieldStaticModule = require('../public/js/static/custom-field');

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

const viewCreateQuotationPage = {
    code: 'view-merchant-create-quotation-api',
    seoTitle: 'Create Quotation',
    renderSidebar: false
};

const viewInboxData = {
    code: 'view-consumer-inbox-api',
    seoTitle: 'Inbox',
};

const viewChatData = {
    code: 'view-consumer-chat-details-api',
    seoTitle: 'Chat'
}
function getUserInboxes(userId, pageNumber, keyword, callback) {
    var promiseInbox = new Promise((resolve, reject) => {
        const options = {
            userId: userId,
            pageSize: 20,
            pageNumber: pageNumber,
            keyword: keyword
        };

        client.Inbox.getUserMessages(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInbox]).then((responses) => {
        const inboxes = responses[0];
        let inboxMessages = [];

        if (inboxes.TotalRecords > 0) {
            let promiseMessages = [];

            inboxes.Records.forEach(function (inbox) {
                let options = {
                    userId: userId,
                    channelId: inbox.ChannelID,
                    limit: 1,
                    orderDirection: 'desc',
                    includes: ["Offer", "User"]
                };

                let promise = new Promise((resolve, reject) => {
                    client.Inbox.getChannelMessages(options, function (err, result) {
                        resolve(result);
                    });
                });

                promiseMessages.push(promise);
            });



            Promise.all(promiseMessages).then((responses) => {
                responses.forEach(function (response) {
                    let channel = response.Channel;
                    let messages = response.Messages;
                    let member = channel.Members.find(m => m.User.ID == userId);
                    let data = {
                        messages: messages,
                        channel: channel,
                        isNewMessage: false
                    };

                    if (messages.TotalRecords > 0) {
                        messages.Records.forEach(function (message) {
                            if (message.SID != member.LastMessageSID) {
                                data.isNewMessage = true;
                            }
                        });
                    }

                    inboxMessages.push(data);
                });

                callback(inboxes, inboxMessages);
            });
        } else {
            callback(inboxes, inboxMessages)
        }
    });
}

chatRouter.get('/', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewChatData),function (req, res) {
    const user = req.user;
    const channelId = req.query["channelId"];

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function (err, categories) {
            resolve(categories);
        });
    });

    const promiseChatDetail = new Promise((resolve, reject) => {
        client.Chat.getMessages(user.ID, channelId, function (err, chatDetail) {
            resolve(chatDetail);
        });
    });

    Promise.all([promiseCategories, promiseChatDetail]).then((responses) => {
        const appString = 'chat';
        const context = {};
        const categories = responses[0];
        const chatDetail = responses[1];

        let promiseOrderDetails = null;
        let channelCartItemDetail = null;
        let channelItemDetail = null;
        if (chatDetail && chatDetail.Channel) {
            if (chatDetail.Channel.CartItemDetail) {
                channelCartItemDetail = chatDetail.Channel.CartItemDetail;
                if (chatDetail.Channel.CartItemDetail.ItemDetail) {
                    channelItemDetail = chatDetail.Channel.CartItemDetail.ItemDetail;
                }
            }
            else if (chatDetail.Channel.ItemDetail) {
                channelItemDetail = chatDetail.Channel.ItemDetail;
            }
        }

        if (channelCartItemDetail && channelItemDetail && chatDetail.Channel.Offer
            && chatDetail.Channel.Offer.Accepted
            && channelCartItemDetail.ID == chatDetail.Channel.Offer.CartItemID
            && channelCartItemDetail.ItemDetail.MerchantDetail.ID == user.ID) {
            promiseOrderDetails = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    orderId: channelCartItemDetail.OrderID
                };
                client.Orders.getOrderDetails(options, function (err, chatDetail) {
                    resolve(chatDetail);
                });
            });
        }

        let promiseItems = new Promise((resolve, reject) => {

            let itemId = channelItemDetail
                ? channelItemDetail.ID
                : ((channelCartItemDetail && channelCartItemDetail.ItemDetail) ? channelCartItemDetail.ItemDetail.ID : 0);

            if (itemId > 0) {
                const options = {
                    itemId: itemId,
                    activeOnly: false
                };


                client.Items.getItemDetails(options, function (err, details) {
                    resolve(details);
                });
            }
            else {
                resolve(null);
            }
        });

        let hasBulk = false;

        Promise.all([promiseItems, promiseOrderDetails]).then((responses) => {
            let parentItem = responses[0];
            let orderDetails = responses[1];

            function inRange(x, min, max) {
                return ((x - min) * (x - max) <= 0);
            }

            if (parentItem && parentItem.ChildItems) {
                parentItem.ChildItems.forEach(function (child) {
                    if (child.ID === channelItemDetail.ID) {
                        if (child.CustomFields) {
                            child.CustomFields.forEach(function (customfield) {
                                if (customfield.Name.toLowerCase() === "bulkpricing") {
                                    if (customfield.Values && customfield.Values[0] && customfield.Values[0].length > 1) {
                                        const customFieldValue = JSON.parse(customfield.Values[0]);
                                        const number = channelCartItemDetail.Quantity;
                                        const price = channelItemDetail.Price;
                                        if (customFieldValue != null) {
                                            let breakNow = false;
                                            customFieldValue.forEach(function (bulk) {
                                                if (breakNow == true) {
                                                    return false;
                                                }
                                                let bulkComputation = (price * number) - (number * bulk.Discount);
                                                if (bulk.isPercentage) {
                                                    bulkComputation = (price * number) - ((price * number) * bulk.Discount) / 100;
                                                }
                                                if (bulk.RangeStart !== undefined) {
                                                    if (inRange(number, parseInt(bulk.RangeStart), parseInt(bulk.RangeEnd)) == true) {
                                                        channelItemDetail.SubTotal = bulkComputation;
                                                        breakNow = true;
                                                    }
                                                } else {
                                                    // OnwardPrice
                                                    if (bulk.OnwardPrice !== undefined) {
                                                        if (number >= parseInt(bulk.OnwardPrice)) {
                                                            channelItemDetail.SubTotal = bulkComputation;
                                                            breakNow = true;
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        hasBulk = true;
                                    }
                                }
                            });
                        }
                    }
                });
            }

            const isItemDisabled = !(parentItem && parentItem.IsAvailable && parentItem.IsVisibleToCustomer && parentItem.Active);

            let invoiceNo = null;
            if (orderDetails && orderDetails.PaymentDetails && orderDetails.PaymentDetails.length > 0) {
                invoiceNo = orderDetails.PaymentDetails[0].InvoiceNo;
            }
            getUserPermissionsOnPage(user, 'Chat Details', 'Consumer', (pagePermissions) => {
                getUserPermissionsOnPage(user, 'Chat Details', 'Merchant', (merchantPagePermissions) => {
                    //consumer chat details does not have add permission, only merchant
                    //use the add permission from merchant
                    pagePermissions.isAuthorizedToAdd = merchantPagePermissions.isAuthorizedToAdd;

                    const s = Store.createChatStore({
                        userReducer: {
                            user: user,
                            pagePermissions
                        },
                        chatReducer: {
                            channelId: channelId,
                            chatDetail: chatDetail,
                            hasBulk: hasBulk,
                            isItemDisabled: isItemDisabled,
                            invoiceNo: invoiceNo
                        }
                    });

                    //UN1101 //Checking ForNull to Avoid serverCrash
                    if (channelItemDetail && channelItemDetail.Media) {
                        channelItemDetail.Media.map(function (data, i) {
                            data.MediaUrl = channelItemDetail.Media[i].MediaUrl;
                        });
                    }

                    const reduxState = s.getState();
                    const chatPageApp = reactDom.renderToString(<ChatComponent context={context}
                        categories={categories}
                        user={user}
                        chatDetail={chatDetail}
                        hasBulk={hasBulk}
                        isItemDisabled={isItemDisabled}
                        invoiceNo={invoiceNo}
                        pagePermissions={pagePermissions}
                    />);

                    let seoTitle = 'Chat';
                    if (req.SeoTitle) {
                        seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                    }

                    res.send(template('page-seller page-chat-quotation', seoTitle, chatPageApp, appString, reduxState));
                });
            });
            
        });
    });
});

chatRouter.get('/inbox', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewInboxData), function (req, res) {
    let user = req.user;
    const keyword = '';
    const pageNumber = 1;

    getUserInboxes(user.ID, pageNumber, keyword, function (inboxes, inboxMessages) {
        const appString = 'chat-inbox';
        const context = {};

        const s = Store.createInboxStore({
            userReducer: { user: user },
            inboxReducer: {
                messages: inboxes,
                inboxDatas: inboxMessages
            }
        });

        const reduxState = s.getState();

        let seoTitle = 'Inbox';
        if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }

        const InboxPage = reactDom.renderToString(
            <ChatInboxPage context={context}
                currentUser={user}
                messages={inboxes}
                inboxDatas={inboxMessages} />);

        res.send(template('page-inbox', seoTitle, InboxPage, appString, reduxState));
    });
});

chatRouter.get('/inbox/search', authenticated, function (req, res) {
    let user = req.user;
    const keyword = req.query['keyword'];
    const pageNumber = 1;

    getUserInboxes(user.ID, pageNumber, keyword, function (inboxes, inboxMessages) {
        res.send({
            messages: inboxes,
            inboxDatas: inboxMessages
        });
    });
});

chatRouter.get('/inbox/paging', authenticated, function (req, res) {
    let user = req.user;
    const keyword = req.query['keyword'];
    const pageNumber = req.query['pageNumber'];

    getUserInboxes(user.ID, pageNumber, keyword, function (inboxes, inboxMessages) {
        res.send({
            messages: inboxes,
            inboxDatas: inboxMessages
        });
    });
});

chatRouter.get('/inbox/getUnreadCount', authenticated, function (req, res) {
    let user = req.user;
    if (!user) {
        //Guest no Inbox
        return res.send('0');
    }

    let promiseInbox = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            pageSize: 1000,
            pageNumber: 1,
            includes: 'User'
        }

        client.Inbox.getChannels(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInbox]).then((responses) => {
        const inboxes = responses[0];

        if (inboxes.TotalRecords > 0) {
            let unreadCount = 0;
            let promiseMessages = [];

            inboxes.Records.forEach(function (inbox) {
                let options = {
                    userId: user.ID,
                    channelId: inbox.ChannelID,
                    limit: 1,
                    orderDirection: 'desc',
                    includes: null
                };

                //this causing the problem for ARC9357 I think in the UI for superbaby we are not showing the unreadCounts. lets remove this its exception TOO MUCH REQUEST
                //let promise = new Promise((resolve, reject) => {
                //    client.Inbox.getChannelMessages(options, function (err, result) {
                //        resolve(result);
                //    });
                //});
                
             //   promiseMessages.push(promise);
            });

            Promise.all(promiseMessages).then((responses) => {
                responses.forEach(function (response) {
                    let channel = response.Channel;
                    let messages = response.Messages;
                    let member = channel.Members.find(m => m.User.ID == user.ID);

                    if (messages.TotalRecords > 0) {
                        messages.Records.forEach(function (message) {
                            if (message.SID != member.LastMessageSID) {
                                unreadCount += 1;
                            }
                        });
                    }
                });

                res.send(unreadCount.toString());
            });
        } else {
            res.send('0');
        }
    });
});

chatRouter.get('/generate-token', authenticated, function (req, res) {
    var promiseToken = new Promise((resolve, reject) => {
        client.Chat.generateToken(req.user.ID, 'browser', function (err, token) {
            resolve(token);
        });
    });

    Promise.all([promiseToken]).then((responses) => {
        const token = responses[0];
        res.send(token);
    });
});

chatRouter.post('/edit-cart-item-booking-slot', authenticated, authorizedMerchant, onboardedMerchant, isAuthorizedToPerformAction('add-merchant-create-quotation-api'), function (req, res) {
    const user = req.user;

    var promiseCart = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            cartitemid: req.body['CartItemID'],
            SubTotal: req.body['SubTotal']
        };

        if (req.body['AddOns']) {
            options.AddOns = JSON.parse(req.body['AddOns'])
        }


        if (req.body['Quantity']) {
            options.Quantity = req.body['Quantity']
        }

        if (req.body['BookingSlot']) {
            options.BookingSlot = JSON.parse(req.body['BookingSlot']);
        }


        client.Orders.updateBooking(options, function (err, result) {
            resolve(result);
        });

    });
    Promise.all([promiseCart]).then((responses) => {
        res.send(responses[0]);
    });
})

chatRouter.post('/send-offer', authenticated, authorizedMerchant, onboardedMerchant, isAuthorizedToPerformAction('add-merchant-create-quotation-api'), function (req, res) {
    const user = req.user;

    const offer = {
        ID: 0,
        FromUserID: user.ID,
        ToUserID: req.body['ToUserID'],
        CartItemID: req.body['CartItemID'],
        Total: req.body['Total'],
        CurrencyCode: req.body['CurrencyCode'],
        ChannelID: req.body['ChannelID'] || null,
        MessageType: 'PRE-APPROVED',
        Message: null,
        Accepted: false,
        Declined: false,
        Quantity: req.body['Quantity'],
        PaymentTermID: req.body['PaymentTermID'],
        ValidStartDate: req.body['ValidStartDate'],
        ValidEndDate: req.body['ValidEndDate'],
        OfferDetails: JSON.parse(req.body['OfferDetails']),
        AddOns: JSON.parse(req.body["AddOns"])
    };

    var promiseCart = new Promise((resolve, reject) => {
        const options = {
            userID: offer.ToUserID,
            quantity: offer.Quantity,
            cartID: offer.CartItemID,
            addOns: offer.AddOns
        };

        client.Carts.editCart(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        offer.CartItemID = cart.ID;

        var promiseOffer = new Promise((resolve, reject) => {
            client.Chat.sendOffer(user.ID, offer, function (err, result) {
                resolve(result);
            });
        });

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

        Promise.all([promiseOffer, promiseAccountOwner]).then((responses) => {
            const offer = responses[0];
            const accountOwner = responses[1];

            const chatMessage = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
                `<p class=\"chat-system-generated-msg\" data-msg-type=\"sent-quotation\">${accountOwner.DisplayName} sent a quotation.</p>` +
                `<button class=\"btn\" id=\"quotation-button\" onclick="window.location = '${'/quotation/detail?id=' + offer.ID}';">Check Quotation</button>`;

            const promiseUpdateQuotation = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    quotationId: offer.ID,
                    message: chatMessage
                };

                client.Quotations.updateQuotation(options, (err, result) => {
                    resolve(result);
                });
            });

            Promise.all([promiseUpdateQuotation]).then((responses) => {
                res.send(responses[0]);
            });
        });
    });
});

chatRouter.put('/decline-offer', authenticated, function (req, res) {
    var promiseOffer = new Promise((resolve, reject) => {
        const userId = req.user.ID;
        const offer = {
            ID: req.body['ID'],
            Accepted: req.body['Accepted'],
            Declined: req.body['Declined'],
            Message: '<p><span class=\"offer-declined\">Offer has been declined!</span></p>'
        };
        client.Chat.declineOffer(userId, offer, function (err, token) {
            resolve(token);
        });
    });

    Promise.all([promiseOffer]).then((responses) => {
        const token = responses[0];

        const promiseUserComparisons = new Promise((resolve, reject) => {
            const options = {
                userId: req.user.ID,
                namesOnly: false,
                pageSize: 1000,
                pageNumber: 1,
                includes: 'CartItem'
            };
            client.Comparisons.getUserComparisons(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseUserComparisons]).then((responses) => {
            const userComparisons = responses[0];
            let toDeleteComparisonDetailIds = [];

            if (userComparisons.TotalRecords > 0) {
                const comparisons = userComparisons.Records.filter(c => c.ReadOnly == false && c.Active == true);
                if (comparisons.length > 0) {
                    comparisons.forEach(function (comparison) {
                        comparison.ComparisonDetails.forEach(function (detail) {
                            if (detail.Active == true && detail.CartItemID == token.CartItemID) {
                                toDeleteComparisonDetailIds.push(detail.ID);
                            }
                        });
                    });
                }
            }

            const promiseDeleteComparisonDetails = new Promise((resolve, reject) => {
                if (toDeleteComparisonDetailIds.length > 0) {
                    const options = {
                        userId: req.user.ID,
                        comparisonDetailIds: toDeleteComparisonDetailIds
                    };

                    client.Comparisons.deleteComparisonDetailsByIds(options, function (err, result) {
                        resolve(result);
                    });
                } else {
                    resolve(null);
                }
            });

            Promise.all([promiseDeleteComparisonDetails]).then((responses) => {
                res.send(token);
            })
        });
    });
});

chatRouter.get('/get-channels', authenticated, function (req, res) {
    const options = {
        pageSize: req.query['pageSize'],
        pageNumber: req.query['pageNumber'],
        includes: req.query['includes']
    };

    var promiseChannels = new Promise((resolve, reject) => {
        client.Chat.getUserChannels(req.user.ID, options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChannels]).then((responses) => {
        res.send(responses[0]);
    });
});

chatRouter.post('/create-cart', authenticated, authorizedMerchant, onboardedMerchant, isAuthorizedToPerformAction('add-merchant-create-quotation-api'), function (req, res) {
    const userId = req.user.ID;
    var promiseCart = new Promise((resolve, reject) => {
        const cartOptions = {
            userId: req.body['recipientId'],
            quantity: req.body['quantity'],
            itemId: req.body['itemId'],
            force: true
        };
        if (process.env.PRICING_TYPE == 'service_level') {
            cartOptions.serviceBookingUnitGuid = req.body['serviceBookingUnitGuid'] || null;
            cartOptions.bookingSlot = req.body['bookingSlot'] ? JSON.parse(req.body['bookingSlot']) : null;
            cartOptions.addOns = req.body['addOns'] ? JSON.parse(req.body['addOns']) : null;
        }
        client.Carts.addCart(cartOptions, function (err, result) {
            if (err) {
                if (err.toString().includes('Insufficient stock')) {
                    reject({ Code: 'INSUFFICIENT_STOCK' });
                } else if (err.toString().includes('Invalid service booking')) {
                    reject({ Code: 'INVALID_SERVICE_BOOKING' });
                } else {
                    reject(null);
                }

            }
            else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseCart]).then((responses) => {
        res.send(responses[0]);
    }, (err) => {
        res.send(err);
    });
});

chatRouter.post('/create-channel', authenticated, function (req, res) {
    const userId = req.user.ID;
    var promiseCart = new Promise((resolve, reject) => {
        if (req.body['createCartItem']) {
            const cartOptions = {
                userId: userId,
                quantity: req.body['quantity'],
                itemId: req.body['itemId'],
                force: true
            };
            if (process.env.PRICING_TYPE == 'service_level') {
                cartOptions.serviceBookingUnitGuid = req.body['serviceBookingUnitGuid'] || null;
                cartOptions.bookingSlot = req.body['bookingSlot'] ? JSON.parse(req.body['bookingSlot']) : null;
                cartOptions.addOns = req.body['addOns'] ? JSON.parse(req.body['addOns']) : null;
            }
            client.Carts.addCart(cartOptions, function (err, result) {
                if (err) {
                    if (err.toString().includes('Insufficient stock')) {
                        reject({ Code: 'INSUFFICIENT_STOCK' });
                    } else if (err.toString().includes('Invalid service booking')) {
                        reject({ Code: 'INVALID_SERVICE_BOOKING' });
                    } else {
                        reject(null);
                    }

                }
                else {
                    resolve(result);
                }
            });
        }
        else {
            resolve(null);
        }
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        const channelOptions = {
            recipientId: req.body['recipientId'],
            itemId: !cart ? req.body['itemId'] : cart.ItemDetail.ID,
            cartItemId: cart ? cart.ID : null
        };

        var promiseChannel = new Promise((resolve, reject) => {
            client.Chat.createChannel(userId, channelOptions, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseChannel]).then((responses) => {
            const channel = responses[0];
            res.send(channel);
        });
    }, (err) => {
        res.send(err);
    });
});

chatRouter.get('/get-recipient-addresses', authenticated, function (req, res) {
    const recipientId = req.query['recipientId'];

    var promiseAddresses = new Promise((resolve, reject) => {
        client.Addresses.getUserAddresses(recipientId, function (err, addresses) {
            resolve(addresses);
        });
    });

    let promiseMerchantDetail = new Promise((resolve, reject) => {
        const options = {
            token: null,
            userId: recipientId,
            includes: ''
        };

        client.Users.getUserDetails(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseAddresses, promiseMerchantDetail]).then((response) => {
        res.send(response);
    });
});

chatRouter.get('/enquiry', authenticated, function (req, res) {
    const user = req.user;
    const channelId = req.query["channelId"];

    const promiseChatDetail = new Promise((resolve, reject) => {
        client.Chat.getMessages(user.ID, channelId, function (err, chatDetail) {
            resolve(chatDetail);
        });
    });
    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'BusinessProfile'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChatDetail, promiseMarketplace]).then((responses) => {
        const chatDetail = responses[0];
        const marketplace = responses[1];
        let sellerName = '';
        let sellerEmail = '';

        if (chatDetail.Channel.ItemDetail) {
            if (chatDetail.Channel.ItemDetail.MerchantDetail) {
                sellerName = chatDetail.Channel.ItemDetail.MerchantDetail.FirstName + ' ' + chatDetail.Channel.ItemDetail.MerchantDetail.LastName;
                sellerEmail = chatDetail.Channel.ItemDetail.MerchantDetail.Email;
            }
        }
        else if (chatDetail.Channel.CartItemDetail.ItemDetail) {
            if (chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail) {
                sellerName = chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail.FirstName + ' ' + chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail.LastName;
                sellerEmail = chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail.Email;
            }
        }

        const marketplaceParams = EnumCoreModule.MapMarketplaceToEdmParameters(marketplace);
        const chatParams = EnumCoreModule.MapChatToEdmParameters({
            ChannelId: channelId,
            SellerName: sellerName,
            SellerDisplayName: '',
            ConsumerFirstName: user.FirstName + ' ' + user.LastName,
            ConsumerEmail: user.Email,
            SellerEmail: sellerEmail
        }, req.protocol, req.get('host'));

        const params = marketplaceParams.concat(chatParams);
        const edm = EnumCoreModule.MapEdmParametersToTemplate(Object.assign({}, EnumCoreModule.GetEdmTemplates().ChatEnquiry), params);

        const options = {
            from: edm.From,
            to: edm.To,
            subject: edm.Subject,
            body: edm.Body
        };

        client.Emails.sendEdm(options, function (err, result) {
            res.redirect('/chat?channelId=' + channelId);
        });
    });
});

chatRouter.put('/accept-offer', authenticated, function (req, res) {
    var promiseOffer = new Promise((resolve, reject) => {
        const userId = req.user.ID;
        const offer = {
            ID: req.body['ID'],
            Accepted: req.body['Accepted'],
            Declined: req.body['Declined'],
            MessageType: req.body['MessageType'],
            Message: req.body['Message']
        };
        client.Chat.acceptOffer(userId, offer, function (err, token) {
            resolve(token);
        });
    });

    Promise.all([promiseOffer]).then((responses) => {
        const offer = responses[0];
        res.send(offer);
    });
});

chatRouter.get('/get-offer', authenticated, function (req, res) {
    var promiseOffer = new Promise((resolve, reject) => {
        const options = {
            userId: req.user.ID,
            cartItemId: req.query['cartItemId'],
        };
        client.Chat.getOfferByCartItemId(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseOffer]).then((responses) => {
        res.send(responses[0]);
    });
});

chatRouter.put('/update-member-last-seen-message', authenticated, function (req, res) {
    var promiseMember = new Promise((resolve, reject) => {
        const userId = req.user.ID;
        const data = {
            memberId: req.body['memberId'],
            messageId: req.body['messageId']
        };

        client.Chat.updateMemberLastSeenMessage(userId, data, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMember]).then((responses) => {
        const member = responses[0];
        res.send(member);
    });
});

chatRouter.get('/get-chat-details', authenticated, function (req, res) {
    const channelId = req.query["channelId"];

    const promiseChatDetails = new Promise((resolve, reject) => {
        client.Chat.getMessages(req.user.ID, channelId, function (err, chatDetails) {
            resolve(chatDetails);
        });
    });

    Promise.all([promiseChatDetails]).then((responses) => {
        res.send(responses[0]);
    });
});

chatRouter.post('/add-channel-member', authenticated, function (req, res) {
    // this method is for subaccounts only
    const { user } = req;
    let userId = user.ID;

    if (user.SubBuyerID) {
        userId = user.SubBuyerID;
    } else if (user.SubmerchantID) {
        userId = user.SubmerchantID;
    }

    var promiseMember = new Promise((resolve, reject) => {
        const data = {
            channelId: req.body['channelId']
        };
        client.Chat.addChannelMember(userId, data, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMember]).then((responses) => {
        const member = responses[0];
        res.send(member);
    });
});

chatRouter.get('/quotation', authenticated, authorizedMerchant, onboardedMerchant, isAuthorizedToAccessViewPage(viewCreateQuotationPage), function (req, res) {
    const user = req.user;
    const channelId = req.query['channelId'];

    if (!channelId)
        return res.redirect('/chat/inbox');

    const promiseChatDetail = new Promise((resolve, reject) => {
        client.Chat.getMessages(user.ID, channelId, function (err, result) {
            resolve(result);
        });
    });

    const promisePaymentTerms = new Promise((resolve, reject) => {
        client.Payments.getPaymentTerms({ merchantId: user.ID }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChatDetail, promisePaymentTerms]).then((responses) => {
        const chatDetail = responses[0];
        const paymentTerms = responses[1];

        if (!chatDetail.Channel || !chatDetail.Channel.CartItemDetail) {
            return res.redirect(`/chat?channelId=${channelId}&error=invalid-cart-item`);
        }

        const offer = chatDetail.Channel.Offer;
        if (offer) {
            if (offer.Accepted || (!offer.Accepted && !offer.Declined && offer.MessageType != 'CANCELLED')) {
                return res.redirect(`/chat?channelId=${channelId}&error=quotation-already-exists`);
            }
        }

        const chatItemDetail = chatDetail.Channel.CartItemDetail.ItemDetail;

        const promiseItemDetail = new Promise((resolve, reject) => {
            if (process.env.PRICING_TYPE == 'country_level') {
                const options = {
                    itemId: chatItemDetail.ParentID || chatItemDetail.ID,
                    activeOnly: true
                };

                client.Items.getItemDetails(options, function (err, result) {
                    resolve(result);
                });
            } else {
                resolve(null);
            }
        });

        Promise.all([promiseItemDetail]).then((responses) => {
            const itemDetail = responses[0];
            let availability = null;

            if (itemDetail) {
                //blocker cant access chatdetails
                //  const customFields = !itemDetail.ChildItems ? itemDetail.CustomFields : itemDetail.ChildItems.find(i => i.Tags[0] == chatItemDetail.Tags[0]).CustomFields;
                let customFields = itemDetail.CustomFields;
                if (itemDetail.ChildItems) {
                    itemDetail.ChildItems.forEach(function (ci) {
                        if (ci.Tags && chatItemDetail.Tags && ci.Tags[0] == chatItemDetail.Tags[0]) {
                            customFields = ci.CustomFields;
                        }
                    });
                }

                if (customFields) {
                    availability = {};

                    const moqCustomField = customFields.find(c => c.Name == CustomFieldStaticModule.GetAvailabilityProperties().MOQ);

                    if (moqCustomField) {
                        availability['moq'] = moqCustomField.Values ? JSON.parse(moqCustomField.Values[0]) : null;
                    }
                }
            }

            getUserPermissionsOnPage(user, 'Create Quotation', 'Merchant', (pagePermissions) => {
                const reduxState = Store.createChatStore({
                    userReducer: {
                        user: user,
                        pagePermissions
                    },
                    chatReducer: {
                        chatDetail: chatDetail,
                        paymentTerms: paymentTerms,
                        availability: availability
                    }
                }).getState();

                const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                const app = reactDom.renderToString(<ChatQuotationComponent user={user}
                    pagePermissions={pagePermissions}
                    channelId={channelId}
                    chatDetail={chatDetail}
                    paymentTerms={paymentTerms} />);

                res.send(template('page-seller quotation-detail', seoTitle, app, 'chat-quotation', reduxState));
            });
        });
    });
});

chatRouter.post('/send-message', authenticated, function (req, res) {
    const { user } = req;

    const promiseMessage = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            ...req.body
        };

        client.Chat.createChannelMessage(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseMessage]).then((responses) => {
        res.send(responses[0]);
    });
});

module.exports = chatRouter;