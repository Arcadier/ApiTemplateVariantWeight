'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}


function deleteShippingOptions(merchantID, shippingmethodID, callback) {
    return function (dispatch) {
        $.ajax({
            url: "/delivery/settings/deleteShippingOptions",
            type: "POST",
            data: {
                merchantID: merchantID,
                shippingmethodID: shippingmethodID
            },
            success: function (shipping) {

                return dispatch({
                    type: actionTypes.DELETE_SHIPPING_METHOD,
                    shipping: shipping
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createShippingOptions(merchantID, shippingmethodObject, callback) {
    return function (dispatch) {
        $.ajax({
            url: "/delivery/settings/createShippingOptions",
            type: "POST",
            data: {
                merchantID: merchantID,
                shippingmethodObject: JSON.stringify(shippingmethodObject)
            },
            success: function (shipping) {
                var n = dispatch({
                    type: actionTypes.CREATE_SHIPPING_METHOD,
                    shipping: shipping
                });

                callback();

                return n;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateShippingOptions(merchantID, shippingmethodObject, callback) {
    return function (dispatch) {
        $.ajax({
            url: "/delivery/settings/updateShippingOptions",
            type: "POST",
            data: {
                merchantID: merchantID,
                shippingmethodObject: JSON.stringify(shippingmethodObject)
            },
            success: function (shipping) {
                callback();

                return dispatch({
                    type: actionTypes.UPDATE_SHIPPING_METHOD,
                    shipping: shipping
                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}


module.exports = {
    deleteShippingOptions: deleteShippingOptions,
    updateShippingOptions: updateShippingOptions,
    createShippingOptions: createShippingOptions
}