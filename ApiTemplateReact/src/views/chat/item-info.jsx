'use strict';
var React = require('react');
const BaseComponent = require('../shared/base');
const Currency = require('currency-symbol-map');

class ChatItemInformationComponent extends BaseComponent {



    renderAddons() {
        var self = this;
        if (self.props.cartItemDetail.AddOns) {
            var addons = self.props.cartItemDetail.AddOns;
            const { CurrencyCode} = self.props.cartItemDetail.ItemDetail;

            return (
                <span className="if-txt">
                    <span>Add-ons:</span>
                    <span>
                        {
                            addons.map(function (e) {
                                return (<div>{e.Name} +{CurrencyCode} {Currency(CurrencyCode)}{e.PriceChange}</div>)
                            })
                        }
                    </span>
                </span>
            )
        }
    }


    renderTimeInfo(itemDetail) {
        var tempDurationUnit = itemDetail.DurationUnit

        if (tempDurationUnit.includes('hour') || tempDurationUnit.includes('minute')) {
            return <li className="user-product-info-quantity test">Time: <span>{this.rawFormatTime(bookingSlot.FromDateTime)} to {this.rawFormatTime(bookingSlot.ToDateTime)}</span></li>
        }
        else {
            return ''
        }
    }

    isSpaceTimeApiTemplate() {
        var self = this;
        return process.env.PRICING_TYPE == 'service_level'
    }




    renderAdditionalInformation(itemDetail) {

        var self = this;

        if (this.isSpaceTimeApiTemplate() && itemDetail != null) {
            var bookingSlot = self.props.cartItemDetail.BookingSlot;
            return (<React.Fragment>

                <li className="user-product-info-price">Date: <span>{this.rawFormatDate(bookingSlot.FromDateTime)} to {this.rawFormatDate(bookingSlot.ToDateTime)}</span></li>

                {
                    self.canShowTime(itemDetail) ?
                        <li className="user-product-info-quantity test">Time: <span>{this.rawFormatTime(bookingSlot.FromDateTime)} to {this.rawFormatTime(bookingSlot.ToDateTime)}</span></li>
                        : ''
                }

                {
                    self.canShowDuration(itemDetail) ?
                        <li className="user-product-info-quantity">No of {self.fetchDurationStr(itemDetail)}: <span>{bookingSlot.Duration}</span></li>
                        : ''
                }

                {
                    self.canShowUnit(itemDetail) ?
                        <li className="user-product-info-quantity">No of {self.fetchUnitStr(itemDetail)}: <span>{self.props.cartItemDetail.Quantity}</span></li>
                        : ''
                }

                <li className="user-product-info-quantity">{self.renderAddons()}</li>
            </React.Fragment>)
        }
        else {
            return (
                <React.Fragment>
                    <li className="user-product-info-price">Price per item: <span>{self.props.renderFormatMoney(itemDetail.CurrencyCode, itemDetail.Price)}</span></li>
                    <li className="user-product-info-quantity">Order Quantity: <span>{self.props.orderQuantity}</span></li>
                </React.Fragment>
            )
        }

    }


    render() {
        const self = this;

        const itemDetail = self.props.itemDetail ? self.props.itemDetail : { Name: "", CurrencyCode: "", Price: 0 };
        let imageSource = self.props.itemDetail && self.props.itemDetail.Media ? self.props.itemDetail.Media[0].MediaUrl : "";

        return (
            <div>
                <div className="user-product-image">
                    <img src={imageSource} alt="user-product-info" title="Product Info" />
                </div>
                <ul className="user-product-container">
                    <li className="user-product-info-name product-name">{itemDetail.Name}</li>
                    {self.renderAdditionalInformation(itemDetail)}
                </ul>
            </div>
        );
    }
}

module.exports = ChatItemInformationComponent;