'use strict';
var React = require('react');

class SellerMenuComponentTemplate extends React.Component {
    renderSubAccount() {
        
        if (this.props.merchantSubAccountActive == true) {
            return (
                <li><a href="/subaccount/list">Sub Account</a></li>
            )
        }

        return null;
    }

    componentDidMount() {
    }

    render() {
        return (
            <li className="h-user seller-user" onClick={(e) => this.props.showSellerMenu(e)}>
                <a href="#">Seller</a>
                <ul className="h-dd-menu hide-me" style={{ overflow: 'hidden', outline: 'currentcolor none medium', cursor: 'grab' }} tabIndex={1}>
                    <li><a href="/merchants/dashboard">Dashboard</a></li>
                    <li><a href="/merchants/items">Inventory</a></li>
                    <li><a href="/merchants/upload">Add Item</a></li>
                    <li><a href="/merchants/order/history">Orders</a></li>
                    {this.renderSubAccount()}
                    <li><a href="/delivery/settings">Delivery</a></li>
                </ul>
                <i className="fa fa-angle-down" />
            </li>
        )
    }
}

module.exports = SellerMenuComponentTemplate;