'use strict';
const React = require('react');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class DepartmentList extends React.Component {
    constructor(props) {
        super(props)
    }
    
    onDeleteClick(id) {
        if (!this.props.isAuthorizedToDelete) return;
        const code = 'delete-consumer-approval-departments-api';
        this.props.validatePermissionToPerformAction(code, () => {        
            const target = $(".popup-area.item-remove-popup");
            const cover = $("#cover");

            target.fadeIn();
            cover.fadeIn();
            $(".my-btn.btn-saffron").attr('data-key', "item");
            $(".my-btn.btn-saffron").attr('data-id', id);
        });
    }

    handleUpdateBtnClick(id) {
        if (!this.props.isAuthorizedToEdit) return;
        const code = 'edit-consumer-approval-departments-api';
        this.props.validatePermissionToPerformAction(code, () => window.location.href = `/approval/departments/${id}`);   
    }

    renderDepartments() {
        if (this.props.departments && this.props.departments.TotalRecords && this.props.departments.TotalRecords > 0) {
            const { Records } = this.props.departments;
            if (Records && Records.length > 0) {
                return Records.map(dept => 
                    <tr className="account-row" data-key="item" data-id={dept.Id} key={dept.Id} >
                        <td data-th="Department Name"><a href="#">{dept.Name}</a></td>
                        <td className="text-center" data-th="No. of Workflow(s)">{dept.WorkflowCount}</td>
                        <td className="action-cell" data-th="Action">
                            <div className="item-actions action-inline">
                                <ul>
                                    <li>
                                        <PermissionTooltip isAuthorized={this.props.isAuthorizedToEdit} extraClassOnUnauthorized="icon-grey">
                                            <a onClick={() => this.handleUpdateBtnClick(dept.Id)} href="#"><i className="icon icon-edit"></i></a>
                                        </PermissionTooltip>
                                    </li>
                                    <li>
                                        <PermissionTooltip isAuthorized={this.props.isAuthorizedToDelete} extraClassOnUnauthorized="icon-grey">
                                            <a href="#" className="delete_item" data-id={dept.Id} onClick={() => this.onDeleteClick(dept.Id)}>
                                                <i className="fas fa-trash-alt" style={{ fontSize: '26px', color: '#999', textAlign: 'center' }}></i>
                                            </a>
                                        </PermissionTooltip>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                )
            }
        }
        return (
            <div className="empty-page-sec">
                <img src="/assets/images/emptypage/list-icon.svg" alt="empty page img" />
                <div className="empty-page-title">Nothing to see here.</div>
                <div className="empty-page-message">This is where a list of available added departments appears</div>
            </div>
        );
    }

	render() {
		return (
            <div className="subaccount-data-table table-responsive">
    			<table className="table order-data1 sub-account tbl-department">
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th className="text-center">No. of Workflow(s)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderDepartments()}
                    </tbody>
                </table>
            </div>
		);
	}
}

module.exports = DepartmentList;