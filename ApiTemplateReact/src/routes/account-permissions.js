'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const express = require('express');
const accountPermissionRouter = express.Router();
const store = require('../redux/store');
const template = require('../views/layouts/template');

const authenticated = require('../scripts/shared/authenticated');
const authorizedUser = require('../scripts/shared/authorized-user');
const onboardedMerchant = require('../scripts/shared/onboarded-merchant');
const client = require('../../sdk/client');

const handlers = [authenticated, authorizedUser, validateMerchantAccess];

const AccountPermissionListComponent = require('../views/account-permission/list/index').AccountPermissionListComponent;
const AddEditPermissionProfileComponent = require('../views/account-permission/add-edit/index').AddEditPermissionProfileComponent;

const { 
    hasPermission,
    getUserPermissionsOnPage,
    isAuthorizedToAccessViewPage,
    isAuthorizedToPerformAction
} = require('../scripts/shared/user-permissions');

function validateMerchantAccess(req, res, next) {
    if (res.locals.isMerchantRoute) {
        return onboardedMerchant(req, res, next);
    }

    next();
}

const getAllUserGroups = (filters, callback, results = []) => {
    let { pageNumber, userID } = filters;
   
    const promiseUserGroups = new Promise((resolve, reject) => {
        const options = {
            userId: userID,
            pageNumber: pageNumber,
            pageSize: 20
        }
        client.UserGroups.getUserGroups(options, (err, results) => {
            resolve(results);
        });
    });

    Promise.all([promiseUserGroups]).then((responses) => {
        const userGroups = responses[0];

        if (userGroups && userGroups.Records && userGroups.Records.length > 0) {
        	results = [...results, ...userGroups.Records];
        	filters.pageNumber += 1;
        	return getAllUserGroups(filters, callback, results);
        } else {
        	return callback(results);
        }
    });
}

const getPermissionProfiles = (userID, filters, callback) => {
    if (!filters) {
        filters = {
            pageSize: 20,
            pageNumber: 1,
            keyword: null,
        };
    }

    const { pageSize, pageNumber, keyword } = filters;
   
    const promisePermissionProfiles = new Promise((resolve, reject) => {
        const options = {
            userId: userID,
            pageSize: pageSize,
            pageNumber: pageNumber,
            keyword: keyword,
        }
        client.PermissionProfiles.getPermissionProfiles(options, (err, results) => {
            resolve(results);
        });
    });

    Promise.all([promisePermissionProfiles]).then((responses) => {
        const permissionProfiles = responses[0];
        callback(permissionProfiles);
    });
}

const setListPagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-account-permissions-api`;

        next();
    };
}

const setCreatePagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-create-account-permission-api`;

        next();
    };
}

accountPermissionRouter.get('/', ...handlers, setListPagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), (req, res) => {
    const user = req.user;
    getPermissionProfiles(user.ID, null, (permissionProfiles) => {
        const isMerchantAccess = res.locals.isMerchantRoute;
        const pageType = isMerchantAccess ? 'Merchant' : 'Consumer';

        getUserPermissionsOnPage(user, 'Account Permissions', pageType, (pagePermissions) => {
            const reduxState = store.createAccountPermissionStore({
                userReducer: { 
                    user,
                    pagePermissions
                },
                accountPermissionReducer: {
                    permissionProfiles: permissionProfiles,
                    keyword: '',
                    isMerchantAccess: isMerchantAccess
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(
                <AccountPermissionListComponent 
                    user={user}
                    permissionProfiles={permissionProfiles}
                    isMerchantAccess={isMerchantAccess}
                    pagePermissions={pagePermissions}
                />);

            res.send(template('page-seller goods-receipt-list page-sidebar', seoTitle, app, 'account-permission-list', reduxState));
        });
    });
});

accountPermissionRouter.get('/filter', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), (req, res) => {
    const user = req.user;

    getPermissionProfiles(user.ID, req.query, function (permissionProfiles) {
        res.send({ permissionProfiles: permissionProfiles });
    });
});

accountPermissionRouter.get('/create', ...handlers, setCreatePagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), (req, res) => {
    const user = req.user;
    getAllUserGroups({ userID: user.ID, pageNumber: 1 }, (userGroups) => {
        const isMerchantAccess = res.locals.isMerchantRoute;
        const pageType = isMerchantAccess ? "Merchant" : "Consumer";

        const promisePermissions = new Promise((resolve, reject) => {
            client.PermissionProfiles.getPermissions({ type: pageType }, (err, results) => resolve(results));
        });

        let promiseMerchantConsumerPermissions = null;

        if (isMerchantAccess) {
            promiseMerchantConsumerPermissions = new Promise((resolve, reject) => {
                client.PermissionProfiles.getPermissions({ type: 'Consumer' }, (err, results) => resolve(results));
            });
        }

        let pageNameOverrides = [];
        if (process.env.CHECKOUT_FLOW_TYPE === "b2b") {
            pageNameOverrides.push({ Reference: "One Page Checkout", Name: "Checkout Page (Create Requisition)" });
        }

        Promise.all([promisePermissions, promiseMerchantConsumerPermissions]).then((responses) => {
            let permissions = (responses[0] != null && responses[0].Records) || [];
            const merchantConsumerPermissions = (responses[1] != null && responses[1].Records) || [];

            permissions = permissions.concat(merchantConsumerPermissions);

            getUserPermissionsOnPage(user, 'Create Account Permission', pageType, (pagePermissions) => {
                const reduxState = store.createAccountPermissionStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    accountPermissionReducer: {
                        userGroups: userGroups,
                        permissions: permissions,
                        pageNameOverrides: pageNameOverrides,
                        isMerchantAccess: isMerchantAccess
                    }
                }).getState();

                const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                const app = reactDom.renderToString(
                    <AddEditPermissionProfileComponent
                        user={user}
                        userGroups={userGroups}
                        permissions={permissions}
                        pageNameOverrides={pageNameOverrides}
                        isMerchantAccess={isMerchantAccess}
                        pagePermissions={pagePermissions}
                    />);

                res.send(template('page-seller page-sidebar page-purchase-order-details', seoTitle, app, 'add-edit-account-permission', reduxState));
            });
        });
	});
});

accountPermissionRouter.post('/create', setCreatePagePermissionCode('edit'), isAuthorizedToPerformAction(), (req, res) => {
    const { user } = req;
    const { name, permissions } = req.body;
    const userGroupIds = JSON.parse(req.body.userGroupIds || []);
    if (!name || !userGroupIds || (userGroupIds && userGroupIds.length == 0)) {
        return res.send({ success: false, message: 'Invalid Request '});
    }

    const promiseCreatePermissionProfile = new Promise((resolve, reject) => {
        const options =  {
            userId: user.ID,
            name: name,
            userGroupIds: userGroupIds,
            permissions: JSON.parse(permissions)
        };
        client.PermissionProfiles.createPermissionProfile(options, (err, result) => {
            if (err) {
                reject (err);
            } else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseCreatePermissionProfile]).then((responses) => {
        res.send({ 
            success: responses[0] !== null && responses[0].ID, 
            data: responses[0]
        });
    }).catch((error) => {
        const { message } = error;

        let errMessage = 'Something went wrong. Please try again.';
        if (message.includes(`${name} already exists.`)) {
            errMessage = 'This Name already exists. Please choose a different name.';
        } else if (message.includes('User group not found')) {
            errMessage = 'Oops! Group not found.';
        }
        res.send({ success: false, message: errMessage });
    });
});

accountPermissionRouter.delete('/detail/:permissionProfileID', ...handlers, setListPagePermissionCode('delete'), isAuthorizedToPerformAction(), (req, res) => {
    const { user } = req;
    const { permissionProfileID } = req.params;

    if (!permissionProfileID) res.send({ success: false, message: 'Invalid Request '});

    const promiseDeletePermissionProfile = new Promise((resolve, reject) => {
        const options =  {
            userId: user.ID,
            permissionProfileId: permissionProfileID,
        };
        client.PermissionProfiles.deletePermissionProfile(options, (err, result) => {
            if (err) {
                reject (err);
            } else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseDeletePermissionProfile]).then((responses) => {
        res.send({ 
            success: responses[0] !== null && responses[0].ID, 
        });
    }).catch(() => {
        res.send({ success: false, message: 'Something went wrong. Please try again.' });
    });
});

accountPermissionRouter.get('/detail/:permissionProfileID', ...handlers, setCreatePagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), (req, res) => {
    const { user } = req;
    const { permissionProfileID } = req.params;

    if (!permissionProfileID || typeof permissionProfileID == 'undefined' || permissionProfileID == 'undefined') {
        return res.send('User group not found.');
    }
    getAllUserGroups({ userID: user.ID, pageNumber: 1 }, (userGroups) => {
        const promisePermissionProfileDetails = new Promise((resolve, reject)  => {
            const options = { userId: user.ID, permissionProfileId: permissionProfileID  }
            client.PermissionProfiles.getPermissionProfileDetails(options, (err, result) => {
                resolve(result);
            });
        });

        const isMerchantAccess = res.locals.isMerchantRoute;
        const pageType = isMerchantAccess ? "Merchant" : "Consumer";

        const promisePermissions = new Promise((resolve, reject) => {
            client.PermissionProfiles.getPermissions({ type: pageType }, (err, results) => resolve(results));
        });

        let promiseMerchantConsumerPermissions = null;

        if (isMerchantAccess) {
            promiseMerchantConsumerPermissions = new Promise((resolve, reject) => {
                client.PermissionProfiles.getPermissions({ type: 'Consumer' }, (err, results) => resolve(results));
            });
        }

        Promise.all([promisePermissionProfileDetails, promisePermissions, promiseMerchantConsumerPermissions]).then((responses) => {
            const permissionProfile = responses[0];
            let permissions = (responses[1] != null && responses[1].Records) || [];
            const merchantConsumerPermissions = (responses[2] != null && responses[2].Records) || [];

            permissions = permissions.concat(merchantConsumerPermissions);

            let pageNameOverrides = [];
            if (process.env.CHECKOUT_FLOW_TYPE === "b2b") {
                pageNameOverrides.push({ Reference: "One Page Checkout", Name: "Checkout Page (Create Requisition)" });
            }

            getUserPermissionsOnPage(user, 'Create Account Permission', pageType, (pagePermissions) => {
                const reduxState = store.createAccountPermissionStore({
                    userReducer: { 
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    accountPermissionReducer: {
                        userGroups: userGroups,
                        permissions: permissions,
                        permissionProfile: permissionProfile,
                        pageNameOverrides: pageNameOverrides,
                        isMerchantAccess: isMerchantAccess
                    }
                }).getState();

                const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                const app = reactDom.renderToString(<AddEditPermissionProfileComponent 
                    user={user}
                    userGroups={userGroups}
                    permissions={permissions}
                    permissionProfile={permissionProfile}
                    pageNameOverrides={pageNameOverrides}
                    isMerchantAccess={isMerchantAccess}
                    pagePermissions={pagePermissions}
                />);

                res.send(template('page-seller page-sidebar page-purchase-order-details', seoTitle, app, 'add-edit-account-permission', reduxState));
            });
        });
    });
});

accountPermissionRouter.put('/detail/:permissionProfileID', ...handlers, setCreatePagePermissionCode('edit'), isAuthorizedToPerformAction(), (req, res) => {
    const { user } = req;
    const { name, permissions } = req.body;
    const { permissionProfileID } = req.params;
    const userGroupIds = JSON.parse(req.body.userGroupIds || []);
    if (!permissionProfileID || !name || !userGroupIds || (userGroupIds && userGroupIds.length == 0)) {
        return res.send({ success: false, message: 'Invalid Request '});
    }
    const promiseUpdatePermissionProfile = new Promise((resolve, reject) => {
        const options =  {
            userId: user.ID,
            name: name,
            userGroupIds: userGroupIds,
            permissions: JSON.parse(permissions),
            permissionProfileId: permissionProfileID
        };
        client.PermissionProfiles.updatePermissionProfile(options, (err, result) => {
            if (err) {
                reject (err);
            } else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseUpdatePermissionProfile]).then((responses) => {
        res.send({ 
            success: responses[0] !== null && responses[0].ID, 
            data: responses[0]
        });
    }).catch((error) => {
        const { message } = error;

        let errMessage = 'Something went wrong. Please try again.';
        if (message.includes(`${name} already exists.`)) {
            errMessage = 'This Name already exists. Please choose a different name.';
        } else if (message.includes('User group not found')) {
            errMessage = 'Oops! Group not found.';
        }
        res.send({ success: false, message: errMessage });
    });
});

accountPermissionRouter.get('/hasPermissionToPerformAction', (req, res) => {
    const { user } = req;
    const code = req.query['code'];
    if (user && (user.SubBuyerID || user.SubmerchantID || user.ID) && code !== null) {
        const userID = user.SubBuyerID || user.SubmerchantID || user.ID;

        hasPermission(userID, code, (authorized) => {
            return res.send({ success: true, authorized });
        });
    } else {
        return res.send({ success: false , authorized: false });
    }
});

module.exports = accountPermissionRouter;