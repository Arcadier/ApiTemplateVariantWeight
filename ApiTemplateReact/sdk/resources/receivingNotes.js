'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function ReceivingNotes() {
    ArctickClient.apply(this, arguments);
}

util.inherits(ReceivingNotes, ArctickClient);

ReceivingNotes.prototype.getReceivingNotes = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + options.userId + '/receiving-notes',
            params: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                sort: options.sort,
                keyword: options.keyword,
                startDate: options.startDate,
                endDate: options.endDate,
                merchantIds: options.merchantIds
            }
        }, callback);
    });
}

ReceivingNotes.prototype.createReceivingNote = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + options.userId + '/receiving-notes',
            data: {
                ReceivingNoteNo: options.receivingNoteNo,
                OrderID: options.orderId,
                ReceiveDateTime: options.receiveDateTime,
                ReferenceID: options.referenceId || null,
                ReceivingNoteDetails: options.receivingNoteDetails.map((detail) => {
                    return {
                        CartItemID: detail.cartItemId,
                        Quantity: detail.quantity,
                        ReceivedQuantity: detail.receivedQuantity,
                        RemainingQuantity: detail.remainingQuantity
                    }
                })
            }
        }, callback);
    });
};

ReceivingNotes.prototype.getReceivingNoteById = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + options.userId + '/receiving-notes/' + options.receivingNoteId,
        }, callback);
    });
}

ReceivingNotes.prototype.updateReceivingNote = function(options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + options.userId + '/receiving-notes',
            data: {
                ID: options.receivingNoteId,
                Void: options.Void,
            }
        }, callback);
    });
}

module.exports = ReceivingNotes;