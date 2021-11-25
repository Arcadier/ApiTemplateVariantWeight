'use strict';
var actionTypes = require('./actionTypes');

function logout() {
    return {
        type: actionTypes.LOGOUT
    };
}

function changeUserPassword(options, callback) {
    return function (dispatch) {
        const userAjaxOptions = {
            url: '/accounts/change-password',
            type: 'POST',
            data: JSON.stringify(options),
            contentType: 'application/json'
        };

        $.ajax(userAjaxOptions)
            .done(function (result) {
                const { Result, user } = result;
                var dispatchedData = dispatch({
                    type: actionTypes.RESET_PASSWORD,
                    user
                });
                callback(Result);

                return dispatchedData;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });
    }
}

function registerWithUsernameAndPassword(options, callback) {
    return function (dispatch) {
        const userAjaxOptions = {
            url: '/users/register-with-username-and-password',
            type: 'POST',
            data: JSON.stringify(options),
            contentType: 'application/json'
        };

        $.ajax(userAjaxOptions)
            .done(function (user) {

                var dispatchedData = dispatch({
                    type: actionTypes.RESET_PASSWORD,
                    user: user
                });

                callback(user);

                return dispatchedData;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });
    }
}

function createInterestedUser(options, callback) {
    return function (dispatch) {

        const userAjaxOptions = {
            url: '/accounts/interested-user',
            type: 'POST',
            data: JSON.stringify(options),
            contentType: 'application/json'
        };

        $.ajax(userAjaxOptions)
            .done(function (result) {
                const { Result } = result;

                if (Result === true) {
                    window.sessionStorage.setItem('isSuccessInterestedUser', true);
                    window.location.href = "/";
                } else callback(result);
                return;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });

    }
}

module.exports = {
    logUserOut: logout,
    changeUserPassword: changeUserPassword,
    registerWithUsernameAndPassword: registerWithUsernameAndPassword,
    createInterestedUser: createInterestedUser
};
