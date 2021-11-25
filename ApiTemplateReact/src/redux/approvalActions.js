'use strict';
const actionTypes = require('./actionTypes');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function ajaxApprovalSearch(filters, callback) {
    const { 
        keyword = null,
        min = null,
        max = null,
        pageSize = 20,
        pageNumber = 1,
        tableName = "Workflows"
    } = filters;
    $.ajax({
        url: '/approval/search',
        type: 'GET',
        data: {
            ...filters,
        },
        success: function (data) {
            callback(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function createApprovalWorkflow(options, callback) {
    return function (dispatch) {
        const { Reason, Workflows } = options
        $.ajax({
            url: '/approval/create-workflow',
            type: 'POST',
            data: {
                Reason,
                WorkflowCount: Workflows.length || 0,
                Workflows: JSON.stringify(Workflows)
            },
            success: function (result) {
                if (typeof callback !== 'undefined') callback(result);
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

function filterApprovalList(pageSize, pageNumber, tableName = "Workflows") {
    return function(dispatch, getState) {
        const approvalState = getState().approvalReducer;
        const { keyword, minimumWorkflowCount, maximumWorkflowCount } = approvalState;
        const request = {
            keyword,
            min: minimumWorkflowCount,
            max: maximumWorkflowCount,
            pageSize,
            pageNumber,
            tableName
        };
        ajaxApprovalSearch(request, function (result) {
            return dispatch({
                type: actionTypes.UPDATE_APPROVAL_LIST,
                result,
                tableName,
            });
        });
    }
}

function updateSearchFilters(filters) {
    return function(dispatch) {
        return dispatch({
            type: actionTypes.UPDATE_APPROVAL_FILTERS,
            keyword: filters.keyword || null,
            minimumWorkflowCount: filters.minimumWorkflowCount || null,
            maximumWorkflowCount: filters.maximumWorkflowCount || null,
        });
    }
}

function deleteApprovalWorkflow(rowID, callback) {
    return function (dispatch, getState) {
        const approvalState = getState().approvalReducer;
        let pageNumber = 1;
        let pageSize = 20;
        if (approvalState.workflows && approvalState.workflows.TotalRecords > 0) {
            pageNumber = approvalState.workflows.PageNumber;
            pageSize = approvalState.workflows.PageSize;
        }
        $.ajax({
            url: `/approval/workflows/${rowID}`,
            type: 'PUT',
            success: function (result) {
                const approvalState = getState().approvalReducer;
                const { keyword, minimumWorkflowCount, maximumWorkflowCount } = approvalState;
                const request = {
                    keyword,
                    min: minimumWorkflowCount,
                    max: maximumWorkflowCount,
                    pageSize,
                    pageNumber,
                    tableName: 'Workflows',
                };
                ajaxApprovalSearch(request, function (result) {
                    if (typeof callback !== 'undefined') callback(result);
                    return dispatch({
                        type: actionTypes.UPDATE_APPROVAL_LIST,
                        tableName: "Workflows",
                        result
                    });
                }); 
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function updateApprovalSettings(newSettings, callback) {
    return function (dispatch) {
        $.ajax({
            url: '/approval/settings',
            type: 'PUT',
            data: newSettings,
            success: function (result) {
                if (result.success) {
                    return dispatch({
                        type: actionTypes.UPDATE_APPROVAL_SETTINGS,
                        settings: result.data
                    });
                }
                if (typeof callback !== 'undefined') callback(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function getApprovalSettings() {
    return function (dispatch) {
        $.ajax({
            url: '/approval/getApprovalSettings',
            type: 'GET',
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_APPROVAL_SETTINGS,
                    settings: result
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function createApprovalDepartment(options, callback) {
    return function (dispatch) {
        const { Name, WorkflowID, WorkflowCount } = options;
        $.ajax({
            url: '/approval/create-department',
            type: 'POST',
            data: {
                Name,
                WorkflowCount,
                WorkflowID
            },
            success: function (result) {
                if (typeof callback !== 'undefined') callback(result);
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

function updateApprovalDepartment(rowID, options, callback) {
    return function (dispatch) {
        const { Name, WorkflowID, WorkflowCount } = options;
        $.ajax({
            url: `/approval/departments/${rowID}`,
            type: 'PUT',
            data: {
                Name,
                WorkflowCount,
                WorkflowID
            },
            success: function (result) {
                if (typeof callback !== 'undefined') callback(result);
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


function deleteApprovalDepartment(rowID, callback) {
    return function (dispatch, getState) {
        const approvalState = getState().approvalReducer;
        let pageNumber = 1;
        let pageSize = 20;
        if (approvalState.departments && approvalState.departments.TotalRecords > 0) {
            pageNumber = approvalState.departments.PageNumber;
            pageSize = approvalState.departments.PageSize;
        }
        $.ajax({
            url: `/approval/departments/${rowID}`,
            type: 'DELETE',
            success: function (result) {
                const approvalState = getState().approvalReducer;
                const { keyword, minimumWorkflowCount, maximumWorkflowCount } = approvalState;
                const request = {
                    keyword,
                    min: minimumWorkflowCount,
                    max: maximumWorkflowCount,
                    pageSize,
                    pageNumber,
                    tableName: 'Departments',
                };
                ajaxApprovalSearch(request, function (result) {
                    if (typeof callback !== 'undefined') callback(result);
                    return dispatch({
                        type: actionTypes.UPDATE_APPROVAL_LIST,
                        tableName: "Departments",
                        result
                    });
                }); 
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

module.exports = {
    updateApprovalSettings,
    getApprovalSettings,
    createApprovalWorkflow,
    deleteApprovalWorkflow,
    updateSearchFilters,
    filterApprovalList,
    createApprovalDepartment,
    updateApprovalDepartment,
    deleteApprovalDepartment,
}