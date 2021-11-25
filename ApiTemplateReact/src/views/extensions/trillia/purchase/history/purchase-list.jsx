'use strict';
var React = require('react');

var BaseComponent = require('../../../../shared/base');
class PurchaseListComponent extends BaseComponent {
    onPurchaseClick(id) {
        window.location = '/purchase/detail/' + id;
    }

    renderPurchases() {
        const self = this;

        return (
            this.props.purchases.map(function (purchase) {
                return (
                    purchase.Orders.map(function(order) {
                        let quantity = 0;
                        let totalDiscount = 0;

                        if (order.CartItemDetails != null) {
                            order.CartItemDetails.forEach(function (cartItem) {
                                quantity += parseInt(cartItem.Quantity);
                                totalDiscount += cartItem.DiscountAmount === null ? 0 : cartItem.DiscountAmount;
                            });

                            return (
                                <tr key={purchase.InvoiceNo} onClick={(e) => self.onPurchaseClick(purchase.InvoiceNo)}>
                                    <td data-th="Invoice No">{purchase.InvoiceNo}</td>
                                    <td data-th="Timestamp">{self.formatDateTime(order.CreatedDateTime)}</td>
                                    <td data-th="No of item(s)">{quantity}</td>
                                    <td data-th="Order Total"><span className="item-price">{self.renderFormatMoney(order.CurrencyCode, (order.GrandTotal - totalDiscount))}</span></td>
                                    <td data-th="Payment Type">N/A</td>
                                    <td data-th="Payment Status">N/A</td>
                                </tr>
                            );
                        }
                    })
                );
            })
        );
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