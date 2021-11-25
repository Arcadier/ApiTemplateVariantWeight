'use strict';
const React = require('react');
const toastr = require('toastr');

class CheckoutButtonMain extends React.Component {

	isDisabled() {
		return this.props.merchantSelectedCount == 1? "" : "disabled";
	}

    onCheckoutBtnClick() {
        const self = this;
        const opt = {
            cartDataArr: this.props.cartDataArr,
            userID: this.props.user.ID
        }

        if (this.props.processing == true) return;
        this.props.setProcessing(true);
        this.props.validateCarts(opt, function(result) { 
            if (result.success) self.props.CheckoutButtonPressedWrapper(self.props.cartIDs, self.props.user.ID);
            else self.props.setProcessing(false);
        });
    }
    
	render() {
        return (
            <React.Fragment>
            	{
            		this.props.merchantSelectedCount > 1 ?
	            		<div className="mm-msg">
	                		You have selected multiple items from multiple suppliers. Please select item(s) from a single supplier to continue.
	                    </div>
	                : ''
            	}
                <div 
                	className={"btn-checkout " + this.isDisabled()}
                	onClick={() => { this.isDisabled() ? null : this.onCheckoutBtnClick() }}
                >
                    <a href={null} className="btn-loader">Pay Now</a>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = CheckoutButtonMain;
