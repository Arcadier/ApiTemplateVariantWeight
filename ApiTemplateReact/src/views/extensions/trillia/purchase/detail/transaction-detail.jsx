'use strict';
var React = require('react');

var BaseComponent = require('../../../../shared/base');
class TransactionDetailComponent extends BaseComponent {
    renderShippingAddress() {
        const shippingAddress = this.props.detail.Orders[0].DeliveryToAddress;
        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;

        return (
            <div className="occtl-left">
                <div className="title-detail">
                    <span className="title">Shipping Address</span>
                    <span className="detail">
                        <p>{buyerName}</p>
                        <p>{shippingAddress.Line1}</p>
                        <p>{shippingAddress.Line2}</p>
                        <p>{shippingAddress.Country}</p>
                        <p>{shippingAddress.City}</p>
                        <p>{shippingAddress.State}</p>
                        <p>{shippingAddress.PostCode}</p>
                    </span>
                </div>
            </div>
        );
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
            <div className="title-detail">
                <span className="title">Transaction Details</span>
                <span className="detail">
                    <div className="full-left">
                        <span className="d-left">
                            <p>Sub-Total</p>
                        </span>
                        <span className="d-right">
                            <span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, subTotal)}</span>
                        </span>
                    </div>
                    <div className="full-left">
                        <span className="d-left">
                            <p>Shipping Costs</p>
                        </span>
                        <span className="d-right">
                            <span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, shippingCost)}</span>
                        </span>
                    </div>
                    <div className="full-left">
                        <span className="d-left">
                            <p>Discount</p>
                        </span>
                        <span className="d-right">
                            <span className="item-price"> -{self.renderFormatMoney(detail.CurrencyCode, discount)}</span>
                        </span>
                    </div>
                    <div className="pccr-total full-left">
                        <span className="pccrt-sml">Total</span>
                        <span className="total-amount">
                            <div className="item-price">
                                <span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, (subTotal + shippingCost) - discount)}</span>
                            </div>
                        </span>
                    </div>
                </span>
            </div>
        );
    }

    render() {
        const detail = this.props.detail;
        const order = detail.Orders[0];

        return (
            <div className="osc-container">
                <div className="oscc-tbl full-width">
                    <div className="oscct-top full-width">
                        <div className="occt-left">
                            <span className="title">PO No. </span>
                            <span>{order.ID.toUpperCase()}</span>&nbsp;
                            <span className="title">Invoice No. </span>
                            <span>{detail.InvoiceNo}</span>
                        </div>
                        <div className="occt-right">
                            <span>{this.formatDate(order.CreatedDateTime)}</span>
                            <span>{this.formatTime(order.CreatedDateTime)}</span>
                        </div>
                    </div>
                    <div className="oscct-bot full-width">
                        <div className="occt-left">
                            {this.renderShippingAddress()}
                            <div className="occtl-right">
                                <div className="title-detail">
                                    <span className="title">Payment Type</span>
                                    <span className="detail">
                                        <p>N/A</p>
                                    </span>
                                </div>
                                <div className="title-detail">
                                    <span className="title">Payment Status</span>
                                    <span className="detail">
                                        <p>N/A</p>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="occt-right">
                            {this.renderTransactionAmounts()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TransactionDetailComponent;