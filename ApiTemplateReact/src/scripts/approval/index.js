'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'approval-settings') {
    const ApprovalSettingsHome = require('../../views/approval/settings/index').ApprovalSettingsHome;
    const store = Store.createApprovalStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ApprovalSettingsHome />
        </ReactRedux.Provider>,
        app
    );
} else if (window.APP === 'approval-department-list') {
	const ApprovalDepartmentHome = require('../../views/approval/department/index').ApprovalDepartmentHome;
 	const store = Store.createApprovalStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ApprovalDepartmentHome />
        </ReactRedux.Provider>,
        app
    );
} else if (window.APP === 'add-edit-approval-department') {
    const ApprovalDepartmentAddEditHome = require('../../views/approval/department/add-edit').ApprovalDepartmentAddEditHome;
    const store = Store.createApprovalStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ApprovalDepartmentAddEditHome />
        </ReactRedux.Provider>,
        app
    );
} else if (window.APP === 'approval-workflow-list') {
    const ApprovalWorkflowHome = require('../../views/approval/workflow/index').ApprovalWorkflowHome;
    const store = Store.createApprovalStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ApprovalWorkflowHome />
        </ReactRedux.Provider>,
        app
    );
} else if (window.APP === 'approval-workflow-view') {
    const ApprovalWorkflowViewHome = require('../../views/approval/workflow/workflow-view').ApprovalWorkflowViewHome;
    const store = Store.createApprovalStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ApprovalWorkflowViewHome />
        </ReactRedux.Provider>,
        app
    );
} else if (window.APP === 'add-approval-workflow') {
    const CreateApprovalWorkflowHome = require('../../views/approval/workflow/add').CreateApprovalWorkflowHome;
    const store = Store.createApprovalStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CreateApprovalWorkflowHome />
        </ReactRedux.Provider>,
        app
    );
}