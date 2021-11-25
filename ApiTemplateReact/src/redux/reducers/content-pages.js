'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    pages: [],
    totalRecords: 0,
    pageSize: 0,
    pageNumber: 0,
    policy: {}
};

function contentPageReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_CONTENT_PAGES: {
            return Object.assign({}, state, {
                pages: action.pages,
                totalRecords: action.totalRecords,
                pageSize: action.pageSize,
                pageNumber: action.pageNumber
            });
        }
        default:
            return state
    }
};

module.exports = {
    contentPageReducer: contentPageReducer
}