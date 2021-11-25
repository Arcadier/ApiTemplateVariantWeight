'use strict';
const actionTypes = require('../actionTypes');

const initialState = {
    invoiceList: [],
    invoiceDetail: null,
    paymentMethods: []
};

function invoiceReducer(state = initialState, action) {

    switch(action.type) {
        case actionTypes.GET_INVOICES:
            return {
                ...state, 
                invoiceList: action.payload
            };
        case actionTypes.SET_INVOICE_ORDER_STATUS: 
            let invoice = {};
            if (state.invoiceList && state.invoiceList.Records){
                invoice = state.invoiceList.Records.find(item => item.InvoiceNo == action.payload.invoiceNo);
            } else if (state.invoiceDetail) {
                invoice = state.invoiceDetail;
            }
            if (invoice && invoice.Orders) {                
                let order = invoice.Orders.find(order => order.ID == action.payload.orderId);
                if (order) {
                    order.PaymentStatus = action.payload.paymentStatus;
                }
            }
            return {
                ...state
            }
        case actionTypes.UPDATE_INVOICE_STATUS:
            return {
                ...state,
                ...action.payload,
            }
        default: 
            return state;
    }
};

module.exports = {
    invoiceReducer: invoiceReducer
}