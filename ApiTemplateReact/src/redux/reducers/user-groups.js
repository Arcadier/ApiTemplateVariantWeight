'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    keyword: null,
    userGroups: null,
    subAccounts: [],
    selectedUserGroup: null,
    userGroup: null,
    processing: false,
    isMerchantAccess: false
};

function userGroupReducer(state = initialState, action) {
    switch (action.type) {
        
        case actionTypes.PROCESSING: {
            return Object.assign({}, state, {
                processing: action.processing
            });
        }
        case actionTypes.GET_USER_GROUPS: {
            return Object.assign({}, state, {
                userGroups: action.userGroups,
                keyword: action.keyword
            });
        }
        case actionTypes.SELECT_USER_GROUP: {
            return Object.assign({}, state, {
                selectedUserGroup: action.selectedUserGroup
            });
        }
       
        default:
            return state;
    }
}

module.exports = {
    userGroupReducer: userGroupReducer
};
