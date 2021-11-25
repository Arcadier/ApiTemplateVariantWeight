'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Payments() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Payments, ArctickClient);

Payments.prototype.generateInvoiceNumber = function (options, callback) {
    const self = this;
    let cartIds = options.cartItemIds;
    let updateInventory = options.hasOwnProperty('updateInventory') ? options.updateInventory : true;
    const updateCartItemsAsProcessed = options.hasOwnProperty('updateCartItemsAsProcessed') ? options.updateCartItemsAsProcessed : false;
    if (Array.isArray(cartIds) !== true) {
        cartIds = [options.cartItemIds];
    }
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + options.userId + '/invoices/carts?updateInventory=' + updateInventory + '&updateCartItemsAsProcessed=' + updateCartItemsAsProcessed,
            data: cartIds
        }, callback);
    });
};

Payments.prototype.updatePaymentDetails = function (options, callback) {
    const self = this;
    const orderId = options.orderId;
    const payerId = options.payerId;
    const payeeId = options.payeeId;
    const invoiceNo = options.invoiceNo;
    const status = options.status;
    const gatewayCode = options.gatewayCode;
    const payKey = options.payKey;
    const transactionId = options.transactionId;
    const gatewayTimestamp = options.gatewayTimestamp;
    const gatewayStatus = options.gatewayStatus;
    const gatewayReceiverId = options.gatewayReceiverId;
    const gatewaySenderId = options.gatewaySenderId;
    const gatewayRef = options.gatewayRef;
    const isMerchantOnly = options.isMerchantOnly || false;
    const isAdminOnly = options.isAdminOnly || false;

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            let body = [];

            const merchantData = {
                Order: {
                    ID: orderId
                },
                Payee: {
                    ID: payeeId
                },
                Payer: {
                    ID: payerId
                },
                Gateway: {
                    Code: gatewayCode
                },
                GatewayPayKey: payKey,
                GatewayTransactionID: transactionId,
                GatewayTimeStamp: gatewayTimestamp,
                GatewayStatus: gatewayStatus,
                GatewayReceiverId: gatewayReceiverId,
                GatewaySenderId: gatewaySenderId,
                GatewayRef: gatewayRef,
                InvoiceNo: invoiceNo,
                Status: status
            };

            const adminData = {
                Order: {
                    ID: orderId
                },
                Payee: {
                    ID: data.UserId
                },
                Payer: {
                    ID: payerId
                },
                Gateway: {
                    Code: gatewayCode
                },
                GatewayPayKey: payKey,
                GatewayTransactionID: transactionId,
                GatewayTimeStamp: gatewayTimestamp,
                GatewayStatus: gatewayStatus,
                GatewayReceiverId: gatewayReceiverId,
                GatewaySenderId: gatewaySenderId,
                GatewayRef: gatewayRef,
                InvoiceNo: invoiceNo,
                Status: status,
            };

            if (isMerchantOnly) {
                body.push(merchantData);
            } else if (isAdminOnly) {
                body.push(adminData);
            } else {
                body.push(merchantData);
                body.push(adminData);
            }

            self._makeRequest({
                method: 'PUT',
                path: '/api/v2/admins/' + data.UserId + '/invoices/' + invoiceNo,
                data: body
            }, callback);
        }
    });
};

Payments.prototype.updateInvoicePayments = function (options, callback) {
    const self = this;

    const merchantId = options.merchantId;
    const invoiceNo = options.invoiceNo;

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'PUT',
                path: '/api/v2/merchants/' + merchantId + '/invoices/' + invoiceNo + '?updateInventory=true&fromCart=' + false,
                data: {}
            }, callback);
        }
    });
};

Payments.prototype.getPaymentGateways = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/admins/' + data.UserId + '/payment-gateways'
            }, callback);
        }
    });
};

Payments.prototype.getPaymentAcceptanceMethods = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/merchants/' + options.merchantId + '/payment-acceptance-methods'
            }, callback);
        }
    });
};

Payments.prototype.createPaymentAcceptanceMethodAsync = function (options, callback) {
    const self = this;


    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/merchants/' + options.merchantId + '/payment-acceptance-methods',
                data: options
            }, callback);
        }
    });
};

Payments.prototype.updateMultiplePaymentDetails = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, admin) {
        if (!err) {
            let data = [];

            options.payments.forEach((payment) => {
                data.push({
                    InvoiceNo: payment.invoiceNo,
                    Status: payment.status,
                    Order: {
                        ID: payment.orderId
                    },
                    Payer: {
                        ID: payment.payerId
                    },
                    Payee: {
                        ID: payment.payeeId == null && payment.isAdmin ? admin.UserId : payment.payeeId
                    },
                    Gateway: {
                        Code: payment.gatewayCode
                    },
                    GatewayPayKey: payment.payKey,
                    GatewayTransactionID: payment.transactionId,
                    GatewayTimeStamp: payment.gatewayTimestamp,
                    GatewayStatus: payment.gatewayStatus,
                    GatewayReceiverId: payment.gatewayReceiverId,
                    GatewaySenderId: payment.gatewaySenderId,
                    GatewayRef: payment.gatewayRef
                });
            });

            self._makeRequest({
                method: 'PUT',
                path: '/api/v2/admins/' + admin.UserId + '/invoices/' + options.invoiceNo,
                data: data
            }, callback);
        }
    });
};

Payments.prototype.getPaymentTerms = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, admin) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/merchants/' + options.merchantId + '/payment-terms'
            }, callback);
        }
    });
}

Payments.prototype.createPaymentTerm = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, admin) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/merchants/' + options.merchantId + '/payment-terms',
                data: {
                    Name: options.name,
                    Description: options.description,
                    Default: options.default
                }
            }, callback);
        }
    });
}

Payments.prototype.updatePaymentTerm = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, admin) {
        if (!err) {
            self._makeRequest({
                method: 'PUT',
                path: '/api/v2/merchants/' + options.merchantId + '/payment-terms/' + options.paymentTermId,
                data: {
                    Name: options.name,
                    Description: options.description,
                    Default: options.default
                }
            }, callback);
        }
    });
}

Payments.prototype.deletePaymentTerm = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function (err, admin) {
        if (!err) {
            self._makeRequest({
                method: 'DELETE',
                path: '/api/v2/merchants/' + options.merchantId + '/payment-terms/' + options.paymentTermId,
            }, callback);
        }
    });
}

Payments.prototype.getPaymentStatuses = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/static/payment-statuses',
                params: {}
            }, callback);
        }
    });
};

Payments.prototype.postCreateInvoiceCosmetic = function (options, callback) {
    const self = this;
   // console.log("postCreateInvoice: ", options)
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/generate-invoice-cosmetic/'+ options.invoiceNo,
                params: {}
            }, callback);
        }
    });
};

module.exports = Payments;