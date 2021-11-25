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

    render() {
        if (typeof this.props.user !== 'undefined' && this.props.user != null) {
            return (
                <li className="h-username" onClick={(e) => this.props.showUserMenu(e)}>
                    <span>
                        {this.renderName()}
                        <i className="fa fa-angle-down"></i>
                    </span>
                    <ul className="h-dd-menu hide-me">
                        <li><a href="/purchase/history">Purchase History</a></li>
                        <li><a href="/merchants/settings">Settings</a></li>
                        <li><a href="/accounts/change-password">Change Password</a></li>
                        <li><a href="/comparison/list">My Comparison Table</a></li>
                        <form action="/accounts/sign-out" method="post">
                            <li><a id="signout-form" onClick={(e) => this.props.signOut(e)}>Logout</a></li>
                        </form>
                    </ul>
                </li>
            );
        } else {
            return (<li className="h-username">
                <span>Login</span>
            </li>)
        }
    }

}

module.exports = UserMenuComponentTemplate;