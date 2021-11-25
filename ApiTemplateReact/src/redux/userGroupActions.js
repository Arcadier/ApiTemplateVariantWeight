'use strict';
const { SELECT_USER_GROUP, GET_USER_GROUPS } = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function getUserGroups(options, isMerchantAccess, callback) {
    const { pageSize, pageNumber, keyword } = options;
    const extraPath = isMerchantAccess ? '/merchants' : '';

    $.ajax({
        url: `${extraPath}/user-groups/filter`,
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


function filterUserGroups(filters) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().userGroupReducer;

        getUserGroups(filters, isMerchantAccess, (result) => {
            return dispatch({ 
                type: GET_USER_GROUPS,
                userGroups: result.userGroups,
                keyword: filters.keyword || ''
            });
        });
    };
};


function createUserGroup(options, callback) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().userGroupReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

		$.ajax({
			url: `${extraPath}/user-groups/create`,
			type: 'POST',
			data: {
				name: options.Name,
				memberIds: JSON.stringify(options.SelectedUsers || [])
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

function updateUserGroup(options, callback) {
    return function (dispatch, getState) {
        const { isMerchantAccess } = getState().userGroupReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        $.ajax({
            url: `${extraPath}/user-groups/detail/${options.userGroupID}`,
            type: 'PUT',
            data: {
                name: options.Name,
                memberIds: JSON.stringify(options.SelectedUsers || [])
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

function deleteUserGroup(callback) {
    return function (dispatch, getState) {
        const { selectedUserGroup, userGroups, keyword, isMerchantAccess } = getState().userGroupReducer;
        const extraPath = isMerchantAccess ? '/merchants' : '';

        if (!selectedUserGroup) {
            if (typeof callback == 'function') callback(null);
        }

        $.ajax({
            url: `${extraPath}/user-groups/detail/${selectedUserGroup}`,
            type: 'DELETE',
            success: function (result) {
                if (typeof callback == 'function') callback(result);
                if (result && result.success) {

                    const maxPageNumber = Math.ceil((userGroups.TotalRecords - 1) / userGroups.PageSize);
                    let pageNumber = userGroups.PageNumber;
                    if (pageNumber == 0) pageNumber = 1;
                    if (pageNumber > maxPageNumber) {
                        pageNumber = maxPageNumber;
                    }

                    const filters = {
                        pageSize: userGroups.PageSize,
                        pageNumber: pageNumber,
                        keyword: keyword
                    }
                    getUserGroups(filters, (result) => {
                        return dispatch({ 
                            type: GET_USER_GROUPS,
                            userGroups: result.userGroups,
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
                return dispatch({ type: SELECT_USER_GROUP, selectedUserGroup: null });
            }
        });
    }
}

function selectUserGroup(userGroupID) {
    return function (dispatch) {
        return dispatch({ type: SELECT_USER_GROUP, selectedUserGroup: userGroupID });
    }
}

module.exports = {
	createUserGroup,
	filterUserGroups,
    updateUserGroup,
    deleteUserGroup,
    selectUserGroup
};