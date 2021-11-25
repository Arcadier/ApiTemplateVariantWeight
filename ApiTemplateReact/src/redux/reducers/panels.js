'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    panels: [],
};

function panelsReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.FETCH_PANELS: {
            return Object.assign({}, state, {
                panels: action.payload
            });
        }
        default:
            return state
    }
};

module.exports = {
    panelsReducer: panelsReducer
}