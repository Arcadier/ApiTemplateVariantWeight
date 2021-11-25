'use strict';
var React = require('react');
const BaseComponent = require('../../../../../../../../views/shared/base');

class TransactionSummaryComponent extends BaseComponent {

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
                        quoteNo = cartItemDetail.AcceptedOffer.CosmeticNo != null && cartItemDetail.AcceptedOffer.CosmeticNo != "" ? cartItemDetail.AcceptedOffer.CosmeticNo : cartItemDetail.AcceptedOffer.QuoteNo;
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
                        {
                            quoteNo === "" & channelRedirect !== "#" ?
                                <div className="col-md-4">
                                    <a href={channelRedirect} className="sassy-black-btn">Show Chat Log</a>
                                </div> : ""
                        }
                        <div className="col-md-4">
                            <table className="canon-table">
                                <tbody>
                                    {
                                        quoteNo !== "" ?
                                            <tr>
                                                <th>Quote No. :</th>
                                                <td data-th="Requisition Order No. :"><a href={"/quotation/detail?id=" + quoteID}><span className="highlight-text">{quoteNo}</span></a></td>
                                            </tr> : ""
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-4" />
                        <div className="col-md-4">
                            <table className="cost-table">
                                <tbody>
                                    <tr>
                                        <td>Subtotal</td>
                                        <td><span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, subTotal - discount)}</span></td>
                                    </tr>
                                    <tr>
                                        <td>Charge(s)</td>
                                        {
                                            chargeTotal === 0 ? <td><span className="item-price">-</span></td>
                                                : <td><span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, chargeTotal)}</span></td>
                                        }

                                    </tr>
                                    <tr>
                                        <td>Discount(s)</td>
                                        {
                                            discountTotal === 0 ? <td><span className="item-price">-</span></td>
                                                :
                                                <td>
                                                    <span>-</span>
                                                    <span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, discountTotal)}</span>
                                                </td>
                                        }
                                    </tr>
                                    <tr>
                                        <td>Shipping Cost</td>
                                        {
                                            shippingCost === 0 ? <td><span className="item-price">-</span></td>
                                                :
                                                <td>
                                                    <span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, shippingCost)}</span>
                                                </td>
                                        } 
                                    </tr>
                                    <tr>
                                        <td>Admin Cost</td>
                                        <td>
                                            <span>-</span>
                                            <span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, detail.Fee)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="divider">
                                        <td colSpan={2} />
                                    </tr>
                                    <tr>
                                        <td>
                                            Total Cost
                                        </td>
                                        <td><span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, detail.Total)}</span></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {
                            quoteNo !== "" & channelRedirect !== "#" ?
                                <div className="col-md-12">
                                    <div className="spacer-20" />
                                    <a href={channelRedirect} className="sassy-black-btn">Show Chat Log</a>
                                </div> : ""
                        }
                       
                    </div>
                </div>
            </section>
        );
    }
}

module.exports = TransactionSummaryComponent;