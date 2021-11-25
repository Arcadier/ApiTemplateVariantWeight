'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');
const Currency = require('currency-symbol-map');

class DetailComponent extends BaseComponent {
    renderDetails() {
        const self = this;
        const { details, currencyCode, itemImageUrl, cartItemDetail } = this.props

        return (
            details.map((detail, index) => {
                if (index == 0) {
                    return (
                        <tr key={detail.ID}>

                            <td data-th="Item Description">
                                <div className="flex-wrap">
                                    <div className="thumb-group">
                                        <img src={itemImageUrl} alt="Item" style={{ maxWidth: '64px' }} />
                                    </div>
                                    <div className="po-content">
                                        <span>{detail.Name}
                                            <div className="item-field">
                                                {self.renderVariants()}
                                                <div dangerouslySetInnerHTML={{ __html: self.renderCartItemDetails() }} />
                                                {self.renderAddons()}
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            {self.renderQuantity(detail.Type, detail.Quantity, index)}
                            {self.renderUnitPrice(detail.Type, detail.Price)}
                            <td data-th="Total Cost"><div className="item-price">{self.renderFormatMoney(currencyCode, detail.TotalAmount)}</div></td>
                        </tr>
                    )
                }

                return (
                    <tr key={detail.ID} className={index == details.length - 1 ? "extra bt-none" : "extra bb-none"}>
                        <td data-th="Item Description">
                            <div className="thumb-group">
                                <div><span><b>{detail.Name}</b></span></div>
                                <div><span>- {detail.Description}</span></div>
                            </div>
                        </td>
                        {self.renderQuantity(detail.Type, detail.Quantity, index)}
                        {self.renderUnitPrice(detail.Type, detail.Price)}
                        <td data-th="Total Cost"><div className="item-price">{self.renderFormatMoney(currencyCode, detail.TotalAmount)}</div></td>
                    </tr>
                )
            })
        );
    }


    isSpaceTimeApiTemplate() {
        var self = this;
        return typeof self.props.cartItemDetail.BookingSlot != 'undefined' && self.props.cartItemDetail.BookingSlot != null;
    }

    renderAddons() {

        var self = this;

        if (self.isSpaceTimeApiTemplate()) {
            var cartItemDetail = self.props.cartItemDetail;
            var bookingSlot = self.props.cartItemDetail.BookingSlot
            const { CurrencyCode } = self.props.cartItemDetail.ItemDetail;

            var self = this;
            if (cartItemDetail.AddOns) {
                var addons = cartItemDetail.AddOns;

                return (
                    <span className="if-txt">
                        <span>Add-ons:</span>
                        <span>
                            {
                                addons.map(function (e) {
                                    return (<div className="renderAddons">{e.Name} +{CurrencyCode} {Currency(CurrencyCode)}{e.PriceChange}</div>)
                                })
                            }
                        </span>
                    </span>
                )
            }
        }
    }

    renderCartItemDetails() {
        var self = this;
        if (self.isSpaceTimeApiTemplate()) {
            var strintBuilder = [];
            var cartItemDetail = self.props.cartItemDetail;
            var bookingSlot = self.props.cartItemDetail.BookingSlot
            var { ItemDetail } = cartItemDetail;

            strintBuilder.push(`<br/>`)
            strintBuilder.push(`<p class='description-row'><span class='row-label'>Date:</span> <span class='row-value'>${self.rawFormatDate(bookingSlot.FromDateTime)} to ${self.rawFormatDate(bookingSlot.ToDateTime)}</span></p>`)

            if (self.canShowTime(ItemDetail)) {
                strintBuilder.push(`<p className='description-row'><span className='row-label'>Time:</span> <span className='row-value'>${self.rawFormatTime(bookingSlot.FromDateTime)} to ${self.rawFormatTime(bookingSlot.ToDateTime)}</span></p>`)
            }

            if (self.canShowDuration(ItemDetail)) {
                strintBuilder.push(`<p className='description-row'><span className='row-label'>No of ${self.fetchDurationStr(ItemDetail)}:</span> <span className='row-value'>${bookingSlot.Duration}</span></p>`)
            }

            if (self.canShowUnit(ItemDetail)) {
                strintBuilder.push(`<p className='description-row'><span className='row-label'>No of ${self.fetchUnitStr(ItemDetail)}:</span> <span className='row-value'>${cartItemDetail.Quantity}</span></p>`)
            }

            return strintBuilder.join('').toString()
        }
    }


    renderQuantity(type, quantity, indexLoop) {

        if (indexLoop < 1 && this.isSpaceTimeApiTemplate())
            return <td className="black-color" data-th="Quantity"></td>

        if (type == 'Quantity') {
            return (
                <td className="black-color" data-th="Quantity">{quantity}</td>
            )
        }

        return (
            <td className="black-color" data-th="Quantity">{type}</td>
        )
    }

    renderUnitPrice(type, price) {
        if (this.props.isSpaceTimeApiTemplate)
            return <td data-th="Unit Price"><div className="item-price"></div></td>

        const { currencyCode } = this.props;

        if (type == 'Percentage') {
            return (
                <td data-th="Unit Price"><div className="item-price">{parseFloat(price * 100).toFixed(2)}%</div></td>
            )
        }

        return (
            <td data-th="Unit Price"><div className="item-price">{this.renderFormatMoney(currencyCode, price)}</div></td>
        );
    }

    renderVariants() {
        const { cartItemDetail = {} } = this.props;
        let variant = null;
        if (cartItemDetail.ItemDetail.Variants && cartItemDetail.ItemDetail.Variants.length > 0) {
            variant = cartItemDetail.ItemDetail.Variants.map(item => {
                return (
                    <div key={item.GroupName}>{`${item.GroupName}: ${item.Name}`}</div>
                )
            });
        }
        return variant;
    }

    render() {
        return (
            <div className="col-md-8">
                <div className="table-responsive">
                    <table className="table order-data1 table-items">
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>{this.isSpaceTimeApiTemplate() ? '' : 'Quantity'}</th>
                                <th>{this.isSpaceTimeApiTemplate() ? '' : 'Unit Price'}</th>
                                <th width="171px">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderDetails()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

module.exports = DetailComponent;