'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    comparisonList: [],
    comparison: {},
    comparisonToUpdate: {},
    comparisonDetailToUpdate: {},
    processing: false,
    invoiceNumber: null,
    redirectToDelivery: false,
    keyword: [],
    comparableCustomFields: [],
};

function comparisonReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_USER_COMPARISONS: {
            return Object.assign({}, state, {
                comparisonList: action.comparisonList
            });
        }
        case actionTypes.GET_COMPARISON: {
            return Object.assign({}, state, {
                comparison: action.comparison
            });
        }
        case actionTypes.CREATE_COMPARISON: {
            return Object.assign({}, state, {
                comparisonList: action.comparisonList,
                comparison: action.comparison,
                comparisonToUpdate: action.comparisonToUpdate
            });
        }
        case actionTypes.EDIT_COMPARISON: {
            return Object.assign({}, state, {
                comparisonList: action.comparisonList,
                comparison: action.comparison,
                comparisonToUpdate: action.comparisonToUpdate
            });
        }
        case actionTypes.SET_COMPARISON_TO_UPDATE: {
            return Object.assign({}, state, {
                comparisonToUpdate: action.comparisonToUpdate
            });
        }
        case actionTypes.SET_COMPARISON_DETAIL_TO_UPDATE: {
            return Object.assign({}, state, {
                comparisonDetailToUpdate: action.comparisonDetailToUpdate
            });
        }
        case actionTypes.DELETE_COMPARISON_DETAIL: {
            return Object.assign({}, state, {
                comparison: action.comparison,
                comparisonDetailToUpdate: action.comparisonDetailToUpdate
            });
        }
        case actionTypes.CREATE_COMPARISON_DETAIL: {
            return Object.assign({}, state, {
                comparison: action.comparison
            });
        }
        case actionTypes.UPDATE_COMPARISON_DETAIL: {
            return Object.assign({}, state, {
                comparison: action.comparison
            });
        }
        case actionTypes.SET_PROCESSING_COMPARISONDETAILS: {
            return Object.assign({}, state, {
                processing: action.processing
            });
        }
        case actionTypes.CREATE_PURCHASE_DETAIL: {
            return Object.assign({}, state, {
                invoiceNumber: action.invoiceNumber,
                redirectToDelivery: action.redirectToDelivery
            });
        }
        case actionTypes.CREATE_EVALUATION: {
            return Object.assign({}, state, {
                comparisonList: action.comparison,
                comparison: action.comparison,
                comparisonToUpdate: action.comparisonToUpdate
            });
        }
        case actionTypes.EDIT_EVALUATION: {
            return Object.assign({}, state, {
                comparisonList: action.comparison,
                comparison: action.comparison,
                comparisonToUpdate: action.comparisonToUpdate
            });
        }
        case actionTypes.DELETE_EVALUATION: {
            return state;
        }
        case actionTypes.SET_EVALUATION_TO_UPDATE: {
            return Object.assign({}, state, {
                comparisonToUpdate: action.comparisonToUpdate
            });
        }
        case actionTypes.GO_TO_PAGE:
        {
            return Object.assign({}, state, {
                ...state,
                comparisonList: action.comparisonList
            });
        }
        default:
            return state;
    }
};

module.exports = {
    comparisonReducer: comparisonReducer
}