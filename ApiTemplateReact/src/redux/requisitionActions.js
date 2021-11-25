'use strict';

var actionTypes = require('./actionTypes');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function filterRequisitions(filters) {
    return function (dispatch) {
        $.ajax({
            url: '/requisition/filter',
            type: 'GET',
            data: filters,
            //processData: false, 
            //contentType: "application/json; charset=utf-8",
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_REQUISITIONS,
                    requisitionList: result.requisitionList.Requisitions, 
                    filters: filters
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, jqXHR);
            }
        });
    };
};

function setStatusFilter(id) {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.SET_REQUISITION_STATUSFILTER,
            payload: id
        });
    };
};

function setSupplierFilter(id) {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.SET_REQUISITION_SUPPLIERFILTER,
            payload: id
        });
    };
};

function addRequisitionStatus(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/requisition/update-requisition',
            type: 'PUT',
            data: {
                requisitionId: options.Id,
                requisitionStatus: options.Status
            },
            success: function (result) {
                callback();
                return dispatch({ type: '' });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function acceptQuotation(pendingOffer, callback) {
    if (pendingOffer) {
        $.ajax({
            url: '/quotation/decline-accept-quotation',
            type: 'POST',
            data: {
                quotationId: pendingOffer.ID,
                channelId: pendingOffer.ChannelID,
                isAccepted: true,
                isDeclined: false
            },
            success: function (result) {
                callback();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                callback();
            }
        });
    } else {
        callback();
    }
}

function addUserRequisitionApproval(options, callback) {
    return function (dispatch, getState) {
        const pendingOffer = getState().requisitionReducer.pendingOffer;
        $.ajax({
            url: '/requisition/add-requisition-approval',
            type: 'PUT',
            data: {
                requisitionId: options.Id,
                requisitionStatus: options.Status,
                metadata: options.Metadata,
                flow: options.Flow,
            },
            success: function (result) {
                let requisitionDetail = getState().requisitionReducer.requisitionDetail;
                if (result.success) {
                    callback();
                    const payload = { hasApprovedOrReject: result.success };
                    if (result.status) {
                        payload.requisitionDetail = { ...requisitionDetail, Status: result.status}
                        if (result.status && result.status == 'Approved') {
                            acceptQuotation(pendingOffer, () => {})
                        }
                    }
                    return dispatch({ 
                        type: actionTypes.UPDATE_HAS_APPROVED_OR_REJECT, 
                        payload,
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}
module.exports = {
    filterRequisitions: filterRequisitions, 
    setStatusFilter: setStatusFilter, 
    setSupplierFilter: setSupplierFilter,
    addRequisitionStatus: addRequisitionStatus,
    addUserRequisitionApproval: addUserRequisitionApproval,
}