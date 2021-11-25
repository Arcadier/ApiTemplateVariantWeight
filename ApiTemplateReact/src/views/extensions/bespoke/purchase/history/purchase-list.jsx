'use strict';
var React = require('react');
var BaseComponent = require('../../../../shared/base');

class PurchaseListComponent extends BaseComponent {
    onPurchaseClick(id) {
        window.location = '/purchase/detail/' + id;
    }

    renderPurchases() {
        const self = this;
        if (this.props.purchases) {
            return (
                this.props.purchases.map(function (purchase) {
                    let quantity = 0;
                    let orderItemCount = 0;
                    let invoiceTotal = 0;
                    let createdDateTime = null;
                    let currency = purchase.CurrencyCode;
                    let paymentStatus = 'N/A';
                    let paymentMethod = 'N/A';
                    if (purchase.Orders) {
                        purchase.Orders.map(o => {
                            createdDateTime = o.CreatedDateTime
                            invoiceTotal += o.GrandTotal;
                            paymentStatus = o.PaymentStatus;
                            if (o.PaymentDetails && o.PaymentDetails[0] && o.PaymentDetails[0].Gateway && o.PaymentDetails[0].Gateway.Gateway) {
                                paymentMethod = o.PaymentDetails[0].Gateway.Gateway
                            }
                            if (o.CartItemDetails) {
                                o.CartItemDetails.map(cartItem => {
                                    quantity += cartItem.Quantity ? parseInt(cartItem.Quantity) : 0;
                                });
                            }

                        });
                    }
                    return (
                        <tr key={purchase.InvoiceNo} onClick={(e) => self.onPurchaseClick(purchase.InvoiceNo)}>
                            <td data-th="Invoice No">{purchase.InvoiceNo}</td>
                            <td data-th="Timestamp">{self.formatDateTime(createdDateTime)}</td>
                            <td data-th="No of item(s)">{quantity}</td>
                            <td data-th="Order Total"><span className="item-price">{self.renderFormatMoney(currency, (invoiceTotal))}</span></td>
                            <td data-th="Payment Type">{paymentMethod}</td>
                            <td data-th="Payment Status">{paymentStatus}</td>
                        </tr>
                    );
                })
            );
        }

    }

    render() {
        return (
            <div className="hrcc-bot full-width">
                <div className="ph-t-table">
                    <table className="table" id="purchase-history-table">
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>Timestamp</th>
                                <th>No of item(s)</th>
                                <th>Order Total</th>
                                <th>Payment Type</th>
                                <th>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderPurchases()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

module.exports = PurchaseListComponent;