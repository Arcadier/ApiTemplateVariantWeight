'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    buyerAddress: null,
    invoiceDetails: null,
    orderDetails: null, //for b2b
    paymentMethods: [],
    departments: null,
    workflows: null,
    showCreateRequisition: false,
    isSameBillingAndDelivery: false,
    pendingOffer: null,
    processing: false,
};

function checkoutReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.UPDATE_CHECKOUT_SELECTED_PAYMENT_METHOD: {
            return Object.assign({}, state, {
                paymentMethods: action.paymentMethods
            })
        }

        case actionTypes.UPDATE_INVOICE_DETAILS: {
            let result =  Object.assign({}, state, {
                invoiceDetails: action.invoiceDetails
            })
            return result;
        }

        case actionTypes.UPDATE_ORDER_DETAILS: {
            return Object.assign({}, state, {
                orderDetails: action.orderDetails
            })
        }

        case actionTypes.UPDATE_SELECTED_BUYER_ADDRESS: {
            return Object.assign({}, state, {
                buyerAddress: action.buyerAddress
            })
        }

        case actionTypes.UPDATE_PAYMENT_PROCEED: {
            return Object.assign({}, state, {
                buyerAddress: action.buyerAddress
            })
        }

        case actionTypes.INVALID_CHECKOUT: {
            return Object.assign({}, state, {
                invalidCheckout: action.invalidCheckout
            })
        }

        case actionTypes.UPDATE_IS_SAME_BILLING_AND_DELIVERY_ADDRESS: {
            return Object.assign({}, state, {
                isSameBillingAndDelivery: action.isSameBillingAndDelivery
            })
        }
        
        case actionTypes.PROCESSING: {
            return Object.assign({}, state, {
                processing: action.processing
            })
        }

        default:
            return state;
    }
}

module.exports = {
    checkoutReducer: checkoutReducer
};