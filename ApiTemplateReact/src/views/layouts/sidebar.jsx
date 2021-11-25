'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const marketplaceActions = require('../../redux/marketplaceActions');
const approvalActions = require('../../redux/approvalActions');
const commonModule = require('../../public/js/common');
//const SidebarNav = require(`../features/checkout_flow_type/${process.env.CHECKOUT_FLOW_TYPE}/layouts/sidebar-nav`);

const SidebarNav = require("../features/checkout_flow_type/" + process.env.CHECKOUT_FLOW_TYPE + "/layouts/sidebar-nav");
if (typeof window !== 'undefined') {
    const $ = window.$;
}

class SidebarLayoutComponent extends React.Component {

	componentWillMount() {
		if (typeof this.props.loadApprovalSettings == 'function' 
			&& (typeof this.props.approvalSettings == 'undefined' 
				|| !this.props.approvalSettings || !this.props.approvalSettings.ID)
		) {
			this.props.loadApprovalSettings();
		}
	}

	componentDidMount() {
		if ((this.props.logoUrl == '' || typeof this.props.logoUrl == 'undefined' || !this.props.logoUrl) && typeof this.props.loadMarketplaceInfo == 'function') {
			const self = this;
			this.props.loadMarketplaceInfo();
		}
		
	}

	componentDidUpdate() {
		commonModule.initSidebar();
		$("ul.sidebar-nav li > a").each(function(index, anchor) {
			const path = $(anchor).attr('href');
			const routesIncluded = $(anchor).attr('active-on-route');
			if (window && window.location) {
				const isHome = (path === "/" && window.location.pathname == path)
				if (isHome || (path !== "/" && (window.location.pathname.startsWith(path) 
					|| (routesIncluded && window.location.pathname.startsWith(routesIncluded))))
				) {
					$(anchor).parent().addClass('active');
					if ($(anchor).parent().closest('.has-sub').length > 0) {
						$(anchor).parent().closest('.has-sub').addClass('active');
					}
				}
			}
		});
	}
	
    isMerchant() {
    	return this.props.user 
    		&& this.props.user.Roles && this.props.user.Roles.length > 0 
			&& (this.props.user.Roles.includes('Submerchant') || this.props.user.Roles.includes('Merchant'));
    }

    renderHomepageUrl() {
        if (this.props.homepageUrl) {
            if (this.props.homepageUrl.startsWith('http')) {

                return this.props.homepageUrl;
            }

            return process.env.PROTOCOL + '://' + this.props.homepageUrl;
        }

        return '/';
    }

    renderTagline() {
    	if (this.isMerchant()) {
			return (<div className="site-tagline"><a href="/merchants/dashboard">Supplier Portal</a></div>);
    	}
    	return '';
    }

	render() {
		let isMerchant = this.isMerchant();
		if (this.props.user && this.props.user.isBuyerSideBar === true) {
			isMerchant = false;
		}
		return (
			<React.Fragment>
		        <div className="sidebar-adjust">
		            <a href="#" className="sidebar-action"></a>
		            <div className="sidebar-wrapper">
		                <div className={`sidebar-brand ${this.isMerchant() ? 'underline' : ''}`}>
		                    <a href={this.renderHomepageUrl()}>
		                        <i className="header-logo" style={{ 'backgroundImage': `url(${this.props.logoUrl})`}}/>
		                    </a>
		                    {this.renderTagline()}
		                </div>
		                <div>
							<SidebarNav isMerchant={isMerchant} isMerchantSubAccountActive={this.props.merchantSubAccountActive} approvalSettings={this.props.approvalSettings} />
		                </div>
		            </div>
		        </div>
			</React.Fragment>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		user: state.userReducer.user,
        logoUrl: state.marketplaceReducer.logoUrl,
        homepageUrl: state.marketplaceReducer.homepageUrl,
        merchantSubAccountActive: state.marketplaceReducer.merchantSubAccountActive,
        approvalSettings: state.approvalReducer.settings,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		loadMarketplaceInfo: () => dispatch(marketplaceActions.getInfo()),
		loadApprovalSettings: () => dispatch(approvalActions.getApprovalSettings()),
	};
}

const SidebarLayout = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(SidebarLayoutComponent);

module.exports = {
	SidebarLayout,
	SidebarLayoutComponent,
};