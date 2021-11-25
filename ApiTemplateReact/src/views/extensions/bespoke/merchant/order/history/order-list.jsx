'use strict';
var React = require('react');
var Moment = require('moment');

var BaseComponent = require('../../../../../../views/shared/base');
class OrderListComponent extends BaseComponent {
    isSelectedOrder(id) {
        if (typeof this.props.selectedOrders !== "undefined") {
            return this.props.selectedOrders.includes(id);
        }

        return false;
    }

    getLatestFulfillmentStatus(cartItem) {
        let status = '';
        const fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');

        if (fulfillmentStatuses.length > 0) {
            status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
        }

        return status;
    }

    onCheckboxChange(e, orderId) {
        this.props.selectUnselectOrder(orderId, e.target.checked);
    }

    onDropdownChange(e, orderId, paymentMethod, invoiceNo) {
        this.props.updateHistoryOrders(orderId, e.target.value);

        if (paymentMethod && paymentMethod.toLowerCase() == "cash on delivery" && e.target.value
            && (e.target.value.toLowerCase() == 'delivered' || e.target.value.toLowerCase() == 'collected')) {

            let invoices = [];
            invoices.push(invoiceNo);

            this.props.updateInvoicePaymentStatus({
                invoiceNo: invoices,
                status: 'Paid'
            }, function() {

            });
        }
    }

    componentDidMount() {
    }

    componentDidUpdate() {}

    renderStatusDropdown(order, invoice) {
        const self = this;
        // get first since all cart items in order should have same set of statuses
        const cartItem = order.CartItemDetails[0];
        const fulfillmentStatus = this.getLatestFulfillmentStatus(cartItem);
        let statuses = [];
        let cartItemType = cartItem.CartItemType;

        if (!cartItemType) {
            if (order.CustomFields) {
                const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];
                const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                cartItemType = customFieldValue.DeliveryType;
            }
        }

        if (cartItemType === "delivery") {
            statuses = process.env.DELIVERY_FULFILLMENT_STATUSES.split(',');
        } else if (cartItemType === "pickup") {
            statuses = process.env.PICKUP_FULFILLMENT_STATUSES.split(',');
        }

        return (
            <select className="order-item-status-popup" value={fulfillmentStatus} onChange={(e) => this.onDropdownChange(e, order.ID, self.showPaymentDetails(order.PaymentDetails), invoice.InvoiceNo)}>
                {
                    statuses.map(function (status, index) {
                        return (
                            <option key={index} value={status}>{status === 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status}</option>
                        )
                    })
                }
            </select>
        )
    }

    renderOrders() {
        const self = this;
        return (
            this.props.invoices.map(function (invoice) {
                return (
                    invoice.Orders.map(function (order) {
                        if (order.CartItemDetails) {
                            const isOrderSelected = self.isSelectedOrder(order.ID);
                            let totalDiscount = 0;
                            let totalQuantity = 0;

                            order.CartItemDetails.forEach(function (cartItem) {
                                totalDiscount += cartItem.DiscountAmount === null ? 0 : cartItem.DiscountAmount;
                                totalQuantity += cartItem.Quantity === null ? 0 : parseInt(cartItem.Quantity);
                            });

                            //ARC 7992
                            let paymentGateWay = "";
                            let payStatus = order.PaymentStatus;
                            if (order.PaymentDetails && order.PaymentDetails[0].Gateway) {
                                paymentGateWay = order.PaymentDetails[0].Gateway.Gateway
                            }

                            let cartItem = order.CartItemDetails[0];

                            if (paymentGateWay && paymentGateWay.toLowerCase().includes("cash on") && cartItem.Statuses) {
                                if (cartItem.Statuses[cartItem.Statuses.length - 1].Name === "Delivered" && payStatus !== "Refunded") {
                                    payStatus = "Paid";
                                }
                            }

                            return (
                                <tr key={order.ID}>
                                    <td className="action-chkbox">
                                        <span className="fancy-checkbox  full-width">
                                            <input type="checkbox" id={"chk-" + order.ID} name={"chk-" + order.ID} checked={isOrderSelected} onChange={(e) => self.onCheckboxChange(e, order.ID)} />
                                            <label htmlFor={"chk-" + order.ID}></label>
                                        </span>
                                    </td>
                                    <td data-th="Invoice No">
                                        <div className="long-details-x">
                                            <a href={"/merchants/order/detail/" + invoice.InvoiceNo}>{invoice.InvoiceNo}</a></div>
                                    </td>
                                    <td data-th="Order No">
                                        <div className="long-details">
                                            <a href={"/merchants/order/detail/" + invoice.InvoiceNo}>{order.ID.toUpperCase()}</a>
                                        </div>
                                    </td>
                                    <td data-th="Timestamp">
                                        {self.formatDate(order.CreatedDateTime)}<br />
                                        {self.formatTime(order.CreatedDateTime)}
                                    </td>
                                    <td>
                                        {totalQuantity}
                                    </td>
                                    <td>
                                        <div className="item-price">
                                            {self.renderFormatMoney(order.CurrencyCode, order.GrandTotal - totalDiscount)}
                                        </div>
                                    </td>
                                    <td>
                                        {self.renderStatusDropdown(order, invoice)}
                                    </td>
                                    <td>
                                        {self.showPaymentDetails(order.PaymentDetails)}
                                    </td>
                                    <td>
                                        {/*{self.showPaymentStatus(order.Statuses)}*/}
                                        {payStatus}
                                    </td>
                                </tr>
                            )
                        }
                    })
                )
            })
        )
    }

    showPaymentDetails(paymentDetails) {
        if (paymentDetails && typeof paymentDetails != 'undefined' && paymentDetails.length > 0) {
            return paymentDetails[0].Gateway.Gateway
        }

        return '';
    }

    showPaymentStatus(statuses) {
        var returnStatus = ''

        for (var i = statuses.length - 1; i >= 0; i--) {
            let theStatus = statuses[i]

            if (theStatus.Type == 'Payment') {
                returnStatus = theStatus.Name;
                break;
            }
        }

        return returnStatus
    }

    render() {
        return (
            <table className="table order-data">
                <thead>
                    <tr>
                        <th className="action-chkbox"></th>
                        <th>Invoice No</th>
                        <th>Order No</th>
                        <th>Timestamp</th>
                        <th>No of Item(s)</th>
                        <th>Order Total</th>
                        <th>Order Status</th>
                        <th>Payment Method</th>
                        <th>Payment Status</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderOrders()}
                </tbody>
            </table>
        );
    }
}

module.exports = OrderListComponent;