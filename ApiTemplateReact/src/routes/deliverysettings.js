'use strict';
var express = require('express');
var deliverySettingsRouter = express.Router();
var React = require('react');

var reactDom = require('react-dom/server');
var Store = require('../redux/store');
var template = require('../views/layouts/template');

var DeliverySettingsPage = require('../views/delivery/settings/index').DeliverySettingsComponent;
var DeliveryAddEditComponent = require('../views/delivery/add-edit/index').DeliveryAddEditComponent;
var client = require('../../sdk/client');

var authenticated = require('../scripts/shared/authenticated');
var authorizedMerchant = require('../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../scripts/shared/onboarded-merchant');

var handlers = [authenticated, authorizedMerchant, onboardedMerchant];

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

const viewDeliverySettingsPage = {
    code: 'view-merchant-delivery-methods-api',
    seoTitle: 'Delivery Settings Page',
    renderSidebar: true
};

const viewDeliveryOptionsPage = {
    code: 'view-merchant-delivery-option-api',
    seoTitle: 'Delivery Add Edit Page',
    renderSidebar: true
};

/* GET review checkout data. */
deliverySettingsRouter.get('/settings', ...handlers, isAuthorizedToAccessViewPage(viewDeliverySettingsPage), function (req, res) {

    let user = Object.assign({}, req.user);
    const userId = user && user.Roles && user.Roles.includes('Submerchant') ? user.SubmerchantID : user.ID;
    var promiseUserDetails = new Promise((resolve, reject) => {
        client.Users.getUserDetails({ userId }, function(err, result) {
            resolve(result);
        });
    });

    var promiseShippingOptionsMerchant = new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingMethods(user.ID, function (err,  addresses) {
            resolve(addresses);
        });
    });

    var promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
        let self = this;
        client.ShippingMethods.getShippingOptions(function (err, addresses) {
            resolve(addresses);
        });
    });


    var promiseAddress = new Promise((resolve, reject) => {
        client.Addresses.getUserPickupAddresses(user.ID, function (err, addresses) {
            resolve(addresses);
        });
    });


    var promiseCustomFieldDefinition = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions('Users', function (err, addresses) {
            resolve(addresses);
        });
    });


    Promise.all([promiseShippingOptionsMerchant, promiseShippingOptionsAdmin, promiseAddress, promiseCustomFieldDefinition, promiseUserDetails ]).then((responses) => {
        const appString = 'delivery-settings';
        const context = {};
        let shippingOptionsMerchant = responses[0];
        let shippingOptionsAdmin = responses[1];
        let pickupLocations = responses[2];
        let customFieldDefinition = responses[3];
        let temp = responses[4];
        if (temp && temp.CustomFields) user.CustomFields = temp.CustomFields;

        getUserPermissionsOnPage(user, 'Delivery Methods', 'Merchant', (pagePermissions) => {
            const s = Store.createDeliverySettingsStore({
                deliverySettingsReducer: {
                    shippingOptionsMerchant: shippingOptionsMerchant,
                    shippingOptionsAdmin: shippingOptionsAdmin,
                    pickupLocations: pickupLocations.Records,
                    customFieldDefinition: customFieldDefinition.Records
                },
                userReducer: {
                    user: user,
                    pagePermissions
                }
            });

            let seoTitle = 'Delivery Settings Page';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const reduxState = s.getState();
            const deliverySettings = reactDom.renderToString(<DeliverySettingsPage pagePermissions={pagePermissions} user={user} customFieldDefinition={customFieldDefinition.Records} shippingOptionsAdmin={shippingOptionsAdmin} shippingOptionsMerchant={shippingOptionsMerchant} pickupLocations={pickupLocations.Records} />);
            res.send(template('page-seller page-sidebar page-delivery-setting', seoTitle, deliverySettings, appString, reduxState));
        });
    });
});

deliverySettingsRouter.get('/add-edit', ...handlers, isAuthorizedToAccessViewPage(viewDeliveryOptionsPage), function (req, res) {
    let user = req.user;
    const shippingMethodId = req.query.shippingmethodid;

    var promiseShippingOptionsMerchant = new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingMethodObject(user.ID, shippingMethodId, function (err, addresses) {
            resolve(addresses);
        });
    });

    var promiseCustomFieldDefinition = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions('ShippingMethods', function (err, addresses) {
            resolve(addresses);
        });
    });

    var promiseMarketplaceInformation = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo('', function (err, addresses) {
            resolve(addresses);
        });
    });

    Promise.all([promiseShippingOptionsMerchant, promiseCustomFieldDefinition, promiseMarketplaceInformation]).then((responses) => {
        const appString = 'delivery-add-edit';
        const context = {};
        let manageShippingOptions = responses[0];
        let customFieldDefinition = responses[1];
        let marketplaceInformation = responses[2];

        getUserPermissionsOnPage(user, 'Delivery Option', 'Merchant', (pagePermissions) => {
            const s = Store.createDeliverySettingsStore({
                deliverySettingsReducer: {
                    manageShippingOptions: manageShippingOptions,
                    customFieldDefinition: customFieldDefinition.Records,
                    marketplaceInformation: marketplaceInformation
                },
                userReducer: {
                    user: user,
                    pagePermissions
                }
            });

            let seoTitle = 'Delivery Add Edit Page';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const reduxState = s.getState();
            const deliveryAddEdit = reactDom.renderToString(<DeliveryAddEditComponent pagePermissions={pagePermissions} marketplaceInformation={marketplaceInformation} customFieldDefinition={customFieldDefinition.Records} manageShippingOptions={manageShippingOptions} />);
            res.send(template('page-seller page-sidebar page-delivery-setting-edit', seoTitle, deliveryAddEdit, appString, reduxState));
        });
    });
});

deliverySettingsRouter.post('/settings/deleteShippingOptions', ...handlers, function (req, res) {
    var merchantID = req.body['merchantID'];
    var shippingmethodID = req.body['shippingmethodID'];

    var promiseShipping = new Promise((resolve, reject) => {
        client.ShippingMethods.deleteShippingMethod(merchantID, shippingmethodID, function (err, shipping) {
            resolve(shipping);
        });
    });

    Promise.all([promiseShipping]).then((responses) => {
        const promiseShipping = responses[0];
        res.send(promiseShipping);
    });
});

deliverySettingsRouter.post('/settings/createShippingOptions', ...handlers, function (req, res) {
    var merchantID = req.body['merchantID'];
    var shippingmethodObject = req.body['shippingmethodObject'];

    var promiseShipping = new Promise((resolve, reject) => {
        client.ShippingMethods.createShippingMethod(merchantID, shippingmethodObject, function (err, shipping) {
            resolve(shipping);
        });
    });

    Promise.all([promiseShipping]).then((responses) => {
        const promiseShipping = responses[0];
        res.send(promiseShipping);
    });
});

deliverySettingsRouter.post('/settings/updateShippingOptions', ...handlers, function (req, res) {
    var merchantID = req.body['merchantID'];
    var shippingmethodObject = req.body['shippingmethodObject'];

    var promiseShipping = new Promise((resolve, reject) => {
        client.ShippingMethods.updateShippingMethod(merchantID, shippingmethodObject, function (err, shipping) {
            resolve(shipping);
        });
    });

    Promise.all([promiseShipping]).then((responses) => {
        const promiseShipping = responses[0];
        res.send(promiseShipping);
    });
});

deliverySettingsRouter.get('/getShippingOptions', ...handlers, function (req, res) {
    const deliveryAddEdit = reactDom.renderToString(<DeliveryAddEditPage />);

    let seoTitle = 'Delivery Add Edit Page';
    if (req.SeoTitle) {
        seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
    }

    res.send(template('page-DeliveryAddEdit page-seller page-delivery-setting', seoTitle, deliveryAddEdit, '', ''));
});

module.exports = deliverySettingsRouter;
