'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function updateKeyWord(keyword) {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.UPDATE_STOREFRONTKEYWORD,
            keyword: keyword
        });
    }
}

function searchStoreFront(keyword, sellerid, pageNo) {
    return function (dispatch) {
        $.ajax({
            url: "/storefront/" + sellerid +'/storefrontsearch',
            type: "get",
            data: {
                "keyword": keyword,
                "pageNo": 1,
            },
            success: function (items) {
                return dispatch({
                    type: actionTypes.FETCH_STOREFRONTITEMS,
                    items: items,
                    keyword: keyword
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}


function getMerchantFeedback(options) {
    return function (dispatch) {
        $.ajax({
            url: "/storefront/getMerchantFeedback",
            type: "post",
            data: {
                "keyword": options.keyword,
                "merchantID": options.merchantID,
                "pageNo": options.pageNo,
                "pageSize": options.pageSize
            },
            success: function (feedback) {
                return dispatch({
                    type: actionTypes.UPDATE_STOREFRONT_MERCHANT_REVIEW,
                    merchantFeedback: feedback
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}



module.exports = {
    updateKeyWord,
    searchStoreFront: searchStoreFront,
    getMerchantFeedback: getMerchantFeedback
}