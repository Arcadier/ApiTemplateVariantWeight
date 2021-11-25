'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Comparisons() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Comparisons, ArctickClient);

Comparisons.prototype.getUserComparisons = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const namesOnly = options.namesOnly;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const includes = options.includes;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/comparisons/',
            params: {
                namesOnly: namesOnly,
                pageSize: pageSize,
                pageNumber: pageNumber,
                includes: includes
            }
        }, callback);
    });
};

Comparisons.prototype.getComparison = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const comparisonId = options.comparisonId;
    const includes = options.includes;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId,
            params: {
                includes: includes
            }
        }, callback);
    });
};

Comparisons.prototype.createComparison = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const name = options.name;
    const includes = options.includes;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/comparisons?includes=' + includes,
            data: {
                Name: name
            }
        }, callback);
    });
};

Comparisons.prototype.editComparison = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const comparisonId = options.comparisonId;
    const name = options.name || null;
    const orderId = options.orderId || null;
    const includes = options.includes || '';
    const comparisonDetailId = options.comparisonDetailId;
    let comparisonDetails = null;

    if (comparisonDetailId) {
        comparisonDetails = [{
            ID: comparisonDetailId
        }];
    }

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId + '?includes=' + includes,
            data: {
                Name: name,
                OrderID: orderId,
                ComparisonDetails: comparisonDetails
            }
        }, callback);
    });
};

Comparisons.prototype.deleteComparisonDetail = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const comparisonId = options.comparisonId;
    const comparisonDetailId = options.comparisonDetailId;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'DELETE',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId + '/comparisons-detail/' + comparisonDetailId
        }, callback);
    });
};

Comparisons.prototype.createComparisonDetail = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const comparisonId = options.comparisonId;
    const cartItemId = options.cartItemId;
    const includes = options.includes;
    const comparisonFields = [];

    JSON.parse(options.comparisonFields).map(function(field) {
        comparisonFields.push({
            Key: field.key,
            Value: field.value
        });
    });

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId + '/comparisons-detail?includes=' + includes,
            data: {
                CartItemID: cartItemId,
                ComparisonFields: comparisonFields
            }
        }, callback);
    });
};

Comparisons.prototype.clearAllComparisonDetails = function(options, callback) {
    const self = this;
    const userId = options.userId;
    const comparisonId = options.comparisonId;
    const includes = options.includes;
    const comparisonDetails = options.comparisonDetails;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId + '?includes=' + includes,
            data: {
                ComparisonDetails: JSON.parse(comparisonDetails)
            }
        }, callback);
    });
};

Comparisons.prototype.getComparisonByOrderId = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const orderId = options.orderId;
    const includeInactive = options.includeInactive;
    const includes = options.includes;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/orders/' + orderId + '/comparisons/',
            params: {
                includeInActive: includeInactive,
                includes: includes
            }
        }, callback);
    });
};

Comparisons.prototype.deleteComparison = function(options, callback) {
    const self = this;
    const userId = options.userId;
    const comparisonId = options.comparisonId;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'DELETE',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId
        }, callback);
    });
};

Comparisons.prototype.createEvaluation = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const name = options.name;
    const includes = options.includes;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/comparisons',
            data: {
                Name: name
            },
            params: {
                includes: includes
            }
        }, callback);
    });
};

Comparisons.prototype.editEvaluation = function(options, callback) {
    const self = this;
    const userId = options.userId;
    const comparisonId = options.comparisonId;
    const name = options.name;
    const includes = options.includes;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId + '?includes=' + includes,
            data: {
                Name: name
            }
        }, callback);
    });
};

Comparisons.prototype.deleteEvaluation = function(options, callback) {
    const self = this;
    const userId = options.userId;
    const comparisonId = options.comparisonId;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'DELETE',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId
        }, callback);
    });
};

Comparisons.prototype.setComparisonReadOnly = function(options, callback) {
    const self = this;

    const userId = options.UserID;
    const comparisonId = options.comparisonId;
    const includes = ['User', 'Order', 'CartItem'];

    const data = {
        Id: comparisonId,
        Active: false,
        ReadOnly: true,
        UserID: userId
    };

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'PUT',
            contentType: 'application/json',
            accept: 'application/json',
            path: '/api/v2/users/' + userId + '/comparisons/' + comparisonId + '?includes=' + includes,
            data: JSON.stringify(data)
        }, callback);
    });
};

Comparisons.prototype.deleteComparisonDetailsByIds = function (options, callback) {
    const self = this;
    const userId = options.userId;
    const ids = options.comparisonDetailIds;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'DELETE',
            path: '/api/v2/users/' + userId + '/comparisons/details?ids=' + ids.join(),
            data: {}
        }, callback);
    });
}

module.exports = Comparisons;