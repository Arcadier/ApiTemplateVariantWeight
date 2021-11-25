'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function ShippingMethods() {
    ArctickClient.apply(this, arguments);
}

util.inherits(ShippingMethods, ArctickClient);
 
ShippingMethods.prototype.getShippingOptions = function (callback) {
    const self = this;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            const path = '/api/v2/merchants/' + data.UserId + '/shipping-methods/';
            self._makeRequest({
                method: 'GET',
                path: path
            }, callback);
        }
    });
};

ShippingMethods.prototype.getShippingMethods = function (userId, callback) {
    const self = this;
    const path = '/api/v2/merchants/' + userId + '/shipping-methods/';

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: path
            }, callback);
        }
    });
};

ShippingMethods.prototype.getShippingMethodObject = function (userId, shippingMethodId, callback) {
    const self = this;
    const path = '/api/v2/merchants/' + userId + '/shipping-methods/' + shippingMethodId;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: path
            }, callback);
        }
    });
};

ShippingMethods.prototype.deleteShippingMethod = function (merchantID, shippingmethodID, callback) {
    const self = this;
    const path = '/api/v2/merchants/' + merchantID + '/shipping-methods/' + shippingmethodID;
    self._makeRequest({
        method: 'DELETE',
        path: path
    }, callback);
};

ShippingMethods.prototype.createShippingMethod = function (merchantID, shippingMethodObject, callback) {
    const self = this;
    const path = '/api/v2/merchants/' + merchantID + '/shipping-methods/';

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: path,
                data: shippingMethodObject
            }, callback);
        }
    });
};

ShippingMethods.prototype.updateShippingMethod = function (merchantID, shippingMethodObject, callback) {
    const self = this;

    const path = '/api/v2/merchants/' + merchantID + '/shipping-methods/' + JSON.parse(shippingMethodObject).ID;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'PUT',
                path: path,
                data: shippingMethodObject
            }, callback);
        }
    });
};

module.exports = ShippingMethods;
