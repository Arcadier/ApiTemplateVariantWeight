'use strict';
var actionTypes = require('./actionTypes');
var EnumCoreModule = require('../public/js/enum-core');
const Moment = require('moment');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function searchOrder(filters) {
    return function (dispatch, getState) {
        let keyword = getState().orderReducer.keyword;
        let suppliers = getState().orderReducer.selectedSuppliers;
        let status = getState().orderReducer.selectedOrderStatuses;
        let date = getState().orderReducer.selectedDates;
        if (!filters.supplier) {
            filters.supplier = suppliers;
        }
        if (!filters.status) {
            filters.status = status;
        }
        if (filters.status && filters.status.includes('Shipped')){
            filters.status = filters.status.replace('Shipped','Delivered')
        }
       
        if (!filters.keyword) {
            filters.keyword = keyword;
            if (!filters.keyword) {
                filters.keyword = $("#keywords").val();
            }
        }
        if (!filters.startDate) {
            filters.startDate = date.StartDate;
            filters.endDate = date.EndDate;
        }
        if (!filters.pageNumber) {
            //should go to page1 for changing of pageSize
            filters.pageNumber = 1;
        }

        $.ajax({
            url: '/merchants/order/history/search',
            type: 'GET',
            data: {
                keyword: filters.keyword,
                startDate: filters.startDate,
                endDate: filters.endDate,
                supplier: filters.supplier,
                status: filters.status,
                pageNumber: 1,
                pageSize: filters.pageSize

            },
            success: function (history) {
                return dispatch({
                    type: actionTypes.FETCH_ORDERS,
                    history: history,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function goToPage(pageNo) {
    return function (dispatch, getState) {
        let keyword = getState().orderReducer.keyword;
        let pageSize = getState().orderReducer.history.PageSize;
        let suppliers = getState().orderReducer.selectedSuppliers;
        let status = getState().orderReducer.selectedOrderStatuses;
        let date = getState().orderReducer.selectedDates;

        let startDate = "";
        let endDate = "";
        if (date) {
            startDate = date.StartDate;
            endDate = date.EndDate;
        }

        if (!keyword) {
            keyword = $("#keywords").val();
        }

        $.ajax({
            url: '/merchants/order/history/search',
            type: 'GET',
            data: {
                keyword: keyword,
                pageNumber: pageNo,
                pageSize: pageSize,
                supplier: suppliers,
                startDate: startDate,
                endDate: endDate,
                status: status
            },
            success: function (history) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    history: history
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function selectUnselectOrder(id, isSelect) {
    return function (dispatch, getState) {
        let selectedOrders = [];

        if (isSelect === true) {
            selectedOrders = getState().orderReducer.selectedOrders.concat(id);
        } else {
            const current = getState().orderReducer.selectedOrders;

            current.map(function (currentId) {
                if (currentId !== id) {
                    selectedOrders.push(currentId);
                }
            });
        }

        return dispatch({
            type: actionTypes.SELECT_UNSELECT_ORDER,
            selectedOrders: selectedOrders,
        });
    };
}

function updateSelectedOrderStatus(status) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_ORDER_STATUS,
            selectedOrderStatuses: status
        });
    };
}

function updateSelectedSuppliers(suppliers) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_SUPPLIERS,
            selectedSuppliers: suppliers
        });
    };
}

function updateSelectedDates(date) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_DATES_PO,
            selectedDates: {
                StartDate: date.StartDate,
                EndDate: date.EndDate
            }
        });
    };
}

function updateKeyword(keyword) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_WORD_PO,
            keyword: keyword
        });
    };
}

function updateHistoryOrdersB2B(id, status) {
    return function (dispatch, getState) {
        let history = getState().orderReducer.history;
        const orderStatuses = getState().orderReducer.statuses;
        const fulfilmentStatuses = getState().orderReducer.fulfilmentStatuses;

        let request = {
            orderId: id,
            status: null,
            orderStatusId: null,
            fulfilmentStatusId: null
        };

        let selectedOrderStatus = null;
        let selectedFulfilmentStatus = null;

        if (orderStatuses && orderStatuses.Records) {
            selectedOrderStatus = orderStatuses.Records.find(s => s.ID == status);
        }

        if (fulfilmentStatuses && fulfilmentStatuses.Records) {
            selectedFulfilmentStatus = fulfilmentStatuses.Records.find(s => s.ID == status);
        }

        if (selectedOrderStatus) {
            request['orderStatusId'] = status;
        } else if (selectedFulfilmentStatus) {
            request['fulfilmentStatusId'] = status;
        } else {
            return dispatch({ type: '' });
        }

        $.ajax({
            url: '/merchants/order/detail/updateStatusb2b',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {
                if (result) {
                    //history.Records.map(function (order) {
                    //    if (order.ID === id) {
                    //        order.CartItemDetails.map(function (cartItem) {
                    //            let tempStatus = {
                    //                Name: request.status,
                    //                Type: 'Order'
                    //            };
                    //            cartItem.Statuses.push(tempStatus);
                    //        });
                    //    }
                    //});

                    var theDispatch = dispatch({
                        type: actionTypes.UPDATE_HISTORY_ORDERS,
                        history: history,
                        selectedFulfillmentStatuses: [],
                        selectedOrderStatus: '',
                        selectedDeliveryTypeName: '',
                        isShowChangeStatus: false,
                        isShowSuccessMessage: true
                    });

                    return theDispatch;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });

    }
}

function setToDatetime(toDate, duration, durationUnit) {
    var array = durationUnit.trim().split(' ');
    if (array.length > 1) {
        duration = duration * array[0];
    }

    if (durationUnit.toLowerCase().includes("minute")) {
        toDate.add(duration, 'minutes');
    } else if (durationUnit.toLowerCase().includes("hour")) {
        toDate.add(duration, 'hours');
    } else if (durationUnit.toLowerCase().includes("day")) {
        toDate.add(duration, 'days');
    } else if (durationUnit.toLowerCase().includes("week")) {
        toDate.add(duration, 'weeks');
    } else if (durationUnit.toLowerCase().includes("month")) {
        toDate.add(duration, 'months');
    } else if (durationUnit.toLowerCase().includes("night")) {
        toDate.add(duration, 'days');
    }
    return toDate;
}

function onUpdateBookingSlot(bookDate, bookTime) {

    return function (dispatch, getState) {

        let detail = getState().orderReducer.detail;
        let cartItemDetails = getState().orderReducer.detail.Orders[0].CartItemDetails;
       
        let duration = cartItemDetails[0].BookingSlot.Duration;
        let durationUnit = cartItemDetails[0].BookingSlot.DurationUnit;
        let timeZoneID = cartItemDetails[0].BookingSlot.TimeZoneID;
        let timeZoneOffset = cartItemDetails[0].BookingSlot.TimeZoneOffset;
        var fromDate = Moment(bookDate + ' ' +bookTime, 'MM/DD/YYYY hh:mm A');
        var toDate = Moment(bookDate + ' ' + bookTime, 'MM/DD/YYYY hh:mm A');
        toDate = setToDatetime(toDate, duration, durationUnit);

        let request = {
            ID: cartItemDetails[0].ID,
            ItemDetailID: cartItemDetails[0].ItemDetail.ID,
            Quantity: cartItemDetails[0].Quantity,
            Notes: cartItemDetails[0].Notes,
            BookingSlot: {
                Duration : duration,
                DurationUnit : durationUnit,
                FromDateTime: fromDate.toDate().getTime() / 1000,
                ToDateTime: toDate.toDate().getTime() / 1000,
                TimeZoneID : timeZoneID,
                TimeZoneOffset : timeZoneOffset
            }
        };

        $.ajax({
            url: '/merchants/order/detail/updateBooking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {
                detail.Orders[0].CartItemDetails[0].BookingSlot.FromDateTime = fromDate.toDate().getTime() / 1000;
                detail.Orders[0].CartItemDetails[0].BookingSlot.ToDateTime = toDate.toDate().getTime() / 1000;
                return dispatch({
                    type: actionTypes.UPDATE_BOOKING_SLOT,
                    detail: detail,
                    isShowSuccessMessage:true
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateHistoryOrders(id, status) {
    return function (dispatch, getState) {
        const history = getState().orderReducer.history;
        const orderStatuses = getState().orderReducer.statuses.Records;
        const fulfilmentStatuses = getState().orderReducer.fulfilmentStatuses.Records;

        let idsToUpdate = [];

        if (typeof id !== 'undefined') {
            idsToUpdate.push(id);
        }

        let selectedStatus = null;

        if (orderStatuses.find(s => s.ID == status)) {
            selectedStatus = orderStatuses.find(s => s.ID == status);
        }

        if (fulfilmentStatuses.find(s => s.ID == status)) {
            selectedStatus = fulfilmentStatuses.find(s => s.ID == status);
        }

        if (!selectedStatus) return dispatch({ type: '' });

        let request = {
            invoices: [],
            statusGuid: selectedStatus.ID,
            decrementStock: true
        };

        history.Records.map(function (invoice) {
            if (invoice.Orders) {
                invoice.Orders.map(function (order) {
                    if (order && order.CartItemDetails) {
                        order.CartItemDetails.map(function (cartItem) {
                            if (idsToUpdate.includes(cartItem.ID)) {
                                request.invoices.push(invoice.InvoiceNo);
                            }
                        });
                    }
                });
            }
        });

        $.ajax({
            url: '/merchants/order/history/updateStatus',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (message) {
                if (typeof message !== 'undefined' && message.Result === true) {
                    history.Records.map(function (invoice) {
                        invoice.Orders.map(function (order) {
                            if (order && order.CartItemDetails) {
                                order.CartItemDetails.map(function (cartItem) {
                                    if (idsToUpdate.includes(cartItem.ID)) {
                                        let tempStatus = Object.assign({}, selectedStatus);
                                        tempStatus['CreatedDateTime'] = new Date().toISOString();
                                        cartItem.Statuses.push(tempStatus);
                                    }
                                });
                            }
                        })
                    });

                    var theDispatch = dispatch({
                        type: actionTypes.UPDATE_HISTORY_ORDERS,
                        history: history,
                        selectedFulfillmentStatuses: [],
                        selectedOrderStatus: '',
                        selectedDeliveryTypeName: '',
                        isShowChangeStatus: false,
                        isShowSuccessMessage: true
                    });

                    return theDispatch;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function showHideChangeStatus(isShow) {
    return function (dispatch, getState) {
        if (isShow) {
            const invoices = getState().orderReducer.history.Records;
            const selectedOrders = getState().orderReducer.selectedOrders;

            let withDelivery = false;
            let withPickup = false;
            let statuses = [];
            let deliveryTypeName = '';

            invoices.map(function (invoice) {
                invoice.Orders.map(function (order) {
                    if (order && order.CartItemDetails) {
                        if (process.env.TEMPLATE == 'bespoke') {
                            if (selectedOrders.includes(order.ID)) {
                                order.CartItemDetails.map(function (cartItem) {
                                    let cartItemType = cartItem.CartItemType;
                                    if (!cartItemType) {
                                        if (order.CustomFields) {
                                            const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];
                                            const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                                            cartItemType = customFieldValue.DeliveryType;
                                        }
                                    }

                                    if (cartItemType === 'delivery') {
                                        withDelivery = true;
                                    } else if (cartItemType === 'pickup') {
                                        withPickup = true;
                                    }
                                });
                            }
                        } else {
                            order.CartItemDetails.map(function (cartItem) {
                                if (selectedOrders.includes(cartItem.ID)) {
                                    let cartItemType = cartItem.CartItemType;
                                    if (!cartItemType) {
                                        if (order.CustomFields) {
                                            const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];
                                            const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                                            cartItemType = customFieldValue.DeliveryType;
                                        }
                                    }

                                    if (cartItemType === 'delivery') {
                                        withDelivery = true;
                                    } else if (cartItemType === 'pickup') {
                                        withPickup = true;
                                    }
                                }
                            });
                        }
                    }
                });
            });
            if (withDelivery && withPickup) {
                statuses = process.env.COMMON_FULFILLMENT_STATUSES.split(',');
                deliveryTypeName = 'Delivery and Pick-Up';
            } else if (withDelivery) {
                statuses = process.env.DELIVERY_FULFILLMENT_STATUSES_b2b.split(',');
                deliveryTypeName = 'Delivery';
            } else if (withPickup) {
                statuses = process.env.PICKUP_FULFILLMENT_STATUSES_b2b.split(',');
                deliveryTypeName = 'Pick-Up';
            }

            return dispatch({
                type: actionTypes.SHOW_HIDE_CHANGE_STATUS,
                selectedFulfillmentStatuses: statuses,
                selectedOrderStatus: statuses[0],
                selectedDeliveryTypeName: deliveryTypeName,
                isShowChangeStatus: true,
                isShowSuccessMessage: false
            })
        } else {
            return dispatch({
                type: actionTypes.SHOW_HIDE_CHANGE_STATUS,
                selectedFulfillmentStatuses: [],
                selectedOrderStatus: '',
                selectedDeliveryTypeName: '',
                isShowChangeStatus: false,
                isShowSuccessMessage: false
            })
        }
    };
}

function showHideSuccessMessage(isShow) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.SHOW_HIDE_SUCCESS_MESSAGE,
            isShowSuccessMessage: isShow
        });
    };
}

function updateCheckoutSelectedDeliveryAddress(orderID, addressID) {
    return function (dispatch, getState) {
        let request = {
            orderID: orderID,
            addressID: addressID
        };

        $.ajax({
            url: '/checkout/updateCheckoutSelectedDeliveryAddress',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (message) {
                return dispatch({
                    type: actionTypes.UPDATE_CHECKOUT_SELECTED_DELIVERY_ADDRESS
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function updateInvoicePaymentStatus(options, callback) {

    return function (dispatch, getState) {

        let request = {
            invoiceNo: options.invoiceNo,
            status: options.status
        };

        $.ajax({
            url: '/merchants/order/detail/updateStatus',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (message) {
                if (typeof message !== 'undefined' && message.Result === true) {

                    $.ajax({
                        url: '/merchants/order/detail/updateTransactionInvoiceStatus',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            fulfilmentStatus: '',
                            paymentStatus: 'Paid',
                            invoiceNo: options.invoiceNo
                        }),
                        success: function (message) {

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });

                    callback()

                    return dispatch({
                        type: "PaymentUpdate"
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function updateOrderStatusb2binDetails(status) {
    return function (dispatch, getState) {
        const detail = getState().orderReducer.detail;
        const orderStatuses = getState().orderReducer.orderStatuses;
        const fulfilmentStatuses = getState().orderReducer.fulfilmentStatuses;
        const orderId = detail.ID;

        let request = {
            orderId: orderId,
            status: null,
            orderStatusId: null,
            fulfilmentStatusId: null
        };

        let selectedOrderStatus = null;
        let selectedFulfilmentStatus = null;

        if (orderStatuses) {
            selectedOrderStatus = orderStatuses.find(s => s.ID == status);
        }

        if (fulfilmentStatuses) {
            selectedFulfilmentStatus = fulfilmentStatuses.find(s => s.ID == status);
        }

        if (selectedOrderStatus) {
            request['orderStatusId'] = status;
        } else if (selectedFulfilmentStatus) {
            request['fulfilmentStatusId'] = status;
        } else {
            return dispatch({ type: '' });
        }

        $.ajax({
            url: '/merchants/order/detail/updateStatusb2b',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (orders) {
                if (orders) {
                    detail.CartItemDetails.map(function (cartItem) {
                        if (orders[0].CartItemDetails) {
                            var updated = orders[0].CartItemDetails.find(c => c.ID == cartItem.ID);

                            if (updated) {
                                cartItem.Statuses = Object.assign([], updated.Statuses);
                            }
                        }
                    });

                    return dispatch({
                        type: actionTypes.UPDATE_DETAIL_ORDER,
                        detail: detail,
                        isShowSuccessMessage: true
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function updateDetailOrder(status) {
    return function (dispatch, getState) {
        let detail = getState().orderReducer.detail;
        const orderStatuses = getState().orderReducer.orderStatuses;
        const fulfilmentStatuses = getState().orderReducer.fulfilmentStatuses;

        const isCancelButtonClicked = status == 'Cancelled';

        if (isCancelButtonClicked) {
            const cancelledStatus = fulfilmentStatuses.find(s => s.Name == status);

            if (cancelledStatus) {
                status = cancelledStatus.ID;
            }
        }

        let selectedStatus = null;

        if (orderStatuses.find(s => s.ID == status)) {
            selectedStatus = orderStatuses.find(s => s.ID == status);
        }

        if (fulfilmentStatuses.find(s => s.ID == status)) {
            selectedStatus = fulfilmentStatuses.find(s => s.ID == status);
        }

        if (!selectedStatus) return dispatch({ type: '' });

        let request = {
            invoices: [detail.InvoiceNo],
            statusGuid: selectedStatus.ID,
            decrementStock: true
        };

        function updateStatus(callback) {
            $.ajax({
                url: '/merchants/order/detail/updateStatus',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(request),
                success: function (message) {
                    if (typeof message !== 'undefined' && message.Result === true) {
                        if (detail.Orders) {
                            detail.Orders.map(function (order) {
                                order.CartItemDetails.map(function (cartItem) {
                                    let tempStatus = Object.assign({}, selectedStatus);
                                    tempStatus['CreatedDateTime'] = new Date().toISOString();
                                    cartItem.Statuses.push(tempStatus);
                                });
                            });
                        }

                        if (callback) return callback();

                        return dispatch({
                            type: actionTypes.UPDATE_DETAIL_ORDER,
                            detail: detail,
                            isShowSuccessMessage: true
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
        }

        if (!isCancelButtonClicked) return updateStatus();

        // in cancellation via button, the first update was for fulfilment, proceed with order status
        updateStatus(() => {
            selectedStatus = orderStatuses.find(s => s.Name == 'Cancelled');

            request['statusGuid'] = selectedStatus.ID;

            updateStatus();
        });
    }
}

function revertPayment(isRefund, cartItemID) {
    return function (dispatch, getState) {
        let detail = Object.assign({}, getState().orderReducer.detail);
        const paymentStatusList = getState().orderReducer.paymentStatuses.Records;
        let paymentStatuses = [];
        let orderID, status, statusID;
        let paymentStatus = "";
        detail.Orders.map(function (order) {
            order.CartItemDetails.map(function (cartItem) {
                if (cartItem.ID === cartItemID) {
                    orderID = order.ID;
                    //paymentStatuses = cartItem.Statuses.filter(s => s.Type === 'Payment' && s.Name !== 'Refunded');
                    paymentStatuses = order.Statuses.filter(s => s.Type === 'Payment' && s.Name !== 'Refunded' && (typeof paymentStatusList.find(p => p.Name == s.Name) !== 'undefined'));
                }
            });
            //order.PaymentDetails.map(function (payment) {
            //    paymentStatus = payment.Status;
            //});
        });

        if (isRefund) {
            const refundedStatus = paymentStatusList.find(s => s.IsMainStatus && s.Name == "Refunded");
            statusID = refundedStatus.ID;
            status = refundedStatus.Name;
        } else {
            if (paymentStatuses.length > 0) {
                status = paymentStatuses[paymentStatuses.length - 1].Name;
                statusID = paymentStatuses[paymentStatuses.length - 1].ID;

            } else {
                const defaultStatus = paymentStatusList.find(s => s.Default);

                status = defaultStatus.Name;
                statusID = defaultStatus.ID;
            }
            //if (!status) {
            //    if (paymentStatus && paymentStatus.toLowerCase() === "success") {
            //        status = "Paid";

            //    } else {
            //        if (paymentStatus) {
            //            status = paymentStatus;
            //        } else {
            //            status = "Waiting For Payment";
            //        }
            //    }
            //}
        }

        let request = {
            id: orderID,
            balance: null,
            fulfilmentStatus: null,
            paymentStatusId: statusID
        };

        $.ajax({
            url: '/merchants/order/detail/revertPayment',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {
                detail.Orders.map(function (order) {
                    order.CartItemDetails.map(function (cartItem) {
                        if (cartItem.ID === cartItemID) {
                            if (result && result.length > 0) {
                                order.PaymentStatus = status;
                                order.Statuses = result[0].Statuses;
                            }
                            return dispatch({
                                type: actionTypes.SHOW_HIDE_SUCCESS_MESSAGE,
                                isShowSuccessMessage: true
                            });
                        }
                    })
                });

                return dispatch({
                    type: actionTypes.REVERT_ORDER_PAYMENT,
                    detail: detail
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function revertPaymentOrderList(isRefund, cartItemID) {
    return function (dispatch, getState) {
        const orderList = Object.assign({}, getState().orderReducer.history);
        const paymentStatusList = getState().orderReducer.paymentStatuses.Records;
        let paymentStatuses = [];
        let orderID, status, statusID;
        let paymentStatus = "";

        dispatch({
            type: actionTypes.SHOW_HIDE_SUCCESS_MESSAGE,
            isShowSuccessMessage: false
        });

        orderList.Records.map(function (list) {
            list.Orders.map(function (order) {
                order.CartItemDetails.map(function (cartItem) {
                    if (cartItem.ID === cartItemID) {
                        orderID = order.ID;
                        //paymentStatuses = cartItem.Statuses.filter(s => s.Type === 'Payment' && s.Name !== 'Refunded');
                        paymentStatuses = order.Statuses.filter(s => s.Type === 'Payment' && s.Name !== 'Refunded' && (typeof paymentStatusList.find(p => p.Name == s.Name) !== 'undefined'));
                    }
                });
                //order.PaymentDetails.map(function (payment) {
                //    paymentStatus = payment.Status;
                //});
            });
        });

        if (isRefund) {
            const refundedStatus = paymentStatusList.find(s => s.IsMainStatus && s.Name == "Refunded");
            statusID = refundedStatus.ID;
            status = refundedStatus.Name;
        } else {
            if (paymentStatuses.length > 0) {
                status = paymentStatuses[paymentStatuses.length - 1].Name;
                statusID = paymentStatuses[paymentStatuses.length - 1].ID;
            } else {
                const defaultStatus = paymentStatusList.find(s => s.Default);

                status = defaultStatus.Name;
                statusID = defaultStatus.ID;
            }
            //if (!status) {
            //    if (paymentStatus && paymentStatus.toLowerCase() === "success") {
            //        status = "Paid";
            //    } else {
            //        if (paymentStatus) {
            //            status = paymentStatus;
            //        } else {
            //            status = "Waiting For Payment";
            //        }
            //    }
            //}
        }

        let request = {
            id: orderID,
            balance: null,
            fulfilmentStatus: null,
            paymentStatusId: statusID
        };

        $.ajax({
            url: '/merchants/order/detail/revertPayment',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {
                orderList.Records.map(function (list) {
                    list.Orders.map(function (order) {
                        order.CartItemDetails.map(function (cartItem) {
                            if (cartItem.ID === cartItemID) {
                                orderID = order.ID;
                                if (result && result.length > 0) {
                                    order.PaymentStatus = status;
                                    order.Statuses = result[0].Statuses;
                                }
                                return dispatch({
                                    type: actionTypes.SHOW_HIDE_SUCCESS_MESSAGE,
                                    isShowSuccessMessage: true
                                });
                            }
                        });
                    });

                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

module.exports = {
    searchOrder: searchOrder,
    goToPage: goToPage,
    selectUnselectOrder: selectUnselectOrder,
    updateSelectedSuppliers: updateSelectedSuppliers,
    updateSelectedOrderStatus: updateSelectedOrderStatus,
    updateSelectedDates: updateSelectedDates,
    updateKeyword: updateKeyword,
    updateHistoryOrders: updateHistoryOrders,
    updateHistoryOrdersB2B: updateHistoryOrdersB2B,
    showHideChangeStatus: showHideChangeStatus,
    showHideSuccessMessage: showHideSuccessMessage,
    updateDetailOrder: updateDetailOrder,
    revertPayment: revertPayment,
    onUpdateBookingSlot: onUpdateBookingSlot,
    revertPaymentOrderList: revertPaymentOrderList,
    updateCheckoutSelectedDeliveryAddress: updateCheckoutSelectedDeliveryAddress,
    updateInvoicePaymentStatus: updateInvoicePaymentStatus,
    updateOrderStatusb2binDetails: updateOrderStatusb2binDetails
}