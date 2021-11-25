'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Inbox() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Inbox, ArctickClient);

Inbox.prototype.getUserMessages = function (options, callback) {
    var self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + options.userId + '/channels',
            params: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                keyword: options.keyword,
                includes: 'CartItemDetail,ItemDetail,User'
            }
        }, callback)
    });
}

Inbox.prototype.getChannels = function (options, callback) {
    var self = this;

    const userId = options.userId;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const includes = options.includes;

    let params = {
        pageSize: pageSize,
        pageNumber: pageNumber
    };

    if (includes) {
        params.includes = includes;
    }

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/channels',
            params: params
        }, callback)
    })
}

Inbox.prototype.getChannelMessages = function (options, callback) {
    var self = this;

    const userId = options.userId;
    const channelId = options.channelId;
    const limit = options.limit;
    const orderDirection = options.orderDirection;
    const includes = options.includes;

    let params = {
        limit: limit,
        orderDirection: orderDirection
    };

    if (includes) {
        params.includes = includes;
    }

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/channels/' + channelId,
            params: params
        }, callback)
    })
}

module.exports = Inbox;