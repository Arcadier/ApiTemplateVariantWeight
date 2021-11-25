'use strict';
let React = require('react');
let ReactRedux = require('react-redux');
let BaseClassComponent = require('../../shared/base.jsx');

let HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
let FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;

let addressActions = require('../../../redux/addressActions');
let userActions = require('../../../redux/userActions');
let orderActions = require('../../../redux/orderActions');
let checkoutReviewActions = require('../../../redux/checkoutReviewAction');
let EnumCoreModule = require('../../../../src/public/js/enum-core.js');
let CommonModule = require('../../../../src/public/js/common.js');

let HeadComponentTemplate = require('../../extensions/' + process.env.TEMPLATE + '/checkout/delivery/main');
let AddressBoxComponent = require('../../extensions/' + process.env.TEMPLATE + '/checkout/delivery/address-box');

class CheckoutDeliveryComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        this.state = {
            Email: this.props.user.Email,
            CRUD_FirstName: this.props.user.FirstName,
            CRUD_LastName: this.props.user.LastName,
            processing: false
        };
        this.doUpdateUserInfo = this.doUpdateUserInfo.bind(this);
        this.showDeleteAddress = this.showDeleteAddress.bind(this);
        this.setDeliveryAddress = this.setDeliveryAddress.bind(this);
    }

    componentDidMount() {
        $('body').on('click', ".pdcb-address-box:not(.btn-add-adress)", function () {
            $(".pdcb-address-box").removeClass("selected");
            $(this).addClass("selected");
        });
        
        if (window.sessionStorage.getItem("browserBackNavigate")) {
            window.sessionStorage.removeItem("browserBackNavigate");
            window.location.reload(true); // force refresh page1
        }
        
    }

    onChange(event) {

        super.onChange(event);
        const target = event.target;
        const reactStateName = target.getAttribute('data-react-state-name');

        let self = this;
        let userInfoModel = {[reactStateName]: event.target.value};
        //For Guest OnChange Event
        if (self.props.user && self.props.user.Guest !== undefined) {
            let guestUserID = CommonModule.getCookie("guestUserID");
            userInfoModel = {
                [reactStateName]: event.target.value,
                guestUserID : guestUserID
            }
            
        } 

        self.props.updateUserInfo(userInfoModel);
       
    }

    onChangeSetStateCallBack(props) {
        super.onChangeSetStateCallBack();
    }

    doUpdateUserInfo() {
        var self = this;
        self.validateFields();
        if (CommonModule.validateEmail(this.state.Email) == false) {
            self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_EMAILS);
            return;
        }
        if (self.state.processing === false) {
            self.setState({
                processing: true
            }, function () { });

            self.props.updateUserInfo(self.props.user);
            //Dont proceed to rediction
            if ($('.selected').length < 1) {
                self.showMessage(EnumCoreModule.GetToastStr().Error.PLEASE_SELECT_A_DELIVERY_ADDRESS_TO_PROCEED);
            } else {
                if (self.props.comparisonId) {
                    self.props.checkItemComparisonDetail(function (errorMessage) {
                        if (errorMessage) {
                            self.showMessage(errorMessage);
                        } else {
                            window.location = "/checkout/review?invoiceNo=" + self.props.invoiceDetails.InvoiceNo + "&comparisonId=" + self.props.comparisonId;
                        }
                    });
                } else {
                    //Bespoke
                    window.location = "/checkout/review?invoiceNo=" + self.props.invoiceDetails.InvoiceNo;
                } 
            }

            self.setState({
                processing: false
            });
        }
    }

    doAddressDelete(e) {
        var self = this;
        self.props.deleteAddress(self.state.selectedAddressToDelete);
        $('#modalRemove').modal('hide');
    }

    showDeliveryModal() {
        $('#addDeliveryAddress').modal('show');
    }

    validateFields() {
        $(".required").each(function () {
            var $this = $(this);
            if ($this.val() == "") {
                $this.addClass("error-con");
            } else {
                $this.removeClass("error-con");
            }
        });
    }

    showDeleteAddress(id) {

        $('#modalRemove').modal('show');

        this.setState({
            selectedAddressToDelete: id
        }, function () { });
    }

    setDeliveryAddress(addressID) {
        var self = this;
        if (this.props.invoiceDetails.Orders && this.props.invoiceDetails.Orders.length > 0) {
            if (this.props.invoiceDetails.Orders) {
                this.props.invoiceDetails.Orders.forEach(function (order) {
                    self.props.updateCheckoutSelectedDeliveryAddress(order.ID, addressID);
                });
            }
           
        }
    }

    showAddressList() {
        function showFirst(name) {

            if (name == null)
                return '';

            if (name.indexOf('|') > 0) {
                return name.split('|')[0];
            }
            return name;
        }

        function showSecond(name) {
            if (name == null)
                return '';

            if (name.indexOf('|') > 0) {
                return name.split('|')[1];
            }
            return '';
        }

        var self = this;
        if (this.props.addresses && this.props.addresses.length > 0) {
            return (
                this.props.addresses.map(function (address, index) {
                    //Dont Show Addresses from Pickup Delivery 2.0
                    if (address.Pickup === true || address.Pickup == null) {
                        return '';
                    }
                    return (
                        <AddressBoxComponent key={address.ID} index={index} address={address} setDeliveryAddress={self.setDeliveryAddress} showDeleteAddress={self.showDeleteAddress} showFirst={showFirst} showSecond={showSecond} />
                    )
                })
            );
        } else return '';
    }

    addAddress(e) {

        var self = this;
        var $this = $(e.target);
        var $parent = $this.parents(".modal");
        self.validateFields();
        if (!$parent.find(".error-con").length) {
            var newAddress = Object.assign({}, self.state, {
                "Name": self.state['CRUD_FirstName'] + ' ' + self.state['CRUD_LastName'],
                Pickup: false
            });

            

            if (self.props.user && self.props.user.Guest !== undefined) {
                let guestUserID = CommonModule.getCookie("guestUserID");
                newAddress.guestUserID = guestUserID                
            }

            self.props.createAddress(newAddress, function () {
                
                self.clearAddDelivery();
            });
            
        }
    }

    clearAddDelivery(e) {
        this.setState({
            Line1: '',
            CountryCode: '',
            City: '',
            State: '',
            PostCode: '',
            CRUD_FirstName: this.props.user.FirstName,
            CRUD_LastName: this.props.user.LastName,
        }, function () {
            $("#addDeliveryAddress").modal("hide");
        });
    }

    GuestGoToLogin() {
        
        if (this.props.user && this.props.user.Guest && this.props.user.Guest === true) 
        {
            return (
                <div className="pd-container">
                    <div className="registered_user_note">
                        <div className="row">
                            <div className="col-md-8 col-sm-12">
                                <p>Already Registered with us?</p>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <a href="/accounts/non-private/sign-in?merge=true" className="pull-right btn-dark">SIGN IN NOW</a>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } 
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div id="settings-index-container">
                    <div className="header" id="header-section">
                        <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                    </div>

                    <div className="main" style={{ paddingTop: '120px' }}>
                        <div className="delivery-container">
                            <div className="container">
                                <HeadComponentTemplate/>
                                {this.GuestGoToLogin()}
                                <div className="pd-container">
                                    <div className="pdc-inputs">
                                        <div className="input-container">
                                            <span className="title">First Name</span>
                                            <input type="text" className="input-text required " name="first_name" onChange={(e) => self.onChange(e)} defaultValue={this.props.user.FirstName}  data-react-state-name="FirstName"/>
                                        </div>
                                        <div className="input-container">
                                            <span className="title">Last Name</span>
                                            <input type="text" className="input-text required " name="last_name" onChange={(e) => self.onChange(e)} defaultValue={this.props.user.LastName}  data-react-state-name="LastName"/>
                                        </div>
                                        <div className="input-container">
                                            <span className="title">Contact No.</span>
                                            <input type="number" className="numbersOnly input-text required " name="contact_number" onChange={(e) => self.onChange(e)} defaultValue={this.props.user.PhoneNumber} data-react-state-name="PhoneNumber"/>
                                        </div>
                                        <div className="input-container">
                                            <span className="title">Email</span>
                                            <input type="email" className="input-text required " name="email_address" onChange={(e) => self.onChange(e)} defaultValue={this.props.user.Email} data-react-state-name="Email"/>
                                        </div>
                                    </div>
                                    <div className="pdc-boxs">
                                        {self.showAddressList()}
                                        <div className="pdcb-address-box btn-add-adress" id="btnAddDeliveryAddress" onClick={(e) => self.showDeliveryModal()} style={{ height: '204px;' }}>
                                            <span className="icon-address">
                                                <img src="/assets/images/add_address.svg" />
                                            </span>
                                            <span>Add Delivery Address</span>
                                        </div>
                                    </div>
                                    <div className="pd-button">
                                        <div className="btn-next">
                                            <a className="btn-validate-delivery" data-redirect="review.html" onClick={(e) => self.doUpdateUserInfo()}>Next</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                <button type="button" className="close" data-dismiss="modal">×</button>
                                <h4 className="modal-title">Delivery Address</h4>
                            </div>
                            <div className="modal-body">
                                <div className="pdc-inputs">
                                    <div className="input-container ic-left">
                                        <span className="title">Addressee First Name</span>
                                        <input type="text" className="input-text get-text required" name="addresee_first_name" placeholder="First Name" data-react-state-name="CRUD_FirstName" value={this.state.CRUD_FirstName} onChange={(e) => self.onChange(e)} />
                                    </div>
                                    <div className="input-container">
                                        <span className="title">Addressee Last Name</span>
                                        <input type="text" className="input-text get-text required" name="addresee_last_name" placeholder="Last Name" data-react-state-name="CRUD_LastName" value={this.state.CRUD_LastName} onChange={(e) => self.onChange(e)} />
                                    </div>
                                    <div className="input-container full-width">
                                        <span className="title">Address</span>
                                        <input type="text" className="input-text get-text required" name="adress" data-react-state-name="Line1" value={this.state.Line1} onChange={(e) => self.onChange(e)} />
                                    </div>
                                    <div className="input-container ic-left">
                                        <span className="title">Country</span>
                                        <span className="select-option">
                                            <select name="country" className="get-text required" data-react-state-name="CountryCode" value={this.state.CountryCode} onChange={(e) => self.onChange(e)} >
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
                                        <input type="text" className="input-text get-text required" name="City" data-react-state-name="City" value={this.state.City} onChange={(e) => self.onChange(e)} />
                                    </div>
                                    <div className="input-container ic-left">
                                        <span className="title">State</span>
                                        <input type="text" className="input-text get-text" name="state" data-react-state-name="State" value={this.state.State} onChange={(e) => self.onChange(e)} />
                                    </div>
                                    <div className="input-container">
                                        <span className="title">Postal Code</span>
                                        <input type="text" className="input-text get-text required" name="postal_code" data-react-state-name="PostCode" value={this.state.PostCode} onChange={(e)=>self.onChange(e)} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal" onClick={(e)=> self.clearAddDelivery(e)}>Cancel</div>
                                <div className="btn-green" id="btnAddDelivery" onClick={(e) => self.addAddress(e)}>Add</div>
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
                                <div className="btn-green" id="btnRemove" onClick={(e) => self.doAddressDelete(e)}>Okay</div>
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
        addresses: state.settingsReducer.addresses,
        invoiceDetails: state.settingsReducer.invoiceDetails,
        comparisonId: state.settingsReducer.comparisonId
    };
}

function mapDispatchToProps(dispatch) {
    return {
        createAddress: (body,callback) => dispatch(addressActions.createAddress(body,callback)),
        deleteAddress: (addressId) => dispatch(addressActions.deleteAddress(addressId)),
        updateUserInfo: (userInfo) => dispatch(userActions.updateUserInfo(userInfo)),
        updateCheckoutSelectedDeliveryAddress: (orderID, addressID) => dispatch(orderActions.updateCheckoutSelectedDeliveryAddress(orderID, addressID)),
        checkItemComparisonDetail: (callback) => dispatch(checkoutReviewActions.checkItemComparisonDetail(callback))
    };
}

const CheckoutDeliveryReduxConnect = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(CheckoutDeliveryComponent);

module.exports = {
    CheckoutDeliveryReduxConnect,
    CheckoutDeliveryComponent
};