'use strict';
var React = require('react');

class PayComponent extends React.Component {

    getSelectedPaymentMethod() {
        if (this.props.paymentMethods) {
            let selected = this.props.paymentMethods.find(p => p.isSelected);

            if (selected) {
                return selected;
            }
        }

        return '';
    }

    getGatewayString() {
        const selectedPaymentMethod = this.getSelectedPaymentMethod();
        if (selectedPaymentMethod !== '') {
            if (selectedPaymentMethod.gateway == 'Cash on delivery') return 'COD';
            return selectedPaymentMethod.gateway;
        }
        return 'payment gateway'
    }
  
    renderPaymentMethods() {
            return (
                <div className="pccl-payment-method max-w">
                    <select value={this.getSelectedPaymentMethod().code} onChange={(e) => this.props.updateSelectedPaymentMethod(e.target.value)}>
                        {
                            this.props.paymentMethods.map(function (paymentMethod, index) {
                                return (
                                    <option key={index} value={paymentMethod.code}>{paymentMethod.gateway}</option>
                                )
                            })
                        }
                    </select>
                    <i className="fa fa-angle-down" />
                </div>
            )
            return "";
    }

    render() {
        return (
            <div className="pc-content full-width requisition-information tab-container tabcontent" id="requisition-container">
                <div className="panel-box">
                    <div className="sc-upper panel-box-title">
                        <div className="sc-u sc-u-mid full-width">
                            <div className="bl_dark light">
                                <span className="sc-text-big">Pay <i className="tog-icon angle2" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="panel-box-content clearfix" style={{ display: 'none' }}>
                        <div className="pcc-left pull-left pdc-inputs review">
                            <div className="flex-inline requisition-sources">
                                <div className="requisition-options">
                                    <span className="title">Payment Method</span>
                                    {this.renderPaymentMethods()}
                                </div>
                            </div>
                            <div className="flex-inline requisition-sources">
                                <div className="requisition-options">
                                    <div className="pccl-payment-method">
                                        Upon clicking the Pay button, You will be re-directed to the {this.getGatewayString()} page to continue with your transaction.
                                    </div>
                                </div>
                                <div className="requisition-options">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = PayComponent;