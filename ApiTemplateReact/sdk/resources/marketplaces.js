'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Marketplaces() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Marketplaces, ArctickClient);


//Arctick.WebApi.v2.Common.marketplace-info
Marketplaces.prototype.getMarketplaceInfo = function (options, callback) {
    var self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/marketplaces/',
            params: {
                includes: options != null ? options.includes : ''
            }
        }, callback);
    });
};

Marketplaces.prototype.getMarketplaceRegistration = function (options, callback) {
    this._makeRequest({
        method: 'GET',
        path: '/api/v2/users/invited-users/' + options.token
    }, callback);
};

Marketplaces.prototype.getSubAccountRegistration = function (options, callback) {
    const token = options.token;

    this._makeRequest({
        method: 'GET',
        path: '/api/v2/users/invited-sub-accounts/' + token
    }, callback);
};

module.exports = Marketplaces;