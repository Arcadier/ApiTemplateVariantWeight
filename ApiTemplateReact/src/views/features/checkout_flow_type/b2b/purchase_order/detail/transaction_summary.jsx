'use strict';
var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class TransactionSummaryComponent extends BaseComponent {

    renderInvoiceInfo() {
        let links = [];
        if (this.props.detail && this.props.detail.PaymentDetails && this.props.detail.PaymentDetails.length > 0) {
            //let invoiceNos = this.props.detail.PaymentDetails.map((payment) => payment.InvoiceNo);
            //invoiceNos = [...new Set(invoiceNos)];

            //invoiceNos.map((invoiceNo, index) => {
            //    links.push(<a href={`/invoice/detail/${invoiceNo}`} key={index}><span className="highlight-text">{invoiceNo}</span></a>);
            //    links.push(<span key={'comma-' + index}> , </span>);
            //});

            //ARC10131

            let uniquePayments = this.getUnique(this.props.detail.PaymentDetails, 'InvoiceNo');
            if (uniquePayments) {
                uniquePayments.forEach(function (payment, index) {
                    links.push(<a href={`/invoice/detail/${payment.InvoiceNo}`} key={index}><span className="highlight-text">{payment.CosmeticNo != null && payment.CosmeticNo != "" ? payment.CosmeticNo : payment.InvoiceNo}</span></a>);
                    links.push(<span key={'comma-' + index}> , </span>);
                });

            }

            links.pop();

            return (
                <React.Fragment>
                    {links}
                </React.Fragment>
            );
        }

        return (<a href='#'><span className="highlight-text">-</span></a>);
    }

    renderReceivingNoteInfo() {
        let links = [];
        if (this.props.detail && this.props.detail.ReceivingNotes && this.props.detail.ReceivingNotes.length > 0) {
            this.props.detail.ReceivingNotes.map((note, index) => {
                if (!note.Void) {
                    links.push(<a href={`/receiving-note/detail?id=${note.ID}`} key={index}><span className="highlight-text">{note.CosmeticNo != null && note.CosmeticNo != "" ? note.CosmeticNo : note.ReceivingNoteNo}</span></a>);
                    links.push(<span key={'comma-' + index}>, </span>);
                }
            });

            links.pop();

            return (
                <React.Fragment>
                    {links}
                </React.Fragment>
            );
        }

        return (<a href='#' > <span className="highlight-text">-</span></a>);
    }

    render() {
        const detail = this.props.detail;
        let subTotal = 0;
        let shippingCost = 0;
        let discount = 0; // bulk pricing discount
        let quoteNo = "";
        let quoteID = "";
        let purchaseOrderNo = "";
        let requisitionOrderNo = "";
        let channelRedirect = "";
        let self = this;
        let chargeTotal = 0;
        let discountTotal = 0;
        let grandTotal = 0;
        let haveQuote = false;

        subTotal = detail.Total;
        shippingCost = detail.Freight;

        if (detail.PurchaseOrderNo) {
            purchaseOrderNo = detail.CosmeticNo != null && detail.CosmeticNo != "" ? detail.CosmeticNo : detail.PurchaseOrderNo;
        }
        //need to check chat.
        // quotation or bulk pricing discount
        discountTotal += detail.DiscountAmountNotRoundOff || 0;

        // quotation charge
        chargeTotal += detail.Surcharge || 0;

        if (detail.CartItemDetails) {
            detail.CartItemDetails.forEach(function (cartItemDetail) {
                if (cartItemDetail.DiscountAmount) {
                    //ARC10053  the discountamount should not be round off to have the correct value.
                    discount += cartItemDetail.DiscountAmount === null ? 0 : parseFloat(cartItemDetail.DiscountAmountNotRoundOff);
                }
                if (cartItemDetail.AcceptedOffer) {
                    channelRedirect = "/chat?channelId=" + cartItemDetail.AcceptedOffer.ChannelID;
                    quoteNo = cartItemDetail.AcceptedOffer.CosmeticNo != null && cartItemDetail.AcceptedOffer.CosmeticNo != "" ? cartItemDetail.AcceptedOffer.CosmeticNo : cartItemDetail.AcceptedOffer.QuoteNo;
                    quoteID = cartItemDetail.AcceptedOffer.ID;
                }
            });
        }
      //ARC10053  the discountamount should not be round off to have the correct value.
        grandTotal = (subTotal + shippingCost + chargeTotal) - discountTotal;

        // remove the bulk pricing discount since it should only contains quotation discount for display
        discountTotal -= discount;

        if (detail.RequisitionDetail) {
            requisitionOrderNo = detail.RequisitionDetail.CosmeticNo != null && detail.RequisitionDetail.CosmeticNo != "" ? detail.RequisitionDetail.CosmeticNo : detail.RequisitionDetail.RequisitionOrderNo;
        }

        const quoteRoute = quoteID ? `/quotation/detail?id=${quoteID}` : '#';
        const requisitionRoute = detail.RequisitionDetail && detail.RequisitionDetail.ID ? `/requisition/detail?id=${detail.RequisitionDetail.ID}` : '#';

        return (
            <section className="sassy-box box-order-total">
                <div className="sassy-box-content">
                    <div className="row">
                        <div className="col-md-4">
                            <table className="canon-table">
                                <tbody>
                                    <tr>
                                        <th>Quote No. :</th>
                                        <td data-th="Requisition Order No. :"><a href={quoteRoute}><span className="highlight-text">{quoteNo || '-'}</span></a></td>
                                    </tr>
                                    <tr>
                                        <th>Requisition Order No. :</th>
                                        <td data-th="Requisition Order No. :"><a href={requisitionRoute}><span className="highlight-text">{requisitionOrderNo || '-'}</span></a></td>
                                    </tr>
                                    <tr>
                                        <th>Purchase Order No. :</th>
                                        <td data-th="Requisition Order No. :"><a href="#"><span className="highlight-text inv">{purchaseOrderNo || '-'}</span></a></td>
                                    </tr>
                                    <tr>
                                        <th>Receiving Notes. :</th>
                                        <td data-th="Receiving Notes. :">{this.renderReceivingNoteInfo()}</td>
                                    </tr>
                                    <tr>
                                        <th>Invoice No. :</th>
                                        <td data-th="Invoice No. :">{this.renderInvoiceInfo()}</td>
                                    </tr>
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
                                    {/* <tr>
                                            <td>Tax(10%)</td>
                                            <td>USD $30.00</td>
                                        </tr> */}
                                </tbody>
                                <tfoot>
                                    <tr className="divider">
                                        <td colSpan={2} />
                                    </tr>
                                    <tr>
                                        <td>
                                            Total Cost
                                        </td>
                                        <td><span className="item-price"> {self.renderFormatMoney(detail.CurrencyCode, grandTotal)}</span></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {channelRedirect !== "" ? /* UN152*/
                            <div className="col-md-12">
                                <div className="spacer-20" />
                                {channelRedirect && <a href={channelRedirect} className="sassy-black-btn">Show Chat Log</a>}
                            </div> : ""
                        }
                    </div>
                </div>
            </section>
        );
    }
}

module.exports = TransactionSummaryComponent;