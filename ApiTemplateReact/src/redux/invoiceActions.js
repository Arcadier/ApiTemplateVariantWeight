'use strict';
var actionTypes = require('./actionTypes');
var toastr = require('toastr');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function createInvoice(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/merchants/invoice/create',
            type: 'POST',
            data: options,
            success: function (result) {               
                callback(result);
                return dispatch({ type: '' });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function filterInvoices(filters) {
    return function (dispatch, getState) {
        const { isUserMerchant = false } = getState().invoiceReducer;

        $.ajax({
            url: `${isUserMerchant ? '/merchants' : ''}/invoice/filter`,
            type: 'GET',
            data: filters,
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_INVOICES,
                    payload: result.invoiceList
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, jqXHR);
            }
        })
    }
};

function updateInvoiceStatus(invoiceNo, status) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/merchants/invoice/update-invoice-status',
            type: 'PUT',
            data: {
                invoiceNo,
                status
            },
            success: function (result) {
                if (result && result.success) {
                    toastr.success("Status Changed");
                    let invoice = {};
                    const state = getState().invoiceReducer;
                    if (state.invoiceDetail && state.invoiceDetail.Orders) {
                        invoice = { ...state.invoiceDetail };
                        if (invoice.Orders[0] && invoice.Orders[0].PaymentDetails && invoice.Orders[0].PaymentDetails.length > 0) {
                            const index = invoice.Orders[0].PaymentDetails.findIndex(p => p.InvoiceNo == invoiceNo);
                            if (index >= 0) {
                                invoice.Orders[0].PaymentDetails[index].Status = status;
                            }
                        }
                        return dispatch({
                            type: actionTypes.UPDATE_INVOICE_STATUS,
                            payload: { invoiceDetail: invoice }
                        });
                    }

                }
                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, jqXHR);
            }
        })
    }
}

function processPayment(options, callback) {
    return function (dispatch, getState) {
        const { InvoiceNo } = getState().invoiceReducer.invoiceDetail;

        $.ajax({
            url: '/invoice/process-payment',
            type: 'POST',
            data: Object.assign(options, {
                invoiceNo: InvoiceNo
            }),
            success: function (result) {
                callback(result);
                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, jqXHR);
            }
        });
    }
}

module.exports = {
    createInvoice: createInvoice,
    filterInvoices: filterInvoices,
    updateInvoiceStatus: updateInvoiceStatus,
    processPayment: processPayment
}