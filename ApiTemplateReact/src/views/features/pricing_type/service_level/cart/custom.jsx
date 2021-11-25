'use strict';
const React = require('react');
const Moment = require('moment');
const toastr = require('toastr');
const EnumCoreModule = require('../../../../../public/js/enum-core');
const BaseComponent = require('../../../../shared/base');

class CustomCartComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    getBookingType(item) {
        const { DurationUnit, BookingUnit, PriceUnit } = item;
        if (!DurationUnit && !BookingUnit && !PriceUnit) return null;

        if (!DurationUnit || PriceUnit == DurationUnit) {
            return 'Book by duration';
        }
        if (BookingUnit && PriceUnit == BookingUnit) {
            return 'Book by unit';
        }

        return 'Book by duration and unit';
    }

    doShowDurationInputField() {
        const bookingType = this.getBookingType();
        return bookingType != null && bookingType != 'Book by unit';
    }

    doShowUnitInputField() {
        const bookingType = this.getBookingType();
        return bookingType != null && bookingType !== 'Book by duration';
    }

    showBookingTime(isOvernight, durationUnit) {
    	return !isOvernight && (durationUnit 
            && (durationUnit.toLowerCase().includes('minute') 
                || durationUnit.toLowerCase().includes('hour')));
    }

    renderCartInfo(cart) {
    	if (cart && cart.ItemDetail) {
    		const item = cart.ItemDetail;
	        const itemImageUrl = item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
	        let fromDate = '';
	        let toDate = '';
	        let fromTime = '';
	        let toTime = '';
            let checkInTime = '';
            let checkOutTime = '';

	        let showBookingTime = false;
	        let duration = 0;
	        if (cart.BookingSlot) {
	        	fromDate = Moment.unix(cart.BookingSlot.FromDateTime).utc().format('DD/MM/YYYY');
	        	toDate = Moment.unix(cart.BookingSlot.ToDateTime).utc().format('DD/MM/YYYY');
	        	duration = cart.BookingSlot.Duration;
	        	if (item.Scheduler) {
	        		showBookingTime = this.showBookingTime(item.Scheduler.Overnight, cart.BookingSlot.DurationUnit);
		        	if (showBookingTime) {
		        		fromTime = Moment.unix(cart.BookingSlot.FromDateTime).utc().format(process.env.TIME_FORMAT);
		        		toTime = Moment.unix(cart.BookingSlot.ToDateTime).utc().format(process.env.TIME_FORMAT);
		        	}
                    if (item.Scheduler.Overnight) {
                        if (item.Scheduler.OpeningHours && item.Scheduler.OpeningHours.length > 0) {
                            checkInTime = Moment(item.Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format(process.env.TIME_FORMAT);
                            checkOutTime = Moment(item.Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format(process.env.TIME_FORMAT);
                        }
                    }
		        }
	        }


	        let bookingType = this.getBookingType(item);
            return (
                <div className="flex-wrap">
                    <div className="thumb-group">
                        <img data-src={itemImageUrl} className="lazyload" />
                    </div>
                    <div className="po-content">
                        <span>
                            {item.Name}
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
                                    item.Scheduler && item.Scheduler.Overnight == true?
                                        <span className="if-txt">
                                            <span>{`Check-in/Check-out: ${checkInTime} - ${checkOutTime}`}</span>
                                        </span>

                                    : ''
                                }
                               	{
                               		bookingType && bookingType != 'Book by unit' ?
                               			<span className="if-txt">
		                                    <span>No of {item.DurationUnit}:</span>
		                                    <span className="no_of_hour">{duration}</span>
		                                </span>
                               		: ''
                               	}
                               	{
                               		bookingType && bookingType != 'Book by duration' ?
                               			<span className="if-txt">
		                                    <span>No of {item.BookingUnit}:</span>
		                                    <span className="no_of_hour">{cart.Quantity}</span>
		                                </span>
                               		: ''
                               	}
                               	{
                               		cart.AddOns && cart.AddOns.length > 0 ? 

                               			<span className="if-txt">
	                                		<span>Add-ons:</span>
		                                	<span>
		                                	{this.renderAddOns(cart.AddOns, cart.CurrencyCode)}
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
        return "";
    }

    renderAddOns(addOns, currencyCode) {
    	const self = this;
		const sortedAddOns = addOns.sort((a,b) => a.SortOrder - b.SortOrder);
		const formattedAddOns = [];
		for(let i = 0; i < sortedAddOns.length; i++) {
			formattedAddOns.push(`${sortedAddOns[i].Name} +${self.formatMoney(currencyCode, sortedAddOns[i].PriceChange)}`);
			formattedAddOns.push(<br key={i}/>)
		}
		return formattedAddOns;
    }

    customRenderCartItem(carts, handleItemSelect) {
    	const self = this;
    	if (carts && carts.length > 0) {
    		let cartContentsPerMerchant = [];
    		for (let i = 0; i < carts.length; i++) {
				let isChecked = 'checked';
				let cartContents = [];
				let sellerName = '';
    			let merchantId = '';
    			
    			if (carts[i] && carts[i].length > 0) {
    				let cartsPerMerchant = carts[i];
    				if (cartsPerMerchant && cartsPerMerchant.length > 0) {
    					cartContents = cartsPerMerchant.map(cart => {
    						let itemImageUrl = '';
                            let subtotal = cart.SubTotal - (cart.DiscountAmount || 0);
    						if (cart.ItemDetail && cart.ItemDetail.Media && cart.ItemDetail.Media[0]) {
    							itemImageUrl = cart.ItemDetail.Media[0].MediaUrl;
    						}
    						if (cart.ItemDetail && cart.ItemDetail.MerchantDetail) {
			                    sellerName = cart.ItemDetail.MerchantDetail.DisplayName;
			                    merchantId = cart.ItemDetail.MerchantDetail.ID;
			                }

    						if (cart.isChecked === '') isChecked = '';
                            if (cart.AddOns && cart.AddOns.length > 0) {
                                cart.AddOns.map(addOn => subtotal += parseFloat(addOn.PriceChange || 0));
                            }
    						return (

    							<tr key={cart.ID}>
    								<td width="30">
		                                <span className="fancy-checkbox full-width">
		                                    <input type="checkbox"
		                                        id={cart.ID}
		                                        name="item-options[]"
                                                disabled={cart.isItemDisabled ? 'disabled' : ''}
		                                        checked={cart.isChecked}
		                                        onChange={() => { handleItemSelect(cart.ID, "") }} 
		                                    />
		                                    <label disabled={cart.isItemDisabled} htmlFor={cart.ID} />
		                                </span>
		                            </td>
		                            <td data-th="Item">
	                                	{self.renderCartInfo(cart)}
		                            </td>
		                            <td className="text-right total-price" data-th="Total Price">
		                                {self.renderFormatMoney(cart.ItemDetail.CurrencyCode, subtotal)}
		                            </td>
		                            <td>
		                                <div className="cart-act">
		                                    <span id={cart.ID} className="cbcr-delete openModalRemove">
		                                        <i className="fa fa-trash"></i>
		                                    </span>
		                                </div>
		                            </td>
    							</tr>

    						);
    					});
    				}
    			}
    			if (sellerName !== '') {
                    const isSellerDisabled = carts && carts[i] && carts[i].length > 0 && carts[i].filter(cart => !cart.isItemDisabled && !cart.isMerchantDisabled).length == 0;
                    const allVisibleItems =  carts[i] && carts[i].length > 0 ? carts[i].filter(cart => !cart.isItemDisabled && !cart.isMerchantDisabled) : [];
                    const allCheckedCarts = carts[i] && carts[i].length > 0 ? carts[i].filter(cart => cart.isChecked) : [];
                    isChecked = allVisibleItems.length !== 0 && allCheckedCarts.length !== 0 && allVisibleItems.length == allCheckedCarts.length;
	    			cartContentsPerMerchant.push(
	    					<div className="cart-box full-width" key={i}>
	                            <div className="cb-header">  
	                                <div className="cb-checkbox">
	                                    <span className="fancy-checkbox full-width">
	                                        <input type="checkbox" id={merchantId}
	                                            name="item-options[]"
	                                            checked={isChecked}
                                                disabled={isSellerDisabled ? 'disabled' : ''}
	                                            onChange={() => { handleItemSelect("", merchantId) }} />
	                                        <label htmlFor={merchantId} />
	                                    </span>
	                                </div>
	                                <span className="cb-seller">{sellerName}</span>
	                            </div>
	                            <div className="cb-content  parent-r-b">
	                                <div className="table-responsive">
	                                    <table className="table cart-items">
	                                        <thead>
	                                            <tr>
	                                                <th>&nbsp;</th>
	                                                <th>Details</th>
	                                                <th className="text-right">Total Price</th>
	                                                <th></th>
	                                            </tr>
	                                        </thead>
	                                        <tbody>
	                                            {cartContents}
	                                        </tbody>
	                                    </table>
	                                </div>
	                            </div>
	                        </div>
	                );
	            }
    		}
    		return cartContentsPerMerchant;
    	}
    	return "";
    }

    checkoutPressedCallback(result) {
    	if (result.success == false && result.code == 'INSUFFICIENT_STOCKS') {
        	toastr.error('The time period that you have selected has been completely booked out, please try choosing another.', 'Oops! Something went wrong.');
        }
    }
}

module.exports = CustomCartComponent;