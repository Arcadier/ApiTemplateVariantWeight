'use strict';
var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class ShippingDetailComponent extends BaseComponent {
    getLatestFulfillmentStatus(cartItem) {
        let status = '';
        const fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');

        if (fulfillmentStatuses.length > 0) {
            status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
        }

        return status;
    }

    onDropdownChange(e) {
        this.props.updateDetailOrder(e.target.value);
    }

    renderStatusDropdown(order) {
        const cartItem = order.CartItemDetails[0];
        const fulfillmentStatus = this.getLatestFulfillmentStatus(cartItem);
        let statuses = [];
        let cartItemType = cartItem.CartItemType;

        if (!cartItemType) {
            if (order.CustomFields) {
                const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];

                if (typeof orderDeliveryOptionCustomField != 'undefined' &&  orderDeliveryOptionCustomField && orderDeliveryOptionCustomField.Values) {
                    const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                    cartItemType = customFieldValue.DeliveryType;
                }
            }
        }

        if (cartItemType === "delivery") {
            statuses = process.env.DELIVERY_FULFILLMENT_STATUSES.split(',');
        } else if (cartItemType === "pickup") {
            statuses = process.env.PICKUP_FULFILLMENT_STATUSES.split(',');
        }

        return (
            <select id="changeStatus" value={fulfillmentStatus} onChange={(e) => this.onDropdownChange(e)}>
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

    render() {
        const self = this;
        const order = this.props.orders[0];
        const cartItem = order.CartItemDetails[0];
        let shippingMethod = '';

        if (cartItem.PickupAddress) {
            shippingMethod = cartItem.PickupAddress.Line1;
        } else if (cartItem.ShippingMethod) {
            shippingMethod = cartItem.ShippingMethod.Description;
        }

        if (!shippingMethod) {
            if (order.CustomFields) {
                const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];

                if (typeof orderDeliveryOptionCustomField != 'undefined' && orderDeliveryOptionCustomField && orderDeliveryOptionCustomField.Values) {
                    const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                    shippingMethod = customFieldValue.Name;
                }
            }
        }

        return (
            <div className="order-box delivery-info">
                <div className="oreder-detail-head">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="orddtl-label">
                                <span className="orddtl-title">DELIVERY METHOD</span>
                                <p className="orddtl-data" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{shippingMethod}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="orddtl-label">
                                <span className="orddtl-title">DELIVERY PRICE</span>
                                <p className="orddtl-data item-price">
                                    {self.renderFormatMoney(order.CurrencyCode, order.Freight)}
                                </p>
                            </div>
                        </div>
                        <div className="col-md-5 col-xs-12 pull-right">
                            <div className="row">
                                <div className="col-md-5 ">
                                    <div className="orddtl-label">
                                        <span className="orddtl-title single">ORDER STATUS</span>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="h-search-category">
                                        {this.renderStatusDropdown(order)}
                                        <i className="fa fa-angle-down"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ShippingDetailComponent;