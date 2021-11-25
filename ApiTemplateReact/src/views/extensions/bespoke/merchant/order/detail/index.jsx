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

    componentDidMount() {

    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    render() {
        return (
            <React.Fragment>
                <div className="orderdetail-container">
                    <br />
                    <br />
                        <div className="container">
                            <TransactionDetailComponent
                                detail={this.props.detail} />
                            <ShippingDetailComponent
                                orders={this.props.detail.Orders}
                                updateDetailOrder={this.props.updateDetailOrder} />
                        <ItemDetailComponent
                            user={this.props.user}
                            orders={this.props.detail.Orders}
                            detail={this.props.detail}  
                                revertPayment={this.props.revertPayment} />
                        </div>
                    </div>
                <ModalSuccessChangeComponent showHideSuccessMessage={this.props.showHideSuccessMessage} />
            </React.Fragment>
        );
    }
}

module.exports = OrderDetailIndexComponent;