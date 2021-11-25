'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var ProfileSettingsComponent = require('../../user/settings/profile');
var AddressSettingsComponent = require('../../user/settings/address');

var HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
var FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;

var addressActions = require('../../../redux/addressActions');
var userActions = require('../../../redux/userActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

class UserSettingsIndexComponent extends React.Component {

    componentDidMount() {
        const self = this;

        $('#settings-tab a').on('click', function (e, isSkipClickEvent) {
            e.preventDefault();

            let currentActive = $("ul li.active a").attr('href');

            if (currentActive == '#Profile') {
                if (!isSkipClickEvent) {
                    $('.profile-next').trigger('click');
                    return !($('#Profile').find('.error-con').length > 0);
                }
            }
            else if (currentActive == '#Address') {

                $('#addAddress').trigger('click')

                return !(self.props.addresses.length < 1)
            }

            else if (currentActive == '#Payment') {
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
                self.props.validatePermissionToPerformAction('view-consumer-addresses-api');
            }
        });
    }

    render() {
        return (
            <React.Fragment>
                <div id='settings-index-container'>
                    <div className='header mod' id='header-section'>
                        <HeaderLayoutComponent categories={this.props.categories} user={this.props.currentUser} />
                    </div>
                    <div className='main'>
                        <div className='settings-container'>
                            <div className='container'>
                                <div className='h-parent-child-txt full-width'>
                                    <p><a href='/'>Home</a></p>
                                    <i className='fa fa-angle-right' />
                                    <p className='active'>User Settings</p>
                                </div>
                                <div className='settings-content'>
                                    <div className='setting-top'> <span className='h-text'>User Settings</span>
                                        <div className="setting-tab">
                                            <ul className='nav nav-pills' id='settings-tab'>
                                                <li className='active'><a data-toggle='tab' href='#Profile'>Profile</a></li>
                                                <li><a data-toggle='tab' href='#Address'>Address</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className='setting-bot'>
                                        <div className='tab-content'>
                                            <ProfileSettingsComponent
                                                componentType={'user'}
                                                pagePermissions={this.props.pagePermissions}
                                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                                customFieldDefinition={this.props.customFieldDefinition}
                                                user={this.props.user}
                                                userLogins={this.props.userLogins}
                                                updateUserInfo={this.props.updateUserInfo}
                                                getLocations={this.props.getLocations}
                                                createCustomFieldDefinition={this.props.createCustomFieldDefinition} />
                                            <AddressSettingsComponent deleteAddress={this.props.deleteAddress}
                                                pagePermissions={this.props.pagePermissions}
                                                addresses={this.props.addresses}
                                                user={this.props.user}
                                                createAddress={this.props.createAddress}
                                                updateUserToOnboard={this.props.updateUserToOnboard}
                                                addressPermissions={this.props.addressPermissions}
                                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='footer fixed' id='footer-section'>
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
        addressPermissions: state.settingsReducer.addressPermissions,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        createAddress: (address) => dispatch(addressActions.createAddress(address)),
        deleteAddress: (addressId) => dispatch(addressActions.deleteAddress(addressId)),
        updateUserInfo: (userInfo, callback) => dispatch(userActions.updateUserInfo(userInfo, callback)),
        updateUserToOnboard: (isOnboarded, hasRedirection) => dispatch(addressActions.updateUserToOnboard(isOnboarded, hasRedirection)),
        getLocations: (callback) => dispatch(userActions.getLocations(callback)),
        createCustomFieldDefinition: (customFieldDefinition) => dispatch(userActions.createCustomFieldDefinition(customFieldDefinition))
    };
}

const SettingsIndex = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(UserSettingsIndexComponent);

module.exports = {
    SettingsIndex,
    UserSettingsIndexComponent
};
