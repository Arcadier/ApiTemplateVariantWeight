'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    user: null,
    merchantOwner: null,
    subAccounts: null,
    userToDelete: null,
    isSuccessDelete: null,
    isSuccessInvite: null,
    isSuccessRegister: null,
    token: null,
    merchantFeedback: [],
    allMerchantFeedback: [],
    paymentTerms: null,
    keyword: null,
    userPreferredLocationId: null,
    analyticsApiAccess: null,
    isMerchantAccess: false,

    pagePermissions: {
        isAuthorizedToAdd: false,
        isAuthorizedToEdit: false,
        isAuthorizedToDelete: false,
    }
};

function userReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.CURRENT_USER: {
            return { state };
        }
        case actionTypes.LOGOUT: {
            return {
                panels: state.panels,
                categories: state.categories,
                user: null
            };
        }
        case actionTypes.GET_SUB_ACCOUNTS: {
            if (state.subAccounts) {
                return Object.assign({}, state, {
                    subAccounts: action.subAccounts,
                    keyword: action.keyword
                });
            }

            return state;
        }
        case actionTypes.SET_SUB_ACCOUNT_TO_DELETE: {
            if (state.subAccounts) {
                return Object.assign({}, state, {
                    userToDelete: action.userToDelete,
                    isSuccessDelete: null
                });
            }

            return state;
        }
        case actionTypes.DELETE_SUB_ACCOUNT: {
            if (state.subAccounts) {
                return Object.assign({}, state, {
                    subAccounts: action.subAccounts,
                    userToDelete: action.userToDelete,
                    isSuccessDelete: action.isSuccessDelete
                });
            }

            return state;
        }
        case actionTypes.SEND_SUB_MERCHANT_INVITES: {
            return Object.assign({}, state, {
                subAccounts: action.subAccounts,
                isSuccessInvite: action.isSuccessInvite,
                isSuccessDelete: null
            });
        }
        case actionTypes.UPDATE_STOREFRONT_MERCHANT_REVIEW: {
            return Object.assign({}, state, {
                merchantFeedback: action.merchantFeedback
            })
        }
        case actionTypes.UPDATE_USER_INFO_ONE_PAGE_CHECKOUT: {
            return Object.assign({}, state, {
                user: action.user
            });
        }
        default:
            return state;
    }
}

module.exports = {
    userReducer: userReducer
};
