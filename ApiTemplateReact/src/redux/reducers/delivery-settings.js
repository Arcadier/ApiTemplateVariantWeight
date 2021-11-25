'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    user: null,
    shippingOptionsMerchant: [],
    shippingOptionsAdmin: [],
    pickupLocations: [],
    manageShippingOptions: null,
    customFieldDefinition: [],
    marketplaceInformation: null
};

function deliverySettingsReducer(state = initialState, action) {

    switch (action.type) {
        //CheckOut Review
        case actionTypes.GET_SHIPPING_OPTIONS_MERCHANT:
        {
            return Object.assign({}, state, {
                shippingOptionsMerchant: action.shipping
            });
        }
        case actionTypes.GET_SHIPPING_OPTIONS_ADMIN:
        {
            return Object.assign({}, state, {
                shippingOptionsAdmin: action.shipping
            });
        }
        case actionTypes.GET_PICKUP_LOCATION:
        {
            return Object.assign({}, state, {
                pickupLocations: action.pickupLocations
            });
        }
        case actionTypes.CREATE_ADDRESS: {
            var addresses = state.pickupLocations.concat(action.address);
            return Object.assign({}, state, {
                pickupLocations: addresses,
            });
        }
        case actionTypes.DELETE_ADDRESS:
        {
            return Object.assign({}, state, {
                pickupLocations: state.pickupLocations.filter(d => d.ID != action.addresses.ID)
            });
        }
        case actionTypes.CREATE_SHIPPING_METHOD: {
            return state;
        }
        case actionTypes.UPDATE_ADDRESS: {
            return state;
        }
        case actionTypes.DELETE_SHIPPING_METHOD:
        {
            return Object.assign({}, state, {
                shippingOptionsMerchant: state.shippingOptionsMerchant.filter(d => d.ID != action.shipping.ID)
            });
        }
        default:
            return state;
    }
};

module.exports = {
    deliverySettingsReducer: deliverySettingsReducer
}