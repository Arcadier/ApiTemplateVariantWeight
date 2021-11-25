'use strict';
var React = require('react');
var BaseComponent = require('../../../../shared/base');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class OrderListComponent extends BaseComponent {
    getItemUrl(itemName, itemId) {
        return '/items/' + this.generateSlug(itemName) + '/' + itemId;
    }

    getLatestFulfillmentStatus(cartItem) {
        let status = '';
        const fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');

        if (fulfillmentStatuses.length > 0) {
            status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
        }

        return status == 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status;
    }

    renderShippingDetail(order) {
        const self = this;
        let shippingMethod = '';
        let shippingMethodMinimumLeadTime = 'N/A';
        const cartItem = order.CartItemDetails[0];

        if (cartItem.PickupAddress) {
            shippingMethod = cartItem.PickupAddress.Line1;
        } else if (cartItem.ShippingMethod) {
            shippingMethod = cartItem.ShippingMethod.Description;
        }

        if (this.props.shippingMethod) {
            var customFieldValue = JSON.parse(this.props.shippingMethod.CustomFields[0].Values[0]);
            shippingMethodMinimumLeadTime = customFieldValue.MinimumLeadTime;
        }

        if (shippingMethod == '') {
            if (order.CustomFields) {
                const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];
                const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                shippingMethod = customFieldValue.Name;
                shippingMethodMinimumLeadTime = customFieldValue.MinimumLeadTime;
            }
        }

        return (
            <div className="occtt-full">
                <ul>
                    <li>
                        <span className="title">Supplier</span>
                        <span>{order.MerchantDetail.DisplayName}</span>
                    </li>
                    <li>
                        <span className="title">Shipping Method</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{shippingMethod}</span>
                    </li>
                    <li>
                        <span className="title">Shipping Cost</span>
                        <span className="item-price">
                            <span className="item-price">
                                {self.renderFormatMoney(order.CurrencyCode, order.Freight)}
                            </span>
                        </span>
                    </li>
                    <li>
                        <span className="title">Minimum Lead Time</span>
                        <span>{shippingMethodMinimumLeadTime}</span>
                    </li>
                    <li>
                        <span className="title">Order Status</span>
                        <span>{self.getLatestFulfillmentStatus(cartItem)}</span>
                    </li>
                </ul>
            </div>
        )
    }

    renderItem(cartItem) {
        const item = cartItem.ItemDetail;
        const itemImageUrl = item.Media !== null && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
        const itemUrl = this.getItemUrl(item.Name, item.ID);
        const itemQty = (cartItem.Quantity * 1).toLocaleString();
        let self = this;
        return (
            <React.Fragment>
                <span className="title">Item</span>
                <div className="oscctb-l">
                    <img src={itemImageUrl}></img>
                </div>
                <div className="oscctb-c">
                    <a href={itemUrl}><span className="item-name">{item.Name}</span></a>
                    <div className="item-detail">
                        <div className="oscctbc-d">
                            <a href={itemUrl}>
                                <span className="title">Price</span> <span className="item-price">{self.renderFormatMoney(item.CurrencyCode, item.Price)}</span>
                            </a>
                        </div>
                        <div className="oscctbc-d">
                            <a href={itemUrl}>
                                <span className="title">Qty</span> <span>{itemQty}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    componentDidMount() {
        if (process.env.TEMPLATE == 'trillia') {
            this.props.getComparisonByOrderId(this.props.orders[0].ID);
        }
    }

    renderButtons(cartItemId) {
        let buttons = [];

        if (typeof this.props.comparison !== 'undefined' && this.props.comparison != null && Object.keys(this.props.comparison).length > 0) {
            let comparisonDetail = this.props.comparison.ComparisonDetails.find(c => c.CartItemID == cartItemId);

            if (comparisonDetail != null && comparisonDetail.Offer != null && comparisonDetail.Offer.Accepted == true) {
                buttons.push(<div key="btn-chat"><a href={'/chat?cartItemId=' + cartItemId} className="chat-log-btn" target="_blank">Audit Chat Log</a></div>);
            }

            buttons.push(<div key="btn-comp"><a className="view-compare-btn" onClick={(e) => this.props.generateComparisonFile(this.props.orders[0].ID)}>Audit Comparison Table</a></div>);
        }

        return buttons;
    }

    render() {
        const self = this;
        const orders = this.props.orders;

        return (
            <div className="osc-container">
                {
                    orders.map(function (order) {
                        return (
                            <div className="oscc-tbl oscctbl-multiorder full-width" key={order.ID}>
                                <div className="oscct-top full-width">
                                    {
                                        order !== null &&
                                        self.renderShippingDetail(order)
                                    }
                                </div>
                                <div className="oscct-bot full-width">
                                    {
                                        order.CartItemDetails.map(function(cartItem) {
                                            return (
                                                <div className="oscctb-full" key={cartItem.ID}>
                                                    {self.renderItem(cartItem)}
                                                    <div className="oscctb-r">
                                                        {self.renderButtons(cartItem.ID)}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

module.exports = OrderListComponent;