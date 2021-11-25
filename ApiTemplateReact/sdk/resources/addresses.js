'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Addresses() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Addresses, ArctickClient);

Addresses.prototype.getUserAddresses = function(userId, callback) {
    var self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/addresses/',
            params: {
                sort: 'date'
            }
        }, callback);
    });
};

Addresses.prototype.getUserPickupAddresses = function(userId, callback) {
    var self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/addresses?filter=pickup&sort=date'
        }, callback);
    });
};

Addresses.prototype.createAddress = function(userId, body, callback) {
    var self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/addresses/',
            data: body
        }, callback);
    });
};

Addresses.prototype.deleteAddress = function(userId, addressId, callback) {
    var self = this;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'DELETE',
            path: '/api/v2/users/' + userId + '/addresses/' + addressId
        }, callback);
    });
};

module.exports = Addresses;
