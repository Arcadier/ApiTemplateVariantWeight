'use strict';
var express = require('express');
var activityLogRouter = express.Router();
var useragent = require('express-useragent');
activityLogRouter.use(useragent.express());

var React = require('react');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');

var authenticated = require('../scripts/shared/authenticated');
var client = require('../../sdk/client');
var Store = require('../redux/store');
var ActivityLogPage = require('../views/activity-log/index').ActivityLogComponent;

var authenticated = require('../scripts/shared/authenticated');
var authorizedUser = require('../scripts/shared/authorized-user');
var authorizedMerchant = require('../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../scripts/shared/onboarded-merchant');

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

var handlers = [authenticated, authorizedUser];
var merchantHandlers = [authenticated, authorizedMerchant, onboardedMerchant];

const setListPagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-activity-logs-api`;

        next();
    };
}

function getActivityCookie(req, res, loginActivityId, alternateId) {
    const cookieName = 'arcticktrack';
    const cookie = req.cookies[cookieName];

    if (cookie) {
        return cookie;
    }
    else {
        const value = {
            loginActivityId: loginActivityId || 0,
            alternateId: alternateId || Math.random().toString(36).substr(2, 10)
        };

        res.cookie(cookieName, value, {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true
        });

        return value;
    }

    return null;
}

activityLogRouter.post('/logPageActivity', authenticated, function (req, res) {
    const user = req.user;
    if (user) {
        let userID = user.ID;
        if (req.user.Roles.includes('Submerchant')) {
            if (user.SubmerchantID) {
                userID = user.SubmerchantID;
            }
        }
        const cookie = getActivityCookie(req, res, 0, null);
        const promiseActivityLog = new Promise((resolve, reject) => {
            const options = {
                userId: userID,
                pageUrl: req.body.pageUrl,
                alternateId: cookie.alternateId
            };
            client.ActivityLog.logPageActivity(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseActivityLog]).then((responses) => {
            return res.send();
        });
    } else {
        res.send();
    }
});

activityLogRouter.get('/', ...handlers, setListPagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), function (req, res) {
    const user = req.user;
    const isMerchantAccess = res.locals.isMerchantRoute;
    const pageType = isMerchantAccess ? 'Merchant' : 'Consumer';

    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: 1
    };
    const promiseActivityLog = new Promise((resolve, reject) => {
        client.ActivityLog.getActivityLog(options, function (err, callback) {
            resolve(callback);
        });
    });
    Promise.all([promiseActivityLog]).then((responses) => {
        const messages = responses[0];
        const appString = 'activity-log';
        const context = {};

        getUserPermissionsOnPage(user, 'Activity Logs', pageType, (pagePermissions) => {
            const s = Store.createActivityLogStore({
                userReducer: {
                    user: user,
                    pagePermissions: pagePermissions
                },
                activityLogReducer: {
                    messages: messages,
                    logName: 'activity-logs',
                    isMerchantAccess: isMerchantAccess
                }
            });
            const reduxState = s.getState();

            let seoTitle = 'Activity Log';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const LogPage = reactDom.renderToString(<ActivityLogPage context={context} user={user} pagePermissions={pagePermissions} isMerchantAccess={isMerchantAccess} />);
            res.send(template('page-seller auto-activity-page page-sidebar', seoTitle, LogPage, appString, reduxState));
        });
    });
});

activityLogRouter.get('/search', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;

    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: 1,
        logName: req.query.logName
    };
    var promiseActivityLog = new Promise((resolve, reject) => {
        client.ActivityLog.getSearchActivityLogs(options, function (err, callback) {
            resolve(callback);
        });
    });
    Promise.all([promiseActivityLog]).then((responses) => {
        const messages = responses[0];
        res.send(messages);
    });
});

activityLogRouter.get('/paging', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;
    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: req.query.pageNumber,
        keyword: req.query.keyword
    };

    if (options.keyword === undefined) {
        var promiseInbox = new Promise((resolve, reject) => {
            client.ActivityLog.getActivityLog(options, function (err, callback) {
                resolve(callback);
            });
        });
        Promise.all([promiseInbox]).then((responses) => {
            const messages = responses[0];
            res.send(messages);
        });
    } else {
        var promiseActivityLog = new Promise((resolve, reject) => {
            client.ActivityLog.getSearchActivityLogs(options, function (err, callback) {
                resolve(callback);
            });
        });
        Promise.all([promiseActivityLog]).then((responses) => {
            const messages = responses[0];
            res.send(messages);
        });
    }
});

activityLogRouter.get('/export', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;
    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: 1,
        startDate: req.query.startDate,
        endDate: req.query.endDate
    };
    var promiseActivityLog = new Promise((resolve, reject) => {
        client.ActivityLog.getExportActivityLogs(options, function (err, callback) {
            resolve(callback);
        });
    });
    Promise.all([promiseActivityLog]).then((responses) => {
        const messages = responses[0];
        res.send(messages);
    });
});

activityLogRouter.post('/createItemActivityLog', ...merchantHandlers, function (req, res) {
    const user = req.user;

    let userId = user.ID;
    if (req.user.SubmerchantID && typeof req.user.SubmerchantID != 'undefined') {
        userId = req.user.SubmerchantID;
    }

    var promiseActivityLog = new Promise((resolve, reject) => {
        const options = {
            merchantId: userId,
            itemId: req.body.itemId,
            type: req.body.type,
            alternateId: req.body.alternateId
        };

        client.ActivityLog.createItemActivityLog(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseActivityLog]).then((responses) => {
        res.send(responses[0]);
    });
});

activityLogRouter.get('/getCookie', ...merchantHandlers, function (req, res) {
    const cookieName = 'arcticktrack';
    var cookie = req.cookies[cookieName];

    if (cookie) {
        return res.send(cookie);
    }

    res.send(null);
});

activityLogRouter.get('/setCookie', ...merchantHandlers, function (req, res) {
    const cookieName = 'arcticktrack';
    var cookie = req.cookies[cookieName];

    var value = {
        loginActivityId: req.query.loginActivityId || 0,
        alternateId: req.query.alternateId || Math.random().toString(36).substr(2, 10)
    };

    if (cookie) {
        res.clearCookie(cookieName);
    }

    res.cookie(cookieName, value, {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    });

    res.send(value);
});

activityLogRouter.post('/addPageAnaylytics', ...merchantHandlers, function (req, res) {
    const user = req.user;

    var promiseActivityLog = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            data: req.body
        };

        client.ActivityLog.addPageAnaylytics(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseActivityLog]).then((responses) => {
        res.send(responses[0]);
    });
});

activityLogRouter.post('/hasPageAnaylytics', ...merchantHandlers, function (req, res) {
    const user = req.user;

    var promiseActivityLog = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            key: req.body.key
        };

        client.ActivityLog.hasPageAnaylytics(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseActivityLog]).then((responses) => {
        res.send(responses[0]);
    });
});

module.exports = activityLogRouter;
