'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function asyncLoadingCategories() {
    return function (dispatch) {
        $.ajax({
            url: '/category/getCategories',
            type: 'GET',
            data: {},
            success: function (result) {
                return dispatch({
                    type: actionTypes.FETCH_CATEGORIES,
                    payload: result
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
};


function loadAllCategories() {
    return {
        type: actionTypes.HOMEPAGE_SHOW_ALL_CATEGORIES
    };
};

function load4Categories() {
    return {
        type: actionTypes.HOMEPAGE_SHOW_4_CATEGORIES
    };
};

module.exports = {
    loadMore: loadAllCategories,
    loadLess: load4Categories,
    asyncLoadingCategories: asyncLoadingCategories
}