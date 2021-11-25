'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Users() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Users, ArctickClient);

Users.prototype.getCurrentUser = function(token, callback) {
    if (token == null || token === '') {
        callback(null, null);
        return;
    }
    this.setAccessToken(token);
    this._makeRequest({
        method: 'GET',
        path: '/api/v2/users',
        params: {
            includes: 'MerchantOwnerID,AccountOwnerID,UserLogins'
        }
    }, callback);
};

Users.prototype.getUserDetails = function(options, callback) {
    const self = this;

    const excludeToken = options.excludeToken || false;
    const token = !excludeToken ? options.token : null;
    const userId = options.userId;
    const includes = options.includes || '';
    const includeUserCustomFields = options.includeUserCustomFields || false;
    const includePermissions = options.includePermissions || false;
    
    if (token || excludeToken) {
        this.setAccessToken(token);
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId,
            params: {
                includes: includes,
                includeUserCustomFields: includeUserCustomFields,
                includePermissions: includePermissions
            }
        }, callback);
    } else {
        self._acquireAdminAccessToken(function () {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/users/' + userId,
                params: {
                    includes: includes,
                    includeUserCustomFields: includeUserCustomFields,
                    includePermissions: includePermissions
                }
            }, callback);
        });
    }
};

Users.prototype.getUserLogins = function(userId, callback) {
    const self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId,
            params: {
                includes: 'UserLogins'
            }
        }, callback);
    });
};

Users.prototype.updateUser = function (userId, userInfo, callback) {
    const self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userId,
            data: userInfo
        }, callback);
    });
};

Users.prototype.getAnalyticsApiAccess = function (options, callback) {
    const self = this;
    const merchantId = options.merchantId;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/merchants/' + merchantId + '/analytics'
        }, callback);
    });
};

Users.prototype.getUsers = function(options, callback) {
    const self = this;
    const keyword = options.keyword;
    const role = options.role;
    const pageSize = options.pageSize;
    const findExact = options.findExact;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/admins/' + data.UserId + '/users/',
                params: {
                    keywords: keyword,
                    role: role,
                    findExact: findExact,
                    pageSize : pageSize
                }
            }, callback);
        }
    });
};

Users.prototype.mergeGuestToUser = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const guestUserID = options.guestUserId;
    const returnUrl = options.returnUrl;

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/accounts/merge-data',
                params: {
                    guestUserId: guestUserID,
                    userId: userID
                }
            }, callback);
        }
    });
};

Users.prototype.registerSubAccountInvitations = function (options, callback) {
    const self = this;

    const userId = options.userId;
    const data = JSON.parse(options.invitations).map((invitation) => {
        return {
            Name: invitation.name,
            Email: invitation.email,
            RegistrationType: options.registrationType
        }
    });

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/sub-accounts/invites',
            data: data
        }, callback);
    });
};

Users.prototype.getSubAccounts = function (options, callback) {
    const self = this;

    const userId = options.userId;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const keyword = options.keyword;
    const includes = options.includes || ''

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/sub-accounts',
            params: {
                pageSize: pageSize,
                pageNumber: pageNumber,
                keyword: keyword,
                sort: 'username',
                includes: includes
            }
        }, callback);
    });
};

Users.prototype.deleteSubAccount = function (options, callback) {
    const self = this;

    const userId = options.userId;
    const subAccountUserId = options.subAccountUserId;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'DELETE',
            path: '/api/v2/users/' + userId + '/sub-accounts/' + subAccountUserId
        }, callback);
    });
};

Users.prototype.getAllUsers = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, data) {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/admins/' + data.UserId + '/users',
            params: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                role: options.role,
                sort: options.sort
            }
        }, callback);
    });
}

Users.prototype.getUserPermissions = function (options, callback) {
    const self = this;

    const { userId, permissionName, permissionType } = options;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/get-user-permissions',
            params: {
                permissionName,
                permissionType
            }
        }, callback);
    });
};

module.exports = Users;