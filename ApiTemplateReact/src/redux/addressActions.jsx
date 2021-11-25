'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function createAddress(newAddress, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/users/address/create',
            type: 'POST',
            data: newAddress,
            success: function (address) {
                var returnValue = dispatch({
                    type: actionTypes.CREATE_ADDRESS,
                    address: address
                });

                if (callback)
                    callback();

                return returnValue;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function deleteAddress(addressId) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/users/address/delete',
            type: 'POST',
            data: {
                addressId: addressId
            },
            success: function (address) {
                let addresses = [];

                if (getState().deliverySettingsReducer) {
                    addresses = getState().deliverySettingsReducer.pickupLocations;
                } else {
                    addresses = getState().settingsReducer.addresses;
                }

                addresses = addresses.filter((item) => {
                    return item.ID === addressId;
                });
                return dispatch({
                    type: actionTypes.DELETE_ADDRESS,
                    addresses: addresses[0]
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateUserToOnboard(isOnboarded, hasRedirection = true) {
    return function (dispatch, getState) {
        if (isOnboarded === true) {
            if (hasRedirection) {
                window.location = "/merchants/dashboard";
            } else {
                window.location = "/";
            }

            return dispatch({ type: '' });
        } else {
            const userAjaxOptions = {
                url: '/users/update',
                type: 'PUT',
                data: JSON.stringify({ Onboarded: true }),
                contentType: 'application/json'
            };
            $.ajax(userAjaxOptions)
                .done(function (data) {
                    if (data) {
                        if (hasRedirection) {
                            window.location = "/merchants/items";
                        } else {
                            window.location = "/";
                        }
                    }

                    return dispatch({ type: '' });
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                });
        }
    }
}

module.exports = {
    createAddress: createAddress,
    deleteAddress: deleteAddress,
    updateUserToOnboard: updateUserToOnboard
};
