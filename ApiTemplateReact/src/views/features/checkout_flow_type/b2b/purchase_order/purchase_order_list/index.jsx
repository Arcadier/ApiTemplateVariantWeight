'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');
var Moment = require('moment');
class FeaturePurchaseOrderListB2bComponent extends BaseComponent {
    getLatestOrderStatus(cartItem) {
        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1];
        }

        if (status) {
            if (this.props.statuses && this.props.statuses.Records) {
                const statusExist = this.props.statuses.Records.find(s => s.ID == status.ID);

                if (statusExist) return status.StatusAlias;
            }
        }

        return '';
    }    

    getLatestFulfilmentStatus(cartItem) {
        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1];
        }

        if (status) {
            if (this.props.fulfilmentStatuses && this.props.fulfilmentStatuses.Records) {
                const statusExist = this.props.fulfilmentStatuses.Records.find(s => s.ID == status.ID);

                if (statusExist) return status.StatusAlias;
            }
        }

        return '';
    }    

    renderInvoiceList(order) {
        let links = [];
        if (order && order.PaymentDetails && order.PaymentDetails.length > 0) {
            //let invoiceNos = order.PaymentDetails.map((payment) => payment.InvoiceNo);
            //invoiceNos = [...new Set(invoiceNos)];

            //invoiceNos.map((invoiceNo, index) => {
            //    links.push(<a href={`/invoice/detail/${invoiceNo}`} key={index}>{invoiceNo}</a>);
            //    links.push(<span key={'comma-' + index}>, </span>);
            //});

            //ARC10131
            let uniquePayments = this.getUnique(order.PaymentDetails, 'InvoiceNo');
            if (uniquePayments) {
                uniquePayments.forEach(function (payment, index) {
                    links.push(<a href={`/invoice/detail/${payment.InvoiceNo}`} key={index}>{payment.CosmeticNo != null && payment.CosmeticNo != "" ? payment.CosmeticNo : payment.InvoiceNo}</a>);
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

        return (<a href='#'>-</a>);
    }

    renderReceivingNoteList(order) {
        let links = [];
        if (order && order.ReceivingNotes && order.ReceivingNotes.length > 0) {
            order.ReceivingNotes.map((note, index) => {
                if (!note.Void) {
                    links.push(<a href={`/receiving-note/detail?id=${note.ID}`} key={index}>{note.CosmeticNo != null && note.CosmeticNo != "" ? note.CosmeticNo : note.ReceivingNoteNo}</a>);
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

        return (<a href='#'>-</a>);
    }

    renderRecords() {
        var self = this;
        if (this.props.Records != null && this.props.Records.length > 0) {
            var html = this.props.Records.map(function (obj, index) {
                return (
                    <tr key={obj.ID} className="account-row " data-key="item" data-id={1}>
                        <td><a href={"/purchase/detail/orderid/" + obj.ID}>{obj.CosmeticNo != null & obj.CosmeticNo != "" ? obj.CosmeticNo : obj.PurchaseOrderNo}</a></td>
                        <td><a href={"/purchase/detail/orderid/" + obj.ID}>{obj.RequisitionDetail ? self.formatDateTime(obj.RequisitionDetail.CreatedDateTime) : ''}</a></td>
                        <td><a href={"/purchase/detail/orderid/" + obj.ID}>{obj.MerchantDetail.DisplayName}</a></td>
                        <td className="wrap-col" data-th="Receiving Notes"><div className="ids-wrap single-line">{self.renderReceivingNoteList(obj)}</div></td>
                        <td className="wrap-col" data-th="Invoice No"><div className="ids-wrap single-line">{self.renderInvoiceList(obj)}</div></td>
                        <td>
                            <a href={"/purchase/detail/orderid/" + obj.ID}>
                                <div className="item-price test2"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.formatMoney(obj.CurrencyCode, obj.GrandTotal)}</span></div>
                            </a>                            
                        </td>
                        {
                            obj.CartItemDetails ?
                                <td>{self.getLatestOrderStatus(obj.CartItemDetails[0])}</td>
                                : <td> N/A </td>
                        }
                        {
                            obj.CartItemDetails ?
                                <td>{self.getLatestFulfilmentStatus(obj.CartItemDetails[0])}</td>
                                : <td> N/A </td>
                        }
                    </tr>
                );
            });
            return html;
        }
    }

    renderEmpty() {
        if (this.props.Records != null && this.props.Records.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/order-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">No orders yet.</div>
                    <div className="empty-page-message">Your Orders will be shown here</div>
                </div>
            )
        }
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="subaccount-data-table table-responsive">
                    <table className="table order-data1 sub-account clickable">
                        <thead>
                            <tr>
                                <th>PO No.</th>
                                <th>Timestamp</th>
                                <th>Supplier</th>
                                <th className="wrap-col">Receiving Notes</th>
                                <th className="wrap-col">Invoice No</th>
                                <th className="text-right">Total</th>
                                <th>Order Status</th>
                                <th>Fulfillment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.renderRecords()
                                
                               
                            }
                        </tbody>
                    </table>
                    {this.renderEmpty()}
                </div>
            </React.Fragment>
        );
    }
}

module.exports = FeaturePurchaseOrderListB2bComponent;