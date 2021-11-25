'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const marketplaceActions = require('../../../redux/marketplaceActions');
const commonModule = require('../../../public/js/common');

if (typeof window !== 'undefined') {
    const $ = window.$;
}

class SidebarLayoutComponent extends React.Component {

	componentDidMount() {
		commonModule.initSidebar();
		if ((this.props.logoUrl == '' || typeof this.props.logoUrl == 'undefined' || !this.props.logoUrl) && typeof this.props.loadMarketplaceInfo == 'function') {
			this.props.loadMarketplaceInfo();
		}
		$("ul.sidebar-nav li > a").each(function(index, anchor) {
			const path = $(anchor).attr('href');
			if (window && window.location) {
				if ((path === "/" && window.location.pathname == path) || (path !== "/" && window.location.pathname.startsWith(path))) {
					$(anchor).parent().addClass('active');
					if ($(anchor).parent().closest('.has-sub').length > 0) {
						$(anchor).parent().closest('.has-sub').addClass('active');
					}
				}
				
			}
		});
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
    // TODO
    // Fix MP logo render
	render() {
		return (
			<React.Fragment>
				<aside className="sidebar" id="sidebar-section">
			        <div className="sidebar-adjust">
			            <a href="#" className="sidebar-action"></a>
			            <div className="sidebar-wrapper">
			                <div className="sidebar-brand underline">
			                    <a href={this.renderHomepageUrl()}>
			                        <i className="header-logo" key={this.props.logoUrl} style={{ 'background': `url(${this.props.logoUrl}) no-repeat`}}/>
			                    </a>
								<div className="site-tagline"><a href="/merchants/dashboard">Supplier Portal</a></div>
			                </div>
			                <div>
			                    <ul className="sidebar-nav">
			                        <li>
			                            <a href="/merchants/dashboard"><i className="fas fa-tachometer-alt fa-fw"></i> <span>Dashboard</span></a>
			                        </li>
			                        <li>
			                            <a href="/merchants/items"><i className="fas fa-cubes fa-fw"></i> <span>Inventory</span></a>
			                        </li>
			                        <li>
			                            <a href="/merchants/upload"><i className="fas fa-plus fa-fw"></i> <span>Add new item</span></a>
			                        </li>
			                        <li className="has-sub">
			                            <a href="#"><i className="fas fa-file-alt fa-fw"></i> <span>Documents</span></a>
			                            <ul>
			                                <li>
			                                    <a href="#"><i className="fas icon-spacer fa-fw"></i> <span>Quotation</span></a>
			                                </li>
			                                <li>
			                                    <a href="/merchants/order/history"><i className="fas icon-spacer fa-fw"></i> <span>Purchase Order</span></a>
			                                </li>
			                                <li>
			                                    <a href="#"><i className="fas icon-spacer fa-fw"></i> <span>Invoice</span></a>
			                                </li>
			                            </ul>
			                        </li>
			                        <li>
										<a href="/subaccount/list"><i className="fas fa-key fa-fw"></i> <span>Sub Account</span></a>
							        </li>
			                        <li>
			                            <a href="/delivery/settings"><i className="fas fa-shipping-fast fa-fw"></i> <span>Shipping</span></a>
			                        </li>
			                    </ul>
			                </div>
			            </div>
			        </div>
			    </aside>
			</React.Fragment>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		user: state.userReducer.user,
        logoUrl: state.marketplaceReducer.logoUrl,
        languages: state.marketplaceReducer.languages,
        homepageUrl: state.marketplaceReducer.homepageUrl,
        merchantSubAccountActive: state.marketplaceReducer.merchantSubAccountActive,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		loadMarketplaceInfo: () => dispatch(marketplaceActions.getInfo()),
	};
}

const SidebarLayout = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(SidebarLayoutComponent)

module.exports = {
	SidebarLayout,
	SidebarLayoutComponent,
};