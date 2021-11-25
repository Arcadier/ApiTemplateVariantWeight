'use strict';
const React = require('react');
const BaseComponent = require('../../../../../../shared/base');

class ModalConfirmCancel extends BaseComponent {
    onSaveCancel(e) {
        let self = this;
        let status = 'Cancelled';
        
        this.props.updateDetailOrder(status);
        self.setState({ orderStatus: status });
        $(".order-item-status-popup").attr("disabled", true);
        $("#cancelOrder").attr("disabled", true);
        $("#cancelOrder").addClass('lightgray');
        $('#cancelOrder').contents().filter(function () {
            return this.nodeType == 3
        }).each(function () {
            this.textContent = this.textContent.replace(' Cancel Order', ' Order Cancelled');
        });
    }
    render() {
        let displayStyle = this.props.displayStyle;
        return (
            <div className="popup-area order-cancel-popup" style={{ display: displayStyle }}>
                <div className="wrapper">
                    <div className="title-area text-capitalize">
                        <h1 className="text-center">CONFIRM CANCEL</h1>
                    </div>
                    <div className="content-area text-center">
                        <p>The booking slot will be cancelled</p>
                    </div>
                    <div className="btn-area text-center">
                        <input data-key data-id type="button" defaultValue="Cancel" className="my-btn btn-saffron refunded-cancel" />
                        <input data-key data-id type="button" onClick={(e) => this.onSaveCancel(e)} defaultValue="Okay" className="my-btn btn-saffron refunded-okay" />
                        <div className="clearfix" />
                    </div>
                </div>
            </div>
        );
    

    }
}

module.exports = ModalConfirmCancel;