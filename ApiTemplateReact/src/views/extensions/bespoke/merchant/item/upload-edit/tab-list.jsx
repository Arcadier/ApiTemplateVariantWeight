'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');

class TabListComponent extends BaseComponent {
    render() {
        return (
            <React.Fragment>
                <li className="active tablinks" data-tab="basic_tab" onClick={() => { this.props.showTab('basic_tab'); }}><span>Basic Details </span></li>
                <li className="tablinks" data-tab="pricing_tab" onClick={() => { this.props.showTab('pricing_tab'); }}><span>Pricing</span></li>
                <li className="tablinks" data-tab="description_tab" onClick={() => { this.props.showTab('description_tab'); }}><span>Description</span></li>
                <li className="tablinks" data-tab="delivery_tab" onClick={() => { this.props.showTab('delivery_tab'); }}><span>Shipping</span></li>
            </React.Fragment>
        )
    }
}

module.exports = TabListComponent;