'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function asyncLoadingPanels() {
    return function (dispatch) {
        $.ajax({
            url: '/panel/getPanels',
            type: 'GET',
            data: {
                pageSize: 24,
                pageNumber: 1,
                type: 'all'
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.FETCH_PANELS,
                    payload: result.Records
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
};

module.exports = {
    asyncLoadingPanels: asyncLoadingPanels
}