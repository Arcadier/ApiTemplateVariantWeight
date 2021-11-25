'use strict';
var React = require('react');
var Moment = require('moment');

var BaseComponent = require('../../../../../../views/shared/base');
class OrderListComponent extends BaseComponent {
    isSelectedCartItem(cartItemID) {
        if (typeof this.props.selectedOrders !== "undefined") {
            return this.props.selectedOrders.includes(cartItemID);
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

    onCheckboxChange(e, cartItemID) {
        this.props.selectUnselectOrder(cartItemID, e.target.checked);
    }

    onDropdownChange(e, cartItemID) {
        this.props.updateHistoryOrders(cartItemID, e.target.value);
    }

    shortenOrderNo() {
        $(".long-details a").shorten({
            "showChars": 6,
            "moreText": "<img class=" + "more-icon" + " src=" + "/assets/images/back-arrow.svg" + " />",
            "lessText": "<img src=" + "/assets/images/back-arrow.svg" + " />"
        });
    }

    componentDidMount() {
        this.shortenOrderNo();
    }

    componentDidUpdate() {
        this.shortenOrderNo();
    }

    renderStatusDropdown(cartItem, order) {
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
            <select className="order-item-status-popup" value={fulfillmentStatus} onChange={(e) => this.onDropdownChange(e, cartItem.ID)}>
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
                        if (order.CartItemDetails !== null) {
                            let totalDiscount = 0;

                            order.CartItemDetails.forEach(function (cartItem) {
                                totalDiscount += cartItem.DiscountAmount === null ? 0 : cartItem.DiscountAmount;
                            });

                            return (
                                order.CartItemDetails.map(function (cartItem) {
                                    let checked = self.isSelectedCartItem(cartItem.ID);
                                    return (
                                        <tr key={cartItem.ID}>
                                            <td className="action-chkbox">
                                                <span className="fancy-checkbox  full-width">
                                                    <input type="checkbox" id={"chk-" + cartItem.ID} name={"chk-" + cartItem.ID} checked={checked} onChange={(e) => self.onCheckboxChange(e, cartItem.ID)} />
                                                    <label htmlFor={"chk-" + cartItem.ID}></label>
                                                </span>
                                            </td>
                                            <td>
                                                <a href={"/merchants/order/detail/" + invoice.InvoiceNo}>{invoice.InvoiceNo}</a>
                                            </td>
                                            <td>
                                                <div className="long-details">
                                                    <a href={"/merchants/order/detail/" + invoice.InvoiceNo}>{order.ID.toUpperCase()}</a>
                                                </div>
                                            </td>
                                            <td>
                                                {self.formatDate(order.CreatedDateTime)}<br />
                                                {self.formatTime(order.CreatedDateTime)}
                                            </td>
                                            <td>
                                                {cartItem.Quantity}
                                            </td>
                                            <td>
                                                <div className="item-price">
                                                    {self.renderFormatMoney(cartItem.CurrencyCode, order.GrandTotal - totalDiscount)}
                                                </div>
                                            </td>
                                            <td>
                                                {self.renderStatusDropdown(cartItem, order)}
                                            </td>
                                            <td>
                                                N/A
                                            </td>
                                            <td>
                                              N/A
                                            </td>
                                        </tr>
                                    )
                                })
                            )
                        }

                    })
                )
            })
        )
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