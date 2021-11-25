'use strict';
var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class TransactionDetailComponent extends BaseComponent {
    showAddress(info) {
        if (typeof info !== undefined && info !== null && info !== '') {
            return (
                <React.Fragment>
                    {info}<br />
                  </React.Fragment>
            )
        }

        return null;
    }

    showPaymentDetails(paymentDetails) {
        if (paymentDetails && typeof paymentDetails != 'undefined' && paymentDetails.length > 0) {
            return paymentDetails[0].Gateway.Gateway
        }

        return '';
    }

    renderBuyerDetails() {
        const buyer = this.props.detail.Orders[0].ConsumerDetail;

        return (
            <div className="col-md-3">
                <div className="br-info">
                    <p className="br-label mr-none">Buyer Info</p>
                    <p className="br-detail name">{buyer.DisplayName}</p>
                </div>
                <div className="br-info">
                    <p className="br-label mr-none">Email</p>
                    <p className="br-detail email">{buyer.Email}</p>
                </div>
                <div className="br-info">
                    <p className="br-label mr-none">Contact</p>
                    <p className="br-detail number">{buyer.PhoneNumber}</p>
                </div>
            </div>
        )
    }

    renderShippingAddress() {
        const shippingAddress = this.props.detail.Orders[0].DeliveryToAddress;
        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;

        return (
            <div className="col-md-3">
                <div className="br-info">
                    <p className="br-label">Delivery Address</p>
                    <p className="br-detail address">{buyerName}<br />
                        {this.showAddress(shippingAddress.Line1)}
                        {this.showAddress(shippingAddress.Line2)}
                        {this.showAddress(shippingAddress.Country)}
                        {this.showAddress(shippingAddress.City)}
                        {this.showAddress(shippingAddress.State)}
                        {this.showAddress(shippingAddress.PostCode)}
                    </p>
                </div>
            </div>
        )
    }

    renderTransactionAmounts() {
        const detail = this.props.detail;
        let subTotal = 0;
        let shippingCost = 0;
        let discount = 0;
        let self = this;
        detail.Orders.forEach(function (order) {
            subTotal += order.Total;
            shippingCost += order.Freight;
            if (order.CartItemDetails) {
                order.CartItemDetails.forEach(function (cartItemDetail) {
                    if (cartItemDetail.DiscountAmount) {
                        discount += cartItemDetail.DiscountAmount === null ? 0 : cartItemDetail.DiscountAmount;
                    }                  
                });
            }
        });

        return (
            <div className="col-md-4 pull-right">
                <div className="br-info">
                    <p className="br-label">Transaction Total</p>
                    <div className="transaction-info">
                        <div className="ammount sub-total">
                            Sub-Total
                            <div className="item-price">
                                {self.renderFormatMoney(detail.CurrencyCode,subTotal)}
                            </div>
                        </div>
                        <div className="ammount delivery-cost">
                            Delivery Cost
                            <div className="item-price">
                                {self.renderFormatMoney(detail.CurrencyCode, shippingCost)}
                            </div>
                        </div>
                        <div className="ammount delivery-cost">
                            Discount
                            <div className="item-price">- {self.renderFormatMoney(detail.CurrencyCode, discount)}
                            </div>
                        </div>
                        <div className="ammount discount">
                            Admin fees
                            <div className="item-price">- {self.renderFormatMoney(detail.CurrencyCode, detail.Fee)}
                            </div>
                        </div>
                    </div>
                    <div className="sum-ammount total text-right">
                        <span className="small-lbl total">Total</span>
                        <div className="item-price total-amount">
                            {self.renderFormatMoney(detail.CurrencyCode, subTotal + shippingCost - discount - detail.Fee)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const detail = this.props.detail;
        const order = detail.Orders[0];

        return (
            <div className="order-box">
                <div className="oreder-detail-head">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="orddtl-label">
                                <span className="orddtl-title">ORDER ID</span>
                                <p className="orddtl-data">{order.ID.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="orddtl-label">
                                <span className="orddtl-title">INVOICE ID</span>
                                <p className="orddtl-data">{detail.InvoiceNo}</p>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="orddtl-label">
                                <span className="orddtl-title">PAYMENT METHOD</span>
                                <p className="orddtl-data">{this.showPaymentDetails(order.PaymentDetails)}</p>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="orddtl-label">
                                <span className="orddtl-title">TRANSACTION ID</span>
                                <p className="orddtl-data">{detail.InvoiceNo}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="orddtl-label">
                                <div className="pull-right">
                                    <p className="orddtl-date">{this.formatDate(order.CreatedDateTime)}</p>
                                    <p className="orddtl-time">{this.formatTime(order.CreatedDateTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="order-detail-row">
                    <div className="row">
                        {this.renderBuyerDetails()}
                        {this.renderShippingAddress()}
                        {this.renderTransactionAmounts()}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TransactionDetailComponent;