'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const CreadtCardPaymentComponent = require('./credit-card-payment');
const OfflinePaymentComponent = require('./offline-payment');
const EnumCoreModule = require('../../../public/js/enum-core');

class InvoiceTransactionCompleteComponent extends BaseComponent {
    isOfflinePayment() {
        const { paymentMethods } = this.props;

        if (paymentMethods) {
            const paymentMethod = paymentMethods[0];

            return !EnumCoreModule.GetNonCustomGatewayCodes().includes(paymentMethod.PaymentGateway.Code) && paymentMethod.PaymentGateway.Code.indexOf('-offline-payments-') >= 0
        }

        return false;
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent user={this.props.user} />
                </div>
                <div className="main" style={{ paddingTop: '117px' }}>
                    <div className="transaction-complete-container">
                        <div className="container">
                            {
                                this.isOfflinePayment() ?
                                    <OfflinePaymentComponent {...this.props} /> :
                                    <CreadtCardPaymentComponent {...this.props} />
                            }
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        invoiceDetail: state.invoiceReducer.invoiceDetail,
        paymentMethods: state.invoiceReducer.paymentMethods
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

const InvoiceTransactionCompleteHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(InvoiceTransactionCompleteComponent);

module.exports = {
    InvoiceTransactionCompleteHome,
    InvoiceTransactionCompleteComponent
};