'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function createPaymentAcceptanceMethodAsync(options, callback) {
    return function (dispatch) {
        $.ajax({
            url: "/merchants/settings/createPaymentAcceptanceMethodAsync",
            type: "POSt",
            data: options,
            contentType: 'application/json',
            success: function (transactions) {
                var dis = dispatch({
                    type: actionTypes.CREATE_PAYMENT_ACCEPTANCE_METHOD,
                    reports: transactions
                });
                callback()
                return dis;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getPaymentAcceptanceMethods(options, callback) {
    return function (dispatch) {
        $.ajax({
            url: "/merchants/settings/getPaymentAcceptanceMethods",
            type: "POSt",
            data: options,
            contentType: 'application/json',
            success: function (transactions) {
                var dis = dispatch({
                    type: actionTypes.GET_PAYMENT_ACCEPTANCE_METHOD,
                    reports: transactions
                });
                callback()
                return dis;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function saveOmiseAccount(options, callback) {
    return function (dispatch) {
        $.ajax({
            url: "/merchants/settings/saveOmiseAccount",
            type: "POST",
            data: options,
            contentType: 'application/json',
            success: function (result) {
                callback(result.errorMessage, result.recipientId);

                return dispatch({ type: '' });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    createPaymentAcceptanceMethodAsync: createPaymentAcceptanceMethodAsync,
    getPaymentAcceptanceMethods: getPaymentAcceptanceMethods,
    saveOmiseAccount: saveOmiseAccount
}