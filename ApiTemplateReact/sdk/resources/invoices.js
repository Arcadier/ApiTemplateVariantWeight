'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Invoices() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Invoices, ArctickClient);

Invoices.prototype.createInvoice = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/merchants/' + options.userId + '/invoice',
            data: {
                CurrencyCode: options.currencyCode,
                Total: options.total,
                Fee: options.fee,
                Payee: {
                    ID: options.payeeId
                },
                Payer: {
                    ID: options.payerId
                },
                Order: {
                    ID: options.orderId
                },
                PaymentDueDateTime: options.paymentDueDateTime,
                GatewayTransactionID: options.gatewayTransactionId,
                Status: options.status
            }
        }, callback);
    });
};

Invoices.prototype.updateInvoiceStatus = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/merchants/' + options.userId + '/invoice',
            data: {
                InvoiceNo: options.invoiceNo,
                Status: options.status,
            }
        }, callback);
    });
};

module.exports = Invoices;