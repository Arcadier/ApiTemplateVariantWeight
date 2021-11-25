'use strict';
var React = require('react');
var BaseComponent = require('../../../../../views/shared/base');

class BulkPricingComponent extends BaseComponent {
    renderBulkTable() {
        let self = this;
        let ele = "";

        const { bulkPricing } = this.props;

        if (bulkPricing) {
            ele = bulkPricing.map((bulk, index) => {
                let bulkQuantity = '';
                let bulkDiscount = '';

                if (bulk.Onward == '1') {
                    bulkQuantity = '≥ ' + bulk.OnwardPrice;
                } else {
                    bulkQuantity = bulk.RangeStart + ' - ' + bulk.RangeEnd;
                }

                if (bulk.IsFixed == '0') {
                    bulkDiscount = bulk.Discount + '%';
                } else {
                    bulkDiscount = bulk.Discount;
                }

                return (
                    <tr key={'bulk-' + index}>
                        {self.renderQuantity(bulkQuantity, index)}
                        {self.renderDiscount(bulkDiscount, bulk.IsFixed, index)}
                    </tr>
                );
            });
        }

        return ele;
    }

    renderQuantity(bulkQuantity, index) {
        return (
            <td key={'quantity-' + index}>{bulkQuantity}</td>
        )
    }

    renderDiscount(bulkDiscount, isFixed, index) {
        if (isFixed == '0') {
            return (
                <td key={'discount-' + index}><span className="item-price"> <span className="percentage">{bulkDiscount}</span> </span></td>
            )
        } else {
            return (
                <td key={'discount-' + index}>
                    <span className="item-price">
                        {this.renderFormatMoney(this.props.currencyCode, bulkDiscount)}
                    </span>
                </td>
            )
        }
    }

    render() {
        const { bulkPricing } = this.props;

        if (bulkPricing && bulkPricing.length > 0) {
            return (
                <div className="idcrb-bot">
                    <span className="title">Bulk Pricing</span>
                    <div className="bulk-price-tbl">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Quantity</th>
                                    <th>Discount per item</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderBulkTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return null;
    }
}

module.exports = BulkPricingComponent;