'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class TabLinksComponent extends BaseComponent {
    render() {
        const { showTab } = this.props;

        return (
            <React.Fragment>
                <li className="active tablinks" data-tab="basic_tab" onClick={() => { showTab('basic_tab'); }}><span>Basic Details </span></li>
                <li className="tablinks" data-tab="description_tab" onClick={() => { showTab('description_tab'); }}><span>Description</span></li>
                <li className="tablinks" data-tab="pricing_tab" onClick={() => { showTab('pricing_tab'); }}><span>Pricing</span></li>
                <li className="tablinks" data-tab="schedule_tab" onClick={() => { showTab('schedule_tab'); }}><span>Schedule</span></li>               
                <li className="tablinks" data-tab="location_tab" onClick={() => { showTab('location_tab'); }}><span>Location</span></li>
                <li className="tablinks" data-tab="delivery_tab" onClick={() => { showTab('delivery_tab'); }}><span>Shipping</span></li>
            </React.Fragment>
        )
    }
}

module.exports = TabLinksComponent;