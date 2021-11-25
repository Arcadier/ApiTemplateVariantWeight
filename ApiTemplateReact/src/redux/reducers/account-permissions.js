'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    keyword: '',
    permissionProfiles: null,
    userGroups: null,
    permissions: [],
    selectedPermissionProfileID: null,
    permissionProfile: null,
    processing: false,
    pageNameOverrides: [],
    isMerchantAccess: false
};

function accountPermissionReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_PERMISSION_PROFILES: {
            return Object.assign({}, state, {
                permissionProfiles: action.permissionProfiles,
                keyword: action.keyword
            });
        }
        case actionTypes.SELECT_PERMISSION_PROFILE: {
            return Object.assign({}, state, {
                selectedPermissionProfileID: action.selectedPermissionProfileID
            });
        }
        case actionTypes.PROCESSING: {
            return Object.assign({}, state, {
                processing: action.processing
            });
        }
        default:
            return state;
    }
}

module.exports = {
    accountPermissionReducer: accountPermissionReducer
};
