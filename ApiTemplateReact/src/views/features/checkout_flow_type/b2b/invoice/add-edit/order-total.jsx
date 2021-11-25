'use strict';
var React = require('react');

class FeatureCreateInvoiceB2bOrderTotalComponent extends React.Component {

    getCurrencyCode() {
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            return this.props.invoiceDetail.Orders[0].CurrencyCode;
        }
        return null;
    }

    renderQuotationInfo() {
        let link = "#";
        let quoteNo = '-';

        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0].CartItemDetails && this.props.invoiceDetail.Orders[0].CartItemDetails[0] && this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer) {
                const id = this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.ID;
                quoteNo = this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo != null && this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo != "" ? this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.CosmeticNo : this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.QuoteNo;
                link = "/quotation/detail?id=" + id;
            }
        }
        return (<a href={link}><span className="highlight-text">{quoteNo}</span></a>)
    }

    renderPurchaseOrderInfo() {
        let link = "#";
        let PurchaseOrderNo = '-';
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0]) {
                const id = this.props.invoiceDetail.Orders[0].ID;
                PurchaseOrderNo = this.props.invoiceDetail.Orders[0].CosmeticNo != null && this.props.invoiceDetail.Orders[0].CosmeticNo != "" ? this.props.invoiceDetail.Orders[0].CosmeticNo : this.props.invoiceDetail.Orders[0].PurchaseOrderNo;
                link = "/purchase/detail/orderid/" + id;
            }
        }
        return (<a href={link}><span className="highlight-text">{PurchaseOrderNo}</span></a>)
    }

    getUnique(arr, index) {

        const unique = arr
            .map(e => e[index])

            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)

            // eliminate the dead keys & store unique objects
            .filter(e => arr[e]).map(e => arr[e]);

        return unique;
    }

    renderInvoiceInfo() {
        let links = [];
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0] && this.props.invoiceDetail.Orders[0].PaymentDetails && this.props.invoiceDetail.Orders[0].PaymentDetails.length > 0) {
                //let invoiceNos = this.props.invoiceDetail.Orders[0].PaymentDetails.map((payment) => payment.InvoiceNo);
                //invoiceNos = [...new Set(invoiceNos)];

                //invoiceNos.map((invoiceNo, index) => {
                //    links.push(<a href={`/invoice/detail/${invoiceNo}`} key={index}><span className="highlight-text">{invoiceNo}</span></a>);
                //    links.push(<span key={'comma-' + index}> , </span>);
                //});

                //ARC10131
                let uniquePayments = this.getUnique(this.props.invoiceDetail.Orders[0].PaymentDetails, 'InvoiceNo');
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
                )
            }
        }

        return (<a href='#'><span className="highlight-text">-</span></a>);
    }

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
                            <td>{this.props.renderFormatMoney(currencyCode, charges)}</td>
                    }
                </tr>
                <tr>
                    <td>Discount(s)</td>
                    {
                        discount === 0 ? <td>-</td> :
                            <td><span>-</span> {this.props.renderFormatMoney(currencyCode, discount)}</td>
                    }
                </tr>
            </React.Fragment>
        )
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

    getTotal() {
        const { invoiceDetail } = this.props;
        let total = 0;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { Orders } = invoiceDetail;
            Orders.map(order => total += order.GrandTotal);
        }
        return total;
    }

    getChatLogLink() {
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders.length > 0) {
            if (this.props.invoiceDetail.Orders[0].CartItemDetails && this.props.invoiceDetail.Orders[0].CartItemDetails[0] && this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer) {
                const channelId = this.props.invoiceDetail.Orders[0].CartItemDetails[0].AcceptedOffer.ChannelID;
                return <a href={"/chat?channelId=" + channelId} className="sassy-black-btn">Show Chat Log</a> 
            }
        }
        return ''
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
                                            <td>{this.renderQuotationInfo()}</td>
                                        </tr>
                                        <tr>
                                            <th>Purchase Order No. :</th>
                                            <td>{this.renderPurchaseOrderInfo()}</td>
                                        </tr>
                                        <tr>
                                            <th>Invoice No. :</th>
                                            <td>{this.renderInvoiceInfo()}</td>
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
                                            <td>{this.props.renderFormatMoney(currencyCode, this.getOrderSubTotal())}</td>
                                        </tr>
                                        {this.renderChargesAndDiscounts()}
                                        <tr>
                                            <td>Shipping Cost</td>
                                            <td>- {this.props.renderFormatMoney(currencyCode, this.getShippingCost())}</td>
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
                                                {this.props.renderFormatMoney(currencyCode, this.getTotal())}
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

module.exports = FeatureCreateInvoiceB2bOrderTotalComponent;