'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class InvoicePaymentMethodsComponent extends BaseComponent {
    getSelectedPaymentMethod() {
        const { paymentMethods } = this.props;
        const code = $('.pccl-payment-method select').val();

        return paymentMethods.find(p => p.code == code);
    }

    render() {
        return (
            <div className="pcc-left pull-left">
                <span className="title">Payment Method</span>
                <div className="pccl-payment-method">
                    <select>
                        {
                            this.props.paymentMethods.map((paymentMethod) => {
                                return (
                                    <option key={paymentMethod.code} value={paymentMethod.code}>{paymentMethod.gateway}</option>
                                )
                            })
                        }
                    </select>
                    <i className="fa fa-angle-down" />
                </div>
            </div>
        );
    }
}

module.exports = InvoicePaymentMethodsComponent;