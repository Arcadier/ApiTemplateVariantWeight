'use strict';
var React = require('react');

class PricingComponent extends React.Component {
    constructor(props) {
        super(props);

        const pricing = props.pricing;

        this.state = {
            pricing: pricing
        }
        this.handlePriceChange = this.handlePriceChange.bind(this);
    }

    refreshPricing(pricing) {
        this.setState({
            pricing: pricing
        });
    }

    handlePriceChange(e, data) {
        var pricePattern = new RegExp(/^(?=.*[0-9])\d*(?:\.\d{0,2}){0,1}$/i);
        if (e.target.value && pricePattern.test(e.target.value) == false) {
            e.target.value = data.price;
        }
        this.props.onPriceChanged(e.target.value, data.countryCode);
    }

    renderRow() {
        let self = this;
        if (self.props.pricing != null) {
            return self.props.pricing.map(function(data, i) {
                let bulkData = data.bulkPricing;
                if (bulkData.length > 0) {
                    bulkData = JSON.parse(bulkData);
                }
                return (
                    <tr key={i} id={"rowPrice" + data.countryCode} lang="en-US">
                        <td>{data.countryName}</td>
                        <td>
                            <input type="text" className="table-input required number2DecimalOnly"
                                   defaultValue={data.price}
                                   onChange={(e) => self.handlePriceChange(e, data)}/>
                        </td>
                        <td className="tb-span-text bulk-price">
                            {self.renderBulkPriceDisplay(bulkData)}
                        </td>
                        <td className="tb-span-text discount-price">
                            {self.renderDiscountDisplay(bulkData, data)}
                        </td>
                        <td className="btn-table"><input type="hidden" data-bulk-pricing="true" value=""/>
                            <span className="btn-edit open-bulk-modal" data-id={"rowPrice-" + data.countryCode}
                                  data-country-code={data.countryCode}
                                  onClick={(e) => self.props.editPricingItem(data.countryCode)}>Edit</span>
                        </td>
                    </tr>
                );
            });
        }
    }

    renderBulkPriceDisplay(bulkData) {
        if (bulkData.length > 0) {
            return bulkData.map(function(bulk, i) {

                let bulkQuantity = '';
                if (bulk.Onward == '1') {
                    bulkQuantity = '≥ ' + bulk.OnwardPrice;
                } else {
                    bulkQuantity = bulk.RangeStart + ' - ' + bulk.RangeEnd;
                }

                return (
                    <span key={i}>
                        {bulkQuantity}
                    </span>
                );
            });
        } 
    }

    renderDiscountDisplay(bulkData, data) {
        let self = this;
        let bulkDiscount = "";
        if (bulkData.length > 0) {
            return bulkData.map(function(bulk, i) {
                if (bulk.IsFixed == '0') {
                    bulkDiscount = bulk.Discount + '%';
                }

                if (bulk.IsFixed !== '0') {
                    bulkDiscount = bulk.Discount;
                    return (
                        <span key={i}>{self.props.formatMoney(data.currencyCode, bulkDiscount)}</span>
                    );
                } else {
                    return (
                        <span key={i}>{bulkDiscount}</span>
                    );
                }
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="tab-container tabcontent" id="pricing_tab">
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Pricing</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs">
                        <div className="col-md-12">
                            <div className="row">
                                <div className="un-ul-table">
                                    <table className="table" id="tblPricing">
                                        <thead>
                                            <tr>
                                                <th>Country</th>
                                                <th>Price*</th>
                                                <th>Bulk Pricing:</th>
                                                <th>Discount</th>
                                                <th />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.renderRow()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = PricingComponent;