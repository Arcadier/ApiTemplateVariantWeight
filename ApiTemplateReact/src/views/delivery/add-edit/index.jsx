'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var DeliveryOption = require('../add-edit/delivery-option');

var HeaderLayoutComponent = require('../../layouts/header').HeaderLayoutComponent;
var SidebarLayout = require('../../layouts/sidebar').SidebarLayoutComponent;
var SellerHeaderLayoutComponent = require('../../merchant/layouts/header').HeaderLayoutComponent;
var FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;
var BaseClassComponent = require('../../shared/base.jsx');
var shippingActions = require('../../../redux/shippingActions');

var EnumCoreModule = require('../../../../src/public/js/enum-core.js');

const PermissionTooltip = require('../../common/permission-tooltip');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

class DeliveryAddEditComponent extends BaseClassComponent {

    constructor(props) {

        super(props);
        this.state = {
            manageShippingOptions: this.props.manageShippingOptions,
            customFields: this.props.manageShippingOptions.CustomFields
        };

        this.childDeliveryOption = React.createRef();
        this.doSave = this.doSave.bind(this);

    }

    componentDidMount() { }

    doSave() {
        var self = this;

        this.props.validatePermissionToPerformAction('add-merchant-delivery-option-api', () => {
            var theShippingObject = self.childDeliveryOption.buildDeliveryOption();

            if (theShippingObject == false) {
                self.showMessage(EnumCoreModule.GetToastStr().Error.PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED);
                return
            }
            else {

                if (!theShippingObject.HasDeliveryRate) {
                    self.showMessage(EnumCoreModule.GetToastStr().Error.REQUIRED_DELIVERY_RATE_DETAILS);
                    return;
                }
            }

            if (typeof theShippingObject.ID == 'undefined') {
                self.props.createShippingOptions(self.props.user.ID, theShippingObject, function () {
                    window.location.href = '/delivery/settings';
                });
            }
            else {
                self.props.updateShippingOptions(self.props.user.ID, theShippingObject, function () {
                    window.location.href = '/delivery/settings';
                });
            }
        });
    }

    closeModal() {
        $('#popupConfirmOpt').fadeOut();
        $('#cover').fadeOut()
    }

    renderMenu() {
        if (typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Roles != null) {
            if (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant')) {
                return (
                    <SellerHeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                )
            }
            return <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
        }

        return '';
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={null} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main" style={{ paddingTop: '45px' }}>
                        <div className="delivery-setting-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid full-width">
                                        <span className="sc-text-big">Add / Edit Shipping option</span>
                                    </div>
                                    <div className="dsae-content">
                                        <span className="dsct-text">Shipping Option Settings</span>
                                        <DeliveryOption
                                            marketplaceInformation={this.props.marketplaceInformation}
                                            user={this.props.user}
                                            pagePermissions={this.props.pagePermissions}
                                            validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                            customFieldDefinition={this.props.customFieldDefinition}
                                            manageShippingOptions={this.state.manageShippingOptions}
                                            customField={this.state.customFields}
                                            ref={ref => (self.childDeliveryOption = ref)} />
                                    </div>
                                    <div className="dsae-content-btn pull-right">
                                        <div className="btn-cancel"><a href="/delivery/settings">Cancel</a></div>
                                        <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                            <div className="btn-save" id="btnSaveDeliveryOption" onClick={(e) => self.doSave()}>Save</div>
                                        </PermissionTooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="popup-area popup-confirm-opt" id="popupConfirmOpt" >
                    <div className="wrapper">
                        <div className="content-area text-center">
                            <p><strong className="text text-danger">Warning!</strong> This will change how the rates are calculated</p>
                            <br />
                        </div>
                        <div className="btn-area text-center">
                            <input onClick={(e) => self.closeModal()} className="my-btn btn-black" type="button" defaultValue="Okay" />
                        </div>
                    </div>
                </div>
                <div id="cover" style={{ display: 'none' }} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        pagePermissions: state.userReducer.pagePermissions,
        shippingOptionsMerchant: state.deliverySettingsReducer.shippingOptionsMerchant,
        shippingOptionsAdmin: state.deliverySettingsReducer.shippingOptionsAdmin,
        pickupLocations: state.deliverySettingsReducer.pickupLocations,
        manageShippingOptions: state.deliverySettingsReducer.manageShippingOptions,
        customFieldDefinition: state.deliverySettingsReducer.customFieldDefinition,
        marketplaceInformation: state.deliverySettingsReducer.marketplaceInformation
    };
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        deleteAddress: (userId, addressId) => dispatch(addressActions.deleteAddress(userId, addressId)),
        createAddress: (userId, body) => dispatch(addressActions.createAddress(userId, body)),
        deleteShippingMethod: (merchantID, shippingmethodID) => dispatch(shippingActions.deleteShippingOptions(merchantID, shippingmethodID)),
        createShippingOptions: (merchantID, shippingmethodObject, transactionCallBack) => dispatch(shippingActions.createShippingOptions(merchantID, shippingmethodObject, transactionCallBack)),
        updateShippingOptions: (merchantID, shippingmethodObject, transactionCallBack) => dispatch(shippingActions.updateShippingOptions(merchantID, shippingmethodObject, transactionCallBack)),
    };
}

const DeliveryAddEditIndexReduxConnect = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(DeliveryAddEditComponent)

module.exports = {
    DeliveryAddEditIndexReduxConnect,
    DeliveryAddEditComponent
}