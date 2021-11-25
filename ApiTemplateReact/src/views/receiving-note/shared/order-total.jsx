'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class OrderTotalComponent extends BaseComponent {
    getCurrencyCode() {
        return this.props.orderDetail.CurrencyCode;
    }

    getSubTotal() {
        // no bulk or nego: qty * unit price
        // with bulk: qty * (unit price - bulk pricing)
        let subTotal = 0;
        if (this.props.orderDetail && this.props.orderDetail.CartItemDetails && this.props.orderDetail.CartItemDetails.length > 0) {
            const { CartItemDetails } = this.props.orderDetail;
            CartItemDetails.map(cart => subTotal += parseFloat(cart.ItemDetail.Price * cart.Quantity) - parseFloat(cart.DiscountAmountNotRoundOff || 0));
        }   
        return subTotal;
    }

    renderChargesAndDiscount() {
        let charges = 0;
        let discount = 0;
        const currencyCode = this.getCurrencyCode();
        const ChargeReasons = ['Bank Charges', 'Custom Duties', 'Taxes', 'Late Delivery', 'Freight Costs', 'Price Change', 'Others'];
        const QuantityOptions = ['Fixed', 'Percentage'];
        let offerDetails = [];        
        const Order = this.props.orderDetail;        
        if (Order && Order.CartItemDetails && Order.CartItemDetails[0]) {
            const cart = Order.CartItemDetails[0];
            if (cart.AcceptedOffer && cart.AcceptedOffer.Accepted) {
                offerDetails = cart.AcceptedOffer.OfferDetails;
            }     
        }

        const arr = offerDetails.slice(1);
        if (arr && arr.length > 0) {
            arr.map(quotation => {
                if (quotation.IsDiscount) discount += parseFloat(quotation.TotalAmount);
                else {
                    if (ChargeReasons.includes(quotation.Name)) {
                        charges += parseFloat(quotation.TotalAmount);
                    }
                }
            });
        }
        return (
            <React.Fragment>
                <tr>
                    <td>Charge(s)</td>
                    <td><div className="item-price">{this.renderFormatMoney(currencyCode, charges)}</div></td>
                </tr>
                <tr>
                    <td>Discount(s) </td>
                    <td><div className="item-price"><span>-</span>{this.renderFormatMoney(currencyCode, discount)}</div></td>
                </tr>
            </React.Fragment>
        )
    }

    getShippingCost() {
        return this.props.orderDetail.Freight || 0;
    }

    getTotal() {
        return this.props.orderDetail.GrandTotal;
    }


    getChatLogLink() {
        if (this.props.orderDetail && this.props.orderDetail.CartItemDetails && this.props.orderDetail.CartItemDetails[0] && this.props.orderDetail.CartItemDetails[0].AcceptedOffer) {
            const channelId = this.props.orderDetail.CartItemDetails[0].AcceptedOffer.ChannelID;
            return <a href={"/chat?channelId=" + channelId} className="sassy-black-btn">Show Chat Log</a>;
        }
         return "";
    }

    renderQuotationInfo() {
        const { CartItemDetails } = this.props.orderDetail;
        let link = "#";
        let quoteNo = '-';

        if (CartItemDetails && CartItemDetails[0].AcceptedOffer) {
            link = "/quotation/detail?id=" + CartItemDetails[0].AcceptedOffer.ID;
          //  quoteNo = CartItemDetails[0].AcceptedOffer.QuoteNo;
            //ARC10131
            quoteNo = CartItemDetails[0].AcceptedOffer.CosmeticNo != null && CartItemDetails[0].AcceptedOffer.CosmeticNo != "" ? CartItemDetails[0].AcceptedOffer.CosmeticNo : CartItemDetails[0].AcceptedOffer.QuoteNo;
        }

        return (<a href={link}><span className="highlight-text">{quoteNo}</span></a>);
    }

    renderRequisitionInfo() {
        const { RequisitionDetail } = this.props.orderDetail;
        let link = "#";
        let requisitionOrderNo = '-';

        if (RequisitionDetail) {
            link = "/requisition/detail?id=" + RequisitionDetail.ID;
         //   requisitionOrderNo = RequisitionDetail.RequisitionOrderNo;
            //ARC10131
            requisitionOrderNo = RequisitionDetail.CosmeticNo != null && RequisitionDetail.CosmeticNo != "" ? RequisitionDetail.CosmeticNo : RequisitionDetail.RequisitionOrderNo
        }

        return (<a href={link}><span className="highlight-text">{requisitionOrderNo}</span></a>);
    }

    renderPurchaseOrderInfo() {
        const { orderDetail } = this.props;
        let link = "/purchase/detail/orderid/" + orderDetail.ID;
      //  let purchaseOrderNo = orderDetail.PurchaseOrderNo;
        //ARC10131
       let purchaseOrderNo = orderDetail.CosmeticNo != null && orderDetail.CosmeticNo != "" ? orderDetail.CosmeticNo : orderDetail.PurchaseOrderNo; 
        return (<a href={link}><span className="highlight-text">{purchaseOrderNo}</span></a>);
    }

    renderReceivingNoteInfo() {
        const { ReceivingNotes } = this.props.orderDetail;
        let elements = [];

        if (ReceivingNotes) {
            ReceivingNotes.map((note, index) => {
                if (!note.Void) {
                    elements.push(<a href={`/receiving-note/detail?id=${note.ID}`} key={index}><span className="highlight-text inv">{note.CosmeticNo != null && note.CosmeticNo != "" ? note.CosmeticNo : note.ReceivingNoteNo}</span></a>);
                    elements.push(<span key={'comma-' + index}> , </span>);
                }
            });

            elements.pop();

            return (
                <React.Fragment>
                    {elements}
                </React.Fragment>
            )
        }

        return (<a href='#'><span className="highlight-text">-</span></a>);
    }

    renderInvoiceInfo() {
        const { PaymentDetails } = this.props.orderDetail;
        let elements = [];

        if (PaymentDetails) {
            //let invoiceNos = PaymentDetails.map((payment) => payment.InvoiceNo);
            //invoiceNos = [...new Set(invoiceNos)];

            //invoiceNos.map((invoiceNo, index) => {
            //    elements.push(<a href={`/invoice/detail/${invoiceNo}`} key={index}><span className="highlight-text">{invoiceNo}</span></a>);
            //    elements.push(<span key={'comma-' + index}> , </span>);
            //});

            //ARC10131
            let uniquePayments = this.getUnique(PaymentDetails, 'InvoiceNo');
            if (uniquePayments) {
                uniquePayments.forEach(function (payment, index) {
                    elements.push(<a href={`/invoice/detail/${payment.InvoiceNo}`} key={index}><span className="highlight-text">{payment.CosmeticNo != null && payment.CosmeticNo != "" ? payment.CosmeticNo : payment.InvoiceNo}</span></a>);
                    elements.push(<span key={'comma-' + index}> , </span>);
                });
            }

            elements.pop();

            return (
                <React.Fragment>
                    {elements}
                </React.Fragment>
            )
        }

        return (<a href='#'><span className="highlight-text">-</span></a>);
    }

    render() {
        return (
            <React.Fragment>
                <section className="sassy-box box-order-total">
                    <div className="sassy-box-content">
                        <div className="row">
                            <div className="col-md-4">
                                <table className="canon-table">
                                    <tbody>
                                        <tr>
                                            <th>Quote No. :</th>
                                            <td data-th="Requisition Order No. :">{this.renderQuotationInfo()}</td>
                                        </tr>
                                        <tr>
                                            <th>Requisition Order No. :</th>
                                            <td data-th="Requisition Order No. :">{this.renderRequisitionInfo()}</td>
                                        </tr>
                                        <tr>
                                            <th>Purchase Order No. :</th>
                                            <td data-th="Requisition Order No. :">{this.renderPurchaseOrderInfo()}</td>
                                        </tr>
                                        <tr>
                                            <th>Receiving Notes :</th>
                                            <td data-th="Requisition Order No. :">{this.renderReceivingNoteInfo()}</td>
                                        </tr>
                                        <tr>
                                            <th>Invoice No. :</th>
                                            <td data-th="Requisition Order No. :">{this.renderInvoiceInfo()}</td>
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
                                            <td><div className="item-price">{this.renderFormatMoney(this.getCurrencyCode(), this.getSubTotal())}</div></td>
                                        </tr>
                                        {this.renderChargesAndDiscount()}
                                        <tr>
                                            <td>Shipping Cost</td>
                                            <td><div className="item-price">{this.renderFormatMoney(this.getCurrencyCode(), this.getShippingCost())}</div></td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="divider">
                                            <td colSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td>Total Cost</td>
                                            <td>
                                                <div className="item-price">{this.renderFormatMoney(this.getCurrencyCode(), this.getTotal())}</div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="col-md-12">
                                <div className="spacer-20"></div>
                                {this.getChatLogLink()}
                            </div>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

module.exports = OrderTotalComponent;