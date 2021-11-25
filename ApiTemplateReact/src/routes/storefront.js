'use strict';
var express = require('express');
var storeFrontRouter = express.Router();
var StoreFrontPage = require('../views/storefront/main').StoreFrontPageComponent;
var reactDom = require('react-dom/server');
var React = require('react');
var template = require('../views/layouts/template');
var client = require('../../sdk/client');
var Store = require('../redux/store');
var authenticated = require('../scripts/shared/authenticated');
var moment = require('moment');

storeFrontRouter.get('/:sellerid', authenticated, function (req, res) {
    let currentUser = req.user;
    let keyword = req.query.keyword || '';
    let pageNo = req.query.pageNo || '1';

    let promiseMerchantDetail = new Promise((resolve, reject) => {
        const options = {
            token: null,
            userId: req.params.sellerid,
            includes: 'MerchantTotalSuccesfulOrders',
            includeUserCustomFields: true,
            excludeToken: true
        };

        client.Users.getUserDetails(options, function (err, details) {
            if (details) {
                resolve(details);
            } else {
                reject('USER_DETAILS_NOT_FOUND');
            }
        });
    });

    let promiseMerchantFeedback = new Promise((resolve, reject) => {
        const options = {
            merchantId: req.params.sellerid,
            keyword: '',
            pageNo: 1,
            pageSize: 15,
            getFirstItemInOrder: true
        };

        client.Items.getMerchantFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    let promiseAllMerchantFeedback = new Promise((resolve, reject) => {
        const options = {
            merchantId: req.params.sellerid,
            keyword: '',
            pageNo: 1,
            pageSize: 100,
            getFirstItemInOrder: true
        };

        client.Items.getMerchantFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    let promiseMarketplace = new Promise((resolve, reject) => {
        let options = {
            includes: 'ControlFlags'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Users", function (err, details) {
            resolve(details);
        });
    });

    var merchantTotalVisitsPromise = new Promise((resolve, reject) => {
        client.Transactions.getReports(req.params.sellerid, 'headerTotalVisitsStoreFront', moment(new Date()).add(-2, 'days').unix(), moment(new Date()).add(-1, 'days').unix(), 'day', 10, 1, function (err, reports) {
            resolve(reports);
        });
    });

    const promiseAnalyticsApiAccess = new Promise((resolve, reject) => {
        client.Users.getAnalyticsApiAccess({ merchantId: req.params.sellerid }, function (err, reports) {
            resolve(reports);
        });
    });


    Promise.all([promiseMerchantDetail, promiseMerchantFeedback, promiseAllMerchantFeedback, promiseMarketplace, promiseCustomFieldDefinitions, merchantTotalVisitsPromise, promiseAnalyticsApiAccess]).then((responses) => {
        const appString = 'merchant-storefront';

        let merchantUser = responses[0];
        let merchantFeedback = responses[1];
        let allMerchantFeedback = responses[2];
        let marketplaceInfo = responses[3];
        let customFieldDefinitions = responses[4];
        let merchantTotalVisits = responses[5];
        let analyticsApiAccess = responses[6];

        let ReviewAndRating = marketplaceInfo.ControlFlags.ReviewAndRating;

        let sellerCountry = "";
        if (merchantUser) {
            if (merchantUser.CustomFields) {
                const sellerLocation = merchantUser.CustomFields.find(p => p.Name === 'user_seller_location');
                if (sellerLocation && sellerLocation.Values) {
                    sellerCountry = sellerLocation.Values[0];
                }
                else {
                    //merchantUser.CustomFields.forEach(function (mu) {
                    //    sellerCountry = mu.Values[0];
                    //});
                    //Fix for 10539

                }
            }
        }

        const locationVariantGroupId = req.LocationVariantGroupId;
        const userPreferredLocationId = req.UserPreferredLocationId;

        let promiseItems = new Promise((resolve, reject) => {
            const options = {
                sellerId: req.params.sellerid,
                pageSize: 20,
                pageNumber: pageNo,
                tags: [],
                withChildItems: true,
                sort: 'created_desc',
                keyword: keyword,
                filterAvailable: true,
                filterVisible: true,
                variantGroupId: locationVariantGroupId,
                variantId: userPreferredLocationId
            };

            client.Items.getMerchantItems(options, function (err, details) {
                resolve(details);
            });
        });


        Promise.all([promiseItems]).then((responses) => {
            let items = responses[0];
            const s = Store.createStoreFrontStore({
                itemsReducer: { items: items, keyword: keyword, customFieldDefinitions: customFieldDefinitions, merchantTotalVisits },
                userReducer: { user: currentUser, userPreferredLocationId: userPreferredLocationId },
                merchantReducer: {
                    user: merchantUser,
                    sellerCountry: sellerCountry,
                    merchantFeedback: merchantFeedback,
                    ReviewAndRating: ReviewAndRating,
                    allMerchantFeedback: allMerchantFeedback,
                    analyticsApiAccess: analyticsApiAccess
                },

            });
            const reduxState = s.getState();
            const storeFront = reactDom.renderToString(<StoreFrontPage
                items={items}
                merchantUser={merchantUser}
                user={currentUser}
                userPreferredLocationId={userPreferredLocationId}
                merchantFeedback={merchantFeedback}
                allMerchantFeedback={allMerchantFeedback}
                customFieldDefinitions={customFieldDefinitions}
                merchantTotalVisits={merchantTotalVisits}
                categories={[]}
                analyticsApiAccess={analyticsApiAccess}
            />);

            let seoTitle = 'StoreFront Page';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-store', seoTitle, storeFront, appString, reduxState));
        });

    })
        .catch(function (err) {
            if (err == "USER_DETAILS_NOT_FOUND") {
                if (req.query.redirectUrl && req.query.redirectUrl.length > 0) {
                    res.redirect(req.query.redirectUrl + '?&error=merchant-not-found');
                }
                res.redirect("/?error=merchant-not-found");
            }
        })

});

storeFrontRouter.post('/getMerchantFeedback', function (req, res) {
    let currentUser = req.user;
    const keyword = req.body.keyword;
    const merchantID = req.body.merchantID;
    const pageNo = req.body.pageNo;
    const pageSize = req.body.pageSize;

    let promiseMerchantFeedback = new Promise((resolve, reject) => {
        const options = {
            merchantId: merchantID,
            keyword: keyword,
            pageNo: pageNo,
            pageSize: pageSize
        };

        client.Items.getMerchantFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseMerchantFeedback]).then((responses) => {
        let items = responses[0];
        res.send(items);
    });
});

storeFrontRouter.get('/:sellerid/storefrontsearch', authenticated, function (req, res) {
    var keyword = req.query['keyword'];
    var pageNo = req.query['pageNo'];

    const locationVariantGroupId = req.LocationVariantGroupId;
    const userPreferredLocationId = req.UserPreferredLocationId;

    let promiseItems = new Promise((resolve, reject) => {
        if (typeof pageNo === 'undefined') {
            pageNo = 1;
        }
        const options = {
            sellerId: req.params.sellerid,
            pageSize: 20,
            pageNumber: pageNo,
            tags: [],
            withChildItems: true,
            sort: 'created_desc',
            keyword: keyword,
            filterAvailable: true,
            filterVisible: true,
            locationVariantGroupId: locationVariantGroupId,
            userPreferredLocationId: userPreferredLocationId
        };
        client.Items.getMerchantItems(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseItems]).then((responses) => {
        let items = responses[0];
        res.send(items);
    });
});

module.exports = storeFrontRouter;