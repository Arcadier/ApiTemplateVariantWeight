'use strict';
const React = require('react');
const BaseComponent = require('../../../../../../../../views/shared/base');

class HeaderBookingDetails extends BaseComponent {
    render() {
        return (
            <thead>
                    <tr>
                        <th className="text-left">Item Description</th>
                        {this.props.enableReviewAndRating === true ? <th>Review</th> : <th>&nbsp;</th>}
                        <th>Quantity</th>
                        <th width="171px">Unit Price</th>
                        <th width="171px">Total Cost</th>
                    </tr>
            </thead>
        );
    }
}

module.exports = HeaderBookingDetails;
