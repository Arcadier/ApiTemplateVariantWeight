'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var moment = require('moment');

function fetchEvents(page = null, selectedSection = '') {
    return function (dispatch, getState) {
        let detail = { Orders: [] };
        if (page == 'requisition-detail') {
            detail = getState().requisitionReducer.requisitionDetail;
        } else if (page == 'receiving-note') {
            detail = getState().receivingNoteReducer.orderDetail;
        } else if (page == 'invoice-detail' || page == 'create-invoice') {
            detail = getState().invoiceReducer.invoiceDetail;
        } else {
            detail = typeof getState().orderReducer !== 'undefined' ? getState().orderReducer.detail : getState().purchaseReducer.detail;
        }

        const user = getState().userReducer.user;

        $.ajax({
            url: '/orderdiary/getEventCustomField',
            type: 'GET',
            success: function (result) {
                let events = [];
                let otherEvents = [];
                if (detail.Orders) {
                    detail.Orders.map(function (order) {
                        (order.CustomFields || []).map(function (customField) {
                            if (customField.Code == result.eventCustomField.Code) {
                                events = JSON.parse(customField.Values[0]);
                            }

                            result.orderDiaryCustomFields.map(function (orderDiaryCustomField) {
                                if (orderDiaryCustomField.Code != result.eventCustomField.Code) {
                                    if (customField.Code == orderDiaryCustomField.Code) {
                                        otherEvents = otherEvents.concat(JSON.parse(customField.Values[0]));
                                    }
                                }
                            });
                        });
                    });
                } else {
                    //b2b
                    if (detail.CustomFields) {
                        detail.CustomFields.map(function (customField) {
                            if (customField.Code == result.eventCustomField.Code) {
                                events = JSON.parse(customField.Values[0]);
                            }

                            result.orderDiaryCustomFields.map(function (orderDiaryCustomField) {
                                if (orderDiaryCustomField.Code != result.eventCustomField.Code) {
                                    if (customField.Code == orderDiaryCustomField.Code) {
                                        otherEvents = otherEvents.concat(JSON.parse(customField.Values[0]));
                                    }
                                }
                            });
                        });
                    }
                }


                return dispatch({
                    type: actionTypes.FETCH_EVENTS,
                    eventCustomField: result.eventCustomField,
                    events: events,
                    otherEvents: otherEvents,
                    selectedSection: selectedSection,
                    selectedTabSection: '',
                    uploadFile: '',
                    isValidUpload: null,
                    isSuccessCreate: null
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateSelectedSection(section) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_SECTION,
            selectedSection: section,
            isSuccessCreate: null
        });
    };
}

function updateSelectedTabSection(section) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_TAB_SECTION,
            selectedTabSection: section,
            isSuccessCreate: null
        });
    };
}

function setUploadFile(file, isValid) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.SET_UPLOAD_FILE,
            uploadFile: file,
            isValidUpload: isValid,
            isSuccessCreate: null
        });
    };
}

function createEvent(event, formData, page = null) {
    return function (dispatch, getState) {
        let detail = { Orders: [] };
        if (page == 'requisition-detail') {
            detail = getState().requisitionReducer.requisitionDetail;
        } else if (page == 'receiving-note') {
            detail = getState().receivingNoteReducer.orderDetail;
        } else if (page == 'invoice-detail' || page == 'create-invoice') {
            detail = getState().invoiceReducer.invoiceDetail;
        } else {
            detail = typeof getState().orderReducer !== 'undefined' ? getState().orderReducer.detail : getState().purchaseReducer.detail;
        }
        const user = getState().userReducer.user;
        const uploadFile = getState().orderDiaryReducer.uploadFile;
        const isValidUpload = getState().orderDiaryReducer.isValidUpload;
        const selectedSection = getState().orderDiaryReducer.selectedSection;
        const eventCustomField = getState().orderDiaryReducer.eventCustomField;
        const isProcessing = getState().orderDiaryReducer.isProcessing;

        let eventDisplayName = user.DisplayName;
        if (user) {
            if (user.Roles && user.Roles.includes('Submerchant')) {
                eventDisplayName = `${user.FirstName} ${user.LastName}`;
            }
            if (user.SubBuyerID !== null) eventDisplayName = `${user.FirstName} ${user.LastName}`;
        }

        if (isProcessing) {
            return dispatch({
                type: ''
            });
        }

        dispatch({
            type: actionTypes.PROCESSING,
            isProcessing: true
        });

        saveFile(uploadFile, isValidUpload, formData, function(path) {
            let events = getState().orderDiaryReducer.events;

            events.push({
                Section: selectedSection,
                DisplayName: eventDisplayName,
                Event: event,
                Pdf: path,
                CreatedOn: moment.utc()
            });

            let values = [];
            values.push(JSON.stringify(events));
            let updatedCustomField = {
                Code: eventCustomField.Code,
                Values: values
            };

            let customFields = [];
            customFields.push(updatedCustomField);
            let orderID = "";
            if (detail.Orders) {
                orderID = detail.Orders[0].ID;
            } else {
                //b2b
                orderID = detail.ID;
            }
            let request = {
                orderId: orderID,
                balance: null,
                fulfilmentStatus: null,
                paymentStatus: null,
                customFields: customFields
            };

            let updatedSection = '';
            if (page == 'requisition-detail') updatedSection = 'Comments';
            if (page == 'receiving-note' || page == 'invoice-detail' || page == 'create-invoice') updatedSection = 'Comment';
            $.ajax({
                url: '/orderdiary/createEvent',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(request),
                success: function (result) {
                    setTimeout(function () {
                        return dispatch({
                            type: actionTypes.CREATE_ORDER_DIARY_EVENT,
                            events: events,
                            selectedSection: updatedSection,
                            uploadFile: '',
                            isValidUpload: null,
                            isSuccessCreate: true,
                            isProcessing: false
                        });
                    }, 500);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
        });
    };
}

function saveFile(uploadFile, isValid, formData, callback) {
    if (uploadFile !== '' && isValid === true) {
        $.ajax({
            url: '/orderdiary/uploadFile',
            type: 'POST',
            contentType: false,
            processData: false,
            data: formData,
            success: function (result) {
                callback(result[0].SourceUrl);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    } else {
        callback('');
    }
}

module.exports = {
    fetchEvents: fetchEvents,
    updateSelectedSection: updateSelectedSection,
    updateSelectedTabSection: updateSelectedTabSection,
    setUploadFile: setUploadFile,
    createEvent: createEvent
}