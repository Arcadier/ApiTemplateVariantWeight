'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const toastr = require('toastr');
const BaseComponent = require('../../../../../shared/base');
const HeaderLayout = require('../../../../../layouts/header').HeaderLayoutComponent;
const FooterLayout = require('../../../../../layouts/footer').FooterLayoutComponent;
const CommonModule = require('../../../../../../public/js/common');
const OrderTotalComponent = require('./order-total');
const DetailsComponent = require('./details');
const ReviewComponent = require('./review');
const PayComponent = require('./pay');
let EnumCoreModule = require('../../../../../../../src/public/js/enum-core.js');
const PermissionTooltip = require('../../../../../common/permission-tooltip');

class OnePageCheckoutMainComponent extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            stripeHandler: null,
            stripeIsTokenUsed: false,
            isProcessing: false
        };
    }

    componentDidUpdate() {
        let self = this;
        if (self.props.orderSelectedDelivery && self.props.invoiceDetails.Orders) {

            self.props.invoiceDetails.Orders.forEach(function (order, i) {
                self.props.orderSelectedDelivery.forEach(function (delivery, i) {
                    if (delivery[order.ID] && delivery[order.ID].OrderID === order.ID) {
                        self.props.calculateCost(delivery[order.ID], order.ID);
                    }
                });
            });

            $("#modalRemove .btn-gray").on("click", function (e) {
                $(".parent-r-b").removeClass("modal-delete-open");

            });
            $("#modalRemove #btnRemove").on("click", function (e) {
                $("#modalRemove").modal("hide");
                $(".parent-r-b.modal-delete-open").remove();
            });

        }

    }

    clearAddDelivery() {
        $("#addDeliveryAddress").modal("hide");
    }

    getSelectedPaymentMethod() {
        if (this.props.paymentMethods) {
            let selected = this.props.paymentMethods.find(p => p.isSelected);

            if (selected) {
                return selected;
            }
        }

        return '';
    }

    componentDidMount() {
        $(".panel-box-title").click(function () {

            $(this).parents('.panel-box').toggleClass('active');

            $(this).parents('.panel-box').find('.panel-box-content').slideToggle();

            $(this).find(".bl_dark").removeClass("light");

            var $this = $(this);

            if ($(this).parents('.panel-box').hasClass('active')) {

                $(this).find('i').removeClass('angle2');

                $(this).find('i').addClass('angle1');

            } else {

                $(this).find('i').removeClass('angle1');

                $(this).find('i').addClass('angle2');

            }

        });
        //PAYMENT

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

    updateUser() {
        let self = this;
        self.props.updateUserInfo(this.props.user);
        self.props.updateCheckoutSelectedDeliveryAddress(order.ID, addressID);
    }

    postPayment() {
        const self = this;
        if (this.state.isProcessing) { return; }

        if (CommonModule.validateFields('.fields-contact input.required')) return;

        this.setState({ isProcessing: true });

        const selectedPaymentMethod = this.getSelectedPaymentMethod();
        const invoiceDetails = this.props.invoiceDetails;

        let addressID = "";
        if (this.props.addresses) {
            this.props.addresses.forEach(function (address) {
                if (address.Selected === true) {
                    addressID = address.ID;
                }
            });
        }

        if (this.props.orderSelectedDelivery && this.props.orderSelectedDelivery.length === 0) {
            toastr.error('Please try again later.', 'Oops! Something went wrong.');
            this.setState({ isProcessing: false });
            return;
        }

        if (selectedPaymentMethod.code.startsWith('stripe')) {
            const is3dsEnabled = selectedPaymentMethod.configs.is3dsEnabled;

            if (is3dsEnabled == 'true') {
                if (invoiceDetails.Orders.length > 1) {
                    this.showMessage(EnumCoreModule.GetToastStr().Error.CHECKOUT_PAYMENT_DO_NOT_SUPPORT_MULTIPLE_ORDERS);
                    return;
                }

                this.props.postPayment(null, null, false, () => {
                    self.props.createInvoiceCosmetic(() => {
                        self.props.generateStripeSessionId((data) => {
                            var stripe = Stripe(selectedPaymentMethod.configs.publicKey, { stripeAccount: data.account });
                            //return
                            stripe.redirectToCheckout({
                                sessionId: data.sessionId
                            }).then((result) => {
                                toastr.error(result.error.message);
                            });
                        });
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

    addAddressValidate() {
        this.props.validatePermissionToPerformAction("add-consumer-checkout-api", () => {
            let hasError = CommonModule.validateFields('#addDeliveryAddress .required');
            if (!hasError) {
                this.props.createAddress();
            }
        });
    }

    render() {
        let self = this;
        let FirstName = "";
        let LastName = "";
        let Address1 = "";
        let Address2 = "";
        let Country = "";
        let State = "";
        let City = "";
        let PostalCode = "";

        if (this.props && this.props.addressModelAdd) {
            FirstName = this.props.addressModelAdd.FirstName;
            LastName = this.props.addressModelAdd.LastName;
            Address1 = this.props.addressModelAdd.Address1;
            Address2 = this.props.addressModelAdd.Address2;
            Country = this.props.addressModelAdd.Country;
            State = this.props.addressModelAdd.State;
            City = this.props.addressModelAdd.City;
            PostalCode = this.props.addressModelAdd.PostalCode;
        }

        //validate invalid checkout
        if (self.props.invalidCheckout === true) {
            return (
                <React.Fragment>
                    <div className="header mod" id="header-section">
                        <HeaderLayout categories={this.props.categories} user={this.props.user} />
                    </div>
                    <div className="main">
                        <div className="error-pg-container">
                            <div className="container">
                                <a href="/cart" className="error-back"><i className="fa fa-angle-left" /> Back</a>
                                <div className="error-msg-txt">
                                    <div>Order is invalid</div>
                                    <div>Buyer, Merchant or item may be disabled, please check and try again.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main">
                    <div className="delivery-container">
                        <div className="container">
                            <div className="tab-container tabcontent " id="delivery-container">
                                <OrderTotalComponent {...this.props}
                                    handleProceedButton={(e) => this.postPayment()}/>
                                <DetailsComponent {...this.props} />
                            </div>
                            <ReviewComponent {...this.props} />
                            <PayComponent {...this.props} />
                        </div>
                    </div>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
                <div id="addDeliveryAddress" className="modal fade" role="dialog">
                    <div className="modal-dialog add-delivery-address">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">x</button>
                                <h4 className="modal-title">Address</h4>
                            </div>
                            <div className="modal-body">
                                <div className="pdc-inputs">
                                    <div className="input-container ic-left">
                                        <span className="title">Addressee First Name</span>
                                        <input type="text" className="input-text get-text required" name="addresee_first_name" placeholder="First Name" data-react-state-name="CRUD_FirstName" value={FirstName} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value,"FirstName")} />
                                    </div>
                                    <div className="input-container">
                                        <span className="title">Addressee Last Name</span>
                                        <input type="text" className="input-text get-text required" name="addresee_last_name" placeholder="Last Name" data-react-state-name="CRUD_LastName" value={LastName} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value, "LastName")} />
                                    </div>
                                    <div className="input-container full-width">
                                        <span className="title">Address</span>
                                        <input type="text" className="input-text get-text required" name="adress" data-react-state-name="Line1" value={Address1} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value, "Address1")} />
                                    </div>
                                    <div className="input-container ic-left">
                                        <span className="title">Country</span>
                                        <span className="select-option">
                                            <select name="country" className="get-text required" data-react-state-name="CountryCode" value={Country} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value, "Country")} >
                                                <option value="">Select your country</option>
                                                {

                                                    EnumCoreModule.GetCountries().map(function (country) {
                                                        return (
                                                            <option key={country.name} value={country.alpha2code}>{country.name}</option>
                                                        );
                                                    })
                                                }
                                            </select>
                                            <i className="fa fa-angle-down" />
                                        </span>
                                    </div>
                                    <div className="input-container">
                                        <span className="title">City</span>
                                        <input type="text" className="input-text get-text required" name="City" data-react-state-name="City" value={City} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value, "City")} />
                                    </div>
                                    <div className="input-container ic-left">
                                        <span className="title">State</span>
                                        <input type="text" className="input-text get-text" name="state" data-react-state-name="State" value={State} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value, "State")} />
                                    </div>
                                    <div className="input-container">
                                        <span className="title">Postal Code</span>
                                        <input type="text" className="input-text get-text" name="postal_code" data-react-state-name="PostCode" value={PostalCode} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value, "PostalCode")} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal" onClick={(e) => self.clearAddDelivery(e)}>Cancel</div>
                                <PermissionTooltip isAuthorized={self.props.permissions.isAuthorizedToAdd}>
                                    <div className="btn-green" id="btnAddDelivery" onClick={(e) => self.addAddressValidate(e)}>Add</div>
                                </PermissionTooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="modalRemove" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemove" onClick={(e) => self.props.deleteAddress(e)}>Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}


module.exports = OnePageCheckoutMainComponent;