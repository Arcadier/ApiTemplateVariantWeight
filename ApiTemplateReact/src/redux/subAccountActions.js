'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function ajaxSearch(pageSize, pageNumber, keyword, isMerchantAccess, callback) {
    const extraPath = isMerchantAccess ? '/merchants' : '';
    $.ajax({
        url: `${extraPath}/subaccount/search`,
        type: 'GET',
        data: {
            pageSize: pageSize,
            pageNumber: pageNumber,
            keyword: keyword,
        },
        success: function (subAccounts) {
            callback(subAccounts);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function setUserToDelete(userId) {
    return function (dispatch, getState) {
        const user = getState().userReducer.user;
        const subAccounts = Object.assign({}, getState().subAccountReducer.subAccounts);

        let userToDelete = null;
        let currentUserId = user.ID;
        let userOwnerId = user.AccountOwnerID || user.ID;

        if (userId) {
            if (user.AccountOwnerID) {
                if (user.Roles.includes('Submerchant')) {
                    currentUserId = user.SubmerchantID;
                } else {
                    currentUserId = user.SubBuyerID;
                }
            }

            if (userId != userOwnerId && userId != currentUserId) {
                userToDelete = subAccounts.Records.find(i => i.ID == userId);
            }
        }

        return dispatch({
            type: actionTypes.SET_SUB_ACCOUNT_TO_DELETE,
            userToDelete: userToDelete
        });
    };
}

function deleteUser() {
    return function (dispatch, getState) {
        const subAccounts = Object.assign({}, getState().subAccountReducer.subAccounts);
        const userToDelete = Object.assign({}, getState().subAccountReducer.userToDelete);
        const keyword = getState().subAccountReducer.keyword;
        const { isMerchantAccess } = getState().subAccountReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/subaccount/delete`,
            type: 'DELETE',
            data: {
                userId: userToDelete.ID
            },
            success: function (result) {
                ajaxSearch(subAccounts.PageSize, subAccounts.PageNumber, keyword, isMerchantAccess, (subAccounts) => {
                    return dispatch({
                        type: actionTypes.DELETE_SUB_ACCOUNT,
                        subAccounts: subAccounts,
                        userToDelete: null,
                        isSuccessDelete: true
                    });
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);

                return dispatch({
                    type: actionTypes.DELETE_USER,
                    subAccounts: subAccounts,
                    userToDelete: userToDelete,
                    isSuccessDelete: false
                });
            }
        });
    };
}

function sendInvitations(emails, registrationType, callback) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().subAccountReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        const invitations = emails.split(',').map((email) => {
            return {
                name: email.split('@')[0],
                email: email
            };
        });

        $.ajax({
            url: `${extraPath}/subaccount/send-invitations`,
            type: 'POST',
            data: {
                invitations: JSON.stringify(invitations),
                registrationType: registrationType
            },
            success: function (result) {
                callback();

                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                callback('failed');

                return dispatch({
                    type: ''
                });
            }
        });
    }
}

function search(pageSize, pageNumber, keyword) {
    return function (dispatch, getState) {
        const subAccounts = Object.assign({}, getState().subAccountReducer.subAccounts);
        const { isMerchantAccess } = getState().subAccountReducer;

        pageSize = pageSize || subAccounts.PageSize;
        pageNumber = pageNumber || 1;

        ajaxSearch(pageSize, pageNumber, keyword, isMerchantAccess, (subAccounts) => {
            return dispatch({
                type: actionTypes.GET_SUB_ACCOUNTS,
                subAccounts: subAccounts,
                keyword: keyword
            });
        });
    };
}

function addRole(userId, role) {
    return function (dispatch, getState) {
        const subAccounts = Object.assign({}, getState().subAccountReducer.subAccounts);
        const keyword = getState().subAccountReducer.keyword;
        const { isMerchantAccess } = getState().subAccountReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/subaccount/add-role`,
            type: 'PUT',
            data: {
                userId: userId,
                role: role
            },
            success: function (result) {
                if (result) {
                    ajaxSearch(subAccounts.PageSize, subAccounts.PageNumber, keyword, isMerchantAccess, (subAccounts) => {
                        return dispatch({
                            type: actionTypes.GET_SUB_ACCOUNTS,
                            subAccounts: subAccounts,
                            keyword: keyword
                        });
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);

                return dispatch({
                    type: ''
                });
            }
        });
    };
}

function deleteRole(userId, role) {
    return function (dispatch, getState) {
        const subAccounts = Object.assign({}, getState().subAccountReducer.subAccounts);
        const keyword = getState().subAccountReducer.keyword;
        const { isMerchantAccess } = getState().subAccountReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/subaccount/delete-role`,
            type: 'DELETE',
            data: {
                userId: userId,
                role: role
            },
            success: function (result) {
                if (result) {
                    ajaxSearch(subAccounts.PageSize, subAccounts.PageNumber, keyword, isMerchantAccess, (subAccounts) => {
                        return dispatch({
                            type: actionTypes.GET_SUB_ACCOUNTS,
                            subAccounts: subAccounts,
                            keyword: keyword
                        });
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);

                return dispatch({
                    type: ''
                });
            }
        });
    };
}

module.exports = {
    addRole: addRole,
    deleteRole: deleteRole,
    deleteUser: deleteUser,
    search: search,
    sendInvitations: sendInvitations,
    setUserToDelete: setUserToDelete
}