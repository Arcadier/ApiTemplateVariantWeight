'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    workflows: null,
    departments: null,

    selectedWorkflow: null,
    selectedDepartment: null,

    settings: { Enabled: false },
    currencyCode: null,

    keyword: '',
    minimumWorkflowCount: null,
    maximumWorkflowCount: null,

};

function approvalReducer (state = initialState, action) {
    switch (action.type) {
        case actionTypes.UPDATE_APPROVAL_SETTINGS: {
            return Object.assign({}, state, {
                settings: action.settings,
            });
        }
        case actionTypes.GET_APPROVAL_SETTINGS: {
            return Object.assign({}, state, {
                settings: action.settings,
            });
        }
        case actionTypes.UPDATE_APPROVAL_LIST: {
            return Object.assign({}, state, {
                [action.tableName.toLowerCase()]: action.result,
            });
        }
        case actionTypes.UPDATE_APPROVAL_FILTERS: {
            return Object.assign({}, state, {
                keyword: action.keyword,
                minimumWorkflowCount: action.minimumWorkflowCount,
                maximumWorkflowCount: action.maximumWorkflowCount,
            });
        }
        default:
            return state
    }
}

module.exports = {
    approvalReducer: approvalReducer
};
