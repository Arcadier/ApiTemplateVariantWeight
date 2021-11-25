'use strict'
const React = require('react');

class SidebarNav extends React.Component {	
	
	renderSubAccountMenu() {
		return (
			<li className="has-sub">
				<a href="#">
					<i className="fas fa-key fa-fw" />
					<span>Sub Account</span>
				</a>
				<ul>
					<li>
						<a href="/subaccount/list">
							<i className="fas icon-spacer fa-fw" />
							<span>Account List</span>
						</a>
					</li>
					<li>
						<a href="/activity-logs">
							<i className="fas icon-spacer fa-fw" />
							<span>Activity Log</span>
						</a>
					</li>
					<li>
						<a href="/user-groups">
							<i className="fas icon-spacer fa-fw" />
							<span>User Groups</span>
						</a>
					</li>
					<li>
						<a href="/account-permissions">
							<i className="fas icon-spacer fa-fw" />
							<span>Account Permissions</span>
						</a>
					</li>
				</ul>
			</li>
		);
	}

	renderMerchantSubAccountMenu() {
		if (this.props.isMerchantSubAccountActive) {
			return (<li className="has-sub">
				<a href="#">
					<i className="fas fa-key fa-fw" />
					<span>Sub Account</span>
				</a>
				<ul>
					<li>
						<a href="/merchants/subaccount/list">
							<i className="fas icon-spacer fa-fw" />
							<span>Account List</span>
						</a>
					</li>
					<li>
						<a href="/merchants/activity-logs">
							<i className="fas icon-spacer fa-fw" />
							<span>Activity Log</span>
						</a>
					</li>
					<li>
						<a href="/merchants/user-groups/">
							<i className="fas icon-spacer fa-fw"></i>
							<span>User Groups</span>
						</a>
					</li>
					<li>
						<a href="/merchants/account-permissions">
							<i className="fas icon-spacer fa-fw" />
							<span>Account Permissions</span>
						</a>
					</li>
				</ul>
			</li>)
		}	
		return;
	}

	renderMerchantNav() {
		return (
			<ul className="sidebar-nav">
		        <li>
		            <a href="/merchants/dashboard">
		            	<i className="fas fa-tachometer-alt fa-fw" />
		            	<span>Dashboard</span>
		            </a>
		        </li>
		        <li>
		            <a href="/merchants/items">
			            <i className="fas fa-cubes fa-fw" />
			            <span>Inventory</span>
		            </a>
		        </li>
		        <li>
		            <a href="/merchants/upload">
		            	<i className="fas fa-plus fa-fw" />
		            	<span>Create new listing</span>
		            </a>
		        </li>
		        <li className="has-sub">
		            <a href="#">
		            	<i className="fas fa-file-alt fa-fw" />
		            	<span>Documents</span>
		            </a>
		            <ul>
	            		<li>
	                        <a active-on-route="/merchants/quotation" href="/merchants/quotation/list">
                            	<i className="fas icon-spacer fa-fw" /> 
                            	<span>Quotation</span>
                            </a>
                        </li>
		                <li>
		                    <a active-on-route="/merchants/order" href="/merchants/order/history">
		                    	<i className="fas icon-spacer fa-fw" />
		                    	<span>Purchase Order</span>
		                    </a>
		                </li>
		                <li>
                            <a active-on-route="/invoice" href="/merchants/invoice/list">
                            	<i className="fas icon-spacer fa-fw" />
                            	<span>Invoice</span>
                            </a>
                        </li>
		            </ul>
		        </li>
		        {this.renderMerchantSubAccountMenu()}
		        <li>
		            <a href="/delivery/settings">
		            	<i className="fas fa-shipping-fast fa-fw" />
		            	<span>Shipping</span>
		            </a>
		        </li>
	    	</ul>
	    )
	}

	renderApprovalMenu() {
    	const enabled = this.props.approvalSettings && this.props.approvalSettings.Enabled;
    	const navList = enabled ? (  
			<ul id="approval-nav-list">
                <li>
                    <a active-on-route="/approval/create-workflow" href="/approval/workflows"><i className="fas icon-spacer fa-fw"></i> <span>Workflow</span></a>
                </li>
                <li>
                    <a active-on-route="/approval/create-department" href="/approval/departments"><i className="fas icon-spacer fa-fw"></i> <span>Department</span></a>
                </li>
                <li>
                    <a href="/approval/settings"><i className="fas icon-spacer fa-fw"></i> <span>Settings</span></a>
                </li>
            </ul>
	    ) : null;
	    const link = enabled ? "#" : "/approval/settings";
        return (
        	<li className={ enabled ? "has-sub" : ''} id="approval-nav">
        		<a active-on-route="/approval" href={link}><i className="fas fa-check-circle fa-fw"></i> <span>Approval</span></a>
        		{navList}
        	</li>
        )
    }

	renderBuyerNav() {
		return (
			<ul className="sidebar-nav">
	            <li>
	                <a href="/">
	                	<i className="fas fa-home fa-fw"/>
	                	<span>Homepage</span>
	                </a>
	            </li>
	            <li className="has-sub">
	                <a href="#">
	                	<i className="fas fa-file-alt fa-fw" />
	                	<span>Documents</span>
	                </a>
	                <ul>
	                	<li>
	                        <a active-on-route="/quotation/" href="/quotation/list">
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Quotation</span>
	                        </a>
	                    </li>
	                    <li>
	                        <a active-on-route="/requisition/" href="/requisition/list">
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Requisition Order</span>
	                        </a>
	                    </li>
	                    <li>
	                        <a active-on-route="/purchase" href="/purchase/history">
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Purchase Order</span>
	                        </a>
	                    </li>
	                    <li>
	                        <a active-on-route="/receiving-note" href="/receiving-note/list">
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Receiving Notes</span>
	                        </a>
	                    </li>
	                    <li>
							<a active-on-route="/invoice" href="/invoice/list">
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Invoice</span>
	                        </a>
	                    </li>
	                </ul>
	            </li>
	           	{this.renderSubAccountMenu()}
				{this.renderApprovalMenu()}
	        </ul>
		);
	}

	render() {
		return (
			<React.Fragment>
				{
					typeof this.props.isMerchant !== 'undefined' ?
						this.props.isMerchant == true ? this.renderMerchantNav() : this.renderBuyerNav()
					: ''
				}

			</React.Fragment>
		)
	}
}

module.exports = SidebarNav;