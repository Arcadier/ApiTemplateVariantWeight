'use strict';
const actionTypes = require('../actionTypes');

const initialState = {
    requisitionDetail: null,
    isApprover: false,
    hasApprovedOrRejected: false,
    flow: null,
    pendingOffer: null,
};

function requisitionReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_REQUISITIONS: {
            return Object.assign({}, state, {
                requisitionList: action.requisitionList, 
                filters: action.filters
            });
        }
        case actionTypes.UPDATE_HAS_APPROVED_OR_REJECT:{
            return Object.assign({}, state, { 
                ...action.payload
            });
        }
        case actionTypes.SET_REQUISITION_STATUSFILTER: {
            let defaultStatus = null;
            if (action.payload == 100)
            {
                defaultStatus = state.statuses.find(item => (item.ID == 0));
                defaultStatus.isChecked = false;
            }
            if (action.payload < 1) {
                defaultStatus = state.statuses.find(item => (item.ID == 0));
                defaultStatus.isChecked = !defaultStatus.isChecked;
            }
            return {
                ...state,
                statuses: state.statuses.map((item) => {
                    if (defaultStatus) {
                        item.isChecked = defaultStatus.isChecked;
                    }
                    else {
                        if (item.ID === action.payload) {
                            item.isChecked = !item.isChecked;
                        }
                    }
                    return item;
                })
            }
        }
        case actionTypes.SET_REQUISITION_SUPPLIERFILTER: {
            let defaultSupplier = null;
            if (action.payload == 100)
            {
                defaultSupplier = state.suppliers.find(item => (item.ID == 0));
                defaultSupplier.isChecked = false;
            }
            if (action.payload < 1) {
                defaultSupplier = state.suppliers.find(item => (item.ID == 0));
                defaultSupplier.isChecked = !defaultSupplier.isChecked;
            }
            return {
                ...state, 
                suppliers: state.suppliers.map((item) => {
                    if (defaultSupplier) {
                        item.isChecked = defaultSupplier.isChecked;
                    }
                    else {
                        if (item.ID === action.payload) {
                            item.isChecked = !item.isChecked;
                        }
                    }
                    return item;
                })
            }
        }
        
        default:
            return state;
    }
};

module.exports = {
    requisitionReducer: requisitionReducer
}