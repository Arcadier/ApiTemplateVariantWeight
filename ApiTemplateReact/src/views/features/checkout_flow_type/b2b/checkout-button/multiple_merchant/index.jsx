'use strict';
const React = require('react');
const toastr = require('toastr');

class CheckoutButtonComponent extends React.Component {

	isDisabled() {
		if (this.props.isGuest) return "disabled";
		return this.props.merchantSelectedCount == 1? "" : "disabled";
	}

	onCheckoutBtnClick() {
		toastr.error('Creating requisition is not supported for multi-merchant');
	}

	render() {
        return (
            <React.Fragment>
                <div className={"btn-checkout " + this.isDisabled()} onClick={() => { this.isDisabled() ? null : this.onCheckoutBtnClick() }}>
                	<a href={null}>Create Requisition</a>
                </div>
            </React.Fragment>
        );
    }
}


module.exports = CheckoutButtonComponent;