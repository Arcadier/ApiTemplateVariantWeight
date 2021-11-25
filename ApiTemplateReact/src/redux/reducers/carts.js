'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    cartList: [],
    cartPageModel: [],
    processing: false,

};

function cartReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_USER_CARTS: {
            return Object.assign({}, state, {
                cartList: action.cartList,
            });
        }

        case actionTypes.GET_CART_STATES: {
            return Object.assign({}, state, {
                cartPageModel: action.cartPageModel
            });
        }

        case actionTypes.PROCESSING: {
            return Object.assign({}, state, {
                processing: action.processing
            })
        }
       
        default:
            return state
    }
};

module.exports = {
    cartReducer: cartReducer
}