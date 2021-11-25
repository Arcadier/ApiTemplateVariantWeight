'use strict';
const actionTypes = require('./actionTypes');

if (typeof window !== 'undefined') { var $ = window.$; }

function addPaymentTerm() {
    return function (dispatch, getState) {
        let paymentTerms = Object.assign([], getState().settingsReducer.paymentTerms);

        paymentTerms.push({
            ID: 'temp-' + new Date().getTime(),
            Name: '',
            Description: '',
            Default: paymentTerms.length == 0 ? true : false,
            Active: true
        });

        return dispatch({
            type: actionTypes.ADD_PAYMENT_TERM,
            paymentTerms: paymentTerms
        });
    }
};

function deletePaymentTerm(id) {
    return function (dispatch, getState) {
        let paymentTerms = Object.assign([], getState().settingsReducer.paymentTerms);
        let updatedPaymentTerms = []

        paymentTerms.forEach((paymentTerm) => {
            if (paymentTerm.ID != id) {
                updatedPaymentTerms.push(paymentTerm);
            }
        });

        const hasDefault = updatedPaymentTerms.find(p => p.Default == true) != null;

        if (!hasDefault) {
            if (updatedPaymentTerms.length > 0) {
                updatedPaymentTerms[0]['Default'] = true;
            }
        }

        return dispatch({
            type: actionTypes.DELETE_PAYMENT_TERM,
            paymentTerms: updatedPaymentTerms
        });
    }
}

function updatePaymentTerm(id, key, value) {
    return function (dispatch, getState) {
        const paymentTerms = Object.assign([], getState().settingsReducer.paymentTerms);

        paymentTerms.forEach((paymentTerm) => {
            if (paymentTerm.ID == id) {
                paymentTerm[key] = value;
            } else {
                if (key == 'Default') {
                    paymentTerm[key] = false;
                }
            }
        });

        return dispatch({
            type: actionTypes.UPDATE_PAYMENT_TERM,
            paymentTerms: paymentTerms
        });
    }
}

function savePaymentTerms(callback) {
    return function (dispatch, getState) {
        const paymentTerms = Object.assign([], getState().settingsReducer.paymentTerms);

        $.ajax({
            url: '/merchants/settings/savePaymentTerms',
            type: 'POST',
            data: {
                paymentTerms: JSON.stringify(paymentTerms)
            },
            success: function (result) {
                if (typeof callback === 'function') callback();

                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

module.exports = {
    addPaymentTerm: addPaymentTerm,
    deletePaymentTerm: deletePaymentTerm,
    updatePaymentTerm: updatePaymentTerm,
    savePaymentTerms: savePaymentTerms
}