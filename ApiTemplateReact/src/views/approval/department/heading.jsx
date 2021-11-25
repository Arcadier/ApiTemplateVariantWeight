'use strict';

const React = require('react');
const PermissionTooltip = require('../../common/permission-tooltip');

class DepartmentHeading extends React.Component {

    getNumOfEntries() {
        if (this.props.departments && this.props.departments.TotalRecords) {
            return this.props.departments.TotalRecords;
        }
        return 0;
    }

    handleCreateDepartmentBtnClick() {
        if (!this.props.isAuthorizedToAdd) return;
        const code = 'add-consumer-approval-departments-api';
        this.props.validatePermissionToPerformAction(code, () => window.location.href = '/approval/create-department');
    }

	render() {
		return (
			<div className="sc-upper">
				<div className="sc-u title-sc-u sc-u-mid full-width">
                    <span className="sc-text-big">
                    	Department &nbsp;
                    	<a href="https://support.arcadier.com/hc/en-us">
                    		<img src="/assets/images/Info.svg" />
                    	</a>
                    </span>
                    <small>{`${this.getNumOfEntries()} entries`}</small>
                </div>
                <div className="sc-tops">
                    <PermissionTooltip isAuthorized={this.props.isAuthorizedToAdd} extraClassOnUnauthorized="icon-grey">
                        <a className="top-title" onClick={() => this.handleCreateDepartmentBtnClick()} href="#">
                        	<i className="fas fa-plus fa-fw" />
                        	Create new Department
                        </a>
                    </PermissionTooltip>
                </div>
			</div>
		);
	}
}

module.exports = DepartmentHeading;