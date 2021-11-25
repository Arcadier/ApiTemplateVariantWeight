'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Quotations() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Quotations, ArctickClient);

Quotations.prototype.getUserQuotations = function(options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + options.userID + '/offers/',
            params: {
                keyword: options.filters.keywords,
                isAccepted: options.filters.isAccepted,
                isDeclined: options.filters.isDeclined,
                isPending: options.filters.isPending,
                isCancelled: options.filters.isCancelled,
                pageNumber: options.pageNumber,
                pageSize: options.filters.itemsPerPage, 
                isBuyerSideBar: options.filters.isBuyerSideBar
            }
        }, callback);
    });
};

Quotations.prototype.getQuotationById = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + options.userId + '/offers/' + options.quotationId,
            params: {
                includes: options.includes
            }
        }, callback);
    });
};

Quotations.prototype.updateQuotation = function (options, callback) {
    
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + options.userId + '/offer',
            data: {
                ID: options.quotationId,
                Accepted: options.accepted,
                Declined: options.declined,
                MessageType: options.messageType,
                Message: options.message
            }
        }, callback);
    });
};

module.exports = Quotations;