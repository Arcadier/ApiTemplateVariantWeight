'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function ActivityLog() {
    ArctickClient.apply(this, arguments);
}

util.inherits(ActivityLog, ArctickClient);

ActivityLog.prototype.getActivityLog = function (options, callback) {
    var self = this;
    const userId = options.userId;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/activity-logs',
            params: {
                pageSize: pageSize,
                pageNumber: pageNumber
            }
        }, callback);
    });
};
ActivityLog.prototype.createItemActivityLog = function (options, callback) {
    const self = this;

    const merchantId = options.merchantId;
    const itemId = options.itemId;
    const type = options.type;
    const alternateId = options.alternateId;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/merchants/' + merchantId + '/item-activity-logs/' + itemId,
            data: {
                Type: type,
                AlternateId: alternateId
            }
        }, callback);
    });
};
ActivityLog.prototype.getSearchActivityLogs = function (options, callback) {
    var self = this;
    const userId = options.userId;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const logName = options.logName !== undefined ? options.logName : options.keyword;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/' + logName,
            params: {
                pageSize: pageSize,
                pageNumber: pageNumber
            }
        }, callback);
    });
};
ActivityLog.prototype.getExportActivityLogs = function (options, callback) {
    const self = this;
    const userId = options.userId;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const startDate = options.startDate;
    const endDate = options.endDate;
    const logName = 'export-logs-excel';
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/' + logName,
            params: {
                pageSize: pageSize,
                pageNumber: pageNumber,
                startDate: startDate,
                endDate: endDate
            }
        }, callback);
    });
};
ActivityLog.prototype.logLoginActivity = function (options, callback) {
    const self = this;
    const userId = options.userId;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/activities/login',
            data: {
                Browser: options.browser,
                GeoLocation: options.geoLocation,
                AlternateId: options.alternateId
            }
        }, callback);
    });
};
ActivityLog.prototype.logPageActivity = function (options, callback) {
    const self = this;
    const userId = options.userId;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/activities/page',
            data: {
                PageUrl: options.pageUrl,
                AlternateId: options.alternateId
            }
        }, callback);
    });
};

ActivityLog.prototype.addPageAnaylytics = function (options, callback) {
    const self = this;
    const userId = options.userId;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/page-analytics',
            data: options.data
        }, callback);
    });
};

ActivityLog.prototype.hasPageAnaylytics = function (options, callback) {
    const self = this;
    const userId = options.userId;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/page-analytics',
            params: { key: options.key }
        }, callback);
    });
};




module.exports = ActivityLog;
