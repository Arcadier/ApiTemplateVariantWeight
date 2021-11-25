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

    render() {        


        if (typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Guest === false) {

            let hide = "";
            if (this.props.user.UserName && this.props.user.UserName.includes("Google") || this.props.user.UserName && this.props.user.UserName.includes("Facebook")) {
                hide = "hide";
            }

          
            return (
                <li className="h-username" onClick={(e) => this.props.showUserMenu(e)}>
                    <span>
                        {this.renderName()}
                        <i className="fa fa-angle-down"></i>
                    </span>
                    <ul className="h-dd-menu hide-me">
                        <li><a href="/purchase/history">Purchase History</a></li>
                        {this.renderSettings()}
                        <li className={hide}><a href="/accounts/change-password">Reset Password</a></li>
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