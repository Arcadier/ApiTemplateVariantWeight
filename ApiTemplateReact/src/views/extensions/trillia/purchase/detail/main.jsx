'use strict';
var React = require('react');
var ReactRedux = require('react-redux'); 

var BaseComponent = require('../../../../shared/base');
var TransactionDetailComponent = require('./transaction-detail');
var OrderListComponent = require('./order-list');

// Order Diary
var OrderDiaryActions = require('../../../../../redux/orderDiaryActions');
var OrderDiaryComponent = require('../../order-diary/index');

// Comparison
var ComparisonActions = require('../../../../../redux/comparisonActions');

class PurchaseDetailMain extends BaseComponent {
    onButtonClick() {
        window.location = '/purchase/history';
    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    render() {
        return (
            <div className="purchase-history-container">
                <div className="container">
                    <div className="h-parent-child-txt full-width">
                        <p><a href="/">Home</a></p>
                        <i className="fa fa-angle-right"></i>
                        <p><a href="/purchase/history">PO History</a></p>
                        <i className="fa fa-angle-right"></i>
                        <p className="active">PO Details</p>
                    </div>
                    <div className="phc-content">
                        <div className="hrcc-top full-width">
                            <div className="pull-left">
                                <a href="/purchase/history" className="btn-blue">
                                    <i className="fa fa-angle-left"></i>
                                </a>
                                <span className="h-title">Purchase Order Details</span>
                            </div>
                        </div>
                        <div className="hrcc-bot full-width">
                            <TransactionDetailComponent
                                detail={this.props.detail} />
                            <OrderListComponent
                                orders={this.props.detail.Orders}
                                comparison={this.props.comparison}
                                getComparisonByOrderId={this.props.getComparisonByOrderId}
                                generateComparisonFile={this.props.generateComparisonFile}
                                shippingMethod={this.props.shippingMethod} />
                            <OrderDiaryComponent
                                eventCustomField={this.props.eventCustomField}
                                events={this.getAllEvents()}
                                selectedSection={this.props.selectedSection}
                                selectedTabSection={this.props.selectedTabSection}
                                uploadFile={this.props.uploadFile}
                                isValidUpload={this.props.isValidUpload}
                                isSuccessCreate={this.props.isSuccessCreate}
                                fetchEvents={this.props.fetchEvents}
                                updateSelectedSection={this.props.updateSelectedSection}
                                updateSelectedTabSection={this.props.updateSelectedTabSection}
                                setUploadFile={this.props.setUploadFile}
                                createEvent={this.props.createEvent} />
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
        shippingMethod: state.purchaseReducer.shippingMethod,
        // Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate,
        // Comparison
        comparison: state.comparisonReducer.comparison
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // Order Diary
        fetchEvents: () => dispatch(OrderDiaryActions.fetchEvents()),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData) => dispatch(OrderDiaryActions.createEvent(event, formData)),
        // Comparison
        getComparisonByOrderId: (id) => dispatch(ComparisonActions.getComparisonByOrderId(id, true)),
        generateComparisonFile: (orderId) => dispatch(ComparisonActions.generateComparisonFile(orderId)),
    };
}

module.exports = {
    PurchaseDetailMain,
    mapStateToProps,
    mapDispatchToProps
};