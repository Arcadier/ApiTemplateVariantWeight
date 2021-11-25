'use strict';
const React = require('React');
const PermissionTooltip = require('../../common/permission-tooltip');

class OrderDetail extends React.Component {
    renderBillingAddress() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { BillingToAddress, ConsumerDetail } = invoiceDetail.Orders[0];
            if (!BillingToAddress || !ConsumerDetail) return;
            const buyerDisplayName = ConsumerDetail.DisplayName;
            const buyerContact = ConsumerDetail.PhoneNumber;
            const buyerEmail = ConsumerDetail.Email;
            return (
                <tbody>
                    <tr>
                        <th>Billing Address :</th>
                    </tr>
                    <tr>
                        <td className="billing-address" data-th="Billing Address :">
                            <span className="highlight-text">{buyerDisplayName}</span><br />
                            <span className="highlight-text">{BillingToAddress.Name}</span><br />
                            {BillingToAddress.Line1 || ''},<br />
                            {BillingToAddress.City}<br />
                            {
                                BillingToAddress.State ?
                                    <React.Fragment>
                                        {BillingToAddress.State}<br />
                                    </React.Fragment>
                                    : null
                            }
                            {BillingToAddress.Country}<br />
                            {BillingToAddress.PostCode}<br />
                            <a href={`tel:${buyerContact}`}>+{buyerContact}</a>
                            <span className="text-spacer"></span>
                            <a href={`mailto:${buyerEmail}`}>{buyerEmail}</a>
                        </td>
                    </tr>
                </tbody>
            );
        }
        return;
    }

    renderRequisitionDetails() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail) {
            const { Status, Orders } = invoiceDetail;
            let shippingMethod = '-';
            let paymentTerms = '-';
            let paymentMethod = '-';
            let purchaseNo = '-';
            let paymentStatus = '-';
            let paymentGatewayCode = '';
            if (Orders && Orders.length > 0) {
                if (Orders[0].PurchaseOrderNo) {
                    purchaseNo = Orders[0].CosmeticNo != null && Orders[0].CosmeticNo != "" ? Orders[0].CosmeticNo : Orders[0].PurchaseOrderNo;
                }
                if (Orders[0].PaymentTerm) {
                    paymentTerms = Orders[0].PaymentTerm.Name;
                }
                if (Orders[0].PaymentDetails && Orders[0].PaymentDetails.length > 0) {
                    const thisInvoice = Orders[0].PaymentDetails.find(inv => inv.InvoiceNo == this.props.invoiceDetail.InvoiceNo);
                    if (thisInvoice && thisInvoice.Status) {
                        paymentStatus = thisInvoice.Status == 'Success' ? 'Paid' : thisInvoice.Status;
                    }
                    if (thisInvoice && thisInvoice.Gateway) {
                        paymentMethod = thisInvoice.Gateway.Gateway || '-';
                        paymentGatewayCode = thisInvoice.Gateway.Code || '';
                    }
                }

                if (Orders[0].CartItemDetails && Orders[0].CartItemDetails.length > 0) {
                    const cartItem = Orders[0].CartItemDetails[0];
                    shippingMethod = cartItem.CartItemType == 'pickup' ? cartItem.PickupAddress.Line1 : (cartItem.ShippingMethod ? cartItem.ShippingMethod.Description : '');
                }

                const showPaymentStatusDropdown = paymentMethod && (paymentMethod == '-' || paymentGatewayCode.includes('-offline-payments-') || paymentGatewayCode.includes('-cash-on-delivery-'));
                const isOfflinePayment = paymentGatewayCode && paymentGatewayCode.includes('-offline-payments-');
                return (
                    <tbody>
                        <tr>
                            <th>PO No. : </th>
                            <td data-th="Order Status :">{purchaseNo}</td>
                        </tr>
                        <tr>
                            <th>Order Status :</th>
                            <td data-th="Order Status :">
                                {Orders[0].OrderStatus}
                            </td>
                        </tr>
                        <tr>
                            <th>Payment Terms :</th>
                            <td data-th="Order Status :">{paymentTerms}</td>
                        </tr>
                        <tr>
                            <th>Shipping Method :</th>
                            <td data-th="Order Status :">{shippingMethod}</td>
                        </tr>
                        <tr>
                            <th>Payment Method :</th>
                            {this.renderPaymentMethod(paymentMethod, isOfflinePayment)}
                        </tr>
                        <tr>
                            <th>Payment Status:</th>
                            <td data-th="Order Status :">
                                {showPaymentStatusDropdown ?
                                    this.renderPaymentStatus(paymentStatus)
                                    : paymentStatus
                                }
                            </td>
                        </tr>
                    </tbody>
                );
            }
        }
        return;
    }

    renderSupplierDetails() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { MerchantDetail, DeliveryFromAddress } = invoiceDetail.Orders[0];
            if (!MerchantDetail || !DeliveryFromAddress) return;
            return (
                <tbody>
                    <tr>
                        <th>Supplier :</th>
                    </tr>
                    <tr>
                        <td data-th="Supplier :">
                            <span className="highlight-text">{MerchantDetail.DisplayName}</span><br />
                            <span className="highlight-text">{`${DeliveryFromAddress.Name}`}</span><br />
                            {DeliveryFromAddress.Line1 || ''}<br />
                            {DeliveryFromAddress.City}<br />
                            {
                                DeliveryFromAddress.State ?
                                    <React.Fragment>
                                        {DeliveryFromAddress.State}<br />
                                    </React.Fragment>
                                    : null
                            }
                            {DeliveryFromAddress.Country}<br />
                            {DeliveryFromAddress.PostCode}<br />
                        </td>
                    </tr>
                </tbody>

            )
        }
        return;
    }

    renderShippingAddress() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { DeliveryToAddress } = invoiceDetail.Orders[0];
            if (!DeliveryToAddress) return;
            return (
                <tbody>
                    <tr>
                        <th>Shipping Address :</th>
                    </tr>
                    <tr>
                        <td data-th="Shipping Address :">
                            <span className="highlight-text">{DeliveryToAddress.Name}</span><br />
                            {DeliveryToAddress.Line1 || ''},<br />
                            {DeliveryToAddress.City}<br />
                            {
                                DeliveryToAddress.State ?
                                    <React.Fragment>
                                        {DeliveryToAddress.State}<br />
                                    </React.Fragment>
                                    : null
                            }
                            {DeliveryToAddress.Country}<br />
                            {DeliveryToAddress.PostCode}<br />
                        </td>
                    </tr>
                </tbody>

            );
        }
        return;
    }

    handleUpdateInvoicePaymentStatus(e) {
        const self = this;
        const status = e.target.value;
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction('edit-merchant-invoice-details-api', () => {
            if (status) {
                if (self.props.invoiceDetail && self.props.invoiceDetail.Orders && self.props.invoiceDetail.Orders[0]) {
                    const invoiceNo = self.props.invoiceDetail.InvoiceNo;
                    self.props.updateInvoiceStatus(invoiceNo, status);
                }
            }
            return;
        });
        
    }

    renderPaymentStatus(status) {
        const { isUserMerchant } = this.props;

        if (!isUserMerchant) {
            return status;
        }

        return (
            <PermissionTooltip isAuthorized={this.props.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                <select disabled={!this.props.isAuthorizedToEdit} defaultValue={status} onChange={(e) => this.handleUpdateInvoicePaymentStatus(e)}>
                    <option value="Waiting for Payment">Waiting for Payment</option>
                    <option value="Paid">Paid</option>
                </select>
            </PermissionTooltip>
        );
    }

    renderPaymentMethod(paymentMethod, isOfflinePayment) {
        const { isUserMerchant } = this.props;

        if (isOfflinePayment) {
            return (
                <React.Fragment>
                    <div>{paymentMethod}</div>
                    <div>
                        <span id="inv-payment-intro">Payment Instruction</span>
                    </div>
                </React.Fragment>
            );
        }
        else if (paymentMethod == 'Cash on delivery') {
            return (
                <React.Fragment>
                    <td data-th="Payment Method :">{paymentMethod}</td>
                </React.Fragment>
            );
        }

        return (
            <td data-th="Order Status :">{paymentMethod}</td>
        );
    }

    render() {
        return (
            <section className="sassy-box">
                <div className="sassy-box-content box-order-detail">
                    <div className="row">
                        <div className="col-lg-4  col-md-4 col-sm-6">
                            <table className="canon-table">
                                {this.renderBillingAddress()}
                            </table>
                        </div>
                        <div className="col-lg-4  col-md-4 col-sm-4"></div>
                        <div className="col-lg-4  col-md-4 col-sm-6">
                            <table className="canon-table f-width pull-right">
                                {this.renderRequisitionDetails()}
                            </table>
                        </div>
                        <div className="spacer-20"></div>
                        <div className="col-md-12">
                            <div className="row">
                                <div className="col-md-4 col-sm-6">
                                    <table className="canon-table">
                                        {this.renderSupplierDetails()}
                                    </table>
                                </div>
                                <div className="col-md-4 col-sm-6">
                                    <table className="canon-table">
                                        {this.renderShippingAddress()}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

module.exports = OrderDetail;