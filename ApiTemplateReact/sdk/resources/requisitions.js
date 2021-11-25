'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Requisitions() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Requisitions, ArctickClient);

Requisitions.prototype.createRequisition = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + options.userId + '/requisitions',
            data: {
                RequisitionOrderNo: options.requisitionOrderNo,
                RequestorName: options.requestorName,
                MetaData: options.metadata,
                Status: options.status,
                orderId: options.orderId
            }
        }, callback);
    });
};

Requisitions.prototype.getRequisitionById = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + options.userId + '/requisitions/' + options.requisitionId,
            params: {},
        }, callback);
    });
}

Requisitions.prototype.getUserRequisitions = function (options, callback) {
    const self = this;
    let path = "";
    let method = "";
    if (options.filterVm) {
        path = '/api/v2/users/' + options.userID + '/search-requisitions';
        method = "POST";
    }
    else {
        path = '/api/v2/users/' + options.userID + '/requisitions';
        method = "GET";
    }
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: method,
            path: path,
            data: options.filterVm
        }, callback);
    });
};

Requisitions.prototype.updateRequisition = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + options.userId + '/requisitions',
            data: {
                ID: options.ID,
                Status: options.status
            }
        }, callback);
    });
};

module.exports = Requisitions;