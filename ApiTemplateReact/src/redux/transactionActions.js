'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function getReports(merchantId, type, startDate, endDate, report_by, pageSize, pageNumber, source) {
    return function (dispatch) {
        $.ajax({
            url: "/dashboard/getReports",
            type: "GET",
            data: {
                merchantId: merchantId,
                type: type,
                startDate: startDate,
                endDate: endDate,
                report_by: report_by,
                pageSize: pageSize,
                pageNumber: pageNumber,

            },
            success: function (transaction) {

                return dispatch({
                    type: actionTypes.GET_REPORTS,
                    transaction: transaction,
                    reportType: type,
                    source: source
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getTransactions(pageSize, pageNumber, keyWords, startDate, endDate, sort) {

    return function (dispatch) {

        $.ajax({
            url: "/dashboard/getTransactions",
            type: "GET",
            data: {
                pageSize: pageSize,
                pageNumber: pageNumber,
                keyWords: keyWords,
                startDate: startDate,
                endDate: endDate,
                sort: sort,
            },
            success: function (transactions) {

                return dispatch({
                    type: actionTypes.GET_HEADER_TRANSACTION,
                    reports: transactions
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    getTransactions: getTransactions,
    getReports: getReports,
}