'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const CheckoutReview = require('./review');
const OrderSummary = require('./order-summary');

const BaseComponent = require('../../../../shared/base');
const checkoutReviewAction = require('../../../../../redux/checkoutReviewAction');

class CheckoutReviewMain extends BaseComponent {
    render() {
        return (
            <div className="review-container" id="review-container">
                <div className="container">
                    <div className="pc-processbar">
                        <ul>
                            <li className="active">
                                <span className="icon">
                                    <i className="fa fa-check"></i>
                                </span>
                                <span className="pcul-text">Delivery</span>
                            </li>
                            <li className="active">
                                <span className="pb-line"></span>
                            </li>
                            <li className="active">
                                <span className="icon">2
                                </span>
                                <span className="pcul-text">Review</span>
                            </li>
                        </ul>
                    </div>
                    <div className="pc-content full-width">
                        <CheckoutReview invoiceDetails={this.props.invoiceDetails}
                            merchantDetail={this.props.merchantDetail}
                            shippingOptions={this.props.shippingOptions}
                            selectDelivery={this.props.selectDelivery}
                            generateComparisonFile={this.props.generateComparisonFile}
                            pickupOptions={this.props.pickupOptions} />
                        <OrderSummary invoiceDetails={this.props.invoiceDetails}
                            shippingOptions={this.props.shippingOptions}
                            address={this.props.addressModel}
                            updateToPaid={this.props.updateToPaid}
                            comparisonId={this.props.comparisonId}
                            pickupOptions={this.props.pickupOptions} />
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
        merchantDetail: state.merchantReducer.user,
        comparisonId: state.settingsReducer.comparisonId,
        pickupOptions: state.settingsReducer.pickupOptions
    }
}

function mapDispatchToProps(dispatch) {
    return {
        selectDelivery: (delivery) => dispatch(checkoutReviewAction.selectDelivery(delivery)),
        generateComparisonFile: (orderId) => dispatch(checkoutReviewAction.generateComparisonFile(orderId)),
        updateToPaid: (data, comparisonId, failedCallback) => dispatch(checkoutReviewAction.updateToPaid(data, comparisonId, failedCallback))
    }
}


module.exports = {
    CheckoutReviewMain,
    mapStateToProps,
    mapDispatchToProps
}
