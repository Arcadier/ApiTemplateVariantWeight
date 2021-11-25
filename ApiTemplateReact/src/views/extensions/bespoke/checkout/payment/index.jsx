'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');
const ProcessBarComponent = require('../shared/process-bar');
const OrderSummaryComponent = require('../shared/order-summary');
const CheckoutActions = require('../../../../../redux/checkoutReviewAction');
const EnumCoreModule = require('../../../../../public/js/enum-core');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class CheckoutPaymentTemplateComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            stripeHandler: null,
            stripeIsTokenUsed: false,
            isProcessing: false
        };
    }

    getSelectedPaymentMethod() {
        let selected = this.props.paymentMethods.find(p => p.isSelected);

        if (selected) {
            return selected;
        }

        return '';
    }

    postPayment() {
        const self = this;
        if (this.state.isProcessing) { return; }

        this.setState({ isProcessing: true });

        const selectedPaymentMethod = this.getSelectedPaymentMethod();
        const invoiceDetails = this.props.invoiceDetails;

        $('#btnProceedPayment').prop('disabled', true);
        $('#btnProceedPayment').addClass('disabled');

        if (selectedPaymentMethod.code.startsWith('stripe')) {
            const is3dsEnabled = selectedPaymentMethod.configs.is3dsEnabled;

            if (is3dsEnabled == 'true') {
                if (invoiceDetails.Orders.length > 1) {
                    this.showMessage(EnumCoreModule.GetToastStr().Error.CHECKOUT_PAYMENT_DO_NOT_SUPPORT_MULTIPLE_ORDERS);
                    return;
                }

                this.props.generateStripeSessionId((data) => {
                    var stripe = Stripe(selectedPaymentMethod.configs.publicKey, { stripeAccount: data.account });
                    stripe.redirectToCheckout({
                        sessionId: data.sessionId
                    }).then((result) => {
                        toastr.error(result.error.message);
                    });
                });
            } else {
                this.state.stripeHandler.open(selectedPaymentMethod.configs);
            }
        }
        else if (selectedPaymentMethod.code.startsWith('paypal')) {
            this.props.postPayment(selectedPaymentMethod.configs);
        }
        else if (selectedPaymentMethod.code.startsWith('omise')) {
            let amount = invoiceDetails.Total;
            if (!EnumCoreModule.GetOmiseCurrenciesNoMinors().includes(invoiceDetails.CurrencyCode)) {
                amount = parseInt(invoiceDetails.Total * 100);
            }
            OmiseCard.open({
                amount: amount,
                currency: invoiceDetails.CurrencyCode,
                buttonLabel: 'Pay Now',
                submitLabel: 'Pay Now',
                onFormClosed: () => {
                    $('#btnProceedPayment').prop('disabled', false);
                    $('#btnProceedPayment').removeClass('disabled');
                    self.setState({ isProcessing: false });
                },
                onCreateTokenSuccess: (nonce) => {
                    if (nonce.startsWith('tokn_')) {
                        self.props.postPayment(null, JSON.stringify({ token: nonce }));
                    }
                }
            });
        } else {
            this.props.postPayment();
        }
    }

    componentDidMount() {
        const self = this;
        const stripe = this.props.paymentMethods.find(p => p.code.startsWith('stripe'));
        const omise = this.props.paymentMethods.find(p => p.code.startsWith('omise'));

        if (stripe) {
            if (stripe.configs) {
                const configs = stripe.configs;
                let script = document.createElement("script");
                script.async = true;

                if (configs.is3dsEnabled == 'true') {
                    script.src = "https://js.stripe.com/v3";
                    script.onload = () => {
                        let stripe = Stripe(configs.publicKey);
                    };
                } else {
                    script.src = "https://checkout.stripe.com/checkout.js";
                    script.onload = () => {
                        let handler = StripeCheckout.configure({
                            key: stripe.configs.publicKey,
                            closed: function () {
                                if (!self.state.stripeIsTokenUsed) {
                                    $('#btnProceedPayment').prop('disabled', false);
                                    $('#btnProceedPayment').removeClass('disabled');
                                    self.setState({ isProcessing: false });
                                }
                            },
                            token: function (token) {
                                self.setState({ stripeIsTokenUsed: true });
                                self.props.postPayment(JSON.stringify(token));
                            }
                        });

                        self.setState({ stripeHandler: handler });
                    };
                }

                document.body.appendChild(script);
            }
        }

        if (omise) {
            if (omise.configs) {
                const configs = omise.configs;
                let script = document.createElement("script");
                script.async = true;
                script.src = "https://cdn.omise.co/omise.js";
                script.onload = () => {
                    OmiseCard.configure({
                        publicKey: configs.publicKey
                    });
                };

                document.body.appendChild(script);
            }
        }
    }

    renderPaymentMethods() {
        return (
            <div className="pccl-payment-method">
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
    }

    render() {
        return (
            <div className="payment-container">
                <div className="container">
                    <ProcessBarComponent step={3} />
                    <div className="pc-content full-width">
                        <div className="pcc-left pull-left">
                            <span className="title">Payment Method</span>
                            {this.renderPaymentMethods()}
                            <span className="pccl-payment-text">Upon clicking the Pay button, you will be re-directed to the Payment Gateway to continue with your transaction.</span>
                        </div>
                        <OrderSummaryComponent
                            showEdit={false}
                            submitText={'Pay Now'}
                            invoiceDetails={this.props.invoiceDetails}
                            shippingOptions={this.props.shippingOptions}
                            pickupOptions={this.props.pickupOptions}
                            address={this.props.buyerAddress}
                            previous={'review'}
                            handleProceedButton={(e) => this.postPayment()} />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        buyerAddress: state.checkoutReducer.buyerAddress,
        invoiceDetails: state.checkoutReducer.invoiceDetails,
        paymentMethods: state.checkoutReducer.paymentMethods
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateSelectedPaymentMethod: (code) => dispatch(CheckoutActions.updateSelectedPaymentMethod(code)),
        generateStripeSessionId: (callback) => dispatch(CheckoutActions.generateStripeSessionId(callback)),
        postPayment: (stripe, omise) => dispatch(CheckoutActions.postPayment(stripe, omise))
    }
}

module.exports = {
    CheckoutPaymentTemplateComponent,
    mapStateToProps,
    mapDispatchToProps
}