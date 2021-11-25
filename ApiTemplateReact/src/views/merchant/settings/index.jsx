'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var ProfileSettingsComponent = require('../../user/settings/profile');
var PaymentComponent = require('../../user/settings/payment');
var AddressSettingsComponent = require('../../user/settings/address');

var HeaderLayoutComponent = require('../../layouts/header').HeaderLayoutComponent;
var FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;

var addressActions = require('../../../redux/addressActions');
var userActions = require('../../../redux/userActions');
var paymentAcceptanceActions = require('../../../redux/paymentAcceptanceActions');
var toastr = require('toastr');

const PaymentTermComponent = require('./payment-term');
const PaymentTermActions = require('../../../redux/paymentTermActions');

const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

class MerchantSettingsIndexComponent extends React.Component {
    componentDidMount() {
        let self = this
        const hasLocationCustomField = this.props.customFieldDefinition && this.props.customFieldDefinition.length >= 1 && (this.props.customFieldDefinition.filter(cf => cf.Name == 'user_seller_location').length >= 1);

        if (!hasLocationCustomField || hasLocationCustomField == null || typeof hasLocationCustomField == 'undefined') {

            this.props.createCustomFieldDefinition({
                'Name': 'user_seller_location',
                'DataInputType': 'textfield',
                'DataFieldType': 'string',
                'ReferenceTable': 'Users',
            });
        }

        let search = window.location.search;
        let params = new URLSearchParams(search);
        let error = params.get('error');

        if (error && error == 'incomplete-onboarding') {
            toastr.error("Please complete the onboarding.", "Oops! Something is wrong.");
        }

        $('#settings-tab a').on('click', function (e, isSkipClickEvent) {
            e.preventDefault();

            let currentActive = $("ul li.active a").attr('href');

            if (currentActive == '#Profile') {
                if (!isSkipClickEvent) {
                    $('.profile-next').trigger('click');
                    return !($('#Profile').find('.error-con').length > 0)
                }
            } else if (currentActive == '#Address') {

                $('#addAddress').trigger('click')

                return !(self.props.addresses.length < 1)
            } else if (currentActive == '#Payment') {
                let result = !$('.account-not-link .mandatory-payment').length

                if (result == false) {
                    $('.payment-next').trigger('click')
                }

                return result;
            }

            return true
        });

        $('#settings-tab a').on('show.bs.tab', function (e) {
            var target = $(e.target).attr("href");

            if (target == '#Address') {
                self.props.validatePermissionToPerformAction('view-merchant-addresses-api');
            } else if (target == '#Payment') {
                self.props.validatePermissionToPerformAction('view-merchant-payment-methods-api');
            } else if (target == '#Paymentterms') {
                self.props.validatePermissionToPerformAction('view-merchant-payment-terms-api');
            }
        });
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div id="settings-index-container">
                    <div className="header mod" id="header-section">
                        <HeaderLayoutComponent categories={this.props.categories} user={this.props.currentUser} />
                    </div>
                    <div className="main">
                        <div className="settings-container">
                            <div className="container">
                                <div className="h-parent-child-txt full-width">
                                    <p><a href="/">Home</a></p>
                                    <i className="fa fa-angle-right"></i>
                                    <p className="active">User Settings</p>
                                </div>
                                <div className="settings-content">
                                    <div className="setting-top"> <span className="h-text">User Settings</span>
                                        <div className="setting-tab">
                                            <ul className="nav nav-pills" id='settings-tab'>
                                                <li className="active"><a data-toggle="tab" href="#Profile">Profile</a></li>
                                                <li><a data-toggle="tab" href="#Address">Address</a></li>
                                                <li><a data-toggle="tab" href="#Payment">Payment</a></li>
                                                <li><a data-toggle="tab" href="#Paymentterms">Payment Term</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="setting-bot">
                                        <div className="tab-content">
                                            <ProfileSettingsComponent
                                                componentType={'merchant'}
                                                pagePermissions={this.props.pagePermissions.profilePagePermissions}
                                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                                customFieldDefinition={this.props.customFieldDefinition}
                                                user={this.props.user}
                                                userLogins={this.props.userLogins}
                                                updateUserInfo={this.props.updateUserInfo}
                                                getLocations={this.props.getLocations}
                                                createCustomFieldDefinition={this.props.createCustomFieldDefinition} />
                                            <AddressSettingsComponent
                                                componentType={'merchant'}
                                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                                addressPermissions={this.props.pagePermissions.addressPagePermissions}
                                                deleteAddress={this.props.deleteAddress}
                                                addresses={this.props.addresses}
                                                user={this.props.user}
                                                createAddress={this.props.createAddress}
                                                updateUserToOnboard={this.props.updateUserToOnboard} />
                                            <PaymentComponent paymentGateways={self.props.paymentGateways}
                                                user={this.props.user}
                                                pagePermissions={this.props.pagePermissions.paymentMethodPagePermissions}
                                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                                paymentAcceptanceMethod={self.props.paymentAcceptanceMethod}
                                                createPaymentAcceptanceMethodAsync={self.props.createPaymentAcceptanceMethodAsync}
                                                getPaymentAcceptanceMethods={self.props.getPaymentAcceptanceMethods}
                                                paypalLoginUrl={self.props.paypalLoginUrl}
                                                stripeLoginUrl={self.props.stripeLoginUrl}
                                                saveOmiseAccount={self.props.saveOmiseAccount}/>
                                            <PaymentTermComponent user={this.props.user}
                                                pagePermissions={this.props.pagePermissions.paymentTermPagePermissions}
                                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                                paymentTerms={this.props.paymentTerms}
                                                addPaymentTerm={this.props.addPaymentTerm}
                                                deletePaymentTerm={this.props.deletePaymentTerm}
                                                updatePaymentTerm={this.props.updatePaymentTerm}
                                                savePaymentTerms={this.props.savePaymentTerms}
                                                updateUserToOnboard={this.props.updateUserToOnboard} />
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
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        pagePermissions: state.userReducer.pagePermissions,
        currentUser: state.currentUserReducer.user,
        addresses: state.settingsReducer.addresses,
        userLogins: state.settingsReducer.userLogins,
        customFieldDefinition: state.settingsReducer.customFieldDefinition,
        paymentGateways: state.settingsReducer.paymentGateways,
        paymentAcceptanceMethod: state.settingsReducer.paymentAcceptanceMethod,
        paypalLoginUrl: state.settingsReducer.paypalLoginUrl,
        stripeLoginUrl: state.settingsReducer.stripeLoginUrl,
        paymentTerms: state.settingsReducer.paymentTerms
    };
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        createAddress: (address) => dispatch(addressActions.createAddress(address)),
        deleteAddress: (addressId) => dispatch(addressActions.deleteAddress(addressId)),
        updateUserInfo: (userInfo) => dispatch(userActions.updateUserInfo(userInfo)),
        updateUserToOnboard: (isOnboarded, hasRedirection) => dispatch(addressActions.updateUserToOnboard(isOnboarded, hasRedirection)),
        createPaymentAcceptanceMethodAsync: (options, callback) => dispatch(paymentAcceptanceActions.createPaymentAcceptanceMethodAsync(options, callback)),
        getPaymentAcceptanceMethods: (options, callback) => dispatch(paymentAcceptanceActions.getPaymentAcceptanceMethods(options, callback)),
        saveOmiseAccount: (options, callback) => dispatch(paymentAcceptanceActions.saveOmiseAccount(options, callback)),
        addPaymentTerm: () => dispatch(PaymentTermActions.addPaymentTerm()),
        deletePaymentTerm: (id) => dispatch(PaymentTermActions.deletePaymentTerm(id)),
        updatePaymentTerm: (id, key, value) => dispatch(PaymentTermActions.updatePaymentTerm(id, key, value)),
        savePaymentTerms: (callback) => dispatch(PaymentTermActions.savePaymentTerms(callback)),
        getLocations: (callback) => dispatch(userActions.getLocations(callback)),
        createCustomFieldDefinition: (customFieldDefinition) => dispatch(userActions.createCustomFieldDefinition(customFieldDefinition))
    };
}

const SettingsIndex = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(MerchantSettingsIndexComponent);

module.exports = {
    SettingsIndex,
    MerchantSettingsIndexComponent
};
