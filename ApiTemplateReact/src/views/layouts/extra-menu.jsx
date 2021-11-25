'use strict';
var React = require('react');

class ExtraMenuComponent extends React.Component {

    constructor(props) {
        super(props);
        this.skipCart = process.env.SKIP_CART == 'true' || false;
        this.renderComparisonList = this.renderComparisonList.bind(this);
    }
    
    componentDidMount() {
        $(".h-cart > a").hover(function(event){
            $(".h-cart .h-cart-menu").slideDown();
            $(".h-st-menus").hide();
            $(".h-username .h-dd-menu").hide();
            $(".h-more .h-dd-menu").hide();
            $(".h-more .h-dd-menu").hide();
        });

        $('.h-cart').mouseleave(function(e) {
            if (e.offsetX < 0 || e.offsetX > $(this).width()) {
                $(".h-cart .h-cart-menu").slideUp();
            }
        });
    }

    showBannerMenu() {
        event.stopPropagation();
        $('.h-more').find(".h-dd-menu").slideToggle();
        $(".h-st-menus").hide();
        $(".h-cart .h-cart-menu").hide();
        $(".h-username .h-dd-menu").hide();
        $(".h-user .h-dd-menu").hide();
    }

    renderHeaderPanel() {
        const self = this;
        if (this.props.panels != null) {
            var headerPanel = this.props.panels.map(function (panel, index1) {
                if (panel.Type == 'ExternalLinkHeader' && panel.Details && panel.Details.length >= 1) {
                    return (
                        <li className="h-more" key={index1} onClick={(e) => self.showBannerMenu(e)} >
                            <b className="fas fa-square-full" />
                            <span>More</span>
                            <i className="fa fa-angle-down"></i>
                            <ul className="h-dd-menu hide-me" style={{ overflow: 'hidden', outline: 'none', cursor: 'grab' }} tabIndex="2">
                                {panel.Details.map(function (detail, index2) {
                                    return (<li key={index2}><a href={detail.Url}>{detail.Title}</a></li>)
                                })}
                            </ul>
                        </li>)
                }
            });
            return headerPanel;
        } else {
            return '';
        }
    }

    isMerchant() {
        if (this.props.user && typeof this.props.user.Roles !== 'undefined' && this.props.user.Roles != null && (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant'))) {
            return true;
        }
        return false;        
    }

    renderSettings() {
        if (this.isMerchant()) {
            return (
                <li className="mobile-only"><a href="/merchants/settings">Settings</a></li>
            )
        }

        return (
            <li className="mobile-only"><a href="/users/settings">Settings</a></li>    
        )
    }

    renderBeSeller() {
        const privateMerchantRestricted = this.props.isPrivateEnabled || this.props.isMerchantRestrictedOnly;
        const redirectionLink = privateMerchantRestricted ? "/accounts/sign-in" : "/accounts/non-private/be-seller";
        if (!this.isMerchant() && privateMerchantRestricted === false) {
            if (process.env.PRICING_TYPE == 'variants_level' || this.props.isPrivateEnabled == false) {
                return (
                    <li className="be-seller">
                        <a href={redirectionLink}>BE A SELLER</a>
                    </li>
                );
            }
        }

        return null;
    }
    renderSubAccount() {
        if (typeof this.props.merchantSubAccountActive != 'undefined' && this.props.merchantSubAccountActive && this.props.merchantSubAccountActive == true) {
            return (
                <li> <a href="/merchants/subaccount/list">Sub Account</a> </li>
            )
        }

        return false
    }
    showMenu(event) {
       event.stopPropagation(); 
        $(".h-user").find(".h-dd-menu").slideToggle();
        $(".h-st-menus").hide();
        $(".h-more .h-dd-menu").hide();
        $(".h-cart .h-cart-menu").hide();
        $(".h-username .h-dd-menu").hide();
    }

    renderSellerMenu() {
        if (this.isMerchant()) {
            if ($("body").hasClass("page-sidebar")) {
                return (<li className="h-seller">
                  <a href="/merchants/dashboard"><i className="fas fa-store-alt"></i><span>Seller</span></a>
                </li>)
            }
            return (
                <li className="h-user" onClick={(e) => this.showMenu(e)}>              
                    <span className="h-user-container">
                        <a className="seller-menu" href="#">
                            <i className="fas fa-store-alt" ></i>
                            Seller
                        </a>
                        <i className="fa fa-angle-down" />
                    </span>
                    <ul className="h-dd-menu hide-me">
                        <li><a href="/merchants/dashboard">Dashboard</a></li>
                        <li><a href="/merchants/items">Inventory</a></li>
                        <li><a href="/merchants/upload">Add New Item</a></li>
                        <li><a href="/merchants/order/history">Orders</a></li>
                        {this.renderSubAccount()}
                        <li><a href="/delivery/settings">Shipping</a></li>
                    </ul>
                </li>
            );
        } 

        return null;
    }

    renderCart() {
        if (this.skipCart == true) return;
        return (
            <li className="h-cart">
                <a href="/cart" >
                    <i className="fa fa-shopping-cart" />
                    <span> 
                        <span className="mobile-only">CART</span>&nbsp; 
                        (<span className="cart-count" id="latest-cart-count">0</span>)
                    </span>
                </a>
                <div className="h-dd-menu h-cart-menu hide-me" style={{ overflow: 'hidden', outline: 'none', cursor: 'grab' }} tabIndex="1">
                    <div className="h-cart-mid"> 
                        <ul />
                    </div>
                    <div className="h-cart-bot">
                        <a href="/cart" className="btn-view-cart"> View Cart </a>
                    </div>
                </div>
                <div className="h-dd-menu add-cart">
                    <div className="h-cart-top">Item has been added!</div>
                    <div className="h-cart-mid">
                        <ul>
                            <li className="cart-item">
                                <div className="item-img">
                                    <span className="helper" />
                                    <img src={null}/>
                                </div>
                                <div className="item-info">
                                    <p/>
                                    <div className="item-price">
                                      <span className="currency"/>
                                      <span className="value"  />
                                   </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="h-cart-bot">
                        <a href="/cart" className="btn-view-cart"> View Cart </a>
                    </div>
                </div>                
            </li>
        )
    }

    renderChangePasswordMenu() {
        if (this.props.user && this.props.user.UserName && !(this.props.user.UserName.startsWith('Facebook') || this.props.user.UserName.startsWith('Google'))) {
            return (<li className="mobile-only"><a href="/accounts/change-password">Change Password</a></li>);
        }
        return;
    }
    
    renderGuestMenu() {
        let loc = (location.pathname + location.search).substr(1)
        const loginUrl = `/accounts/non-private/sign-in?returnUrl=${loc}`;

        return (
            <li className="h-extramenus hide-mobile">
                <ul>
                    {this.renderBeSeller()}
                    {this.renderComparisonList()}      
                    {this.renderCart()}
                    {this.renderHeaderPanel()}
                    <li className="mobile-only">
                        <a href={loginUrl}>REGISTER/SIGN IN</a>
                    </li>
                </ul>
            </li>
        );
    }

    renderComparisonList() {
        const { ComparisonEnabled } = this.props.ControlFlags || false;
        if (ComparisonEnabled) {
            return (
                <li className="h-compare">
                    <a href="/comparison/list">
                        <i className="fa fa-th-list"/>
                        <span className="mobile-only">COMPARE</span>
                    </a>
                </li>
            )
        }
        return null;
    }

    getRedirectLink() {
        if (typeof this.props.user.Roles !== 'undefined' && this.props.user.Roles != null && (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant'))) {
            //if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') return "/merchants/order/history";
            //return "/quotation/list";
            return "/merchants/order/history";
        }
        //if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') return "/purchase/history";
        //return "/quotation/list";
        return "/purchase/history";
    }

    render() {        
        if (!this.props.user || (this.props.user && this.props.user.Guest)) {
            return(
                <React.Fragment>
                    {this.renderGuestMenu()}
                </React.Fragment>
            )
        }
        return (
            <React.Fragment>
                <li className="h-extramenus hide-mobile">
                    <ul>
                        {this.renderBeSeller()}
                        {this.renderSellerMenu()}
                        <li className="h-mail"> 
                            <a href="/chat/inbox">
                                <i className="fa fa-envelope" /> 
                                <span className="mobile-only">MESSAGE</span>
                            </a> 
                        </li>
                        {this.renderComparisonList()}                        
                        {this.renderCart()}
                        {this.renderHeaderPanel()}
                        <li className="mobile-only"><a href={this.getRedirectLink()}>Buyer Docs</a></li>
                        {this.renderSettings()}
                        {this.renderChangePasswordMenu()}
                        <li className="mobile-only">
                            <form action="/accounts/sign-out" method="post" style={{ cursor: 'pointer'}}>
                                <li><a id="signout-form" onClick={(e) => this.props.signOut(e)}>Logout</a></li>
                            </form>
                        </li>
                    </ul>
                </li>
            </React.Fragment>
        )
    }

}

module.exports = ExtraMenuComponent;