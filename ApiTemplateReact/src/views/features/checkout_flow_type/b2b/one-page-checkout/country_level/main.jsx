'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../../../../shared/base');
const OnePageCheckoutMainComponent = require('../shared/index');
import { updateCheckoutSelectedDeliveryAddress } from '../../../../../../redux/orderActions.js';
import { updateUserInfo } from '../../../../../../redux/userActions.js';
import { 
    selectDeliveryForOrder, initOrderDeliveryMap, proceedToPayment, updateSelectedAddress,
    onTextChangeAddAddress, addressToDelete, deliveryChanged, onTextChangeUser, calculateCost, updateBuyerAddress, postPayment,
    updateIsSameBilingAndDelivery, deleteAddress, createAddress, clearAddAddressModal
} from '../../../../../../redux/checkoutReviewAction';
import { validatePermissionToPerformAction } from '../../../../../../redux/accountPermissionActions';

class OnePageCheckoutComponent extends BaseComponent {

    render() {
        return (
            <React.Fragment>
               <OnePageCheckoutMainComponent {...this.props} />
            </React.Fragment>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        addressToDelete: state.settingsReducer.addressToDelete,
        buyerAddresses: state.settingsReducer.addresses,
        buyerBillingAddresses: state.settingsReducer.billingAddresses,
        user: state.userReducer.user,
        isGuest: state.userReducer.isGuest,
        addressModel: state.settingsReducer.addressModel,
        addressModelAdd: state.settingsReducer.addressModelAdd,
        shippingOptions: state.settingsReducer.shippingOptions,
        pickupOptions: state.settingsReducer.pickupOptions,
        orderSelectedDelivery: state.settingsReducer.orderSelectedDelivery,
        orderDetails: state.settingsReducer.orderDetails,
        buyerAddress: state.checkoutReducer.buyerAddress,
        workflows: state.checkoutReducer.workflows,
        departments: state.checkoutReducer.departments,
        showCreateRequisition: state.checkoutReducer.showCreateRequisition,
        isSameBillingAndDelivery: state.checkoutReducer.isSameBillingAndDelivery,
        pendingOffer: state.checkoutReducer.pendingOffer,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        pagePermissions: state.userReducer.pagePermissions,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateCheckoutSelectedDeliveryAddress: (orderID, addressID) => dispatch(updateCheckoutSelectedDeliveryAddress(orderID, addressID)),
        onTextChangeUser: (value, obj) => dispatch(onTextChangeUser(value, obj)),
        deliveryChanged: (selectedDelOption, orderID) => dispatch(deliveryChanged(selectedDelOption, orderID)),
        selectDeliveryForOrder: (orderID, delivery) => dispatch(selectDeliveryForOrder(orderID, delivery)),
        initOrderDeliveryMap: () => dispatch(initOrderDeliveryMap()),
        updateSelectedAddress: (ID, isBillingAddress) => dispatch(updateSelectedAddress(ID, isBillingAddress)),
        onTextChangeAddAddress: (value, obj) => dispatch(onTextChangeAddAddress(value, obj)),
        addressToDelete: (ID) => dispatch(addressToDelete(ID)),
        deleteAddress: () => dispatch(deleteAddress()),
        createAddress: () => dispatch(createAddress()),
        clearAddAddressModal: () => dispatch(clearAddAddressModal()),
        calculateCost: () => dispatch(calculateCost()),
        updateUserInfo: (userInfo) => dispatch(updateUserInfo(userInfo)),
        updateBuyerAddress: (address) => dispatch(updateBuyerAddress(address)),
        postPayment: (departmentId, workflowId) => dispatch(postPayment(null, null, departmentId, workflowId)),
        updateIsSameBilingAndDelivery: (value) => dispatch(updateIsSameBilingAndDelivery(value)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    }
}

const OnePageCheckoutMain = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(OnePageCheckoutComponent);

module.exports = {
    OnePageCheckoutMain,
    OnePageCheckoutComponent,
};