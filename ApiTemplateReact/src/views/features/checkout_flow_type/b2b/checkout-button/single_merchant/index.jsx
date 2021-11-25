'use strict';
const React = require('react');
const toastr = require('toastr');

class CheckoutButtonComponent extends React.Component {

	isDisabled() {
		if (this.props.isGuest) return "disabled";
		return this.props.merchantSelectedCount == 1? "" : "disabled";
	}

	onCheckoutBtnClick() {
		const self = this;
		if (!this.props.user || this.props.user.Guest) return;
        const opt = {
            cartDataArr: this.props.cartDataArr,
            userID: this.props.user.ID
        }
        //ARC10283

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
                <div className={"btn-checkout " + this.isDisabled()} onClick={() => { this.isDisabled() ? null : this.onCheckoutBtnClick() }}>
                	<a href={null}>Create Requisition</a>
                </div>
            </React.Fragment>
        );
    }
}


module.exports = CheckoutButtonComponent;