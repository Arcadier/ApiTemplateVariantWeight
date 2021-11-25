'use strict';
import React from 'react';
import toastr from 'toastr';
import ProcessBarComponent from '../shared/process-bar';
import OrderSummary from '../shared/order-summary';
import CheckoutReview from './review';
import { selectDeliveryForOrder, initOrderDeliveryMap, proceedToPayment } from '../../../../../redux/checkoutReviewAction';

class CheckoutReviewMain extends React.Component {

    componentDidMount() {
        this.props.initOrderDeliveryMap();
    }

    handleProceedToPayment() {
        const { orderSelectedDelivery, invoiceDetails } = this;
        if (invoiceDetails) {
            const { Orders } = invoiceDetails; 
            let showError = false;
            if (Orders && Orders.length > 0) {
                Orders.map(order => {
                    const orderSelect = $(`.sel_del_method[order-id=${order.ID}]`);
                    const selectedDelID = $(orderSelect).find('option:selected').val();
                    if (selectedDelID === '' || selectedDelID == null || typeof selectedDelID == 'undefined') {
                        showError = true;
                        $(`.deliver-method[order-id=${order.ID}] h4`).addClass('text-danger');
                    }
                });
                if (showError == true) {
                    toastr.error('Please select the delivery method for each item','Error!');
                } else {
                    const self = this;
                    this.proceedToPayment(function (result) {
                        const { success, invoiceNo, message, code } = result;
                        if (success) {
                            window.location.href = `/checkout/payment?invoiceNo=${invoiceNo}`;
                        } else {
                            if (code && code == 'DISABLED_ITEM_OR_SELLER') {
                                self.renderErrorViewForDisabledItemOrSeller();
                            } else toastr.error(message, 'Error!')
                        }
                    });
                }
            } 
        }
    }
    

    renderErrorViewForDisabledItemOrSeller() {
        $(".review-container").empty();
        $(".review-container").html(`
            <div class="container">
                <div class="cart-top-section">
                    <div>
                        <div class="cart-top-sec-left"><span class="title">ERROR</span></div>
                        <div class="clearfix"></div>
                    </div>
                    <div class="cart-top-txt">
                        <p style="color:#FF5A60;">Invalid cart ids <br /> Cannot proceed payment.</p>
                    </div>
                </div>
            </div>
        `);
    }

	render() {
		return (
			<div className="review-container" id="review-container">
                <div className="container">
                    <ProcessBarComponent step={2} />
                    <div className="pc-content full-width">
                        <CheckoutReview 
                        	invoiceDetails={this.props.invoiceDetails}
                            selectDelivery={this.props.selectDelivery}
                            shippingOptions={this.props.shippingOptions}
                            pickupOptions={this.props.pickupOptions}
                            selectDeliveryForOrder={this.props.selectDeliveryForOrder}
                            orderSelectedDelivery={this.props.orderSelectedDelivery}
                        />
                        <OrderSummary
                            showEdit={true}
                            submitText={'Proceed to Payment'}
                            previous={'delivery'}
                            handleProceedButton={this.handleProceedToPayment}
                            invoiceDetails={this.props.invoiceDetails}
                            shippingOptions={this.props.shippingOptions}
                            pickupOptions={this.props.pickupOptions}
                            address={this.props.addressModel}
                            orderSelectedDelivery={this.props.orderSelectedDelivery}
                            proceedToPayment={this.props.proceedToPayment}
                            renderErrorViewForDisabledItemOrSeller={this.renderErrorViewForDisabledItemOrSeller}
                        />
                    </div>
                </div>
            </div>
		);
	}
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        addressModel: state.settingsReducer.addressModel,
        invoiceDetails: state.settingsReducer.invoiceDetails,
        shippingOptions: state.settingsReducer.shippingOptions,
        pickupOptions: state.settingsReducer.pickupOptions,
        orderSelectedDelivery: state.settingsReducer.orderSelectedDelivery
    }
}

function mapDispatchToProps(dispatch) {
    return {
        selectDeliveryForOrder: (orderID, delivery) => dispatch(selectDeliveryForOrder(orderID, delivery)),
        initOrderDeliveryMap: () => dispatch(initOrderDeliveryMap()),
        proceedToPayment: (callback) => dispatch(proceedToPayment(callback)),
    }
}


module.exports = {
	CheckoutReviewMain,
	mapStateToProps,
	mapDispatchToProps
}