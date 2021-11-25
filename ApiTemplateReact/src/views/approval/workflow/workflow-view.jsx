'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const BaseComponent = require('../../shared/base');
if (typeof window !== 'undefined') { var $ = window.$; }

class ApprovalWorkflowViewComponent extends BaseComponent {

	getNameOfApprover(userId) {
		if (this.props.subAccounts && this.props.subAccounts.TotalRecords &&  this.props.subAccounts.TotalRecords > 0) {
			const { Records } = this.props.subAccounts;
			const user =  Records.find(u => u.ID == userId);
			if (typeof user !== 'undefined' && user !== null && user.FirstName && user.LastName) {
				return `${user.FirstName} ${user.LastName}`
			}
		}
		return '';
	} 
	renderApprovers(arr) {
		let sorted = arr.sort((x, y) => y.IsCompulsory - x.IsCompulsory); 
		return (
			sorted.map((approver, index) => 
	    		<span key={index} className={approver.IsCompulsory? 'highlightted-user' : ''}>
	    			{`${this.getNameOfApprover(approver.UserID)}${index == sorted.length - 1 ? '' : ','}`}
	    			&nbsp;
	    		</span>
	    	) 
	    );
	}
	renderWorkflowDetails() {
        if (this.props.selectedWorkflow && this.props.selectedWorkflow.Values) {
        	const values = JSON.parse(this.props.selectedWorkflow.Values);
        	if (values && values.length > 0) {
        		return values.map((val, i) => 
					<tr className={`item-approver-${i}`} key={i}>
			            <td data-th="For Purchases Up To">
			            	<div className="item-price">
			            		{	
			            			val.MaximumPurchase && val.MaximumPurchase.Unlimited ? 
			            				'Unlimited' 
			            			: 
			            				this.renderFormatMoney(val.MaximumPurchase.Currency, val.MaximumPurchase.Amount)
			            		}
			            	</div>
			            </td>
			            <td data-th="Approval(s) Needed">{val.ApprovalsNeeded || 0}</td>
			            <td data-th="Approver(s)">
			                {
			                	val.Approvers && val.Approvers.length > 0 ?
			                		this.renderApprovers(val.Approvers)
				                	
				                :  <div className="bind-approver">-</div>
			                }
			            </td>
			            <td data-th="" />
			        </tr>
        		)
        	}
        }
        return;
	}

	render() {
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
								<div className="sc-upper">
			                        <div className="sc-u title-sc-u sc-u-mid full-width">
			                            <div className="nav-breadcrumb">
			                                <i className="fa fa-angle-left" />
			                                <a href="/approval/workflows"> Back</a>
			                            </div>
			                            <span className="sc-text-big">Approval Workﬂow</span>
			                        </div>
			                    </div>
			                    <div className="sassy-box no-border">
			                        <div className="sassy-box-content border">
			                            <div className="row">
			                                <div className="col-md-5">
			                                    <div className="form-group">
			                                        <label>Reason</label>
			                                        <input 
			                                        	type="text"
			                                        	className="sassy-control required"
			                                        	name="workflow_name"
			                                        	value={this.props.selectedWorkflow ? this.props.selectedWorkflow.Reason : ''}
			                                        	disabled
			                                        	readOnly 
			                                        />
			                                    </div>
			                                </div>
			                                <div className="clearfix" />
			                            </div>
			                            <div className="row">
			                                <div className="col-md-12">
			                                    <div className="sassy-table wrap-tbl-approver">
			                                        <table className="table approver-table">
			                                            <thead>
			                                                <tr>
			                                                    <th>For Purchases Up To</th>
			                                                    <th>Approval(s) Needed</th>
			                                                    <th>Approver(s) &nbsp;
			                                                    	<span className="compulsory-approver-txt">
			                                                    		*compulsory / veto approver is <span>highlighted</span>
			                                                    	</span>
			                                                    </th>
			                                                    <th />
			                                                </tr>
			                                            </thead>
			                                            <tbody>
			                                                {this.renderWorkflowDetails()}
			                                            </tbody>
			                                        </table>
			                                    </div>
			                                </div>
			                            </div>
			                        </div>
			                    </div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		user: state.userReducer.user,
		subAccounts: state.userReducer.subAccounts,
		selectedWorkflow: state.approvalReducer.selectedWorkflow
	}
}

function mapDispatchToProps(dispatch) {
	return {}
}


const ApprovalWorkflowViewHome = 
	ReactRedux.connect(
		mapStateToProps,
		mapDispatchToProps
	)(ApprovalWorkflowViewComponent);

module.exports = {
	ApprovalWorkflowViewHome,
	ApprovalWorkflowViewComponent,
};