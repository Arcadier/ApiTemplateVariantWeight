'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../../../../shared/base');
const OnePageCheckoutMainComponent = require('../shared/index');
import { updateCheckoutSelectedDeliveryAddress} from '../../../../../../redux/orderActions.js';
import { updateUserInfo } from '../../../../../../redux/userActions.js';
import {
    updateSelectedPaymentMethod, generateStripeSessionId, postPayment, selectDeliveryForOrder, initOrderDeliveryMap,
    proceedToPayment, updateSelectedAddress, onTextChangeAddAddress, addressToDelete, deliveryChanged, onTextChangeUser, calculateCost, updateBuyerAddress,
    updateIsSameBilingAndDelivery, deleteAddress, createAddress, clearAddAddressModal, createInvoiceCosmetic
} from '../../../../../../redux/checkoutReviewAction';

const { validatePermissionToPerformAction } = require('../../../../../../redux/accountPermissionActions');



class OnePageCheckoutComponent extends BaseComponent {

    render() {
        console.log(this.props.permissions);
        return (
            <React.Fragment>
               <OnePageCheckoutMainComponent {...this.props} />
            </React.Fragment>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        invalidCheckout: state.checkoutReducer.invalidCheckout,
        addressToDelete: state.settingsReducer.addressToDelete,
        buyerAddresses: state.settingsReducer.addresses,
        buyerBillingAddresses: state.settingsReducer.billingAddresses,
        user: state.userReducer.user,
        isGuest: state.userReducer.isGuest,
        addressModel: state.settingsReducer.addressModel,
        addressModelAdd: state.settingsReducer.addressModelAdd,
        invoiceDetails: state.settingsReducer.invoiceDetails,
        shippingOptions: state.settingsReducer.shippingOptions,
        pickupOptions: state.settingsReducer.pickupOptions,
        orderSelectedDelivery: state.settingsReducer.orderSelectedDelivery,
        buyerAddress: state.checkoutReducer.buyerAddress,
        paymentMethods: state.checkoutReducer.paymentMethods,
        isSameBillingAndDelivery: state.checkoutReducer.isSameBillingAndDelivery,
        pendingOffer: state.checkoutReducer.pendingOffer,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId, 
        permissions: state.userReducer.permissions
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateCheckoutSelectedDeliveryAddress: (orderID, addressID) => dispatch(updateCheckoutSelectedDeliveryAddress(orderID, addressID)),
        onTextChangeUser: (value, obj) => dispatch(onTextChangeUser(value, obj)),
        deliveryChanged: (selectedDelOption, orderID) => dispatch(deliveryChanged(selectedDelOption, orderID)),
        selectDeliveryForOrder: (orderID, delivery) => dispatch(selectDeliveryForOrder(orderID, delivery)),
        initOrderDeliveryMap: () => dispatch(initOrderDeliveryMap()),
        proceedToPayment: (callback) => dispatch(proceedToPayment(callback)),
        updateSelectedAddress: (ID, isBillingAddress) => dispatch(updateSelectedAddress(ID, isBillingAddress)),
        onTextChangeAddAddress: (value, obj) => dispatch(onTextChangeAddAddress(value, obj)),
        addressToDelete: (ID) => dispatch(addressToDelete(ID)),
        deleteAddress: () => dispatch(deleteAddress()),
        createAddress: () => dispatch(createAddress()),
        clearAddAddressModal: () => dispatch(clearAddAddressModal()),
        updateSelectedPaymentMethod: (code) => dispatch(updateSelectedPaymentMethod(code)),
        generateStripeSessionId: (callback) => dispatch(generateStripeSessionId(callback)),
        postPayment: (stripe, omise, isProcessPayment, callback) => dispatch(postPayment(stripe, omise, null, null, isProcessPayment, null, callback)),
        calculateCost: (selectedDelOption, orderID) => dispatch(calculateCost(selectedDelOption, orderID)),
        updateUserInfo: (userInfo) => dispatch(updateUserInfo(userInfo)),
        updateBuyerAddress: (address) => dispatch(updateBuyerAddress(address)),
        updateIsSameBilingAndDelivery: (value) => dispatch(updateIsSameBilingAndDelivery(value)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        createInvoiceCosmetic: (callback) => dispatch(createInvoiceCosmetic(callback)),
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