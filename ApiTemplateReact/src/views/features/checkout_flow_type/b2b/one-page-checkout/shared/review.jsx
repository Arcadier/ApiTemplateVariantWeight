'use strict';
var React = require('react');
import Currency from 'currency-symbol-map';
import toastr from 'toastr';
import BaseComponent from '../../../../../shared/base';

class ReviewComponent extends BaseComponent {

    handleDeliveryOptionChange(e, order) {
        const { pickupOptions, shippingOptions } = this.props;
        const orderSelect = $(`.sel_del_method[order-id=${order.ID}]`);
        const selectedDelID = $(orderSelect).find('option:selected').val();
        const surcharge = $(orderSelect).find('option:selected').attr('data-surcharge');
        const time = $(orderSelect).find('option:selected').attr('data-time');
        let selectedDelOption = null;

        if (surcharge !== 'Pick-up') {
            if (shippingOptions && shippingOptions.length > 0) {
                shippingOptions.forEach(function (option) {
                    if (option && option.IsPickup === false && option.ShippingData.ID === selectedDelID) {
                        selectedDelOption = option;
                    } else {

                    }
                });
            }
        } else {
            if (pickupOptions && pickupOptions.length > 0) {
                pickupOptions.forEach(function (option) {
                    if (option.Id == selectedDelID) {
                        selectedDelOption = option;
                    }
                });
            }
        }

        $(`.deliver-method[order-id=${order.ID}]`).find('.surcharge').html(surcharge);
        $(`.deliver-method[order-id=${order.ID}]`).find('.lead-time').html(time);

        this.props.deliveryChanged(selectedDelOption, order.ID)    
    }

    calculateDeliveryCost() {
        var self = this;
        const $sub_total = $('.sub-total');
        const sub_total = parseFloat($sub_total.text().replace(/,/g, ''));

        const $total_cost = $('.total-cost');
        const $delivery_costs = $('.delivery-costs');

        const orderCount = this.props.invoiceDetails.Orders.length || 0;
        let orderCountSelectedDelivery = 0;

        let shipping_cost = 0;
        const { orderSelectedDelivery } = this.props;
        if (orderSelectedDelivery) {
            for (let order of orderSelectedDelivery.keys()) {
                const opt = orderSelectedDelivery.get(order);
                $(`.deliver-method[order-id=${order}] h4`).removeClass('text-danger');
                if (opt) {
                    orderCountSelectedDelivery += 1;
                    shipping_cost += !opt.IsPickup ? parseFloat(opt.ShippingCost || 0) : 0;
                }
            }
        }
        $total_cost.text(self.formatAmountWithCommaSeparator(sub_total + shipping_cost));
        $delivery_costs.text(shipping_cost.toFixed(2));
        // check if  each order has a selected delivery option
        if (orderCount == orderCountSelectedDelivery) {
            $('.full-btn-procced').removeClass('disable');
        } else {
            $('.full-btn-procced').addClass('disable');
        }
    }

    renderAdditionalAttr(variants) {
        const { locationVariantGroupId = null } = this.props;

        return (
            <div className="item-field">
                {variants.filter(v => v.GroupID != locationVariantGroupId).map(v =>
                    <span key={v.ID} className="if-txt">
                        <span>{`${v.GroupName}: `}</span>
                        <span>{v.Name}</span>
                    </span>
                )}
            </div>
        );
    }

    renderSellerDisplayName() {
        const merchant = this.props.orderDetails.MerchantDetail;
        return merchant && merchant.DisplayName ? merchant.DisplayName : '';
    }

    renderCartItemDescription(ItemDetail, i) {
        if (ItemDetail.Variants && ItemDetail.Variants.length > 0) {
            return (
                <div key={ItemDetail.ID + i} className="flex-wrap">
                    <div className="thumb-group">
                        <img src={ItemDetail.Media? ItemDetail.Media[0].MediaUrl:''} style={{ maxWidth: '64px' }}/>                                   
                    </div>
                    <div>
                        <span>
                            {ItemDetail.Name}
                            {
                                this.renderAdditionalAttr(ItemDetail.Variants)
                            }
                        </span>
                    </div>
                </div>
            );
        } else {
            return(
                <div key={ItemDetail.ID + i} className="thumb-group">
                    <img src={ItemDetail.Media ? ItemDetail.Media[0].MediaUrl : ''} style={{ maxWidth: '64px' }}/>
                    <span>{ItemDetail.Name} </span>                                   
                </div>
            );
        }
    }
     
    renderCartItem(cartItem, i) {
        const { ItemDetail } = cartItem;
        const cartSubTotal = parseFloat(cartItem.ItemDetail.Price * cartItem.Quantity) - parseFloat(cartItem.DiscountAmountNotRoundOff || 0);
        const itemQty = (cartItem.Quantity * 1).toLocaleString();
        return (
            <tr key={cartItem.ID + i}>
                <td data-th="Item Description">
                    {this.renderCartItemDescription(ItemDetail, i)}
                </td>
                <td data-th="Quantity">{itemQty}</td>
                <td className="text-right" data-th="Price per Item">
                    {this.renderFormatMoney(cartItem.CurrencyCode || ItemDetail.CurrencyCode, ItemDetail.Price)}
                </td>
                <td className="text-right" data-th="Total">
                    {this.renderFormatMoney(cartItem.CurrencyCode || ItemDetail.CurrencyCode, cartSubTotal)}
                </td>
            </tr>
        );
    }

    renderQuotationDetails() {
        const { pendingOffer } = this.props;
        const currencyCode =  this.props.orderDetails.CurrencyCode;
        if (pendingOffer && pendingOffer.OfferDetails && pendingOffer.OfferDetails.length > 0) {
            const { OfferDetails } = pendingOffer;
            const arr = OfferDetails.slice(1);
            return (
                <tfoot>
                    {arr.map(detail => 
                        <tr key={detail.ID} className="border-top">
                            <td data-th="Item Description">
                                <div className="thumb-group">
                                    <span><b>{detail.Name} - </b>{detail.Description}</span>
                                </div>
                            </td>
                            <td data-th="Quantity">
                                {detail.Type == 'Quantity' ? detail.Quantity : detail.Type}
                            </td>
                            <td className="text-right" data-th="Price per Item">
                                {
                                    detail.Type == 'Percentage'?
                                        `${(detail.Price*100).toFixed(2)}%`
                                    : <div className="item-price">{this.renderFormatMoney(currencyCode, detail.Price)}</div>
                                }
                            </td>
                            <td className="text-right" data-th="Total">
                                <div className="item-price">{this.renderFormatMoney(currencyCode, detail.TotalAmount)}</div>
                            </td>
                        </tr>
                    )}
                </tfoot>
            )            
        }
        return;
    }
       
    renderCartContents() {
        const { CartItemDetails } = this.props.orderDetails;
        let self = this;
        let channelId = this.props.pendingOffer && this.props.pendingOffer.ChannelID ? this.props.pendingOffer.ChannelID  : null;
        const chatLink = channelId ? "/chat?channelId=" + channelId : null
        return (
            <React.Fragment>
                <table className="table">
                     <thead>
                        <tr>
                            <th>Item Description</th>
                            <th>Qty</th>
                            <th className="text-right">Price per Item</th>
                            <th className="text-right" width="171px">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            CartItemDetails.map(function (cartItem, i) {
                                return self.renderCartItem(cartItem, i);
                            })
                        }
                    </tbody>
                    {this.renderQuotationDetails()}
                </table>
                <div className="review-btn">
                    <a href={chatLink} target={channelId ? "_blank" : null} style={{ cursor: 'pointer'}} onClick={() => channelId ? null: toastr.error('No chat log associated to your item/s') }>Show Chat Log</a>
                </div>
            </React.Fragment>
        );
    }

    getMinimumLeadTime(del) {
        const { ShippingData } = del;
        if (ShippingData && ShippingData.CustomFields && ShippingData.CustomFields.length > 0) {
            const { CustomFields } = ShippingData;
            const deliveryOpt = CustomFields ? CustomFields.find(x => x.Name === 'DeliveryOptions') : null;
            if (deliveryOpt) {
                const values = JSON.parse(deliveryOpt.Values[0])
                if (values && values.MinimumLeadTime) return values.MinimumLeadTime;
            }
        }
        return null;
    }

    renderDeliveryOptions() {
        const order = this.props.orderDetails;
        const { shippingOptions, pickupOptions } = this.props;

        var correctShippingMethod = shippingOptions.filter(so => so.ShouldShow && so.ShouldShow === true);

        return (
            <React.Fragment>
                <option data-surcharge="-" data-time="-" data-cost="0.00" value="">Select your shipping method.</option>
                {
                    correctShippingMethod && correctShippingMethod.map(del =>
                        <option
                            key={`${order.ID}|||${del.ShippingData.ID}`}
                            data-surcharge={`${del.CurrencyCode} ${Currency(del.CurrencyCode)}${parseFloat(del.ShippingCost || 0).toFixed(2)}`}
                            data-time={this.getMinimumLeadTime(del)}
                            data-cost={del.ShippingCost}
                            value={del.ShippingData.ID}
                        >
                            {del.ShippingData.Description}
                            ({`${del.CurrencyCode} ${Currency(del.CurrencyCode)}${parseFloat(del.ShippingCost || 0).toFixed(2)}`})
                        </option>
                    )
                }
                {
                    pickupOptions && pickupOptions.map(del =>
                        <option key={`${order.ID}|||${del.Id}`} data-surcharge="Pick-up" data-time="-" data-cost="0.00" value={del.Id}>
                            {`${del.Name} (Pick-up)`}
                        </option>
                    )
                }

            </React.Fragment>
        )
    }

    renderDeliveryReview() {
        let self = this;
        const { pickupOptions, shippingOptions, orderSelectedDelivery, orderDetails } = this.props;
        const order = orderDetails;
        if ((typeof pickupOptions == 'undefined' || (pickupOptions && pickupOptions.length === 0))
            && (typeof shippingOptions == 'undefined' || (shippingOptions && shippingOptions.length === 0))
        ) return this.renderNoAvailableDelivery();

        let leadTime = "N/A";
        if (orderSelectedDelivery && orderSelectedDelivery.length > 0) {
            orderSelectedDelivery.forEach(function (delivery, i) {
                if (delivery[order.ID] && delivery[order.ID].IsPickup === false && delivery[order.ID].OrderID === order.ID) {
                    leadTime = self.getMinimumLeadTime(delivery[order.ID]);
                }
            });
        }

        return (
            <div className="dr-content" key={order.ID}>
                <div className="delivery-review">
                    <label className="full-width">Shipping Method</label>
                    <div className="select_shipping">
                        <select className="txt sel_del_method"
                            name="delivery_method[]"
                            key={order.ID}
                            order-id={order.ID}
                            onChange={e => this.handleDeliveryOptionChange(e, order)}>
                            {this.renderDeliveryOptions(order, shippingOptions, pickupOptions)}
                        </select>
                        <i className="fa fa-angle-down" />
                    </div>
                    <span className="full-width mt-15">
                        <span className="delivery-time-txt"> Minimum Lead Time: {leadTime}</span>
                    </span>
                </div>
            </div>
        );

    }

    renderNoAvailableDelivery() {
        const currencyCode = this.props.orderDetails.CurrencyCode;
        return (
            <React.Fragment>
                <div className="dr-content">
                    <div className="delivery-review">
                        <span className="title">Select your delivery method.</span>
                        <span className="no-delivery-method-text">
                            <p>No available delivery methods,<br />please check the item(s) detail page or contact merchant</p>
                        </span>
                    </div>
                </div>
                <div className="drbot-content">
                    <div className="pull-left">
                        <span>Minimum Lead Time: </span>
                        <span className="item-price delivery-time-txt">N/A</span>
                    </div>
                    <div className="pull-right">
                        <span>Delivery Cost:</span>
                        <span className="item-price deliveryCost">
                            {this.renderFormatMoney(currencyCode, 0)}
                        </span>
                    </div>
                    <div className="clearfix" />
                </div>
            </React.Fragment>
        );
    }

    renderOrderDetails() {
        const { orderDetails, pickupOptions, shippingOptions } = this.props;
        if (orderDetails) {
            return (
                <React.Fragment>
                    <div className="cb-content">
                        <div className="delivery-address-subtitle pull-left">
                            {this.renderSellerDisplayName()}
                        </div>
                        {this.renderCartContents()}
                    </div>
                    {this.renderDeliveryReview()}
                </React.Fragment>
            )
        } 
        return "";
    }

    render() {
        return (
            <div className="pc-content full-width review-container tab-container   middle tabcontent" id="review-container">
                <div className="panel-box">
                    <div className="sc-upper panel-box-title">
                        <div className="sc-u sc-u-mid full-width">
                            <div className="bl_dark">
                                <span className="sc-text-big">Review <i className="tog-icon angle2" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="panel-box-content clearfix" style={{ display: 'none' }}>
                        <div className="pcc-left pull-left pdc-inputs review-tab">
                            {this.renderOrderDetails()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
   
}

module.exports = ReviewComponent;