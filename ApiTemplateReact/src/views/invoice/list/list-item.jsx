const React = require('react');
var BaseComponent = require('../../shared/base');
const Currency = require('currency-symbol-map');

const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class ListItemComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

   

    getPaymentDetail(invoiceNo) {
        const { invoice } = this.props;
        const { MerchantDetail, PaymentDetails } = invoice.Orders[0];

        if (PaymentDetails) {
            return PaymentDetails.find(p => p.InvoiceNo == invoiceNo && p.Payee.ID == MerchantDetail.ID);
        }

        return null;
    }
    
    render() {
        const { invoice = {}, isUserMerchant = false, statuses = [] } = this.props;
        const order = invoice.Orders ? invoice.Orders[0] : {};
        const { ConsumerDetail = {}, MerchantDetail = {} } = order;
        const paymentDetail = this.getPaymentDetail(invoice.InvoiceNo) || {};        
        const gateway = paymentDetail.Gateway || {};
        //ARC 8678 changes
        return (
            <React.Fragment>
                <tr className="account-row " data-key={invoice.InvoiceNo} data-id="1" key={invoice.InvoiceNo}>                    
                    <td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{paymentDetail.CosmeticNo != null && paymentDetail.CosmeticNo != "" ? paymentDetail.CosmeticNo : invoice.InvoiceNo || '-'}</a></td>
                    <td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{paymentDetail.GatewayTransactionID || '-'}</a></td>
                    <td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{paymentDetail.DateTimeCreated ? this.formatDateTime(paymentDetail.DateTimeCreated) : '-'}</a></td>
                    <td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{paymentDetail.PaymentDueDateTime ? this.formatDateTime(paymentDetail.PaymentDueDateTime) : '-'}</a></td>
                    <td><a href={order.ID ? `${isUserMerchant ? '/merchants/order' : '/purchase'}/detail/orderid/${order.ID}` : '#'}>{order.CosmeticNo != null && order.CosmeticNo != "" ? order.CosmeticNo :order.PurchaseOrderNo}</a></td>
                    {isUserMerchant ? 
                        (<td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{ConsumerDetail.DisplayName}</a></td>) : 
                        (<td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{MerchantDetail.DisplayName}</a></td>)
                    }
                    <td>                        
                        <a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>
                            {this.renderFormatMoney(order.CurrencyCode, invoice.Total + invoice.Fee)}
                        </a>
                    </td>
                    <td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{gateway.Gateway || '-'}</a></td>
                    {isUserMerchant ?
                        (
                            (gateway.Gateway && (gateway.Gateway.toLowerCase() == 'stripe' || gateway.Gateway.toLowerCase() == 'omise' || gateway.Gateway.toLowerCase() == 'paypal' || gateway.Code.toLowerCase().includes("custom"))) ? 
                            (
                                <td>
                                    {(paymentDetail.Status == 'Success' ? 'Paid' : paymentDetail.Status) || '-'} 
                                </td>                            
                            ) : 
                            (
                                <td>
                                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                        <select defaultValue={paymentDetail.Status == 'Success' ? 'Paid' : paymentDetail.Status || '0'} onChange={(e) => this.props.updateInvoiceStatus(invoice.InvoiceNo, e.target.value)}>
                                            <option value="Waiting for Payment">Waiting for Payment</option>
                                            <option value="Paid">Paid</option>
                                        </select>
                                    </PermissionTooltip>
                                </td>
                            )
                        ) : 
                        (
                            <td><a href={invoice.InvoiceNo ? `${isUserMerchant ? '/merchants' : ''}/invoice/detail/${invoice.InvoiceNo}` : '#'}>{(paymentDetail.Status == 'Success' ? 'Paid' : paymentDetail.Status) || '-'}</a></td>
                        )
                    }
                    <td></td>
                </tr>                
            </React.Fragment>            
        );
    }
}

module.exports = ListItemComponent;