'use strict';
var React = require('react');

class ModalStatusChangeComponent extends React.Component {
    renderStatusSelection() {
        const self = this;
        
        return (
            this.props.selectedFulfillmentStatuses.map(function (status, index) {
                return (
                    <div className="fancy-radio" key={index}>
                        <input type="radio" name="pickup-status" id={"popup-delivery" + index} checked={self.props.selectedOrderStatus === status ? true : false} onChange={(e) => self.props.updateSelectedOrderStatus(status)} />
                        <label htmlFor={"popup-delivery" + index}>{status === 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status}</label>
                    </div>
                )
            })
        )
    }

    render() {
        return (
            <div className="popup-area order-pickup-dilvery-popup">
                <div className="wrapper">
                    <div className="title-area pull-left">
                        <h1>ORDER STATUS CHANGE</h1>
                    </div>
                    <div className="pull-right"><span className="btn-saffron close" onClick={(e) => this.props.showHideChangeStatus(false)}>&times;</span> </div>
                    <div className="clearfix"></div>
                    <div className="popup-content-area">
                        <p>Depending on what your order status and delivery method is, you will only be able to change certain order statuses at the same time.</p>
                        <p>Your order(s) selected delivery type is: <strong>{this.props.selectedDeliveryTypeName}</strong></p>
                        <p>What will the status of your selected orders be?</p>
                        {this.renderStatusSelection()}
                    </div>
                    <div className="btn-area text-center">
                        <input type="button" value="Change Status" className="my-btn btn-green-popup close-status-change-popup" onClick={(e) => this.props.updateHistoryOrders()} />
                        <div className="clearfix"></div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = ModalStatusChangeComponent;