'use strict';
var actionTypes = require('./actionTypes');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function goToPage(pageNumber, filters) {
    return function (dispatch, getState) {
        const state = getState().searchReducer;

        const user = getState().userReducer;
        const categoryIds = [];
        if (state.selectedCategories && state.selectedCategories.length > 0)
        Array.from(state.selectedCategories).map(function (category, index) {
            categoryIds.push(category.ID);
            if (category.ParentId) {
                categoryIds.push(category.ParentId);
            };
        });

        $.ajax({
            url: "/search/items/ajax",
            type: "GET",
            data: {
                pageSize: state.pageSize,
                pageNumber: pageNumber,
                tags: '',
                withChildItems: state.withChildItems,
                sort: state.sort,
                keywords: state.keywords,
                minPrice: state.minimumPrice,
                maxPrice: state.maximumPrice,
                categories: categoryIds,
                customFields: state.customfields,
                location: state.location,
                startTimestamp: state.startTimestamp,
                endTimestamp: state.endTimestamp,
                userLatitude: state.userLatitude,
                userLongitude: state.userLongitude,
                isAllDates: state.isAllDates
            },
            success: function (items) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    items: items,
                    pageNumber: pageNumber
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function sortResult(sort) {
    return function (dispatch, getState) {
        const state = getState().searchReducer;

        const user = getState().userReducer;
        $.ajax({
            url: '/search/items/ajax',
            type: 'GET',
            data: {
                pageSize: state.pageSize,
                pageNumber: state.pageNumber,
                tags: [],
                withChildItems: state.withChildItems,
                sort: sort,
                keywords: state.keywords,
                minPrice: state.minimumPrice,
                maxPrice: state.maximumPrice,
                categories: state.selectedCategories ? state.selectedCategories.map(c => c.ID) : [],
                customValues: state.customValues,
                location: state.location,
                startTimestamp: state.startTimestamp,
                endTimestamp: state.endTimestamp,
                userLatitude: state.userLatitude,
                userLongitude: state.userLongitude,
                isAllDates: state.isAllDates
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.SORT_SEARCH_RESULT,
                    items: result,
                    sort: sort
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function changeResultDisplay(resultDisplayBehavior) {
    return {
        type: actionTypes.SET_SEARCH_RESULT_DISPLAY,
        resultDisplayBehavior: resultDisplayBehavior
    };
}

function searchByCategory(categories) {
    let categoryIds = [];

    function getCustomFields(categoryIds, callback) {
        $.ajax({
            url: '/search/items/custom-fields',
            type: 'GET',
            data: {
                categoryIds: categoryIds
            },
            success: function (result) {
                callback(result);
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }

    function getCategoryHierarchy(category, hierarchy, hierarchyCount) {
        if (hierarchy) {
            if (hierarchy.indexOf(category.ID) >= 0 || hierarchyCount > hierarchy.length) {
                if (category.ChildCategories) {
                    hierarchyCount = hierarchyCount + 1;
                    category.ChildCategories.forEach(function (c) {
                        getCategoryHierarchy(c, hierarchy, hierarchyCount);
                    });
                }

                categoryIds.push(category.ID);
            }
        } else {
            if (category.ChildCategories) {
                category.ChildCategories.forEach(function (c) {
                    getCategoryHierarchy(c);
                });
            }

            categoryIds.push(category.ID);
        }
    }

    return function (dispatch, getState) {
        const state = getState().categoryReducer;

        Array.from(categories).map(function (category, index) {
            if (category.Hierarchy) {
                getCategoryHierarchy(state.categories.find(c => c.ID == category.ParentId), category.Hierarchy, 1);
            } else {
                getCategoryHierarchy(state.categories.find(c => c.ID == category.ID));
            }
        });

        $.ajax({
            url: '/search/items/ajax',
            type: 'GET',
            data: {
                pageSize: getState().searchReducer.pageSize,
                pageNumber: 1,
                tags: '',
                withChildItems: getState().searchReducer.withChildItems,
                sort: process.env.PRICING_TYPE != 'service_level' ? 'item_desc' : 'nearest',
                //keywords: state.keywords,
                //minPrice: state.minimumPrice,
                //maxPrice: state.maximumPrice,
                categories: categoryIds,
                customValues: null
            },
            success: function (promiseItemsResult) {
                getCustomFields(categoryIds, function (result) {
                    const items = promiseItemsResult;
                    return dispatch({
                        type: actionTypes.SEARCH_BY_CATEGORY,
                        items: items,
                        selectedCategories: categories,
                        customFilters: result,
                    });
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function searchByFilters(filters) {
    return function (dispatch, getState) {
        const state = getState().searchReducer;

        $.ajax({
            url: '/search/items/ajax',
            type: 'GET',
            data: {
                pageSize: state.pageSize,
                pageNumber: 1,
                tags: '',
                withChildItems: state.withChildItems,
                sort: state.sort,
                keywords: state.keywords,
                minPrice: filters.minimumPrice,
                maxPrice: filters.maximumPrice,
                categories: state.selectedCategories && state.selectedCategories.length > 0 ? state.selectedCategories.map(cat => cat.ID) : state.selectedCategories,
                customValues: filters.customValues,
                sellerId: filters.sellerId,
                location: state.location,
                startTimestamp: state.startTimestamp,
                endTimestamp: state.endTimestamp,
                userLatitude: state.userLatitude,
                userLongitude: state.userLongitude,
                isAllDates: state.isAllDates
            },
            success: function (result) {

                return dispatch({
                    type: actionTypes.SEARCH_BY_FILTERS,
                    items: result,
                    minimumPrice: filters.minimumPrice,
                    maximumPrice: filters.maximumPrice,
                    customValues: filters.customValues,
                    reviewAndRating: state.reviewAndRating
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function searchGooglePlaces(keyword, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/search/google-places',
            type: 'GET',
            data: {
                keyword: keyword
            },
            success: function (result) {
                callback(result);

                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function searchSuggestedItems(lat, lng, callback) {
    return function (dispatch, getState) {
        const state = getState().searchReducer;

        $.ajax({
            url: '/search/suggested-items',
            type: 'GET',
            data: {
                userLatitude: lat,
                userLongitude: lng
            },
            success: function (result) {
                callback(result);

                return dispatch({
                    type: ''
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    sortResult,
    changeResultDisplay,
    goToPage,
    searchByCategory,
    searchByFilters,
    searchGooglePlaces,
    searchSuggestedItems
}