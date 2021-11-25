'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var Moment = require('moment');
const ExportJsonExcel = require('js-export-excel');

function formatDateTime(timestamp, format) {

    if (timestamp == null || typeof timestamp == 'undefined')
        return ''

    if (typeof format === 'undefined') {
        format = process.env.DATETIME_FORMAT;
    }

    if (typeof timestamp === 'number') {
        return Moment.unix(timestamp).utc().local().format(format);
    } else {
        return Moment.utc(timestamp).local().format(format);
    }
}

function getCityAndCountry(value, array) {
    if (value) {
        return array === 1 ? value.split(',')[1].split(':')[1] : value.split(',')[2].split(':')[1];
    }
}

function searchActivityLog(logName) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().activityLogReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/activity-logs/search`,
            type: 'get',
            data: {
                logName: logName
            },
            success: function (messages) {
                return dispatch({
                    type: actionTypes.UPDATE_INBOXSEARCHTEXT,
                    messages: messages,
                    logName: logName
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
        const { isMerchantAccess } = getState().activityLogReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/activity-logs/paging`,
            type: 'get',
            data: {
                pageNumber: pageNo,
                keyword: filters.keyword
            },
            success: function (messages) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    messages: messages

                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function exportToExcel(startDate, endDate) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().activityLogReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/activity-logs/export`,
            type: 'GET',
            data: {
                startDate: startDate,
                endDate: endDate
            },
            success: function (data) {
                const logs = {};
                logs.fileName = 'ActivityLogs';
                logs.datas = [];
                if (data.Logins != null) {
                    for (let i = 0; i < data.Logins.length; i++) {
                        data.Logins[i].StartDateTime = formatDateTime(data.Logins[i].StartDateTime, process.env.DATETIME_FORMAT);
                        data.Logins[i].EndDateTime = formatDateTime(data.Logins[i].EndDateTime, process.env.TIME_FORMAT);
                        data.Logins[i].City = getCityAndCountry(data.Logins[i].GeoLocation, 1);
                        data.Logins[i].Country = getCityAndCountry(data.Logins[i].GeoLocation, 2);
                    }
                    logs.datas.push({
                        sheetData: data.Logins,
                        sheetName: 'Activity Log Logins',
                        sheetFilter: ['StartDateTime', 'EndDateTime', 'City', 'Country', 'Browser', 'UserID', 'Username'],
                        sheetHeader: ['Start Date Time', 'End Date Time', 'City', 'Country', 'Browser', 'User ID', 'Username'],
                        columnWidths: [10, 10]
                    });
                }
                if (data.Pages != null) {
                    for (let i = 0; i < data.Pages.length; i++) {
                        data.Pages[i].StartDateTime = formatDateTime(data.Pages[i].StartDateTime, process.env.DATETIME_FORMAT);
                        data.Pages[i].EndDateTime = formatDateTime(data.Pages[i].EndDateTime, process.env.TIME_FORMAT);
                    }
                    logs.datas.push({
                        sheetData: data.Pages,
                        sheetName: 'Activity Log Pages',
                        sheetFilter: ['StartDateTime', 'EndDateTime', 'PageUrl', 'UserID', 'Username'],
                        sheetHeader: ['Start Date Time', 'End Date Time', 'Page URL', 'User ID', 'Username'],
                        columnWidths: [10, 10]
                    });
                }
                if (data.Items != null) {
                    for (let i = 0; i < data.Items.length; i++) {
                        data.Items[i].CreatedDateTime = formatDateTime(data.Items[i].CreatedDateTime, process.env.DATETIME_FORMAT);
                        data.Items[i].AtDateTime = formatDateTime(data.Items[i].AtDateTime, process.env.TIME_FORMAT);
                        data.Items[i].ItemName = data.Items[i].Item.Name;
                    }
                    logs.datas.push({
                        sheetData: data.Items,
                        sheetName: 'Activity Log Items',
                        sheetFilter: ['CreatedDateTime', 'AtDateTime', 'ItemID', 'ItemName', 'Type', 'UserID', 'Username'],
                        sheetHeader: ['Start Date Time', 'End Date Time', 'Item ID', 'Item Name', 'Type', 'User ID', 'Username'],
                        columnWidths: [10, 10]
                    });
                }
                if (logs.datas.length > 0) {
                    const toExcel = new ExportJsonExcel(logs);
                    toExcel.saveExcel();
                }
                return dispatch({
                    type: actionTypes.EXPORT_MERCHANT_LOG
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function addPageAnaylytics(options) {
    return function (dispatch) {
        $.ajax({
            url: '/merchants/activity-logs/addPageAnaylytics',
            type: 'post',
            data: JSON.stringify(options.data),
            contentType: 'application/json',
            success: function (messages) {
                return dispatch({
                    type: ""
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function hasPageAnaylytics(options, callback) {

    return function (dispatch) {
        $.ajax({
            url: '/merchants/activity-logs/hasPageAnaylytics',
            type: 'post',
            data: JSON.stringify(options),
            contentType: 'application/json',
            success: function (messages) {
                var theDisPatch =  dispatch({
                    type: ""
                });

                callback(messages)
                return theDisPatch;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    searchActivityLog: searchActivityLog,
    exportToExcel: exportToExcel,
    goToPage: goToPage,
    addPageAnaylytics: addPageAnaylytics,
    hasPageAnaylytics: hasPageAnaylytics
};
