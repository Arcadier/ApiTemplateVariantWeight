'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    categories: [],
    numberOfCategories: 4
};

function categoryReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.HOMEPAGE_SHOW_ALL_CATEGORIES: {
            return Object.assign({}, state, {
                numberOfCategories: state.categories.length
            });
        }
        case actionTypes.HOMEPAGE_SHOW_4_CATEGORIES: {
            return Object.assign({}, state, {
                numberOfCategories: 4
            });
        }
        case actionTypes.FETCH_CATEGORIES: {
            return Object.assign({}, state, {
                categories: action.payload
            });
        }

        default:
            return state;
    }
};

module.exports = {
    categoryReducer: categoryReducer
}