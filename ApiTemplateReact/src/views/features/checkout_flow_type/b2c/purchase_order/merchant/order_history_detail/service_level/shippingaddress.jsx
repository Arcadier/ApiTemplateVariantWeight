'use strict';
const React = require('react');
const BaseComponent = require('../../../../../../../shared/base');

class ShippingAddressDetails extends BaseComponent {

    render() {
        return (
            <thead>
                <tr>
                    <th width="300px" className="text-left">Service Description</th>
                    <th width="180px">Review</th>
                    <th width="60px">Total Price</th>
                    <th width="500px">&nbsp;</th>
                </tr>
            </thead>
        );
    }
}

module.exports = ShippingAddressDetails;