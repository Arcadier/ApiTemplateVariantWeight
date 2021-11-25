'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const ProcessBarComponent = require('../payment/process-bar');
const PaymentMethodsComponent = require('../payment/payment-methods');
const OrderSummaryComponent = require('../payment/order-summary');
const EnumCoreModule = require('../../../public/js/enum-core');
const InvoiceActions = require('../../../redux/invoiceActions');

class InvoicePaymentComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            stripeHandler: null,
            isTokenGenerated: false,
            isProcessing: false
        };

        this.proceedPayment = this.proceedPayment.bind(this);
    }

    componentDidMount() {
        const self = this;

        const { paymentMethods } = this.props;

        const stripe = paymentMethods.find(p => p.code.startsWith('stripe'));
        const omise = paymentMethods.find(p => p.code.startsWith('omise'));

        if (stripe) {
            let script = document.createElement("script");
            script.async = true;

            if (stripe.is3dsEnabled) {
                script.src = "https://js.stripe.com/v3";
                script.onload = () => {
                    Stripe(stripe.publicKey);
                };
            } else {
                script.src = "https://checkout.stripe.com/checkout.js";
                script.onload = () => {
                    let handler = StripeCheckout.configure({
                        key: stripe.publicKey,
                        closed: function () {
                            if (!self.state.isTokenGenerated) {
                                self.setState({ isProcessing: false });
                            }
                        },
                        token: function (token) {
                            self.setState({ isTokenGenerated: true });

                            const options = {
                                gatewayCode: stripe.code,
                                stripe: JSON.stringify(token)
                            };

                            self.props.processPayment(options, (result) => {
                                const { error } = result;

                                if (!error) {
                                    self.redirectTransactionComplete();
                                } else {
                                    console.log(error);
                                }
                            });
                        }
                    });

                    self.setState({ stripeHandler: handler });
                };
            }

            document.body.appendChild(script);
        }

        if (omise) {
            let script = document.createElement("script");
            script.async = true;
            script.src = "https://cdn.omise.co/omise.js";
            script.onload = () => {
                OmiseCard.configure({
                    publicKey: omise.publicKey
                });
            };

            document.body.appendChild(script);
        }
    }

    proceedPayment() {
        const self = this;
        const { invoiceDetail } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        const paymentMethod = this.paymentMethodsComponent.getSelectedPaymentMethod();

        let options = {
            gatewayCode: paymentMethod.code
        };

        if (paymentMethod.code.startsWith('stripe')) {
            const is3dsEnabled = paymentMethod.is3dsEnabled;

            if (is3dsEnabled) {
                this.props.processPayment(options, (result) => {
                    const { sessionId, account, error } = result;

                    if (!error && sessionId && account) {
                        var stripe = Stripe(paymentMethod.publicKey, { stripeAccount: account });

                        stripe.redirectToCheckout({ sessionId: sessionId });
                    } else {
                        console.log(error);
                    }
                });
            } else {
                this.state.stripeHandler.open();
            }
        } else if (paymentMethod.code.startsWith('omise')) {
            let amount = invoiceDetail.Total;

            if (!EnumCoreModule.GetOmiseCurrenciesNoMinors().includes(invoiceDetail.CurrencyCode)) {
                amount = parseInt(invoiceDetail.Total * 100);
            }

            OmiseCard.open({
                amount: amount,
                currency: invoiceDetail.CurrencyCode,
                buttonLabel: 'Pay Now',
                submitLabel: 'Pay Now',
                onFormClosed: () => {
                    if (!self.state.isTokenGenerated) {
                        self.setState({ isProcessing: false });
                    }
                },
                onCreateTokenSuccess: (nonce) => {
                    self.setState({ isTokenGenerated: true });

                    if (nonce.startsWith('tokn_')) {
                        options = Object.assign(options, {
                            omise: JSON.stringify({
                                token: nonce
                            })
                        });

                        self.props.processPayment(options, (result) => {
                            const { error } = result;

                            if (!error) {
                                self.redirectTransactionComplete();
                            } else {
                                console.log(error);
                            }
                        });
                    }
                }
            });
        } else {
            self.props.processPayment(options, (result) => {
                const { error, url } = result;

                if (!error) {
                    if (url) {
                        window.location = url;
                    } else {
                        self.redirectTransactionComplete();
                    }
                } else {
                    console.log(error);
                }
            });
        }
    }

    redirectTransactionComplete() {
        const { invoiceDetail } = this.props;

        window.location = `/invoice/transaction-complete/${invoiceDetail.InvoiceNo}`;
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent user={this.props.user} />
                </div>
                <div className="main" style={{ paddingTop: '118px' }}>
                    <div className="payment-container">
                        <div className="container">
                            <ProcessBarComponent />
                            <div className="pc-content full-width">
                                <PaymentMethodsComponent
                                    ref={(ref) => this.paymentMethodsComponent = ref}
                                    paymentMethods={this.props.paymentMethods} />
                                <OrderSummaryComponent
                                    invoiceDetail={this.props.invoiceDetail}
                                    proceedPayment={this.proceedPayment}/>
                            </div>
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
    return {
        processPayment: (options, callback) => dispatch(InvoiceActions.processPayment(options, callback))
    };
}

const InvoicePaymentHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(InvoicePaymentComponent);

module.exports = {
    InvoicePaymentHome,
    InvoicePaymentComponent
};