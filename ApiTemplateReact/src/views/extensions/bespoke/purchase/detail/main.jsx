'use strict';
import React from 'react';
import ReactRedux from 'react-redux';
import TransactionDetailComponent from './transaction-detail';
import OrderListComponent from './order-list';
import { submitFeedbackForCartItem } from '../../../../../redux/purchaseActions';

class PurchaseDetailMain extends React.Component {
    onButtonClick() {
        window.location = '/purchase/history';
    }

	render() {
		return (
			<div className="purchase-history-container">
                <div className="container">
                	<div className="h-parent-child-txt full-width">
                        <p><a href="/">Home</a></p>
                        <i className="fa fa-angle-right"></i>
                        <p><a href="/purchase/history">Purchase History</a></p>
                        <i className="fa fa-angle-right"></i>
                        <p className="active">Order Summary</p>
                    </div>
                    <div className="phc-content">
                        <div className="hrcc-top full-width">
                            <div className="pull-left">
                                <a href="/purchase/history" className="btn-blue">
                                    <i className="fa fa-angle-left"></i>
                                </a>
                                <span className="h-title">Order Summary</span>
                            </div>
                        </div>
                        <div className="hrcc-bot full-width">
                            <TransactionDetailComponent detail={this.props.detail} />
                            <OrderListComponent InvoiceNo={this.props.detail.InvoiceNo} orders={this.props.detail.Orders} shippingMethod={this.props.shippingMethod} submitFeedbackForCartItem={this.props.submitFeedbackForCartItem} />
                            <div className="osc-btn">
                                <div className="btn-back" onClick={(e) => this.onButtonClick()}>Back to List</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
        user: state.userReducer.user,
        detail: state.purchaseReducer.detail,
        shippingMethod: state.purchaseReducer.shippingMethod
	}
}

function mapDispatchToProps(dispatch) {
	return {
        submitFeedbackForCartItem: (options, callback) => dispatch(submitFeedbackForCartItem(options, callback)),
    };
}


module.exports = {
	PurchaseDetailMain,
	mapStateToProps,
	mapDispatchToProps
};

