'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var OrderActions = require('../../../../../../redux/orderActions');

var BaseComponent = require('../../../../../../views/shared/base');
var TransactionDetailComponent = require('./transaction-detail');
var ShippingDetailComponent = require('./shipping-detail');
var ItemDetailComponent = require('./item-detail');
var ModalSuccessChangeComponent = require('./modal-success-change');

//Order Diary
var OrderDiaryActions = require('../../../../../../redux/orderDiaryActions');
var OrderDiaryComponent = require('../../../order-diary/index');

class OrderDetailIndexComponent extends BaseComponent {
    componentDidUpdate() {
        if (this.props.isShowSuccessMessage === true) {
            $("#modalStatusChange").modal("show");
        } else {
            $("#modalStatusChange").modal("hide");
        }
    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    render() {
        return (
            <React.Fragment>
                <div className="orderdetail-container">
                        <div className="container">
                            <TransactionDetailComponent
                                detail={this.props.detail} />
                            <ShippingDetailComponent
                                orders={this.props.detail.Orders}
                                updateDetailOrder={this.props.updateDetailOrder} />
                        <ItemDetailComponent
                                orders={this.props.detail.Orders}
                                revertPayment={this.props.revertPayment} />
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
                                createEvent={this.props.createEvent}
                        />
                               
                        </div>
                    </div>
                <ModalSuccessChangeComponent showHideSuccessMessage={this.props.showHideSuccessMessage} />
            </React.Fragment>
        );
    }
}

module.exports = OrderDetailIndexComponent;