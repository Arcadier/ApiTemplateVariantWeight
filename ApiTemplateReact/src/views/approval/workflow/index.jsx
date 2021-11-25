'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../../../views/layouts/sidebar').SidebarLayoutComponent;

const WorkflowPageHeading = require('./heading');
const WorkflowPageFilter = require('./filter');
const WorkflowList = require('./list');
const WorkflowPagination = require('../../common/pagination');

const DeleteWorkflowModal = require('./delete-workflow-modal');
const { deleteApprovalWorkflow, filterApprovalList, updateSearchFilters } = require('../../../redux/approvalActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class ApprovalWorkflowComponent extends React.Component {
	render() {
		const pagingInfo = {
			totalRecords: this.props.workflows && this.props.workflows.TotalRecords? this.props.workflows.TotalRecords : 0,
			pageNumber: this.props.workflows && this.props.workflows.PageNumber ? parseInt(this.props.workflows.PageNumber) : 1,
			pageSize: this.props.workflows && this.props.workflows.PageSize ? parseInt(this.props.workflows.PageSize) : 20,
			goToPage: (pageNo) =>  this.props.filterApprovalList(pagingInfo.pageSize, pageNo, "Workflows"),
		};
		return (
			<React.Fragment>
				<div className="header mod" id="header-section">
					<HeaderLayoutComponent user={this.props.user} />
				</div>
				<aside className="sidebar" id="sidebar-section">
					<SidebarLayoutComponent user={this.props.user} />
				</aside>
				<div className="main-content footer_fixed">
					<div className="main">
						<div className="orderlist-container">
							<div className="container-fluid">
								<WorkflowPageHeading 
									workflows={this.props.workflows}
									isAuthorizedToAdd={this.props.isAuthorizedToAdd}
									validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
								/>
								<WorkflowPageFilter  updateSearchFilters={this.props.updateSearchFilters} filterApprovalList={this.props.filterApprovalList} />
								<WorkflowList
									workflows={this.props.workflows}
									isAuthorizedToDelete={this.props.isAuthorizedToDelete}
									validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
								/>
								<WorkflowPagination {...pagingInfo} />
							</div>
						</div>
					</div>
				</div>
				<DeleteWorkflowModal deleteWorkflow={this.props.deleteApprovalWorkflow} />
				<div id="cover" />
			</React.Fragment>
		)
	}
}


function mapStateToProps(state, ownProps) {
	return {
		user: state.userReducer.user,
		workflows: state.approvalReducer.workflows,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete
	}
}

function mapDispatchToProps(dispatch) {
	return {
		deleteApprovalWorkflow: (id, callback) => dispatch(deleteApprovalWorkflow(id, callback)),
		filterApprovalList: (pageSize, pageNumber, tableName) => dispatch(filterApprovalList(pageSize, pageNumber, tableName)),
		updateSearchFilters: (filters) => dispatch(updateSearchFilters(filters)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
	}
}

const ApprovalWorkflowHome = 
	ReactRedux.connect(
		mapStateToProps,
		mapDispatchToProps
	)(ApprovalWorkflowComponent);

module.exports = {
	ApprovalWorkflowHome,
	ApprovalWorkflowComponent
};