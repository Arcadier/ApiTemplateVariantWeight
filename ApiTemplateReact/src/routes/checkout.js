'use strict';
let express = require('express');
let checkoutRouter = express.Router();
let React = require('react');
let crypto = require('crypto');
let requestApi = require('../scripts/shared/request-api');

let reactDom = require('react-dom/server');
let Store = require('../redux/store');
let template = require('../views/layouts/template');

let OnePageCheckoutComponent = require('../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/one-page-checkout/' + process.env.PRICING_TYPE + '/main').OnePageCheckoutComponent;

let CheckoutReviewComponent = require('../views/checkout/review/main').CheckoutReviewPageComponent;
let CheckoutDeliveryComponent = require('../views/checkout/delivery/main').CheckoutDeliveryComponent;
let CheckoutPaymentComponent = require('../views/checkout/payment/index').CheckoutPaymentComponent;
let TransactionCompletePage = require('../views/checkout/transaction-complete/transaction_complete').TransactionCompleteComponent;
let client = require('../../sdk/client');
let authenticated = require('../scripts/shared/authenticated');

let EnumCoreModule = require('../public/js/enum-core');
let TwilioChat = require('twilio-chat');

const { getApprovalSettings } = require('./approval');

const {
    getUserPermissionsOnPage,
    isAuthorizedToAccessViewPage,
} = require('../scripts/shared/user-permissions');

const viewCheckoutData = {
    code: 'view-consumer-checkout-api',
    seoTitle: 'Checkout Page'
}

function declineOffers(userId, declineComparisonDetails, callback) {
    const message = '<p><span class=\"offer-declined\">Offer has been declined!</span></p>';
    let promiseDeclineOffers = [];
    let promiseChannels = [];
    let promiseMessages = [];
    let channelIds = [];

    declineComparisonDetails.forEach(function (detail) {
        let promise = new Promise((resolve, reject) => {
            const data = {
                ID: detail.Offer.ID,
                Accepted: false,
                Declined: true,
                Message: message
            };
            client.Chat.declineOffer(userId, data, function (err, result) {
                resolve(result);
            });
        });
        promiseDeclineOffers.push(promise);

        channelIds.push(detail.Offer.ChannelID);
    });

    if (declineComparisonDetails.length > 0) {
        Promise.all(promiseDeclineOffers).then((responses) => {
            var promiseToken = new Promise((resolve, reject) => {
                client.Chat.generateToken(userId, 'browser', function (err, result) {
                    resolve(result);
                });
            });

            Promise.all([promiseToken]).then((responses) => {
                const token = responses[0];

                TwilioChat.Client.create(token).then(client => {
                    channelIds.forEach(channelId => {
                        promiseChannels.push(client.getChannelBySid(channelId));
                    });

                    Promise.all(promiseChannels).then((responses) => {
                        responses.forEach(channel => {
                            promiseMessages.push(channel.sendMessage(message));
                        });

                        Promise.all(promiseMessages).then((responses) => {
                            callback();
                        });
                    });
                });
            });
        });
    } else {
        callback();
    }
}

function getDeliveryToAddress(order) {
    let [firstName, lastName, address1, address2, country, state, city, postalcode] = new Array(8).fill("");

    const { DeliveryToAddress } = order;
    if (DeliveryToAddress) {
        let fname, lname = "";
        const { Name, Line1, Line2, Country, State, City, PostCode } = DeliveryToAddress;
        if (Name) [fname, lname] = Name.split('|');
        firstName = fname;
        lastName = lname;
        address1 = Line1;
        address2 = Line2;
        country = Country;
        state = State;
        city = City;
        postalcode = PostCode;
    }

    return {
        FirstName: firstName,
        LastName: lastName,
        Address1: address1,
        Address2: address2,
        Country: country,
        State: state,
        City: city,
        PostalCode: postalcode
    }
}

function getValidPaymentGateways(invoiceDetails, callback) {
    const promisePaymentGateways = new Promise((resolve, reject) => {
        client.Payments.getPaymentGateways(null, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePaymentGateways]).then((responses) => {
        const adminPaymentGateways = responses[0].Records;
        let merchantIds = [];
        let promisePaymentMethods = [];

        invoiceDetails.Orders.forEach((order) => {
            merchantIds.push(order.MerchantDetail.ID);
        });

        merchantIds.forEach((merchantId) => {
            const promise = new Promise((resolve, reject) => {
                client.Payments.getPaymentAcceptanceMethods({ merchantId: merchantId }, function (err, result) {
                    resolve(result);
                });
            });

            promisePaymentMethods.push(promise);
        });

        Promise.all(promisePaymentMethods).then((responses) => {
            let consolidatedPaymentGateways = [];
            let flat = [];

            responses.forEach((response, index) => {
                let merchantPaymentMethods = [];

                response.Records.forEach(function (paymentMethod) {
                    let code = paymentMethod.PaymentGateway.Code;
                    merchantPaymentMethods.push(code);

                    paymentMethod.UserID = merchantIds[index];

                    const existingAdminPaymentGateway = adminPaymentGateways.find(p => p.Code == code);

                    if (existingAdminPaymentGateway) {
                        const existing = consolidatedPaymentGateways.length > 0 ? consolidatedPaymentGateways.find(p => p.Code == code) : null;

                        if (!existing) {
                            let gateway = Object.assign({}, existingAdminPaymentGateway);
                            gateway.PaymentMethods = [paymentMethod];

                            consolidatedPaymentGateways.push(gateway);
                        } else {
                            existing.PaymentMethods.push(paymentMethod);
                        }
                    }
                });

                flat.push(merchantPaymentMethods);
            });

            const intersect = flat.reduce((a, b) => a.filter(c => b.includes(c)));
            const paymentGateways = consolidatedPaymentGateways.filter(p => intersect.includes(p.Code));

            callback(paymentGateways);
        });
    });
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

function getHostname(req) {
    var fullUrl = req.protocol + '://' + req.get('host');
    return fullUrl;
}

function buildGenericPaymentRequest(invoiceDetails, paymentGateway, marketplaceName, hostName) {
    function buildSettings() {
        const gateway = paymentGateway.Code.toLowerCase();
        const meta = paymentGateway.Meta;
        let settings = {};
        let gatewayConfigs = [];

        const invoiceNo = invoiceDetails ? invoiceDetails.InvoiceNo : '';
        marketplaceName = marketplaceName ? marketplaceName : 'Arcadier Marketplace';
        hostName = hostName ? hostName : '';

        if (gateway.startsWith('stripe')) {
            gatewayConfigs.push({ key: 'publicKey', value: meta.publickey });
            gatewayConfigs.push({ key: 'secretKey', value: meta.secretkey });
            gatewayConfigs.push({ key: 'marketplaceName', value: marketplaceName });

            let is3dsEnabled = 'false';
            if (meta.hasOwnProperty('3dsEnabled')) {
                is3dsEnabled = meta['3dsEnabled'].toLowerCase() === 'true' ? 'true' : 'false';
            }

            gatewayConfigs.push({ key: 'is3dsEnabled', value: is3dsEnabled });

            settings = {
                gateway: gateway,
                returnUrl: `${hostName}/checkout/payment-gateway/success?gateway=${gateway}&invoiceNo=${invoiceNo}` + (is3dsEnabled == 'true' ? '&session_id={CHECKOUT_SESSION_ID}' : ''),
                cancelUrl: `${hostName}/payment-gateway/cancel?gateway=${gateway}&invoiceNo=${invoiceNo}`,
                minimumTotal: 0.5,
                accountType: 'id'
            };
        } else if (gateway.startsWith('omise')) {
            gatewayConfigs.push({ key: 'publicKey', value: meta.publickey });
            gatewayConfigs.push({ key: 'secretKey', value: meta.secretkey });

            settings = {
                gateway: gateway,
                returnUrl: `${hostName}/checkout/payment-gateway/success?gateway=${gateway}&invoiceNo=${invoiceNo}`,
                cancelUrl: `${hostName}/payment-gateway/cancel?gateway=${gateway}&invoiceNo=${invoiceNo}`,
                minimumTotal: 0.5,
                accountType: 'id'
            };
        }

        if (gateway.startsWith('paypal')) {
            gatewayConfigs.push({ key: 'username', value: process.env.PAYPAL_USERNAME });
            gatewayConfigs.push({ key: 'password', value: process.env.PAYPAL_PASSWORD });
            gatewayConfigs.push({ key: 'signature', value: process.env.PAYPAL_SIGNATURE });
            gatewayConfigs.push({ key: 'appId', value: process.env.PAYPAL_AppID });
            gatewayConfigs.push({ key: 'feePerOrder', value: process.env.PAYPAL_FEEPERORDER });
            gatewayConfigs.push({ key: 'marketplaceName', value: marketplaceName });

            let invoiceNo = invoiceDetails ? invoiceDetails.InvoiceNo : '';

            settings = {
                gateway: gateway,
                isSandbox: process.env.PAYPAL_SANDBOX,
                returnUrl: `${hostName}/checkout/payment-gateway/success?gateway=${gateway}&invoiceNo=${invoiceNo}`,
                cancelUrl: `${hostName}/payment-gateway/cancel?gateway=${gateway}&invoiceNo=${invoiceNo}`,
                receivedBy: process.env.PAYPAL_RECEIVE_BY
            };
        }

        settings.gatewayConfigs = gatewayConfigs;

        return settings;
    }

    function buildPayees(settings) {
        let payees = [];

        if (invoiceDetails) {
            invoiceDetails.Orders.forEach((order) => {
                order.PaymentDetails.forEach((payment) => {
                    if (payment.Payee.ID === order.MerchantDetail.ID) {
                        let payee = {
                            internalUserId: payment.Payee.ID,
                            currency: payment.CurrencyCode,
                            isPrimary: false,
                            total: payment.Total,
                            fee: payment.Fee,
                            reference: invoiceDetails.InvoiceNo + '/' + order.ID,
                            invoiceNo: invoiceDetails.InvoiceNo,
                            CosmeticNo: payment.CosmeticNo,
                            items: [],
                            gatewayAccount: null,
                            email: payment.Payee.Email
                        };
                        let items = [];

                        order.CartItemDetails.forEach((cart, index) => {
                            items.push({
                                //id: order.ID + ' - ' + cart.ItemDetail.ID,
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
                                //id: order.ID + ' - Freight',
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
                                //id: 'Admin Fee - Order ' + order.ID,
                                id: 'AdminFee',
                                currency: order.CurrencyCode,
                                description: 'Admin Fee',
                                name: 'Fee (Deducted)',
                                price: payment.Fee,
                                quantity: 1
                            });
                        }

                        payee.items = items;

                        if (settings.accountType) {
                            if (paymentGateway.PaymentMethods) {
                                const paymentMethod = paymentGateway.PaymentMethods.find(p => p.UserID == order.MerchantDetail.ID);

                                if (settings.accountType == 'id') {
                                    if (paymentMethod.ClientID) {
                                        payee.gatewayAccount = paymentMethod.ClientID;
                                    }
                                } else {
                                    if (paymentMethod.Account) {
                                        payee.gatewayAccount = paymentMethod.Account;
                                    }
                                }
                            }
                        }

                        payees.push(payee);
                    }
                });
            });
        }

        return payees;
    }

    function buildPayer() {
        if (invoiceDetails) {
            if (invoiceDetails.Orders[0]) {
                const order = invoiceDetails.Orders[0];

                return {
                    firstName: order.ConsumerDetail.FirstName,
                    lastName: order.ConsumerDetail.LastName
                }
            };
        }

        return null;
    }

    const settings = buildSettings();

    return {
        settings: settings,
        payees: buildPayees(settings),
        payer: buildPayer()
    }
}

function promiseUpdatePaymentDetails(invoiceDetails, data, payments) {
    let options = {};
    options.invoiceNo = invoiceDetails.InvoiceNo;
    options.payments = [];

    if (!payments) {
        invoiceDetails.Orders.forEach((order) => {
            // merchant payment
            options.payments.push({
                orderId: order.ID,
                payerId: order.ConsumerDetail.ID,
                payeeId: order.MerchantDetail.ID,
                invoiceNo: invoiceDetails.InvoiceNo,
                gatewayCode: data.gatewayCode,
                payKey: data.payKey,
                status: data.status,
                transactionId: data.transactionId,
                gatewayTimestamp: data.gatewayTimestamp,
                gatewayStatus: data.gatewayStatus,
                gatewayReceiverId: data.gatewayReceiverId,
                gatewaySenderId: data.gatewaySenderId,
                gatewayRef: data.gatewayRef
            });

            // admin payment
            options.payments.push({
                orderId: order.ID,
                payerId: order.ConsumerDetail.ID,
                payeeId: null,
                invoiceNo: invoiceDetails.InvoiceNo,
                gatewayCode: data.gatewayCode,
                payKey: data.payKey,
                status: data.status,
                transactionId: data.transactionId,
                gatewayTimestamp: data.gatewayTimestamp,
                gatewayStatus: data.gatewayStatus,
                gatewayReceiverId: data.gatewayReceiverId,
                gatewaySenderId: data.gatewaySenderId,
                gatewayRef: data.gatewayRef,
                isAdmin: true
            });
        });
    } else {
        payments.forEach((payment) => {
            invoiceDetails.Orders.forEach((order) => {
                if (order.ID == payment.orderId) {
                    options.payments.push({
                        orderId: order.ID,
                        payerId: order.ConsumerDetail.ID,
                        payeeId: payment.payeeId,
                        invoiceNo: invoiceDetails.InvoiceNo,
                        gatewayCode: payment.gatewayCode,
                        payKey: payment.payKey,
                        status: payment.status,
                        transactionId: payment.transactionId,
                        gatewayTimestamp: payment.gatewayTimestamp,
                        gatewayStatus: payment.gatewayStatus,
                        gatewayReceiverId: payment.gatewayReceiverId,
                        gatewaySenderId: payment.gatewaySenderId,
                        gatewayRef: payment.gatewayRef,
                        isAdmin: payment.payeeId == null
                    });
                }
            });
        });
    }

    return new Promise((resolve, reject) => {
        client.Payments.updateMultiplePaymentDetails(options, function (err, result) {
            resolve(result);
        });
    });
}

function promiseUpdateOrderDetails(invoiceDetails, data) {
    let promises = [];

    invoiceDetails.Orders.forEach(order => {
        let promise = new Promise((resolve, reject) => {
            const options = {
                orders: [{
                    orderId: order.ID,
                    fulfilmentStatusID: data.fulfilmentStatusID,
                    paymentStatusID: data.paymentStatusID,
                    balance: data.balance
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

function promiseCreateInvoiceCosmetic(invoiceNo) {
    return new Promise((resolve, reject) => {
        client.Payments.postCreateInvoiceCosmetic({ invoiceNo: invoiceNo }, function (err, result) {
            resolve(result);
        });
    });
}

function updateCustomPaymentTransactionStatus(gateway, invoiceNo, payKey, hashKey, status, callback) {
    const validStatuses = ['success', 'failed'];

    if (gateway && invoiceNo && payKey && hashKey && status && isValidHashKey(gateway, invoiceNo, hashKey) && validStatuses.includes(status.toLowerCase())) {
        status = status.toLowerCase();
        const promiseInvoiceDetails = new Promise((resolve, reject) => {
            client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo, includes: 'Transaction.Orders.PaymentDetails' }, function (err, result) {
                resolve(result);
            });
        });

        const promiseFulfilmentStatuses = new Promise((resolve, reject) => {
            client.Orders.getFulfilmentStatuses(null, (err, statuses) => {
                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                resolve([]);
            });
        });

        const promisePaymentStatuses = new Promise((resolve, reject) => {
            client.Payments.getPaymentStatuses(null, (err, statuses) => {
                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                resolve([]);
            });
        });

        Promise.all([promiseInvoiceDetails, promiseFulfilmentStatuses, promisePaymentStatuses]).then((responses) => {
            const invoiceDetails = responses[0];
            const fulfilmentStatuses = responses[1];
            const paymentStatuses = responses[2];

            let isValid = true;

            invoiceDetails.Orders.forEach(function (order) {
                order.PaymentDetails.forEach(function (payment) {
                    if (payment.GatewayPayKey != payKey || (payment.Status && payment.Status.toLowerCase() == 'success')) {
                        isValid = false;
                    }
                })
            });

            if (isValid) {
                let promises = [];

                if (status == 'success') {
                    const acknowledgedFulfilmentStatus = fulfilmentStatuses.find(s => s.Name === "Acknowledged" && s.IsImplementationStatus == false);
                    const paidPaymentStatus = paymentStatuses.find(s => s.Name === "Paid" && s.IsImplementationStatus == false);
                    const data = {
                        balance: 0,
                    };
                    if (acknowledgedFulfilmentStatus && acknowledgedFulfilmentStatus.ID) {
                        data.fulfilmentStatusID = acknowledgedFulfilmentStatus.ID
                    }
                    if (paidPaymentStatus && paidPaymentStatus.ID) {
                        data.paymentStatusID = paidPaymentStatus.ID
                    }
                    promises = promiseUpdateOrderDetails(invoiceDetails, data);
                } else {
                    const data = {
                        paymentStatusID: null,
                    };

                    const failedPaymentStatus = paymentStatuses.find(s => s.Name === "Failed" && s.IsImplementationStatus == false);
                    if (failedPaymentStatus && failedPaymentStatus.ID) {
                        data.paymentStatusID = failedPaymentStatus.ID;
                    }
                    promises = promiseUpdateOrderDetails(invoiceDetails, data);
                }

                Promise.all(promises).then((responses) => {
                    const paymentStatus = status == 'success' ? 'Success' : 'Failed';
                    const timestamp = Math.floor(new Date().getTime() / 1000);
                    const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, { status: paymentStatus, transactionId: payKey, gatewayTimestamp: timestamp, gatewayStatus: paymentStatus });

                    Promise.all([promisePayment]).then((responses) => {
                        if (status == 'success') {
                            const user = invoiceDetails.Orders[0].ConsumerDetail;
                            const promiseOffer = getOfferByCartItemID(user.ID, invoiceDetails.Orders[0].CartItemDetails[0].ID);

                            Promise.all([promiseOffer]).then((responses) => {
                                const offer = responses[0];

                                if (offer && !offer.Accepted && !offer.Declined && offer.MessageType != 'CANCELLED') {
                                    const message = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
                                        `<p class=\"chat-system-generated-msg\" data-msg-type=\"accepted-quotation\">Quotation has been accepted!</p>`;

                                    const promiseQuotation = new Promise((resolve, reject) => {
                                        const options = {
                                            userId: user.ID,
                                            quotationId: offer.ID,
                                            accepted: true,
                                            declined: false,
                                            messageType: "ACCEPTED",
                                            message: message
                                        };

                                        client.Quotations.updateQuotation(options, (err, result) => {
                                            resolve(result);
                                        });
                                    });

                                    const promiseChat = new Promise((resolve, reject) => {
                                        client.Chat.getMessages(user.ID, offer.ChannelID, (err, result) => {
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
                                                    channelId: offer.ChannelID,
                                                    message: message
                                                };

                                                client.Chat.createChannelMessage(options, (err, result) => {
                                                    resolve(result);
                                                });
                                            });

                                            Promise.all([promiseNewMessage]).then((responses) => {
                                                return callback({ success: true });
                                            });
                                        } else {
                                            callback({ success: true });
                                        }
                                    });
                                } else {
                                    callback({ success: true });
                                }
                            });
                        } else {
                            callback({ success: true });
                        }
                    });
                });
            } else {
                callback({ success: false, error: 'Invalid request!' });
            }
        });
    } else {
        callback({ success: false, error: 'Invalid request!' });
    }
}

function getApprovalWorkflowsAndDepartments(userId, callback) {
    const pluginId = process.env.APPROVAL_PLUGIN;
    if (!pluginId) callback({ departments: null, workflows: null });
    const userQuery = [{
        Name: "UserID",
        Operator: "equal",
        Value: userId,
    }];

    const promiseApprovalDepartments = new Promise((resolve, reject) => {
        const options = { pluginId, query: [...userQuery], tableName: "Departments" };
        client.CustomTables.searchCustomTable(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseApprovalWorkflows = new Promise((resolve, reject) => {
        const options = { pluginId, query: [...userQuery], tableName: "Workflows" };
        options.query.push({
            Name: "Active",
            Operator: "equal",
            Value: 1,
        });
        client.CustomTables.searchCustomTable(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseApprovalWorkflows, promiseApprovalDepartments]).then(responses => {
        const workflows = responses[0];
        const departments = responses[1];
        callback({ workflows, departments });
    });
}

function getAdminShippingOptions() {
    return new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingOptions(function (err, shipping) {
            resolve({ isAdminShippingOptions: true, shipping });
        });
    });
}

function getMerchantShippingOptions(ID) {
    return new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingMethods(ID, function (err, shipping) {
            resolve({ merchantID: ID, shipping });
        });
    });
}

function getItemDetails(ID) {
    return new Promise((resolve, reject) => {
        const options = {
            itemId: ID,
            activeOnly: true
        };

        client.Items.getItemDetails(options, function (err, details) {
            resolve(details);
        });
    });
}

function getUserDetails(ID) {
    return new Promise((resolve, reject) => {
        let options = {
            userId: ID,
            includes: null
        };
        client.Users.getUserDetails(options, function (err, result) {
            resolve(result)
        });
    });
}

function getOfferByCartItemID(userId, cartItemId) {
    return new Promise((resolve, reject) => {
        const options = {
            userId,
            cartItemId,
            includes: ["PaymentTerm"],
        };
        client.Chat.getOfferByCartItemId(options, function (err, result) {
            resolve(result);
        });
    });
}

checkoutRouter.get('/review', authenticated, function (req, res) {
    let currentUser = req.user;
    let invoiceNo = req.query['invoiceNo'];
    const appString = 'checkout-review';
    let comparisonId = req.query['comparisonId'];

    if (!req.user) {
        //Guest Users
        if (req.cookies && req.cookies.guestUserID) {
            currentUser = {
                ID: req.cookies.guestUserID,
                Guest: true
            }
        }
    }

    let promiseInvoiceNumberDetails = new Promise((resolve, reject) => {
        client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo }, function (err, invoiceNumberDetails) {
            resolve(invoiceNumberDetails);
        });
    });

    Promise.all([promiseInvoiceNumberDetails]).then((responses) => {
        if (process.env.TEMPLATE === 'trillia') {
            const invoiceDetails = responses[0];
            const merchantDetail = invoiceDetails.Orders[0].MerchantDetail;
            const itemDetail = invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail;

            const promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
                client.ShippingMethods.getShippingOptions(function (err, shipping) {
                    resolve(shipping);
                });
            });

            const promiseShippingOptionsMerchant = new Promise((resolve, reject) => {
                client.ShippingMethods.getShippingMethods(merchantDetail.ID, function (err, shipping) {
                    resolve(shipping);
                });
            });

            const promiseParentItemDetail = new Promise((resolve, reject) => {
                if (itemDetail.ParentID) {
                    const options = {
                        itemId: itemDetail.ParentID,
                        activeOnly: true
                    };

                    client.Items.getItemDetails(options, function (err, result) {
                        resolve(result);
                    });
                } else {
                    resolve(null);
                }
            });

            const promiseItem = new Promise((resolve, reject) => {
                const options = {
                    itemId: itemDetail.ID,
                    activeOnly: true
                };

                client.Items.getItemDetails(options, function (err, details) {
                    resolve(details);
                });
            });

            const promiseCurrentUserAddresses = new Promise((resolve, reject) => {
                client.Addresses.getUserAddresses(currentUser.ID, function (err, addresses) {
                    resolve(addresses);
                });
            });

            const promiseOffer = new Promise((resolve, reject) => {
                const options = {
                    userId: currentUser.ID,
                    cartItemId: invoiceDetails.Orders[0].CartItemDetails[0].ID
                }
                client.Chat.getOfferByCartItemId(options, function (err, result) {
                    resolve(result);
                });
            });

            const promiseMerchantDetail = new Promise((resolve, reject) => {
                let options = {
                    userId: merchantDetail.ID,
                    includes: null
                };
                client.Users.getUserDetails(options, function (err, result) {
                    resolve(result)
                });
            });

            Promise.all([promiseShippingOptionsAdmin, promiseShippingOptionsMerchant, promiseParentItemDetail, promiseItem, promiseCurrentUserAddresses, promiseMerchantDetail, promiseOffer]).then((responses) => {
                const allShippingOptions = responses[0].concat(responses[1]);
                const parentItemDetail = responses[2];
                const item = responses[3];
                const userAddresses = responses[4];
                const merchant = responses[5];
                const offer = responses[6];

                let currentUserCountry = '';
                if (userAddresses != null && userAddresses.TotalRecords > 0) {
                    currentUserCountry = userAddresses.Records[userAddresses.Records.length - 1].Country;
                }

                let itemShippingMethods = (itemDetail.ShippingMethods || item.ShippingMethods || []);
                let itemPickupAddresses = (itemDetail.PickupAddresses || item.PickupAddresses || []);
                let shippingOptions = [];
                let pickupOptions = [];

                if (parentItemDetail) {
                    itemShippingMethods = (parentItemDetail.ShippingMethods || []);
                    itemPickupAddresses = (parentItemDetail.PickupAddresses || []);
                }

                let itemWeight = 0;
                if (parentItemDetail) {
                    if (parentItemDetail.CustomFields && parentItemDetail.CustomFields.length > 0) {
                        const weightProperty = parentItemDetail.CustomFields.find(p => p.Name.toLowerCase() === 'weight');
                        if (weightProperty && weightProperty.Values && weightProperty.Values.length > 0) {
                            itemWeight = parseFloat(weightProperty.Values[0]);
                        }
                    }
                } else {
                    if (item.CustomFields && item.CustomFields.length > 0) {
                        const weightProperty = item.CustomFields.find(p => p.Name.toLowerCase() === 'weight');
                        if (weightProperty && weightProperty.Values && weightProperty.Values.length > 0) {
                            itemWeight = parseFloat(weightProperty.Values[0]);
                        }
                    }
                }

                let unavailableShippingMethodIds = [];

                if (merchant) {
                    if (merchant.CustomFields) {
                        const deliveryMethodAvailability = merchant.CustomFields.find(c => c.Name == 'DeliveryMethodAvailability');

                        if (deliveryMethodAvailability && deliveryMethodAvailability.Values && deliveryMethodAvailability.Values.length > 0) {
                            const value = JSON.parse(deliveryMethodAvailability.Values[0]);

                            if (value.UnavailableDeliveryMethods) {
                                value.UnavailableDeliveryMethods.forEach(function (delivery) {
                                    if (delivery.ShippingMethodGuid) {
                                        unavailableShippingMethodIds.push(delivery.ShippingMethodGuid);
                                    }
                                });
                            }
                        }
                    }
                }

                itemShippingMethods.forEach(function (shipping) {
                    var shippingMethod = allShippingOptions.find(s => s.ID == shipping.ID);

                    if (shippingMethod && !unavailableShippingMethodIds.includes(shippingMethod.ID)) {
                        shippingMethod.CustomFields.forEach(function (customField) {
                            const customFieldValue = JSON.parse(customField.Values);

                            let splittedCountries = [];
                            if (!customFieldValue.IsAllCountries) {
                                if (customFieldValue.SelectedCountries) {
                                    var selectedCountries = JSON.stringify(customFieldValue.SelectedCountries);
                                    var countryCodes = selectedCountries.match(/"Code":"(.*?)"/g).map(function (code) {
                                        return code.replace('"Code":"', '').replace('"', '');
                                    });
                                    splittedCountries = countryCodes.map(el => el.trim().toLowerCase());
                                }
                                else {
                                    if (customFieldValue.Countries.indexOf(';') >= 0) {
                                        splittedCountries = customFieldValue.Countries.split(';');
                                    } else {
                                        splittedCountries = customFieldValue.Countries.split(',');
                                    }
                                    splittedCountries = splittedCountries.map(el => el.trim().toLowerCase());
                                }
                            }

                            let splittedUserCountry = [];
                            if (currentUserCountry.indexOf(',') >= 0) {
                                splittedUserCountry = currentUserCountry.split(',');
                                splittedUserCountry = splittedUserCountry.map(el => el.trim().toLowerCase());
                            }

                            if (currentUserCountry !== "" && customFieldValue.SelectedCountries) {
                                currentUserCountry = userAddresses.Records[userAddresses.Records.length - 1].CountryCode;
                            }

                            let isAddShipping = false;
                            if (customFieldValue.IsAllCountries || splittedCountries.indexOf(currentUserCountry.toLowerCase()) >= 0) {
                                isAddShipping = true;
                            } else {
                                if (splittedUserCountry.length > 0) {
                                    var index = splittedCountries.indexOf(splittedUserCountry[1]);
                                    if (index > 0 && splittedCountries[index - 1] == splittedUserCountry[0]) {
                                        isAddShipping = true;
                                    }
                                }
                            }

                            if (isAddShipping) {
                                const calculationType = customFieldValue.CalculationType;
                                let cartItem = invoiceDetails.Orders[0].CartItemDetails[0];

                                const total = calculationType == 'weight'
                                    ? itemWeight * cartItem.Quantity
                                    : invoiceDetails.Total;

                                if (total) {
                                    customFieldValue.Rates.forEach(function (rate) {
                                        if (parseFloat(rate.MinimumRange) <= total && (rate.Onwards == 'true' || (parseFloat(rate.MaximumRange) >= total))) {
                                            let shippingOptionModel = {
                                                ShippingData: shippingMethod,
                                                ShippingCost: rate.Cost,
                                                IsPickup: false,
                                                CurrencyCode: invoiceDetails.CurrencyCode
                                            };
                                            shippingOptions.push(shippingOptionModel);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });

                itemPickupAddresses.forEach(function (pickup) {
                    let pickupAddressModel = {
                        Id: pickup.ID,
                        Name: pickup.Line1,
                        IsPickup: true,
                        CurrencyCode: invoiceDetails.CurrencyCode
                    };
                    pickupOptions.push(pickupAddressModel);
                });

                let firstName = '';
                let lastName = '';
                let address1 = "";
                let address2 = "";
                let country = "";
                let state = "";
                let city = "";
                let postalcode = "";
                if (invoiceDetails.Orders[0].DeliveryToAddress) {
                    let nameSplit = "";
                    if (invoiceDetails.Orders[0].DeliveryToAddress.Name) {
                        nameSplit = invoiceDetails.Orders[0].DeliveryToAddress.Name.split('|');
                    }

                    firstName = nameSplit[0];
                    lastName = nameSplit[1];
                    address1 = invoiceDetails.Orders[0].DeliveryToAddress.Line1;
                    address2 = invoiceDetails.Orders[0].DeliveryToAddress.Line2;
                    country = invoiceDetails.Orders[0].DeliveryToAddress.Country;
                    state = invoiceDetails.Orders[0].DeliveryToAddress.State;
                    city = invoiceDetails.Orders[0].DeliveryToAddress.City;
                    postalcode = invoiceDetails.Orders[0].DeliveryToAddress.PostCode;
                }

                let addressModel = {
                    FirstName: firstName,
                    LastName: lastName,
                    Address1: address1,
                    Address2: address2,
                    Country: country,
                    State: state,
                    City: city,
                    PostalCode: postalcode
                }

                let merchantDetail = invoiceDetails.Orders[0].MerchantDetail;

                if (offer) {
                    invoiceDetails.Orders[0].CartItemDetails[0].SubTotal = offer.Total;
                }

                const s = Store.checkoutReviewPageStore({
                    userReducer: { user: currentUser },
                    settingsReducer: {
                        addressModel: addressModel,
                        invoiceDetails: invoiceDetails,
                        shippingOptions: shippingOptions,
                        comparisonId: comparisonId,
                        pickupOptions: pickupOptions
                    },
                    merchantReducer: { user: merchantDetail }
                });

                const reduxState = s.getState();

                const checkoutReview = reactDom.renderToString(<CheckoutReviewComponent user={currentUser}
                    invoiceDetails={invoiceDetails}
                    addressModel={addressModel}
                    merchantDetail={merchantDetail}
                    shippingOptions={shippingOptions} />);

                let seoTitle = 'Checkout Page';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                res.send(template('page-review', seoTitle, checkoutReview, appString, reduxState));
            });
        } else {
            const invoiceDetails = responses[0];
            const { Orders } = invoiceDetails;
            let merchantIds = [];
            let shippingOptions = [];
            let pickupOptions = [];
            if (Orders && Orders.length > 0) {
                let itemDetailIds = [];
                let parentItemIds = [];
                // create arrays of IDs (merchant, item detail, parent item)
                Orders.map(o => {
                    merchantIds.push(o.MerchantDetail.ID);
                    o.CartItemDetails.map(c => {
                        itemDetailIds.push(c.ItemDetail.ID);
                        if (c.ItemDetail.ParentID && !parentItemIds.includes(c.ItemDetail.ParentID))
                            parentItemIds.push(c.ItemDetail.ParentID);
                    })
                });

                const promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
                    client.ShippingMethods.getShippingOptions(function (err, shipping) {
                        resolve({ isAdminShippingOptions: true, shipping });
                    });
                });

                const promiseShippingOptionsMerchant = ID =>
                    new Promise((resolve, reject) => {
                        client.ShippingMethods.getShippingMethods(ID, function (err, shipping) {
                            resolve({ merchantID: ID, shipping });
                        });
                    });
                const promiseItem = ID =>
                    new Promise((resolve, reject) => {
                        const options = {
                            itemId: ID,
                            activeOnly: true
                        };

                        client.Items.getItemDetails(options, function (err, details) {
                            resolve(details);
                        });
                    });
                const promiseParentItem = ID =>
                    new Promise((resolve, reject) => {
                        const options = {
                            itemId: ID,
                            activeOnly: true
                        };
                        client.Items.getItemDetails(options, function (err, result) {
                            resolve(result);
                        });
                    });
                const promiseCurrentUserAddresses = new Promise((resolve, reject) => {
                    client.Addresses.getUserAddresses(currentUser.ID, function (err, addresses) {
                        resolve(addresses);
                    });
                });

                const promiseMerchantDetail = ID => new Promise((resolve, reject) => {
                    let options = {
                        userId: ID,
                        includes: null
                    };
                    client.Users.getUserDetails(options, function (err, result) {
                        resolve(result)
                    });
                });
                const promiseAllMerchantDetail = Promise.all(merchantIds.map(ID => promiseMerchantDetail(ID)));
                // shipping options of each merchant
                const promiseShippingOptionsAllMerchants = Promise.all(merchantIds.map(ID => promiseShippingOptionsMerchant(ID)));
                // get populated item & parent item info of items in invoice
                const promiseInvoiceItems = Promise.all(itemDetailIds.map(ID => promiseItem(ID)));
                const promiseInvoiceParentItems = Promise.all(parentItemIds.map(ID => promiseParentItem(ID)));

                Promise.all([promiseShippingOptionsAdmin, promiseShippingOptionsAllMerchants, promiseInvoiceItems, promiseInvoiceParentItems, promiseCurrentUserAddresses, promiseAllMerchantDetail]).then(responses => {

                    const allShippingOptions = [responses[0], ...responses[1]];
                    const invoiceItems = responses[2];
                    const invoiceParentItems = responses[3];
                    const userAddresses = responses[4];
                    const merchantList = responses[5];
                    const invoiceItemDetails = [];
                    const invoiceCartItemDetails = [];
                    Orders.map(o => {
                        invoiceCartItemDetails.push(o.CartItemDetails);
                        o.CartItemDetails.map(cartItem => invoiceItemDetails.push(cartItem.ItemDetail))
                    });

                    let currentUserCountry = '';
                    if (userAddresses && userAddresses.TotalRecords > 0) {
                        currentUserCountry = userAddresses.Records[userAddresses.TotalRecords - 1].Country;
                    }

                    const itemShippingMethodsMap = new Map();
                    const itemPickupAddressesMap = new Map();
                    const itemWeightMap = new Map();

                    // add data to a map of item's delivery and weight
                    itemDetailIds.map(id => {
                        let itemDetail = invoiceItemDetails.find(itemDetail => itemDetail.ID === id);
                        let parentItem = invoiceParentItems.find(parent => parent.ID === itemDetail.ParentID);
                        let item = invoiceItems.find(item => id === item.ID);
                        // delivery options
                        if (parentItem) {
                            itemShippingMethodsMap.set(id, parentItem.ShippingMethods || []);
                            itemPickupAddressesMap.set(id, parentItem.PickupAddresses || []);
                        } else {
                            itemShippingMethodsMap.set(id, itemDetail.ShippingMethods || item.ShippingMethods);
                            itemPickupAddressesMap.set(id, itemDetail.PickupAddresses || item.PickupAddresses);
                        }
                        // item weight
                        let weightProperty = null;
                        let obj = null;
                        if (parentItem && parentItem.CustomFields && parentItem.CustomFields.length > 0) {
                            obj = parentItem
                        } else if (item.CustomFields && item.CustomFields.length > 0) {
                            obj = item;
                        }
                        weightProperty = obj ? obj.CustomFields.find(cf => cf.Name.toLowerCase() === 'weight') : null
                        if (weightProperty && weightProperty.Values && weightProperty.Values.length > 0) {
                            itemWeightMap.set(id, parseFloat(weightProperty.Values[0]));
                        }
                    });

                    const getShippingMethod = ID => {
                        let allOptions = allShippingOptions.map(option => option.shipping);
                        let allFlatOpts = [];
                        if (allOptions && allOptions.length > 0 && allOptions.every(x => Array.isArray(x))) {
                            allFlatOpts = [].concat.apply([], allOptions);
                        }
                        const shipping = allFlatOpts.find(opt => opt.ID === ID);
                        if (shipping && shipping.CustomFields && shipping.CustomFields.length > 0) {
                            return shipping;
                        }
                        return null;
                    }

                    // get unavailable delivery methods for each merchant 
                    const merchantUnavailableDeliveryOpts = new Map();
                    merchantList.map(merchant => {
                        const { CustomFields } = merchant;
                        const unavailableDel = [];
                        if (CustomFields && CustomFields.length > 0) {
                            let deliveryMethodAvailability = CustomFields.find(c => c.Name == 'DeliveryMethodAvailability');
                            if (deliveryMethodAvailability && deliveryMethodAvailability.Values && deliveryMethodAvailability.Values.length > 0) {
                                if (deliveryMethodAvailability.Values[0] != '') {
                                    const value = JSON.parse(deliveryMethodAvailability.Values[0]);
                                    const { UnavailableDeliveryMethods } = value;
                                    if (UnavailableDeliveryMethods) {
                                        UnavailableDeliveryMethods.map(del => {
                                            if (del.ShippingMethodGuid) unavailableDel.push(del.ShippingMethodGuid);
                                        })
                                    }
                                }
                            }
                        }
                        merchantUnavailableDeliveryOpts.set(merchant.ID, unavailableDel);
                    });
                    // key: order id, values: arr of shipping options
                    const orderMatchedShipping = new Map();
                    Orders.map(order => {
                        let matchedShipping = [];
                        order.CartItemDetails.map(cartItem => {
                            let itemId = cartItem.ItemDetail.ID;
                            // get shipping options assigned to item
                            const shippingList = itemShippingMethodsMap.get(itemId);

                            if (shippingList && shippingList.length > 0) {
                                // check whether to add shipping based on user location
                                for (let shipping of shippingList) {
                                    const shippingMethod = getShippingMethod(shipping.ID);
                                    const shippingCustomFields = shippingMethod !== null ? shippingMethod.CustomFields : null;
                                    const merchantID = order.MerchantDetail.ID;
                                    const unavailableDelOfMerchant = merchantUnavailableDeliveryOpts.get(merchantID);
                                    const isAvailableMerchantDelOpt = typeof unavailableDelOfMerchant.find(x => x === shippingMethod.ID) == 'undefined';

                                    if (shippingCustomFields && isAvailableMerchantDelOpt) {
                                        shippingCustomFields.map(cf => {
                                            const customFieldValue = JSON.parse(cf.Values);
                                            let splittedCountries = [];
                                            if (!customFieldValue.IsAllCountries) {
                                                if (customFieldValue.SelectedCountries) {
                                                    let selectedCountries = JSON.stringify(customFieldValue.SelectedCountries);
                                                    let countryCodes = selectedCountries.match(/"Code":"(.*?)"/g).map(function (code) {
                                                        return code.replace('"Code":"', '').replace('"', '');
                                                    });
                                                    splittedCountries = countryCodes.map(el => el.trim().toLowerCase());
                                                } else {
                                                    if (customFieldValue.Countries.indexOf(';') >= 0) {
                                                        splittedCountries = customFieldValue.Countries.split(';');
                                                    } else {
                                                        splittedCountries = customFieldValue.Countries.split(',');
                                                    }
                                                    splittedCountries = splittedCountries.map(el => el.trim().toLowerCase());
                                                }
                                            }

                                            let splittedUserCountry = [];
                                            if (currentUserCountry.indexOf(',') >= 0) {
                                                splittedUserCountry = currentUserCountry.split(',');
                                                splittedUserCountry = splittedUserCountry.map(el => el.trim().toLowerCase());
                                            }

                                            if (currentUserCountry !== "" && customFieldValue.SelectedCountries) {
                                                currentUserCountry = userAddresses.Records[userAddresses.Records.length - 1].CountryCode;
                                            }

                                            let isAddShipping = false;
                                            if (customFieldValue.IsAllCountries || splittedCountries.indexOf(currentUserCountry.toLowerCase()) >= 0) {
                                                isAddShipping = true;
                                            }
                                            else {
                                                if (splittedUserCountry.length > 0) {
                                                    let index = splittedCountries.indexOf(splittedUserCountry[1]);
                                                    if (index > 0 && splittedCountries[index - 1] == splittedUserCountry[0]) {
                                                        isAddShipping = true;
                                                    }
                                                }
                                            }
                                            const alreadyExists = matchedShipping.find(s => s.shippingMethod.ID === shippingMethod.ID);
                                            if (isAddShipping && !alreadyExists) {
                                                matchedShipping.push({
                                                    calculationType: customFieldValue.CalculationType,
                                                    shippingMethod,
                                                    rates: customFieldValue.Rates
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        orderMatchedShipping.set(order.ID, matchedShipping)
                    });

                    Orders.map(order => {
                        const { ID, CartItemDetails, MerchantDetail } = order;
                        if (ID) {
                            // filter shipping options for an order based on range total
                            const orderShippingArr = orderMatchedShipping.get(ID);
                            if (orderShippingArr && orderShippingArr.length > 0) {
                                let shippingOptionModels = [];
                                orderShippingArr.map(orderShipping => {
                                    const { calculationType, shippingMethod, rates } = orderShipping;
                                    const itemIDs = [];
                                    let totalQuantity = 0;
                                    CartItemDetails.map(c => {
                                        itemIDs.push(c.ItemDetail.ID);
                                        totalQuantity += parseFloat(c.Quantity) || 0;
                                    });

                                    let totalWeight = 0;
                                    itemIDs.map(id => totalWeight += itemWeightMap.get(id) || 0);

                                    const total = calculationType == 'weight'
                                        ? totalWeight * totalQuantity
                                        : order.Total;

                                    if (total) {
                                        rates.map(rate => {
                                            const { MinimumRange, Onwards, MaximumRange } = rate;
                                            if (parseFloat(MinimumRange) <= total && (Onwards == 'true' || parseFloat(MaximumRange) >= total)) {
                                                let shippingOptionModel = {
                                                    ShippingData: orderShipping.shippingMethod,
                                                    ShippingCost: rate.Cost,
                                                    IsPickup: false,
                                                    CurrencyCode: order.CurrencyCode
                                                };
                                                shippingOptionModels.push(shippingOptionModel);
                                            }
                                        })
                                    }
                                });
                                shippingOptions.push({ Merchant: order.MerchantDetail, shippingOptions: shippingOptionModels });
                            }
                            //for pickup addresses
                            const orderPickups = [];
                            CartItemDetails.map(cartItem => {
                                const pickups = itemPickupAddressesMap.get(cartItem.ItemDetail.ID);
                                if (pickups && pickups.length > 0) {
                                    pickups.map(pickup => {
                                        const alreadyExists = orderPickups.find(o => o.ID === pickup.ID);
                                        if (!alreadyExists) {
                                            orderPickups.push({
                                                ID: pickup.ID,
                                                Name: pickup.Line1,
                                                IsPickup: true,
                                                CurrencyCode: order.CurrencyCode
                                            });
                                        }
                                    });
                                }
                            });
                            pickupOptions.push({ Merchant: order.MerchantDetail, pickupOptions: orderPickups });
                        }
                    })

                    const addressModel = getDeliveryToAddress(invoiceDetails.Orders[0]);

                    const s = Store.checkoutReviewPageStore({
                        userReducer: { user: currentUser },
                        settingsReducer: {
                            addressModel: addressModel,
                            invoiceDetails: invoiceDetails,
                            shippingOptions: shippingOptions,
                            pickupOptions: pickupOptions
                        },
                    });

                    const reduxState = s.getState();

                    const checkoutReview = reactDom.renderToString(<CheckoutReviewComponent user={currentUser}
                        invoiceDetails={invoiceDetails}
                        addressModel={addressModel}
                        shippingOptions={shippingOptions}
                        pickupOptions={pickupOptions}
                    />);

                    let seoTitle = 'Checkout Page';
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                    res.send(template('page-review', seoTitle, checkoutReview, appString, reduxState));
                });
            }
        }
    });
});

checkoutRouter.get('/delivery', authenticated, function (req, res) {

    let user = req.user;
    let invoiceNo = req.query['invoiceNo'];
    let comparisonId = req.query['comparisonId'];

    if (!req.user) {
        //Guest Users
        if (req.cookies && req.cookies.guestUserID) {
            user = {
                ID: req.cookies.guestUserID,
                Guest: true
            }
        }
    }

    let promiseAddresses = new Promise((resolve, reject) => {
        client.Addresses.getUserAddresses(user.ID, function (err, addresses) {
            resolve(addresses);
        });
    });

    let promiseInvoiceNumberDetails = new Promise((resolve, reject) => {
        client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo }, function (err, invoiceNumberDetails) {
            resolve(invoiceNumberDetails);
        });
    });

    Promise.all([promiseAddresses, promiseInvoiceNumberDetails]).then((responses) => {
        const appString = 'checkout-delivery';
        const context = {};
        let addresses = responses[0];
        let invoiceDetails = responses[1];

        const s = Store.createSettingsStore({
            settingsReducer: {
                addresses: addresses.Records,
                invoiceDetails: invoiceDetails,
                comparisonId: comparisonId
            },
            userReducer: {
                user: user
            }
        });
        const reduxState = s.getState();
        const checkOutDelivery = reactDom.renderToString(<CheckoutDeliveryComponent user={user}
            addresses={addresses.Records} invoiceDetails={invoiceDetails}
            comparisonId={comparisonId} />);


        let seoTitle = 'Delivery Page';
        if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }

        res.send(template('page-delivery', seoTitle, checkOutDelivery, appString, reduxState));
    });

});

checkoutRouter.post('/updateCheckoutSelectedDeliveryAddressOnePage', function (req, res) {

    //Validations
    if (req.body) {
        let promisesItems = [];
        req.body.forEach(function (obj) {

            if (obj.itemIDs) {

                promisesItems = Promise.all(obj.itemIDs.map(id =>
                    new Promise((resolve, reject) =>
                        client.Items.getItemDetails({
                            itemId: id,
                            activeOnly: false
                        }, function (err, details) {
                            resolve({ details });
                        })
                    )
                ));
            }
            if (obj.merchantID || obj.consumerID) {
                const merchant = {
                    token: null,
                    userId: obj.merchantID,
                    includes: ''
                };
                const consumer = {
                    token: null,
                    userId: obj.consumerID,
                    includes: ''
                };
                let promiseMerchantDetails = new Promise((resolve, reject) => {
                    client.Users.getUserDetails(merchant, function (err, details) {
                        resolve(details);
                    });
                });

                let promiseConsumerDetails = new Promise((resolve, reject) => {
                    client.Users.getUserDetails(consumer, function (err, details) {
                        resolve(details);
                    });
                });

                Promise.all([promiseMerchantDetails, promiseConsumerDetails, promisesItems]).then((responses) => {
                    let merchant = responses[0];
                    let consumer = responses[1];
                    let items = responses[2];
                    if (merchant.Visible === false) {
                        res.send("INVALID");
                        return;
                    }
                    if (consumer.Visible === false) {
                        res.send("INVALID");
                        return;
                    }

                    if (items) {
                        items.forEach(function (item) {
                            if (item.details.Active === false || item.details.IsVisibleToCustomer === false || item.details.IsAvailable === false) {
                                res.send("INVALID");
                                return;
                            }
                        });

                    }
                });
            }
        });

        const promiseOrderStatuses = new Promise((resolve, reject) => {
            client.Orders.getStatuses(null, (err, statuses) => {
                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                resolve([]);
            });
        });

        const promisePaymentStatuses = new Promise((resolve, reject) => {
            client.Payments.getPaymentStatuses(null, (err, statuses) => {
                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                resolve([]);
            });
        });

        Promise.all([promiseOrderStatuses, promisePaymentStatuses]).then((responses) => {
            const orderStatuses = responses[0];
            const paymentStatuses = responses[1];

            // use status IDs in updating order's status
            req.body.forEach(order => {
                const { orderStatus, paymentStatus } = order;
                if (orderStatus && orderStatus.length > 0) {
                    const status = orderStatuses.find(s => s.Name.toLowerCase() === orderStatus.toLowerCase() && s.IsImplementationStatus == false);
                    if (status && status.ID) {
                        order.orderStatusID = status.ID;
                    }
                    delete order.orderStatus;
                }

                if (paymentStatus && paymentStatus.length > 0) {
                    const status = paymentStatuses.find(s => s.Name.toLowerCase() === paymentStatus.toLowerCase() && s.IsImplementationStatus == false);
                    if (status && status.ID) {
                        order.paymentStatusID = status.ID;
                    }
                    delete order.paymentStatus;
                }
            })


            const promiseUpdateOrderDeliveryAddress = new Promise((resolve, reject) => {
                const options = {
                    orders: req.body
                };
                client.Orders.updateOrderDetailsOnePage(options, function (err, result) {
                    resolve(result);
                });
            });

            Promise.all([promiseUpdateOrderDeliveryAddress]).then((responses) => {
                res.send(responses[0]);
            });
        });
    }
});

checkoutRouter.post('/updateCheckoutSelectedDeliveryAddress', function (req, res) {
    let orderID = req.body.orderID;
    let addressID = req.body.addressID;

    let promiseUpdateOrderDeliveryAddress = new Promise((resolve, reject) => {
        const options = {
            orders: [{
                orderId: orderID,
                deliveryToAddressId: addressID
            }]
        };
        client.Orders.updateOrderDetails(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdateOrderDeliveryAddress]).then((responses) => {
        res.send(responses[0]);
    });
});

checkoutRouter.get('/transaction-complete', authenticated, function (req, res) {
    const invoiceNo = req.query['invoiceNo'];
    const user = req.user;
    const appString = 'checkout-transaction-complete';

    const promiseInvoiceDetails = new Promise((resolve, reject) => {
        client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo }, function (err, invoiceNumberDetails) {
            resolve(invoiceNumberDetails);
        });
    });

    Promise.all([promiseInvoiceDetails]).then((responses) => {
        const invoiceDetails = responses[0];

        const s = Store.checkoutTransactionCompletePageStore({
            settingsReducer: {
                user: user,
                invoiceDetails: invoiceDetails
            },
            userReducer: {
                user: user,
            },
        });

        const transactionComplete = reactDom.renderToString(
            <TransactionCompletePage
                invoiceDetails={invoiceDetails}
                categories={[]}
                user={user}
            />
        );

        const reduxState = s.getState();

        let seoTitle = 'Transaction Complete';
        if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }

        res.send(template('page-transaction-complete', seoTitle, transactionComplete, appString, reduxState));
    });
});

checkoutRouter.get('/one-page-checkout', authenticated, isAuthorizedToAccessViewPage(viewCheckoutData), function (req, res) {
    let currentUser = req.user;
    if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') {
        let invoiceNo = req.query['invoiceNo'];
        let comparisonId = req.query['comparisonId'];
        let isGuest = false;
        if (!req.user || (req.user && !req.user.Email)) {
            //Guest Users
            if (req.cookies && req.cookies.guestUserID) {
                isGuest = true;
                currentUser = {
                    ID: req.cookies.guestUserID,
                    Guest: true
                }
            }
        }

        const promiseInvoiceNumberDetails = new Promise((resolve, reject) => {
            client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo }, function (err, invoiceNumberDetails) {
                resolve(invoiceNumberDetails);
            });
        });

        const promiseCurrentUserAddresses = new Promise((resolve, reject) => {
            client.Addresses.getUserAddresses(currentUser.ID, function (err, addresses) {
                resolve(addresses);
            });
        });
        Promise.all([promiseInvoiceNumberDetails, promiseCurrentUserAddresses]).then((responses) => {
            const appString = 'one-page-checkout';
            const context = {};
            let invoiceDetails = responses[0];
            if (!invoiceDetails || (invoiceDetails && (!invoiceDetails.Orders || invoiceDetails.Orders.length == 0))) return res.send("Orders not found.");
            const { Orders } = invoiceDetails;

            let addresses = responses[1];
            let currentUserCountry = '';
            if (addresses != null && addresses.TotalRecords > 0) {
                currentUserCountry = addresses.Records[addresses.Records.length - 1].Country;
            }

            let merchantIds = [];
            let itemDetailIds = [];
            let parentItemIds = [];
            let pickupOptions = [];
            let shippingOptions = [];
            let invoiceCartItemDetails = [];
            let invoiceItemDetails = [];
            // create arrays of IDs (merchant, item detail, parent item)
            Orders.map(o => {
                invoiceCartItemDetails.push(o.CartItemDetails);
                merchantIds.push(o.MerchantDetail.ID);
                o.CartItemDetails.map(c => {
                    invoiceItemDetails.push(c.ItemDetail)
                    itemDetailIds.push(c.ItemDetail.ID);
                    if (c.ItemDetail.ParentID && !parentItemIds.includes(c.ItemDetail.ParentID))
                        parentItemIds.push(c.ItemDetail.ParentID);
                });
            });
            const promiseShippingOptionsAdmin = getAdminShippingOptions();
            const promiseShippingOptionsAllMerchants = Promise.all(merchantIds.map(ID => getMerchantShippingOptions(ID)));
            const promiseAllMerchantDetail = Promise.all(merchantIds.map(ID => getUserDetails(ID)));
            const promiseInvoiceItems = Promise.all(itemDetailIds.map(ID => getItemDetails(ID)));
            const promiseInvoiceParentItems = Promise.all(parentItemIds.map(ID => getItemDetails(ID)));
            const promiseOffer = getOfferByCartItemID(currentUser.ID, invoiceDetails.Orders[0].CartItemDetails[0].ID);
            Promise.all([promiseOffer, promiseInvoiceItems, promiseInvoiceParentItems, promiseShippingOptionsAllMerchants, promiseShippingOptionsAdmin, promiseAllMerchantDetail]).then(responses => {
                const [offer, invoiceItems, invoiceParentItems, allMerchantShippingOptions, adminShippingOptions, merchantDetailList] = responses;
                let pendingOffer = null;
                if (offer) {
                    if (offer.Accepted || offer.Declined || offer.MessageType == 'CANCELLED') {
                        return res.redirect('/?error=quotation-not-pending');
                    }
                    pendingOffer = offer;
                }
                const allShippingOptions = [adminShippingOptions, ...allMerchantShippingOptions];
                const itemShippingMethodsMap = new Map();
                const itemPickupAddressesMap = new Map();
                const itemWeightMap = new Map();

                // add data to a map of item's delivery and weight
                itemDetailIds.map(id => {
                    let itemDetail = invoiceItemDetails.find(itemDetail => itemDetail.ID === id);
                    let parentItem = invoiceParentItems.find(parent => parent.ID === itemDetail.ParentID);

                    let item = invoiceItems.find(item => id === item.ID);
                    // delivery options
                    if (parentItem) {
                        itemShippingMethodsMap.set(id, parentItem.ShippingMethods || []);
                        itemPickupAddressesMap.set(id, parentItem.PickupAddresses || []);
                    } else {
                        itemShippingMethodsMap.set(id, itemDetail.ShippingMethods || item.ShippingMethods);
                        itemPickupAddressesMap.set(id, itemDetail.PickupAddresses || item.PickupAddresses);
                    }
                    // item weight
                    let weightProperty = null;
                    let obj = null;
                    let childObj = null;
                    if (parentItem && parentItem.CustomFields && parentItem.CustomFields.length > 0) {
                        obj = parentItem
                        childObj = parentItem.ChildItems.find(d => d.ID == itemDetail.ID);

                    } else if (item && item.CustomFields && item.CustomFields.length > 0) {
                        obj = item;
                    }


                    if (childObj && childObj.CustomFields && childObj.CustomFields.find(cf => cf.Code.toLowerCase().indexOf('weight') > 0)) {
                        var temp = childObj ? childObj.CustomFields.find(cf => cf.Name.toLowerCase() === 'weight') : null
                        if (temp) {
                            if (parseInt(temp.Values[0]) == 0) {

                                weightProperty = obj ? obj.CustomFields.find(cf => cf.Name.toLowerCase() === 'weight') : null
                                if (weightProperty && weightProperty.Values && weightProperty.Values.length > 0) {
                                    itemWeightMap.set(id, parseFloat(weightProperty.Values[0]));
                                }

                            }
                            else {
                                itemWeightMap.set(id, parseFloat(temp.Values[0]));
                            }
                            
                        }
                    }
                    else {
                        weightProperty = obj ? obj.CustomFields.find(cf => cf.Name.toLowerCase() === 'weight') : null
                        if (weightProperty && weightProperty.Values && weightProperty.Values.length > 0) {
                            itemWeightMap.set(id, parseFloat(weightProperty.Values[0]));
                        }
                    }

                });

                // get unavailable delivery methods for each merchant 
                const merchantUnavailableDeliveryOpts = new Map();
                merchantDetailList.map(merchant => {
                    const { CustomFields } = merchant;
                    const unavailableDel = [];
                    if (CustomFields && CustomFields.length > 0) {
                        let deliveryMethodAvailability = CustomFields.find(c => c.Name == 'DeliveryMethodAvailability');
                        if (deliveryMethodAvailability && deliveryMethodAvailability.Values && deliveryMethodAvailability.Values.length > 0) {
                            if (deliveryMethodAvailability.Values[0] != '') {
                                const value = JSON.parse(deliveryMethodAvailability.Values[0]);
                                const { UnavailableDeliveryMethods } = value;
                                if (UnavailableDeliveryMethods) {
                                    UnavailableDeliveryMethods.map(del => {
                                        if (del.ShippingMethodGuid) unavailableDel.push(del.ShippingMethodGuid);
                                    })
                                }
                            }
                        }
                    }
                    merchantUnavailableDeliveryOpts.set(merchant.ID, unavailableDel);
                });

                const getShippingMethod = ID => {
                    let allOptions = allShippingOptions.map(option => option.shipping);
                    let allFlatOpts = [];
                    if (allOptions && allOptions.length > 0 && allOptions.every(x => Array.isArray(x))) {
                        allFlatOpts = [].concat.apply([], allOptions);
                    }
                    const shipping = allFlatOpts.find(opt => opt.ID === ID);
                    if (shipping && shipping.CustomFields && shipping.CustomFields.length > 0) {
                        return shipping;
                    }
                    return null;
                }

                // key: order id, values: arr of shipping options
                const orderMatchedShipping = new Map();
                Orders.map(order => {
                    let matchedShipping = [];
                    order.CartItemDetails.map(cartItem => {
                        let itemId = cartItem.ItemDetail.ID;
                        // get shipping options assigned to item
                        const shippingList = itemShippingMethodsMap.get(itemId);

                        if (shippingList && shippingList.length > 0) {
                            // check whether to add shipping based on user location
                            for (let shipping of shippingList) {
                                const shippingMethod = getShippingMethod(shipping.ID);
                                const shippingCustomFields = shippingMethod !== null ? shippingMethod.CustomFields : null;
                                const merchantID = order.MerchantDetail.ID;
                                const unavailableDelOfMerchant = merchantUnavailableDeliveryOpts.get(merchantID);
                                const isAvailableMerchantDelOpt = typeof unavailableDelOfMerchant.find(x => x === shippingMethod.ID) == 'undefined';

                                if (shippingCustomFields && isAvailableMerchantDelOpt) {
                                    shippingCustomFields.map(cf => {
                                        const customFieldValue = JSON.parse(cf.Values);
                                        let splittedCountries = [];
                                        if (!customFieldValue.IsAllCountries) {
                                            if (customFieldValue.SelectedCountries) {
                                                let selectedCountries = JSON.stringify(customFieldValue.SelectedCountries);
                                                let countryCodes = selectedCountries.match(/"Code":"(.*?)"/g).map(function (code) {
                                                    return code.replace('"Code":"', '').replace('"', '');
                                                });
                                                splittedCountries = countryCodes.map(el => el.trim().toLowerCase());
                                            } else {
                                                if (customFieldValue.Countries && customFieldValue.Countries.indexOf(';') >= 0) {
                                                    splittedCountries = customFieldValue.Countries.split(';');
                                                } else {
                                                    splittedCountries = customFieldValue.Countries.split(',');
                                                }
                                                splittedCountries = splittedCountries.map(el => el.trim().toLowerCase());
                                            }
                                        }

                                        let splittedUserCountry = [];
                                        if (currentUserCountry && currentUserCountry.indexOf(',') >= 0) {
                                            splittedUserCountry = currentUserCountry.split(',');
                                            splittedUserCountry = splittedUserCountry.map(el => el.trim().toLowerCase());
                                        }

                                        if (currentUserCountry !== "" && customFieldValue.SelectedCountries) {
                                            if (addresses && addresses.Records && addresses.Records.length > 0) {
                                                currentUserCountry = addresses.Records[addresses.Records.length - 1].CountryCode;
                                            }
                                        }

                                        let isAddShipping = false;
                                        if (customFieldValue.IsAllCountries || (currentUserCountry && splittedCountries.indexOf(currentUserCountry.toLowerCase()) >= 0)) {
                                            isAddShipping = true;
                                        }
                                        else {
                                            if (splittedUserCountry.length > 0) {
                                                let index = splittedCountries.indexOf(splittedUserCountry[1]);
                                                if (index > 0 && splittedCountries[index - 1] == splittedUserCountry[0]) {
                                                    isAddShipping = true;
                                                }
                                            }
                                        }
                                        //ARC9585 first should not filter by Country here. since should be when selected in the one page checkout.
                                        isAddShipping = true;
                                        const alreadyExists = matchedShipping.find(s => s.shippingMethod.ID === shippingMethod.ID);
                                        if (isAddShipping && !alreadyExists) {
                                            matchedShipping.push({
                                                calculationType: customFieldValue.CalculationType,
                                                shippingMethod,
                                                rates: customFieldValue.Rates
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                    orderMatchedShipping.set(order.ID, matchedShipping)
                });

                //orderMatchedShipping.forEach(function(value,index) {
                //    console.log('OrdersOrders', value)
                //    console.log('OrdersOrders', index)
                //})

                Orders.map(order => {
                    const { ID, CartItemDetails, MerchantDetail } = order;
                    if (ID) {
                        
                        // filter shipping options for an order based on range total
                        const orderShippingArr = orderMatchedShipping.get(ID);

                      

                        if (orderShippingArr && orderShippingArr.length > 0) {
                            let shippingOptionModels = [];
                            orderShippingArr.map(orderShipping => {
                                const { calculationType, shippingMethod, rates } = orderShipping;
                                const itemIDs = [];
                                let totalQuantity = 0;
                                CartItemDetails.map(c => {
                                    itemIDs.push(c.ItemDetail.ID);
                                    totalQuantity += parseFloat(c.Quantity) || 0;
                                });

                                let totalWeight = 0;
                                itemIDs.map(id => totalWeight += itemWeightMap.get(id) || 0);

                                const total = calculationType == 'weight'
                                    ? totalWeight * totalQuantity
                                    : order.Total;

                                //https://arcadier.atlassian.net/browse/ARC-11326
                                if (total >= 0) {

                                    rates.map(rate => {
                                        const { MinimumRange, Onwards, MaximumRange } = rate;
                                        //ARC9585                                        
                                        if (parseFloat(MinimumRange) <= total && (Onwards === 'false' && parseFloat(MaximumRange) >= total)) {
                                            let shippingOptionModel = {
                                                ShippingData: orderShipping.shippingMethod,
                                                ShippingCost: rate.Cost,
                                                IsPickup: false,
                                                CurrencyCode: order.CurrencyCode
                                            };
                                            var deliveryOpt = orderShipping.shippingMethod.CustomFields ? orderShipping.shippingMethod.CustomFields.find(x => x.Name === 'DeliveryOptions') : null;
                                            //console.log('if totaltotaltotaltotal', total)
                                            //console.log('if orderShippingorderShippingorderShipping', orderShipping)
                                            //console.log('if deliveryOptdeliveryOptdeliveryOpt', deliveryOpt)

                                            if (deliveryOpt) {
                                                let values = JSON.parse(deliveryOpt.Values[0]);
                                                if (values && values.SelectedCountries) {
                                                    shippingOptionModel.ShouldShow = false;
                                                    values.SelectedCountries.forEach(function (country) {

                                                        if (addresses && addresses.Records && addresses.Records.length > 0) {
                                                            if (country.Code === addresses.Records[0].CountryCode) {
                                                                shippingOptionModel.ShouldShow = true;
                                                            }
                                                        }
                                                    });
                                                }
                                            }

                                            shippingOptionModels.push(shippingOptionModel);
                                        } else if (parseFloat(MinimumRange) <= total && Onwards === 'true') {
                                            let shippingOptionModel = {
                                                ShippingData: orderShipping.shippingMethod,
                                                ShippingCost: rate.Cost,
                                                IsPickup: false,
                                                CurrencyCode: order.CurrencyCode
                                            };

                                            var deliveryOpt = orderShipping.shippingMethod.CustomFields ? orderShipping.shippingMethod.CustomFields.find(x => x.Name === 'DeliveryOptions') : null;

                                            //console.log('else totaltotaltotaltotal', total)
                                            //console.log('else orderShippingorderShippingorderShipping', orderShipping)
                                            //console.log('else deliveryOptdeliveryOptdeliveryOpt', deliveryOpt)

                                            if (deliveryOpt) {
                                                let values = JSON.parse(deliveryOpt.Values[0]);
                                                if (values && values.SelectedCountries) {
                                                    shippingOptionModel.ShouldShow = false;
                                                    values.SelectedCountries.forEach(function (country) {

                                                        if (addresses && addresses.Records && addresses.Records.length > 0) {
                                                            if (country.Code === addresses.Records[0].CountryCode) {
                                                                shippingOptionModel.ShouldShow = true;
                                                            }
                                                        }
                                                    });
                                                }
                                            }

                                            shippingOptionModels.push(shippingOptionModel);
                                        }
                                    })
                                }
                            });
                            shippingOptions.push({ Merchant: order.MerchantDetail, shippingOptions: shippingOptionModels });
                        }
                        //for pickup addresses
                        const orderPickups = [];
                        CartItemDetails.map(cartItem => {
                            const pickups = itemPickupAddressesMap.get(cartItem.ItemDetail.ID);
                            if (pickups && pickups.length > 0) {
                                pickups.map(pickup => {
                                    const alreadyExists = orderPickups.find(o => o.Id === pickup.ID);
                                    if (!alreadyExists) {
                                        orderPickups.push({
                                            Id: pickup.ID,
                                            Name: pickup.Line1,
                                            IsPickup: true,
                                            CurrencyCode: order.CurrencyCode
                                        });
                                    }
                                });
                            }
                        });
                        pickupOptions.push({ Merchant: order.MerchantDetail, pickupOptions: orderPickups });
                    }
                });

                let firstName = '';
                let lastName = '';
                let address1 = "";
                let address2 = "";
                let country = "";
                let state = "";
                let city = "";
                let postalcode = "";

                if (invoiceDetails.Orders[0].DeliveryToAddress) {
                    let nameSplit = "";
                    if (invoiceDetails.Orders[0].DeliveryToAddress.Name) {
                        nameSplit = invoiceDetails.Orders[0].DeliveryToAddress.Name.split('|');
                    }

                    firstName = nameSplit[0];
                    lastName = nameSplit[1];
                    address1 = invoiceDetails.Orders[0].DeliveryToAddress.Line1;
                    address2 = invoiceDetails.Orders[0].DeliveryToAddress.Line2;
                    country = invoiceDetails.Orders[0].DeliveryToAddress.Country;
                    state = invoiceDetails.Orders[0].DeliveryToAddress.State;
                    city = invoiceDetails.Orders[0].DeliveryToAddress.City;
                    postalcode = invoiceDetails.Orders[0].DeliveryToAddress.PostCode;
                }

                let addressModel = {
                    FirstName: firstName,
                    LastName: lastName,
                    Address1: address1,
                    Address2: address2,
                    Country: country,
                    State: state,
                    City: city,
                    PostalCode: postalcode
                }

                let addressModelAdd = {
                    FirstName: "",
                    LastName: "",
                    Address1: "",
                    Address2: "",
                    Country: "",
                    State: "",
                    City: "",
                    PostalCode: ""
                }

                if (addresses && addresses.Records.length > 0) {
                    addresses.Records.map(function (address, index) {
                        if (index === 0) {
                            address.Selected = true;
                        } else {
                            address.Selected = false;
                        }
                    });
                }

                function buildStripeConfigs(stripePaymentGateway) {
                    const paymentRequest = buildGenericPaymentRequest(null, stripePaymentGateway, req.Name, getHostname(req));
                    const settings = paymentRequest.settings;

                    return {
                        gateway: settings.gateway,
                        publicKey: settings.gatewayConfigs.find(g => g.key == 'publicKey').value,
                        locale: 'auto',
                        name: settings.gatewayConfigs.find(g => g.key == 'marketplaceName').value,
                        is3dsEnabled: settings.gatewayConfigs.find(g => g.key == 'is3dsEnabled').value
                    };
                }

                function buildOmiseConfigs(omisePaymentGateway) {
                    const paymentRequest = buildGenericPaymentRequest(null, omisePaymentGateway, req.Name, getHostname(req));
                    const settings = paymentRequest.settings;
                    return {
                        gateway: settings.gateway,
                        publicKey: settings.gatewayConfigs.find(g => g.key == 'publicKey').value
                    };
                }

                getValidPaymentGateways(invoiceDetails, (validPaymentGateways) => {
                    const paymentMethods = validPaymentGateways.map((paymentGateway, index) => {
                        let code = paymentGateway.Code;
                        let configs = null;

                        if (code.startsWith('stripe')) {
                            configs = buildStripeConfigs(paymentGateway);
                        } else if (code.startsWith('omise')) {
                            configs = buildOmiseConfigs(paymentGateway);
                        }
                        return {
                            code: code,
                            gateway: paymentGateway.Gateway,
                            isSelected: index == 0,
                            configs: configs
                        }
                    });
                    const buyerAddress = getDeliveryToAddress(invoiceDetails.Orders[0]);
                    let orderSelectedDelivery = [];
                    let invalidCheckout = false;

                    getUserPermissionsOnPage(currentUser, "Checkout", "consumer", (permissions) => {
                        const s = Store.createOnePageCheckoutStore({
                            userReducer: {
                                user: currentUser,
                                isGuest: isGuest,
                                permissions: permissions
                            },
                            settingsReducer: {
                                addressIDToDelete: "",
                                addresses: addresses.Records,
                                billingAddresses: addresses.Records,
                                addressModelAdd: addressModelAdd,
                                addressModel: addressModel,
                                invoiceDetails: invoiceDetails,
                                shippingOptions: shippingOptions,
                                comparisonId: comparisonId,
                                pickupOptions: pickupOptions,
                                orderSelectedDelivery: orderSelectedDelivery
                            },
                            checkoutReducer: {
                                buyerAddress: buyerAddress,
                                invoiceDetails: invoiceDetails,
                                paymentMethods: paymentMethods,
                                updateUser: false,
                                allowCheckout: false,
                                invalidCheckout: invalidCheckout,
                                pendingOffer: pendingOffer,
                                processing: false,
                            },
                            marketplaceReducer: {
                                locationVariantGroupId: req.LocationVariantGroupId
                            }
                        });


                        const reduxState = s.getState();
                        const onePageCheckOut = reactDom.renderToString(<OnePageCheckoutComponent
                            user={currentUser}
                            buyerAddress={buyerAddress}
                            invoiceDetails={invoiceDetails}
                            paymentMethods={paymentMethods}
                            addressModel={addressModel}
                            shippingOptions={shippingOptions}
                            pickupOptions={pickupOptions}
                            addresses={addresses.Records}
                            billingAddresses={addresses.Records}
                            comparisonId={comparisonId}
                            isGuest={isGuest}
                            orderSelectedDelivery={orderSelectedDelivery}
                            invalidCheckout={invalidCheckout}
                            pendingOffer={pendingOffer}
                            processing={false}
                            locationVariantGroupId={req.LocationVariantGroupId}
                            permissions={permissions} />);
                        let seoTitle = 'Checkout Page';
                        if (req.SeoTitle) {
                            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                        }
                        res.send(template('page-delivery page-create-requisition', seoTitle, onePageCheckOut, appString, reduxState));
                    });

                });
            });
        });
    } else {
        const { orderId, comparisonId } = req.query;
        if (!orderId) return res.send('Order Id not found.');
        if (!currentUser) return res.send('User not found.')
        const promiseOrderDetails = new Promise((resolve, reject) => {
            client.Orders.getOrderDetails({ userId: currentUser.ID, orderId }, function (err, result) {
                resolve(result);
            })
        });
        const promiseAddresses = new Promise((resolve, reject) => {
            client.Addresses.getUserAddresses(currentUser.ID, function (err, addresses) {
                resolve(addresses);
            });
        });

        Promise.all([promiseOrderDetails, promiseAddresses]).then(responses => {
            const order = responses[0];
            const addresses = responses[1];

            if (order.RequisitionDetail) {
                return res.redirect('/?error=requisition-already-exists');
            }

            let currentUserCountry = '';
            if (addresses && addresses.TotalRecords > 0) {
                currentUserCountry = addresses.Records[addresses.TotalRecords - 1].Country;
            }
            const merchantDetail = order.MerchantDetail;
            let cartIds = [];
            let itemIds = [];
            let orderItemDetailArr = [];
            let parentItemIds = [];
            if (order.CartItemDetails && order.CartItemDetails.length > 0) {
                order.CartItemDetails.map(cart => {
                    cartIds.push(cart.ID);
                    itemIds.push(cart.ItemDetail.ID);
                    orderItemDetailArr.push(cart.ItemDetail);
                    if (cart.ItemDetail.ParentID && !parentItemIds.includes(cart.ItemDetail.ParentID)) {
                        parentItemIds.push(cart.ItemDetail.ParentID);
                    }
                });
            }
            const promiseOffer = getOfferByCartItemID(currentUser.ID, cartIds[0]);
            const promiseItems = Promise.all(itemIds.map(ID => getItemDetails(ID))).catch(() => {

            });
            const promiseParentItems = Promise.all(parentItemIds.map(ID => getItemDetails(ID))).catch(() => {

            });
            const promiseShippingOptionsMerchant = getMerchantShippingOptions(merchantDetail.ID);
            const promiseShippingOptionsAdmin = getAdminShippingOptions();
            const promiseMerchantDetail = getUserDetails(merchantDetail.ID);

            Promise.all([promiseOffer, promiseItems, promiseParentItems, promiseShippingOptionsMerchant, promiseShippingOptionsAdmin, promiseMerchantDetail]).then(responses => {
                const [offer, itemDetailsArr, parentItemsArr, merchantShippingOptions, adminShippingOptions, merchant] = responses;
                if (!itemDetailsArr) {
                    return res.redirect('/?error=quotation-not-pending');
                }
                const allShippingOptions = [adminShippingOptions, merchantShippingOptions];
                const itemShippingMethodsMap = new Map();
                const itemPickupAddressesMap = new Map();
                const itemWeightMap = new Map();
                let pendingOffer = null;

                if (offer) {
                    if (offer.Accepted || offer.Declined || offer.MessageType == 'CANCELLED') {
                        return res.redirect('/?error=quotation-not-pending');
                    }
                    pendingOffer = offer;
                }

                // add data to a map of item's delivery and weight
                itemIds.map(id => {
                    let itemDetail = orderItemDetailArr.find(itemDetail => itemDetail.ID === id);
                    let parentItem = parentItemsArr ? parentItemsArr.find(parent => parent.ID === itemDetail.ParentID) : null;
                    let item = itemDetailsArr.find(item => id === item.ID);
                    // delivery options
                    if (parentItem) {
                        itemShippingMethodsMap.set(id, parentItem.ShippingMethods || []);
                        itemPickupAddressesMap.set(id, parentItem.PickupAddresses || []);
                    } else {
                        const itemDetailShipping = itemDetail && itemDetail.ShippingMethods ? itemDetail.ShippingMethods : [];
                        const itemShipping = item && item.ShippingMethods ? item.ShippingMethods : [];
                        const shippingMethod = itemDetailShipping.length > 0 ? itemDetailShipping : itemShipping;
                        itemShippingMethodsMap.set(id, shippingMethod);
                        const itemDetailPickup = itemDetail && itemDetail.PickupAddresses ? itemDetail.PickupAddresses : [];
                        const itemPickup = item && item.PickupAddresses ? item.PickupAddresses : [];
                        const pickupMethods = itemDetailPickup.length > 0 ? itemDetailPickup : itemPickup;
                        itemPickupAddressesMap.set(id, pickupMethods);
                    }
                    // item weight
                    let weightProperty = null;
                    let obj = null;
                    if (parentItem && parentItem.CustomFields && parentItem.CustomFields.length > 0) {
                        obj = parentItem
                    } else if (item && item.CustomFields && item.CustomFields.length > 0) {
                        obj = item;
                    }
                    weightProperty = obj ? obj.CustomFields.find(cf => cf.Name.toLowerCase() === 'weight') : null
                    if (weightProperty && weightProperty.Values && weightProperty.Values.length > 0) {
                        itemWeightMap.set(id, parseFloat(weightProperty.Values[0]));
                    }
                });

                const getShippingMethod = ID => {
                    let allOptions = allShippingOptions.map(option => option.shipping);
                    let allFlatOpts = [];
                    if (allOptions && allOptions.length > 0 && allOptions.every(x => Array.isArray(x))) {
                        allFlatOpts = [].concat.apply([], allOptions);
                    }
                    const shipping = allFlatOpts.find(opt => opt.ID === ID);
                    if (shipping && shipping.CustomFields && shipping.CustomFields.length > 0) {
                        return shipping;
                    }
                    return null;
                }

                const { CustomFields } = merchant;
                const unavailableDel = [];
                // get unavailable delivery methods for each merchant 
                if (CustomFields && CustomFields.length > 0) {
                    let deliveryMethodAvailability = CustomFields.find(c => c.Name == 'DeliveryMethodAvailability');
                    if (deliveryMethodAvailability && deliveryMethodAvailability.Values && deliveryMethodAvailability.Values.length > 0) {
                        if (deliveryMethodAvailability.Values[0] != '') {
                            const value = JSON.parse(deliveryMethodAvailability.Values[0]);
                            const { UnavailableDeliveryMethods } = value;
                            if (UnavailableDeliveryMethods) {
                                UnavailableDeliveryMethods.map(del => {
                                    if (del.ShippingMethodGuid) unavailableDel.push(del.ShippingMethodGuid);
                                })
                            }
                        }
                    }
                }
                const shippingOptions = [];
                const pickupOptions = [];
                // filter shipping options assigned to each item                 
                itemIds.map(itemId => {
                    const shippingList = itemShippingMethodsMap.get(itemId);
                    if (shippingList && shippingList.length > 0) {
                        for (let shipping of shippingList) {
                            const shippingMethod = getShippingMethod(shipping.ID);
                            const shippingCustomFields = shippingMethod !== null ? shippingMethod.CustomFields : null;
                            const isAvailableMerchantDelOpt = typeof unavailableDel.find(x => x === shippingMethod.ID) == 'undefined';
                            const isAlreadyAdded = shippingOptions.filter(s => shippingMethod.ID == s.ShippingData.ID).length !== 0;
                            if (shippingCustomFields && isAvailableMerchantDelOpt && !isAlreadyAdded) {
                                shippingCustomFields.map(cf => {
                                    const customFieldValue = JSON.parse(cf.Values);
                                    let splittedCountries = [];
                                    if (!customFieldValue.IsAllCountries) {
                                        if (customFieldValue.SelectedCountries) {
                                            let selectedCountries = JSON.stringify(customFieldValue.SelectedCountries);
                                            let countryCodes = selectedCountries.match(/"Code":"(.*?)"/g).map(function (code) {
                                                return code.replace('"Code":"', '').replace('"', '');
                                            });
                                            splittedCountries = countryCodes.map(el => el.trim().toLowerCase());
                                        } else {
                                            if (customFieldValue.Countries.indexOf(';') >= 0) {
                                                splittedCountries = customFieldValue.Countries.split(';');
                                            } else {
                                                splittedCountries = customFieldValue.Countries.split(',');
                                            }
                                            if (splittedCountries && splittedCountries.length > 0) {
                                                splittedCountries = splittedCountries.map(el => el.trim().toLowerCase());
                                            }
                                        }
                                    }

                                    let splittedUserCountry = [];
                                    if (currentUserCountry && currentUserCountry.indexOf(',') >= 0) {
                                        splittedUserCountry = currentUserCountry.split(',');
                                        if (splittedUserCountry && splittedUserCountry.length > 0) {
                                            splittedUserCountry = splittedUserCountry.map(el => el.trim().toLowerCase());
                                        }
                                    }

                                    if (currentUserCountry && currentUserCountry !== "" && customFieldValue.SelectedCountries) {
                                        if (addresses && addresses.Records && addresses.Records.length > 0) {
                                            currentUserCountry = addresses.Records[addresses.Records.length - 1].CountryCode;
                                        }
                                    }

                                    let isAddShipping = false;
                                    if (customFieldValue.IsAllCountries || (currentUserCountry && splittedCountries.indexOf(currentUserCountry.toLowerCase()) >= 0)) {
                                        isAddShipping = true;
                                    }
                                    else {
                                        if (splittedUserCountry.length > 0) {
                                            let index = splittedCountries.indexOf(splittedUserCountry[1]);
                                            if (index > 0 && splittedCountries[index - 1] == splittedUserCountry[0]) {
                                                isAddShipping = true;
                                            }
                                        }
                                    }

                                    //ARC9585 first should not filter by Country here. since should be when selected in the one page checkout.
                                    isAddShipping = true;

                                    if (isAddShipping) {
                                        const calculationType = customFieldValue.CalculationType;
                                        const rates = customFieldValue.Rates;

                                        let totalQuantity = 0;
                                        order.CartItemDetails.map(c => totalQuantity += parseFloat(c.Quantity) || 0);

                                        let totalWeight = 0;
                                        itemIds.map(id => totalWeight += itemWeightMap.get(id) || 0);
                                        const total = calculationType === 'weight'
                                            ? (totalWeight > 0 ? totalWeight : 1) * totalQuantity
                                            : order.Total;
                                        // check if shipping opt is valid based on order total and calculation type
                                        if (total) {
                                            rates.map(rate => {
                                                if (parseFloat(rate.MinimumRange) <= total && (rate.Onwards == 'true' || (parseFloat(rate.MaximumRange) >= total))) {
                                                    let shippingOptionModel = {
                                                        ShippingData: shippingMethod,
                                                        ShippingCost: rate.Cost,
                                                        IsPickup: false,
                                                        CurrencyCode: order.CurrencyCode
                                                    };

                                                    var deliveryOpt = shippingMethod.CustomFields ? shippingMethod.CustomFields.find(x => x.Name === 'DeliveryOptions') : null;
                                                    if (deliveryOpt) {
                                                        let values = JSON.parse(deliveryOpt.Values[0]);
                                                        if (values && values.SelectedCountries) {
                                                            shippingOptionModel.ShouldShow = false;
                                                            values.SelectedCountries.forEach(function (country) {
                                                                let isValidCalcType = true;
                                                                if (parseFloat(rate.MinimumRange) < 1 && rate.Onwards == 'true') {
                                                                    isValidCalcType = true;
                                                                }
                                                                else {
                                                                    if (totalWeight < 1 && calculationType === 'weight') {
                                                                        isValidCalcType = false;
                                                                    }
                                                                }
                                                                if (addresses && addresses.Records && addresses.Records.length > 0 && isValidCalcType) {
                                                                    if (country.Code === addresses.Records[0].CountryCode) {
                                                                        shippingOptionModel.ShouldShow = true;
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }

                                                    shippingOptions.push(shippingOptionModel);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }

                    const pickupAddresses = itemPickupAddressesMap.get(itemId);
                    if (pickupAddresses && pickupAddresses.length > 0) {
                        pickupAddresses.forEach(pickup => {
                            const alreadyExists = pickupOptions.find(o => o.Id === pickup.ID);
                            if (!alreadyExists) {
                                pickupOptions.push({
                                    Id: pickup.ID,
                                    Name: pickup.Line1,
                                    IsPickup: true,
                                    CurrencyCode: order.CurrencyCode
                                });
                            }
                        });
                    }
                });

                let firstName = '';
                let lastName = '';
                let address1 = "";
                let address2 = "";
                let country = "";
                let state = "";
                let city = "";
                let postalcode = "";
                if (order.DeliveryToAddress) {
                    let nameSplit = "";
                    if (order.DeliveryToAddress.Name) {
                        nameSplit = order.DeliveryToAddress.Name.split('|');
                    }

                    firstName = nameSplit[0];
                    lastName = nameSplit[1];
                    address1 = order.DeliveryToAddress.Line1;
                    address2 = order.DeliveryToAddress.Line2;
                    country = order.DeliveryToAddress.Country;
                    state = order.DeliveryToAddress.State;
                    city = order.DeliveryToAddress.City;
                    postalcode = order.DeliveryToAddress.PostCode;
                }

                let addressModel = {
                    FirstName: firstName,
                    LastName: lastName,
                    Address1: address1,
                    Address2: address2,
                    Country: country,
                    State: state,
                    City: city,
                    PostalCode: postalcode
                }

                let addressModelAdd = {
                    FirstName: "",
                    LastName: "",
                    Address1: "",
                    Address2: "",
                    Country: "",
                    State: "",
                    City: "",
                    PostalCode: ""
                }

                if (addresses && addresses.Records.length > 0) {
                    addresses.Records.map(function (address, index) {
                        if (index === 0) {
                            address.Selected = true;
                        } else {
                            address.Selected = false;
                        }
                    });
                }

                const buyerAddress = getDeliveryToAddress(order);
                let orderSelectedDelivery = [];
                let invalidCheckout = false;
                let isGuest = false;
                getUserPermissionsOnPage(currentUser, 'Checkout', 'Consumer', (pagePermissions) => {
                    const storeContent = {
                        userReducer: {
                            user: currentUser,
                            isGuest,
                            pagePermissions
                        },
                        settingsReducer: {
                            addressIDToDelete: "",
                            addresses: addresses.Records,
                            billingAddresses: addresses.Records,
                            addressModelAdd: addressModelAdd,
                            addressModel: addressModel,
                            orderDetails: order,
                            shippingOptions: shippingOptions,
                            comparisonId: comparisonId,
                            pickupOptions: pickupOptions,
                            orderSelectedDelivery: orderSelectedDelivery
                        },
                        merchantReducer: { user: merchant },
                        checkoutReducer: {
                            buyerAddress: buyerAddress,
                            orderDetails: order,
                            updateUser: false,
                            allowCheckout: false,
                            invalidCheckout: false,
                            showCreateRequisition: false,
                            pendingOffer: pendingOffer
                        },
                        marketplaceReducer: {
                            locationVariantGroupId: req.LocationVariantGroupId
                        }
                    };
                    const props = {
                        user: currentUser,
                        buyerAddress,
                        orderDetails: order,
                        addressModel,
                        merchantDetail: merchant,
                        shippingOptions,
                        pickupOptions,
                        addresses: addresses.Records,
                        billingAddresses: addresses.Records,
                        comparisonId,
                        isGuest,
                        orderSelectedDelivery,
                        invalidCheckout,
                        showCreateRequisition: false,
                        pendingOffer: pendingOffer,
                        locationVariantGroupId: req.LocationVariantGroupId,
                        pagePermissions
                    }
                    let seoTitle = 'Checkout Page';
                    if (req.SeoTitle) {
                        seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                    }
                    const appString = 'one-page-checkout';
                    const context = {};
                    getApprovalSettings(currentUser.ID, function (settings) {
                        if (settings.Enabled) {
                            getApprovalWorkflowsAndDepartments(currentUser.ID, function (results) {
                                const { workflows, departments } = results;
                                storeContent.checkoutReducer.workflows = workflows;
                                storeContent.checkoutReducer.departments = departments;
                                storeContent.checkoutReducer.showCreateRequisition = true;
                                props.showCreateRequisition = true;
                                const s = Store.createOnePageCheckoutStore(storeContent);
                                const reduxState = s.getState();
                                const onePageCheckOut = reactDom.renderToString(<OnePageCheckoutComponent
                                    {...props}
                                    departments={departments}
                                    workflows={workflows}
                                />);

                                let seoTitle = 'Checkout Page';
                                if (req.SeoTitle) {
                                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                                }
                                res.send(template('page-delivery page-create-requisition', seoTitle, onePageCheckOut, appString, reduxState));
                            });
                        } else {
                            const s = Store.createOnePageCheckoutStore(storeContent);
                            const reduxState = s.getState();
                            const onePageCheckOut = reactDom.renderToString(<OnePageCheckoutComponent  {...props} />);
                            res.send(template('page-delivery page-create-requisition', seoTitle, onePageCheckOut, appString, reduxState));
                        }
                    });
                });
            });
        });
    }
});

checkoutRouter.post('/generate-invoice-number-by-cartitems', authenticated, function (req, res) {
    const user = req.user;

    let cartItemIds = req.body['cartItemIds[]'];
    let comparisonId = req.body['comparisonId'];
    let comparisonDetailId = req.body['comparisonDetailId'];

    let promiseInvoiceNumber = new Promise((resolve, reject) => {
        let options = {
            userId: user.ID,
            cartItemIds: cartItemIds
        };

        client.Payments.generateInvoiceNumber(options, function (err, invoiceNumber) {
            resolve(invoiceNumber);
        });
    });

    Promise.all([promiseInvoiceNumber]).then((responses) => {
        const invoiceDetails = responses[0];

        let promiseComparison = new Promise((resolve, reject) => {
            let options = {
                userId: user.ID,
                orderId: invoiceDetails.Orders[0].ID,
                comparisonId: comparisonId,
                comparisonDetailId: comparisonDetailId
            };

            client.Comparisons.editComparison(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseComparison]).then((responses) => {
            res.send(invoiceDetails);
        });
    });
});

checkoutRouter.post('/updateToPaid', authenticated, function (req, res) {
    let user = req.user;
    let data = req.body;

    let OrderId = data["invoiceDetails[Orders][0][ID]"];;
    let PayeeId = data["invoiceDetails[Orders][0][MerchantDetail][ID]"];;
    let PayerId = data["invoiceDetails[Orders][0][ConsumerDetail][ID]"];;
    let InvoiceNo = data["invoiceDetails[InvoiceNo]"];
    let cartItemId = data["invoiceDetails[Orders][0][CartItemDetails][0][ID]"];
    let deliverySelected = JSON.parse(data['deliverySelected']);
    let comparisonId = data["comparisonId"];
    let itemId = data["invoiceDetails[Orders][0][CartItemDetails][0][ItemDetail][ID]"];

    // update cart delivery
    let promiseUpdateCart = new Promise((resolve, reject) => {
        const options = {
            userID: user.ID,
            cartID: cartItemId,
            cartItemType: deliverySelected.IsPickup ? 'pickup' : 'delivery',
            shippingMethodId: deliverySelected.IsPickup ? null : deliverySelected.ShippingData.ID,
            pickupAddressId: deliverySelected.IsPickup ? deliverySelected.Id : null
        };

        client.Carts.editCart(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdateCart]).then((responses) => {
        // update order freight
        let promiseUpdateOrderFreight = new Promise((resolve, reject) => {
            const options = {
                orders: [{
                    orderId: OrderId,
                    freight: deliverySelected.IsPickup ? 0 : deliverySelected.ShippingCost
                }]
            };

            client.Orders.updateOrderDetails(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseUpdateOrderFreight]).then((responses) => {
            // update invoice payment amounts
            let promiseUpdateInvoicePayments = new Promise((resolve, reject) => {
                const options = {
                    merchantId: PayeeId,
                    invoiceNo: InvoiceNo
                };

                client.Payments.updateInvoicePayments(options, function (err, result) {
                    resolve(result);
                });
            });

            Promise.all([promiseUpdateInvoicePayments]).then((responses) => {
                // update order status
                let promiseUpdateOrderStatus = new Promise((resolve, reject) => {
                    const options = {
                        orders: [{
                            orderId: OrderId,
                            balance: 0
                        }]
                    };

                    client.Orders.updateOrderDetails(options, function (err, result) {
                        resolve(result);
                    });
                });

                // update payment status
                let promiseUpdatePaymentDetails = new Promise((resolve, reject) => {
                    const options = {
                        orderId: OrderId,
                        payerId: PayerId,
                        payeeId: PayeeId,
                        invoiceNo: InvoiceNo,
                        status: "Success"
                    };

                    client.Payments.updatePaymentDetails(options, function (err, result) {
                        resolve(result);
                    });
                });

                let promiseUserComparisons = new Promise((resolve, reject) => {
                    const options = {
                        userId: user.ID,
                        namesOnly: false,
                        pageSize: 1000,
                        pageNumber: 1,
                        includes: 'CartItem'
                    };

                    client.Comparisons.getUserComparisons(options, function (err, result) {
                        resolve(result);
                    });
                });

                Promise.all([promiseUpdateOrderStatus, promiseUpdatePaymentDetails, promiseUserComparisons]).then((responses) => {
                    const pagingUserComparisons = responses[2];

                    let toDeclineComparisonDetails = [];
                    let toDeleteComparisonDetailIds = [];

                    if (pagingUserComparisons.TotalRecords > 0) {
                        const comparisons = pagingUserComparisons.Records.filter(c => c.ReadOnly == false && c.Active == true);

                        if (comparisons.length > 0) {
                            const orderComparison = comparisons.find(c => c.Id == comparisonId);

                            if (orderComparison) {
                                toDeclineComparisonDetails = orderComparison.ComparisonDetails.filter(c => c.Active == true && c.Offer != null && c.Offer.Accepted == false && c.Offer.Declined == false && c.CartItemID != cartItemId);

                                const toDeclineCartItemIds = toDeclineComparisonDetails.map(function (comparisonDetail) {
                                    return comparisonDetail.CartItemID;
                                });

                                let otherComparisons = comparisons.filter(c => c.Id != orderComparison.Id);

                                otherComparisons.forEach(function (comparison) {
                                    comparison.ComparisonDetails.forEach(function (comparisonDetail) {
                                        if (comparisonDetail.Active == true && comparisonDetail.Offer != null &&
                                            (comparisonDetail.CartItemID == cartItemId || toDeclineCartItemIds.includes(comparisonDetail.CartItemID))) {
                                            toDeleteComparisonDetailIds.push(comparisonDetail.ID);
                                        }

                                        if (comparisonDetail.Active == true && comparisonDetail.Offer == null &&
                                            comparisonDetail.CartItem != null && comparisonDetail.CartItem.ItemDetail != null && comparisonDetail.CartItem.ItemDetail.ID == itemId) {
                                            toDeleteComparisonDetailIds.push(comparisonDetail.ID);
                                        }
                                    });
                                });
                            }
                        }
                    }

                    declineOffers(user.ID, toDeclineComparisonDetails, function () {
                        let promiseDeleteComparisonDetails = new Promise((resolve, reject) => {
                            if (toDeleteComparisonDetailIds.length > 0) {
                                const options = {
                                    userId: user.ID,
                                    comparisonDetailIds: toDeleteComparisonDetailIds
                                };

                                client.Comparisons.deleteComparisonDetailsByIds(options, function (err, result) {
                                    resolve(result);
                                });
                            } else {
                                resolve(null);
                            }
                        });

                        let promiseUpdateComparison = new Promise((resolve, reject) => {
                            const options = {
                                comparisonId: comparisonId,
                                Active: false,
                                ReadOnly: true,
                                UserID: user.ID
                            };

                            client.Comparisons.setComparisonReadOnly(options, function (err, result) {
                                resolve(result);
                            });
                        });

                        Promise.all([promiseDeleteComparisonDetails, promiseUpdateComparison]).then((responses) => {
                            res.send('success');
                        })
                    });
                });
            });
        });
    });
});

checkoutRouter.post('/proceedToPayment', authenticated, function (req, res) {
    const isRequisition = process.env.CHECKOUT_FLOW_TYPE == 'b2b';
    const { user } = req;
    const invoiceNo = req.body.invoiceNo;
    const orderId = req.body.orderId;
    const merchantIDs = JSON.parse(req.body.merchantIDs);
    let orderDelArr = JSON.parse(req.body.orderSelectedDelivery);
    let orderSelectedDelivery = new Map();
    orderDelArr.map(del => {
        const keys = Object.keys(del);
        if (keys && keys.length == 1) {
            orderSelectedDelivery.set(keys[0], Object.values(del)[0] || null);
        }
    })

    let pendingOffer = null;

    if (req.body.pendingOffer && req.body.pendingOffer.length !== 0) {
        pendingOffer = JSON.parse(req.body.pendingOffer);
    }

    const promiseInvoiceDetails = new Promise((resolve, reject) => {
        if (!isRequisition) {
            client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo }, function (err, invoiceNumberDetails) {
                resolve(invoiceNumberDetails);
            });
        } else {
            resolve(null);
        }
    });

    const promiseMerchantDetails = userId => new Promise((resolve, reject) => {
        client.Users.getUserDetails({ userId }, function (err, user) {
            if (!err) resolve(user);
        });
    });

    const promiseMerchants = Promise.all(merchantIDs.map(id => promiseMerchantDetails(id)));

    const promiseOrderDetails = new Promise((resolve, reject) => {
        if (isRequisition) {
            const options = {
                userId: user.ID,
                orderId: orderId
            };

            client.Orders.getOrderDetails(options, function (err, result) {
                resolve(result);
            });
        } else {
            resolve(null);
        }
    });

    const promiseOffer = new Promise((resolve, reject) => {
        if (pendingOffer) {
            const options = {
                userId: user.ID,
                cartItemId: pendingOffer.CartItemID,
                isAccepted: null,
                isDeclined: null
            };
            client.Chat.getOfferByCartItemId(options, function (err, result) {
                resolve(result);
            });
        } else {
            resolve(null);
        }
    });
    Promise.all([promiseInvoiceDetails, promiseMerchants, promiseOrderDetails, promiseOffer]).then(responses => {
        const invoice = responses[0];
        const merchants = responses[1];
        const orderDetails = responses[2];
        const offer = responses[3];

        if (isRequisition && orderDetails.RequisitionDetail) {
            return res.send({ success: false, code: 'REQUISITION_ALREADY_EXISTS' });
        }

        if (offer) {
            if (offer.Accepted || offer.Declined || offer.MessageType == 'CANCELLED') {
                return res.send({ success: false, code: 'QUOTATION_NOT_PENDING' });
            }
        }

        let hasError = false;
        const { Orders } = !isRequisition ? invoice : { Orders: [orderDetails] };
        if (merchants && merchants.length > 0) {
            //check if any of the merchants were disabled
            for (let m of merchants) {
                if (!m.Visible) return res.send({ success: false, code: 'DISABLED_ITEM_OR_SELLER' })
            }
        }
        if (Orders && Orders.length > 0) {
            // check if any item in orders are disabled
            let hasDisabledItem = false;
            for (let order of Orders) {
                for (let cartItem of order.CartItemDetails) {
                    if (cartItem.ItemDetail && !cartItem.ItemDetail.IsAvailable) {
                        hasDisabledItem = true;
                        break;
                    }
                }
                if (hasDisabledItem) break;
            }
            if (hasDisabledItem) {
                return res.send({ success: false, code: 'DISABLED_ITEM_OR_SELLER' });
            }

            let toValidateSelectedDelivery = true;
            const shippingOptions = JSON.parse(req.body.shippingOptions);
            const pickupOptions = JSON.parse(req.body.pickupOptions);
            // check if any order has no selected delivery or no cart items 
            Orders.map(order => {
                let merchantShippingOptions;
                let merchantPickupOptions;
                if (process.env.PRICING_TYPE == 'service_level') {
                    const merchantID = order.MerchantDetail.ID;
                    if (shippingOptions && shippingOptions.length > 0) {
                        merchantShippingOptions = shippingOptions.find(x => x.Merchant.ID === merchantID);
                    }
                    if (pickupOptions && pickupOptions.length > 0) {
                        merchantPickupOptions = pickupOptions.find(x => x.Merchant.ID === merchantID);
                    }
                    const hasAvailablePickupOptions = merchantPickupOptions && merchantPickupOptions.pickupOptions && merchantPickupOptions.pickupOptions.length > 0;
                    let hasAvailableShippingOptions = (merchantShippingOptions && merchantShippingOptions.shippingOptions && merchantShippingOptions.shippingOptions.length > 0) || false;
                    if (hasAvailableShippingOptions) {
                        hasAvailableShippingOptions = merchantShippingOptions.shippingOptions.filter(x => x.ShouldShow == true).length > 0;
                    }
                    if (!hasAvailableShippingOptions && !hasAvailablePickupOptions) {
                        toValidateSelectedDelivery = false;
                    }
                }
                if (toValidateSelectedDelivery) {
                    if (orderSelectedDelivery) {
                        let selectedDelivery = orderSelectedDelivery.get(order.ID);
                        if (selectedDelivery && (selectedDelivery.ShippingCost || selectedDelivery.IsPickup)) {
                            const { CartItemDetails } = order;
                            if (!CartItemDetails || CartItemDetails.length === 0) hasError = true;
                        } else hasError = true;
                    } else hasError = true;
                }
            });


            if (!hasError) {
                const promiseUpdateCart = (cartItemId, deliverySelected) =>
                    new Promise((resolve, reject) => {
                        const options = {
                            userID: user.ID,
                            cartID: cartItemId,
                            cartItemType: deliverySelected !== undefined ? (deliverySelected && deliverySelected.IsPickup ? 'pickup' : 'delivery') : null,
                            shippingMethodId: deliverySelected !== undefined ? (deliverySelected && deliverySelected.IsPickup ? null : deliverySelected.ShippingData.ID) : null,
                            pickupAddressId: deliverySelected && deliverySelected.IsPickup ? deliverySelected.Id : null,
                            notes: req.body.notes,
                        };
                        client.Carts.editCart(options, function (err, result) {
                            resolve(result);
                        });
                    });
                const promiseUpdateOrderFreight = (orderId, deliverySelected) =>
                    new Promise((resolve, reject) => {
                        const options = {
                            orders: [{
                                orderId: orderId,
                                freight: deliverySelected && deliverySelected.IsPickup == false ? parseFloat(deliverySelected.ShippingCost) : 0,
                            }],
                            autoUpdatePayment: true
                        };

                        client.Orders.updateOrderDetails(options, function (err, result) {
                            resolve(result);
                        });
                    });

                const promiseUpdateInvoicePayments = (PayeeId, InvoiceNo) =>
                    new Promise((resolve, reject) => {
                        const options = {
                            merchantId: PayeeId,
                            invoiceNo: InvoiceNo
                        };
                        client.Payments.updateInvoicePayments(options, function (err, result) {
                            resolve(result);
                        });
                    });

                const promiseUpdateOrderCarts = (orderId, cartItemIds) => Promise.all(cartItemIds.map(c => promiseUpdateCart(c, orderSelectedDelivery.get(orderId))));

                // key: order id, value: [cart item ids]
                const cartItemIdMap = new Map();
                Orders.map(order => cartItemIdMap.set(order.ID, order.CartItemDetails.map(c => c.ID)));
                //ARC-8455: synchronize the promises correctly
                //const promiseOrderCarts = Promise.all(Array.from(cartItemIdMap.entries()).map(entry => promiseUpdateOrderCarts(entry[0], entry[1])));
                //const promiseUpdateFreights = Promise.all(Orders.map(order => promiseUpdateOrderFreight(order.ID, orderSelectedDelivery.get(order.ID))));
                //const promiseUpdateInvoicePaymentsPerOrder = Promise.all(!isRequisition ? Orders.map(order => promiseUpdateInvoicePayments(order.MerchantDetail.ID, invoice.InvoiceNo)) : [])

                let promiseReUpdateFreights = Promise.all([new Promise((resolve, reject) => resolve(null))]);
                Promise.all(Orders.map(order => promiseUpdateOrderFreight(order.ID, orderSelectedDelivery.get(order.ID)))).then((responses) => {
                    if (responses && responses[0] && responses[0].length > 0) {
                        const updatedOrders = responses[0];
                        const toUpdateFreight = [];
                        updatedOrders.map(order => {
                            if (order) {
                                const delivery = orderSelectedDelivery.get(order.ID);
                                if (delivery && delivery.IsPickup == false && parseFloat(delivery.ShippingCost) !== parseFloat(order.Freight)) {
                                    toUpdateFreight.push(order);
                                }
                            }
                        });
                        if (toUpdateFreight && toUpdateFreight.length > 0) {
                            promiseReUpdateFreights = Promise.all(toUpdateFreight.map(order => promiseUpdateOrderFreight(order.ID, orderSelectedDelivery.get(order.ID))));
                        }
                    }
                    promiseReUpdateFreights.then((responses) => {
                        Promise.all(Array.from(cartItemIdMap.entries()).map(entry => promiseUpdateOrderCarts(entry[0], entry[1]))).then((responses) => {
                            Promise.all(!isRequisition ? Orders.map(order => promiseUpdateInvoicePayments(order.MerchantDetail.ID, invoice.InvoiceNo)) : []).then((responses) => {
                                return res.send({ success: true, message: 'Success' });
                            });
                        });
                    });
                });
            } else {
                return res.send({
                    success: false,
                    message: 'Select delivery method before proceeding to payment'
                });
            }
        } else {
            return res.send({
                success: false,
                message: 'No order/s found.'
            });
        }
    });
});

checkoutRouter.get('/payment', authenticated, function (req, res) {
    const user = req.user;
    const invoiceNo = req.query['invoiceNo'];

    function buildStripeConfigs(stripePaymentGateway) {
        const paymentRequest = buildGenericPaymentRequest(null, stripePaymentGateway, req.Name, getHostname(req));
        const settings = paymentRequest.settings;

        return {
            gateway: settings.gateway,
            publicKey: settings.gatewayConfigs.find(g => g.key == 'publicKey').value,
            locale: 'auto',
            name: settings.gatewayConfigs.find(g => g.key == 'marketplaceName').value,
            is3dsEnabled: settings.gatewayConfigs.find(g => g.key == 'is3dsEnabled').value
        };
    }

    function buildOmiseConfigs(omisePaymentGateway) {
        const paymentRequest = buildGenericPaymentRequest(null, omisePaymentGateway, req.Name, getHostname(req));
        const settings = paymentRequest.settings;

        return {
            gateway: settings.gateway,
            publicKey: settings.gatewayConfigs.find(g => g.key == 'publicKey').value
        };
    }

    const promiseInvoiceDetails = new Promise((resolve, reject) => {
        client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoiceDetails]).then((responses) => {
        const invoiceDetails = responses[0];

        getValidPaymentGateways(invoiceDetails, (validPaymentGateways) => {
            const paymentMethods = validPaymentGateways.map((paymentGateway, index) => {
                let code = paymentGateway.Code;
                let configs = null;

                if (code.startsWith('stripe')) {
                    configs = buildStripeConfigs(paymentGateway);
                } else if (code.startsWith('omise')) {
                    configs = buildOmiseConfigs(paymentGateway);
                }

                return {
                    code: code,
                    gateway: paymentGateway.Gateway,
                    isSelected: index == 0,
                    configs: configs
                }
            });

            const buyerAddress = getDeliveryToAddress(invoiceDetails.Orders[0]);

            const store = Store.createCheckoutStore({
                userReducer: { user: user },
                checkoutReducer: {
                    buyerAddress: buyerAddress,
                    invoiceDetails: invoiceDetails,
                    paymentMethods: paymentMethods
                },
            });

            const app = reactDom.renderToString(
                <CheckoutPaymentComponent
                    user={user}
                    buyerAddress={buyerAddress}
                    invoiceDetails={invoiceDetails}
                    paymentMethods={paymentMethods} />);

            let seoTitle = 'Payment';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-payment', seoTitle, app, 'checkout-payment', store.getState()));
        });
    });
});

checkoutRouter.post('/payment', authenticated, function (req, res) {
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function generateCustomPayKey(invoiceDetails, paymentGateway, callback) {
        const endpoint = paymentGateway.Meta.endpoint;
        const expirationDate = Math.floor(new Date().getTime() / 1000) + 10800;

        const token = {
            code: paymentGateway.Code,
            invoiceNo: invoiceDetails.InvoiceNo,
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
                    invoiceno: invoiceDetails.InvoiceNo,
                    currency: invoiceDetails.CurrencyCode,
                    total: invoiceDetails.Total.toString(),
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
        }
        else {
            hashKey = encrypted;
            callback(generateUUID());
        }
    }

    function stripePayment(invoiceDetails, paymentRequest, callback) {
        function buildMetadata(payee) {
            let metadata = {};

            payee.items.forEach((item) => {
                metadata[item.id] = `${item.quantity} x ${item.name} - ${item.currency} ${item.price}`;
            });

            return metadata;
        }

        const settings = paymentRequest.settings;
        const payees = paymentRequest.payees;
        const payer = paymentRequest.payer;

        const is3dsEnabled = settings.gatewayConfigs.find(c => c.key == 'is3dsEnabled').value;

        if (is3dsEnabled == 'false') {
            const secretKey = settings.gatewayConfigs.find(c => c.key == 'secretKey').value;
            const stripe = require('stripe')(secretKey);

            stripe.customers.create({ description: stripeData.email, source: stripeData.id }).then((customer) => {
                let promiseTokens = [];

                payees.forEach((payee) => {
                    promiseTokens.push(stripe.tokens.create({ customer: customer.id }, { stripeAccount: payee.gatewayAccount }));
                });

                Promise.all(promiseTokens).then((tokens) => {
                    let promiseCharges = [];

                    payees.forEach((payee, index) => {
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

                        const promiseFulfilmentStatuses = new Promise((resolve, reject) => {
                            client.Orders.getFulfilmentStatuses(null, (err, statuses) => {
                                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                                resolve([]);
                            });
                        });

                        const promisePaymentStatuses = new Promise((resolve, reject) => {
                            client.Payments.getPaymentStatuses(null, (err, statuses) => {
                                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                                resolve([]);
                            });
                        });

                        Promise.all([promiseFulfilmentStatuses, promisePaymentStatuses]).then(statuses => {
                            const fulfilmentStatuses = statuses[0];
                            const paymentStatuses = statuses[1];

                            const acknowledgedFulfilmentStatus = fulfilmentStatuses.find(s => s.Name === "Acknowledged" && s.IsImplementationStatus == false);
                            const paidPaymentStatus = paymentStatuses.find(s => s.Name === "Paid" && s.IsImplementationStatus == false);
                            const data = {
                                balance: 0,
                            };
                            if (acknowledgedFulfilmentStatus && acknowledgedFulfilmentStatus.ID) {
                                data.fulfilmentStatusID = acknowledgedFulfilmentStatus.ID
                            }
                            if (paidPaymentStatus && paidPaymentStatus.ID) {
                                data.paymentStatusID = paidPaymentStatus.ID
                            }

                            const promises = promiseUpdateOrderDetails(invoiceDetails, data);

                            Promise.all(promises).then((responses) => {
                                let paymentRequests = [];

                                charges.forEach((charge, index) => {
                                    // merchant payment
                                    paymentRequests.push({
                                        orderId: charge.description.split('/')[1],
                                        payeeId: payees[index].internalUserId,
                                        status: 'Success',
                                        payKey: charge.id,
                                        transactionId: charge.id,
                                        gatewayTimestamp: charge.created,
                                        gatewayStatus: charge.status,
                                        gatewayReceiverId: payees[index].gatewayAccount,
                                        gatewaySenderId: customer.id,
                                        gatewayRef: charge.balance_transaction,
                                    });

                                    // admin payment
                                    paymentRequests.push({
                                        orderId: charge.description.split('/')[1],
                                        payeeId: null,
                                        status: 'Success',
                                        payKey: charge.id,
                                        transactionId: charge.application_fee,
                                        gatewayTimestamp: charge.created,
                                        gatewayStatus: charge.status,
                                        gatewayReceiverId: null,
                                        gatewaySenderId: customer.id,
                                        gatewayRef: charge.id,
                                    });
                                });

                                const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, null, paymentRequests);

                                Promise.all([promisePayment]).then((responses) => {
                                    callback();
                                });
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

    function paypalPayment(invoiceDetails, paymentRequest, callback) {
        const settings = paymentRequest.settings;
        const payees = paymentRequest.payees;

        const paypalSdk = require('paypal-adaptive')({
            userId: settings.gatewayConfigs.find(c => c.key == 'username').value,
            password: settings.gatewayConfigs.find(c => c.key == 'password').value,
            signature: settings.gatewayConfigs.find(c => c.key == 'signature').value,
            sandbox: settings.find(c => c.key == 'isSandbox').value
        });

        let receivers = [];
        payees.forEach((payee) => {
            receivers.push({
                email: payee.email,
                accountId: payee.gatewayAccount,
                amount: payee.total,
                primary: false,
                invoiceId: payee.invoiceNo
            });
        });

        const payload = {
            requestEnvelope: {
                errorLanguage: 'en_US',
                detailLevel: 'ReturnAll'
            },
            actionType: 'CREATE',
            currencyCode: invoiceDetails.CurrencyCode,
            feesPayer: 'EACHRECEIVER',
            memo: '',
            cancelUrl: settings.find(c => c.key == 'cancelUrl').value,
            returnUrl: settings.find(c => c.key == 'returnUrl').value,
            receiverList: {
                receiver: receivers
            }
        };

        paypalSdk.pay(payload, function (err, response) {
            if (err) {
                console.log(err);
            } else {

                const paymentOptions = {
                    payKey: response.payKey,
                    displayOptions: {
                        businessName: settings.find(c => c.key == 'marketplaceName').value
                    },
                    requestEnvelope: {
                        errorLanguage: 'en_US',
                        detailLevel: 'ReturnAll'
                    }
                };

                paypalSdk.setPaymentOptions(paymentOptions, function (err, response) {
                    //if (!string.IsNullOrEmpty(payKey)) {
                    //    string url = _isSandbox ? "https://www.sandbox.paypal.com" : "https://www.paypal.com";
                    //    string paymentUrl = $"{url}/cgi-bin/webscr?cmd=_ap-payment&paykey={payKey}";

                    //    redirectUrl.RedirectUrl = paymentUrl;
                    //    redirectUrl.ExtraInfo = new Dictionary < string, string > { { "GatewayPayKey", payKey }
                    //};
                    //}

                    const paymentData = {
                        orderId: invoiceDetails.Orders[0].ID,
                        status: 'Processing',
                        payKey: payKey
                    };

                    const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, paymentData);

                    Promise.all([promisePayment]).then((responses) => {
                        callback();
                    });
                });
            }
        });
    }

    function omisePayment(invoiceDetails, paymentRequest, callback) {
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
        const payer = paymentRequest.payer;
        const secretKey = settings.gatewayConfigs.find(c => c.key == 'secretKey').value;
        const omise = require('omise')({ secretKey: secretKey });

        omise.account.retrieve().then((account) => {
            const admin = account;

            let promiseRecipients = [];
            let transferRequests = [];
            let totalAmount = 0;
            let currencyCode = '';
            let invoiceNo = '';
            payees.forEach((payee) => {
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
                recipients.forEach((recipient) => {
                    if (!recipient.active || !recipient.verified) {
                        return callback('merchant omise account is not active/verified');
                    }
                });

                const chargeRequest = {
                    amount: totalAmount,
                    currency: currencyCode,
                    card: omiseData.token,
                    metadata: { invoiceNo: invoiceNo }
                };

                omise.charges.create(chargeRequest).then((charge) => {
                    if (charge.paid) {
                        let promiseTransferAmounts = [];

                        transferRequests.forEach((request) => {
                            if (hasSufficientTransferAmount(currencyCode, request.amount)) {
                                promiseTransferAmounts.push(omise.transfers.create(request));
                            }
                        });

                        Promise.all(promiseTransferAmounts).then((transfers) => {
                            const promiseFulfilmentStatuses = new Promise((resolve, reject) => {
                                client.Orders.getFulfilmentStatuses(null, (err, statuses) => {
                                    if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                                    resolve([]);
                                });
                            });

                            const promisePaymentStatuses = new Promise((resolve, reject) => {
                                client.Payments.getPaymentStatuses(null, (err, statuses) => {
                                    if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                                    resolve([]);
                                });
                            });

                            Promise.all([promiseFulfilmentStatuses, promisePaymentStatuses]).then(statuses => {
                                const fulfilmentStatuses = statuses[0];
                                const paymentStatuses = statuses[1];

                                const acknowledgedFulfilmentStatus = fulfilmentStatuses.find(s => s.Name === "Acknowledged" && s.IsImplementationStatus == false);
                                const paidPaymentStatus = paymentStatuses.find(s => s.Name === "Paid" && s.IsImplementationStatus == false);
                                const data = {
                                    balance: 0,
                                };
                                if (acknowledgedFulfilmentStatus && acknowledgedFulfilmentStatus.ID) {
                                    data.fulfilmentStatusID = acknowledgedFulfilmentStatus.ID
                                }
                                if (paidPaymentStatus && paidPaymentStatus.ID) {
                                    data.paymentStatusID = paidPaymentStatus.ID
                                }

                                const promiseOrders = promiseUpdateOrderDetails(invoiceDetails, data);
                                Promise.all(promiseOrders).then((responses) => {
                                    let paymentRequests = [];

                                    payees.forEach((payee) => {
                                        let transfer = transfers.length > 0 ? transfers.find(t => t.recipient == payee.gatewayAccount) : null;
                                        if (transfer && transfer.failure_code) {
                                            return callback('omise transfer failed: ' + transfer.failure_message);
                                        }

                                        // merchant payment
                                        paymentRequests.push({
                                            orderId: payee.reference.split('/')[1],
                                            payeeId: payee.internalUserId,
                                            status: 'Success',
                                            payKey: transfer ? transfer.id : `Arcadier-${payee.reference}`,
                                            transactionId: transfer ? transfer.transaction : `Arcadier-${payee.reference}`,
                                            gatewayTimestamp: Math.floor(new Date().getTime() / 1000), // TODO: get from transfer result (convert first to unix epoch)
                                            gatewayStatus: 'Send'
                                        });

                                        // admin payment
                                        paymentRequests.push({
                                            orderId: payee.reference.split('/')[1],
                                            payeeId: null,
                                            status: 'Success',
                                            payKey: transfer ? transfer.id : `Arcadier-${payee.reference}`,
                                            transactionId: transfer ? transfer.transaction : `Arcadier-${payee.reference}`,
                                            gatewayTimestamp: Math.floor(new Date().getTime() / 1000),
                                            gatewayStatus: 'Send'
                                        });
                                    });

                                    const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, null, paymentRequests);

                                    Promise.all([promisePayment]).then((responses) => {
                                        callback();
                                    });
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

    const user = req.user;
    const invoiceNo = req.body['invoiceNo'];
    const gatewayCode = req.body['gatewayCode'];
    const stripeData = req.body['stripe'] ? JSON.parse(req.body['stripe']) : null;
    const omiseData = req.body['omise'] ? JSON.parse(req.body['omise']) : null;

    let hashKey = '';

    const promiseInvoiceDetails = new Promise((resolve, reject) => {
        client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo, includes: 'Transaction.Orders.PaymentDetails' }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoiceDetails]).then((responses) => {
        const invoiceDetails = responses[0];

        getValidPaymentGateways(invoiceDetails, (validPaymentGateways) => {
            const selectedPaymentGateway = validPaymentGateways.find(p => p.Code == gatewayCode);
            const isCustomPayment = !EnumCoreModule.GetNonCustomGatewayCodes().includes(gatewayCode);

            if (selectedPaymentGateway) {
                Promise.all([promiseUpdatePaymentDetails(invoiceDetails, { gatewayCode: gatewayCode })]).then((responses) => {
                    if (isCustomPayment) {
                        if (gatewayCode.includes('-cash-on-delivery-') || (selectedPaymentGateway.Meta.endpoint === '' && selectedPaymentGateway.Meta.redirect === '')) {
                            const payKey = generateUUID();
                            const timestamp = Math.floor(new Date().getTime() / 1000);
                            const promiseInvoiceCosmetic = promiseCreateInvoiceCosmetic(invoiceDetails.InvoiceNo);

                            Promise.all([promiseInvoiceCosmetic]).then((responses) => {
                                const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, { status: 'Waiting For Payment', payKey: payKey, transactionId: payKey, gatewayTimestamp: timestamp });

                                Promise.all([promisePayment]).then((responses) => {
                                    res.send({ success: true });
                                });
                            });
                        } else {
                            generateCustomPayKey(invoiceDetails, selectedPaymentGateway, (payKey) => {
                                if (!payKey) {
                                    return res.send({ success: false, error: 'no paykey found' });
                                }

                                const promiseInvoiceCosmetic = promiseCreateInvoiceCosmetic(invoiceDetails.InvoiceNo);

                                Promise.all([promiseInvoiceCosmetic]).then((responses) => {
                                    const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, { status: 'Processing', payKey: payKey });

                                    Promise.all([promisePayment]).then((responses) => {
                                        if (process.env.NODE_ENV !== 'development') {
                                            const redirectUrl = selectedPaymentGateway.Meta.redirect + '?paykey=' + payKey + '&invoiceno=' + invoiceDetails.InvoiceNo;
                                            res.send({ success: true, url: redirectUrl });
                                        } else {
                                            const options = {
                                                url: getHostname(req) + '/checkout/transaction-status',
                                                method: 'post',
                                                data: {
                                                    gateway: gatewayCode,
                                                    invoiceNo: invoiceNo,
                                                    payKey: payKey,
                                                    hashKey: hashKey,
                                                    status: 'success'
                                                }
                                            };

                                            requestApi(options, (err, result) => {
                                                if (err) {
                                                    return res.send({ success: false, error: err });
                                                }
                                                res.send({ success: true });
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    } else {
                        const promiseInvoiceCosmetic = promiseCreateInvoiceCosmetic(invoiceDetails.InvoiceNo);

                        Promise.all([promiseInvoiceCosmetic]).then((responses) => {
                            const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, { status: 'Processing' });

                            Promise.all([promisePayment]).then((responses) => {
                                const paymentRequest = buildGenericPaymentRequest(invoiceDetails, selectedPaymentGateway, req.Name, getHostname(req));

                                if (paymentRequest.settings.gateway.startsWith('stripe')) {
                                    stripePayment(invoiceDetails, paymentRequest, (error) => {
                                        if (error) {
                                            return res.send({ success: false, error: error });
                                        }
                                        res.send({ success: true });
                                    });
                                }

                                if (paymentRequest.settings.gateway.startsWith('paypal')) {
                                    paypalPayment(invoiceDetails, paymentRequest, (error) => {
                                        if (error) {
                                            return res.send({ success: false, error: error });
                                        }
                                        res.send({ success: true });
                                    });
                                }

                                if (paymentRequest.settings.gateway.startsWith('omise')) {
                                    omisePayment(invoiceDetails, paymentRequest, (error) => {
                                        if (error) {
                                            return res.send({ success: false, error: error });
                                        }
                                        res.send({ success: true });
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    });
});

checkoutRouter.get('/order-details', function (req, res) {
    const gateway = req.query['gateway'];
    const invoiceNo = req.query['invoiceNo'];
    const payKey = req.query['payKey'];
    const hashKey = req.query['hashKey'];

    if (gateway && invoiceNo && payKey && hashKey && isValidHashKey(gateway, invoiceNo, hashKey)) {
        const promiseInvoiceDetails = new Promise((resolve, reject) => {
            client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo, includes: 'Transaction.Orders.PaymentDetails' }, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseInvoiceDetails]).then((responses) => {
            const invoiceDetails = responses[0];
            let payeeInfos = [];

            invoiceDetails.Orders.forEach(function (order) {
                order.PaymentDetails.forEach(function (payment) {
                    if (payment.GatewayPayKey == payKey) {
                        if (payment.Payee.ID === order.MerchantDetail.ID) {
                            let items = [];

                            order.CartItemDetails.forEach(function (cart) {
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
                                Reference: invoiceDetails.InvoiceNo + '/' + order.ID,
                                Id: payment.Payee.ID,
                                Name: order.MerchantDetail.DisplayName || (order.MerchantDetail.FirstName + ' ' + order.MerchantDetail.LastName),
                                Email: order.MerchantDetail.Email
                            });
                        }
                    }
                });
            });

            let payer = null;

            if (invoiceDetails.Orders[0]) {
                const order = invoiceDetails.Orders[0];

                payer = {
                    Id: order.ConsumerDetail.ID,
                    Name: order.ConsumerDetail.DisplayName || (order.ConsumerDetail.FirstName + ' ' + order.ConsumerDetail.LastName),
                    Email: order.ConsumerDetail.Email
                }
            }

            res.send({
                PayeeInfos: payeeInfos,
                InvoiceNo: invoiceDetails.InvoiceNo,
                Payer: payer
            });
        });
    } else {
        res.send({});
    }
});

checkoutRouter.get('/transaction-status', function (req, res) {
    const gateway = req.query['gateway'];
    const invoiceNo = req.query['invoiceNo'];
    const payKey = req.query['payKey'];
    const hashKey = req.query['hashKey'];
    const status = req.query['status'];
    updateCustomPaymentTransactionStatus(gateway, invoiceNo, payKey, hashKey, status, (result) => {
        if (result.success) {
            if (status == 'failed') {
                res.redirect('/checkout/one-page-checkout?invoiceNo=' + invoiceNo);
            }
            else {
                res.redirect('/checkout/transaction-complete?invoiceNo=' + invoiceNo);
            }
        } else {
            const ErrorComponent = require('../views/error');
            res.send(reactDom.renderToString(<ErrorComponent message={'Error: ' + result.error} />));
        }
    });
});

checkoutRouter.post('/transaction-status', function (req, res) {
    const gateway = req.body['gateway'];
    const invoiceNo = req.body['invoiceNo'];
    const payKey = req.body['payKey'];
    const hashKey = req.body['hashKey'];
    const status = req.body['status'];

    updateCustomPaymentTransactionStatus(gateway, invoiceNo, payKey, hashKey, status, (result) => {
        res.send(result);
    });
});

checkoutRouter.get('/current-status', function (req, res) {
    const invoiceNo = req.query['invoiceNo'];

    const promiseInvoiceDetails = new Promise((resolve, reject) => {
        client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo, includes: 'Transaction.Orders.PaymentDetails' }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoiceDetails]).then((responses) => {
        const invoiceDetails = responses[0];
        let hasUnsuccessfulPayment = false;

        invoiceDetails.Orders.forEach((order) => {
            order.PaymentDetails.forEach((payment) => {
                if (!payment.Status || payment.Status.toLowerCase() !== 'success') {
                    hasUnsuccessfulPayment = true;
                }
            });
        });

        if (!hasUnsuccessfulPayment) {
            return res.redirect('/checkout/transaction-complete?invoiceNo=' + invoiceNo);
        }

        // TODO: show other appropriate pages based on payment status
        res.send('payment status is not successful yet');
    });
});

checkoutRouter.post('/generate-stripe-session-id', authenticated, function (req, res) {
    const invoiceNo = req.body['invoiceNo'];
    const gatewayCode = req.body['gatewayCode'];

    const promiseInvoiceDetails = new Promise((resolve, reject) => {
        client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo, includes: 'Transaction.Orders.PaymentDetails' }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInvoiceDetails]).then((responses) => {
        const invoiceDetails = responses[0];

        getValidPaymentGateways(invoiceDetails, (validPaymentGateways) => {
            const selectedPaymentGateway = validPaymentGateways.find(p => p.Code == gatewayCode);

            if (selectedPaymentGateway.Code.startsWith('stripe')) {
                const paymentRequest = buildGenericPaymentRequest(invoiceDetails, selectedPaymentGateway, req.Name, getHostname(req));
                const settings = paymentRequest.settings;
                const payee = paymentRequest.payees[0];

                if (settings.gatewayConfigs.find(c => c.key == 'is3dsEnabled').value == 'true') {
                    const secretKey = settings.gatewayConfigs.find(c => c.key == 'secretKey').value;
                    const stripe = require('stripe')(secretKey);

                    stripe.accounts.retrieve(payee.gatewayAccount).then((account) => {
                        let amount = parseInt(payee.total);
                        let applicationFeeAmount = parseInt(payee.fee);
                        if (!EnumCoreModule.GetStripeCurrenciesNoMinors().includes(payee.currency)) {
                            amount = parseInt(payee.total * 100);
                            applicationFeeAmount = parseInt(payee.fee * 100);
                        }

                        let descriptions = [];
                        payee.items.forEach((item) => {
                            if (item.id != 'Freight' && item.id != 'AdminFee') {
                                descriptions.push(`${item.quantity} x ${item.name}`);
                            }
                        });

                        let request = {
                            success_url: settings.returnUrl,
                            cancel_url: settings.cancelUrl,
                            payment_method_types: ['card'],
                            line_items: [{
                                name: 'Invoice: ' + (payee.CosmeticNo != null && payee.CosmeticNo != "" ? payee.CosmeticNo : payee.invoiceNo),
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
                            const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, { gatewayCode: selectedPaymentGateway.Code, payKey: session.id, status: 'Processing' });

                            Promise.all([promisePayment]).then((responses) => {
                                res.send({ sessionId: session.id, account: payee.gatewayAccount });
                            });
                        }).catch((error) => {
                            res.send({ error: 'stripe create session error: ' + error.raw.message });
                        });

                    }).catch((error) => {
                        res.send({ error: 'stripe retrieve account error: ' + error.raw.message });
                    });
                }
            }
        });
    });
});

checkoutRouter.get('/payment-gateway/success', function (req, res) {
    const gateway = req.query['gateway'];
    const invoiceNo = req.query['invoiceNo'];
    const sessionId = req.query['session_id'];

    if (!gateway) {
        return res.send('Gateway not found');
    }

    if (gateway.startsWith('stripe')) {
        if (!invoiceNo || !sessionId) {
            return res.send('Invoice no. or session id not found');
        }

        const promiseInvoiceDetails = new Promise((resolve, reject) => {
            client.Orders.getInvoiceNumberDetails({ invoiceNo: invoiceNo, includes: 'Transaction.Orders.PaymentDetails' }, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseInvoiceDetails]).then((responses) => {
            const invoiceDetails = responses[0];
            let hasInvalidPayment = false;

            invoiceDetails.Orders.forEach((order) => {
                order.PaymentDetails.forEach((payment) => {
                    if ((payment.Status && payment.Status.toLowerCase() == 'success') || payment.GatewayPayKey != sessionId) {
                        hasInvalidPayment = true;
                    }
                });
            });

            if (hasInvalidPayment) {
                return res.send('Invalid payment records');
            }

            getValidPaymentGateways(invoiceDetails, (validPaymentGateways) => {
                const selectedPaymentGateway = validPaymentGateways.find(p => p.Code == gateway);
                if (!selectedPaymentGateway) {
                    return res.send('Invalid payment gateway');
                }

                const paymentRequest = buildGenericPaymentRequest(invoiceDetails, selectedPaymentGateway);
                const settings = paymentRequest.settings;
                const payee = paymentRequest.payees[0];

                const secretKey = settings.gatewayConfigs.find(c => c.key == 'secretKey').value;
                const stripe = require('stripe')(secretKey);

                stripe.checkout.sessions.retrieve(sessionId, { stripeAccount: payee.gatewayAccount }).then((session) => {
                    stripe.paymentIntents.retrieve(session.payment_intent, { stripeAccount: payee.gatewayAccount }).then((paymentIntent) => {
                        const promiseFulfilmentStatuses = new Promise((resolve, reject) => {
                            client.Orders.getFulfilmentStatuses(null, (err, statuses) => {
                                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                                resolve([]);
                            });
                        });

                        const promisePaymentStatuses = new Promise((resolve, reject) => {
                            client.Payments.getPaymentStatuses(null, (err, statuses) => {
                                if (statuses && statuses.Records && statuses.Records.length > 0) resolve(statuses.Records);
                                resolve([]);
                            });
                        });

                        Promise.all([promiseFulfilmentStatuses, promisePaymentStatuses]).then(statuses => {
                            const fulfilmentStatuses = statuses[0];
                            const paymentStatuses = statuses[1];

                            const acknowledgedFulfilmentStatus = fulfilmentStatuses.find(s => s.Name === "Acknowledged" && s.IsImplementationStatus == false);
                            const paidPaymentStatus = paymentStatuses.find(s => s.Name === "Paid" && s.IsImplementationStatus == false);
                            const updateStatus = {
                                balance: 0,
                            };

                            if (gateway.toLowerCase().indexOf("cash on delivery") > -1) {
                                updateStatus.paymentStatusID = paidPaymentStatus ? paidPaymentStatus.ID : null;
                            } else {
                                updateStatus.paymentStatusID = paidPaymentStatus ? paidPaymentStatus.ID : null;
                                updateStatus.fulfilmentStatusID = acknowledgedFulfilmentStatus ? acknowledgedFulfilmentStatus.ID : null;
                            }

                            const promises = promiseUpdateOrderDetails(invoiceDetails, updateStatus);

                            Promise.all(promises).then((responses) => {
                                const charge = paymentIntent.charges.data[0];
                                const merchantData = {
                                    orderId: invoiceDetails.Orders[0].ID,
                                    payeeId: payee.internalUserId,
                                    status: 'Success',
                                    payKey: charge.id,
                                    transactionId: charge.id,
                                    gatewayTimestamp: charge.created,
                                    gatewayStatus: charge.status,
                                    gatewayReceiverId: payee.gatewayAccount,
                                    gatewaySenderId: charge.customer,
                                    gatewayRef: charge.balance_transaction,
                                };

                                const adminData = {
                                    orderId: invoiceDetails.Orders[0].ID,
                                    payeeId: null,
                                    status: 'Success',
                                    payKey: charge.id,
                                    transactionId: charge.application_fee,
                                    gatewayTimestamp: charge.created,
                                    gatewayStatus: charge.status,
                                    gatewayReceiverId: null,
                                    gatewaySenderId: charge.customer,
                                    gatewayRef: charge.id,
                                };

                                const promisePayment = promiseUpdatePaymentDetails(invoiceDetails, null, [merchantData, adminData]);

                                Promise.all([promisePayment]).then((responses) => {
                                    const cartItem = invoiceDetails.Orders[0].CartItemDetails[0];
                                    const user = req.user || invoiceDetails.Orders[0].ConsumerDetail;

                                    const promiseQuotation = getOfferByCartItemID(user.ID, cartItem.ID);

                                    Promise.all([promiseQuotation]).then((responses) => {
                                        const quotation = responses[0];

                                        if (quotation) {
                                            if (!quotation.Accepted && !quotation.Declined && quotation.MessageType !== 'CANCELLED') {
                                                const message = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
                                                    `<p class=\"chat-system-generated-msg\" data-msg-type=\"accepted-quotation\">Quotation has been accepted!</p>`;

                                                const promiseUpdateQuotation = new Promise((resolve, reject) => {
                                                    const options = {
                                                        userId: user.ID,
                                                        quotationId: quotation.ID,
                                                        accepted: true,
                                                        declined: false,
                                                        messageType: 'ACCEPTED',
                                                        message: message
                                                    };

                                                    client.Quotations.updateQuotation(options, (err, result) => {
                                                        resolve(result);
                                                    });
                                                });

                                                const promiseChatMessage = new Promise((resolve, reject) => {
                                                    const options = {
                                                        userId: user.ID,
                                                        channelId: quotation.ChannelID,
                                                        message: message
                                                    };

                                                    client.Chat.createChannelMessage(options, (err, result) => {
                                                        resolve(result);
                                                    });
                                                });

                                                Promise.all([promiseUpdateQuotation, promiseChatMessage]).then((responses) => {

                                                });
                                            }
                                        }

                                        res.redirect('/checkout/transaction-complete?invoiceNo=' + invoiceDetails.InvoiceNo);
                                    });
                                });
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
    }
});

checkoutRouter.post('/create-requisition', authenticated, function (req, res) {
    const user = req.user;
    const orderId = req.body['orderId'];
    const department = req.body['department'];
    const workflow = req.body['workflow'];

    let status = 'Approved';
    let metadata = null;
    if (department && workflow) {
        status = 'Pending';
        metadata = JSON.stringify({
            Department: JSON.parse(department),
            Workflow: JSON.parse(workflow)
        });
    }

    const promiseRequisition = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            requisitionOrderNo: 'PR' + new Date().getTime().toString(),
            requestorName: user.FirstName + ' ' + user.LastName,
            metadata: metadata,
            status: status,
            orderId: orderId
        };

        client.Requisitions.createRequisition(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRequisition]).then((responses) => {
        const requisition = responses[0];

        const promiseUpdateOrders = new Promise((resolve, reject) => {
            const options = {
                orders: [{
                    orderId: orderId,
                    requisitionId: requisition.ID
                }]
            };

            client.Orders.updateOrderDetails(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseUpdateOrders]).then((responses) => {
            res.send(requisition);
        });
    });
});

checkoutRouter.get('/requisition-created', authenticated, function (req, res) {
    const user = req.user;
    const requisitionId = req.query['id'];
    const requisitionOrderNo = req.query['orderNo'];
    const cosmeticNo = req.query['cosmeticNo'];

    if (process.env.CHECKOUT_FLOW_TYPE != 'b2b')
        return res.redirect('/');

    const CheckoutCompleteComponent = require('../views/features/checkout_flow_type/b2b/checkout-complete/index').CheckoutCompleteComponent;

    const requisitionDetail = {
        ID: requisitionId,
        RequisitionOrderNo: requisitionOrderNo,
        CosmeticNo: cosmeticNo
    };

    const reduxState = Store.createRequisitionStore({
        userReducer: {
            user: user
        },
        requisitionReducer: {
            requisitionDetail: requisitionDetail
        }
    }).getState();

    const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
    const app = reactDom.renderToString(<CheckoutCompleteComponent user={user} requisitionDetail={requisitionDetail} />);

    res.send(template('requisition-complete', seoTitle, app, 'checkout-requisition-created', reduxState));
});

checkoutRouter.post('/createInvoiceCosmetic', function (req, res) {

    const invoiceNo = req.body['invoiceNo'];

    let promiseCreateInvoiceCosmetic = new Promise((resolve, reject) => {
        client.Payments.postCreateInvoiceCosmetic({ invoiceNo: invoiceNo }, function (err, invoiceNumberDetails) {
            resolve(invoiceNumberDetails);
        });
    });

    Promise.all([promiseCreateInvoiceCosmetic]).then((responses) => {
        res.send(responses[0]);
    });

});

module.exports = checkoutRouter;