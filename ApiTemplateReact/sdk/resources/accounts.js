'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Accounts() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Accounts, ArctickClient);

Accounts.prototype.loginWithUsernameAndPassword = function(username, password, callback) {
    this._acquireAccessToken({
        username: username,
        password: password,
        client_id: this._clientId,
        client_secret: this._clientSecret,
        grant_type: 'password'
    }, callback);
};

Accounts.prototype.registerWithUsernameAndPassword = function(options, callback) {
    var self = this;
    this._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/accounts/register',
            data: {
                Username: options.username,
                FirstName: options.firstName || null,
                LastName: options.lastName || null,
                Password: options.password,
                ConfirmPassword: options.confirmPassword || options.password,
                Email: options.email || null,
                Token : options.token,
                IsSeller: options.IsSeller,
            }
        }, callback);
    });
};

Accounts.prototype.requestResetPassword = function(options, callback) {
    const self = this;
    const userId = options.userId;
    const action = options.action;

    this._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/admins/' + data.UserId + '/password',
                data: {
                    UserID: userId,
                    Action: action
                }
            }, callback);
        }
    });
};

Accounts.prototype.resetUserPassword = function (options, callback) {
    const self = this;

    this._acquireAdminAccessToken(function (err) {
        if (!err) {
            self._makeRequest({
                method: 'PUT',
                path: '/api/v2/users/' + options.userId + '/password',
                data: {
                    OldPassword: options.oldPassword || null,
                    Password: options.password,
                    ConfirmPassword: options.confirmPassword,
                    ResetPasswordToken: options.resetPasswordToken || null
                }
            }, callback);
        }
    });
};

Accounts.prototype.registerInterestedUser = function(options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/admins/' + data.UserId + '/interested-user',
                data: options
            }, callback);
        }
    });
};

Accounts.prototype.updateUserRole = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'PUT',
                path: '/api/v2/admins/' + data.UserId + '/users/' + options.userId + '/roles/' + options.role,
                data: options
            }, callback);
        }
    });
};

Accounts.prototype.deleteUserRole = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'DELETE',
                path: '/api/v2/admins/' + data.UserId + '/users/' + options.userId + '/roles/' + options.role,
                data: options
            }, callback);
        }
    });
};

module.exports = Accounts;