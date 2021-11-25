'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

var toastr = require('toastr');
var EnumCoreModule = require('../public/js/enum-core');
var commonModule = require('../public/js/common');

function initOrderDeliveryMap() {
    return function (dispatch, getState) {
        const { invoiceDetails, shippingOptions, pickupOptions, orderDetails } = getState().settingsReducer;
        const delMap = new Map();
        let Orders = [];
        if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') {
            Orders = invoiceDetails.Orders;
        } else Orders = [orderDetails];

        if (Orders && Orders.length > 0) {

            Orders.map(o => {
                if (o.CartItemDetails[0]) {
                    if (o.CartItemDetails[0].ShippingMethod && o.CartItemDetails[0].ShippingMethod.ID) {
                        const delID = o.CartItemDetails[0].ShippingMethod.ID;
                        const merchantOptions = shippingOptions.find(s => s.Merchant.ID === o.MerchantDetail.ID);
                        if (merchantOptions.shippingOptions && merchantOptions.shippingOptions.length > 0) {
                            const matchedDel = merchantOptions.shippingOptions.find(s => s.ShippingData.ID === delID);
                            if (matchedDel) delMap.set(o.ID, matchedDel);
                        }

                    }
                    if (o.CartItemDetails[0].PickupAddress) {
                        const merchantOptions = pickupOptions.find(s => s.Merchant.ID === o.MerchantDetail.ID);
                        if (merchantOptions && merchantOptions.pickupOptions && merchantOptions.pickupOptions.length > 0) {
                            const delID = o.CartItemDetails[0].PickupAddress.ID;
                            const matchedDel = merchantOptions.pickupOptions.find(s => s.ID === delID);
                            if (matchedDel) delMap.set(o.ID, matchedDel);
                        }

                    }
                } else delMap.set(o.ID, null);
            });
        }
        return dispatch({
            type: actionTypes.CHECKOUT_REVIEW_UPDATE_DELIVERY_MAP,
            orderDelMap: delMap
        });
    }
}

function selectDeliveryForOrder(orderID, deliveryOption) {
    return function (dispatch, getState) {
        const { shippingOptions, pickupOptions, orderSelectedDelivery } = getState().settingsReducer;
        const delMap = orderSelectedDelivery;
        delMap.set(orderID, deliveryOption);
        return dispatch({
            type: actionTypes.CHECKOUT_REVIEW_UPDATE_DELIVERY_MAP,
            orderDelMap: delMap
        });
    }
}

function proceedToPayment(callback) {
    return function (dispatch, getState) {
        const {
            orderSelectedDelivery,
            invoiceDetails,
            pickupOptions,
            shippingOptions
        } = getState().settingsReducer;
        const merchantIds = [];
        if (invoiceDetails && invoiceDetails.Orders) {
            invoiceDetails.Orders.map(o => {
                if (o.MerchantDetail && o.MerchantDetail.ID) {
                    merchantIds.push(o.MerchantDetail.ID);
                }
            });
        }
        $.ajax({
            url: 'proceedToPayment',
            type: 'POST',
            data: {
                invoiceNo: JSON.stringify(invoiceDetails.InvoiceNo),
                orderSelectedDelivery: JSON.stringify(Array.from(orderSelectedDelivery.entries())),
                shippingOptions: JSON.stringify(shippingOptions),
                pickupOptions: JSON.stringify(pickupOptions),
                merchantIDs: JSON.stringify(merchantIds),
            },
            success: function (result) {
                if (typeof callback == 'function') callback(result);
                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function selectDelivery(deliveryOption) {
    return function (dispatch, getState) {
        let shippingOptionsToPass = [];
        let pickupOptionsToPass = [];
        let currentShippingOptions = getState().settingsReducer.shippingOptions;
        let currentPickupOptions = getState().settingsReducer.pickupOptions;

        let deliveryId = deliveryOption.IsPickup ? deliveryOption.Id : deliveryOption.ShippingData.ID;

        //Set Selected Logic
        currentShippingOptions.map(function (sod) {
            if (sod.ShippingData.ID == deliveryId) {
                sod.Selected = true;
            } else {
                sod.Selected = false;
            }
            shippingOptionsToPass.push(sod);
        });

        currentPickupOptions.map(function (pod) {
            if (pod.Id == deliveryId) {
                pod.Selected = true;
            } else {
                pod.Selected = false;
            }
            pickupOptionsToPass.push(pod);
        });

        return dispatch({
            type: actionTypes.CHECKOUT_REVIEW_CHANGE_DELIVERY,
            shippingOptions: shippingOptionsToPass,
            pickupOptions: pickupOptionsToPass
        });
    }
}

function generateComparisonFile(orderId) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/comparison/getComparisonSnapshot',
            type: 'POST',
            data: {
                orderId: orderId,
            },
            success: function (result) {
                window.open(result);

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

function updateToPaid(data, comparisonId, failedCallback) {
    return function (dispatch, getState) {
        let deliverySelected = null;
        let invoiceDetails = getState().settingsReducer.invoiceDetails;

        getState().settingsReducer.shippingOptions.forEach(function (shipping) {
            if (shipping.Selected === true) {
                deliverySelected = shipping;
            }
        });
        getState().settingsReducer.pickupOptions.forEach(function (pickup) {
            if (pickup.Selected === true) {
                deliverySelected = pickup;
            }
        });

        let itemId = invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.ID;
        if (invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.ParentID) {
            itemId = invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.ParentID;
        }

        validateComparisonDetail(comparisonId, itemId, function (isValid) {
            if (isValid) {
                $.ajax({
                    url: 'updateToPaid',
                    type: 'POST',
                    data: {
                        invoiceDetails: data,
                        deliverySelected: JSON.stringify(deliverySelected),
                        comparisonId: comparisonId
                    },
                    success: function (result) {
                        if (result) {
                            window.location = "/checkout/transaction-complete?invoiceNo=" + data.InvoiceNo;
                        }

                        return dispatch({
                            type: ''
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus, errorThrown);
                    }
                });
            } else {
                if (typeof failedCallback === 'function') {
                    failedCallback(EnumCoreModule.GetToastStr().Error.CHECKOUT_ITEM_HAS_BEEN_UPDATED);
                }

                return dispatch({
                    type: ''
                });
            }
        });
    }
}

function checkItemComparisonDetail(callback) {
    return function (dispatch, getState) {
        let invoiceDetails = getState().settingsReducer.invoiceDetails;
        let comparisonId = getState().settingsReducer.comparisonId;

        let itemId = invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.ID;
        if (invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.ParentID) {
            itemId = invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.ParentID;
        }

        validateComparisonDetail(comparisonId, itemId, function (isValid) {
            callback(!isValid ? EnumCoreModule.GetToastStr().Error.CHECKOUT_ITEM_HAS_BEEN_UPDATED : "");

            return dispatch({
                type: ''
            });
        });
    }
}

function validateComparisonDetail(comparisonId, itemId, callback) {
    let isValid = false;

    $.ajax({
        url: '/comparison/validateComparisonDetails',
        type: 'POST',
        data: {
            comparisonId: comparisonId,
            itemId: itemId
        },
        success: function (result) {
            if (result.updatedItems.length == 0 && !result.errorMessage) {
                isValid = true;
            }

            callback(isValid);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function updateSelectedPaymentMethod(code) {
    return function (dispatch, getState) {
        let paymentMethods = Object.assign([], getState().checkoutReducer.paymentMethods);

        paymentMethods.forEach(function (paymentMethod) {
            paymentMethod.isSelected = paymentMethod.code == code;
        });

        return dispatch({
            type: actionTypes.UPDATE_CHECKOUT_SELECTED_PAYMENT_METHOD,
            paymentMethods: paymentMethods
        });
    };
}

function generateStripeSessionId(callback) {
    return function (dispatch, getState) {
        const invoiceNo = getState().checkoutReducer.invoiceDetails.InvoiceNo;
        const paymentMethods = Object.assign([], getState().checkoutReducer.paymentMethods);
        let selectedPaymentMethod = null;

        paymentMethods.forEach(function (paymentMethod) {
            if (paymentMethod.isSelected) {
                selectedPaymentMethod = paymentMethod;
            }
        });

        if (selectedPaymentMethod && selectedPaymentMethod.code.startsWith('stripe')) {
            $.ajax({
                url: '/checkout/generate-stripe-session-id',
                type: 'POST',
                data: {
                    invoiceNo: invoiceNo,
                    gatewayCode: selectedPaymentMethod.code
                },
                success: function (result) {
                    if (result.error) {
                        console.log(result.error);
                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                        return;
                    }

                    callback(result);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
        }

        return dispatch({ type: '' });
    };
}

function postPayment(stripe, omise, departmentId, workflowId, isProcessPayment, notes, callback) {
    return function (dispatch, getState) {
        const isRequisition = process.env.CHECKOUT_FLOW_TYPE == 'b2b';
        const paymentMethods = getState().checkoutReducer.paymentMethods;
        const invoiceDetails = getState().checkoutReducer.invoiceDetails;
        const orderDetails = getState().checkoutReducer.orderDetails;
        const isSameBillingAndDelivery = getState().checkoutReducer.isSameBillingAndDelivery;
        const showCreateRequisition = getState().checkoutReducer.showCreateRequisition;
        const pendingOffer = getState().checkoutReducer.pendingOffer;
        // use for stripe 3ds since a webhook will be triggered if payment is success or failed
        // if true, it will process chosen payment method
        isProcessPayment = typeof isProcessPayment != 'undefined' ? isProcessPayment : true;

        let selectedDepartment = null;
        let selectedWorkflow = null;
        if (isRequisition && showCreateRequisition) {
            const departments = getState().checkoutReducer.departments;
            const workflows = getState().checkoutReducer.workflows;

            if (departments) {
                selectedDepartment = departments.Records.find(d => d.Id == departmentId);
            }
            if (workflows) {
                selectedWorkflow = workflows.Records.find(w => w.Id == workflowId);
            }
        }

        let selectedPaymentMethod = null;
        if (paymentMethods) {
            paymentMethods.forEach(function (paymentMethod) {
                if (paymentMethod.isSelected) {
                    selectedPaymentMethod = paymentMethod;
                }
            });
        }

        if (selectedPaymentMethod || isRequisition) {
            const {
                orderSelectedDelivery,
                pickupOptions,
                shippingOptions,
                addresses,
                billingAddresses,
            } = getState().settingsReducer;
            const merchantIds = [];
            if (invoiceDetails && invoiceDetails.Orders) {
                invoiceDetails.Orders.map(o => {
                    if (o.MerchantDetail && o.MerchantDetail.ID) {
                        merchantIds.push(o.MerchantDetail.ID);
                    }
                });
            } else if (orderDetails) {
                if (orderDetails.MerchantDetail && orderDetails.MerchantDetail.ID) {
                    merchantIds.push(orderDetails.MerchantDetail.ID);
                }
            }
            const {
                user
            } = getState().userReducer;

            let billingAddressID = "";
            let addressID = "";

            if (billingAddresses) {
                billingAddresses.forEach(function (address) {
                    if (address.Selected === true) {
                        billingAddressID = address.ID;
                    }
                });
            }

            if (isSameBillingAndDelivery) {
                addressID = billingAddressID;
            } else {
                if (addresses) {
                    addresses.forEach(function (address) {
                        if (address.Selected === true) {
                            addressID = address.ID;
                        }
                    });
                }
            }
            let isBankPayment = false;
            let orders = [];
            if (!isRequisition) {
                if (invoiceDetails) {
                    invoiceDetails.Orders.forEach(function (order) {
                        let itemIDs = [];
                        order.CartItemDetails.forEach(function (ci) {
                            itemIDs.push(ci.ItemDetail.ID);
                        });

                        //ARC8945
                        let orderStatus = "";
                        if (selectedPaymentMethod && !selectedPaymentMethod.configs) {

                            //paypal,custom payment
                            if (selectedPaymentMethod.gateway.toLowerCase() !== "cash on delivery" && !selectedPaymentMethod.code.includes("offline-payments")) {
                                //  if (selectedPaymentMethod.gateway.toLowerCase() === "paypal") {
                                isBankPayment = true;
                                orderStatus = "acknowledged";
                                //  }
                            }

                        } else {
                            //Card Payments
                            if (selectedPaymentMethod) {
                                isBankPayment = true;
                                orderStatus = "acknowledged";
                            }
                        }


                        let request = {
                            orderID: order.ID,
                            addressID: addressID,
                            billingAddressID: billingAddressID,
                            merchantID: order.MerchantDetail.ID,
                            consumerID: order.ConsumerDetail.ID,
                            itemIDs: itemIDs,
                            paymentStatus: '',
                            orderStatus: orderStatus,
                            isBankPayment: isBankPayment
                        };
                        orders.push(request);
                    });
                }
            } else {
                if (orderDetails) {
                    let itemIDs = [];
                    orderDetails.CartItemDetails.forEach(function (ci) {
                        itemIDs.push(ci.ItemDetail.ID);
                    });
                    let request = {
                        orderID: orderDetails.ID,
                        addressID: addressID,
                        billingAddressID: billingAddressID,
                        merchantID: orderDetails.MerchantDetail.ID,
                        consumerID: orderDetails.ConsumerDetail.ID,
                        itemIDs: itemIDs,
                        paymentStatus: 'Processing'
                    };
                    orders.push(request);
                }
                //arc9828
               // $(".btn-loader").addClass('btn-loading');
            }
            $(".btn-loader").addClass('btn-loading');
            $.ajax({
                url: '/checkout/updateCheckoutSelectedDeliveryAddressOnePage',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(orders),
                success: function (message) {
                    if (message === "INVALID") {
                        return dispatch({
                            type: actionTypes.INVALID_CHECKOUT,
                            invalidCheckout: true
                        });
                    }
                    let guestUserID = null;
                    if (user.Guest && commonModule.getCookie("guestUserID") && commonModule.getCookie("guestUserID") !== "") {
                        guestUserID = commonModule.getCookie("guestUserID");
                    }

                    // adding this to prevent sending edm plugin welcome email
                    user.Onboarded = null;

                    $.ajax({
                        url: '/users/update',
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify({ ...user, guestUserID, updateSubAccount: true }),
                        success: function (result) {
                          
                            $.ajax({
                                url: 'proceedToPayment',
                                type: 'POST',
                                data: {
                                    invoiceNo: !isRequisition ? invoiceDetails.InvoiceNo : null,
                                    orderId: isRequisition ? orderDetails.ID : null,
                                    orderSelectedDelivery: JSON.stringify(orderSelectedDelivery),
                                    shippingOptions: JSON.stringify(shippingOptions),
                                    pickupOptions: JSON.stringify(pickupOptions),
                                    merchantIDs: JSON.stringify(merchantIds),
                                    pendingOffer: pendingOffer ? JSON.stringify(pendingOffer) : null,
                                    notes: notes,
                                },
                                success: function (result) {
                                    if (!result || !result.success) {
                                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                                        $(".btn-loader").removeClass('btn-loading');
                                        return;
                                    }


                                    if (!isRequisition) {
                                        if (isProcessPayment) {
                                            $.ajax({
                                                url: '/checkout/payment',
                                                type: 'POST',
                                                data: {
                                                    invoiceNo: invoiceDetails.InvoiceNo,
                                                    gatewayCode: selectedPaymentMethod.code,
                                                    stripe: stripe,
                                                    omise: omise
                                                },
                                                success: function (result) {
                                                    const redirectUrl = result.url;
                                                    $(".btn-loader").removeClass('btn-loading');
                                                    if (result.success == true) {
                                                        const isCustomPayment = !EnumCoreModule.GetNonCustomGatewayCodes().includes(selectedPaymentMethod.code);

                                                        if (isCustomPayment && redirectUrl) {
                                                            return window.location = redirectUrl;
                                                        } else {
                                                            acceptQuotation(pendingOffer, () => {
                                                                return window.location = "/checkout/transaction-complete?invoiceNo=" + invoiceDetails.InvoiceNo;
                                                            });
                                                        }

                                                        //ARC10708
                                                        //$.ajax({
                                                        //    url: '/checkout/createInvoiceCosmetic',
                                                        //    type: 'POST',
                                                        //    data:{
                                                        //        invoiceNo: invoiceDetails.InvoiceNo
                                                        //    },
                                                        //    success: function (result) {
                                                        //        if (isCustomPayment && redirectUrl) {
                                                        //            return window.location = redirectUrl;
                                                        //        } else {
                                                        //            acceptQuotation(pendingOffer, () => {
                                                        //                return window.location = "/checkout/transaction-complete?invoiceNo=" + invoiceDetails.InvoiceNo;
                                                        //            });
                                                        //        }
                                                        //    },
                                                        //    error: function (jqXHR, textStatus, errorThrown) {
                                                        //        if (isCustomPayment && redirectUrl) {
                                                        //            return window.location = redirectUrl;
                                                        //        } else {
                                                        //            acceptQuotation(pendingOffer, () => {
                                                        //                return window.location = "/checkout/transaction-complete?invoiceNo=" + invoiceDetails.InvoiceNo;
                                                        //            });
                                                        //        }
                                                        //    }
                                                        //})

                                                    } else if (result.error) {
                                                        console.log(result.error);
                                                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                                                    } else {
                                                        if (result.code == 'DISABLED_ITEM_OR_SELLER') {
                                                            toastr.error('Order is invalid.', 'Buyer, Merchant or item may be disabled, please check and try again.');
                                                        }
                                                    }
                                                },
                                                error: function (jqXHR, textStatus, errorThrown) {
                                                    $(".btn-loader").removeClass('btn-loading');
                                                    console.log(textStatus, errorThrown);
                                                }
                                            });
                                        } else {
                                            if (typeof callback !== 'undefined') callback();
                                        }
                                    } else {
                                        if (!selectedDepartment && !selectedWorkflow) {
                                            acceptQuotation(pendingOffer, () => {
                                                createRequisition(orderDetails.ID, selectedDepartment, selectedWorkflow, (requisition) => {
                                                    if (requisition && requisition.ID) {
                                                        return window.location = '/checkout/requisition-created?id=' + requisition.ID + '&orderNo=' + requisition.RequisitionOrderNo + '&cosmeticNo=' + encodeURIComponent(requisition.CosmeticNo);
                                                    }
                                                });
                                            });
                                        } else {
                                            createRequisition(orderDetails.ID, selectedDepartment, selectedWorkflow, (requisition) => {
                                                if (requisition && requisition.ID) {
                                                    return window.location = '/checkout/requisition-created?id=' + requisition.ID + '&orderNo=' + requisition.RequisitionOrderNo + '&cosmeticNo=' + encodeURIComponent(requisition.CosmeticNo);
                                                }
                                            });
                                        }
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $(".btn-loader").removeClass('btn-loading');
                                    console.log(textStatus, errorThrown);
                                }
                            });

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            $(".btn-loader").removeClass('btn-loading');
                            console.log(textStatus, errorThrown);
                        }
                    })
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $(".btn-loader").removeClass('btn-loading');
                    console.log(textStatus, errorThrown);
                }
            });
        }

        return dispatch({
            type: ''
        });
    };
}

function createRequisition(orderID, selectedDepartment, selectedWorkflow, callback) {
    $.ajax({
        url: '/checkout/create-requisition',
        type: 'POST',
        data: {
            orderId: orderID,
            department: selectedDepartment ? JSON.stringify(selectedDepartment) : null,
            workflow: selectedWorkflow ? JSON.stringify(selectedWorkflow) : null
        },
        success: function (result) {
            callback(result)
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
            callback(null);
        }
    });
}

function updateSelectedAddress(ID, isBillingAddress) {
    return function (dispatch, getState) {
        let addresses = Object.assign([], getState().settingsReducer.addresses);
        let billingAddresses = Object.assign([], getState().settingsReducer.billingAddresses);
        let shippingAddressesOriginal = Object.assign([], getState().settingsReducer.shippingOptions);

        if (!isBillingAddress) {
            addresses.map(function (address) {
                if (address.ID === ID) {
                    address.Selected = true;
                } else {
                    address.Selected = false;
                }
            });
            var selectedBuyerAddress = addresses.filter(ba => ba.Selected === true);
            //ARC9585
            let isB2c = process.env.CHECKOUT_FLOW_TYPE === 'b2c';
            if (isB2c === true) {
                if (shippingAddressesOriginal && shippingAddressesOriginal[0]) {
                    shippingAddressesOriginal[0].shippingOptions.map(function (so) {
                        if (so.ShippingData && so.ShippingData.CustomFields) {
                            var deliveryOpt = so.ShippingData.CustomFields ? so.ShippingData.CustomFields.find(x => x.Name === 'DeliveryOptions') : null;
                            if (deliveryOpt) {
                                const values = JSON.parse(deliveryOpt.Values[0]);
                                if (values && values.SelectedCountries) {
                                    so.ShouldShow = false;
                                    values.SelectedCountries.forEach(function (country) {
                                        if (country.Code === selectedBuyerAddress[0].CountryCode) {
                                            so.ShouldShow = true;
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            } else {
                shippingAddressesOriginal.map(function (so) {
                    if (so.ShippingData && so.ShippingData.CustomFields) {
                        var deliveryOpt = so.ShippingData.CustomFields ? so.ShippingData.CustomFields.find(x => x.Name === 'DeliveryOptions') : null;
                        if (deliveryOpt) {
                            const values = JSON.parse(deliveryOpt.Values[0]);
                            if (values && values.SelectedCountries) {
                                so.ShouldShow = false;
                                values.SelectedCountries.forEach(function (country) {
                                    if (country.Code === selectedBuyerAddress[0].CountryCode) {
                                        so.ShouldShow = true;
                                    }
                                });
                            }
                        }
                    }
                });
            }



            return dispatch({
                type: actionTypes.UPDATE_SELECTED_ADDRESS,
                addresses: addresses,
                shippingOptions: shippingAddressesOriginal,
            });

        } else {
            billingAddresses.map(function (address) {
                if (address.ID === ID) {
                    address.Selected = true;
                } else {
                    address.Selected = false;
                }
            });

            return dispatch({
                type: actionTypes.UPDATE_SELECTED_BILLING_ADDRESS,
                billingAddresses: billingAddresses
            });
        }
    };
}

function updateBuyerAddress(address) {
    return function (dispatch, getState) {
        let invoiceDetails = Object.assign([], getState().checkoutReducer.invoiceDetails);
        let orderDetails = Object.assign([], getState().checkoutReducer.orderDetails);

        let orders = [];
        if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') {
            invoiceDetails.Orders.forEach(function (order) {
                let request = {
                    orderID: order.ID,
                    addressID: address.ID
                };
                orders.push(request);
            });
        } else {
            orders = [{
                orderID: orderDetails.ID,
                addressID: address.ID
            }];
        }

        $.ajax({
            url: '/checkout/updateCheckoutSelectedDeliveryAddress',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orders),
            success: function (message) {

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });

    };
}

function onTextChangeAddAddress(value, obj) {
    return function (dispatch, getState) {
        let addressModelAdd = Object.assign([], getState().settingsReducer.addressModelAdd);
        addressModelAdd[obj] = value;

        return dispatch({
            type: actionTypes.UPDATE_ADD_ADDRESS,
            addressModelAdd: addressModelAdd
        });
    };
}

function clearAddAddressModal() {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.CLEAR_ADD_ADDRESS_MODAL
        });
    }
}

function onTextChangeUser(value, obj) {
    return function (dispatch, getState) {
        let user = Object.assign([], getState().userReducer.user);
        user[obj] = value;

        return dispatch({
            type: actionTypes.UPDATE_USER_INFO_ONE_PAGE_CHECKOUT,
            user: user
        });
    };
}

function addressToDelete(ID) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_DELETE_ADDRESS,
            addressIDToDelete: ID
        });
    };
}

function deliveryChanged(selectedDelOption, orderID) {
    return function (dispatch, getState) {
        let orderSelectedDelivery = Object.assign([], getState().settingsReducer.orderSelectedDelivery);

        if (orderSelectedDelivery) {
            orderSelectedDelivery.map(function (delivery, i) {
                if (delivery[orderID] && delivery[orderID].OrderID === orderID) {
                    orderSelectedDelivery.splice(i, 1);
                }
            });
        }
        if (selectedDelOption) {
            selectedDelOption.OrderID = orderID;
            orderSelectedDelivery.push({ [orderID]: selectedDelOption });
        }

        return dispatch({
            type: actionTypes.CHECKOUT_REVIEW_UPDATE_DELIVERY_MAP,
            orderDelMap: orderSelectedDelivery
        });
    };
}

function calculateCost(selectedDelOption, orderID) {
    return function (dispatch, getState) {
        if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') {
            let invoiceDetails = Object.assign([], getState().checkoutReducer.invoiceDetails);

            invoiceDetails.Orders.map(function (order) {
                if (order.ID === orderID && selectedDelOption.IsPickup === false) {
                    if (order.CartItemDetails) {
                        order.CartItemDetails.map(function (cart) {
                            cart.SubTotal = cart.SubTotal + selectedDelOption.ShippingCost;
                        });
                        order.Freight = selectedDelOption.ShippingCost;
                        order.GrandTotal = order.GrandTotal + (selectedDelOption.ShippingCost * order.CartItemDetails.length);
                    }
                }
            });
            let result = dispatch({
                type: actionTypes.UPDATE_INVOICE_DETAILS,
                invoiceDetails: invoiceDetails
            });

            return result
        } else {
            let orderDetails = Object.assign([], getState().checkoutReducer.orderDetails);
            if (orderDetails.ID === orderID && selectedDelOption.IsPickup === false) {
                if (orderDetails.CartItemDetails) {
                    orderDetails.CartItemDetails.map(function (cart) {
                        cart.SubTotal = cart.SubTotal + selectedDelOption.ShippingCost;
                    });
                    orderDetails.Freight = selectedDelOption.ShippingCost;
                    orderDetails.GrandTotal = orderDetails.GrandTotal + (selectedDelOption.ShippingCost * orderDetails.CartItemDetails.length);
                }
            }
            return dispatch({
                type: actionTypes.UPDATE_ORDER_DETAILS,
                orderDetails: orderDetails
            });
        }
    };
}

function createAddress(callback) {
    return function (dispatch, getState) {
        let newAddress = {};
        let modeladd = getState().settingsReducer.addressModelAdd
        let user = getState().userReducer.user;
        let guestUserID = null;
        if (user.Guest && commonModule.getCookie("guestUserID") && commonModule.getCookie("guestUserID") !== "") {
            guestUserID = commonModule.getCookie("guestUserID");
        }

        newAddress.Name = modeladd.FirstName + " " + modeladd.LastName;
        newAddress.Line1 = modeladd.Address1;
        newAddress.PostCode = modeladd.PostalCode;
        newAddress.City = modeladd.City;
        newAddress.CountryCode = modeladd.Country;
        newAddress.State = modeladd.State;
        newAddress.Email = user.Email;
        newAddress.Delivery = true;
        newAddress.Pickup = false;
        newAddress.guestUserID = guestUserID;

        $.ajax({
            url: '/users/address/create',
            type: 'POST',
            data: newAddress,
            success: function (address) {
                if (typeof callback == 'function') callback();
                $("#addDeliveryAddress").modal("hide");
                address['Selected'] = false;
                dispatch({
                    type: actionTypes.CREATE_BILLING_ADDRESS,
                    address: address
                });

                return dispatch({
                    type: actionTypes.CREATE_ADDRESS,
                    address: Object.assign({}, address)
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function deleteAddress() {
    return function (dispatch, getState) {
        const addressId = getState().settingsReducer.addressIDToDelete;

        $.ajax({
            url: '/users/address/delete',
            type: 'POST',
            data: {
                addressId: addressId
            },
            success: function (address) {
                let addresses = Object.assign([], getState().settingsReducer.addresses);
                let billingAddresses = Object.assign([], getState().settingsReducer.billingAddresses);
                let updatedAddress = [];
                let updatedBillingAddress = [];
                let isDeleteSelected = false;

                addresses.map(function (address, i) {
                    if (address.ID !== addressId) {
                        updatedAddress.push(address);
                    } else {
                        if (address.Selected) {
                            isDeleteSelected = true;
                        }
                    }
                });

                if (isDeleteSelected) {
                    updatedAddress[0].Selected = true;
                    isDeleteSelected = false;
                }

                billingAddresses.map(function (address, i) {
                    if (address.ID !== addressId) {
                        updatedBillingAddress.push(address);
                    } else {
                        if (address.Selected) {
                            isDeleteSelected = true;
                        }
                    }
                });

                if (isDeleteSelected) {
                    updatedBillingAddress[0].Selected = true;
                }

                return dispatch({
                    type: actionTypes.DELETE_CHECKOUT_ADDRESSES,
                    addresses: updatedAddress,
                    billingAddresses: updatedBillingAddress
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateIsSameBilingAndDelivery(value) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_IS_SAME_BILLING_AND_DELIVERY_ADDRESS,
            isSameBillingAndDelivery: value
        });
    };
}

function acceptQuotation(pendingOffer, callback) {
    if (pendingOffer) {
        $.ajax({
            url: '/quotation/decline-accept-quotation',
            type: 'POST',
            data: {
                quotationId: pendingOffer.ID,
                channelId: pendingOffer.ChannelID,
                isAccepted: true,
                isDeclined: false
            },
            success: function (result) {
                callback();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                callback();
            }
        });
    } else {
        callback();
    }
}

function setCartToPending(options, callback) {
    const isServiceLevel = process.env.PRICING_TYPE == 'service_level';
    if (!isServiceLevel) {
        if (typeof callback == 'function') callback();
        return dispatch({
            type: ''
        });
    }
    return function (dispatch) {
        $.ajax({
            url: '/cart/editCart',
            type: 'PUT',
            data: {
                itemID: options.itemID,
                userID: options.userID,
                cartID: options.cartID,
                quantity: options.quantity,
                discountAmount: options.discountAmount,
                updateCartAsPending: true
            },
            success: function (results) {
                if (typeof callback == 'function') callback();
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


function createInvoiceCosmetic(callback) {
    return function (dispatch, getState) {
        const invoiceNo = getState().checkoutReducer.invoiceDetails.InvoiceNo;
        $.ajax({
            url: '/checkout/createInvoiceCosmetic',
            type: 'POST',
            data:{
                invoiceNo: invoiceNo
            },
            success: function (result) {
                callback(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
        return dispatch({ type: '' });
    }
}

module.exports = {
    calculateCost: calculateCost,
    deliveryChanged: deliveryChanged,
    selectDelivery: selectDelivery,
    generateComparisonFile: generateComparisonFile,
    updateToPaid: updateToPaid,
    checkItemComparisonDetail: checkItemComparisonDetail,
    selectDeliveryForOrder: selectDeliveryForOrder,
    initOrderDeliveryMap: initOrderDeliveryMap,
    proceedToPayment: proceedToPayment,
    updateSelectedPaymentMethod: updateSelectedPaymentMethod,
    generateStripeSessionId: generateStripeSessionId,
    postPayment: postPayment,
    updateSelectedAddress: updateSelectedAddress,
    updateBuyerAddress: updateBuyerAddress,
    onTextChangeAddAddress: onTextChangeAddAddress,
    addressToDelete: addressToDelete,
    onTextChangeUser: onTextChangeUser,
    createAddress: createAddress,
    deleteAddress: deleteAddress,
    updateIsSameBilingAndDelivery: updateIsSameBilingAndDelivery,
    clearAddAddressModal: clearAddAddressModal,
    setCartToPending: setCartToPending,
    createInvoiceCosmetic: createInvoiceCosmetic
}