'use strict';
var actionTypes = require('./actionTypes');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function filterQuotations(filters) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().quotationReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/quotation/filter`,
            type: 'GET',
            data: filters,
            success: function (result) {               
                return dispatch({
                    type: actionTypes.GET_QUOTATIONS,
                    quotationList: result,
                    filters: filters
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function goToPage(pageNumber) {
    return function (dispatch, getState) {
        const { isMerchantAccess, filters } = getState().quotationReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/quotation/paging`,
            type: "GET",
            data: Object.assign({ "pageNumber": pageNumber }, filters),
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_QUOTATIONS,
                    quotationList: result,
                    filters: filters
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function cancelQuotation(callback) {
    
    return function (dispatch, getState) {
        const quotation = getState().quotationReducer.quotationDetail;
        const { isMerchantAccess } = getState().quotationReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $(".btn-loader-cancel").addClass('btn-loading');
        $.ajax({
            url: `${extraPath}/quotation/cancel-quotation`,
            type: 'POST',
            data: {
                quotationId: quotation.ID,
                channelId: quotation.ChannelID,
                quotationMessage: quotation.Message
            },
            success: function (errorMessage) {
                callback(errorMessage);

                return dispatch({ type: '' });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                $(".btn-loader-cancel").removeClass('btn-loading');
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function declineQuotation(callback) {
    return function (dispatch, getState) {
        const quotation = getState().quotationReducer.quotationDetail;
        const { isMerchantAccess } = getState().quotationReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $(".btn-loader-cancel").addClass('btn-loading');
        $.ajax({
            url: `${extraPath}/quotation/decline-accept-quotation`,
            type: 'POST',
            data: {
                quotationId: quotation.ID,
                channelId: quotation.ChannelID,
                isAccepted: false,
                isDeclined: true
            },
            success: function (errorMessage) {                
                callback(errorMessage);
                return dispatch({ type: '' });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                $(".btn-loader-cancel").removeClass('btn-loading');
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function generateInvoiceByCartItem(cartItemIDs, callback) {
    return function (dispatch, getState) {
        const isRequisition = process.env.CHECKOUT_FLOW_TYPE == 'b2b';
        const userID = getState().userReducer.user.ID;
        const quotationReducer = getState().quotationReducer;
        const quotationDetail = quotationReducer ? quotationReducer.quotationDetail : null;
        
        if (isRequisition)
            return dispatch({ type: '' });

        const defaultPaymentTerms = [];
        if (quotationDetail && quotationDetail.PaymentTerm) {
            defaultPaymentTerms.push({
                merchantId: quotationDetail.PaymentTerm.UserID,
                paymentTermId: quotationDetail.PaymentTerm.ID
            });
        }
        $(".btn-loader").addClass('btn-loading');
        $.ajax({
            url: "/cart/generateInvoiceByCartIDs",
            type: "POST",
            data: {
                userId: userID,
                cartId: cartItemIDs,
                defaultPaymentTerms: JSON.stringify(defaultPaymentTerms),
            },
            success: function (data) {
                if (data && data.InvoiceNo) {
                    callback(data.InvoiceNo);
                } else {
                    callback(null);
                }
                return dispatch({ type: '' });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function generateOrderByCartItem(cartItemIDs, callback) {
    return function (dispatch, getState) {
        const isRequisition = process.env.CHECKOUT_FLOW_TYPE == 'b2b';
        const userID = getState().userReducer.user.ID;     
        const quotationDetail = getState().quotationReducer.quotationDetail;

        const defaultPaymentTerms = [];
        if (quotationDetail && quotationDetail.PaymentTerm) {
            defaultPaymentTerms.push({
                merchantId: quotationDetail.PaymentTerm.UserID,
                paymentTermId: quotationDetail.PaymentTerm.ID
            });
        }
        
        if (!isRequisition)
            return dispatch({ type: '' });

        $(".btn-loader").addClass('btn-loading');
        $.ajax({
            url: "/cart/generateOrderByCartIDs",
            type: "POST",
            data: {
                userId: userID,
                cartId: cartItemIDs,
                defaultPaymentTerms: JSON.stringify(defaultPaymentTerms),
            },
            success: function (data) {
                if (data.length > 0) {
                    callback(data[0].ID);
                }

                return dispatch({ type: '' });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $(".btn-loader").removeClass('btn-loading');
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    filterQuotations: filterQuotations,
    goToPage: goToPage,
    cancelQuotation: cancelQuotation,
    declineQuotation: declineQuotation,
    generateInvoiceByCartItem: generateInvoiceByCartItem,
    generateOrderByCartItem: generateOrderByCartItem
}