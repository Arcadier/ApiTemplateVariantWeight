'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const DepartmentPageHeading = require('./heading');
const DepartmentPageFilter = require('./filter');
const DepartmentList = require('./list');
const DeleteDepartmentModal = require('./delete-department-modal');
const DepartmentPagination = require('../../common/pagination');

const { filterApprovalList, updateSearchFilters, deleteApprovalDepartment } = require('../../../redux/approvalActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class ApprovalDepartmentComponent extends React.Component {
	
	render() {
		const pagingInfo = {
			totalRecords: this.props.departments && this.props.departments.TotalRecords? this.props.departments.TotalRecords : 0,
			pageNumber: this.props.departments && this.props.departments.PageNumber ? parseInt(this.props.departments.PageNumber) : 1,
			pageSize: this.props.departments && this.props.departments.PageSize ? parseInt(this.props.departments.PageSize) : 20,
			goToPage: (pageNo) =>  this.props.filterApprovalWorkflowList(pagingInfo.pageSize, pageNo, "Departments"),
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
								<DepartmentPageHeading
									departments={this.props.departments}
									isAuthorizedToAdd={this.props.isAuthorizedToAdd}
									validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
								/>
								<DepartmentPageFilter  updateSearchFilters={this.props.updateSearchFilters} filterApprovalList={this.props.filterApprovalList} />
								<DepartmentList 
									departments={this.props.departments}
									isAuthorizedToEdit={this.props.isAuthorizedToEdit}
									isAuthorizedToDelete={this.props.isAuthorizedToDelete}
									validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
								/>
								<DepartmentPagination {...pagingInfo} />
							</div>
						</div>
					</div>
				</div>
				<DeleteDepartmentModal deleteApprovalDepartment={this.props.deleteApprovalDepartment} />
				<div id="cover" />
			</React.Fragment>
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		user: state.userReducer.user,
		departments: state.approvalReducer.departments,
		isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete
	};
}

function mapDispatchToProps(dispatch) {
	return {
		filterApprovalList: (pageSize, pageNumber, tableName) => dispatch(filterApprovalList(pageSize, pageNumber, tableName)),
		updateSearchFilters: (filters) => dispatch(updateSearchFilters(filters)),
		deleteApprovalDepartment: (rowID, callback) => dispatch(deleteApprovalDepartment(rowID, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
	}
};


const ApprovalDepartmentHome = 
	ReactRedux.connect(
		mapStateToProps,
		mapDispatchToProps,
	)(ApprovalDepartmentComponent);

module.exports = {
	ApprovalDepartmentHome,
	ApprovalDepartmentComponent,
};