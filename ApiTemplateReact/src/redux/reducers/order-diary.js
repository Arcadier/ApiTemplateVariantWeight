'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    eventCustomField: {},
    events: [],
    otherEvents: [],
    selectedSection: '',
    selectedTabSection: '',
    uploadFile: '',
    isValidUpload: null,
    isSuccessCreate: null,
    isProcessing: null
};

function orderDiaryReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.FETCH_EVENTS: {
            return Object.assign({}, state, {
                eventCustomField: action.eventCustomField,
                events: action.events,
                otherEvents: action.otherEvents,
                selectedSection: action.selectedSection,
                selectedTabSection: action.selectedTabSection,
                uploadFile: action.uploadFile,
                isValidUpload: action.isValidUpload,
                isSuccessCreate: action.isSuccessCreate
            });
        }
        case actionTypes.UPDATE_SELECTED_SECTION: {
            return Object.assign({}, state, {
                selectedSection: action.selectedSection,
                isSuccessCreate: action.isSuccessCreate
            });
        }
        case actionTypes.UPDATE_SELECTED_TAB_SECTION: {
            return Object.assign({}, state, {
                selectedTabSection: action.selectedTabSection,
                isSuccessCreate: action.isSuccessCreate
            });
        }
        case actionTypes.SET_UPLOAD_FILE: {
            return Object.assign({}, state, {
                uploadFile: action.uploadFile,
                isValidUpload: action.isValidUpload,
                isSuccessCreate: action.isSuccessCreate
            });
        }
        case actionTypes.CREATE_ORDER_DIARY_EVENT: {
            return Object.assign({}, state, {
                events: action.events,
                selectedSection: action.selectedSection,
                uploadFile: action.uploadFile,
                isValidUpload: action.isValidUpload,
                isSuccessCreate: action.isSuccessCreate,
                isProcessing: action.isProcessing
            });
        }
        case actionTypes.PROCESSING: {
            return Object.assign({}, state, {
                isProcessing: action.isProcessing
            });
        }
        default:
            return state
    }
};

module.exports = {
    orderDiaryReducer: orderDiaryReducer
}