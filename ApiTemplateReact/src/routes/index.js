'use strict';
var express = require('express');
var homePageRouter = express.Router();
var reactDom = require('react-dom/server');
var Store = require('../redux/store');
var template = require('../views/layouts/template');
var Homepage = require('../views/home/index');

var passport = require('passport');
var client = require('../../sdk/client');
var authenticated = require('../scripts/shared/authenticated');

const { isAuthorizedToAccessViewPage } = require('../scripts/shared/user-permissions');

var React = require('react');

function setApiToken(res, token, expiry) {
    var maxAge = expiry * 1000;
    res.cookie('webapitoken', token, { maxAge: maxAge, httpOnly: false });
}

const viewHomePage = {
    code: 'view-consumer-home-api',
}
/* GET home page. */
homePageRouter.get('/', authenticated, isAuthorizedToAccessViewPage(viewHomePage), function (req, res) {
    const user = req.user;
    const { PRICING_TYPE } = process.env;

    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, function (err, result) {
            if (!err) {
                resolve(result);
            }
        });
    });

    Promise.all([promiseMarketplaceInfo]).then((responses) => {
        const marketplaceInfo = responses[0];

        const locationVariantGroupId = req.LocationVariantGroupId;
        const userPreferredLocationId = req.UserPreferredLocationId;

        const isGuest = user == null || typeof user == 'undefined';
        const isPrivateAndSellerRestricted = req.isPrivateEnabled && req.isSellerVisibilityRestricted;
        const sellerId = !isGuest && isPrivateAndSellerRestricted && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) ? req.user.ID : null;

        var promiseItems = new Promise((resolve, reject) => {
            const options = {
                pageSize: 12,
                pageNumber: 1,
                tags: [],
                withChildItems: true,
                sort: 'created_desc',
                sellerId: sellerId,
                variantGroupId: locationVariantGroupId,
                variantId: userPreferredLocationId
            };
            client.Items.getItems(options, function (err, items) {
                if (!err) {
                    resolve(items);
                }
            });
        });

        var promiseCategories = new Promise((resolve, reject) => {
            client.Categories.getCategories(null, function (err, categories) {
                if (!err) {
                    resolve(categories);
                }
            });
        });
        var promisePanels = new Promise((resolve, reject) => {
            const options = {
                type: 'all',
                pageSize: 24,
                pageNumber: 1
            };

            client.Panels.getPanels(options, function (err, panels) {
                if (!err) {
                    resolve(panels);
                }
            });
        });

        Promise.all([promiseItems, promiseCategories, promisePanels]).then((responses) => {
            const appString = 'homepage';
            const context = {};

            const items = responses[0];
            const categories = responses[1];
            const panels = responses[2];
            const settingsTemp = marketplaceInfo.Settings != null ? marketplaceInfo.Settings['home-page-settings']['home-page-settings-area'] : null;
            const layoutItemCount = settingsTemp != null ? parseInt(settingsTemp['latest_item_count']) : 10;
            const collapsableCategories = settingsTemp != null ? settingsTemp["category_collapsable_onoff"] : true;
            const categoryCount = collapsableCategories === 'false' ? categories.length : 4;
            const isBespoke = PRICING_TYPE === "variants_level" ? true : false;
            const s = Store.createHomepageStore({
                itemsReducer: { items: items.Records },
                categoryReducer: { categories: categories, numberOfCategories: categoryCount },
                userReducer: { user: user, userPreferredLocationId: userPreferredLocationId },
                panelsReducer: { panels: panels.Records },
                settingsReducer: { layoutItemCount: layoutItemCount, isBespoke: isBespoke, collapsableCategories: collapsableCategories }
            });

            const seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;

            const reduxState = s.getState();
            const homepageApp = reactDom.renderToString(<Homepage context={context} userPreferredLocationId={userPreferredLocationId} collapsableCategories={collapsableCategories} layoutItemCount={layoutItemCount} items={items.Records} categories={categories} user={user} panels={panels.Records} numberOfCategories={categoryCount} />);
            res.send(template('page-home', seoTitle, homepageApp, appString, reduxState));
        });
    });
});

homePageRouter.get('/admin', function (req, res) {
    res.redirect(process.env.PROTOCOL + '://' + process.env.BASE_URL + '/admin');
    return;
});

homePageRouter.all('/admin/*', function (req, res) {
    res.redirect(process.env.PROTOCOL + '://' + process.env.BASE_URL + '/admin');
    return;
});

homePageRouter.get('/account/signintodomain', passport.authenticate('user_impersonation_code', { failureRedirect: '/accounts/buyer/sign-in?error=invalid-login' }), function (req, res) {
    if (req.token) {
        setApiToken(res, req.token.access_token, req.token.expires_in);
    }

    if (req.user) {
        let parse = req.query;
        let returnUrl = "/";
        if (typeof parse.returnUrl !== "string") {
            parse.returnUrl.forEach(function (ru) {
                if (ru.length > 1) {
                    returnUrl = ru;
                }
            });
        } else {
            returnUrl = parse.returnUrl;
        }

        res.redirect(returnUrl);
    }
});

homePageRouter.get('/user/item/detail/:slug/:id', function (req, res) {
    res.redirect('/items/' + req.params.slug + '/' + req.params.id);
});

homePageRouter.post('/events', function (req, res) {
    res.status(200).send('Not found');
});

module.exports = homePageRouter;
