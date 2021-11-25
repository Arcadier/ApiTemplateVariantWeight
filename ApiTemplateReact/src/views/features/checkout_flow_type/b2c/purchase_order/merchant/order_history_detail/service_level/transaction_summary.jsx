'use strict';
var React = require('react');
const BaseComponent = require('../../../../../../../../views/shared/base');

class TransactionSummaryComponent extends BaseComponent {
    showChatLogButton() {
        let details = this.props.detail;
        return <a href={'/chat?channelId=' + details.Orders[0].CartItemDetails[0].AcceptedOffer.ChannelID} target="_blank" className="sassy-black-btn">Show Chat Log</a>
    }
    
    render() {
        const detail = this.props.detail;
        let subTotal = 0;
        let shippingCost = 0;
        let discount = 0; // bulk pricing discount
        let quoteNo = "";
        let quoteID = "";
        let purchaseOrderNo = "";
        let channelRedirect = "#";
        let self = this;
        let chargeTotal = 0;
        let discountTotal = 0;
        let grandTotal = 0;
        let haveQuote = false;
        detail.Orders.forEach(function (order) {
            subTotal += order.Total;
            shippingCost += order.Freight;
            if (order.PurchaseOrderNo) {
                purchaseOrderNo = order.PurchaseOrderNo;
            }

            // quotation or bulk pricing discount
            discountTotal += order.DiscountAmount || 0;

            // quotation charge
            chargeTotal += order.Surcharge || 0;

            if (order.CartItemDetails) {
                order.CartItemDetails.forEach(function (cartItemDetail) {
                    if (cartItemDetail.DiscountAmount) {
                        discount += cartItemDetail.DiscountAmount === null ? 0 : cartItemDetail.DiscountAmount;
                    }
                    if (cartItemDetail.AcceptedOffer) {
                        channelRedirect = "/chat?channelId=" + cartItemDetail.AcceptedOffer.ChannelID;
                        quoteNo = cartItemDetail.AcceptedOffer.QuoteNo;
                        quoteID = cartItemDetail.AcceptedOffer.ID;
                    }
                });
            }
        });

        grandTotal = (subTotal + shippingCost + chargeTotal) - discountTotal;

        // remove the bulk pricing discount since it should only contains quotation discount for display
        discountTotal -= discount;
        return (
            <section className="sassy-box box-order-total">
                <div className="sassy-box-content">
                    <div className="row">
                        <div className="col-md-4">
                            <h4>Notes to seller</h4>
                            <p>{detail.Orders[0].CartItemDetails[0].Notes}</p>
                            <p>
                                {detail.Orders[0].CartItemDetails[0].AcceptedOffer && detail.Orders[0].CartItemDetails[0].AcceptedOffer.Accepted===true ? this.showChatLogButton():''}
                            </p>
                        </div>
                        <div className="col-md-4" />
                        <div className="col-md-4">
                            <table className="cost-table">
                                <tbody>
                                    <tr>
                                        <td>Subtotal</td>
                                        <td><div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.renderFormatMoney(detail.CurrencyCode, subTotal - discount)}</span></div></td>
                                    </tr>
                                    <tr>
                                        <td>Shipping Cost</td>
                                        <td><div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.renderFormatMoney(detail.CurrencyCode, shippingCost)}</span></div></td>
                                    </tr>
                                    <tr>
                                        <td>Charge(s)</td>
                                        <td><div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.renderFormatMoney(detail.CurrencyCode, chargeTotal)}</span></div></td>
                                    </tr>
                                    <tr>
                                        <td>Discount(s)</td>
                                        <td><div className="item-price"><span> - </span><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.renderFormatMoney(detail.CurrencyCode, discountTotal)}</span></div></td>
                                    </tr>
                                    <tr>
                                        <td>Admin Fee</td>
                                        <td><div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.renderFormatMoney(detail.CurrencyCode, detail.Fee)}</span></div></td>
                                    </tr>
                                    {/* <tr>
                                            <td>Tax(10%)</td>
                                            <td>USD $30.00</td>
                                        </tr> */}
                                </tbody>
                                <tfoot>
                                    <tr className="divider remove-bg">
                                        <td colSpan={2} />
                                    </tr>
                                    <tr>
                                        <td>
                                            Total Cost
                                        </td>
                                        <td><div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.renderFormatMoney(detail.CurrencyCode, detail.Total)}</span></div></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="col-md-12">
                            <div className="spacer-20" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

module.exports = TransactionSummaryComponent;