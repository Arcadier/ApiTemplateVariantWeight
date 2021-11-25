'use strict';
const { GET_PERMISSION_PROFILES, SELECT_PERMISSION_PROFILE } = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function filterPermissionProfiles(filters) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().accountPermissionReducer;

        getPermissionProfiles(filters, isMerchantAccess, (result) => {
            return dispatch({ 
                type: GET_PERMISSION_PROFILES,
                permissionProfiles: result.permissionProfiles,
                keyword: filters.keyword || ''
            });
        });
    };
};

function getPermissionProfiles(options, isMerchantAccess, callback) {
    const { pageSize, pageNumber, keyword } = options;
    const extraPath = isMerchantAccess ? '/merchants' : '';

    $.ajax({
        url: `${extraPath}/account-permissions/filter`,
        type: 'GET',
        data: {
            pageSize,
            pageNumber,
            keyword,
        },
        success: function (result) {
            callback(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, jqXHR);
        }
    });
}


function createPermissionProfile(options, callback) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().accountPermissionReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

		$.ajax({
            url: `${extraPath}/account-permissions/create`,
			type: 'POST',
			data: {
				name: options.Name,
				userGroupIds: JSON.stringify(options.SelectedUserGroups || []),
				permissions: JSON.stringify(options.LinkedPermissions || [])
			},
			success: function (result) {
				if (typeof callback == 'function') callback(result);
                return dispatch({ type: '' });
			},
			error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
				if (typeof callback == 'function') callback(null);
            }
		});
	};
}

function selectPermissionProfile(ID) {
    return function (dispatch) {
        return dispatch({ type: SELECT_PERMISSION_PROFILE, selectedPermissionProfileID: ID });
    }
}

function updatePermissionProfile(options, callback) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().accountPermissionReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/account-permissions/detail/${options.permissionProfileID}`,
            type: 'PUT',
            data: {
				name: options.Name,
				userGroupIds: JSON.stringify(options.SelectedUserGroups || []),
				permissions: JSON.stringify(options.LinkedPermissions || [])
			},
            success: function (result) {
                if (typeof callback == 'function') callback(result);
                return dispatch({ type: '' });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                if (typeof callback == 'function') callback(null);
            }
        });
    }
}

function deletePermissionProfile(callback) {
    return function (dispatch, getState) {
        const { selectedPermissionProfileID, permissionProfiles, keyword, isMerchantAccess } = getState().accountPermissionReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        if (!selectedPermissionProfileID) {
            if (typeof callback == 'function') callback(null);
        }

        $.ajax({
            url: `${extraPath}/account-permissions/detail/${selectedPermissionProfileID}`,
            type: 'DELETE',
            success: function (result) {
                if (typeof callback == 'function') callback(result);
                if (result && result.success) {
                    const maxPageNumber = Math.ceil((permissionProfiles.TotalRecords - 1) / permissionProfiles.PageSize);
                    let pageNumber = permissionProfiles.PageNumber;
                    if (pageNumber == 0) pageNumber = 1;
                    if (pageNumber > maxPageNumber) {
                        pageNumber = maxPageNumber;
                    }

                    const filters = {
                        pageSize: permissionProfiles.PageSize,
                        pageNumber: pageNumber,
                        keyword: keyword
                    }

                    getPermissionProfiles(filters, isMerchantAccess, (result) => {
                        return dispatch({ 
                            type: GET_PERMISSION_PROFILES,
                            permissionProfiles: result.permissionProfiles,
                            keyword: keyword || ''
                        });
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                if (typeof callback == 'function') callback(null);
            },
            complete: function () {
                return dispatch({ type: SELECT_PERMISSION_PROFILE, selectedPermissionProfileID: null });
            }
        });
    }
}

function validatePermissionToPerformAction(code, callback) {
    return function (dispatch, getState) {
        let { user } = getState().userReducer;
        if (getState().currentUserReducer && getState().currentUserReducer.user) {
            //settings page uses currentUserReducer for the logged in user
            user = getState().currentUserReducer.user;
        }
        //Fix for 10803 and other checking for create or edit item
        if (user && (!user.SubBuyerID && !user.SubmerchantID)) {

            if (typeof callback == 'function') callback();
            return dispatch({ type: '' });

        }
        //testing this since test server didnt recognize the last code.

        if (user && (user.SubBuyerID || user.SubmerchantID)) {
                $.ajax({
                    url: `/account-permissions/hasPermissionToPerformAction?code=${code}`,
                    type: 'GET',
                    success: function (result) {
                        if (result && result.authorized) {
                            if (typeof callback == 'function') callback();
                        } else {
                            const page = $('body').hasClass('page-sidebar') ? 'UNAUTHORIZED_PORTAL_ACCESS' : 'UNAUTHORIZED_ACCESS';
                            window.location.href = '?error=' + page;
                        }
                        return dispatch({ type: '' });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus, errorThrown);
                    }
                });
        }
          
    }
}

module.exports = {
	createPermissionProfile,
	filterPermissionProfiles,
	selectPermissionProfile,
	deletePermissionProfile,
	updatePermissionProfile,
    validatePermissionToPerformAction
};