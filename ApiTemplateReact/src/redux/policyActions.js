'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function getPages(isContentExclude) {
    return function (dispatch) {
        $.ajax({
            url: '/policy/getPages',
            type: 'GET',
            data: {
                isContentExclude: isContentExclude
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_CONTENT_PAGES,
                    pages: result.Records,
                    totalRecords: result.TotalRecords,
                    pageSize: result.PageSize,
                    pageNumber: result.PageNumber
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
};

module.exports = {
    getPages: getPages
}