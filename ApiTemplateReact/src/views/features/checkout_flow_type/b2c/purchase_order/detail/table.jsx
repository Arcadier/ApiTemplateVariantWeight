'use strict';
const React = require('react');
const PricingTypeCustomTable = require('./' + process.env.PRICING_TYPE + '/table');
const TableItemsComponent = require('./table-items');
class PurchaseOrderTable extends PricingTypeCustomTable {
	renderHeader() {
		if (typeof this.renderCustomHeader == 'function') {
			return this.renderCustomHeader(this.props.enableReviewAndRating);
		}
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

	renderTableItems() {
		if (typeof this.renderCustomTableItems == 'function') {
			return this.renderCustomTableItems(this.props);
		}

		return (<TableItemsComponent {...this.props} enableReviewAndRating={this.props.enableReviewAndRating} />);
	}

	render() {
		return (
			<section className="sassy-box no-border box-order-items">
                <table className="table order-data table-items">
                    {this.renderHeader()}
                    <tbody>{this.renderTableItems()}</tbody>
                </table>
            </section>
		);
	}
}

module.exports = PurchaseOrderTable;