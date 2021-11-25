'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    quotationList: [],
    filters: null,
    quotationDetail: null, 
    isMerchantAccess: false,
};

function quotationReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_QUOTATIONS: {
            return Object.assign({}, state, {
                quotationList: action.quotationList,
                filters: action.filters
            });
        }        
        default:
            return state;
    }
};

module.exports = {
    quotationReducer: quotationReducer
}