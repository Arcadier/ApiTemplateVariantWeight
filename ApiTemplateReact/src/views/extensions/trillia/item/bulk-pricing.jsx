'use strict';
var React = require('react');

var BaseComponent = require('../../../shared/base');
class BulkPricingComponent extends BaseComponent {

    renderStock() {
        let self = this;
        let child = this.props.itemDetails.ChildItems && this.props.itemDetails.ChildItems.length > 0
            ? this.props.itemDetails.ChildItems.filter(function (child) { return child.Tags[0] === self.props.countryCode })
            : self.props.itemDetails;

        if (child.length === 0) {
            return "";
        }

        if (child.length > 0 && child[0].StockLimited === false) {
            return "∞";
        }
        else {
            if (child[0]) {
                return child[0].StockQuantity
            }

        }
    }
    renderBulkTable() {
        let self = this;
        if (this.props.itemDetails.ChildItems != null) {
            let ele = this.props.itemDetails.ChildItems.map(function (itemDetail) {
                if (itemDetail.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    if (itemDetail.CustomFields != null) {
                        return itemDetail.CustomFields.map(function (childCustomField) {
                            if (childCustomField.Name.toLowerCase() == 'bulkpricing') {
                                return childCustomField.Values.map(function (value) {
                                    let parsebulk = JSON.parse(value);
                                    let bulkQuantity = '';
                                    let bulkDiscount = '';
                                    return parsebulk.map(function (bulk, index) {
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
                                        )
                                    })
                                });
                            }
                        })
                    }
                    
                }
            });
            return ele;
        } 
    }
    renderQuantity(bulkQuantity, index) {
        return (
            <td key={'quantity-' + index}>{bulkQuantity}</td>
        )
    }
    renderDiscount(bulkDiscount, isFixed, index) {
        let self = this;
        if (isFixed == '0') {
            return (
                <td key={'discount-' + index}><span className="item-price"> <span className="percentage">{bulkDiscount}</span> </span></td>
            )
        } else {
            return (
                <td key={'discount-' + index}>
                    <span className="item-price">
                        {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, bulkDiscount)}
                    </span>
                </td>
            )
        }
    }

    render() {
        let self = this;
        return (
            <div className="idcr-bot">
                <div className="idcrb-top">
                    <span className="title full-width">Total Stock</span><span className="total-stock full-width">{this.renderStock()}</span>
                </div>
                <div className={"idcrb-bot " + this.props.haveBulk}>
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
                                {self.renderBulkTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = BulkPricingComponent;