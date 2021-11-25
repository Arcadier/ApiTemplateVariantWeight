'use strict';
const React = require('react');
const PermissionTooltip = require('../../../../../common/permission-tooltip');

class CheckoutDetailsComponent extends React.Component {

    componentDidMount() {
        let self = this;
        //Jquery from Bootstrap
        $(".openModalRemove").on("click", function () {
            if (!self.props.pagePermissions.isAuthorizedToDelete) return;
            var $parent = $(this).parents(".parent-r-b");
            self.props.validatePermissionToPerformAction('delete-consumer-checkout-api', () => {
                $parent.addClass("modal-delete-open");
                $("#modalRemove").modal("show");
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
    
    showDeliveryModal() {
        const self = this;
        if (!this.props.pagePermissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-checkout-api', () => {
            self.props.clearAddAddressModal();
            $("#addDeliveryAddress .required").removeClass('error-con');
            $('#addDeliveryAddress').modal('show');
        });
    }

    setAddressToDelete(addressID) {
        const self = this;
        if (!this.props.pagePermissions.isAuthorizedToDelete) return;
        this.props.validatePermissionToPerformAction('delete-consumer-checkout-api', () => {
            self.props.addressToDelete(addressID);
        });
    }

    renderUserAddresses(isBillingAddress) {
        let self = this;
        const addresses = isBillingAddress ? this.props.buyerBillingAddresses : this.props.buyerAddresses;
        let ele = '';
        const { isAuthorizedToDelete } = this.props.pagePermissions;
        if (addresses != null) {
            ele = addresses.map(function (address, index) {
                let classNameToUse = "onboarder-address";
                if (address.Selected) {
                    classNameToUse = "onboarder-address active";
                }
                if (address.Line2 != null) {
                    address.Line1 = address.Line1 + " " + address.Line2;
                }
                if (index == 0) {
                    return (
                        <li key={index}>
                            <a onClick={() => self.props.updateSelectedAddress(address.ID, isBillingAddress)}
                                className={classNameToUse} href="#">
                                {address.Name + ", " + address.Line1 + ", " + address.Country + ", " + address.City + ", " + address.State + ", " + address.PostCode}
                            </a>
                        </li>
                    );
                } else {
                    return (
                        <li key={index}>
                            <a onClick={() => self.props.updateSelectedAddress(address.ID, isBillingAddress)}
                                className={classNameToUse} href="#">
                                {address.Name + ", " + address.Line1 + ", " + address.Country + ", " + address.City + ", " + address.State + ", " + address.PostCode}
                                <span 
                                    id={address.ID}
                                    className={`icon-delete openModalRemove ${isAuthorizedToDelete? '' : 'icon-grey'}`}
                                    data-toggle={isAuthorizedToDelete ? '' : "tooltip"}
                                    data-placement="left"
                                    data-original-title="You need permission to perform this action">
                                        <i onClick={(e) => self.setAddressToDelete(address.ID)} className="fa fa-trash" />
                                </span>
                            </a>
                        </li>
                    );
                }
            });

            return ele;
        } else {
            return (
                <li><span key="9999" className="active">Firstname Lastname, Address, Country, City, State, Postcode</span></li>
            );
        }
    }

    onDeliveryLockClick(e) {
        if ($("#delivery-lock").prop("checked") == true) {
            $(".uncheck-listner  .btn-add-address").off("click");
            $(".uncheck-listner  .btn-add-address").css("color", "#999");
        } else if ($("#delivery-lock").prop("checked") == false) {
            $(".uncheck-listner  .btn-add-address").on("click");
            $(".uncheck-listner  .btn-add-address").css("color", "#3c7d99");
        }
        this.props.updateIsSameBilingAndDelivery(e.target.checked)
        const selectedAddress = this.props.buyerBillingAddresses.find(b => b.Selected == true);
        this.props.updateSelectedAddress(selectedAddress.ID, false);
    }

    render() {
        let self = this;
        let selectedAddress = "Firstname Lastname, Address, Country, City, State, Postcode";
        let selectedBillingAddress = "Firstname Lastname, Address, Country, City, State, Postcode";
        const isSameAsBilling = this.props.isSameBillingAndDelivery || false;

        if (this.props.buyerAddresses) {
            this.props.buyerAddresses.forEach(function (address) {
                if (address.Selected === true) {
                    selectedAddress = address.Name + ", " + address.Line1 + ", " + address.Country + ", " + address.City + ", " + address.State + ", " + address.PostCode;
                }
            });
        }
        if (this.props.buyerBillingAddresses) {
            this.props.buyerBillingAddresses.forEach(function (address) {
                if (address.Selected === true) {
                    selectedBillingAddress = address.Name + ", " + address.Line1 + ", " + address.Country + ", " + address.City + ", " + address.State + ", " + address.PostCode;
                }
            });
        }

        let signIn = "hide"
        let firstName = "";
        let lastName = "";
        let contactNumber = "";
        let emailAddress = "";


        if (this.props.isGuest) {
            signIn = "";
        } else if (this.props.user) {
            firstName = this.props.user.FirstName;
            lastName = this.props.user.LastName;
            contactNumber = this.props.user.PhoneNumber;
            emailAddress = this.props.user.Email;
        }
        const { isAuthorizedToAdd } = this.props.pagePermissions;
        return (
            <div className="panel-box active">
                <div className="sc-upper panel-box-title">
                    <div className="sc-u sc-u-mid full-width">
                        <div className={"sc-upper clearfix mb-30 " + signIn}>
                            <div className="pcc-left pull-left pdc-inputs left-requisition d-flex">
                                <p><b>Already Registered with us?</b></p>
                                <a href="#" className="bl_btn">sign in now</a>
                            </div>
                        </div>
                        <div className="bl_dark">
                            <span className="sc-text-big">Details <i className="tog-icon angle1" /></span>
                        </div>
                    </div>
                </div>
                <div className="panel-box-content clearfix">
                    <div className="pcc-left pull-left pdc-inputs left-requisition">
                        <div className="delivery-address-subtitle pull-left">Contact Details</div>
                        <div className="field-wrapper delivery-controller fields-contact">
                            <div className="input-container">
                                <span className="title">First Name</span>
                                <input type="text" className="input-text required" name="first_name" value={firstName} onChange={(e) => self.props.onTextChangeUser(e.target.value, "FirstName")} />
                            </div>
                            <div className="input-container">
                                <span className="title">Last Name</span>
                                <input type="text" className="input-text required" name="last_name" value={lastName} onChange={(e) => self.props.onTextChangeUser(e.target.value, "LastName")} />
                            </div>
                            <div className="input-container">
                                <span className="title">Contact No.</span>
                                <input type="text" className="numbersOnly input-text required" name="contact_number" value={contactNumber} onChange={(e) => self.props.onTextChangeUser(e.target.value, "PhoneNumber")} />
                            </div>
                            <div className="input-container">
                                <span className="title">Email</span>
                                <input type="email" className="input-text required" name="email_address" value={emailAddress} onChange={(e) => self.props.onTextChangeUser(e.target.value, "Email")} />
                            </div>
                        </div>
                        <div className="input-container address-container">
                            <div className="delivery-address-subtitle">Billing Address</div>
                            <div className="flex-address-con">
                                <div className="dropdown address-select select-billing-address">
                                    <button className="btn btn-default dropdown-toggle" type="button" id="report-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                        <span className="selected-display">{selectedBillingAddress}</span>
                                        <i className="fa fa-angle-down" />
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="report-menu">
                                        {this.renderUserAddresses(true)}
                                    </ul>
                                </div>
                                <PermissionTooltip isAuthorized={isAuthorizedToAdd} extraClassOnUnauthorized="icon-grey">
                                    <a className="top-title btn-add-address" onClick={(e) => this.showDeliveryModal()} data-toggle="modal" data-target="#editProject" href="#"><i className="fas fa-plus fa-fw" /> Add new address</a>
                                </PermissionTooltip>
                            </div>
                        </div>
                        <div className="delivery-address-subtitle pull-left">Delivery Address</div>
                        <div className="uncheck-listner ">
                            <div className="fancy-checkbox">
                                <input type="checkbox" id="delivery-lock" checked={isSameAsBilling} onChange={(e) => this.onDeliveryLockClick(e)} /><label htmlFor="delivery-lock"><span>Delivery address same as billing</span></label>
                            </div>
                            <div className="input-container address-container">
                                <span className="title">Address</span>
                                <div className="flex-address-con">
                                    <div className="dropdown address-select select-delivery-address">
                                        <button className="btn btn-default dropdown-toggle" type="button" id="report-menu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" disabled={isSameAsBilling ? true : false}>
                                            <span className="selected-display">{selectedAddress}</span>
                                            <i className="fa fa-angle-down" />
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="report-menu1">
                                            {this.renderUserAddresses()}
                                        </ul>
                                    </div>
                                    <PermissionTooltip isAuthorized={isAuthorizedToAdd} extraClassOnUnauthorized="icon-grey">
                                        <a className="top-title btn-add-address" onClick={(e) => isSameAsBilling ? null : this.showDeliveryModal()} data-toggle="modal" data-target="#editProject" href="#"><i className="fas fa-plus fa-fw" /> Add new address</a>
                                    </PermissionTooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = CheckoutDetailsComponent;