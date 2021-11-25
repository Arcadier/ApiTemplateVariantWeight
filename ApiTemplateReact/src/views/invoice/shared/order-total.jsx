'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class OrderTotal extends BaseComponent {
	getOrderSubTotal() {
        const { Orders } = this.props.invoiceDetail;
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
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            return this.props.invoiceDetail.Orders[0].CurrencyCode;
        }
        return null;
    }

    getTotal() {
        const { invoiceDetail } = this.props;
        let total = 0;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { Orders } = invoiceDetail;
            Orders.map(order => total += order.GrandTotal);
        }
        return total;
    }

    getShippingCost() {
        const { invoiceDetail } = this.props;
        let cost = 0;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { Orders } = invoiceDetail;
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
        const { Orders } = this.props.invoiceDetail;
        let offerDetails = [];
		
		if (Orders && Orders[0] && Orders[0].CartItemDetails && Orders[0].CartItemDetails[0]) {
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
                            <td>{this.renderFormatMoney(currencyCode, charges)}</td>
                    }
                </tr>
                <tr>
                    <td>Discount(s)</td>
                    {
                        discount === 0 ? <td>-</td> :
                            <td><span>-</span> {this.renderFormatMoney(currencyCode, discount)}</td>
                    }
                </tr>
            </React.Fragment>
        )
    }

    getChatLogLink() {
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0].CartItemDetails && this.props.invoiceDetail.Orders[0].CartItemDetails[0] && this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer) {
                const channelId = this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.ChannelID;
                return <a href={"/chat?channelId=" + channelId} className="sassy-black-btn">Show Chat Log</a>;
            }
        }
        return "";
    }

    renderQuotationInfo() {
        let link ="#";
        let QuoteNo = '-';
        
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0].CartItemDetails && this.props.invoiceDetail.Orders[0].CartItemDetails[0] && this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer) {
                const id = this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.ID;
                QuoteNo = this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo != null && this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo != "" ? this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo : this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.QuoteNo;
                link =  "/quotation/detail?id=" + id;
            }
        }
        return (<a href={link}><span className="highlight-text">{QuoteNo}</span></a>)
    }

    renderPurchaseOrderInfo() {
        let link ="#";
        let PurchaseOrderNo = '-';
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0]) {
                const id = this.props.invoiceDetail.Orders[0].ID;
                const merchantId = + "/merchant/" + this.props.invoiceDetail.Orders[0].MerchantDetail.ID;
               // PurchaseOrderNo = this.props.invoiceDetail.Orders[0].PurchaseOrderNo || '-';
                //ARC10131
                PurchaseOrderNo = this.props.invoiceDetail.Orders[0].CosmeticNo != null && this.props.invoiceDetail.Orders[0].CosmeticNo != "" ? this.props.invoiceDetail.Orders[0].CosmeticNo : this.props.invoiceDetail.Orders[0].PurchaseOrderNo;

                link = `${this.props.isUserMerchant? '/merchants/order' : '/purchase'}/detail/orderid/${id}`;
            }
        }
        return (<a href={link}><span className="highlight-text">{PurchaseOrderNo}</span></a>)
    }

    renderRequisitionInfo() {
        let link = "#";
        let RequisitionOrderNo = '-';
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0]) {
                if (this.props.invoiceDetail.Orders[0].RequisitionDetail) {
                    const id = this.props.invoiceDetail.Orders[0].RequisitionDetail.ID;
                    RequisitionOrderNo = this.props.invoiceDetail.Orders[0].RequisitionDetail.CosmeticNo != null && this.props.invoiceDetail.Orders[0].RequisitionDetail.CosmeticNo != "" ? this.props.invoiceDetail.Orders[0].RequisitionDetail.CosmeticNo : this.props.invoiceDetail.Orders[0].RequisitionDetail.RequisitionOrderNo;
                    link = "/requisition/detail?id=" + id;
                }
            }
        }
        return (<a href={link}><span className="highlight-text">{RequisitionOrderNo}</span></a>)
    }

    renderReceivingNoteInfo() {
        let links = [];
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0]) {
                if (this.props.invoiceDetail.Orders[0].ReceivingNotes && this.props.invoiceDetail.Orders[0].ReceivingNotes.length > 0) {
                    this.props.invoiceDetail.Orders[0].ReceivingNotes.forEach((note, index) => {
                        if (!note.Void) {
                            links.push(<a href={`/receiving-note/detail?id=${note.ID}`} key={index}><span className="highlight-text">{note.CosmeticNo != null && note.CosmeticNo != "" ? note.CosmeticNo : note.ReceivingNoteNo}</span></a>);
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
        }

        return (<a href='#'><span className="highlight-text">-</span></a>);
    }
    
    renderInvoiceInfo() {
        let links = [];
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0] && this.props.invoiceDetail.Orders[0].PaymentDetails && this.props.invoiceDetail.Orders[0].PaymentDetails.length > 0) {
                //let invoiceNos = this.props.invoiceDetail.Orders[0].PaymentDetails.map((payment) => payment.InvoiceNo);
                //invoiceNos = [...new Set(invoiceNos)];

                //invoiceNos.map((invoiceNo, index) => {
                //    links.push(<a href={`/invoice/detail/${invoiceNo}`} key={index}><span className="highlight-text inv">{invoiceNo}</span></a>);
                //    links.push(<span key={'comma-' + index}> , </span>);
                //});
                //ARC10131
                let uniquePayments = this.getUnique(this.props.invoiceDetail.Orders[0].PaymentDetails, 'InvoiceNo');
                if (uniquePayments) {
                    uniquePayments.forEach(function (payment, index) {
                        links.push(<a href={`/invoice/detail/${payment.InvoiceNo}`} key={index}><span className="highlight-text inv">{payment.CosmeticNo != null && payment.CosmeticNo != "" ? payment.CosmeticNo : payment.InvoiceNo}</span></a>);
                        links.push(<span key={'comma-' + index}> , </span>);
                    });
                }

                links.pop();

                return (
                    <React.Fragment>
                        {links}
                    </React.Fragment>
                )
            }
        }

        return (<a href='#'><span className="highlight-text">-</span></a>);
    }

    render() {
        const { isUserMerchant } = this.props;
		const currencyCode = this.getCurrencyCode();
		return (
			<section className="sassy-box box-order-total">
				<div className="sassy-box-content">
	                <div className="row">
	                    <div className="col-md-4">
	                        <table className="canon-table">
                                <tbody>
                                    <tr>
	                                    <th>Quote No. :</th>
	                                    <td data-th="Purchase Order No. :">
	                                	    {this.renderQuotationInfo()}
	                                    </td>
                                    </tr>
                                    {
                                        isUserMerchant ? null :
                                            <tr>
                                                <th>Requisition Order No. :</th>
                                                <td data-th="Requisition Order No. :">
                                                    {this.renderRequisitionInfo()}
                                                </td>
                                            </tr>
                                    }
	                                <tr>
	                                    <th>Purchase Order No. :</th>
	                                    <td data-th="Purchase Order No. :">
	                                	    {this.renderPurchaseOrderInfo()}
	                                    </td>
                                    </tr>
                                    {
                                        isUserMerchant ? null :
                                            <tr>
                                                <th>Receiving Notes :</th>
                                                <td data-th="Receiving Notes :">
                                                    {this.renderReceivingNoteInfo()}
                                                </td>
                                            </tr>
                                    }
	                                <tr>
	                                    <th>Invoice No. :</th>
                                        <td data-th="Purchase Order No. :">
                                            {this.renderInvoiceInfo()}
                                        </td>
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
	                                    <td>{this.renderFormatMoney(currencyCode, this.getOrderSubTotal())}</td>
	                                </tr>
	                                {this.renderChargesAndDiscounts()}
	                                <tr>
	                                    <td>Shipping Cost</td>
	                                    <td> {this.renderFormatMoney(currencyCode, this.getShippingCost())}</td>
	                                </tr>
	                            </tbody>
	                            <tfoot>
	                                <tr className="divider">
	                                    <td colSpan="2"></td>
	                                </tr>
	                                <tr>
	                                    <td>
	                                        Total Cost
	                                    </td>
	                                    <td>
	                                        {this.renderFormatMoney(currencyCode, this.getTotal())}
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
		);
	}
}

module.exports = OrderTotal;