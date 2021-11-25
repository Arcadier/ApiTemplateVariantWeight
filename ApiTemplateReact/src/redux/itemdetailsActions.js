'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var EnumCoreModule = require('../public/js/enum-core');
var CommonModule = require('../public/js/common.js');

function updateSubTotal(quantity, price) {
    let priceValues = {
        subtotal: price * parseFloat(quantity),
        quantity
    };
    return function(dispatch) {
        return dispatch({
            type: actionTypes.UPDATE_ITEMDETAILQUANTITY,
            priceValues,
        });
    }
}

function updateQuantity(quantity, price, bulkDiscounts) {
    const { PRICING_TYPE } = process.env;
    let intQuantity = parseInt(quantity || 0);

    let priceValues = {
        originalPrice: price * intQuantity,
        bulkPrice: price * intQuantity,
        quantity: intQuantity,
        discount: 0
    };

    let breakNow = false;
    return function (dispatch) {
        function inRange(x, min, max) {
            return ((x - min) * (x - max) <= 0);
        }

        if (PRICING_TYPE == 'country_level' && price > 0) {
            if (bulkDiscounts != null) {
                bulkDiscounts.forEach(function (bulk) {
                    if (breakNow == true) {
                        return false;
                    }
                    let bulkComputation = (price * intQuantity) - (intQuantity * bulk.Discount);
                    if (bulk.IsFixed == '0') {
                        bulkComputation = (price * intQuantity) - ((price * intQuantity) * bulk.Discount) / 100;
                    }
                    if (bulk.RangeStart !== undefined) {
                        if (inRange(intQuantity, parseInt(bulk.RangeStart), parseInt(bulk.RangeEnd)) == true) {
                            priceValues = {
                                originalPrice: price * intQuantity,
                                bulkPrice: bulkComputation,
                                quantity: intQuantity,
                                discount: (price * intQuantity) - bulkComputation
                            }
                            breakNow = true;
                        }
                    } else {
                        //OnwardPrice
                        if (bulk.OnwardPrice !== undefined) {
                            if (intQuantity >= parseInt(bulk.OnwardPrice)) {
                                priceValues = {
                                    originalPrice: price * intQuantity,
                                    bulkPrice: bulkComputation,
                                    quantity: intQuantity,
                                    discount: (price * intQuantity) - bulkComputation
                                }
                                breakNow = true;
                            }
                        }
                    }
                })
            }
        }

        return dispatch({
            type: actionTypes.UPDATE_ITEMDETAILQUANTITY,
            priceValues: priceValues
        });
    }
}

function addOrEditCart(cartItemId, quantity, options, successCallback, failedCallback) {
    return function (dispatch, getState) {
        let item = getState().itemsReducer.items;
        const itemId = options.itemId;
        const selectedQuantity = options.selectedQuantity || 0;
        const discount = options.discount || 0;
        const force = options.force;
        const isComparisonOnly = options.isComparisonOnly;
        const serviceBookingUnitGuid = options.serviceBookingUnitGuid || null;
        const bookingSlot = options.bookingSlot;
        const addOns = options.addOns;

        $.ajax({
            url: '/items/getItemDetails',
            type: 'GET',
            data: {
                itemId: item.ID
            },
            success: function (result) {
                item.IsVisibleToCustomer = result.IsVisibleToCustomer;
                item.IsAvailable = result.IsAvailable;
                item.Active = result.Active;

                if (item.IsVisibleToCustomer && item.IsAvailable && item.Active) {
                    let url = '/items/addCart';
                    let method = 'POST';

                    if (cartItemId) {
                        url = '/items/editCart';
                        method = 'PUT';
                    }
                    let guestUserID = "";
                    if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                        guestUserID = CommonModule.getCookie("guestUserID");
                    }

                    $.ajax({
                        url: url,
                        type: method,
                        data: {
                            cartItemId: cartItemId,
                            quantity: quantity,
                            discount: discount,
                            itemId: itemId,
                            force: force,
                            forComparison: isComparisonOnly,
                            guestUserID: guestUserID,                            
                            serviceBookingUnitGuid: serviceBookingUnitGuid,
                            bookingSlot: bookingSlot ? JSON.stringify(bookingSlot) : null,
                            addOns: addOns ? JSON.stringify(addOns) : null,
                        },
                        success: function (result) {
                            if (result.ID == null && result.Code && !options.isComparisonOnly) {
                                if (result.Code == 'INSUFFICIENT_STOCK') {
                                    if (typeof failedCallback === 'function') {
                                        failedCallback(EnumCoreModule.GetToastStr().Error.INSUFFICIENT_STOCK);
                                    }
                                } else if (result.Code == 'INVALID_SERVICE_BOOKING') {
                                    if (typeof failedCallback === 'function') {
                                        failedCallback(EnumCoreModule.GetToastStr().Error.INVALID_SERVICE_BOOKING);
                                    }
                                }
                                return dispatch({
                                    type: '',
                                });
                            }
                            if (result.AccessToken && result.AccessToken.UserId) {
                                CommonModule.createCookie("guestUserID", result.AccessToken.UserId, 1);
                            }
                            if (item.HasChildItems && item.ChildItems) {
                                item.ChildItems.forEach(function (child) {
                                    if (child.ID === itemId) {
                                        if (child.StockLimited === true && !isComparisonOnly) {
                                            //ARC9590
                                            child.StockQuantity = parseInt(child.StockQuantity) - parseInt(selectedQuantity);
                                        }
                                    }
                                });
                            } else {
                                if (!isComparisonOnly) {
                                    item.StockQuantity = parseInt(item.StockQuantity) - parseInt(selectedQuantity);
                                }
                            }

                            if (typeof successCallback === 'function') {
                                successCallback(result);
                            }

                            return dispatch({
                                type: actionTypes.ADD_EDIT_CART,
                                items: Object.assign({}, item)
                            });
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });
                } else {
                    if (typeof failedCallback === 'function') {
                        let errObj = EnumCoreModule.GetToastStr().Error.ITEM_VISIBILITY_DISABLED_BY_ADMIN_OR_MERCHANT;
                        if (isComparisonOnly) {
                            errObj = EnumCoreModule.GetToastStr().Error.FAILED_ADD_DISABLED_ITEM_TO_COMPARISON;
                        }
                        failedCallback(errObj);
                    }

                    return dispatch({
                        type: actionTypes.ADD_EDIT_CART,
                        items: Object.assign({}, item)
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function selectedFeedBack(feedbackId) {
    return function (dispatch, getState) {
        let feedback = getState().itemsReducer.feedback;
        if (feedback) {
            feedback.ItemReviews.map(function (review) { 
                if (review.FeedbackID === feedbackId) {
                    review.isSelected = true;
                } else {
                    review.isSelected = false;
                }
            });
        }
        return dispatch({
            type: actionTypes.FEEDBACK_REPLY_SELECTED,
            feedback: Object.assign({}, feedback)
        });
    }
}

function addReplyFeedBack(feedbackId) {
    return function (dispatch, getState) {
        let feedback = getState().itemsReducer.feedback;
        let user = getState().userReducer.user;
        let message = getState().itemsReducer.message;
        if (feedback) {
            feedback.ItemReviews.map(function (review) {
                if (review.isSelected === true) {
                    $.ajax({
                        url: '/items/addReplyFeedback',
                        type: 'post',
                        data: {
                            merchantId: user.ID,
                            feedbackId: feedbackId,
                            message: message
                        },
                        success: function (data) {
                           
                            if (data === true) {
                                review.Replies.push(
                                    {
                                        CreatedDateTime: Math.floor(Date.now() / 1000),
                                        Message: message,
                                        User: user
                                    }
                                );
                                return dispatch({
                                    type: actionTypes.FEEDBACK_REPLY_SELECTED,
                                    feedback: Object.assign({}, feedback)
                                });
                            }

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    }); 
                } 
            });           
        }
    }
}

function updateMessage(message) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_MESSAGE,
            message: message
        });
    }
}

module.exports = {
    updateQuantity: updateQuantity,
    addOrEditCart: addOrEditCart,
    updateSubTotal: updateSubTotal,
    selectedFeedBack: selectedFeedBack,
    addReplyFeedBack: addReplyFeedBack,
    updateMessage: updateMessage
}