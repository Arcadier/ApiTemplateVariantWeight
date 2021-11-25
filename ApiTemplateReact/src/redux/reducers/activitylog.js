'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    totalRecords: '',
    ActivityLog: {},
    filters: {},
    keyword: '',
    isMerchantAccess: false
};

function activityLogReducer(state = initialState, action) {
    switch (action.type) {
    case actionTypes.FETCH_ACTIVITYLOG:
    {
        return Object.assign({}, state, {
            messages: action.getActivityLog
        });
    }
    case actionTypes.GO_TO_PAGE:
    {
        return Object.assign({}, state, {
            messages: action.messages
        });
    }
    case actionTypes.UPDATE_INBOXSEARCHTEXT:
    {
        return Object.assign({}, state, {
            messages: action.messages,
            logName: action.logName,
            keyword: action.keyword
        });
    }
    case actionTypes.EXPORT_MERCHANT_LOG:
    {
        return state;
    }
    default:
        return state;
    }
}

module.exports = {
    activityLogReducer: activityLogReducer
};
