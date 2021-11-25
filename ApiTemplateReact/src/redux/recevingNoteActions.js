'use strict';

var actionTypes = require('./actionTypes');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function getAlreadyReceivedQuantity(receivingNotes, cartItemId) {
    let receivedQuantity = 0;

    if (receivingNotes && receivingNotes.length > 0) {
        receivingNotes.forEach((note) => {
            note.ReceivingNoteDetails.forEach((detail) => {
                if (detail.CartItemID == cartItemId) {
                    receivedQuantity += parseInt(detail.Quantity);
                }
            });
        });
    }

    return receivedQuantity;
}

function getRemainingQuantity(orderDetail, cartItemId) {
    const { ReceivingNotes } = orderDetail;

    if (orderDetail && orderDetail.CartItemDetails) {
        const cartItem = orderDetail.CartItemDetails.find(c => c.ID == cartItemId);

        if (cartItem) {
            return parseInt(cartItem.Quantity) - getAlreadyReceivedQuantity(ReceivingNotes, cartItem.ID);
        }
    }

    return 0;
}

function filterReceivingNotes(options, callback) {
    return function (dispatch, getState) {
        const filters = getState().receivingNoteReducer.filters;

        $.ajax({
            url: '/receiving-note/filter',
            type: 'GET',
            data: Object.assign({}, filters, options),
            success: function (result) {
                if (typeof callback != 'undefined') callback(result);

                return dispatch({
                    type: actionTypes.GET_RECEIVING_NOTES,
                    receivingNotes: result.receivingNotes,
                    suppliers: result.suppliers,
                    orders: result.orders,
                    filters: result.filters
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function createReceivingNote(options, callback) {
    return function (dispatch, getState) {
        const orderDetail = getState().receivingNoteReducer.orderDetail;
        const { ReceivingNotes } = orderDetail;

        let isValid = true;
        if (options.receivingNoteDetails) {
            for (let detail of options.receivingNoteDetails) {
                detail.receivedQuantity = getAlreadyReceivedQuantity(ReceivingNotes, detail.cartItemId);
                detail.remainingQuantity = getRemainingQuantity(orderDetail, detail.cartItemId);
                if (detail.quantity > detail.remainingQuantity) {
                    isValid = false;
                    break;
                }
            }
        }

        if (!isValid)
            return dispatch({ type: '' });

        options.orderId = orderDetail.ID;
        options.receivingNoteDetails = JSON.stringify(options.receivingNoteDetails);

        $.ajax({
            url: '/receiving-note/create-receiving-note',
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

function voidReceivingNote(receivingNoteId, callback) {
    return function (dispatch, getState) {
        const { orderDetail, receivingNoteDetails} = getState().receivingNoteReducer;
        const updateRequestNoteDetails = [];
        if (orderDetail && orderDetail.CartItemDetails && orderDetail.CartItemDetails.length > 0) {
            orderDetail.CartItemDetails.map(cartItem => {
                updateRequestNoteDetails.push({
                    cartItemId: cartItem.ID,
                    remainingQuantity: getRemainingQuantity(orderDetail, cartItem.ID),
                    receivedQuantity: getAlreadyReceivedQuantity(orderDetail.ReceivingNotes, cartItem.ID), 
                });
            })
        }

        $.ajax({
            url: '/receiving-note/void-receiving-note',
            type: 'PUT',
            data: { 
                ...receivingNoteDetails,
                ReceivingNoteDetails: JSON.stringify(receivingNoteDetails.ReceivingNoteDetails),
                Request: JSON.stringify(updateRequestNoteDetails)
            },
            success: function (result) {

                if (typeof callback == 'function') callback(result);
                if (result.success) {
                    return dispatch({
                        type: actionTypes.UPDATE_RECEIVING_NOTE,
                        receivingNoteDetails: result.receivingNoteDetails,
                        orderDetail: result.orderDetail,
                    })
                }
                return dispatch({ type: '' });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

module.exports = {
    createReceivingNote: createReceivingNote,
    filterReceivingNotes: filterReceivingNotes,
    voidReceivingNote: voidReceivingNote,
}