'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    user: null,
    addresses: [],
    shippingOptions: [],
    pickupOptions: [],
    invoiceDetails: null,
    orderDetails: null,
    orderSelectedDelivery: new Map(),
    customFieldDefinition: [],
    paymentGateways: [],
    paymentAcceptanceMethod: [],
    paypalLoginUrl: '',
    stripeLoginUrl: '',
    paymentTerms: [],
    addressIDToDelete: null,
    billingAddresses: [],
    addressPermissions: {
        isAuthorizedToView: false,
        isAuthorizedToAdd: false,
        isAuthorizedToDelete: false,
    }
};

function settingsReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.CLEAR_ADD_ADDRESS_MODAL: {
            return Object.assign({}, state, {
                addressModelAdd: null
            });
        }
        case actionTypes.CREATE_ADDRESS: {
            var addresses = state.addresses.concat(action.address);
            return Object.assign({}, state, {
                addresses: addresses
            });
        }
        case actionTypes.DELETE_ADDRESS: {
            return Object.assign({}, state, {
                addresses: state.addresses.filter(d => d.ID != action.addresses.ID)
            });
        }
        case actionTypes.UPDATE_USER_INFO: {
            return Object.assign({}, state, {
                user: action.user
            });
        }
        case actionTypes.CREATE_USER_CUSTOM_FIELD: {
            return Object.assign({}, state, {
                customFieldDefinition: [...state.customFieldDefinition, action.CustomFields]
            });
        }
        case actionTypes.GET_PAYMENT_ACCEPTANCE_METHOD: {
            return Object.assign({}, state, {
                paymentAcceptanceMethod: action.reports.Records
            });
        }
            
        // CheckOut Review
        case actionTypes.CHECKOUT_REVIEW_CHANGE_DELIVERY: {
            return Object.assign({}, state, {
                shippingOptions: action.shippingOptions,
                pickupOptions: action.pickupOptions
            });
        }
        // bespoke api checkout review
        case actionTypes.CHECKOUT_REVIEW_UPDATE_DELIVERY_MAP: {
            return Object.assign({}, state, {
                orderSelectedDelivery: action.orderDelMap
            });
        }
        case actionTypes.ADD_PAYMENT_TERM:
        case actionTypes.SET_PAYMENT_TERM_TO_DELETE:
        case actionTypes.DELETE_PAYMENT_TERM:
        case actionTypes.UPDATE_PAYMENT_TERM: {
            return Object.assign({}, state, {
                paymentTerms: action.paymentTerms
            });
        }

        //ONE PAGE CHECKOUT
        case actionTypes.UPDATE_SELECTED_ADDRESS: {
            return Object.assign({}, state, {
                addresses: action.addresses,
                shippingOptions: action.shippingOptions
            });
        }
        case actionTypes.UPDATE_SELECTED_BILLING_ADDRESS: {
            return Object.assign({}, state, {
                billingAddresses: action.billingAddresses
            });
        }
        case actionTypes.UPDATE_ADD_ADDRESS: {
            return Object.assign({}, state, {
                addressModelAdd: action.addressModelAdd
            });
        }
        case actionTypes.UPDATE_DELETE_ADDRESS: {
            return Object.assign({}, state, {
                addressIDToDelete: action.addressIDToDelete
            });
        }
        case actionTypes.CREATE_BILLING_ADDRESS: {
            var billingAddresses = state.billingAddresses.concat(action.address);
            return Object.assign({}, state, {
                billingAddresses: billingAddresses
            });
        }
        case actionTypes.DELETE_CHECKOUT_ADDRESSES: {
            return Object.assign({}, state, {
                addresses: action.addresses,
                billingAddresses: action.billingAddresses
            });
        }

        default:
            return state;
    }
}

module.exports = {
    settingsReducer: settingsReducer
};
