'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function updateKeyWord(keyword) {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.UPDATE_INBOXSEARCHTEXT,
            keyword: keyword
        });
    }
}

function getDetails(messages, keyword) {
    const msg = [];
    messages.Records.forEach(function (element) {
        if (element.CartItemDetail != null) {
            if (element.CartItemDetail.ItemDetail !== null) {
                msg.push(element)
            }
        }
        else {
                msg.push(element)
        }
    });
    messages.Records = msg;
    messages.TotalRecords = msg.length

    return messages;
}

function searchInbox(keyword) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/chat/inbox/search',
            type: "get",
            data: {
                "keyword": keyword
            },
            success: function (result) {
                const msgs = keyword.length > 0 ? getDetails(result.messages, keyword) : result.messages;
                return dispatch({
                    type: actionTypes.UPDATE_INBOXSEARCHTEXT,
                    messages: msgs,
                    inboxDatas: result.inboxDatas,
                    keyword: keyword
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function goToPage(pageNo, filters) {
    return function (dispatch, getState) {
        const keyword = getState().inboxReducer.keyword;
        $.ajax({
            url: '/chat/inbox/paging',
            type: "get",
            data: {
                "pageNumber": pageNo,
                "keyword": keyword
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    messages: result.messages,
                    inboxDatas: result.inboxDatas
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getUnreadCount() {
    return function (dispatch) {
        $.ajax({
            url: '/chat/inbox/getUnreadCount',
            type: "GET",
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_UNREAD_COUNT,
                    unreadCount: parseInt(result)
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
    searchInbox: searchInbox,
    goToPage: goToPage,
    getUnreadCount: getUnreadCount
}