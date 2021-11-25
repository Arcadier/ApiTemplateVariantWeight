'use strict';
var actionTypes = require('./actionTypes');

if (typeof window !== 'undefined') {
    var $ = window.$;
}


function editCartItemBookingSlot(cart, callback) {
    return function (dispatch, getSttate) {

        $.ajax({
            url: '/chat/edit-cart-item-booking-slot',
            type: 'POST',
            data: cart,
            success: function (cartItem) {


                var result = dispatch({
                    type: actionTypes.UPDATE_BOOKING_SLOT,
                    cartItem: cartItem
                });

                callback(cartItem);
                return result
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                callback();
            }
        });
    }
}


function createCart(cart, callback) {
    return function (dispatch, getSttate) {

        $.ajax({
            url: '/chat/create-cart',
            type: 'POST',
            data: cart,
            success: function (cartItem) {

                var result = dispatch({
                    type: "",
                    cartItem: cartItem
                });

                callback(cartItem);
                return result
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                callback();
            }
        });
    }
}

function sendOffer(offer, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/send-offer',
            type: 'POST',
            data: offer,
            success: function (offer) {
                callback(offer);

                return dispatch({
                    type: actionTypes.SEND_OFFER,
                    offer: offer
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                callback();
            }
        });
    };
}

function declineOffer(offer, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/decline-offer',
            type: 'PUT',
            data: offer,
            success: function (result) {
                let chatDetail = getState().chatReducer.chatDetail;
                chatDetail.Channel.Offer = null;
                callback('<p><span class=\"offer-declined\">Offer has been declined!</span></p>');
                return dispatch({
                    type: actionTypes.UPDATE_OFFER,
                    chatDetail: chatDetail
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getUserChannels(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/get-channels',
            type: 'GET',
            data: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                includes: options.includes
            },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.GET_CHANNELS
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createChannel(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/create-channel',
            type: 'POST',
            data: {
                recipientId: options.recipientId,
                itemId: options.itemId,
                quantity: options.quantity,
                createCartItem: options.createCartItem,
                serviceBookingUnitGuid: options.serviceBookingUnitGuid || null,
                bookingSlot: options.bookingSlot ? JSON.stringify(options.bookingSlot) : null,
                addOns: options.addOns ? JSON.stringify(options.addOns) : null
            },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.CREATE_CHAT_CHANNEL
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getRecipientAddresses(userId, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/get-recipient-addresses',
            type: 'GET',
            data: {
                recipientId: userId
            },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.GET_ADDRESS
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getOfferByCartItemId(cartItemId, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/get-offer',
            type: 'GET',
            data: { cartItemId: cartItemId },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.GET_OFFER
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getChatDetails(channelId, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/get-chat-details',
            type: 'GET',
            data: { channelId: channelId },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: ''
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function acceptOffer(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/accept-offer',
            type: 'PUT',
            data: options,
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.UPDATE_OFFER
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateMemberLastSeenMessage(memberId, messageId) {
    return function (dispatch, getState) {

        

        $.ajax({
            url: '/chat/update-member-last-seen-message',
            type: 'PUT',
            data: {
                memberId: memberId,
                messageId: messageId
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.SEND_EMAIL
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function addMember(channelId, callback) {
    return function (dispatch, getState) {
        let chatDetail = Object.assign({}, getState().chatReducer.chatDetail);

        $.ajax({
            url: '/chat/add-channel-member',
            type: 'POST',
            data: {
                channelId: channelId
            },
            success: function (result) {
                callback();

                let channelMembers = chatDetail.Channel.Members;
                if (channelMembers) {
                    channelMembers.push(result);
                }

                return dispatch({
                    type: actionTypes.ADD_CHANNEL_MEMBER,
                    chatDetail: chatDetail
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function sendChatMessage(message, callback) {
    return function (dispatch, getState) {
        const options = {
            channelId: getState().chatReducer.channelId,
            message: message
        };

        $.ajax({
            url: '/chat/send-message',
            type: 'POST',
            data: options,
            success: function (chatMessage) {
                callback(chatMessage);

                return dispatch({
                    type: actionTypes.SEND_CHAT_MESSAGE
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    sendOffer: sendOffer,
    declineOffer: declineOffer,
    getUserChannels: getUserChannels,
    createChannel: createChannel,
    getRecipientAddresses: getRecipientAddresses,
    getOfferByCartItemId: getOfferByCartItemId,
    acceptOffer: acceptOffer,
    updateMemberLastSeenMessage: updateMemberLastSeenMessage,
    getChatDetails: getChatDetails,
    addMember: addMember,
    sendChatMessage: sendChatMessage,
    editCartItemBookingSlot: editCartItemBookingSlot,
    createCart: createCart
}