'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class CheckoutReview extends BaseComponent {

    renderMinimumLeadTime() {
        let MLT = "N/A"
        let shippingCost = 0;
        let currencyCode = this.props.invoiceDetails.CurrencyCode;
        let self = this;
        this.props.shippingOptions.map(function (data, index) {
            if (data.Selected) {
                shippingCost = data.ShippingCost;
                data.ShippingData.CustomFields.map(function (data) {
                    let parseData = JSON.parse(data.Values);
                    MLT = parseData.MinimumLeadTime;
                });
                currencyCode = data.CurrencyCode;
            }
        });

        return (
            <div className="drbot-content">
                <div className="pull-left"><span>Minimum Lead Time: </span><span className="item-price delivery-time-txt">{MLT}</span></div>
                <div className="pull-right">
                    <span>Delivery Cost:</span>
                    <span className="item-price deliveryCost">
                        {self.renderFormatMoney(currencyCode, shippingCost)}
                    </span>
                </div>
                <div className="clearfix"></div>
            </div>
        )
    }

    renderShippingOptions() {
        let self = this;
        let ele = '';
        if (this.props.shippingOptions != null) {
            ele = self.props.shippingOptions.map(function(data, index) {
                let checked = '';
                if (data.Selected) {
                    checked = "checked";
                }
                return (
                    <span className="full-width" key={data.ShippingData.ID}>
                        <input data-time="8 to 10 working days" type="radio"
                                name="delivery_method"
                                id={data.ShippingData.ID}
                                checked={checked}
                                onChange={(e) => self.props.selectDelivery(data)}/>
                        <label htmlFor={data.ShippingData.ID} style={{ display: 'inline-flex'}}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}> {data.ShippingData.Description + ' + ' } </span>
                            <span className="item-price">{self.renderFormatMoney(data.CurrencyCode, data.ShippingCost)}</span>
                        </label>
                    </span>
                )
            });
        }
        return ele;
    }

    renderPickupOptions() {
        let self = this;
        let ele = '';
        if (this.props.pickupOptions != null) {
            ele = self.props.pickupOptions.map(function (data, index) {
                let checked = '';
                if (data.Selected) {
                    checked = "checked";
                }
                return (
                    <span className="full-width" key={data.Id}>
                        <input data-time="8 to 10 working days" type="radio"
                            name="delivery_method"
                            id={data.Id}
                            checked={checked}
                            onChange={(e) => self.props.selectDelivery(data)} />
                        <label htmlFor={data.Id} style={{ display: 'inline-flex'}}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} > {data.Name} </span>
                            <span> (Pick-up)</span>
                            <span className="item-price hide"></span>
                        </label>
                    </span>
                )
            });
        }
        return ele;
    }

    render() {
        var self = this;
        return (
            <div className="pcc-left pull-left">
                <div className="cart-box full-width">
                    <div className="cb-header">
                        <span className="cb-seller">{this.props.merchantDetail.DisplayName}</span>
                    </div>
                    <div className="cb-content">
                        <div className="cbc-left">
                            <div className="item-image">
                                <img src={this.props.invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.Media[0].MediaUrl}/>
                            </div>

                            <div className="item-info">
                                <p className="item-name">{this.props.invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.Name}</p>
                                <div className="item-price">
                                    <span className="item-price">
                                        {self.renderFormatMoney(self.props.invoiceDetails.Orders[0].CartItemDetails[0].CurrencyCode, self.props.invoiceDetails.Orders[0].CartItemDetails[0].ItemDetail.Price)}
                                    </span>
                                </div>
                                <div className="item-field">
                                    <span className="if-txt">
                                        <span>Quantity:</span>
                                        <span>{this.props.invoiceDetails.Orders[0].CartItemDetails[0].Quantity}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dr-content">
                        <div className="delivery-review">
                            <span className="title">Select your delivery method.</span>
                            <div className="dr-radio">
                                {this.renderShippingOptions()}
                                {this.renderPickupOptions()}
                            </div>
                        </div>
                    </div>
                    {self.renderMinimumLeadTime()}
                    <div><a href="#" className="view-compare-btn"
                        onClick={(e) => this.props.generateComparisonFile(this.props.invoiceDetails.Orders[0].ID)}>
                        Show My Comparison Table
                        </a></div>
                </div>
            </div>
        );
    }
}

module.exports = CheckoutReview;