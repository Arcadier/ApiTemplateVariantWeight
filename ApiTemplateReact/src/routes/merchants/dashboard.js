'use strict';

var express = require('express');
var merchantDashboardRouter = express.Router();
var React = require('react');
var reactDom = require('react-dom/server');
var Store = require('../../redux/store');
var template = require('../../views/layouts/template');

var authenticated = require('../../scripts/shared/authenticated');
var authorizedMerchant = require('../../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../../scripts/shared/onboarded-merchant');
var client = require('../../../sdk/client');
var moment = require('moment');
var DashboardPageComponent = require('../../views/merchant/dashboard/main').DashboardPageComponent;

var handlers = [authenticated, authorizedMerchant, onboardedMerchant];

const { isAuthorizedToAccessViewPage } = require('../../scripts/shared/user-permissions');

const viewDashboardPage = {
    code: 'view-merchant-dashboard-api',
    seoTitle: 'Dashboard',
    renderSidebar: true
};

merchantDashboardRouter.get('/', ...handlers, isAuthorizedToAccessViewPage(viewDashboardPage), function (req, res) {
    let pageSize = 100
    let user = req.user;
    var transactionKeyword = process.env.CHECKOUT_FLOW_TYPE == 'b2b' ? 'b2bTransactions' : 'transactions';
    var promiseTransaction = new Promise((resolve, reject) => {
        client.Transactions.getTransactions(pageSize, 1, '', moment(new Date()), moment(new Date()).add(1, 'days'), '- id', function (err, transaction) {
            resolve(transaction);
        });
    });

    var headerTransactionPromise = new Promise((resolve, reject) => {
        client.Transactions.getReports(user.ID, transactionKeyword, moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1, function (err, reports) {
            resolve(reports);
        });
    });

    //best product sellers
    var footerTransactionPromise = new Promise((resolve, reject) => {
        client.Transactions.getReports(user.ID, 'items', moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1, function (err, reports) {
            resolve(reports);
        });
    });

    var salesGraphTransactionPromise = new Promise((resolve, reject) => {
        client.Transactions.getReports(user.ID, transactionKeyword, moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1, function (err, reports) {
            resolve(reports);
        });
    });

    var topViewedTransactionPromise = new Promise((resolve, reject) => {
        client.Transactions.getReports(user.ID, 'topViewed', moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1, function (err, reports) {
            resolve(reports);
        });
    });

    var headerTransactionGrowthRatePromise = new Promise((resolve, reject) => {
        client.Transactions.getReports(user.ID, transactionKeyword, moment(new Date()).add(-2, 'days').unix(), moment(new Date()).add(-1, 'days').unix(), 'day', pageSize, 1, function (err, reports) {
            resolve(reports);
        });
    });

    var headerTotalVisitsPromise = new Promise((resolve, reject) => {
        client.Transactions.getReports(user.ID, 'headerTotalVisits', moment(new Date()).add(-2, 'days').unix(), moment(new Date()).add(-1, 'days').unix(), 'day', pageSize, 1, function (err, reports) {
            resolve(reports);
        });
    });

    var getAnalyticsApiAccessPromise = new Promise((resolve, reject) => {
        client.Users.getAnalyticsApiAccess({ merchantId: user.ID }, function (err, reports) {
            resolve(reports);
        });
    });

    Promise.all([promiseTransaction, headerTransactionPromise, footerTransactionPromise, salesGraphTransactionPromise, topViewedTransactionPromise, headerTransactionGrowthRatePromise, headerTotalVisitsPromise, getAnalyticsApiAccessPromise]).then((responses) => {
        const appString = 'merchant-dashboard';
        const context = {};
        let transactions = responses[0];
        let headerTransaction = responses[1];
        let footerTransaction = responses[2];
        let salesTransaction = responses[3];
        let topViewedTransaction = responses[4];
        let headerTransactionGrowth = responses[5];
        let headerTotalVisits = responses[6];
        let analyticsApiAccess = responses[7];

        const s = Store.createDashboardStore({
            dashboardReducer: {
                user: user,
                transactions: transactions ? transactions.Records : null,
                headerTransaction: headerTransaction ? headerTransaction.Records : null,
                footerTransaction: footerTransaction ? footerTransaction.Records : null,
                salesTransaction: salesTransaction ? salesTransaction.Records : null,
                topViewedTransaction: topViewedTransaction ? topViewedTransaction.Records : null,
                headerTransactionGrowth: headerTransactionGrowth ? headerTransactionGrowth.Records : null,
                headerTotalVisits: headerTotalVisits ? headerTotalVisits.Records : null,
                analyticsApiAccess: analyticsApiAccess ? analyticsApiAccess : null,
                baseUrl: process.env.BASE_URL,
                currencyCode: req.CurrencyCode
            },
            userReducer: { user: user }
        });

        let seoTitle = 'Dashboard';
        if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }

        const reduxState = s.getState();
        const dashboardIndex = reactDom.renderToString(<DashboardPageComponent
            headerTotalVisits={headerTotalVisits ? headerTotalVisits.Records : null}
            headerTransactionGrowth={headerTransactionGrowth ? headerTransactionGrowth.Records : null}
            topViewedTransaction={topViewedTransaction ? topViewedTransaction.Records : null}
            salesTransaction={salesTransaction ? salesTransaction.Records : null}
            footerTransaction={footerTransaction ? footerTransaction.Records : null}
            headerTransaction={headerTransaction ? headerTransaction.Records : null}
            user={user}
            transactions={transactions ? transactions.Records : null}
            analyticsApiAccess={analyticsApiAccess}
            baseUrl={process.env.BASE_URL}
            currencyCode={req.currencyCode}
        />);
        res.send(template('page-seller page-dashboard page-sidebar', seoTitle, dashboardIndex, appString, reduxState));
    });

});

merchantDashboardRouter.get('/getTransactions', ...handlers, isAuthorizedToAccessViewPage(viewDashboardPage), function (req, res) {

    var promiseGetTransactions = new Promise((resolve, reject) => {
        client.Transactions.getTransactions(req.query.pageSize, req.query.pageNumber, req.query.keyWords, req.query.startDate, req.query.endDate, req.query.sort, function (err, transaction) {
            resolve(transaction);
        });
    });

    Promise.all([promiseGetTransactions]).then((responses) => {
        const transaction = responses[0];
        res.send(transaction);
    });
});

merchantDashboardRouter.get('/getReports', ...handlers, isAuthorizedToAccessViewPage(viewDashboardPage), function (req, res) {
    var type = req.query.type == 'transactions' && process.env.CHECKOUT_FLOW_TYPE == 'b2b' ? 'b2bTransactions' : req.query.type;
    var promiseGetTransactions = new Promise((resolve, reject) => {
        client.Transactions.getReports(req.query.merchantId, type, req.query.startDate, req.query.endDate, req.query.report_by, req.query.pageSize, req.query.pageNumber, function (err, transaction) {
            resolve(transaction);
        });
    });

    Promise.all([promiseGetTransactions]).then((responses) => {
        const transaction = responses[0];
        res.send(transaction);
    });
});

module.exports = merchantDashboardRouter;
