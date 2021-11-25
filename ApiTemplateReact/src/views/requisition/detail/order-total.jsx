'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class Total extends BaseComponent {

    getOrderSubTotal() {
        let Orders = null;
        if (this.props.requisitionDetail) {
            Orders = this.props.requisitionDetail.Orders
        }

        let subTotal = 0;
        if (Orders && Orders.length > 0) {
            Orders.map(order => {
                if (order.CartItemDetails && order.CartItemDetails.length > 0) {
                    const { CartItemDetails } = order;

            //ARC10053  the discountamount should not be round off to have the correct value.
                    CartItemDetails.map(cart => subTotal += parseFloat(cart.ItemDetail.Price * cart.Quantity) - parseFloat(cart.DiscountAmountNotRoundOff || 0));
                }
            });
            
        }   
        return subTotal;
    }

    getCurrencyCode() {
        if (this.props.requisitionDetail && this.props.requisitionDetail.Orders && this.props.requisitionDetail.Orders.length > 0) {
            return this.props.requisitionDetail.Orders[0].CurrencyCode;
        }
        return null;
    }

    getTotal() {
        const { requisitionDetail } = this.props;
        let total = 0;
        if (requisitionDetail && requisitionDetail.Orders && requisitionDetail.Orders.length > 0) {
            const { Orders } = requisitionDetail;
            Orders.map(order => total += order.GrandTotal);
        }
        return total;
    }

    getShippingCost() {
        const { requisitionDetail } = this.props;
        let cost = 0;
        if (requisitionDetail && requisitionDetail.Orders && requisitionDetail.Orders.length > 0) {
            const { Orders } = requisitionDetail;
            Orders.map(order => cost += order.Freight);
        }
        return cost;
    }

    renderChargesAndDiscounts() {
        let charges = 0;
        let discount = 0;
        const currencyCode = this.getCurrencyCode();
        const ChargeReasons = ['Bank Charges', 'Custom Duties', 'Taxes', 'Late Delivery', 'Freight Costs', 'Price Change', 'Others'];
        const QuantityOptions = ['Fixed', 'Percentage'];

        let Orders = null;
        if (this.props.requisitionDetail) {
            Orders = this.props.requisitionDetail.Orders
        }

        let offerDetails = [];
        if (this.props.pendingOffer && !this.props.pendingOffer.Accepted && !this.props.pendingOffer.Declined) {
            offerDetails = this.props.pendingOffer.OfferDetails;
        } else if (Orders && Orders[0] && Orders[0].CartItemDetails && Orders[0].CartItemDetails[0]) {
            const cart = Orders[0].CartItemDetails[0];
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
                    {
                        charges === 0 ? <td>-</td> :
                            <td><div className="item-price">{this.renderFormatMoney(currencyCode, charges)}</div></td>
                    }
                </tr>
                <tr>
                    <td>Discount(s)</td>
                    {
                        discount === 0 ? <td>-</td> :
                            <td><div className="item-price"><span>-</span> {this.renderFormatMoney(currencyCode, discount)}</div></td>
                    }
                </tr>
            </React.Fragment>
        )
    }

    getChatLogLink() {
        if (this.props.pendingOffer) {
            return "/chat?channelId=" + this.props.pendingOffer.ChannelID;
        } if (this.props.requisitionDetail && this.props.requisitionDetail.Orders && this.props.requisitionDetail.Orders.length > 0) {
            if (this.props.requisitionDetail.Orders[0].CartItemDetails && this.props.requisitionDetail.Orders[0].CartItemDetails[0] && this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer) {
                const channelId = this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer.ChannelID;
                return "/chat?channelId=" + channelId;
            }
        }
        return "#";
    }

    renderQuotationInfo() {
        let link ="#";
        let QuoteNo = '-';
        if (this.props.pendingOffer) {
            QuoteNo = this.props.pendingOffer.CosmeticNo != null && this.props.pendingOffer.CosmeticNo != "" ? this.props.pendingOffer.CosmeticNo : this.props.pendingOffer.QuoteNo;
            link =  "/quotation/detail?id=" + this.props.pendingOffer.ID;
        } else if (this.props.requisitionDetail && this.props.requisitionDetail.Orders && this.props.requisitionDetail.Orders.length > 0) {
            if (this.props.requisitionDetail.Orders[0].CartItemDetails && this.props.requisitionDetail.Orders[0].CartItemDetails[0] && this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer) {
                const id = this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer.ID;
                QuoteNo = this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo != null && this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo != "" ? this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo : this.props.requisitionDetail.Orders[0].CartItemDetails[0].AcceptedOffer.QuoteNo;
                link =  "/quotation/detail?id=" + id;
            }
        }
        return (<span className="highlight-text"><a href={link}>{QuoteNo}</a></span>)
    }

    renderRequisitionInfo() {
        let link = "#";
        let RequisitionOrderNo = '';
        if (this.props.requisitionDetail && this.props.requisitionDetail.ID) {
            RequisitionOrderNo = this.props.requisitionDetail.CosmeticNo != null && this.props.requisitionDetail.CosmeticNo != "" ? this.props.requisitionDetail.CosmeticNo : this.props.requisitionDetail.RequisitionOrderNo;
            //link = "/requisition/detail?requisitionId=" + this.props.requisitionDetail.ID; //ARC-8508
        }
        return (<span className="highlight-text inv">{RequisitionOrderNo}</span>)
    }

    renderPurchaseOrderInfo() {
        let link ="#";
        let PurchaseOrderNo = '-';
        if (this.props.requisitionDetail && this.props.requisitionDetail.Orders && this.props.requisitionDetail.Orders.length > 0) {
            if (this.props.requisitionDetail.Status == 'Approved' && this.props.requisitionDetail.Orders[0]) {
                const id = this.props.requisitionDetail.Orders[0].ID;
                PurchaseOrderNo = this.props.requisitionDetail.Orders[0].CosmeticNo != null && this.props.requisitionDetail.Orders[0].CosmeticNo != "" ? this.props.requisitionDetail.Orders[0].CosmeticNo : this.props.requisitionDetail.Orders[0].PurchaseOrderNo;
                link =  "/purchase/detail/orderid/" + id;
            }
        }
        return (<span className="highlight-text"><a href={link}>{PurchaseOrderNo}</a></span>)
    }

    renderReceivingNoteInfo() {
        const { requisitionDetail } = this.props;
        let links = [];

        if (requisitionDetail && requisitionDetail.Status == 'Approved' && requisitionDetail.Orders && requisitionDetail.Orders.length > 0) {
            if (requisitionDetail.Orders[0].ReceivingNotes && requisitionDetail.Orders[0].ReceivingNotes.length > 0) {
                const { ReceivingNotes } = requisitionDetail.Orders[0];

                ReceivingNotes.map((note, index) => {
                    if (!note.Void) {
                        links.push(<span className="highlight-text"><a href={`/receiving-note/detail?id=${note.ID}`} key={index}>{note.CosmeticNo != null && note.CosmeticNo != "" ? note.CosmeticNo : note.ReceivingNoteNo}</a></span>);
                        links.push(<span key={'comma-' + index}> , </span>);
                    }
                });

                links.pop();

                return (
                    <React.Fragment>
                        {links}
                    </React.Fragment>
                )
            }
        }

        return (<span className="highlight-text"><a href='#'>-</a></span>)
    }

    renderInvoiceNumber() {
        const { requisitionDetail } = this.props;
        const links = [];

        if (requisitionDetail && requisitionDetail.Orders && requisitionDetail.Orders.length > 0) {
            if (requisitionDetail.Orders[0].PaymentDetails) {
                const { PaymentDetails } = requisitionDetail.Orders[0];
                const uniqueInvoices = [];

                PaymentDetails.forEach((payment) => {
                    if (uniqueInvoices.indexOf(payment.InvoiceNo) < 0) {
                        uniqueInvoices.push(payment.InvoiceNo);

                        links.push(<span className="highlight-text"><a href={`/invoice/detail/${payment.InvoiceNo}`} key={payment.InvoiceNo}>{payment.CosmeticNo ? payment.CosmeticNo : payment.InvoiceNo}</a></span>);
                        links.push(<span key={'comma-' + payment.InvoiceNo}> , </span>);
                    }
                });

                links.pop();

                return (
                    <React.Fragment>
                        {links}
                    </React.Fragment>
                )
            }
        }

        return (<span className="highlight-text"><a href='#'>-</a></span>)
    }

	render() {
        const currencyCode = this.getCurrencyCode();
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
                                            <td data-th="Requisition Order No. :">{this.renderInvoiceNumber()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-4"></div>
                            <div className="col-md-4">
                                <table className="cost-table">
                                    <tbody>
                                        <tr>
                                            <td>Subtotal</td>
                                            <td><div className="item-price">{this.renderFormatMoney(currencyCode, this.getOrderSubTotal())}</div></td>
                                        </tr>
                                        {this.renderChargesAndDiscounts()}
                                        <tr>
                                            <td>Shipping Cost</td>
                                            {
                                                this.getShippingCost() === 0 ? <td>-</td> :
                                                    <td><div className="item-price">{this.renderFormatMoney(currencyCode, this.getShippingCost())}</div></td>
                                            }
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="divider">
                                            <td style={{ colSpan: '2' }}></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Total Cost
                                            </td>
                                            <td>
                                                <div className="item-price">{this.renderFormatMoney(currencyCode, this.getTotal())}</div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            { this.getChatLogLink() !== "#" ?
                            <div className="col-md-12">
                                <div className="spacer-20"></div>
                                <a href={this.getChatLogLink()} target={this.getChatLogLink() == '#'? null: '_blank'} className="sassy-black-btn">Show Chat Log</a>
                            </div> : ""
                            }
                        </div>
                    </div>
				</section>
			</React.Fragment>
		);
	}
}

module.exports = Total;