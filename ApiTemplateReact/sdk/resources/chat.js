'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Chat() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Chat, ArctickClient);

Chat.prototype.generateToken = function (userId, device, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/chat-token/' + device,
            data: {}
        }, callback);
    });
};

Chat.prototype.getMessages = function (userId, channelId, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/channels/' + channelId,
            params: {
                orderDirection: 'asc',
                includes: ['User', 'CartItemDetail', 'ItemDetail', 'Offer', 'AccountOwnerID']
            }
        }, callback);
    });
};

Chat.prototype.sendOffer = function (userId, postData, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/offer',
            data: postData
        }, callback);
    });
};

Chat.prototype.declineOffer = function (userId, postData, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userId + '/offer',
            data: postData
        }, callback);
    });
};

Chat.prototype.getUserChannels = function (userId, options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/channels/',
            params: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                keyword:'',
                includes: options.includes
            }
        }, callback);
    });
};

Chat.prototype.createChannel = function (userId, postData, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/channels/',
            params: {
                recipientId: postData.recipientId,
                itemId: postData.itemId,
                cartItemId: postData.cartItemId
            }
        }, callback);
    });
};

Chat.prototype.acceptOffer = function (userId, postData, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userId + '/offer',
            data: postData
        }, callback);
    });
};

Chat.prototype.getOfferByCartItemId = function (options, callback) {
    const self = this;
    const { userId, cartItemId, isAccepted = null, isDeclined = null, includes = null } = options;
    // get pending offer by default
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/offer',
            params: {
                cartItemId,
                isAccepted,
                isDeclined,
                includes
            }
        }, callback);
    });
};

Chat.prototype.updateMemberLastSeenMessage = function (userId, postData, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userId + '/messages',
            params: {
                memberId: postData.memberId,
                messageId: postData.messageId
            }
        }, callback);
    });
};

Chat.prototype.addChannelMember = function (userId, postData, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/channels/' + postData.channelId + '/members'
        }, callback);
    });
};

Chat.prototype.createChannelMessage = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + options.userId + '/channels/' + options.channelId,
            data: {
                Message: options.message
            }
        }, callback);
    });
};

Chat.prototype.updateChannelMessage = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + options.userId + '/channels/' + options.channelId + '/messages/' + options.messageId,
            params: {
                message: options.message
            }
        }, callback);
    });
};

module.exports = Chat;
