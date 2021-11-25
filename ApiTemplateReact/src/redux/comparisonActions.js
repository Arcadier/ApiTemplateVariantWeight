'use strict';
var actionTypes = require('./actionTypes');
var toastr = require('toastr');
var EnumCoreModule = require('../public/js/enum-core');
var CommonModule = require('../public/js/common.js');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function getUserComparisons(createIfEmpty = false, namesOnly = false, pageSize = 24, pageNumber = 1, includes = null, activeOnly = true, readOnly = false) {
    return function (dispatch, getState) {

        let guestUserID = "";
        if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
            guestUserID = CommonModule.getCookie("guestUserID");
        }

        $.ajax({
            url: '/comparison/getUserComparisons',
            type: 'GET',
            data: {
                namesOnly: namesOnly,
                pageSize: pageSize,
                pageNumber: pageNumber,
                includes: includes,
                guestUserID: guestUserID
            },
            success: function (result) {
                let comparisonList = [];

                if (result.TotalRecords > 0) {
                    result.Records.map(function (comparison) {
                        if (comparison.Active === activeOnly && comparison.ReadOnly === readOnly) {
                            comparisonList.push(comparison);
                        }
                    });
                }

                if (comparisonList.length === 0 && createIfEmpty === true) {
                    ajaxCreateComparison('Untitled', null, function (comparison) {
                        return dispatch({
                            type: actionTypes.GET_USER_COMPARISONS,
                            comparisonList: comparisonList.concat(comparison)
                        });
                    });
                }

                return dispatch({
                    type: actionTypes.GET_USER_COMPARISONS,
                    comparisonList: comparisonList,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getComparison(id, includes = null) {
    let guestUserID = "";
    if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
        guestUserID = CommonModule.getCookie("guestUserID");
    }
    return function (dispatch, getState) {
        $.ajax({
            url: '/comparison/getComparison',
            type: 'GET',
            data: {
                comparisonId: id,
                includes: includes,
                guestUserID: guestUserID
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_COMPARISON,
                    comparison: result
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createComparison(name, includes = null) {
    return function (dispatch, getState) {
        let comparisonList = getState().comparisonReducer.comparisonList;

        ajaxCreateComparison(name, includes, function (comparison) {
            comparison.UserID = null;
            window.sessionStorage.setItem('selectedComparison', comparison.Id);
            return dispatch({
                type: actionTypes.CREATE_COMPARISON,
                comparisonList: comparisonList.concat(comparison),
                comparison: comparison,
                comparisonToUpdate: {}
            });
        });
    };
}

function ajaxCreateComparison(name, includes, callback) {
    let guestUserID = "";
    if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
        guestUserID = CommonModule.getCookie("guestUserID");
    }

    $.ajax({
        url: '/comparison/createComparison',
        type: 'POST',
        data: {
            name: name,
            includes: includes,
            guestUserID: guestUserID
        },
        success: function (result) {
            if (result.AccessToken && result.AccessToken.UserId) {
                CommonModule.createCookie("guestUserID", result.AccessToken.UserId, 1);
            }
            if (typeof callback === 'function') {
                callback(result);
            }
         //   comparisonList = comparisonList.concat(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function editComparison(name, includes = null){
    return function (dispatch, getState) {
        let comparisonList = getState().comparisonReducer.comparisonList;
        let comparison = getState().comparisonReducer.comparison;
        let comparisonToUpdate = getState().comparisonReducer.comparisonToUpdate;

        $.ajax({
            url: '/comparison/editComparison',
            type: 'PUT',
            data: {
                comparisonId: comparisonToUpdate.ID,
                name: name,
                includes: includes
            },
            success: function (result) {
                comparisonList.map(function (comparison) {
                    if (comparison.ID === comparisonToUpdate.ID) {
                        comparison.Name = name;
                    }
                });

                comparison.Name = name;

                return dispatch({
                    type: actionTypes.EDIT_COMPARISON,
                    comparisonList: comparisonList,
                    comparison: comparison,
                    comparisonToUpdate: {}
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function setComparisonToUpdate(id) {
    return function (dispatch, getState) {
        let comparisonList = getState().comparisonReducer
            ? getState().comparisonReducer.comparisonList
            : getState().comparisonList;

        let selectedComparison = {};

        if (typeof id !== 'undefined') {
            comparisonList.map(function (comparison) {
                if (comparison.ID === id) {
                    selectedComparison = comparison;
                }
            });
        }

        return dispatch({
            type: actionTypes.SET_COMPARISON_TO_UPDATE,
            comparisonToUpdate: selectedComparison
        });
    };
}

function setComparisonDetailToUpdate(id) {
    return function (dispatch, getState) {
        let comparison = getState().comparisonReducer
            ? getState().comparisonReducer.comparison
            : getState().comparison;

        let selectedComparisonDetail = {};

        if (typeof id !== 'undefined') {
            (comparison.ComparisonDetails || []).map(function (detail) {
                if (detail.ID === id) {
                    selectedComparisonDetail = detail;
                }
            });
        }

        return dispatch({
            type: actionTypes.SET_COMPARISON_DETAIL_TO_UPDATE,
            comparisonDetailToUpdate: selectedComparisonDetail
        });
    };
}

function deleteComparisonDetail() {
    return function (dispatch, getState) {
        let updatedComparisonDetails = [];
        let comparison = getState().comparisonReducer
            ? getState().comparisonReducer.comparison
            : getState().comparison;

        let comparisonDetailToUpdate = getState().comparisonReducer
            ? getState().comparisonReducer.comparisonDetailToUpdate
            : getState().comparisonDetailToUpdate;

        $.ajax({
            url: '/comparison/deleteComparisonDetail',
            type: 'DELETE',
            data: {
                comparisonId: comparison.ID,
                comparisonDetailId: comparisonDetailToUpdate.ID
            },
            success: function (result) {
                comparison.ComparisonDetails.map(function (detail) {
                    if (detail.ID !== comparisonDetailToUpdate.ID) {
                        updatedComparisonDetails.push(detail);
                    }
                });

                comparison.ComparisonDetails = updatedComparisonDetails;

                return dispatch({
                    type: actionTypes.DELETE_COMPARISON_DETAIL,
                    comparison: comparison,
                    comparisonDetailToUpdate: {}
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createComparisonDetail(cartItemId, includes = null, comparisonFields) {
    return function (dispatch, getState) {
        let comparison = getState().comparisonReducer.comparison;

        let guestUserID = "";
        if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
            guestUserID = CommonModule.getCookie("guestUserID");
        }
        $.ajax({
            url: '/comparison/createComparisonDetail',
            type: 'POST',
            data: {
                comparisonId: comparison.ID,
                cartItemId: cartItemId,
                includes: includes,
                guestUserID: guestUserID,
                comparisonFields: JSON.stringify(comparisonFields)
            },
            success: function (result) {
                if (comparison.ComparisonDetails === null) {
                    comparison.ComparisonDetails = [];
                }

                comparison.ComparisonDetails = comparison.ComparisonDetails.concat(result);

                return dispatch({
                    type: actionTypes.CREATE_COMPARISON_DETAIL,
                    comparison: Object.assign({}, comparison)
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateComparisonDetail(cartItemId, quantity, subTotal, discountAmount, addOns) {
    return function (dispatch, getState) {
        let comparison = getState().comparisonReducer.comparison;

        comparison.ComparisonDetails.map(function (detail) {
            if (detail.CartItemID === cartItemId) {
                detail.CartItem.Quantity = quantity;
                detail.CartItem.SubTotal = subTotal;
                detail.CartItem.DiscountAmount = discountAmount;
                detail.CartItem.AddOns = addOns;
            }
        });

        return dispatch({
            type: actionTypes.UPDATE_COMPARISON_DETAIL,
            comparison: Object.assign({}, comparison)
        });
    }
}

function clearAllComparisonDetails() {
    return function (dispatch, getState) {
        let comparisonList = getState().comparisonReducer.comparisonList;
        let comparison = getState().comparisonReducer.comparison;
        let comparisonToUpdate = getState().comparisonReducer.comparisonToUpdate;
        let comparisonDetailsToUpdate = [];
        comparison.ComparisonDetails.map(function (detail) {
            comparisonDetailsToUpdate.push({
                'ID' : detail.ID,
                'Active' : false
            });
        });

        $.ajax({
            url: '/comparison/clearAllComparisonDetails',
            type: 'PUT',
            data: {
                comparisonId: comparisonToUpdate.ID,
                comparisonDetails: JSON.stringify(comparisonDetailsToUpdate),
                includes: null
            },
            success: function (result) {
                comparisonList.map(function (comparison) {
                    if (comparison.ID === comparisonToUpdate.ID) {
                        comparison.ComparisonDetails = [];
                    }
                });

                comparison.ComparisonDetails = [];

                return dispatch({
                    type: actionTypes.EDIT_COMPARISON,
                    comparisonList: comparisonList,
                    comparison: comparison,
                    comparisonToUpdate: {}
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createPurchaseDetail(cartItemIds, comparisonDetailId) {
    return function (dispatch, getState) {
        let comparisonId = getState().comparisonReducer.comparison.ID;

        $.ajax({
            url: '/comparison/validateComparisonDetails',
            type: 'POST',
            data: {
                comparisonId: comparisonId
            },
            success: function (result) {
                let proceed = true;

                if (result.updatedItems.length > 0) {
                    $("#modalUnableOrder #updatedItems").html('');
                    result.updatedItems.forEach(function (item) {
                        $("#modalUnableOrder #updatedItems").append("<div><strong>" + item + "</strong></div>")
                    });

                    $("#modalUnableOrder").modal("show");
                    proceed = false;
                } else if (result.errorMessage) {
                    toastr.error(result.errorMessage);
                    proceed = false;
                }

                if (proceed === true && getState().comparisonReducer.processing === false) {
                    $.ajax({
                        url: '/checkout/generate-invoice-number-by-cartitems',
                        type: 'POST',
                        data: { cartItemIds: cartItemIds, comparisonId: comparisonId, comparisonDetailId: comparisonDetailId },
                        success: function (result) {
                            if (result) {
                                window.location = "/checkout/one-page-checkout?invoiceNo=" + result.InvoiceNo + "&comparisonId=" + getState().comparisonReducer.comparison.ID;
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });
                    return dispatch({
                        type: actionTypes.SET_PROCESSING_COMPARISONDETAILS,
                        processing: true
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getComparisonByOrderId(id, includeInactive = null, includes = null) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/comparison/getComparisonByOrderId',
            type: 'GET',
            data: {
                orderId: id,
                includeInactive: includeInactive,
                includes: includes
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_COMPARISON,
                    comparison: result
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function generateComparisonFile(orderId) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/comparison/getComparisonSnapshot',
            type: 'POST',
            data: {
                orderId: orderId,
            },
            success: function (result) {
                window.open(result);

                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function editEvaluation(id, name, includes = null) {
    return function (dispatch, getState) {
        let comparison = [];

        let comparisonList = getState().comparisonReducer.comparisonList;

        //   let comparisonToUpdate = getState().comparisonReducer.comparisonToUpdate;
        $.ajax({
            url: '/comparison/editComparison',
            type: "PUT",
            data: {
                comparisonId: id,
                name: name,
                includes: includes
            },
            success: function (result) {
                const dateCreated = result.CreatedDateTime;
                comparisonList.Records.map(function (comparison) {
                    if (comparison.ID === id) {
                        comparison.Name = name;
                        comparison.CreatedDateTime = dateCreated;
                    }
                });

                return dispatch({
                    type: actionTypes.EDIT_EVALUATION,
                    comparison: comparisonList
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function setEvaluationToUpdate(id, name) {
    return function (dispatch, getState) {
        const comparisonList = getState().comparisonReducer.comparisonList;
        let selectedComparison = {};

        if (typeof id !== 'undefined') {
            comparisonList.Records.map(function (comparison) {
                if (comparison.ID === id) {
                    selectedComparison = Object.assign({}, comparison);
                    selectedComparison.Name = name;
                }
            });
        }

        return dispatch({
            type: actionTypes.SET_COMPARISON_TO_UPDATE,
            comparisonToUpdate: selectedComparison
        });
    };
}

function deleteEvaluation(Id, callback) {
    return function (dispatch, getState) {
        let comparison = getState().comparisonReducer.comparisonList;
        let updatedComparison = [];
        $.ajax({
            url: '/comparison/deleteComparison',
            type: 'DELETE',
            data: {
                comparisonId: Id,
            },
            success: function (result) {
                callback();
                return dispatch({
                    type: actionTypes.DELETE_EVALUATION,
                    comparison: comparison,
                    comparisonDetailToUpdate: {}
                });

            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createEvaluation(name, includes = null) {
    return function (dispatch, getState) {
        let comparison = [];
        comparison = getState().comparisonReducer.comparisonList;

        $.ajax({
            url: '/comparison/createComparison',
            type: 'POST',
            data: {
                name: name,
                includes: includes
            },
            success: function (result) {
                if (comparison === null) {
                    comparison = [];
                }
                //https://arcadier.atlassian.net/browse/ARC-8711
                comparison.Records = [result].concat(comparison.Records);
                comparison.TotalRecords ++
               // comparison.Records = comparison.Records.slice(0, comparison.PageSize);

                return dispatch({
                    type: actionTypes.CREATE_EVALUATION,
                    comparison: comparison,
                    comparisonToUpdate: {}
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });

    };
}

function reloadEvaluationListPage() {
    return function (dispatch) {
        $.ajax({
            url: '/comparison/load',
            type: "get",
            success: function (comparisons) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    comparisonList: comparisons

                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function goToPage(pageNo) {
    return function (dispatch) {
        $.ajax({
            url: '/comparison/paging',
            type: "get",
            data: {
                "pageNumber": pageNo
            },
            success: function (comparisons) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    comparisonList: comparisons
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function exportToPDF(comparisonId, emailAddress) {
    return function (dispatch, getState) {
        $.ajax({
            url: '/comparison/exportToPDF',
            type: 'POST',
            data: {
                comparisonId: comparisonId,
                emailAddress: emailAddress
            },
            success: function (result) {
                //window.open(result);
                return dispatch({
                    type: ''
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    getUserComparisons: getUserComparisons,
    getComparison: getComparison,
    createComparison: createComparison,
    editComparison: editComparison,
    setComparisonToUpdate: setComparisonToUpdate,
    createEvaluation: createEvaluation,
    editEvaluation: editEvaluation,
    deleteEvaluation: deleteEvaluation,
    reloadEvaluationListPage: reloadEvaluationListPage,
    setEvaluationToUpdate: setEvaluationToUpdate,
    setComparisonDetailToUpdate: setComparisonDetailToUpdate,
    deleteComparisonDetail: deleteComparisonDetail,
    createComparisonDetail: createComparisonDetail,
    updateComparisonDetail: updateComparisonDetail,
    clearAllComparisonDetails: clearAllComparisonDetails,
    createPurchaseDetail: createPurchaseDetail,
    getComparisonByOrderId: getComparisonByOrderId,
    generateComparisonFile: generateComparisonFile,
    goToPage: goToPage,
    exportToPDF: exportToPDF
}