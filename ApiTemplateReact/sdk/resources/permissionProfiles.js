'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function PermissionProfiles() {
    ArctickClient.apply(this, arguments);
}

util.inherits(PermissionProfiles, ArctickClient);


PermissionProfiles.prototype.getPermissions = function(options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: `/api/v2/static/permission-codes?type=${options.type}`,
            }, callback);
        }
    });
};

PermissionProfiles.prototype.getPermissionProfiles = function(options, callback) {
    const self = this;
    const keyword = options.keyword;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const userID = options.userId;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: `/api/v2/users/${userID}/permission-profiles`,
                params: {
                    keyword: keyword,
                    pageSize: pageSize,
                    pageNumber: pageNumber
                }
            }, callback);
        }
    });
};

PermissionProfiles.prototype.createPermissionProfile = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const userGroups = (options.userGroupIds || []).map(m => { return { ID: m } });

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: `/api/v2/users/${userID}/permission-profiles`,
                data: {
                    Name: options.name,
                    UserGroups: userGroups,
                    Permissions: options.permissions || []
                }
            }, callback);
        }
    });
};

PermissionProfiles.prototype.getPermissionProfileDetails = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const permissionProfileID = options.permissionProfileId;
    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: `/api/v2/users/${userID}/permission-profiles/${permissionProfileID}`,
            }, callback);
        }
    });
}

PermissionProfiles.prototype.updatePermissionProfile = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const permissionProfileID = options.permissionProfileId;
    const userGroups = (options.userGroupIds || []).map(m => { return { ID: m } });

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'PUT',
                path: `/api/v2/users/${userID}/permission-profiles/${permissionProfileID}`,
                data: {
                    Name: options.name,
                    UserGroups: userGroups,
                    Permissions: options.permissions || []
                }
            }, callback);
        }
    });
}

PermissionProfiles.prototype.deletePermissionProfile = function (options, callback) {
    const self = this;
    const userID = options.userId;
    const permissionProfileID = options.permissionProfileId;

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'DELETE',
                path: `/api/v2/users/${userID}/permission-profiles/${permissionProfileID}`,
            }, callback);
        }
    });

}
module.exports = PermissionProfiles;