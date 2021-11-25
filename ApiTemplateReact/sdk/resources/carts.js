'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Carts() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Carts, ArctickClient);

Carts.prototype.addCart = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const quantity = options.quantity;
    const discount = options.discount;
    const itemId = options.itemId;
    const force = options.force;
    const forComparison = options.forComparison;
    const bookingSlot = options.bookingSlot || null;
    const serviceBookingUnitGuid = options.serviceBookingUnitGuid || null;
    const addOns = options.addOns || null;    

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/carts?force=' + force + '&forComparison=' + forComparison,
            data: {
                ID: null,
                Quantity: quantity,
                DiscountAmount: discount,
                BookingSlot: bookingSlot,
                ServiceBookingUnitGuid: serviceBookingUnitGuid,
                AddOns: addOns,
                ItemDetail: {
                    ID: itemId
                }
            }
        }, callback);
    });
};

Carts.prototype.editCart = function(options, callback) {
    const self = this;

    const itemID = options.itemID;
    const userID = options.userID;
    const cartID = options.cartID;
    const quantity = options.quantity || null;
    const discount = options.discount || null;
    const cartItemType = options.cartItemType || null;
    const shippingMethodId = options.shippingMethodId || null;
    const pickupAddressId = options.pickupAddressId || null;
    const forComparison = options.forComparison || false;
    const bookingSlot = options.bookingSlot || null;
    const subTotal = options.subTotal || null;
    const addOns = options.addOns || null;
    const notes = options.notes || null;
    const updateCartAsPending = options.updateCartAsPending || false;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userID + '/carts/' + cartID + "?forComparison=" + forComparison + '&updateCartAsPending=' + updateCartAsPending,
            data: {
                DiscountAmount: discount,
                CartItemType: cartItemType,
                BookingSlot: bookingSlot,
                ShippingMethod: {
                    ID: shippingMethodId
                },
                PickupAddress: {
                    ID: pickupAddressId
                },
                ItemDetail: {
                    ID: itemID
                },
                Addons: addOns,
                SubTotal: subTotal,
                Quantity: quantity,
                Notes: notes
            }
        }, callback);
    });
};

Carts.prototype.deleteCartItem = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'DELETE',
            path: `/api/v2/users/${options.userId}/carts/${options.cartId}`
        }, callback);
    });
}


Carts.prototype.getCarts = function(options, callback) {
    const self = this;
    const { userId, pageSize, pageNumber, includes } = options;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: `/api/v2/users/${userId}/carts`,
            params: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                includes: options.includes
            }
        }, callback);
    });
}

Carts.prototype.addCartFeedback = function(options, callback) {
    const self = this;
    const { userId, cartId, ItemRating, Message } = options;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: `/api/v2/users/${userId}/carts/${cartId}/feedback`,
            data: {
                ItemRating,
                Message
            }
        }, callback);
    });
}

Carts.prototype.getCartFeedback = function(options, callback) {
    const self = this;
    const { userId, cartId } = options;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: `/api/v2/users/${userId}/carts/${cartId}/feedback`
        }, callback);
    });
}

module.exports = Carts;
