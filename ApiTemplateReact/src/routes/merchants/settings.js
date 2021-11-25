'use strict';
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../../views/layouts/template');
var express = require('express');
var merchantRouter = express.Router();
var Store = require('../../redux/store');
var EnumCoreModule = require('../../public/js/enum-core');

var MerchantSettingsIndexComponent = require('../../views/merchant/settings/index').MerchantSettingsIndexComponent;

var authenticated = require('../../scripts/shared/authenticated');
var authorizedMerchant = require('../../scripts/shared/authorized-merchant');

var client = require('../../../sdk/client');

var handlers = [authenticated, authorizedMerchant];

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../../scripts/shared/user-permissions');

const viewSettingsPage = {
    code: 'view-merchant-profile-api',
    renderSidebar: false
};

function getHostname(req) {
    var fullUrl = req.protocol + '://' + req.get('host');
    return fullUrl;
}

function buildExternalLoginUrl(hostname, provider, clientId = '', token = '', redirectUrl = '', userID = '') {

    let theUrl = process.env.OAUTH_URL

    if (provider == 'Stripe' || provider == 'PayPal')
        theUrl = process.env.BASE_URL

    let url = process.env.PROTOCOL + '://' + theUrl + '/oauth2/authorize?response_type=code';
    url += '&client_id=' + (clientId ? clientId : process.env.CLIENT_ID);
    url += '&provider=' + provider;
    let urlRedirect = '/merchants/settings';

    url += '&redirect_uri=' + encodeURIComponent(hostname + urlRedirect + '?tab=payment&userId=' + userID);
    if (token) {
        url += '&token=' + token;
    }
    return url;
}

merchantRouter.get('/', ...handlers, isAuthorizedToAccessViewPage(viewSettingsPage), function (req, res) {
    const error = req.query.error;
    const host = getHostname(req);

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

    var promisePaymentGatewaysDefinition = new Promise((resolve, reject) => {
        client.Payments.getPaymentGateways({
            merchantId: req.user.ID
        }, function (err, addresses) {
            resolve(addresses);
        });
    });

    var promisePaymentAcceptanceMethod = new Promise((resolve, reject) => {
        client.Payments.getPaymentAcceptanceMethods({
            merchantId: req.user.ID
        }, function (err, addresses) {
            resolve(addresses);
        });
    });

    const promisePaymentTerms = new Promise((resolve, reject) => {
        client.Payments.getPaymentTerms({ merchantId: req.user.ID }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUserDetails, promiseCustomFieldDefinition, promisePaymentGatewaysDefinition, promisePaymentAcceptanceMethod, promisePaymentTerms]).then((responses) => {
        const appString = 'merchant-settings';
        const context = {};
        let user = responses[0];
        let customDefintion = responses[1];
        let paymentGateways = responses[2];
        let paymentAcceptanceMethod = responses[3];
        const paymentTerms = responses[4];
        let addresses = !user.Addresses || user.Addresses == null || typeof user.Addresses == 'undefined' ? [] : user.Addresses;
        let userLogins = user.UserLogins;

        let paypalLoginUrl = buildExternalLoginUrl(host, 'PayPal', '', '', '', req.user.ID);
        let stripeLoginUrl = buildExternalLoginUrl(host, 'Stripe', '', '', '', req.user.ID);

        // spacetime: filter addresses uploaded in settings page only
        addresses = addresses.filter(a => a.Delivery);

        getUserPermissionsOnPage(req.user, 'Profile', 'Merchant', (profilePagePermissions) => {
            getUserPermissionsOnPage(req.user, 'Addresses', 'Merchant', (addressPagePermissions) => {
                getUserPermissionsOnPage(req.user, 'Payment Methods', 'Merchant', (paymentMethodPagePermissions) => {
                    getUserPermissionsOnPage(req.user, 'Payment Terms', 'Merchant', (paymentTermPagePermissions) => {
                        const pagePermissions = {
                            profilePagePermissions,
                            addressPagePermissions,
                            paymentMethodPagePermissions,
                            paymentTermPagePermissions
                        };

                        const s = Store.createSettingsStore({
                            settingsReducer: {
                                addressPermissions: addressPagePermissions,
                                addresses: addresses,
                                userLogins: userLogins,
                                customFieldDefinition: customDefintion.Records,
                                paymentGateways: paymentGateways.Records,
                                paymentAcceptanceMethod: paymentAcceptanceMethod.Records,
                                paypalLoginUrl: paypalLoginUrl,
                                stripeLoginUrl: stripeLoginUrl,
                                paymentTerms: paymentTerms
                            },
                            userReducer: {
                                user: user,
                                pagePermissions: pagePermissions
                            },
                            currentUserReducer: {
                                user: req.user
                            }
                        });

                        const reduxState = s.getState();

                        let seoTitle = 'Merchant Settings Page 1';
                        if (req.SeoTitle) {
                            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                        }

                        const settingsIndex = reactDom.renderToString(<MerchantSettingsIndexComponent pagePermissions={pagePermissions}
                            paypalLoginUrl={paypalLoginUrl}
                            stripeLoginUrl={stripeLoginUrl}
                            customFieldDefinition={customDefintion.Records}
                            user={user}
                            addresses={addresses}
                            userLogins={userLogins}
                            paymentGateways={paymentGateways.Records}
                            paymentAcceptanceMethod={paymentAcceptanceMethod.Records}
                            currentUser={req.user} />);
                        res.send(template('page-settings', seoTitle, settingsIndex, appString, reduxState));
                    });
                });
            });
        });
    });
});

merchantRouter.post('/createPaymentAcceptanceMethodAsync', ...handlers, isAuthorizedToPerformAction('view-merchant-payment-methods-api'), function (req, res) {
    const body = req.body;

    var promisePaymentAcceptance = new Promise((resolve, reject) => {
        client.Payments.createPaymentAcceptanceMethodAsync(body, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePaymentAcceptance]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

merchantRouter.post('/getPaymentAcceptanceMethods', ...handlers, isAuthorizedToPerformAction('view-merchant-payment-methods-api'), function (req, res) {
    const merchantId = req.body.merchantId;

    var promisePaymentAcceptance = new Promise((resolve, reject) => {
        client.Payments.getPaymentAcceptanceMethods({
            merchantId: merchantId
        }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePaymentAcceptance]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

merchantRouter.post('/saveOmiseAccount', ...handlers, isAuthorizedToPerformAction('view-merchant-payment-methods-api'), function (req, res) {
    const user = req.user;
    const type = req.body['type'];
    const taxId = req.body['taxId'];
    const bankAccountBrand = req.body['bankAccountBrand'];
    const bankAccountNumber = req.body['bankAccountNumber'];
    const bankAccountName = req.body['bankAccountName'];

    const promisePaymentGateways = new Promise((resolve, reject) => {
        client.Payments.getPaymentGateways(null, (err, result) => {
            resolve(result);
        });
    });

    const promisePaymentAcceptanceMethods = new Promise((resolve, reject) => {
        client.Payments.getPaymentAcceptanceMethods({ merchantId: user.ID }, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promisePaymentGateways, promisePaymentAcceptanceMethods]).then((responses) => {

        const paymentGateway = responses[0].Records.find(p => p.Gateway == EnumCoreModule.GetGateways().Omise);
        const paymentAcceptanceMethod = responses[1].Records.find(p => p.PaymentGateway && p.PaymentGateway.Gateway == EnumCoreModule.GetGateways().Omise);

        if (!paymentGateway) {
            return res.send({ errorMessage: 'payment gateway not found' });
        }

        const omise = require('omise')({ secretKey: paymentGateway.Meta.secretkey });

        omise.account.retrieve().then((adminAccount) => {
            let promiseRetrieveRecipient = null;
            if (paymentAcceptanceMethod && paymentAcceptanceMethod.ClientID) {
                promiseRetrieveRecipient = omise.recipients.retrieve(paymentAcceptanceMethod.ClientID);
            }

            Promise.all([promiseRetrieveRecipient]).then((responses) => {
                const merchantAccount = responses[0];
                const data = {
                    name: `${user.FirstName}_${user.LastName}_${user.ID}`,
                    email: user.Email,
                    type: type,
                    tax_id: taxId,
                    description: user.Description,
                    bank_account: {
                        brand: bankAccountBrand,
                        number: bankAccountNumber,
                        name: bankAccountName
                    }
                };

                let promiseRecipient = null;
                if (merchantAccount) {
                    promiseRecipient = omise.recipients.update(merchantAccount.id, data);
                } else {
                    promiseRecipient = omise.recipients.create(data);
                }

                promiseRecipient.then((recipient) => {
                    return res.send({ recipientId: recipient.id });
                }).catch((error) => {
                    return res.send({ errorMessage: 'error creating/updating omise merchant account: ' + error.message });
                });
            }).catch((error) => {
                return res.send({ errorMessage: 'error retrieving omise merchant account: ' + error.message });
            });
        }).catch((error) => {
            return res.send({ errorMessage: 'error retrieving omise admin account: ' + error.message });
        });
    });
});

merchantRouter.post('/savePaymentTerms', ...handlers, isAuthorizedToPerformAction('view-merchant-payment-terms-api'), function (req, res) {
    const merchantId = req.user.ID;
    const paymentTerms = JSON.parse(req.body['paymentTerms']);

    const promisePaymentTerms = new Promise((resolve, reject) => {
        client.Payments.getPaymentTerms({ merchantId: merchantId }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePaymentTerms]).then((responses) => {
        const currentPaymentTerms = responses[0];
        let newPaymentTerms = [];
        let updatedPaymentTerms = [];
        let deletedPaymentTerms = [];
        let promiseSavePaymentTerms = [];

        paymentTerms.forEach((paymentTerm) => {
            const current = currentPaymentTerms.find(p => p.ID == paymentTerm.ID);

            if (current) {
                if (current.Name !== paymentTerm.Name || current.Description !== paymentTerm.Description || current.Default !== paymentTerm.Default) {
                    updatedPaymentTerms.push(paymentTerm);
                }
            } else {
                newPaymentTerms.push(paymentTerm);
            }
        });

        currentPaymentTerms.forEach((paymentTerm) => {
            const isExist = paymentTerms.find(p => p.ID == paymentTerm.ID) != null;

            if (!isExist) {
                deletedPaymentTerms.push(paymentTerm);
            }
        });

        newPaymentTerms.forEach((paymentTerm) => {
            promiseSavePaymentTerms.push(new Promise((resolve, reject) => {
                const options = {
                    merchantId: merchantId,
                    name: paymentTerm.Name,
                    description: paymentTerm.Description,
                    default: paymentTerm.Default
                };

                client.Payments.createPaymentTerm(options, function (err, result) {
                    resolve(result);
                })
            }))
        });

        updatedPaymentTerms.forEach((paymentTerm) => {
            promiseSavePaymentTerms.push(new Promise((resolve, reject) => {
                const options = {
                    merchantId: merchantId,
                    paymentTermId: paymentTerm.ID,
                    name: paymentTerm.Name,
                    description: paymentTerm.Description,
                    default: paymentTerm.Default
                };

                client.Payments.updatePaymentTerm(options, function (err, result) {
                    resolve(result);
                })
            }))
        });

        deletedPaymentTerms.forEach((paymentTerm) => {
            promiseSavePaymentTerms.push(new Promise((resolve, reject) => {
                const options = {
                    merchantId: merchantId,
                    paymentTermId: paymentTerm.ID
                };

                client.Payments.deletePaymentTerm(options, function (err, result) {
                    resolve(result);
                })
            }))
        });

        Promise.all(promiseSavePaymentTerms).then((responses) => {
            res.send('success');
        });
    });
});

module.exports = merchantRouter; 