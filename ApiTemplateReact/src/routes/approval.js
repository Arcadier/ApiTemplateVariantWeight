'use strict';
const express = require('express');
const React = require('react');
const reactDom = require('react-dom/server');
const client = require('../../sdk/client');
const Store = require('../redux/store');
const authenticated = require('../scripts/shared/authenticated');
const authorizedUser = require('../scripts/shared/authorized-user');

const approvalRouter = express.Router();

const template = require('../views/layouts/template');
const ApprovalSettingsComponent = require('../views/approval/settings/index').ApprovalSettingsComponent;
const ApprovalDepartmentComponent = require('../views/approval/department/index').ApprovalDepartmentComponent;
const ApprovalDepartmentAddEditComponent = require('../views/approval/department/add-edit').ApprovalDepartmentAddEditComponent;
const ApprovalWorkflowComponent = require('../views/approval/workflow/index').ApprovalWorkflowComponent;
const CreateApprovalWorkflowComponent = require('../views/approval/workflow/add').CreateApprovalWorkflowComponent;
const ApprovalWorkflowViewComponent = require('../views/approval/workflow/workflow-view').ApprovalWorkflowViewComponent

const { 
    getUserPermissionsOnPage,
    isAuthorizedToAccessViewPage,
    isAuthorizedToPerformAction
} = require('../scripts/shared/user-permissions');

function getApprovalSettings(userId, callback) {
    const tableName = 'Settings';
    const pluginId = process.env.APPROVAL_PLUGIN;

    if (typeof pluginId == 'undefined' || !pluginId || process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
        callback({ Enabled: false });
    } else {
    
        const promiseApprovalSettings = new Promise((resolve, reject) => {
            const options = {
                pluginId,
                tableName,
                query: [{ Name: "UserID", Operator: "equal", Value: userId }],
            }

            client.CustomTables.searchCustomTable(options, function (err, settings) {
                resolve(settings);
            });
        });

        Promise.all([ promiseApprovalSettings ]).then(responses => {
            const approvalSettings = responses[0];
            if (approvalSettings.TotalRecords == 0) {
                const request = {
                    UserID: userId,
                    Enabled: 0
                };
                const options = { pluginId, tableName, request };
                const promiseCreateApprovalSettings = new Promise((resolve, reject) => {
                    client.CustomTables.createCustomTableRow(options, function (err, result) {
                        resolve(result);
                    });
                });

                Promise.all([promiseCreateApprovalSettings]).then(responses => {
                    const settings = responses[0];
                    if (settings) {
                        const isEnabled = settings && settings.Enabled == 1;
                        callback({ ID: settings.Id, Enabled: isEnabled });
                    } else {
                        callback({Enabled: false });
                    }
                });
            } else {
                if (approvalSettings !== null && approvalSettings.Records && approvalSettings.Records[0]) {
                    callback({ ID: approvalSettings.Records[0].Id, Enabled: approvalSettings.Records[0].Enabled == 1 });
                } else {
                    callback({Enabled: false });
                }
            }
        });
    }
}

function approvalEnabled(req, res, next) {
    if (process.env.CHECKOUT_FLOW_TYPE == 'b2b') {
        getApprovalSettings(req.user.ID, function (settings) {
            if (settings.Enabled)  return next();
            return res.redirect('/approval/settings');
        });
    } else  return res.redirect('/');
}

function getApprovalContents(userId, filters = null, tableName, callback) {
    const pluginId = process.env.APPROVAL_PLUGIN;
    const query = [{
        Name: "UserID",
        Operator: "equal",
        Value: userId,
    }];
    if (tableName == "Workflows") {
        query.push({
            Name: "Active",
            Operator: "equal",
            Value: 1,
        });
    }
    if (filters) {
        let { keyword, min, max, custom } = filters;
        if (typeof keyword !== 'undefined' && keyword !== null && keyword.trim().length > 0) {
            query.push({
                Name: tableName === 'Workflows' ? "Reason" : "Name",
                Operator: "like",
                Value: keyword.trim(),
            });
        }

        if (typeof min !== undefined && min !== null){ 
            min = parseInt(min);
            if (min > 0) {
                query.push({ 
                    Name: "WorkflowCount",
                    Operator: "gte",
                    Value: parseInt(min),
                });
            }
        }

        if (typeof max !== 'undefined' && max !== null) {
            max = parseInt(max);
            if (max > 0) {
                query.push({ 
                    Name: "WorkflowCount",
                    Operator: "lte",
                    Value: parseInt(max),
                });
            }
        }
        if (custom && custom.Name && custom.Operator && custom.Value) {
            query.push(custom);
        }
    }

    const options = { pluginId, tableName, query };
    const promiseApprovalContents = new Promise((resolve, reject) => {
        client.CustomTables.searchCustomTable(options, function (err, result) {
            resolve(result);
        })
    });
    Promise.all([promiseApprovalContents]).then(responses => {
        let results = responses[0];
        callback(results);
    });    
}

function paginate(array, pageSize, pageNumber) {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

function sortAndPaginateData(data, sortKey, pageSize = 20, pageNumber = 1) {
    if (data && data.TotalRecords && data.TotalRecords > 0) {
        if (data.Records && data.Records.length > 0) {
            let formattedData = paginate(data.Records, pageSize, pageNumber);
            if (sortKey && sortKey.length > 0) formattedData = formattedData.sort((a, b) => a[sortKey].localeCompare(b[sortKey]))
            data.Records = formattedData;
            data.PageNumber = pageNumber;
            data.PageSize = pageSize;
        }
    }
    return data;
}

const viewApprovalSettingsData = {
    code: 'view-consumer-approval-settings-api',
    seoTitle: 'Approval Settings',
    renderSidebar: true,
};

const viewApprovalWorkflowsData = {
    code: 'view-consumer-approval-workflows-api',
    seoTitle: 'Approval Workflow List',
    renderSidebar: true,
}

const viewCreateApprovalWorkflowData = {
    code: 'view-consumer-create-approval-workflow-api',
    seoTitle: 'Create Approval Workflow',
    renderSidebar: true,
}

const viewApprovalWorkflowDetailsData = {
    code: 'view-consumer-approval-workflow-details-api',
    seoTitle: 'Approval Workflow',
    renderSidebar: true,
}

const viewApprovalDepartmentsData = {
    code: 'view-consumer-approval-departments-api',
    seoTitle: 'Approval Department List',
    renderSidebar: true,
}

const viewCreateApprovalDepartmentData = {
    code: 'view-consumer-create-approval-department-api',
    seoTitle: 'Add/Edit Approval Department',
    renderSidebar: true,
}

const editApprovalSettingsCode = 'edit-consumer-approval-settings-api';
const deleteApprovalWorkflowsCode = 'delete-consumer-approval-workflows-api';
const addCreateApprovalWorkflowCode = 'add-consumer-create-approval-workflow-api';
const addCreateApprovalDepartmentCode = 'add-consumer-create-approval-department-api';
const deleteApprovalDepartmentsCode = 'delete-consumer-approval-departments-api';

/* settings */

approvalRouter.get('/settings', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewApprovalSettingsData), function (req, res) {
    getApprovalSettings(req.user.ID, function (settings) {
        getUserPermissionsOnPage(req.user, 'Approval Settings', 'Consumer', (pagePermissions) => {
            const store = Store.createApprovalStore({
                userReducer: { 
                    user: req.user,
                    pagePermissions: pagePermissions
                },
                approvalReducer: {
                    settings,
                }
            });

            const reduxState = store.getState();
            const props = { 
                user: req.user,
                pagePermissions,
                settings
            };
            const approvalSettings = reactDom.renderToString(<ApprovalSettingsComponent  {...props} />);
            let seoTitle = 'Approval Settings';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }
            res.send(template('page-seller approval-settings page-sidebar', seoTitle, approvalSettings, 'approval-settings', reduxState));
        });
    });
});

approvalRouter.put('/settings', authenticated, isAuthorizedToPerformAction(editApprovalSettingsCode), function (req, res) {

    if (!req.body.rowId) return res.send({ success: false });
    const rowID =  req.body.rowId;
    const request = {
        Enabled: req.body.enabled == 'true'? 1 : 0,
    }
    const options = {
        tableName: 'Settings',
        pluginId: process.env.APPROVAL_PLUGIN,
        request,
        rowID,
    }

    const promiseUpdateSettings = new Promise((resolve, reject) => {
        client.CustomTables.updateCustomTableRow(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdateSettings]).then(responses => {
        const result = responses[0];
        res.send({ 
            success: true,
            data: { 
                ID: result.Id,
                Enabled: result && result.Enabled == 1 
            }
        });
    });
});

approvalRouter.get('/getApprovalsettings', authenticated, function (req, res) {
    getApprovalSettings(req.user.ID, function (settings) {
        res.send(settings);
    });
});

approvalRouter.get('/search', authenticated, approvalEnabled, function (req, res) {
    const user = req.user;
    const table = req.query.tableName || "Workflows";
    getApprovalContents(user.ID, req.query, table, function (results) {
        let { pageSize = 20, pageNumber = 1 } = req.query;
        if (results && results.TotalRecords > 0) {
            if (results.TotalRecords <= pageSize) pageNumber = 1;
            pageSize = parseInt(pageSize);
            pageNumber = parseInt(pageNumber);
            const key = table == "Workflows" ? "Reason" : "Name";
            results = sortAndPaginateData(results, key, pageSize, pageNumber);
        }
        res.send(results);
    });
});

/* department */ 

approvalRouter.get('/departments', authenticated, authorizedUser, approvalEnabled, isAuthorizedToAccessViewPage(viewApprovalDepartmentsData), function (req, res) {
    const user = req.user;
    const table = "Departments";
    getApprovalContents(user.ID, null, table, function (departments) {
        const sortBy = "Name";
        departments = sortAndPaginateData(departments, sortBy);
        getUserPermissionsOnPage(user, 'Approval Departments', 'Consumer', (pagePermissions) => {
            const store = Store.createApprovalStore({
                userReducer: { 
                    user,
                    pagePermissions
                },
                approvalReducer: {
                    departments,
                }
            });
            const reduxState = store.getState();
            const props = { 
                user,
                departments,
                pagePermissions
            };
            const approvalDepartment = reactDom.renderToString(<ApprovalDepartmentComponent  {...props} />);
            let seoTitle = 'Approval Department List';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }
            res.send(template('page-seller department-list page-sidebar', seoTitle, approvalDepartment, 'approval-department-list', reduxState));
        });
        
    });
});

approvalRouter.get('/create-department', authenticated, approvalEnabled, isAuthorizedToAccessViewPage(viewCreateApprovalDepartmentData), function (req, res) {
    const user = req.user;
    const table = "Workflows";
    getApprovalContents(user.ID, null, table, function (workflows) {
        getUserPermissionsOnPage(user, 'Create Approval Department', 'Consumer', (pagePermissions) => {
            const store = Store.createApprovalStore({
                userReducer: { 
                    user,
                    pagePermissions
                },
                approvalReducer: {
                    workflows
                }
            });

            const reduxState = store.getState();
            const props = { 
                user,
                workflows,
                pagePermissions
            };

            const approvalDepartmentAddEdit = reactDom.renderToString(<ApprovalDepartmentAddEditComponent  {...props} />);
            let seoTitle = 'Add/Edit Approval Department';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }
            res.send(template('page-seller page-department page-sidebar', seoTitle, approvalDepartmentAddEdit, 'add-edit-approval-department', reduxState));
        });
        
    });
});

approvalRouter.post('/create-department', authenticated, approvalEnabled, isAuthorizedToPerformAction(addCreateApprovalDepartmentCode), function (req, res) {
    const user = req.user;
    const { Name, WorkflowID, WorkflowCount } = req.body;
    const promiseCreateApprovalDepartment = new Promise((resolve, reject) => {
        const request = {
            Name,
            WorkflowID,
            WorkflowCount,
            UserID: user.ID,
        };
        const options = {
            tableName: 'Departments',
            pluginId: process.env.APPROVAL_PLUGIN,
            request,
        };
        client.CustomTables.createCustomTableRow(options, function (err, result) {
            resolve(result);
        })
    });
    Promise.all([ promiseCreateApprovalDepartment ]).then(responses => {
        const result = responses[0];
        const success = result && result.Id;
        res.send({ success });
    });
});

approvalRouter.get('/departments/:id', authenticated, approvalEnabled, isAuthorizedToAccessViewPage(viewCreateApprovalDepartmentData), function (req, res) {
    const user = req.user;
    if (req.params.id == 'undefined') return next();
    const promiseDepartment = new Promise((resolve, reject) => {
        const options = {
            rowId: req.params.id,
            tableName: 'Departments',
            pluginId: process.env.APPROVAL_PLUGIN,
        }
        client.CustomTables.getCustomTableContents(options, function(err, result){
            resolve(result);
        });
    });

    Promise.all([promiseDepartment]).then(responses => {
        const result = responses[0];
        if (result && result.TotalRecords === 0) return res.redirect('/approval/departments');
        const selectedDepartment = result.Records[0];
        const table = "Workflows";
        getApprovalContents(user.ID, null, table, function (workflows) {
            getUserPermissionsOnPage(user, 'Create Approval Department', 'Consumer', (pagePermissions) => {

                const store = Store.createApprovalStore({
                    userReducer: { 
                        user,
                        pagePermissions
                    },
                    approvalReducer: {
                        workflows,
                        selectedDepartment,
                    }
                });

                const reduxState = store.getState();
                const props = { 
                    user,
                    workflows,
                    selectedDepartment,
                    pagePermissions
                };

                const approvalDepartmentAddEdit = reactDom.renderToString(<ApprovalDepartmentAddEditComponent  {...props} />);
                let seoTitle = 'Add/Edit Approval Department';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }
                res.send(template('page-seller page-department page-sidebar', seoTitle, approvalDepartmentAddEdit, 'add-edit-approval-department', reduxState));
            });
        });
    });
});

approvalRouter.put('/departments/:id', authenticated, approvalEnabled, isAuthorizedToPerformAction(addCreateApprovalDepartmentCode), function (req, res) {
    const user = req.user;
    if (req.params.id == 'undefined') return next();
    const { Name, WorkflowCount, WorkflowID } = req.body;
    const promiseUpdateDepartment = new Promise((resolve, reject) => {
        const request = {
            Name,
            WorkflowCount,
            WorkflowID, 
            UserID: user.ID, 
        };
        const options = {
            tableName: 'Departments',
            rowID: req.params.id,
            request,
            pluginId: process.env.APPROVAL_PLUGIN
        };

        client.CustomTables.updateCustomTableRow(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdateDepartment]).then(responses => {
        const result = responses[0];
        const success = result && result.Id;
        res.send({ success });
    });
});

approvalRouter.delete('/departments/:id', authenticated, approvalEnabled, isAuthorizedToPerformAction(deleteApprovalDepartmentsCode), function(req, res, next) {
    const user = req.user;
    if (req.params.id == 'undefined') return next();
    const promiseDeleteDepartment = new Promise((resolve, reject) => {
        const options = {
            pluginId: process.env.APPROVAL_PLUGIN,
            tableName: 'Departments',
            rowID: req.params.id,
        }
        client.CustomTables.deleteCustomTableRow(options, function(err, result) {
            resolve(result);
        });
    });
    Promise.all([promiseDeleteDepartment]).then(responses => {
        const deleteResult = responses[0];
        res.send({ success: deleteResult && deleteResult.Id });
    });
});

/* workflows */ 
approvalRouter.get('/workflows', authenticated, authorizedUser, approvalEnabled, isAuthorizedToAccessViewPage(viewApprovalWorkflowsData), function (req, res) {
    const user = req.user;
    const table = "Workflows";
    getApprovalContents(user.ID, null, table, function (workflows) {
        const sortBy = "Reason";
        workflows = sortAndPaginateData(workflows, sortBy);
        getUserPermissionsOnPage(user, 'Approval Workflows', 'Consumer', (pagePermissions) => {
            const store = Store.createApprovalStore({
                userReducer: { 
                    user,
                    pagePermissions
                },
                approvalReducer: {
                    workflows
                }
            });

            const reduxState = store.getState();
            const props = { 
                user: user,
                workflows,
                pagePermissions
            };

            const approvalWorkflow = reactDom.renderToString(<ApprovalWorkflowComponent  {...props} />);
            let seoTitle = 'Approval Workflow List';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }
            res.send(template('page-seller workflow-list page-sidebar', seoTitle, approvalWorkflow, 'approval-workflow-list', reduxState));
        });
    });       
});

approvalRouter.get('/create-workflow', authenticated, approvalEnabled, isAuthorizedToAccessViewPage(viewCreateApprovalWorkflowData), function (req, res) {
    const user = req.user;
    const promiseSubAccounts = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            pageSize: 60,
            pageNumber: 1,
            keyword: '',
            includes: 'AccountOwner'
        }
        client.Users.getSubAccounts(options, function (err, subaccounts) {
            resolve(subaccounts);
        });
    });
    Promise.all([ promiseSubAccounts ]).then(responses => {
        const subAccounts = responses[0];
        getUserPermissionsOnPage(user, 'Create Approval Workflow', 'Consumer', (pagePermissions) => {
            const store = Store.createApprovalStore({
                userReducer: { 
                    user,
                    subAccounts,
                    pagePermissions
                },
                approvalReducer: {
                    currencyCode: req.CurrencyCode
                }
            });

            const reduxState = store.getState();
            const props = { 
                user,
                subAccounts,
                pagePermissions,
                currencyCode: req.CurrencyCode
            };
            const createApprovalWorkflow = reactDom.renderToString(<CreateApprovalWorkflowComponent  {...props} />);
            let seoTitle = 'Create Approval Workflow';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }
            res.send(template('page-seller workflow-list page-sidebar', seoTitle, createApprovalWorkflow, 'add-approval-workflow', reduxState));
        });
    });
});

approvalRouter.post('/create-workflow', authenticated, approvalEnabled, isAuthorizedToPerformAction(addCreateApprovalWorkflowCode), function (req, res) {
    const user = req.user;
    const { Reason, Workflows, WorkflowCount } = req.body;
    const promiseCreateApprovalWorkflow = new Promise((resolve, reject) => {
        const request = {
            Reason,
            WorkflowCount: parseInt(WorkflowCount),
            Values: Workflows,
            UserID: user.ID,
            Active: 1,
        };
        const options = {
            tableName: 'Workflows',
            pluginId: process.env.APPROVAL_PLUGIN,
            request
        }
        client.CustomTables.createCustomTableRow(options, function (err, result) {
            resolve(result);
        });
    })
    Promise.all([promiseCreateApprovalWorkflow]).then(responses => {
        const result = responses[0];
        if (result && result.Id) {
            return res.send({ success: true });
        }
        return res.send({ success: false, message: 'Something went wrong.' })
    });
});

approvalRouter.put('/workflows/:id', authenticated, approvalEnabled, isAuthorizedToPerformAction(deleteApprovalWorkflowsCode),function(req, res, next) {
    const user = req.user;
    if (req.params.id == 'undefined') return next();
    const promiseDeleteWorkflow = new Promise((resolve, reject) => {
        const options = {
            pluginId: process.env.APPROVAL_PLUGIN,
            tableName: 'Workflows',
            rowID: req.params.id,
            request: { Active: 0 },
        }
        client.CustomTables.updateCustomTableRow(options, function(err, result) {
            resolve(result);
        });
    });
    Promise.all([promiseDeleteWorkflow]).then(responses => {
        const deleteResult = responses[0];
        const success = deleteResult && deleteResult.Id && deleteResult.Active == 0;
        if (!success) return res.send({ success });
        const filters = { custom: { Name: 'WorkflowID', Operator: 'like', Value: req.params.id } };
        getApprovalContents(user.ID, filters, "Departments", function (departments) {
            if (departments && departments.TotalRecords && departments.TotalRecords > 0) {
                const { Records } = departments;
                const deletedWorkflowID = req.params.id;
                const options = { pluginId: process.env.APPROVAL_PLUGIN, tableName: "Departments" };
                if (Records && Records.length > 0) {
                    const promiseUpdateAffectedDept = (rec) => 
                        new Promise((resolve, reject) => {
                            const delimeter = rec.WorkflowCount > 1 ? "," : "";
                            options.request = {
                                WorkflowID: rec.WorkflowID.replace(`${delimeter}${deletedWorkflowID}`, ''),
                                WorkflowCount: rec.WorkflowCount - 1,
                            }
                            options.rowID = rec.Id;
                            client.CustomTables.updateCustomTableRow(options, function(err, result) {
                                resolve(result);
                            });
                        });
                    
                    
                    const promiseUpdateAllAffectedDepts = Promise.all(Records.map(r => promiseUpdateAffectedDept(r)));
                    Promise.all([promiseUpdateAllAffectedDepts]).then(response => {
                        res.send({ success });
                    });
                }
            } else res.send({ success });
        });    
    });
});

approvalRouter.get('/workflows/:id', authenticated, approvalEnabled, isAuthorizedToAccessViewPage(viewApprovalWorkflowDetailsData), function (req, res, next) {
    const user = req.user;
    if (req.params.id == 'undefined') return next();

    const promiseSubAccounts = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            pageSize: 100,
            pageNumber: 1,
            keyword: '',
            includes: 'AccountOwner'
        }
        client.Users.getSubAccounts(options, function (err, subaccounts) {
            resolve(subaccounts);
        });
    });

    const promiseWorkflow = new Promise((resolve, reject) => {
        const options = {
            rowId: req.params.id,
            tableName: 'Workflows',
            pluginId: process.env.APPROVAL_PLUGIN,
        }
        client.CustomTables.getCustomTableContents(options, function(err, result){
            resolve(result);
        });
    });

    Promise.all([promiseSubAccounts, promiseWorkflow]).then(responses => {
        const subAccounts = responses[0];
        const workflow = responses[1];
        const isActive = workflow.Records && workflow.Records[0] && workflow.Records[0].Active == 1;
        if ((workflow && workflow.TotalRecords == 0) || !workflow || !isActive) return res.redirect('/approval/workflows');
        const store = Store.createApprovalStore({
            userReducer: { user, subAccounts },
            approvalReducer: {
                selectedWorkflow: workflow.Records[0]
            }
        });

        const reduxState = store.getState();
        const props = { 
            user: user,
            selectedWorkflow: workflow.Records[0],
            subAccounts
        };
        const approvalWorkflowView = reactDom.renderToString(<ApprovalWorkflowViewComponent  {...props} />);
        let seoTitle = 'Approval Workflow';
        if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }
        res.send(template('page-seller workflow-list page-sidebar', seoTitle, approvalWorkflowView, 'approval-workflow-view', reduxState));
    });  
});

module.exports = { getApprovalSettings, approvalRouter };