'use strict';
const React = require('react');
const BaseComponent = require('../../../../../shared/base');
const HeaderLayout = require('../../../../../layouts/header').HeaderLayoutComponent;
const FooterLayout = require('../../../../../layouts/footer').FooterLayoutComponent;
const CommonModule = require('../../../../../../public/js/common');
const OrderTotalComponent = require('./order-total');
const DetailsComponent = require('./details');
const ReviewComponent = require('./review');
const CreateRequisitionComponent = require('./create-requisition');
const EnumCoreModule = require('../../../../../../../src/public/js/enum-core.js');
const Toastr = require('toastr');

class OnePageCheckoutMainComponent extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            isProcessing: false
        };
    }

    componentDidUpdate() {
        const self = this;
        if (self.props.orderSelectedDelivery && self.props.orderDetails) {
            const order = self.props.orderDetails;
            self.props.orderSelectedDelivery.forEach(function (delivery, i) {
                if (delivery[order.ID] && delivery[order.ID].OrderID === order.ID) {
                    self.props.calculateCost(delivery[order.ID], order.ID);
                }
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
    }

    updateUser() {
        const self = this;
        self.props.updateUserInfo(this.props.user);
        self.props.updateCheckoutSelectedDeliveryAddress(order.ID, addressID);
    }

    proceedCheckout() {
        const self = this;
        if (this.state.isProcessing) { return; }
        
        if (!this.props.pagePermissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-checkout-api', () => {
            const hasEmptyDetails = CommonModule.validateFields('.fields-contact input.required');
            const hasEmptyShipping = CommonModule.validateFields('.select_shipping select');
            const hasEmptyRequisition = CommonModule.validateFields('.requisition-sources select');

            $('.select-delivery-address').removeClass("error-con");
            $('.select-billing-address').removeClass("error-con");

            const selectedAddress = self.props.buyerAddresses.filter(r => r.Selected);
            const hasEmptySelectedAddress = selectedAddress.length < 1 && !self.props.isSameBillingAndDelivery;
            if (hasEmptySelectedAddress) {
                $('.select-delivery-address').addClass("error-con");
            }
            const selectedBillingAddress = self.props.buyerBillingAddresses.filter(r => r.Selected);
            if (selectedBillingAddress.length < 1) {
                $('.select-billing-address').addClass("error-con");
            }
            
            if (hasEmptyDetails || hasEmptyShipping || hasEmptyRequisition || hasEmptySelectedAddress || selectedBillingAddress.length < 1) {
                Toastr.error('Please fill out the required fields to proceed.', 'Oops! Something went wrong.');
                return;
            }

            let departmentId = null;
            let workflowId = null;
            if (self.props.showCreateRequisition) {
                const hasNoWorkflowForOrderTotal = self.requisition.hasNoWorkflowForOrderTotal();
                if (hasNoWorkflowForOrderTotal) {
                    return;
                }
                departmentId = self.requisition.getSelectedDepartmentID();
                workflowId = self.requisition.getSelectedWorkflowID();
            }

            self.setState({ isProcessing: true });
        
            $('#btnProceedPayment').prop('disabled', true);
            $('#btnProceedPayment').addClass('disabled');

            self.props.postPayment(departmentId, workflowId);
        });
    }

    addAddressValidate() {
        let hasError = CommonModule.validateFields('#addDeliveryAddress .required');
        if (!hasError) { 
            this.props.createAddress();  
        }
    }

    renderCreateRequisition() {
        if (this.props.showCreateRequisition)
            return (
                <CreateRequisitionComponent {...this.props}
                    ref={(ref) => this.requisition = ref} />);

        return;
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
                            <div className="tab-container tabcontent " id="delivery-container" style={{ marginBottom: '0px'}}>
                                <OrderTotalComponent {...this.props}
                                    handleProceedButton={(e) => this.proceedCheckout()} />
                                <DetailsComponent {...this.props} />
                            </div>
                            <ReviewComponent {...this.props} />
                            {this.renderCreateRequisition()}
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
                                <button type="button" className="close" data-dismiss="modal" onClick={() => this.clearAddDelivery()}>x</button>
                                <h4 className="modal-title">Address</h4>
                            </div>
                            <div className="modal-body">
                                <div className="pdc-inputs">
                                    <div className="input-container ic-left">
                                        <span className="title">Addressee First Name</span>
                                        <input type="text" className="input-text get-text required" name="addresee_first_name" placeholder="First Name" data-react-state-name="CRUD_FirstName" value={FirstName} onChange={(e) => self.props.onTextChangeAddAddress(e.target.value, "FirstName")} />
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
                                <div className="btn-green" id="btnAddDelivery" onClick={(e) => self.addAddressValidate(e)}>Add</div>
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