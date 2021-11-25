'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function UserGroups() {
    ArctickClient.apply(this, arguments);
}

util.inherits(UserGroups, ArctickClient);

UserGroups.prototype.createUserGroup = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const users = (options.memberIds || []).map(m => { return { ID: m } });

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: `/api/v2/users/${userID}/user-groups`,
                data: {
                    Name: options.name,
                    Users: users
                }
            }, callback);
        }
    });
};


UserGroups.prototype.getUserGroups = function(options, callback) {
    const self = this;
    const keyword = options.keyword;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const userID = options.userId;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: `/api/v2/users/${userID}/user-groups`,
                params: {
                    keyword: keyword,
                    pageSize: pageSize,
                    pageNumber: pageNumber
                }
            }, callback);
        }
    });
};

UserGroups.prototype.getUserGroupDetails = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const userGroupID = options.userGroupId;
    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: `/api/v2/users/${userID}/user-groups/${userGroupID}`,
            }, callback);
        }
    });
}

UserGroups.prototype.updateUserGroup = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const userGroupID = options.userGroupId;
    const users = (options.memberIds || []).map(m => { return { ID: m } });

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'PUT',
                path: `/api/v2/users/${userID}/user-groups/${userGroupID}`,
                data: {
                    Name: options.name,
                    Users: users
                }
            }, callback);
        }
    });
}

UserGroups.prototype.deleteUserGroup = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const userGroupID = options.userGroupId;

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'DELETE',
                path: `/api/v2/users/${userID}/user-groups/${userGroupID}`,
            }, callback);
        }
    });

}
module.exports = UserGroups;