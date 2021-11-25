'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var ReactRedux = require('react-redux');
var panelActions = require('../../../redux/panelAction');
var categoryActions = require('../../../redux/categoryActions');
var marketplaceActions = require('../../../redux/marketplaceActions');
var inboxActions = require('../../../redux/inboxAction');

var SellerHeaderMenuComponentTemplate = require('../../extensions/' + process.env.TEMPLATE + '/merchant/layouts/header-menu');
var SellerHeaderLayoutBottomComponent = require('../../extensions/' + process.env.TEMPLATE + '/merchant/layouts/header-bottom');

var commonModule = require('../../../public/js/common');
import ReactGA from 'react-ga';

class HeaderLayoutComponent extends React.Component {
    componentWillUpdate() {
        if ((this.props.panels == null || this.props.panels.length == 0) && this.props.loadPanels != null) {
            this.props.loadPanels();
        }
        if ((this.props.categories == null || this.props.categories.length == 0) && this.props.loadCategories != null) {
            this.props.loadCategories();
        }
        if (this.props.logoUrl == '' ) {
            this.props.loadMarketplaceInfo();
        }



        if (typeof this.props.getUnreadCount === 'function') {
            this.props.getUnreadCount();
        }
    }

    componentDidMount() {
        var self = this;

        if (typeof window !== 'undefined') {
            if (typeof this.props.merchantSubAccountActive != 'undefined' || (self.props.googleAnalytics && self.props.googleAnalytics == null)) {
                self.props.loadMarketplaceInfo();
            }

            this.bindWindowClick();
            commonModule.init();
        }
    }

    loadGoogleAnalytics() {
        var self = this;

        if (self.props.googleAnalytics) {

            ReactGA.initialize(self.props.googleAnalytics['google-trackid']);
            ReactGA.pageview(window.location.pathname + window.location.search);

        }
    }

    componentDidUpdate() {
        commonModule.initHeaderMenuScroll();
    }

    bindWindowClick() {
        $(window).on('click', function () {
            $(".h-dd-menu").hide();
            $(".h-st-menus").hide();
        });
    }

    showUserMenu(event) {
        event.stopPropagation();
        $('.h-username').find(".h-dd-menu").slideToggle();
        $(".h-st-menus").hide();
        $(".h-more .h-dd-menu").hide();
    }

    signOut() {
        event.stopPropagation();
        $('a#signout-form').closest('form').submit();
    }

    showBannerMenu() {
        event.stopPropagation();
        $('.h-more').find(".h-dd-menu").slideToggle();
        $(".h-st-menus").hide();
        $(".h-username .h-dd-menu").hide();
    };

    searchMobile() {
        $(".header-bottom ul.header-menus > li.h-search").toggle();
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                {self.loadGoogleAnalytics()}
                <div className="header-top">
                    <div className="container">
                        <SellerHeaderMenuComponentTemplate user={this.props.user}
                            languages={this.props.languages}
                            showUserMenu={this.showUserMenu}
                            merchantSubAccountActive={this.props.merchantSubAccountActive}
                            signOut={this.signOut} />
                    </div>
                </div>
                <SellerHeaderLayoutBottomComponent categories={this.props.categories}
                    panels={this.props.panels}
                    showBannerMenu={this.showBannerMenu}
                    searchMobile={this.searchMobile}
                    logoUrl={this.props.logoUrl}
                    user={this.props.user}
                    homepageUrl={this.props.homepageUrl}
                    unreadCount={this.props.unreadCount} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        categories: state.categoryReducer.categories,
        user: state.userReducer.user,
        panels: state.panelsReducer.panels,
        logoUrl: state.marketplaceReducer.logoUrl,
        languages: state.marketplaceReducer.languages,
        homepageUrl: state.marketplaceReducer.homepageUrl,
        unreadCount: state.inboxReducer.unreadCount,
        merchantSubAccountActive: state.marketplaceReducer.merchantSubAccountActive,
        googleAnalytics: state.marketplaceReducer.googleAnalytics
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadPanels: () => dispatch(panelActions.asyncLoadingPanels()),
        loadCategories: () => dispatch(categoryActions.asyncLoadingCategories()),
        loadMarketplaceInfo: () => dispatch(marketplaceActions.getInfo()),
        getUnreadCount: () => dispatch(inboxActions.getUnreadCount())
    }
}

const HeaderLayout = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(HeaderLayoutComponent)

module.exports = {
    HeaderLayout,
    HeaderLayoutComponent
}