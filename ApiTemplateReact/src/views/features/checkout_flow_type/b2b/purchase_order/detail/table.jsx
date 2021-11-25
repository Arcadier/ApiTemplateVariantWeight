'use strict';
const React = require('react');
const TableItemsComponent = require('./table-items');
class PurchaseOrderTable extends React.Component {
	render() {
		return (
			<section className="sassy-box no-border box-order-items">
                <table className="table order-data table-items">
                    <thead>
                        <tr>
                            <th className="text-left">Item Description</th>
                            {this.props.enableReviewAndRating === true ? <th>Review</th> : <th>&nbsp;</th>}
                            <th>Quantity</th>
                            <th width="171px">Unit Price</th>
                            <th width="171px">Total Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TableItemsComponent {...this.props} enableReviewAndRating={this.props.enableReviewAndRating} />
                    </tbody>
                </table>
            </section>
		);
	}
}

module.exports = PurchaseOrderTable;