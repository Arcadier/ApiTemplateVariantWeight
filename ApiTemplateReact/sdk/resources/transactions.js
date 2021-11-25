'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Transactions() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Transactions, ArctickClient);

Transactions.prototype.getTransactions = function(pageSize, pageNumber, keyWords, startDate, endDate, sort, callback) {
    const self = this;
    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/admins/' + data.UserId + '/transactions',
                params: {
                    pageSize: pageSize,
                    pageNumber: pageNumber,
                    keyWords: keyWords,
                    startDate: startDate,
                    endDate: endDate,
                    sort: sort
                }
            }, callback);
        }
    });
};

Transactions.prototype.getReports = function(merchantId, type, startDate, endDate, reportBy, pageSize, pageNumber, callback) {
    const self = this;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/merchants/' + merchantId + '/reports',
                params: {
                    merchantId: merchantId,
                    type: type,
                    startDate: startDate,
                    endDate: endDate,
                    report_by: reportBy,
                    pageSize: pageSize,
                    pageNumber: pageNumber
                }
            }, callback);
        }
    });
};

Transactions.prototype.updateTransactionInvoiceStatus = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/admins/' + data.UserId + '/transactions/' + options.invoiceNo,
                data: {
                    FulfilmentStatus: options.fulfilmentStatus,
                    PaymentStatus: options.paymentStatus
                }
            }, callback);
        }
    });
}

module.exports = Transactions;
