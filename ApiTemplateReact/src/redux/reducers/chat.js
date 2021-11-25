'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    channel: null,
    channelId: null,
    chatDetail: null,
    offer: null,
    isItemDisabled: false,
    invoiceNo: null,
    paymentTerms: null, // for quotation
    availability: null, // for quotation
};

function chatReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.SEND_OFFER: {
            return Object.assign({}, state, {
                offer: action.offer
            });
        }
        case actionTypes.UPDATE_OFFER: {
            return Object.assign({}, state, {
                offer: action.offer
            });
        }
        case actionTypes.ADD_CHANNEL_MEMBER: {
            return Object.assign({}, state, {
                chatDetail: action.chatDetail
            });
        }
        case actionTypes.UPDATE_BOOKING_SLOT: {
            var result =  Object.assign({}, state, {
                chatDetail: {
                    Channel: {
                        ...state.chatDetail.Channel,
                        CartItemDetail: {
                            ...state.chatDetail.Channel.CartItemDetail,
                            SubTotal: action.cartItem.SubTotal,
                            Quantity: action.cartItem.Quantity,
                            AddOns: action.cartItem.AddOns,
                            BookingSlot: action.cartItem.BookingSlot,
                        }
                    }
                }
            });

            return result;
        }
        default:
            return state;
    }
};

module.exports = {
    chatReducer: chatReducer
}