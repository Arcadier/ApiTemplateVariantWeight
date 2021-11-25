'use strict';
const actionTypes = require('../actionTypes');

const initialState = {
    orderDetail: null,
    receivingNoteDetails: null,
    receivingNotes: null,
    suppliers: null,
    orders: null,
    filters: null
};

function recevingNoteReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_RECEIVING_NOTES: {
            return Object.assign({}, state, {
                receivingNotes: action.receivingNotes,
                suppliers: action.suppliers,
                orders: action.orders,
                filters: action.filters,
            });
        }
        case actionTypes.UPDATE_RECEIVING_NOTE: {
            return Object.assign({}, state, {
                receivingNoteDetails: action.receivingNoteDetails,
                orderDetail: action.orderDetail,
            });
        }
        default:
            return state;
    }
};

module.exports = {
    recevingNoteReducer: recevingNoteReducer
}