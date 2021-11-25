'use strict';
var React = require('react');

var UserMenuComponentTemplate = require('./user-menu')
var LanguageMenuComponentTemplate = require('../../layouts/language-menu');

class HeaderMenuComponentTemplate extends React.Component {
    renderSubAccount() {

        if (typeof this.props.merchantSubAccountActive != 'undefined' && this.props.merchantSubAccountActive && this.props.merchantSubAccountActive == true) {
            return (
                <li className="h-user"> <a href="/subaccount/list">Sub Account</a> </li>
            )
        }

        return false
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
                    <li className="h-user"> <a href="/merchants/items">Inventory</a> </li>
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