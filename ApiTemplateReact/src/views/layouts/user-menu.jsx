'use strict';
var React = require('react');

class UserMenuComponentTemplate extends React.Component {
    renderName() {
        if (this.props.user.DisplayName) {
            return (
                <p>{this.props.user.DisplayName.substring(0, 15)}</p>
            )
        }

        return (
            <p>{(this.props.user.UserName || '').substring(0, 15)}</p>
        )
    }

    renderSettings() {
        if (typeof this.props.user.Roles !== 'undefined' && this.props.user.Roles != null && (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant'))) {
            return (
                <li><a href="/merchants/settings">Settings</a></li>
            )
        }

        return (
            <li><a href="/users/settings">Settings</a></li>    
        )
    }

    showUserMenu(event) {
        event.stopPropagation();
        $('.h-username').find(".h-dd-menu").slideToggle();
        $(".h-st-menus").hide();
        $(".h-cart .h-cart-menu").hide();
        $(".h-more .h-dd-menu").hide();
        $(".h-user .h-dd-menu").hide();
    }

    renderChangePasswordMenu() {
        let showChangepassword = false;
        if (this.props.user) {
            if (this.props.user.UserName && !(this.props.user.UserName.startsWith('Facebook') || this.props.user.UserName.startsWith('Google'))) {
                showChangepassword = true;
            }
            else if (this.props.user.UserLogins && this.props.user.UserLogins.length > 0) {
                const loginProviders = this.props.user.UserLogins.map(l => l.LoginProvider);
                showChangepassword = !loginProviders.includes('Facebook') && !loginProviders.includes('Google');
            }
        }

        if (showChangepassword) {
            return (<li><a href="/accounts/change-password">Change Password</a></li>);
        }
        return;
    }

    getRedirectLink() {
      //  if (typeof this.props.user.Roles !== 'undefined' && this.props.user.Roles != null && (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant'))) {
      //      if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') return "/merchants/order/history";
       //     return "/quotation/list";
       // }
        //if (process.env.CHECKOUT_FLOW_TYPE == 'b2c') return "/purchase/history";
        //return "/quotation/list?buyer=true";
        return "/purchase/history";
    }

    render() {
        if (typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Guest === false) {
            return (
                <li className="h-username" onClick={(e) => this.showUserMenu(e)}>
                    <span>
                        {this.renderName()}
                        <i className="fa fa-angle-down"></i>
                    </span>
                    <ul className="h-dd-menu hide-me">
                        <li><a href={this.getRedirectLink()}>Buyer Docs</a></li>
                        {this.renderSettings()}
                        {this.renderChangePasswordMenu()}
                        <form action="/accounts/sign-out" method="post" style={{ cursor: 'pointer'}}>
                            <li><a id="signout-form" onClick={(e) => this.props.signOut(e)}>Logout</a></li>
                        </form>
                    </ul>
                </li>
            );
        } else {
            function getLoginUrl() {
                let search = location.search;
                if (search) {
                    search = search.replace('?error=invalid-token', '');
                }

                let loc = (location.pathname + search).substr(1);
                return `/accounts/non-private/sign-in?returnUrl=${loc}`
            }

            return (
                <li className="h-username">
                    <a href={getLoginUrl()}>REGISTER/SIGN IN</a>
                </li>
            );
        }
    }
}

module.exports = UserMenuComponentTemplate;