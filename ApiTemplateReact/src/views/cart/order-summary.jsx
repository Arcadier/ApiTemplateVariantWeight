const React = require('react');
const BaseComponent = require('../shared/base');
const cartActions = require('../../redux/cartActions');
const CheckoutButtonComponent  = require('../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/checkout-button/' + process.env.CHECKOUT_TYPE + '/index');

class OrderSummary extends BaseComponent {
	getSummary() {
		let subTotal = 0;
	    let currencyCode = '';
	    let cartIDs = [];
	    const self = this;
	    const merchantsOfSelected = [];
	    const cartDataArr = [];
	    this.props.cartPageModel.cartList.forEach(function (merchants) {
	        if (self.props.cartPageModel.isArranged === true) {
	            merchants.forEach(function (cart) {
	                if (cart.isChecked === "checked") {
	                    subTotal = subTotal + (cart.SubTotal - (cart.DiscountAmount || 0));
	                    if (cart.AddOns && cart.AddOns.length > 0) {
	                    	cart.AddOns.map(addOn => subTotal += parseFloat(addOn.PriceChange));
	                    }
	                    cartIDs.push(cart.ID);
	                    cartDataArr.push({
	                        ID: cart.ID,
	                        MerchantID: cart.ItemDetail.MerchantDetail.ID,
	                        Quantity: cart.Quantity,
	                        ItemID: cart.ItemDetail.ID,
	                        ItemParentID: cart.ItemDetail.ParentID,
	                        BookingSlot: cart.BookingSlot
	                    });
	                    if (!merchantsOfSelected.includes(cart.ItemDetail.MerchantDetail.ID)) merchantsOfSelected.push(cart.ItemDetail.MerchantDetail.ID)
	                }

	                currencyCode = cart.ItemDetail.CurrencyCode;
	            });
	        }
	    });
	    const merchantSelectedCount = merchantsOfSelected.length; 
	    const isGuest = !this.props.user || this.props.user.Guest;
	    return { subTotal, currencyCode, cartIDs, merchantSelectedCount, isGuest, cartDataArr };
	}

	CheckoutButtonPressedWrapper(cartIDs, userId) {
		const self = this;
		if (self.user.Guest == true && self.controlFlags.GuestCheckoutEnabled == false) {
			let loc = (location.pathname + location.search).substr(1)
			location.href = `/accounts/non-private/sign-in?returnUrl=${loc}`;
		} else {
			return self.CheckoutButtonPressed(cartIDs, userId, (result) => {
				if (typeof self.checkoutPressedCallback == 'function') self.checkoutPressedCallback(result);
			});	
		}
	}

	render() {
		const { merchantSelectedCount, currencyCode, subTotal, cartIDs, isGuest, cartDataArr } = this.getSummary();
		if (!(this.props.cartPageModel.cartList && this.props.cartPageModel.cartList.length > 0 && this.props.cartPageModel.isArranged)) return "";
		return (
			<div className="idc-right">
				<div className="cbcir-box">
					<span className="cbcir-title">Order Summary</span>
					<div className="cbcir-text">
						<span>SubTotal</span>
						<span className="title">
							<div className="item-price">
								{this.renderFormatMoney(currencyCode, subTotal)}
							</div>
						</span>
					</div>
					<div className="cbcir-button">
						<CheckoutButtonComponent 
							CheckoutButtonPressedWrapper={this.CheckoutButtonPressedWrapper}
							validateCarts={this.props.validateCarts}
							getItemDetails={this.props.getItemDetails}
							merchantSelectedCount={merchantSelectedCount}
							processing={this.props.processing}
							setProcessing={this.props.setProcessing}
							cartDataArr={cartDataArr}
							cartIDs={cartIDs}
							isGuest={isGuest}
							{...this.props}
						/>
						<div className="btn-continue"><a href="/">Continue Shopping</a></div>
					</div>
				</div>
			</div>
		);
	}
}

function customMapDispatchToProps(dispatch) {
	return {
		CheckoutButtonPressed: (cartIDs, userID, callback) => dispatch(cartActions.CheckoutButtonPressed(cartIDs, userID, callback)),
		validateCarts: (options, callback) => dispatch(cartActions.validateCarts(options, callback)),
	};
};

module.exports = {
	OrderSummary,
	customMapDispatchToProps,
};