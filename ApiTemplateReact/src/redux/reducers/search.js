'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    items: [],
    totalRecords: 0,
    keywords: null,
    tags: [],
    withChildItems: true,
    pageSize: 20,
    pageNumber: 1,
    sort: null,
    minimumPrice: null,
    maximumPrice: null,
    selectedCategories: null,
    currencyCode: null,
    resultDisplayBehavior: 'list',
    breadcrumbText: '',
    customFilters: [],
    priceRange: null,
    customValues: null,
    reviewAndRating: '',
    location: '',
    startTimestamp: '',
    endTimestamp: '',
    userLatitude: '',
    userLongitude: '',
    isAllDates: ''
};

function searchReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.SEARCH_BY_FILTERS: {
            return Object.assign({}, state, {
                items: action.items.Records,
                pageSize: action.items.PageSize,
                priceRange: action.items && action.items.Meta && action.items.Meta.PriceRange ? action.items.Meta.PriceRange : null,
                totalRecords: action.items.TotalRecords,
                pageNumber: action.items.PageNumber,
                minimumPrice: action.minimumPrice,
                maximumPrice: action.maximumPrice,
                customValues: action.customValues,
                reviewAndRating: action.reviewAndRating
            })
        }
        case actionTypes.SORT_SEARCH_RESULT: {
            return Object.assign({}, state, {
                items: action.items.Records,
                sort: action.sort
            })
        }
        case actionTypes.SET_SEARCH_RESULT_DISPLAY: {
            return Object.assign({}, state, {
                resultDisplayBehavior: action.resultDisplayBehavior
            })
        }
        case actionTypes.SEARCH_BY_CATEGORY: {
            return Object.assign({}, state, {
                items: action.items.Records,
                pageSize: action.items.PageSize,
                priceRange: action.items && action.items.Meta && action.items.Meta.PriceRange ? action.items.Meta.PriceRange : null,
                totalRecords: action.items.TotalRecords,
                pageNumber: action.items.PageNumber,
                selectedCategories: action.selectedCategories,
                breadcrumbText: action.selectedCategories !== null ? action.selectedCategories[0].Name : "",
                customFilters: action.customFilters
            })
        }
        case actionTypes.GO_TO_PAGE: {
            return Object.assign({}, state, {
                items: action.items.Records,
                pageSize: action.items.PageSize,
                totalRecords: action.items.TotalRecords,
                pageNumber: action.items.PageNumber,
            })
        }
        default:
            return state;
    }
};

module.exports = {
    searchReducer: searchReducer
}