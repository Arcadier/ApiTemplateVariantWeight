'use strict';
let actionTypes = require('./actionTypes');
let toastr = require('toastr');
let Currency = require('currency-symbol-map');
let EnumCoreModule = require('../public/js/enum-core');
let CommonModule = require('../public/js/common.js');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function generateSlug(itemName) {
    return itemName.replace(/[^a-zA-Z0-9\-]/g, "");
}

function populateCartPreview(cartItems) {
    let arr = [...cartItems];
    arr = arr.slice(0,3);
    $(".h-cart-menu .h-cart-mid > ul .cart-item").remove();
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
    });
    if (arr.length > 0) {
        arr.map(item =>  {
            let subtotal = (item.SubTotal - (item.DiscountAmount || 0));
            if (item.AddOns && item.AddOns.length > 0) {
                item.AddOns.map(addOn => subtotal += parseFloat(addOn.PriceChange) || 0);
            }

            //ARC10053  the discountamount should not be round off to have the correct value.
            let roundOffSubTotal = Math.round(subtotal * 100) / 100;

            $(".h-cart-menu .h-cart-mid > ul").append(`
                <li class="cart-item" key=${item.ID}>
                    <div class="item-img">
                        <img data-src=${item.ItemDetail.Media ? item.ItemDetail.Media[0].MediaUrl : null} class="lazyload" />
                    </div>
                    <div class="item-info">
                        <p><a href="/items/${generateSlug(item.ItemDetail.Name)}/${item.ItemDetail.ID}">${item.ItemDetail.Name}<a/></p>
                        <div class="item-price">
                          <span class="currency">${item.CurrencyCode} ${Currency(item.CurrencyCode)}</span> 
                          <span class="value">${formatter.format(roundOffSubTotal)}</span>
                       </div>
                    </div>
                </li>`
            )
        });
    }    
}

function getUserCarts(options, callback) {
    const { pageSize = 1000, pageNumber = 1, includes = null} = options;
    return function (dispatch, getState) {
        $.ajax({
            url: '/cart/getUserCarts',
            type: 'GET',
            data: {
                pageSize,
                pageNumber,
                includes,
                guestUserID: options.guestUserID
            },
            success: function (result) {
                let cartList = [];
                let cartCount = 0;
                if (result.TotalRecords > 0 && result.Records) {
                    cartList = result.Records;
                    cartList.map(cart => cartCount += parseInt(cart.Quantity || 0));
                }

                cartList.map(function (cart) {
                    //ARC10053 the discountamount should not be round off to have the correct value.
                    if (cart.DiscountAmount) {
                        cart.DiscountAmount = parseFloat(cart.DiscountAmountNotRoundOff) || 0;
                    }
                });

                $('#latest-cart-count').text(`${cartCount.toLocaleString()}`);
                populateCartPreview(cartList);

                if (typeof callback == 'function') callback(cartList);
                return dispatch({
                    type: actionTypes.GET_USER_CARTS,
                    cartList: cartList,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function arrangeItemCarts(itemCarts) {
    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
        cartPageModel.cartList = itemCarts;
        cartPageModel.isArranged = true;
        return dispatch({
            type: actionTypes.GET_CART_STATES,
            cartPageModel: cartPageModel
        });
    }
}

function itemSelect(ID, merchantID) {
    const isServiceLevel = process.env.PRICING_TYPE == 'service_level';
    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
        cartPageModel.cartList.forEach(function (merchantsId) {
            merchantsId.forEach(function (cart) {
                if (merchantID !== "") {
                    if (cart.ItemDetail.MerchantDetail.ID === merchantID) {
                        if ((!cart.isItemDisabled && isServiceLevel) || !isServiceLevel) {
                            if ($(`.fancy-checkbox input[id=${merchantID}]`).is(":checked")) {
                                cart.isChecked = "checked";
                            } else {
                                cart.isChecked = "";
                            }
                        }
                    }
                } else {
                    if (cart.ID === ID) {
                        if (cart.isChecked === "") {
                            cart.isChecked = "checked";
                        } else {
                            cart.isChecked = "";
                        }
                    }
                }
            });
        });
        return dispatch({
            type: actionTypes.GET_CART_STATES,
            cartPageModel: cartPageModel
        });
    }
}

function deleteCartItem(cartId, userId) {
    let self = this;
    return function (dispatch, getState) {
        $.ajax({
            url: "/cart/deleteCart",
            type: "DELETE",
            data: {
                userId: userId, 
                cartId: cartId
            },
            success: function (items) {
                let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
                if (cartPageModel && cartPageModel.cartList && cartPageModel.cartList.length > 0) {
                    cartPageModel.cartList.map(function (merchantsId,ind) {
                        merchantsId.map(function (cart,i) {
                            if (cart.ID === cartId) {
                                merchantsId.splice(i,1);
                            }
                        });
                        if (merchantsId.length === 0) {
                            cartPageModel.cartList.splice(ind, 1);
                        }
                    });

                    return dispatch({
                        type: actionTypes.GET_CART_STATES,
                        cartPageModel: cartPageModel
                    });
                } else {
                    return dispatch({ type: '' });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function deleteSelectCartId(ID) {
    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
        cartPageModel.cartItemToDelete = ID;
        return dispatch({
            type: actionTypes.GET_CART_STATES,
            cartPageModel: cartPageModel
        });
    }
}

function editCartItem(ID) {
    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
        cartPageModel.cartItemToEdit = ID;
        return dispatch({
            type: actionTypes.GET_CART_STATES,
            cartPageModel: cartPageModel
        });
    }
}

function TempoChangeQuantity(cartId, quantity) {
    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);

        cartPageModel.cartList.map(function (merchantsId) {
            merchantsId.map(function (cart, i) {
                if (cart.ID === cartId) {
                    cart.variantModel.quantityModel.Quantity = quantity;
                    cart.variantModel.quantityModel.SubTotal = parseFloat(cart.variantModel.quantityModel.Price) * parseInt(quantity);
                    cart.variantModel.quantityModel.DiscountAmount = computeBulkDiscount(cart.variantModel.quantityModel.Price, quantity, cart.ItemDetail);
                }
            });
        }); 
        return dispatch({
            type: actionTypes.GET_CART_STATES,
            cartPageModel: cartPageModel
        });
    }
}

function TempoChangeVariant(cartID, groupID, variantID) {
    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);

        cartPageModel.cartList.map(function (merchantsId) {
            merchantsId.map(function (cart, i) {
                if (cart.ID === cartID) {
                    if (cart.variantModel.variantsSelected) {
                        cart.variantModel.variantsSelected.map(function (variant) {
                            if (variant.GroupID === groupID) {
                                variant.ID = variantID;
                            }
                        });
                    }
                    if (cart.variantModel.variantDataList) {
                                                                          
                        cart.variantModel.variantDataList.map(function (child) {
                            let variantIsCorrect = [];
                            cart.variantModel.variantsSelected.map(function (vs) { 
                                if (child.Variants) {
                                    child.Variants.map(function (variant) {
                                        if (vs.GroupID === variant.GroupID &&
                                            vs.ID === variant.ID) {
                                            vs.Name = variant.Name;
                                            variantIsCorrect.push("true");
                                        }
                                    });
                                }

                                if (variantIsCorrect.length !== 0 && variantIsCorrect.length === cart.variantModel.variantsSelected.length) {

                                    cart.variantModel.quantityModel.SubTotal = parseFloat(child.Price) * parseInt(cart.variantModel.quantityModel.Quantity);
                                    cart.variantModel.quantityModel.StockQuantity = child.StockQuantity;
                                    cart.variantModel.quantityModel.StockLimited = child.StockLimited;
                                    cart.variantModel.quantityModel.Price = child.Price;
                                    cart.variantModel.selectedChildID = child.ID;
                                }
                            });
                        });                        
                    }
                }
            });
        });
        return dispatch({
            type: actionTypes.GET_CART_STATES,
            cartPageModel: cartPageModel
        });
    }
}

function SaveSelectedVariant(cartID,maxQuantity,userID) {

    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
        cartPageModel.cartList.map(function (merchantsId) {
            merchantsId.map(function (cart, i) {
                if (cart.ID === cartID) {
                    let allowEdit = true;
                    if (parseInt(maxQuantity) !== 0) {
                        if (parseInt(maxQuantity) < parseInt(cart.variantModel.quantityModel.Quantity)) {
                            allowEdit = false;
                            toastr.error('Insufficient Stock for ' + cart.ItemDetail.Name + '.', 'Oops! Something went wrong.');
                        }
                    }

                    let guestUserID = "";
                    if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                        guestUserID = CommonModule.getCookie("guestUserID");
                        if (guestUserID === userID) {
                            userID = guestUserID;
                        }
                    }

                    if (allowEdit === true) {
                        $.ajax({
                            url: "/cart/editCart",
                            type: "PUT",
                            data: {
                                itemID: cart.variantModel.selectedChildID ? cart.variantModel.selectedChildID : cart.ItemDetail.ID,
                                userID: userID,
                                cartID: cartID,
                                quantity: cart.variantModel.quantityModel.Quantity,
                                discountAmount: cart.variantModel.quantityModel.DiscountAmount
                            },
                            success: function (data) {
                              //  toastr.success("Cart Saved");
                                // cart.SubTotal = data.Quantity * data.ItemDetail.Price;
                                cart.SubTotal = data.SubTotal;
                                cart.Quantity = data.Quantity;
                                cart.ItemDetail.Variants = data.ItemDetail.Variants;
                                cart.ItemDetail.Price = data.ItemDetail.Price;
                                cart.DiscountAmount = data.DiscountAmount || 0;
                                //Fixing Media from Retrieve;
                                if (cart.variantModel.variantDataList) {
                                    cart.variantModel.variantDataList.forEach(function (child) {
                                        if (child.ID === data.ItemDetail.ID) {
                                            cart.ItemDetail.Media = child.Media;
                                        }
                                    })
                                }
                                
                                cart.variantModel.variantsSelected = data.ItemDetail.Variants;
                                cart.variantModel.Quantity = data.Quantity;
                                cart.variantModel.StockQuantity = data.StockQuantity;
                                return dispatch({
                                    type: actionTypes.GET_CART_STATES,
                                    cartPageModel: cartPageModel
                                });
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });
                    } 
                }
            });
        });
       
    };

}

function CheckoutButtonPressed(cartIDs, userID, callback)  {
    return function (dispatch, getState) {
        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
        let shouldGoToReviewPage = true;
        const isRequisition = process.env.CHECKOUT_FLOW_TYPE == 'b2b';
        const isServiceLevel = process.env.PRICING_TYPE == 'service_level';

        const { merchantPaymentTerms = null } = cartPageModel;
        let defaultPaymentTerms = [];

        if (cartIDs.length !== 0) {
            if (!isServiceLevel) {
                cartPageModel.cartList.map(function (merchantCarts) {
                    merchantCarts.map(function (cart, i) {
                        if (cartIDs.includes(cart.ID)) {
                            if (cart.ItemDetail.StockLimited === true && parseInt(cart.Quantity) > parseInt(cart.ItemDetail.StockQuantity)) {
                                shouldGoToReviewPage = false;
                            }
                        }

                        if (cart.ItemDetail && cart.ItemDetail.MerchantDetail) {
                            const merchantId = cart.ItemDetail.MerchantDetail.ID;

                            if (merchantPaymentTerms && merchantPaymentTerms.length > 0) {
                                const merchantInfo = merchantPaymentTerms.find(p => p.merchantID == merchantId);
                                if (merchantInfo && typeof merchantInfo !== 'undefined' && merchantInfo.paymentTerms && merchantInfo.paymentTerms.length > 0) {
                                    const { paymentTerms } = merchantInfo;
                                    const defaultPaymentTerm = paymentTerms.find(p => p.Default == true);
                                    if (defaultPaymentTerm) {
                                        if (!defaultPaymentTerms.find(p => p.merchantId == merchantId)) {
                                            defaultPaymentTerms.push({
                                                merchantId: merchantId,
                                                paymentTermId: defaultPaymentTerm.ID
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
            }

            if (shouldGoToReviewPage === true) {
                $.ajax({
                    url: !isRequisition ? '/cart/generateInvoiceByCartIDs' : '/cart/generateOrderByCartIDs',
                    type: "POST",
                    data: {
                        userId: userID,
                        cartId: cartIDs,
                        defaultPaymentTerms: JSON.stringify(defaultPaymentTerms)
                    },
                    success: function (data) {
                        if (data) {
                            if (!isRequisition) {
                                if (data && data.InvoiceNo) {
                                    window.location = '/checkout/one-page-checkout?invoiceNo=' + data.InvoiceNo;
                                } else {
                                    let code = '';
                                    if (data && data.code == 'INSUFFICIENT_STOCKS' && isServiceLevel) {
                                        code = data.code;
                                    }
                                    if (typeof callback == 'function') callback({ success: false, code });
                                }
                            } else {
                                if (data.length > 0 && data[0] && data[0].ID) {
                                    window.location = '/checkout/one-page-checkout?orderId=' + data[0].ID;
                                } else {
                                    if (typeof callback == 'function') callback({ success: false });
                                }
                            }
                        } else {
                            if (typeof callback == 'function') callback({ success: false });
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus, errorThrown);
                    }
                });
            } else {
                toastr.error('Item out of stock!');
            }
        }
    };
}

function validateCarts(options, callback) {
    const isServiceLevel = process.env.PRICING_TYPE == 'service_level';
    const { cartDataArr, userID } = options;
    return function(dispatch, getState) {
        $.ajax({
            url: "/cart/validateCart",
            type: "POST",
            data: {
                cartData: JSON.stringify(cartDataArr)
            },
            success: function (results) {
                if (results && !results.success) {
                    if (!isServiceLevel) toastr.error("You are unable to select the item to checkout.")
                    if (results.data && results.data.length > 0) {            
                        const toUpdateQuantity = results.data.filter(p => p.code == 'INSUFFICIENT_STOCKS');
                        let cartPageModel = Object.assign({}, getState().cartReducer.cartPageModel);
                        if (toUpdateQuantity && toUpdateQuantity.length > 0) {
                            toUpdateQuantity.map(toUpdate => {
                                cartPageModel.cartList.map(carts => {
                                    carts.map(cart => {
                                        if (cart.ID == toUpdate.ID) {
                                            $.ajax({
                                                url: "/cart/editCart",
                                                type: "PUT",
                                                data: {
                                                    itemID: cart.ItemDetail.ID,
                                                    userID: userID,
                                                    cartID: cart.ID,
                                                    quantity: toUpdate.remainingStocks
                                                }, 
                                                success: function(data) {
                                                    cart.SubTotal = data.SubTotal;
                                                    cart.Quantity = data.Quantity;
                                                    //Fixing Media from Retrieve;
                                                    if (cart.variantModel.variantDataList) {
                                                        cart.variantModel.variantDataList.forEach(function (child) {
                                                            if (child.ID === data.ItemDetail.ID) {
                                                                cart.ItemDetail.Media = child.Media;
                                                            }
                                                        })
                                                    }
                                                    cart.variantModel.Quantity = data.Quantity;
                                                    cart.variantModel.quantityModel.Quantity = data.Quantity;
                                                    cart.variantModel.quantityModel.StockQuantity = data.Quantity;
                                                    return dispatch({
                                                        type: actionTypes.GET_CART_STATES,
                                                        cartPageModel: cartPageModel
                                                    });

                                                }, 
                                                error: function (jqXHR, textStatus, errorThrown) {
                                                    console.log(textStatus, errorThrown);
                                                }
                                            });
                                        }
                                    });
                                });
                            });   
                        }
                        if (isServiceLevel) {
                            const disabledItems = results.data.filter(p => p.code == 'NOT_PURCHASABLE');
                            if (disabledItems && disabledItems.length > 0) {
                                toastr.error('Item visibility has been disabled (by marketplace Administrator or Merchant).', 'Oops! Something went wrong.')
                                const disabledItemIds = disabledItems.map(d => d.ID);
                                cartPageModel.cartList.map(carts => {
                                    carts.map(cart => {
                                        if (disabledItemIds.includes(cart.ID)) {
                                            cart.isItemDisabled = true;
                                            cart.isChecked = '';
                                        }
                                    });
                                })
                                return dispatch({
                                    type: actionTypes.GET_CART_STATES,
                                    cartPageModel: cartPageModel
                                });
                            }
                            const isMerchantDisabled = results.data.filter(p => p.code == 'NOT_FOUND');
                            if (isMerchantDisabled && isMerchantDisabled.length > 0) {
                                const merchantIds = isMerchantDisabled.map(d => d.merchantID);
                                cartPageModel.cartList.map(carts => {
                                    carts.map(cart => {
                                        if (cart && cart.ItemDetail && cart.ItemDetail.MerchantDetail && merchantIds.includes(cart.ItemDetail.MerchantDetail.ID)) {
                                            cart.isItemDisabled = true;
                                            cart.isMerchantDisabled = true;
                                            cart.isChecked = '';
                                        }
                                    });
                                });
                                toastr.error('Item visibility has been disabled (by marketplace Administrator or Merchant).', 'Oops! Something went wrong.')
                                return dispatch({
                                    type: actionTypes.GET_CART_STATES,
                                    cartPageModel: cartPageModel
                                });
                            }

                        }
                    }

                    if (typeof callback == 'function') callback({success: false});
                    return dispatch({
                        type: '',
                    });
                } else {
                    if (typeof callback == 'function') callback({success: true});
                    return dispatch({
                        type: '',
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function computeBulkDiscount(price, quantity, itemDetail) {
    let discountAmount = 0;

    function inRange(x, min, max) {
        return ((x - min) * (x - max)) <= 0;
    }

    if (process.env.PRICING_TYPE == 'country_level') {
        if (itemDetail && itemDetail.CustomFields) {
            const property = itemDetail.CustomFields.find(c => c.Name == 'BulkPricing');

            if (property && property.Values && property.Values.length > 0) {
                const bulkPricing = JSON.parse(property.Values[0]);

                for (let bulk of bulkPricing) {
                    discountAmount = quantity * bulk.Discount;
                    if (bulk.IsFixed == '0') {
                        discountAmount = ((price * quantity) * bulk.Discount) / 100;
                    }

                    if (typeof bulk.RangeStart !== 'undefined') {
                        if (inRange(quantity, parseInt(bulk.RangeStart), parseInt(bulk.RangeEnd))) {
                            break;
                        }
                    } else {
                        if (typeof bulk.OnwardPrice !== 'undefined') {
                            if (quantity >= parseInt(bulk.OnwardPrice)) {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    return discountAmount;
}

function getItemDetails(itemId, callback) {
    return function(dispatch, getState) {
        $.ajax({
            url: "/items/getItemDetails?itemId=" + itemId,
            type: "GET",
            success: function (results) {
                if (typeof callback == 'function') callback(results);
                return dispatch({
                    type: '',
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

module.exports = {
    getUserCarts: getUserCarts,
    arrangeItemCarts: arrangeItemCarts,
    itemSelect: itemSelect,
    deleteSelectCartId: deleteSelectCartId,
    deleteCartItem: deleteCartItem,
    editCartItem: editCartItem,
    validateCarts: validateCarts,
    TempoChangeQuantity: TempoChangeQuantity,
    TempoChangeVariant: TempoChangeVariant,
    SaveSelectedVariant: SaveSelectedVariant,
    CheckoutButtonPressed: CheckoutButtonPressed,
    getItemDetails: getItemDetails
}