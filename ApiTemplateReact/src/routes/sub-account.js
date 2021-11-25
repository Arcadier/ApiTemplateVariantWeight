'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const passport = require('passport');
const express = require('express');
const subAccountRouter = express.Router();
const store = require('../redux/store');
const template = require('../views/layouts/template');

const authenticated = require('../scripts/shared/authenticated');
const onboardedMerchant = require('../scripts/shared/onboarded-merchant');
const authorizedUser = require('../scripts/shared/authorized-user');
const client = require('../../sdk/client');

const SubAccountListComponent = require('../views/sub-account/list/index').SubAccountListComponent;
const SubAccountRegistrationComponent = require('../views/sub-account/registration/index').SubAccountRegistrationComponent;
const EnumCoreModule = require('../public/js/enum-core');

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

var handlers = [authenticated, authorizedUser, onboardedMerchant];

function setApiToken(res, token, expiry) {
    var maxAge = expiry * 1000;
    res.cookie('webapitoken', token, { maxAge: maxAge, httpOnly: false });
}

const setListPagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-sub-accounts-api`;

        next();
    };
}

subAccountRouter.get('/list', ...handlers, setListPagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), function (req, res) {
    const user = req.user;
    const isMerchantAccess = res.locals.isMerchantRoute;
    const pageType = isMerchantAccess? 'Merchant' : 'Consumer';

    const promiseSubAccounts = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            pageSize: 20,
            pageNumber: 1,
            includes: 'AccountOwner'
        };

        client.Users.getSubAccounts(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseSubAccounts]).then((responses) => {
        const subAccounts = responses[0];
        getUserPermissionsOnPage(user, 'Sub-Accounts', pageType, (pagePermissions) => {
            const reduxState = store.createSubAccountStore({
                userReducer: { 
                    user: user,
                    pagePermissions: pagePermissions
                },
                subAccountReducer: {
                    subAccounts: subAccounts,
                    isMerchantAccess: isMerchantAccess
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<SubAccountListComponent user={user} subAccounts={subAccounts} pagePermissions={pagePermissions} isMerchantAccess={isMerchantAccess} />);

            res.send(template('page-seller sub-account-list page-sidebar', seoTitle, app, 'sub-account-list', reduxState));
        });
    });
});

subAccountRouter.get('/registration/:token', function (req, res) {
    const token = req.params['token'];

    let isSuccessRegister = null;
    if (req.query['error'] === 'invalid-registration') {
        isSuccessRegister = false;
    }

    const promiseRegistration = new Promise((resolve, reject) => {
        const options = {
            token: token
        };

        client.Marketplaces.getSubAccountRegistration(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRegistration, promiseMarketplace]).then((responses) => {
        const registration = responses[0];
        const marketplace = responses[1];
        const isPrivateMarketplace = marketplace.Settings['private-settings']['private-settings-area'] ? marketplace.Settings['private-settings']['private-settings-area'].enabled === 'true' : false;

        if (!registration) {
            if (isPrivateMarketplace) {
                return res.redirect('/accounts/sign-in?error=invalid-token');
            } else {
                return res.redirect('/?error=invalid-token');
            }
        }

        const reduxState = store.createSubAccountStore({
            subAccountReducer: {
                token: token,
                isSuccessRegister: isSuccessRegister
            },
            marketplaceReducer: {
                logoUrl: marketplace.LogoUrl
            }
        }).getState();

        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        const app = reactDom.renderToString(<SubAccountRegistrationComponent logoUrl={marketplace.LogoUrl}
            token={token}
            isSuccessRegister={isSuccessRegister} />);

        res.send(template('page-subacc', seoTitle, app, 'sub-account-registration', reduxState));
    });
});

subAccountRouter.post('/send-invitations', ...handlers, setListPagePermissionCode('add'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;
    const registrationType = req.body['registrationType'];

    const promiseRegistrations = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            invitations: req.body['invitations'],
            registrationType: registrationType
        };

        client.Users.registerSubAccountInvitations(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRegistrations]).then((responses) => {
        res.send({ success: true });
    });
});

subAccountRouter.post('/register', function (req, res, next) {
    passport.authenticate('signup', function (err, user, token) {
        if (err) {
            res.redirect('/subaccount/registration/' + req.body['token'] + '?error=invalid-registration');
        } else {
            if (token) {
                setApiToken(res, token.access_token, token.expires_in);
            }
            if (user) {
                req.logIn(user, function (err) {
                    if (err) {
                        return res.redirect('/subaccounts/registration/' + req.body['token'] + '?error=invalid-login');
                    }

                    if (user.Roles && (user.Roles.includes('Merchant') || user.Roles.includes('SubMerchant'))) {
                        return res.redirect('/merchants/dashboard');
                    }

                    return res.redirect('/');;
                });
            }
        }
    })(req, res, next);
});

subAccountRouter.delete('/delete', ...handlers, setListPagePermissionCode('delete'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;

    const promiseDelete = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            subAccountUserId: req.body['userId']
        };

        client.Users.deleteSubAccount(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseDelete]).then((responses) => {
        res.send(true);
    });
});

subAccountRouter.get('/search', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    console.log(req.user);
    const user = req.user;
    const pageSize = req.query['pageSize'];
    const pageNumber = req.query['pageNumber'];
    const keyword = req.query['keyword'];

    const promiseSubAccounts = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            pageSize: pageSize,
            pageNumber: pageNumber,
            keyword: keyword,
            includes: 'AccountOwner'
        };

        client.Users.getSubAccounts(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseSubAccounts]).then((responses) => {
        const subAccounts = responses[0];

        res.send(subAccounts);
    });
});

subAccountRouter.put('/add-role', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    const user = req.user;

    const promiseUserRole = new Promise((resolve, reject) => {
        const options = {
            userId: req.body['userId'],
            role: req.body['role']
        };

        client.Accounts.updateUserRole(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUserRole]).then((responses) => {
        const isSuccess = responses[0] ? responses[0].Result : false;

        res.send(isSuccess);
    });
});

subAccountRouter.delete('/delete-role', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), function (req, res) {
    const promiseUserRole = new Promise((resolve, reject) => {
        const options = {
            userId: req.body['userId'],
            role: req.body['role']
        };

        client.Accounts.deleteUserRole(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUserRole]).then((responses) => {
        const isSuccess = responses[0] ? responses[0].Result : false;

        res.send(isSuccess);
    });
});

module.exports = subAccountRouter;