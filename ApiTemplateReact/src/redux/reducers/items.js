'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    items: [],
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    keyword: '',
    itemToDelete: null,
    countryCode: '',
    priceValues: [],
    bulkDiscounts: [],
    feedback: {},
    processing: false,
    itemDetail: {},
    bookings: []
};

function itemReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.LATEST_ITEMS: {
            return {
                ...state,
                items: action.items.Records
            }
        }
        case actionTypes.ITEM_DETAILS: {
            return {
                ...state,
                items: action.items,
                countryCode: action.countryCode,
                priceValues: action.priceValues,
                bulkDiscounts: action.bulkDiscounts
            }
        }
        case actionTypes.LATEST_ITEMS_LOAD_MORES: {
            return {
                ...state,
                items: action.items.Records
            }
        }
        case actionTypes.FETCH_STOREFRONTITEMS: {
            return Object.assign({}, state, {
                items: action.items,
                keyword: action.keyword
            })
        }
        
        case actionTypes.UPDATE_STOREFRONTKEYWORD: {
            return Object.assign({}, state, {
                keyword: action.keyword
            })
        }
        case actionTypes.GO_TO_PAGE: {
            return Object.assign({}, state, {
                items: action.items,
                pageSize: action.pageSize,
                pageNumber: action.pageNumber,
                totalRecords: action.totalRecords
            })
        }
        case actionTypes.UPDATE_ITEMDETAILQUANTITY: {
            return Object.assign({}, state, {
                priceValues: action.priceValues
            })
        }
        case actionTypes.ADD_EDIT_CART: {
            return Object.assign({}, state, {
                items: action.items
            })
        }
        case actionTypes.SEARCH_ITEMS: {
            return Object.assign({}, state, {
                items: action.items,
                pageSize: action.pageSize,
                pageNumber: action.pageNumber,
                totalRecords: action.totalRecords,
                keyword: action.keyword
            })
        }
        case actionTypes.EDIT_ITEM_PURCHASABLE: {
            return Object.assign({}, state, {
                items: action.items
            })
        }
        case actionTypes.SET_ITEM_TO_DELETE: {
            return Object.assign({}, state, {
                itemToDelete: action.itemToDelete
            })
        }
        case actionTypes.DELETE_ITEM: {
            return Object.assign({}, state, {
                items: action.items,
                pageNumber: action.pageNumber,
                totalRecords: action.totalRecords,
                itemToDelete: action.itemToDelete
            })
        }
        case actionTypes.PROCESSING: {
            return Object.assign({}, state, {
                processing: action.processing
            })
        }

        case actionTypes.FEEDBACK_REPLY_SELECTED: {
            return Object.assign({}, state, {
                feedback: action.feedback
            })
        }

        case actionTypes.UPDATE_MESSAGE: {
            return Object.assign({}, state, {
                message: action.message
            })
        }

        case actionTypes.GET_ITEM_DETAILS: {
            return Object.assign({}, state, {
                itemDetail: action.itemDetail
            })
        }

        default:
            return state;
    }
};

module.exports = {
    itemsReducer: itemReducer
}