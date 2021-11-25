'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const client = require('../../../sdk/client');
const Store = require('../../redux/store');

const template = require('../../views/layouts/template');
const UnauthorizedAccessPageWithSidebarComponent = require('../../views/common/unauthorized-access-with-sidebar').UnauthorizedAccessPageWithSidebarComponent;
const UnauthorizedAccessPageComponent = require('../../views/common/unauthorized-access').UnauthorizedAccessPageComponent;

const getUserPermissionsOnPage = (user, page, type, callback) => {
    if (user.SubmerchantID == null && user.SubBuyerID == null) {
        return callback({
            isAuthorizedToAdd: true,
            isAuthorizedToEdit: true,
            isAuthorizedToDelete: true,
        });
    }
    const userID = user.SubBuyerID || user.SubmerchantID || user.ID;
    const promiseUserPermissions = new Promise((resolve, reject) => {
        const options = {
            userId: userID,
            permissionName: page,
            permissionType: type
        };
        client.Users.getUserPermissions(options, function (err, permissions) {
            resolve(permissions)
        });
    });
    Promise.all([promiseUserPermissions]).then((responses) => {
        const data = responses[0];
        const pageTypeWithName = `${type.toLowerCase()}-${page.toLowerCase().replace(/ /g, '-')}`;

        if (data && data.length > 0) {
            return callback({
                isAuthorizedToAdd: data.includes(`add-${pageTypeWithName}-api`),
                isAuthorizedToEdit: data.includes(`edit-${pageTypeWithName}-api`),
                isAuthorizedToDelete: data.includes(`delete-${pageTypeWithName}-api`),
            });
        }
        return callback({
            isAuthorizedToAdd: false,
            isAuthorizedToEdit: false,
            isAuthorizedToDelete: false,
        });
    });

}

const capitalizeTheFirstLetterOfEachWord = (words) => {
    let separateWord = words.toLowerCase().split(' ');
    for (var i = 0; i < separateWord.length; i++) {
        separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
            separateWord[i].substring(1);
    }
    return separateWord.join(' ');
}

const extractPermissionNameAndTypeFromCode = (code) => {
    let permissionType = code.includes('consumer') ? "Consumer" : "Merchant";
    let temp = code.replace(/^(view-)|(add-)|(edit-)|(delete-)|(consumer-)|(merchant-)|(-api)/g, '');
    temp = temp.replace(/-/g, ' ');
    let permissionName = capitalizeTheFirstLetterOfEachWord(temp);
    if (permissionName == 'Sub Accounts') {
        permissionName = permissionName.replace(' ', '-');
    }
    return { permissionType, permissionName };
}

const hasPermission = (userID, code, callback) => {
    const { permissionName, permissionType } = extractPermissionNameAndTypeFromCode(code);
    const promiseUserPermissions = new Promise((resolve, reject) => {
        const options = {
            userId: userID,
            permissionName,
            permissionType
        };
        client.Users.getUserPermissions(options, function (err, userDetails) {
            resolve(userDetails)
        });
    });

    Promise.all([promiseUserPermissions]).then((responses) => {
        const data = responses[0];
        let authorized = false;
        if (data && data.length > 0) {
            authorized = data && data.includes(code);
        }
        callback(authorized);
    });
}

// Display unauthorized message on page if user has no view permission
const isAuthorizedToAccessViewPage = (options) => {
    return (req, res, next) => {
        var { code, renderSidebar } = options;
        //for shared buyer/merchant routes, get code from res.locals
        if (!code) code = res.locals.permissionCode;
        const { user } = req;
        if (user) {
            if (user.SubmerchantID == null && user.SubBuyerID == null) return next();
            const userID = user.SubBuyerID || user.SubmerchantID || user.ID;

            code = DoCustomUniqueCodeLogic(code, req);
            const store = Store.createUnauthorizedAccessStore({
                userReducer: {
                    user: user,
                }
            });
            const reduxState = store.getState();

            let seoTitle = options.seoTitle;
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            if (req.query['error'] == 'UNAUTHORIZED_ACCESS') {
                const app = reactDom.renderToString(<UnauthorizedAccessPageComponent user={user} />);
                const appString = `${options.appString} unauthorized-access`;
                return res.send(template("page-home", seoTitle, app, appString, reduxState));
            } else if (req.query['error'] == 'UNAUTHORIZED_PORTAL_ACCESS') {
                const app = reactDom.renderToString(<UnauthorizedAccessPageWithSidebarComponent user={user} />);
                const bodyClass = 'page-seller page-sidebar page-delivery-setting';
                const appString = `${options.appString} unauthorized-access-with-sidebar`;
                return res.send(template(bodyClass, seoTitle, app, appString, reduxState));
            } else {
                hasPermission(userID, code, (authorized) => {
                    if (!authorized) {
                        let app = reactDom.renderToString(<UnauthorizedAccessPageComponent user={user} />);
                        let bodyClass = "page-home";
                        let appString = `${options.appString} unauthorized-access`;
                        if (renderSidebar) {
                            app = reactDom.renderToString(<UnauthorizedAccessPageWithSidebarComponent user={user} />);
                            bodyClass = 'page-seller page-sidebar page-delivery-setting';
                            appString = `${options.appString} unauthorized-access-with-sidebar`;
                        }
                        return res.send(template(bodyClass, seoTitle, app, appString, reduxState));
                    } else {
                        return next();
                    }
                });
            }

        } else {
            return next();
        }
    }
}

const UNIQUE_CODE_LOGIC_CONSTANT = {
    POLICY_INFO_PAGE: "POLICY_INFO_PAGE",
}

const DoCustomUniqueCodeLogic = (code, req) => {

    const { user } = req;

    if (code == UNIQUE_CODE_LOGIC_CONSTANT.POLICY_INFO_PAGE) {
        if (req.params.policyName == 'about-us') {
            code = ('view-consumer-about-us-api')
        }
        else if (req.params.policyName == 'terms-of-service' || req.params.policyName == 'terms-of-use') {
            code = ('view-consumer-terms-of-service-api')
        }
        else if (req.params.policyName == 'privacy-policy') {
            code = ('view-consumer-privacy-policy-api')
        }
        else if (req.params.policyName == 'return-policy') {
            code = ('view-consumer-return-policy-api')
        }
        else if (req.params.policyName == 'faq') {
            code = ('view-consumer-faq-api')
        }
        else if (req.params.policyName == 'contact-us') {
            code = ('view-consumer-contact-us-api')
        }
    }

    return code
}

const isAuthorizedToPerformAction = (code) => {
    return (req, res, next) => {
        //shared buyer/merchant routes, get code from res.locals
        if (!code) code = res.locals.permissionCode;
        const { user } = req;
        if (user) {
            if (user.SubmerchantID == null && user.SubBuyerID == null) return next();
            const userID = user.SubBuyerID || user.SubmerchantID || user.ID;

            code = DoCustomUniqueCodeLogic(code, req);

            hasPermission(userID, code, (authorized) => {
                if (!authorized) {
                    return res.send({ success: false, message: 'You need permission to perform this action.' });
                } else {
                    return next();
                }
            });
        } else {
            return next();
        }
    }
}

module.exports = {
    getUserPermissionsOnPage,
    isAuthorizedToAccessViewPage,
    hasPermission,
    isAuthorizedToPerformAction,
    UNIQUE_CODE_LOGIC_CONSTANT
}