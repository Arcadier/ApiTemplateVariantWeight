'use strict';

const React = require('react');
const PermissionTooltip = require('../../common/permission-tooltip');

class WorkflowHeading extends React.Component {
    getNumberOfEntries() {
        if (this.props.workflows) {
            return this.props.workflows.TotalRecords || 0;
        }
        return 0;
    }

    handleCreateWorkflowBtnClick() {
        if (!this.props.isAuthorizedToAdd) return;
        const code = 'add-consumer-approval-workflows-api';
        this.props.validatePermissionToPerformAction(code, () => window.location.href = '/approval/create-workflow');
    }

	render() {
		return (
			<div className="sc-upper">
				<div className="sc-u title-sc-u sc-u-mid full-width">
                    <span className="sc-text-big">
                    	Approval Workflow &nbsp;
                    	<a href="https://support.arcadier.com/hc/en-us" title="info here">
                    		<img src="/assets/images/Info.svg" />
                    	</a>
                    </span>
                    <small>{`${this.getNumberOfEntries()} entries`}</small>
                </div>
                <div className="sc-tops">
                    <PermissionTooltip isAuthorized={this.props.isAuthorizedToAdd} extraClassOnUnauthorized="icon-grey">
                        <a className="top-title" onClick={() => this.handleCreateWorkflowBtnClick()} href="#">
                        	<i className="fas fa-plus fa-fw" />
                        	Create new Approval Workflow
                        </a>
                    </PermissionTooltip>
                </div>
			</div>
		);
	}
}

module.exports = WorkflowHeading;