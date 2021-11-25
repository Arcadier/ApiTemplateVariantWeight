'use strict';
var actionTypes = require('./actionTypes');

function latestItems() {
    return {
        type: actionTypes.LATEST_ITEMS,
        payload: {}
    };
}

module.exports = {
    latestItems: latestItems
};
