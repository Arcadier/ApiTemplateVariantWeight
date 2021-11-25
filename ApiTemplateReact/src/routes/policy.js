'use strict';
var express = require('express');
var policyRouter = express.Router();
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');
var client = require('../../sdk/client');
var Store = require('../redux/store');
var EnumCore = require('../public/js/enum-core');
const authenticated = require('../scripts/shared/authenticated');

var PolicyComponent = require('../views/policy/index').PolicyComponent;
const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction, UNIQUE_CODE_LOGIC_CONSTANT } = require('../scripts/shared/user-permissions');

policyRouter.get('/getPages', function (req, res) {
    const excludes = req.query['isContentExclude'] == 'true' ? 'Content' : '';

    const promisePages = new Promise((resolve, reject) => {
        const options = {
            excludes: excludes
        }

        client.ContentPages.getPages(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePages]).then((responses) => {
        res.send(responses[0]);
    });
});

policyRouter.get('/:policyName', authenticated, isAuthorizedToAccessViewPage({ code: UNIQUE_CODE_LOGIC_CONSTANT.POLICY_INFO_PAGE }), function (req, res, next) {
    const user = req.user;
    const urls = EnumCore.GetValidPolicyUrls();

    

    if (!urls.includes(req.params.policyName)) {
        next();
    }

    const promisePages = new Promise((resolve, reject) => {
        const options = {
            excludes: null
        };

        client.ContentPages.getPages(options, function (err, result) {
            resolve(result);
        });
    });

    let promiseMarketplace = new Promise((resolve, reject) => {

        const options = {
            includes: 'BusinessProfile'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promisePages, promiseMarketplace]).then((responses) => {
        const mapping = EnumCore.GetPolicyMappingByUrl(req.params.policyName);
        const pages = responses[0];
        const info = responses[1];
        let policy = {};

        if (pages.TotalRecords == 0) {
            next();
        }

        policy = pages.Records.find(p => p.Title.toLowerCase() === mapping.value.toLowerCase());

        if (policy == null) {
            next();
        }
        if (policy && policy.Title.toLowerCase() === "contact us") {
            policy.Content = "<div class='contact-container'><span>Contact Us</span><div class='contact-content'><p>If you have any enquiries, do contact us via our contact details below:</p><span><i class='fa fa-phone'></i><p>"
                + info.BusinessProfile.ContactPersonPhone + "</p ></span><span><i class='fa fa-envelope'></i><p>"
                + info.BusinessProfile.ContactPersonEmail + "</p ></span></div></div>";
        }
        const appString = 'policy';
        const context = {};

        const s = Store.createPolicyStore({
            userReducer: { user: user },
            policyReducer: { policy: policy, pages: pages.Records }
        });
        const reduxState = s.getState();

        const app = reactDom.renderToString(<PolicyComponent context={context} user={user} policy={policy} pages={pages.Records} />);
        // res.send(template('page-info', mapping.name, app, appString, reduxState));
        //UN431 also for policy
        let seoTitle = info.SeoTitle ? info.SeoTitle : info.Name;
        res.send(template('page-info', seoTitle, app, appString, reduxState));
    });
});

module.exports = policyRouter;