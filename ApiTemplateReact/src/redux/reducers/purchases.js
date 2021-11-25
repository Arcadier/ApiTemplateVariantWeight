'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    history: [],
    keyword: '',
    detail: {},
    shippingMethod: null,
    selectedCartItemStatus: '',
};

function purchaseReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.FETCH_PURCHASES: {
            return Object.assign({}, state, {
                history: action.history,
                keyword: action.keyword
            })
        }
        case actionTypes.GO_TO_PAGE: {
            return Object.assign({}, state, {
                history: action.history
            })
        }
        case actionTypes.FETCH_DETAIL: {
            return Object.assign({}, state, {
               detail: action.detail,
            });
        }
        case actionTypes.UPDATE_SELECTED_ORDER_STATUS: {
            return Object.assign({}, state, {
                selectedOrderStatuses: action.selectedOrderStatuses
            })
        }
        case actionTypes.UPDATE_SELECTED_SUPPLIERS: {
            return Object.assign({}, state, {
                selectedSuppliers: action.selectedSuppliers
            })
        }
        case actionTypes.UPDATE_ORDER_STATUS_SELECTED: {
            return Object.assign({}, state, {
                selectedOrderStatus: action.selectedOrderStatus
            })
        }
        case actionTypes.UPDATE_SELECTED_DATES_PO: {
            return Object.assign({}, state, {
                selectedDates: action.selectedDates
            })
        }

        case actionTypes.UPDATE_SELECTED_WORD_PO: {
            return Object.assign({}, state, {
                keyword: action.keyword
            })
        }
        case actionTypes.UPDATE_SELECTED_CART_ITEM_ORDER_STATUS: {
            return Object.assign({}, state, {
                selectedCartItemStatus: action.selectedCartItemStatus
            })
        }
        default:
            return state
    }
};

module.exports = {
    purchaseReducer: purchaseReducer
}