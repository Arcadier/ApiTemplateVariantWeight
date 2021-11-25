'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var ReactRedux = require('react-redux');
var panelActions = require('../../redux/panelAction');
var categoryActions = require('../../redux/categoryActions');
var marketplaceActions = require('../../redux/marketplaceActions');
var inboxActions = require('../../redux/inboxAction');
var cartActions = require('../../redux/cartActions');
var searchActions = require('../../redux/searchActions')
var HeaderMenuComponentTemplate = require('../layouts/header-menu');
var HeaderLayoutBottomComponent = require('../layouts/header-bottom');

var commonModule = require('../../public/js/common');
var ReactGA = require('react-ga');

class HeaderLayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: ''
        }
    }

    componentDidMount() {
        var self = this;

        if (typeof window !== 'undefined') {
            if ((this.props.panels == null || this.props.panels.length === 0) && this.props.loadPanels != null) {
                this.props.loadPanels();
            }
            if ((this.props.categories == null || this.props.categories.length === 0) && this.props.loadCategories != null) {
                this.props.loadCategories();
            }

            if (typeof this.props.loadMarketplaceInfo == 'function' && (this.props.logoUrl === '' || typeof this.props.logoUrl == 'undefined' || !this.props.logoUrl)) {
                this.props.loadMarketplaceInfo();
            }
            if (this.props.user) {
                if (typeof this.props.getUnreadCount === 'function') {
                    this.props.getUnreadCount();
                }

                if (typeof this.props.getUserCarts === 'function') {
                    //Pull Guest Cart When Inside Cart page
                    if (this.props.user.Guest !== undefined) {
                        let guestUserID = "";
                        if (commonModule.getCookie("guestUserID") && commonModule.getCookie("guestUserID") !== "") {
                            guestUserID = commonModule.getCookie("guestUserID");
                        }

                        this.props.getUserCarts({ pageSize: 1000, pageNumber: 1, includes: null, guestUserID: guestUserID }, null);
                    } else {
                        this.props.getUserCarts({ pageSize: 1000, pageNumber: 1, includes: null }, null)
                    }
                }
            } else {
                //Pull Guest Cart
                if (typeof this.props.getUserCarts === 'function') {
                    let guestUserID = "";

                    if (this.props.user && this.props.user.Guest !== undefined) {
                        if (commonModule.getCookie("guestUserID") && commonModule.getCookie("guestUserID") !== "") {
                            guestUserID = commonModule.getCookie("guestUserID");
                        }
                    }
                    if (!this.props.user) {
                        if (commonModule.getCookie("guestUserID") && commonModule.getCookie("guestUserID") !== "") {
                            guestUserID = commonModule.getCookie("guestUserID");
                        }
                    }

                    this.props.getUserCarts({ pageSize: 1000, pageNumber: 1, includes: null, guestUserID: guestUserID }, null);
                }
            }

            if (window.location.search !== "") {
                let keyword = '';

                const urlParams = new URLSearchParams(window.location.search);

                if (urlParams.has('keywords')) {
                    try {
                        keyword = decodeURIComponent(urlParams.get('keywords'));
                    }
                    catch {
                        keyword = unescape(urlParams.get('keywords'));
                    }
                }

                this.setState({
                    keyword: keyword
                });
            }

            this.bindWindowClick();
            commonModule.init();
            if (self.props.googleAnalytics && self.props.googleAnalytics == null) {
               self.props.loadMarketplaceInfo();
            }
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        commonModule.initHeaderMenuScroll();
    }

    loadGoogleAnalytics() {
        var self = this;
        if (self.props.googleAnalytics) {
            ReactGA.initialize(self.props.googleAnalytics['google-trackid']);
            ReactGA.pageview(window.location.pathname + window.location.search);
        }
    }


    bindWindowClick() {
        const $menu = $('.h-st-menus');
        $(document).mouseup(e => {
            if (!$menu.is(e.target) && $menu.has(e.target).length === 0) {
                $menu.hide();
            }
        });
        $(window).on('click', function (e) {
            $(".h-dd-menu").hide();
        });
    }

    signOut() {
        event.stopPropagation();
        $('a#signout-form').closest('form').submit();
    }

    searchMobile() {
        $(".header-bottom ul.header-menus > li.h-search").toggle();
        if($(".header-bottom ul.header-menus > li.h-search").css('display') == 'list-item' ){
            $(".h-mobi-search.mobi-show").find("i").removeClass("fa-search").addClass("fa-times");
        } else {
            $(".h-mobi-search.mobi-show").find("i").removeClass("fa-times").addClass("fa-search");
        };
    }

    renderSidebarToggle() {
        return $('body').hasClass('page-sidebar') ?
        (
            <div className="tog-box" id="toggle-mobile-menu">
                <span />
                <span />
                <span />
            </div>
        ) : '';
    }

    getGuestUserID() {
        let guestUserID = '';
        if (this.props.user && this.props.user.Guest !== undefined) {
            if (commonModule.getCookie("guestUserID") && commonModule.getCookie("guestUserID") !== "") {
                guestUserID = commonModule.getCookie("guestUserID");
            }
        }
        if (!this.props.user) {
            if (commonModule.getCookie("guestUserID") && commonModule.getCookie("guestUserID") !== "") {
                guestUserID = commonModule.getCookie("guestUserID");
            }
        }
        return guestUserID;
    }
    
    renderHeaderBottom() {
        const guestUserID = this.getGuestUserID();
        if (!$('body').hasClass('page-sidebar')) {

            return (
                <HeaderLayoutBottomComponent 
                    categories={this.props.categories}
                    keyword={this.state.keyword}
                    location={this.state.location}
                    panels={this.props.panels}
                    searchMobile={this.searchMobile}
                    logoUrl={this.props.logoUrl}
                    user={this.props.user}
                    homepageUrl={this.props.homepageUrl}
                    guestUserID={guestUserID}
                    searchGooglePlaces={this.props.searchGooglePlaces}
                />
            )
        }
        return '';
    }

    render() {
        var self = this;
        const isMerchant = typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Roles != null && (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant'));
        let guestUserID = "";
        if (typeof window !== 'undefined') {
            guestUserID = this.getGuestUserID();
            return (
                <React.Fragment>
                    {self.loadGoogleAnalytics()}
                    <div className="header-top">
                        <div className="container">
                            {this.renderSidebarToggle()}
                            <HeaderMenuComponentTemplate 
                                user={this.props.user}
                                languages={this.props.languages}
                                panels={this.props.panels}
                                signOut={this.signOut}
                                isPrivateEnabled={this.props.isPrivateEnabled}
                                merchantSubAccountActive={this.props.merchantSubAccountActive}
                                guestUserID={guestUserID}
                                isMerchantRestrictedOnly={this.props.isMerchantRestrictedOnly} 
                                ControlFlags={this.props.ControlFlags}
                            />
                        </div>
                    </div>
                    {this.renderHeaderBottom()}
                </React.Fragment>
            );
        } else {
            return '';
        }
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
        isPrivateEnabled: state.marketplaceReducer.isPrivateEnabled,
        merchantSubAccountActive: state.marketplaceReducer.merchantSubAccountActive,
        googleAnalytics: state.marketplaceReducer.googleAnalytics,
        isMerchantRestrictedOnly: state.marketplaceReducer.isMerchantRestrictedOnly, 
        ControlFlags: state.marketplaceReducer.ControlFlags
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadPanels: () => dispatch(panelActions.asyncLoadingPanels()),
        loadCategories: () => dispatch(categoryActions.asyncLoadingCategories()),
        loadMarketplaceInfo: () => dispatch(marketplaceActions.getInfo()),
        getUnreadCount: () => dispatch(inboxActions.getUnreadCount()),
        getUserCarts: (options, callback) => dispatch(cartActions.getUserCarts(options, callback)),
        searchGooglePlaces: (keyword, callback) => dispatch(searchActions.searchGooglePlaces(keyword, callback)) 
    }
}

const HeaderLayout = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(HeaderLayoutComponent);

module.exports = {
    HeaderLayout,
    HeaderLayoutComponent
}