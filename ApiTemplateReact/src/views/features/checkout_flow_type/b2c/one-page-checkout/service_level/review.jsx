'use strict';
import React from 'react';
import Moment from 'moment';
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

        if (surcharge !== '-') {
            if (surcharge !== 'Pick-up') {
                const merchantShipping = shippingOptions.find(s => s.Merchant.ID === order.MerchantDetail.ID);
                if (merchantShipping.shippingOptions && shippingOptions.length > 0) {
                    selectedDelOption = merchantShipping.shippingOptions.find(so => so.ShippingData.ID === selectedDelID);
                }
            } else {
                const merchantPickup = pickupOptions.find(p => p.Merchant.ID === order.MerchantDetail.ID);
                if (merchantPickup.pickupOptions && merchantPickup.pickupOptions.length > 0) {
                    selectedDelOption = merchantPickup.pickupOptions.find(p => p.Id === selectedDelID);
                }
            }
        }
            
        $(`.deliver-method[order-id=${order.ID}]`).find('.surcharge').html(surcharge);
        $(`.deliver-method[order-id=${order.ID}]`).find('.lead-time').html(time);
        this.props.deliveryChanged(selectedDelOption, order.ID);
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


    renderSellerDisplayName(merchant) {
        return merchant && merchant.DisplayName ? merchant.DisplayName : '';
    }

    showBookingTime(isOvernight, durationUnit) {
        return !isOvernight && (durationUnit 
            && (durationUnit.toLowerCase().includes('minute') 
                || durationUnit.toLowerCase().includes('hour')));
    }
    
    renderAddOns(addOns, currencyCode) {
        const self = this;
        const sortedAddOns = addOns.sort((a,b) => a.SortOrder - b.SortOrder);
        const formattedAddOns = [];
        for(let i = 0; i < sortedAddOns.length; i++) {
            formattedAddOns.push(`- ${sortedAddOns[i].Name} +${self.formatMoney(currencyCode, sortedAddOns[i].PriceChange)}`);
            formattedAddOns.push(<br key={i}/>)
        }
        return formattedAddOns;
    }

    getBookingType(item) {
        const { DurationUnit, BookingUnit, PriceUnit } = item;
        if (!DurationUnit && !BookingUnit && !PriceUnit) return null;

        if (!DurationUnit || PriceUnit.toLowerCase() == DurationUnit.toLowerCase()) {
            return 'Book by duration';
        }
        if (BookingUnit && PriceUnit.toLowerCase() == BookingUnit.toLowerCase()) {
            return 'Book by unit';
        }

        return 'Book by duration and unit';
    }

    renderCartItemDescription(cartItem, i) {
        if (cartItem && cartItem.ItemDetail) {
            let fromDate = '';
            let toDate = '';
            let fromTime = '';
            let toTime = '';
            let checkInTime = '';
            let checkOutTime = '';

            let showBookingTime = false;
            let duration = 0;
            const { ItemDetail } = cartItem;
            if (cartItem.BookingSlot) {
                fromDate = Moment.unix(cartItem.BookingSlot.FromDateTime).utc().format('DD/MM/YYYY');
                toDate = Moment.unix(cartItem.BookingSlot.ToDateTime).utc().format('DD/MM/YYYY');
                duration = cartItem.BookingSlot.Duration;
                if (ItemDetail.Scheduler) {
                    showBookingTime = this.showBookingTime(ItemDetail.Scheduler.Overnight, cartItem.BookingSlot.DurationUnit);
                    if (showBookingTime) {
                        fromTime = Moment.unix(cartItem.BookingSlot.FromDateTime).utc().format(process.env.TIME_FORMAT);
                        toTime = Moment.unix(cartItem.BookingSlot.ToDateTime).utc().format(process.env.TIME_FORMAT);
                    }
                    if (ItemDetail.Scheduler.Overnight) {
                        if (ItemDetail.Scheduler.OpeningHours && ItemDetail.Scheduler.OpeningHours.length > 0) {
                            checkInTime = Moment(ItemDetail.Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format(process.env.TIME_FORMAT);
                            checkOutTime = Moment(ItemDetail.Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format(process.env.TIME_FORMAT);
                        }
                    }
                }
            }
            const bookingType = this.getBookingType(ItemDetail);
            return (
                <div key={ItemDetail.ID + i} className="flex-wrap">
                    <div className="thumb-group">
                        <img src={ItemDetail.Media != null ? ItemDetail.Media[0].MediaUrl : ""} style={{ maxWidth: '64px' }}/>                                   
                    </div>
                    <div className="po-content">
                        <span>
                            {ItemDetail.Name}
                            <div className="item-field">
                                <span className="if-txt">
                                    <span>Date:</span>
                                    <span>{`${fromDate} - ${toDate}`}</span>
                                </span>
                                {
                                    showBookingTime ? 
                                        <span className="if-txt">
                                            <span>Time:</span>
                                            <span>{`${fromTime} - ${toTime}`}</span>
                                        </span>
                                    :''
                                }
                                {
                                    ItemDetail.Scheduler && ItemDetail.Scheduler.Overnight == true?
                                        <span className="if-txt">
                                            <span>{`Check-in ${checkInTime} Check-out ${checkOutTime}`}</span>
                                        </span>

                                    : ''
                                }
                                {
                                    bookingType && bookingType != 'Book by unit' ?
                                        <span className="if-txt">
                                            <span>No of {ItemDetail.DurationUnit}:</span>
                                            <span className="no_of_hour">{duration}</span>
                                        </span>
                                    : ''
                                }
                                {
                                    bookingType && bookingType != 'Book by duration' ?
                                        <span className="if-txt">
                                            <span>No of {ItemDetail.BookingUnit}:</span>
                                            <span className="no_of_hour">{cartItem.Quantity}</span>
                                        </span>
                                    : ''
                                }
                                {
                                    cartItem.AddOns && cartItem.AddOns.length > 0 ? 

                                        <span className="if-txt">
                                            <span>Add-ons:</span>
                                            <span>
                                            {this.renderAddOns(cartItem.AddOns, cartItem.CurrencyCode)}
                                            </span>
                                        </span>
                                    : ''
                                }
                                    
                            </div>
                        </span>
                    </div>
                </div>
            );
        }
        return;
    }

    renderCartItem(cartItem, i, hasOffer, orderTotal) {
        const { ItemDetail } = cartItem;
        //ARC9207
        let cartSubTotal = parseFloat(ItemDetail.Price * cartItem.Quantity) - parseFloat(cartItem.DiscountAmount || 0);
        let totalAddOnsAmount = 0;
        if (cartItem.AddOns && cartItem.AddOns.length > 0) {
            totalAddOnsAmount = cartItem.AddOns.reduce(function (total, currentValue) {
                return total + currentValue.PriceChange;
            }, 0);
        }
        cartSubTotal += totalAddOnsAmount;
        //ARC-9763
        if (hasOffer) {
            cartSubTotal = orderTotal;
        }
        return (
            <tr key={cartItem.ID + i}>
                <td data-th="Item Description">
                    {this.renderCartItemDescription(cartItem, i)}
                </td>
                <td className="text-right" data-th="Total" colSpan="3">
                    {this.renderFormatMoney(cartItem.CurrencyCode || ItemDetail.CurrencyCode, cartSubTotal)}
                </td>
            </tr>
        );
    }

    renderQuotationDetails() {
        const { pendingOffer } = this.props;
        const currencyCode =  this.props.invoiceDetails.CurrencyCode;
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

    renderCartContents(order) {
        const { CartItemDetails } = order;
        let channelId = this.props.pendingOffer && this.props.pendingOffer.ChannelID ? this.props.pendingOffer.ChannelID  : null;
        const chatLink = channelId ? "/chat?channelId=" + channelId : null
        let self = this;
        return (
            <React.Fragment>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Details</th>
                            <th className="text-right" width="171px" colSpan="3">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            CartItemDetails.map(function (cartItem, i) {
                                let hasOffer = order && order.OfferDetails && order.OfferDetails.length > 0;
                                return self.renderCartItem(cartItem, i, hasOffer, order.Total);
                            })
                        }
                    </tbody>
                    {this.renderQuotationDetails()}
                </table>
                <div className="review-btn">
                    <textarea placeholder="Note to seller" className="form-control remove-resize" rows="4" name="noteseller" id="notetoseller" />
                </div>
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
        return "N/A";
    }

    renderDeliveryOptions(order, merchantShippingOptions, merchantPickupOptions) {
        const correctShippingMethod = merchantShippingOptions && merchantShippingOptions.shippingOptions ? 
            merchantShippingOptions.shippingOptions.filter(so => so.ShouldShow && so.ShouldShow === true)
            : null;
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
                    merchantPickupOptions && merchantPickupOptions.pickupOptions.map(del =>
                        <option key={`${order.ID}|||${del.Id}`} data-surcharge="Pick-up" data-time="-" data-cost="0.00" value={del.Id}>
                            {`${del.Name} (Pick-up)`}
                        </option>
                    )
                }

            </React.Fragment>
        )
    }

    renderDeliveryReview(order) {
        const self = this;
        const merchantID = order.MerchantDetail.ID;

        const { pickupOptions, shippingOptions, orderSelectedDelivery } = this.props;
        if (shippingOptions && shippingOptions.length == 0
            && pickupOptions && pickupOptions.length == 0) return;

        let merchantShippingOptions;
        let merchantPickupOptions;
        if (shippingOptions && shippingOptions.length > 0) {
            merchantShippingOptions = shippingOptions.find(x => x.Merchant.ID === merchantID);
        }
        if (pickupOptions && pickupOptions.length > 0) {
            merchantPickupOptions = pickupOptions.find(x => x.Merchant.ID === merchantID);
        }

        if ((typeof merchantShippingOptions == 'undefined' || (merchantShippingOptions && merchantShippingOptions.shippingOptions.length === 0))
            && (typeof merchantPickupOptions == 'undefined' || (merchantPickupOptions && merchantPickupOptions.pickupOptions.length === 0))
        ) return;

        let leadTime = "N/A";
        if (orderSelectedDelivery && orderSelectedDelivery.length > 0) {
            orderSelectedDelivery.forEach(function (delivery, i) {
                if (delivery[order.ID] && delivery[order.ID].IsPickup === false && delivery[order.ID].OrderID === order.ID) {
                    leadTime = self.getMinimumLeadTime(delivery[order.ID]);
                }
            });
        }

        return (
            <div className="dr-content">
                <div className="delivery-review">
                    <label className="full-width">Shipping Method</label>
                    <div className="select_shipping">
                        <select className="txt sel_del_method"
                            name="delivery_method[]"
                            key={order.ID}
                            order-id={order.ID}
                            onChange={e => this.handleDeliveryOptionChange(e, order)}>
                            {this.renderDeliveryOptions(order, merchantShippingOptions, merchantPickupOptions)}
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

    renderOrdersByMerchant() {
        const { invoiceDetails } = this.props;
        if (invoiceDetails) {
            const { Orders } = invoiceDetails;
            return Orders.map((order, i) =>
                <React.Fragment key={order.ID}>
                    <div className="cb-content" key={order.ID}>
                        <div className="delivery-address-subtitle pull-left">
                            {this.renderSellerDisplayName(order.MerchantDetail)}
                        </div>
                        {this.renderCartContents(order)}
                    </div>
                    {this.renderDeliveryReview(order)}
                </React.Fragment>
            )
        } else {
            return "";
        }
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
                            {this.renderOrdersByMerchant()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ReviewComponent;