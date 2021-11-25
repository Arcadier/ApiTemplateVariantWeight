'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    history: [],
    keyword: '',
    selectedOrders: [],
    selectedOrderStatus: '',
    selectedFulfillmentStatuses: [],
    selectedSuppliers: "",
    selectedDeliveryTypeName: '',
    isShowChangeStatus: false,
    isShowSuccessMessage: false,
    detail: {}
};

function orderReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.FETCH_ORDERS: {
            return Object.assign({}, state, {
                history: action.history,
                keyword: action.keyword,
                selectedOrders: [],
                selectedOrderStatus: ''
            })
        }
        case actionTypes.GO_TO_PAGE: {
            return Object.assign({}, state, {
                history: action.history,
                selectedOrders: [],
                selectedOrderStatus: ''
            })
        }
        case actionTypes.SELECT_UNSELECT_ORDER: {
            return Object.assign({}, state, {
                selectedOrders: action.selectedOrders,
            })
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

        case actionTypes.UPDATE_HISTORY_ORDERS: {
            return Object.assign({}, state, {
                history: action.history,
                selectedFulfillmentStatuses: action.selectedFulfillmentStatuses,
                selectedOrderStatus: action.selectedOrderStatus,
                selectedDeliveryTypeName: action.selectedDeliveryTypeName,
                isShowChangeStatus: action.isShowChangeStatus,
                isShowSuccessMessage: action.isShowSuccessMessage
            })
        }
        case actionTypes.SHOW_HIDE_CHANGE_STATUS: {
            return Object.assign({}, state, {
                selectedFulfillmentStatuses: action.selectedFulfillmentStatuses,
                selectedOrderStatus: action.selectedOrderStatus,
                selectedDeliveryTypeName: action.selectedDeliveryTypeName,
                isShowChangeStatus: action.isShowChangeStatus,
                isShowSuccessMessage: action.isShowSuccessMessage
            })
        }
        case actionTypes.SHOW_HIDE_SUCCESS_MESSAGE: {
            return Object.assign({}, state, {
                isShowSuccessMessage: action.isShowSuccessMessage
            })
        }
        case actionTypes.UPDATE_DETAIL_ORDER: {
            return Object.assign({}, state, {
                detail: action.detail,
                isShowSuccessMessage: action.isShowSuccessMessage
            })
        }
        case actionTypes.REVERT_ORDER_PAYMENT: {
            return Object.assign({}, state, {
                detail: action.detail
            })
        }
        case actionTypes.UPDATE_BOOKING_SLOT: {
            return Object.assign({}, state, {
                detail: action.detail,
                isShowSuccessMessage: action.isShowSuccessMessage
            })
        }
        case actionTypes.UPDATE_DETAIL_ORDER_PAYMENT_STATUS: {
            let { detail } = state;
            let order = detail.Orders[0];
            order.PaymentStatus = action.paymentStatus;
            return {
                ...state,
                detail
            }
        }
        default:
            return state
    }
};
 
module.exports = {
    orderReducer: orderReducer
}