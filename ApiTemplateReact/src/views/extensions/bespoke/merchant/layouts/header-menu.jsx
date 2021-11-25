'use strict';
var React = require('react');

var UserMenuComponentTemplate = require('./user-menu')
var LanguageMenuComponentTemplate = require('../../layouts/language-menu');

class HeaderMenuComponentTemplate extends React.Component {
    renderSubAccount() {

        if (typeof this.props.merchantSubAccountActive != 'undefined' && this.props.merchantSubAccountActive && this.props.merchantSubAccountActive == true) {
            return (
                <li className="h-user"> <a href="/subaccount/list">Sub-Accounts</a> </li>
            )
        }

        return false
    }

    componentDidMount() {

        if (typeof window !== 'undefined') {
            let self = this;            
            if (typeof self.props.user != 'undefined' && self.props.user.Onboarded === false && window.location.href.indexOf('/merchants/settings') < 1) {
                let redirectToOnboardSetting = true;
                if (self.props.user.Roles) {
                    self.props.user.Roles.forEach(function (role) {
                        if (role.toLowerCase() === "submerchant") {
                            redirectToOnboardSetting = false;
                        }
                    });
                }
                if (redirectToOnboardSetting === true) {
                    window.location.href = '/merchants/settings?error=onBoardInComplete';
                }              
            }
        }
    }



    render() {
        return (
            <div className="pull-right full-width-xs">
                <div className="tog-box" id="toggle-mobile-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <ul className="header-menus tog">
                    <li className="h-user"> <a href="/merchants/dashboard">Dashboard</a> </li>
                    <li className="h-user"> <a href="/merchants/items">Your Item</a> </li>
                    <li className="h-user"> <a href="/merchants/upload">Add Item</a> </li>
                    <li className="h-user"> <a href="/merchants/order/history">Orders</a> </li>
                    {this.renderSubAccount()}
                </ul>
                <ul className="header-menus usr">
                    <LanguageMenuComponentTemplate {...this.props} />
                    <UserMenuComponentTemplate {...this.props} />
                </ul>
            </div>
        );
    }

}

module.exports = HeaderMenuComponentTemplate;