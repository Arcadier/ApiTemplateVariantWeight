'use strict';
import React from 'react';
import Currency from 'currency-symbol-map';
import BaseComponent from '../../../../shared/base';

class CheckoutReview extends BaseComponent {

	componentDidUpdate() {
		const { shippingOptions, pickupOptions, orderSelectedDelivery } = this.props;
		if (orderSelectedDelivery) {
			for (let orderID of orderSelectedDelivery.keys()) {
				const selectedDel = orderSelectedDelivery.get(orderID);
				if (selectedDel) {
					if (!selectedDel.IsPickup && selectedDel.ShippingData.ID) {
						$(`.sel_del_method[order-id=${orderID}]`).val(selectedDel.ShippingData.ID);
						const surcharge = $(`.sel_del_method[order-id=${orderID}]`).find('option:selected').attr('data-surcharge');
        				const time =$(`.sel_del_method[order-id=${orderID}]`).find('option:selected').attr('data-time');
        				$(`.deliver-method[order-id=${orderID}]`).find('.surcharge').html(surcharge);
        				$(`.deliver-method[order-id=${orderID}]`).find('.lead-time').html(time);
					} else if (selectedDel.IsPickup && selectedDel.ID) {
						$(`.sel_del_method[order-id=${orderID}]`).val(selectedDel.ID);
						const surcharge = $(`.sel_del_method[order-id=${orderID}]`).find('option:selected').attr('data-surcharge');
        				const time =$(`.sel_del_method[order-id=${orderID}]`).find('option:selected').attr('data-time');
        				$(`.deliver-method[order-id=${orderID}]`).find('.surcharge').html(surcharge);
        				$(`.deliver-method[order-id=${orderID}]`).find('.lead-time').html(time);
					}
				}
			}
			this.calculateDeliveryCost();
		}
	}

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
	        		selectedDelOption = merchantPickup.pickupOptions.find(p => p.ID === selectedDelID);
	        	}
	        }
	    }
	        
        $(`.deliver-method[order-id=${order.ID}]`).find('.surcharge').html(surcharge);
        $(`.deliver-method[order-id=${order.ID}]`).find('.lead-time').html(time);


        this.props.selectDeliveryForOrder(order.ID, selectedDelOption);
        this.calculateDeliveryCost();
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
		return (
			<div className="item-attrs">
				{variants.map(v => 
					<div key={v.ID} className="attr-size">
						<span>{`${v.GroupName}: `}</span>
						<span>{v.Name}</span>
					</div>
				)}
      		</div>
      	);
	}

	renderSellerDisplayName(merchant) {
		return merchant && merchant.DisplayName ? merchant.DisplayName : '';
	}

	renderCartItem(cartItem) {
        const { ItemDetail } = cartItem;
		return (
			<div key={cartItem.ID} className="box-item__">
		    	<div className="item-image">
		    		<img src={ItemDetail.Media[0].MediaUrl}/>
		    	</div>
			    <div className="item-info">
			    	<p className="item-name">{ItemDetail.Name}</p>
			    	<div className="item-price">
			      		{this.renderFormatMoney(cartItem.CurrencyCode || ItemDetail.CurrencyCode, ItemDetail.Price)}
			      	</div>
			    	<div className="item-field">
			      		<span className="if-txt">
                            <span>Quantity:</span>
                            <span>{this.formatAmountWithCommaSeparator(cartItem.Quantity)}</span>
			      		</span>
			    	</div>
			    	{
			    		ItemDetail && ItemDetail.Variants && ItemDetail.Variants.length > 0 ? 
			    		this.renderAdditionalAttr(ItemDetail.Variants): null
			    	}
			    </div>
			</div>
		)
	}
	
	renderCartContents(order) {
		const { CartItemDetails } = order;
		return (
			<div className="col-md-7 cbc-left">
				<div className="wrap">
					{CartItemDetails.map(cartItem => this.renderCartItem(cartItem))}
				</div>
			</div>
		);	
	}

	getMinimumLeadTime(del) {
		const { ShippingData } = del;
		if (ShippingData && ShippingData.CustomFields && ShippingData.CustomFields.length > 0) {
			const { CustomFields } = ShippingData;
			const deliveryOpt = CustomFields.find(x => x.Name === 'DeliveryOptions');
			if (deliveryOpt) {
				const values = JSON.parse(deliveryOpt.Values[0])
				if (values && values.MinimumLeadTime) return values.MinimumLeadTime;
			}
		}
		return null;
	}
	renderDeliveryOptions(order, merchantShippingOptions, merchantPickupOptions) {
		return (
			<React.Fragment>
				<option data-surcharge="-" data-time="-" data-cost="0.00" value="">Select Delivery Method</option>
				{
					merchantShippingOptions && merchantShippingOptions.shippingOptions.map(del =>
						<option 
							key={`${order.ID}|||${del.ShippingData.ID}`}
							data-surcharge={`${del.CurrencyCode} ${Currency(del.CurrencyCode)}${parseFloat(del.ShippingCost || 0).toFixed(2)}`}
							data-time={this.getMinimumLeadTime(del)}
							data-cost={del.ShippingCost}
							value={del.ShippingData.ID}
						>
							{del.ShippingData.Description}
							({this.renderFormatMoney(del.CurrencyCode, del.ShippingCost)})
						</option>
					)
				}
				{
					merchantPickupOptions && merchantPickupOptions.pickupOptions.map(del => 
						<option key={del.ID} data-surcharge="Pick-up" data-time="-" data-cost="0.00" value={del.ID}>
							{`${del.Name} (Pick-up)`}
						</option>
					)
				}

			</React.Fragment>
		)
	}
	renderDeliveryReview(order) {
		const merchantID = order.MerchantDetail.ID;
		const { pickupOptions, shippingOptions } = this.props;
		const merchantShippingOptions = shippingOptions.find(x => x.Merchant.ID === merchantID);
		const merchantPickupOptions = pickupOptions.find(x => x.Merchant.ID === merchantID);
		if ((typeof merchantShippingOptions == 'undefined' || (merchantShippingOptions && merchantShippingOptions.shippingOptions.length === 0))
			&& (typeof merchantPickupOptions == 'undefined' || (merchantPickupOptions && merchantPickupOptions.pickupOptions.length === 0))
		) return null;
		return (
			<div className="dr-content deliver-method" order-id={order.ID}>
				<div className="delivery-review">
		    		<h4 className="text-center">Delivery/Pick-up</h4>
				    <form>
				      <div className="form-element">
				        <select 
				        	className="txt sel_del_method"
				        	name="delivery_method[]"
				        	key={order.ID}
				        	order-id={order.ID}
				        	onChange={e => this.handleDeliveryOptionChange(e, order)}
				        >
				          {this.renderDeliveryOptions(order, merchantShippingOptions, merchantPickupOptions)}
				        </select>
				      </div>
				    </form>
				    <div className="charge_box">
				      <label>Surcharge</label>
				      <p className="surcharge">-</p>
				      <label>Minimum Lead Time</label>
				      <p className="lead-time">-</p>
				    </div>
		  		</div>
		  	</div>
	  	);
	}

	renderNoAvailableDelivery(order) {
		const { pickupOptions, shippingOptions } = this.props;
		const merchantID = order.MerchantDetail.ID;
		const merchantShippingOptions = shippingOptions.find(x => x.Merchant.ID === merchantID);
		const merchantPickupOptions = pickupOptions.find(x => x.Merchant.ID === merchantID);

		if ((typeof merchantShippingOptions == 'undefined' || (merchantShippingOptions && merchantShippingOptions.shippingOptions.length === 0))
			&& (typeof merchantPickupOptions == 'undefined' || (merchantPickupOptions && merchantPickupOptions.pickupOptions.length === 0))
		) {
			return (
				<React.Fragment>
					<div className="dr-content">
		                <div className="delivery-review">
		                    <span className="title">Select your delivery method.</span>
							<span className="no-delivery-method-text">
								<p>No available delivery methods,<br/>please check the item(s) detail page or contact merchant</p>
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
							<span className="currency">{`${this.props.invoiceDetails.CurrencyCode} ${Currency(this.props.invoiceDetails.CurrencyCode)}`}</span>
		                	<span className="value">0.00</span>
		                	</span>
		            	</div>
		           		<div className="clearfix"/>
		            </div>
            	</React.Fragment>
            );
        }
        return null;
	}
	renderOrdersByMerchant() {
        const { invoiceDetails, pickupOptions, shippingOptions } = this.props;

        const { Orders } = invoiceDetails;
		return Orders.map(order =>
        	<div key={order.ID} className="cart-box-item mearchant_box">
	  			<div className="cb-header"> 
	  				<span className="cb-seller">
	  					{this.renderSellerDisplayName(order.MerchantDetail)}
	  				</span>
	  			</div>
	        	<div className="cb-content">
	           		<div className="row flex">
	           			{this.renderCartContents(order)}
	           			<div className="col-md-5 cbc-right">
							{this.renderDeliveryReview(order)}
						</div>
	            	</div>
          		</div>
          		{this.renderNoAvailableDelivery(order)}
       		</div>
       	)
        
	}
	render() {
        return (
            <div className="pcc-left pull-left">
                <div className="cart-box full-width">
                	{this.renderOrdersByMerchant()}
		        </div>
            </div>
        );
    }
}

module.exports = CheckoutReview;