'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const express = require('express');
const userGroupRouter = express.Router();
const store = require('../redux/store');
const template = require('../views/layouts/template');

const authenticated = require('../scripts/shared/authenticated');
const authorizedUser = require('../scripts/shared/authorized-user');
const client = require('../../sdk/client');

const UserGroupListComponent = require('../views/user-group/list/index').UserGroupListComponent;
const AddEditUserGroupComponent = require('../views/user-group/add-edit/index').AddEditUserGroupComponent;

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

const handlers = [authenticated, authorizedUser];

const getUserGroups = (userID, filters, callback) => {
    if (!filters) {
        filters = {
            pageSize: 20,
            pageNumber: 1,
            keyword: null,
        };
    }

    const { pageSize, pageNumber, keyword } = filters;
   
    const promiseUserGroups = new Promise((resolve, reject) => {
        const options = {
            userId: userID,
            pageSize: pageSize,
            pageNumber: pageNumber,
            keyword: keyword,
        }
        client.UserGroups.getUserGroups(options, (err, results) => {
            resolve(results);
        });
    });

    Promise.all([promiseUserGroups]).then((responses) => {
        const userGroups = responses[0];
        callback(userGroups);
    });
}

const getAllSubAccounts = (filters, callback, results = []) => {
    let { pageNumber, userID } = filters;

    const promiseSubAccounts = new Promise((resolve, reject) => {
        const options = {
            userId: userID,
            pageNumber: pageNumber,
            pageSize: 20
        };

        client.Users.getSubAccounts(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseSubAccounts]).then((responses) => {
        const users = responses[0];
        if (users && users.Records && users.Records.length > 0) {
            results = [...results, ...users.Records];
            filters.pageNumber += 1;
            return getAllSubAccounts(filters, callback, results);
        } else {
            return callback(results);
        }
    });
}

const setListPagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-user-groups-api`;

        next();
    };
}

const setCreatePagePermissionCode = (accessType) => {
    return (req, res, next) => {
        const pageType = res.locals.isMerchantRoute ? 'merchant' : 'consumer';

        res.locals.permissionCode = `${accessType}-${pageType}-create-user-group-api`;

        next();
    };
}

userGroupRouter.get('/', ...handlers, setListPagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), (req, res)  => {
    const user = req.user;
    const isMerchantAccess = res.locals.isMerchantRoute;
    const pageType = isMerchantAccess ? 'Merchant' : 'Consumer';
    
    getUserGroups(user.ID, null, (userGroups) => {
        getUserPermissionsOnPage(user, 'User Groups', pageType, (pagePermissions) => {
            const reduxState = store.createUserGroupStore({
                userReducer: { 
                    user,
                    pagePermissions,
                },
                userGroupReducer: {
                    userGroups: userGroups,
                    keyword: '',
                    isMerchantAccess: isMerchantAccess
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(
                <UserGroupListComponent 
                    user={user}
                    isMerchantAccess={isMerchantAccess}
                    userGroups={userGroups}
                    pagePermissions={pagePermissions}                
                />);

            res.send(template('page-seller goods-receipt-list page-sidebar', seoTitle, app, 'user-group-list', reduxState));
        });
        
    });
});

userGroupRouter.get('/create', ...handlers, setCreatePagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), (req, res) => {
    const user = req.user;
    const isMerchantAccess = res.locals.isMerchantRoute;
    const pageType = isMerchantAccess ? 'Merchant' : 'Consumer';

    getAllSubAccounts({ userID: user.ID, pageNumber: 1 }, (subAccounts) => {
        getUserPermissionsOnPage(user, 'Create User Group', pageType, (pagePermissions) => {
            const reduxState = store.createUserGroupStore({
                userReducer: { 
                    user: user,
                    pagePermissions: pagePermissions
                },
                userGroupReducer: {
                    subAccounts: subAccounts,
                    isMerchantAccess: isMerchantAccess
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<AddEditUserGroupComponent isMerchantAccess={isMerchantAccess} user={user} subAccounts={subAccounts} pagePermissions={pagePermissions} />);

            res.send(template('page-seller page-sidebar page-purchase-order-details', seoTitle, app, 'add-edit-user-group', reduxState));
        });
    }); 
});

userGroupRouter.post('/create', setCreatePagePermissionCode('edit'),isAuthorizedToPerformAction(), (req, res) => {
    const { user } = req;
    const { name, memberIds } = req.body;

    if (!name) res.send({ success: false, message: 'Invalid Request '});

    const promiseCreateUserGroup = new Promise((resolve, reject) => {
        const options =  {
            userId: user.ID,
            name: name,
            memberIds: JSON.parse(memberIds)
        };
        client.UserGroups.createUserGroup(options, (err, result) => {
            if (err) {
                reject (err);
            } else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseCreateUserGroup]).then((responses) => {
        res.send({ 
            success: responses[0] !== null && responses[0].ID, 
            data: responses[0]
        });
    }).catch((error) => {
        const { message } = error;

        let errMessage = 'Something went wrong. Please try again.';
        if (message.includes(`${name} already exists.`)) {
            errMessage = 'This Name already exists. Please choose a different name.';
        } else if (message.includes('User not found')) {
            errMessage = 'Oops! User is deleted.';
        }

        res.send({ success: false, message: errMessage });
    })
});

userGroupRouter.get('/filter', ...handlers, setListPagePermissionCode('view'), isAuthorizedToPerformAction(), (req, res) => {
    const user = req.user;

    getUserGroups(user.ID, req.query, function (userGroups) {
        res.send({ userGroups: userGroups });
    });
});

userGroupRouter.get('/detail/:userGroupID', ...handlers, setCreatePagePermissionCode('view'), isAuthorizedToAccessViewPage({ renderSidebar: true }), (req, res) => {
    const { user } = req;
    const { userGroupID } = req.params;
    const isMerchantAccess = res.locals.isMerchantRoute;
    const pageType = isMerchantAccess ? 'Merchant' : 'Consumer';

    if (!userGroupID || typeof userGroupID == 'undefined' || userGroupID == 'undefined') return res.send('User group not found.');

    const promiseUserGroupDetails = new Promise((resolve, reject)  => {
        const options = { userId: user.ID, userGroupId: userGroupID  }
        client.UserGroups.getUserGroupDetails(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseUserGroupDetails]).then((responses) => {
        const userGroup = responses[0];
        getAllSubAccounts({ userID: user.ID, pageNumber: 1 }, (subAccounts) => {
            getUserPermissionsOnPage(user, 'Create User Group', pageType, (pagePermissions) => {
                const reduxState = store.createUserGroupStore({
                    userReducer: { 
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    userGroupReducer: {
                        subAccounts: subAccounts,
                        userGroup: userGroup,
                        isMerchantAccess: isMerchantAccess
                    }
                }).getState();

                const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                const app = reactDom.renderToString(<AddEditUserGroupComponent user={user} isMerchantAccess={isMerchantAccess} subAccounts={subAccounts} userGroup={userGroup} pagePermissions={pagePermissions} />);

                res.send(template('page-seller page-sidebar page-purchase-order-details', seoTitle, app, 'add-edit-user-group', reduxState));
            });
        });
    }); 
});

userGroupRouter.put('/detail/:userGroupID', ...handlers, setCreatePagePermissionCode('edit'), isAuthorizedToPerformAction(), (req, res) => {
    const { user } = req;
    const { name, memberIds } = req.body;
    const { userGroupID } = req.params;

    if (!name || !userGroupID) res.send({ success: false, message: 'Invalid Request '});

    const promiseUpdateUserGroup = new Promise((resolve, reject) => {
        const options =  {
            userId: user.ID,
            userGroupId: userGroupID,
            name: name,
            memberIds: JSON.parse(memberIds)
        };
        client.UserGroups.updateUserGroup(options, (err, result) => {
            if (err) {
                reject (err);
            } else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseUpdateUserGroup]).then((responses) => {
        res.send({ 
            success: responses[0] !== null && responses[0].ID, 
            data: responses[0]
        });
    }).catch((error) => {
        const { message } = error;

        let errMessage = 'Something went wrong. Please try again.';
        if (message.includes(`${name} already exists.`)) {
            errMessage = 'This Name already exists. Please choose a different name.';
        } else if (message.includes('User not found')) {
            errMessage = 'Oops! User is deleted.';
        }

        res.send({ success: false, message: errMessage });
    });
});

userGroupRouter.delete('/detail/:userGroupID', ...handlers, setCreatePagePermissionCode('delete'), isAuthorizedToPerformAction(), (req, res) => {
    const { user } = req;
    const { userGroupID } = req.params;

    if (!userGroupID) res.send({ success: false, message: 'Invalid Request '});

    const promiseDeleteUserGroup = new Promise((resolve, reject) => {
        const options =  {
            userId: user.ID,
            userGroupId: userGroupID,
        };
        client.UserGroups.deleteUserGroup(options, (err, result) => {
            if (err) {
                reject (err);
            } else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseDeleteUserGroup]).then((responses) => {
        res.send({ 
            success: responses[0] !== null && responses[0].ID, 
        });
    }).catch(() => {
        res.send({ success: false, message: 'Something went wrong. Please try again.' });
    });
});

module.exports = userGroupRouter;