'use strict';
let React = require('react');
let reactDom = require('react-dom/server');
let template = require('../views/layouts/template');
let express = require('express');
let requestApi = require('../scripts/shared/request-api');
let userRouter = express.Router();
let authenticated = require('../scripts/shared/authenticated');
let authorizedUser = require('../scripts/shared/authorized-user');
let Store = require('../redux/store');
let UserSettingsIndexComponent = require('../views/user/settings/index').UserSettingsIndexComponent;

let client = require('../../sdk/client');
const multer = require('multer');
const uploadMulter = multer();
const FormData = require('form-data');

let passport = require('passport');
let EnumCoreModule = require('../public/js/enum-core');
const ErrorComponent = require('../views/error');

const crypto = require('crypto');

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

function getHostname(req) {
    var fullUrl = req.protocol + '://' + req.get('host');
    return fullUrl;
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

const viewSettingsPage = {
    code: 'view-consumer-profile-api',
    renderSidebar: false
};


/* GET users listing. */
userRouter.get('/', authenticated, function(req, res) {
    res.send('respond with a resource');
});

userRouter.get('/settings', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewSettingsPage), function (req, res) {
    var promiseUserDetails = new Promise((resolve, reject) => {
        let options = {
            userId: req.user.ID,
            includes: 'UserLogins,Addresses', 
            includeUserCustomFields: true
        };
        client.Users.getUserDetails(options, function (err, userDetails) {
            resolve(userDetails)
        });
    });

    var promiseCustomFieldDefinition = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions('Users', function (err, addresses) {
            resolve(addresses);
        });
    });

    Promise.all([promiseUserDetails, promiseCustomFieldDefinition]).then((responses) => {
        const appString = 'user-setting';
        let user = responses[0];
        let customDefintion = responses[1];
        let addresses = user.Addresses || [];
        let userLogins = user.UserLogins;

        getUserPermissionsOnPage(req.user, 'Profile', 'Consumer', (pagePermissions) => {
            getUserPermissionsOnPage(req.user, 'Addresses', 'Consumer', (addressPermissions) => {
                const s = Store.createSettingsStore({
                    settingsReducer: {
                        addresses: addresses,
                        addressPermissions: addressPermissions,
                        userLogins: userLogins,
                        customFieldDefinition: customDefintion.Records
                    },
                    userReducer: {
                        user: user,
                        pagePermissions
                    },
                    currentUserReducer: {
                        user: req.user
                    }
                });

                let seoTitle = 'User Settings Page';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const reduxState = s.getState();
                const settingsIndex = reactDom.renderToString(<UserSettingsIndexComponent currentUser={req.user} pagePermissions={pagePermissions} addressPermissions={addressPermissions} customFieldDefinition={customDefintion.Records} user={user} addresses={addresses} userLogins={userLogins} />);
                res.send(template('page-settings', seoTitle, settingsIndex, appString, reduxState));
            })
        })
    });
});

userRouter.put('/update', authenticated, function (req, res) {
    if (!req.user) {
        //Guest User
        if (req.body['guestUserID']) {
            req.user = { ID: req.body['guestUserID'] };
        }
    }
    let userID = req.user.ID;
    if (req.body['updateSubAccount'] == true && req.user.AccountOwnerID !== null && req.user.SubBuyerID) {
        userID = req.user.SubBuyerID;
    }
    
    var promiseUpdateUserInfo = new Promise((resolve, reject) => {
        client.Users.updateUser(userID, req.body, function(err, userInfo) {
            resolve(userInfo);
        });
    });

    Promise.all([promiseUpdateUserInfo]).then((responses) => {
        let userInfo = responses[0];
        if (req.user && req.user.AccountOwnerID !== null) {
            if (req.body['updateSubAccount'] == true) {
                req.user.FirstName = userInfo.FirstName;
                req.user.LastName = userInfo.LastName;
                req.user.Email = userInfo.Email;
                req.user.PhoneNumber = userInfo.PhoneNumber;
            }

            userInfo = {
                ...req.user,
                CustomFields: userInfo.CustomFields
            };
        } 

        req.logIn(userInfo, function (err) {
            if (err) {
                return res.redirect('/error');
            }

            res.send(userInfo);
        });
    });
});

userRouter.post('/register-with-username-and-password', passport.authenticate('login', { failureRedirect: '/accounts/buyer/sign-in?error=invalid-login' }), function (req, res) {
    var promiseUpdateUserInfo = new Promise((resolve, reject) => {
        client.Accounts.registerWithUsernameAndPassword(req.body, function (err, userInfo) {
            resolve(userInfo);
        });
    });

    Promise.all([promiseUpdateUserInfo]).then((responses) => {
        const result = responses[0];

        if (typeof result.access_token != 'undefined') {
            var maxAge = result.expires_in * 1000;
            res.cookie('webapitoken', result.access_token, { maxAge: maxAge, httpOnly: false });

            res.redirect('/');
        }
    });
});

userRouter.post('/profile/media', authenticated, uploadMulter.any(), function(req, res) {
    const file = req.files[0];

    const formData = new FormData();
    formData.append('userMedia', file.buffer, { filename: file.originalname });

    const options = {
        userId: req.user.ID,
        purpose: 'users',
        formData: formData
    };

    var promiseMedia = new Promise((resolve, reject) => {
        client.Media.uploadMedia(options, function(err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMedia]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

userRouter.post('/profile/custom-field-media', authenticated, uploadMulter.any(), function (req, res) {
    const file = req.files[0];
    const { customFieldCode, fileName } = req.body;

    const formData = new FormData();
    formData.append('userMedia', file.buffer, { filename: fileName });

    const options = {
        userId: req.user.ID,
        purpose: 'users',
        formData: formData
    };

    var promiseMedia = new Promise((resolve, reject) => {
        client.Media.uploadMedia(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMedia]).then((responses) => {
        const result = responses[0];
        res.send({ result, customFieldCode: customFieldCode });
    });
});

userRouter.post('/profile/multiple-custom-field-media', authenticated, uploadMulter.any(), function (req, res) {
    const formData = new FormData();

    req.files.forEach(file => {
        formData.append(file.fieldname, file.buffer, { filename: file.originalname });
    });

    const options = {
        userId: req.user.ID,
        purpose: 'users',
        formData: formData
    };

    var promiseMedia = new Promise((resolve, reject) => {
        client.Media.uploadMedia(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMedia]).then((responses) => {
        res.send(responses[0]);
    });
});

userRouter.post('/profile/pdf', authenticated, uploadMulter.any(), function (req, res) {
    
    const file = req.files[0];
    const code = req.body.customFieldCode;
    const fileName = req.body.filename;
    
    let formData = new FormData();
    formData.append('file', file.buffer, { filename: fileName });

    const options = {
        userId: req.user.ID,
        purpose: 'users',
        formData: formData
    };

    var promiseFile = new Promise((resolve, reject) => {
        client.Files.uploadFile(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseFile]).then((responses) => {
        const result = responses[0];
        res.send({ result, customFieldCode: code });
    });
});

userRouter.get('/privatemarketplace/registration', function (req, res) {
    let token = req.query['token'];
    let isSeller = req.query['isSeller'];

    if (isSeller == 'True')
        res.redirect('/accounts/seller/register?token=' + token);
    else
        res.redirect('/accounts/buyer/register?token=' + token);

});

userRouter.post('/address/create', authenticated, function (req, res) {
    if (!req.user) {
        req.user = { ID: req.body.guestUserID };
    }

    let userId = req.user.ID;
    var promiseCreateAddress = new Promise((resolve, reject) => {
        client.Addresses.createAddress(userId, req.body, function (err, address) {
            resolve(address);
        });
    });

    Promise.all([promiseCreateAddress]).then((responses) => {
        const createAddress = responses[0];
        res.send(createAddress);
    });
});

userRouter.post('/address/delete', authenticated, function (req, res) {
    let userId = req.user.ID;
    let addressId = req.body.addressId;

    var promiseDeleteAddress = new Promise((resolve, reject) => {
        client.Addresses.deleteAddress(userId, addressId, function (err, address) {
            resolve(address);
        });
    });

    Promise.all([promiseDeleteAddress]).then((responses) => {
        const deleteAddress = responses[0];
        res.send(deleteAddress);
    });
});

userRouter.get('/checkout/order-details-old', function (req, res) {
    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    const options = {
        url: getHostname(req) + `/${path}/order-details`,
        method: 'get',
        data: {
            gateway: req.query['gateway'],
            invoiceNo: req.query['invoiceNo'],
            payKey: req.query['paykey'],
            hashKey: req.query['hashkey']
        }
    };

    try {
        requestApi(options, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.send(result);
        });
    } catch (err) {
        res.send(err);
    }
});

userRouter.get('/checkout/order-details', function (req, res) {
    const { gateway, invoiceNo, paykey, hashkey } = req.query;

    if (gateway && invoiceNo && paykey && hashkey && isValidHashKey(gateway, invoiceNo, hashkey)) {
        const promiseInvoice = new Promise((resolve, reject) => {
            const options = {
                invoiceNo: invoiceNo,
                includes: 'Transaction.Orders.PaymentDetails'
            };

            client.Orders.getInvoiceNumberDetails(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseInvoice]).then((responses) => {
            const invoice = responses[0];
            let payeeInfos = [];

            invoice.Orders.forEach((order) => {
                order.PaymentDetails.forEach((payment) => {
                    if (payment.GatewayPayKey == paykey) {
                        if (payment.Payee.ID === order.MerchantDetail.ID) {
                            let items = [];

                            order.CartItemDetails.forEach((cart) => {
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

userRouter.post('/checkout/transaction-status', function (req, res) {
    const options = {
        url: getHostname(req) + '/checkout/transaction-status',
        method: 'post',
        data: {
            gateway: req.body['gateway'],
            invoiceNo: req.body['invoiceNo'],
            payKey: req.body['paykey'],
            hashKey: req.body['hashkey'],
            status: req.body['status']
        }
    };

    requestApi(options, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(result);
    });
});

userRouter.get('/checkout/current-status', function (req, res) {
    const { invoiceNo } = req.query;
    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    res.redirect(`/${path}/current-status?invoiceNo=${invoiceNo}`);
});

userRouter.get('/checkout/payment-success', function (req, res) {
    const gateway = req.query['gateway'];
    const invoiceNo = req.query['invoiceNo'];
    const payKey = req.query['paykey'];
    const hashKey = encodeURIComponent(req.query['hashkey']);
    const status = 'success';

    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    res.redirect(`/${path}/transaction-status?gateway=${gateway}&invoiceNo=${invoiceNo}&payKey=${payKey}&hashKey=${hashKey}&status=${status}`);
});

userRouter.get('/checkout/payment-failure', function (req, res) {
    const gateway = req.query['gateway'];
    const invoiceNo = req.query['invoiceNo'];
    const payKey = req.query['paykey'];
    const hashKey = encodeURIComponent(req.query['hashkey']);
    const status = 'failed';

    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    res.redirect(`/${path}/transaction-status?gateway=${gateway}&invoiceNo=${invoiceNo}&payKey=${payKey}&hashKey=${hashKey}&status=${status}`);
});

userRouter.get('/marketplace/be-seller', function (req, res) {
    res.redirect('/accounts/non-private/be-seller');
});

userRouter.get('/marketplace/customlogin', function (req, res) {
    const isSeller = req.query['isSeller'] || false;

    res.redirect('/accounts/non-private/sign-in?isSeller=' + isSeller);
});

userRouter.get('/locations', authenticated, (req, res) => {
    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseMarketplaceInfo]).then((responses) => {
        const marketplaceInfo = responses[0];

        const promiseLocationVariants = new Promise((resolve, reject) => {
            let locationVariantGroupId = null;

            if (marketplaceInfo && marketplaceInfo.CustomFields) {
                const locationCustomField = marketplaceInfo.CustomFields.find(c => c.Code.startsWith('locationid'));

                if (locationCustomField && locationCustomField.Values.length > 0) {
                    locationVariantGroupId = locationCustomField.Values[0];
                }
            }

            if (locationVariantGroupId) {
                client.Items.getAdminVariantsByGroupId({ variantGroupId: locationVariantGroupId }, (err, result) => {
                    resolve(result);
                });
            } else {
                resolve([]);
            }
        });

        Promise.all([promiseLocationVariants]).then((responses) => {
            res.send(responses[0]);
        });
    });
});

userRouter.post('/customFieldDefinition', authenticated, (req, res) => {
    const data = {
        customField: {
            'Name': req.body['Name'],
            'DataInputType': req.body['DataInputType'],
            'DataFieldType': req.body['DataFieldType'],
            'ReferenceTable': req.body['ReferenceTable'],
            'IsMandatory': false,
            'IsComparable': false
        }
    };

    const promiseCustomFieldDefinition = new Promise((resolve, reject) => {
        client.CustomFields.create(data, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseCustomFieldDefinition]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

module.exports = userRouter;