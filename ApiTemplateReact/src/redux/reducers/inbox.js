'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    inbox: {},
    pageNumber: '',
    pageSize: '',
    filters: {},
    totalRecords: '',
    keyword: '',
    unreadCount: 0,
    inboxDatas: []
};

function inboxReducer(state = initialState, action) {

    switch (action.type) {
        case actionTypes.FETCH_MESSAGES: {
            return Object.assign({}, state, {
                ...state,
                messages: action.getUserMessages
            })
        }
        case actionTypes.UPDATE_INBOXSEARCHTEXT: {
            return Object.assign({}, state, {
                ...state,
                messages: action.messages,
                inboxDatas: action.inboxDatas,
                keyword: action.keyword
            })
        }
        case actionTypes.GO_TO_PAGE: {
            return Object.assign({}, state, {
                ...state,
                messages: action.messages,
                inboxDatas: action.inboxDatas
            })
        }
        case actionTypes.GET_UNREAD_COUNT: {
            return Object.assign({}, state, {
                unreadCount: action.unreadCount
            });
        }
        default:
            return state;
    }
};

module.exports = {
    inboxReducer: inboxReducer
}