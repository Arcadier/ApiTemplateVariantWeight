'use strict';
const React = require('react');
const toastr = require('toastr');

class CheckoutButtonComponent extends React.Component {

    isDisabled() {
        return this.props.merchantSelectedCount !== 0? "" : "disabled";
    }

    onCheckoutBtnClick() {
        const self = this;
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
        const self = this;
        return (
            <React.Fragment>
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

module.exports = CheckoutButtonComponent;
