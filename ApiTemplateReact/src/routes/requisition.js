'use strict';
const express = require('express');
const React = require('react');
const reactDom = require('react-dom/server');
const client = require('../../sdk/client');
const Store = require('../redux/store');
const authenticated = require('../scripts/shared/authenticated');
const authorizedUser = require('../scripts/shared/authorized-user');

const requisitionRouter = express.Router();

const template = require('../views/layouts/template');
const RequisitionDetailComponent = require('../views/requisition/detail/index').RequisitionDetailComponent;
var RequisitionListComponent = require('../views/requisition/list/index').RequisitionListComponent;

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');
const editRequisitionDetailsCode = 'edit-consumer-requisition-order-details-api';

function getRequisitions(userID, filters, callback) {
    const options = {
        userID: userID,
        filterVm: filters
    }

    const promiseRequisitions = new Promise((resolve, reject) => {
        client.Requisitions.getUserRequisitions(options, function (err, requisitions) {
            resolve(requisitions);
        });
    });

    Promise.all([promiseRequisitions]).then((responses) => {
        const requisitionList = responses[0];
        callback(requisitionList);
    });
}

const viewRequisitionOrderDetailsData = {
    code: 'view-consumer-requisition-order-details-api',
    seoTitle: 'Requisition Details',
    renderSidebar: true,
};

requisitionRouter.get('/detail', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewRequisitionOrderDetailsData), function (req, res) {
	const requisitionId = req.query['id'];
	const { user } = req;
	if (!requisitionId || typeof requisitionId == 'undefined') return res.send('Requisition ID not found.');
    const promiseRequisitionDetails = new Promise((resolve, reject) => {
        const options = { userId: user.ID, requisitionId };
        client.Requisitions.getRequisitionById(options, function (err, result) {
            resolve(result);
        });
    });
    
    const promiseRequisitionApprovals = new Promise((resolve, reject) => {
        const pluginId = process.env.APPROVAL_PLUGIN;
        const query = [{
            Name: "RequisitionID",
            Operator: "equal",
            Value: requisitionId,
        }];
        const options = { pluginId, tableName: 'Approvals', query };
        client.CustomTables.searchCustomTable(options, function (err, result) {
            resolve(result);
        });
    })

    Promise.all([promiseRequisitionDetails, promiseRequisitionApprovals]).then(responses => {
        const requisitionDetail = responses[0];
        const approvals = responses[1];
        let isApprover = false;
        let hasApprovedOrRejected = false;
        let matchedFlow = null;
        let approver = null


        if (requisitionDetail && requisitionDetail.MetaData) {
            const meta = JSON.parse(requisitionDetail.MetaData);
            if (meta.Workflow) {
                const { Workflow } = meta;
                const flows = JSON.parse(Workflow.Values || {});
                const orderTotal = parseFloat(requisitionDetail.Orders[0].GrandTotal);
                for (let i = 0; i < flows.length; i++) {
                    let flow = flows[i];
                    const isUnlimited = flow && flow.MaximumPurchase.Unlimited;
                    const isAmountValid = flow && parseFloat(flow.MaximumPurchase.Amount) >= orderTotal;
                    if (isUnlimited || (!isUnlimited && isAmountValid)) {
                        matchedFlow = flow;
                        break;
                    } 
                }
                if (matchedFlow) {
                    const userID = user.AccountOwnerID && user.SubBuyerID? user.SubBuyerID : user.ID;
                    const { ApprovalsNeeded, Approvers } = matchedFlow;
                    // check if user is an approver based on workflow
                    approver = Approvers.find(u => u.UserID == userID);
                    if (typeof approver !== 'undefined') isApprover = true;

                    if (approvals && approvals.TotalRecords > 0 && isApprover) {
                        const approvalRecords = approvals.Records;

                        hasApprovedOrRejected = approvalRecords.filter(a => a.UserID == userID && (a.Status == 'Approved' || a.Status == 'Rejected')).length > 0;
                        const arr = approvalRecords.filter(a => a.Status == 'Approved');
                        let approvedRecords = [];
                        arr.reverse().map(el => {
                            if (!approvedRecords.find(a => a.UserID == el.UserID)) { 
                                approvedRecords.push(arr[arr.findIndex(u => u.UserID == el.UserID)]);
                            }
                        });
                        
                        if (hasApprovedOrRejected || ApprovalsNeeded == 0) {
                            isApprover = false;
                        }
                    }
                }
            }
        }

        let cartItemId = null;
        const cartIdExists = requisitionDetail 
            && requisitionDetail.Orders
            && requisitionDetail.Orders[0]
            && requisitionDetail.Orders[0].CartItemDetails
            && requisitionDetail.Orders[0].CartItemDetails[0]
            && requisitionDetail.Orders[0].CartItemDetails[0].ID;
        cartItemId =  cartIdExists ? requisitionDetail.Orders[0].CartItemDetails[0].ID : null;
        const promiseOffer = cartItemId ? 
            new Promise((resolve, reject) => 
                client.Chat.getOfferByCartItemId( {
                    userId: user.ID,
                    cartItemId: cartItemId,
                    isAccepted: null,
                    isDeclined: null
                }, function (err, result) {
                    resolve(result);
                })
            ) : null
        Promise.all([promiseOffer]).then(responses => {
            const pendingOffer = responses[0];
            getUserPermissionsOnPage(user, "Requisition Order Details", "Consumer", (pagePermissions) => {
                const appString = 'requisition-detail';
                const s = Store.createRequisitionStore({
                    userReducer: {
                        user,
                        pagePermissions: pagePermissions
                    },
                    requisitionReducer: {
                        requisitionDetail,
                        isApprover,
                        hasApprovedOrRejected,
                        flow: matchedFlow,
                        pendingOffer
                    },
                    orderDiaryReducer: {
                        selectedSection: 'Comments',
                    },
                    marketplaceReducer: {
                        locationVariantGroupId: req.LocationVariantGroupId
                    }
                });
                const reduxState = s.getState();
                const requisitionDetailApp = reactDom.renderToString(
                    <RequisitionDetailComponent 
                        requisitionDetail={requisitionDetail}
                        isApprover={isApprover}
                        hasApprovedOrRejected={hasApprovedOrRejected}
                        user={user}
                        selectedSection={'Comments'}
                        flow={matchedFlow}
                        pendingOffer={pendingOffer}
                        locationVariantGroupId={req.LocationVariantGroupId}
                        pagePermissions={pagePermissions}
                    />
                );

                let seoTitle = 'Requisition Detail';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                res.send(template('page-seller page-requisition-detail page-sidebar', seoTitle, requisitionDetailApp, appString, reduxState));
            });          
        });
    });
});

const viewRequisitionOrdersData = {
    code: 'view-consumer-requisition-orders-api',
    seoTitle: 'Requisition List',
    renderSidebar: true,
};

requisitionRouter.get('/list', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewRequisitionOrdersData), (req, res) => {
    const user = req.user;

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function (err, categories) {
            resolve(categories);
        });
    });

    getRequisitions(user.ID, null, function (data) {
        Promise.all([promiseCategories]).then((responses) => {
            const appString = 'requisition-list';
            const categories = responses[0];
            const filters = {
                requisitionNo: "",
                startDate: null,
                endDate: null,
                statuses: "",
                suppliers: "",
                PageSize: data.Requisitions.PageSize,
                PageNumber: data.Requisitions.PageNumber
            };
            data.Statuses.unshift({
                ID: 0,
                Name: "Select All"
            });
            data.Suppliers.unshift({
                ID: 0,
                Name: "Select All"
            });
            const s = Store.createRequisitionStore({
                userReducer: {
                    user: user
                },
                requisitionReducer: {
                    requisitionList: data.Requisitions,
                    categories: categories,
                    statuses: data.Statuses.map((item) => {
                        item.isChecked = false;
                        return item;
                    }), 
                    suppliers: data.Suppliers.map((item) => {
                        item.isChecked = false;
                        return item;
                    }),
                    filters: filters
                },
            });
            const reduxState = s.getState();
            const requisitionListApp = reactDom.renderToString(
                <RequisitionListComponent
                    requisitionList={data.Requisitions}
                    categories={categories}
                    statuses={data.Statuses.map((item, index) => {
                        item.isChecked = false;
                        return item;
                    })} 
                    suppliers={data.Suppliers.map((item) => {
                        item.isChecked = false;
                        return item;
                    })}
                    filters={filters}
                    user={user} />
            );

            let seoTitle = 'Requisition List';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-seller requisition-list page-sidebar', seoTitle, requisitionListApp, appString, reduxState));
        });
    });
});

requisitionRouter.get('/filter', authenticated, function (req, res) {
    const user = req.user;
    const filters = req.query;
    getRequisitions(user.ID, filters, function (requisitionList) {
        res.send({
            requisitionList: requisitionList
        });
    });
});

requisitionRouter.put('/update-requisition', authenticated, function (req, res) {
    const user = req.user;
    const requisitionId = req.body['requisitionId'];
    const status = req.body['requisitionStatus'];

    const promiseRequisition = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            ID: requisitionId,
            status: status
        };

        client.Requisitions.updateRequisition(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRequisition]).then((responses) => {
        const requisition = responses[0];
        res.send(requisition);
    });
});

requisitionRouter.put('/add-requisition-approval', authenticated, isAuthorizedToPerformAction(editRequisitionDetailsCode), function (req, res) {
    const { user } = req;
    if (!user) return res.send('User not found.')
    const requisitionId = req.body['requisitionId'];
    const status = req.body['requisitionStatus'];
    const requisitionMeta = req.body['metadata'];
    const flow = req.body['flow'];
    const userId = user && user.AccountOwnerID && user.SubBuyerID ? user.SubBuyerID : user.ID;
    const promiseAddUserApproval = new Promise((resolve, reject) => {
        const request = {
            RequisitionID: requisitionId,
            Status: status,
            UserID: userId
        };
        const options = {
            tableName: 'Approvals',
            pluginId: process.env.APPROVAL_PLUGIN,
            request,
        };
        client.CustomTables.createCustomTableRow(options, function (err, result) {
            resolve(result);
        })
    });

    Promise.all([promiseAddUserApproval]).then(responses => {
        const result = responses[0];
        const success = result && result.Id;
        const promiseRequisitionApprovals = new Promise((resolve, reject) => {
            const pluginId = process.env.APPROVAL_PLUGIN;
            const query = [{
                Name: "RequisitionID",
                Operator: "equal",
                Value: requisitionId,
            }];
            const options = { pluginId, tableName: 'Approvals', query };
            client.CustomTables.searchCustomTable(options, function (err, result) {
                resolve(result);
            });
        });
        Promise.all([promiseRequisitionApprovals]).then(responses => {
            const approvals = responses[0];
            let promiseUpdateRequisitionStatus = null;
            let statusUpdate = null;
            // update requisition status if user is last approver
            if (approvals && approvals.Records && flow && success) {
                const workflow = JSON.parse(flow);
                const { ApprovalsNeeded, Approvers } = workflow;
                const arr = approvals.Records.filter(a => a.Status == 'Approved');
                
                // filter in case of duplicate entries from same user
                let approvedRecords = [];
                arr.reverse().map(el => {
                    if (!approvedRecords.find(a => a.UserID == el.UserID)) { 
                        approvedRecords.push(arr[arr.findIndex(u => u.UserID == el.UserID)]);
                    }
                });
    
                const compulsoryApprovers = Approvers.filter(a => a.IsCompulsory == true).map(u => u.UserID);
                const hasAnyCompulsoryRejected = approvals.Records.filter(r => compulsoryApprovers.includes(r.UserID) && r.Status == 'Rejected').length > 0;
                const hasAllCompulsoryTookAction = compulsoryApprovers.every(user => approvals.Records.findIndex(a => a.UserID == user) !== -1);
                const hasAllCompulsoryApproved = compulsoryApprovers.every(user => approvedRecords.findIndex(a => a.UserID == user) !== -1);
                const hasAllTookAction = (Approvers.every(a => approvals.Records.findIndex(r => r.UserID == a.UserID) !== -1)) && hasAllCompulsoryTookAction;
    
                let toUpdateRequisitionStatus = false;
                const toRejectRequisition = hasAnyCompulsoryRejected || (hasAllTookAction && approvedRecords.length < ApprovalsNeeded);
                const toApproveRequisition = hasAllCompulsoryApproved && approvedRecords.length >= ApprovalsNeeded;
                
                if (toRejectRequisition || toApproveRequisition) {
                    toUpdateRequisitionStatus = true;
                    statusUpdate = toApproveRequisition ? 'Approved' : 'Rejected';
                }

                promiseUpdateRequisitionStatus = toUpdateRequisitionStatus && statusUpdate !== null ?
                    new Promise((resolve, reject) => 
                        client.Requisitions.updateRequisition({
                            userId: user.ID,
                            ID: requisitionId,
                            status: statusUpdate
                        }, function (err, result) {
                            resolve(result);
                        })
                    ) : null;
            }
            Promise.all([promiseUpdateRequisitionStatus]).then(responses => {
                const status = responses && responses[0] ? responses[0].Status : null
                res.send({ success, status });
            });
        });
    });
});

module.exports = requisitionRouter;