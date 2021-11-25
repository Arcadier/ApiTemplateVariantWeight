'use strict';
const redux = require('redux');
const itemsReducer = require('./reducers/items').itemsReducer;
const categoryReducer = require('./reducers/categories').categoryReducer;
const userReducer = require('./reducers/users').userReducer;
const merchantReducer = require('./reducers/users').userReducer;
const subAccountReducer = require('./reducers/users').userReducer;
const currentUserReducer = require('./reducers/users').userReducer;
const emptyReducer = require('./reducers/empty').emptyReducer;
const panelsReducer = require('./reducers/panels').panelsReducer;
const purchaseReducer = require('./reducers/purchases').purchaseReducer;
const settingsReducer = require('./reducers/settings').settingsReducer;
const orderReducer = require('./reducers/orders').orderReducer;
const inboxReducer = require('./reducers/inbox').inboxReducer;
const searchReducer = require('./reducers/search').searchReducer;
const orderDiaryReducer = require('./reducers/order-diary').orderDiaryReducer;
const dashboardReducer = require('./reducers/dashboard').dashboardReducer;
const comparisonReducer = require('./reducers/comparisons').comparisonReducer;
const uploadEditItemReducer = require('./reducers/uploadEditItem').uploadEditItemReducer;
const activityLogReducer = require('./reducers/activitylog').activityLogReducer;
const marketplaceReducer = require('./reducers/marketplaces').marketplaceReducer;
const deliverySettingsReducer = require('./reducers/delivery-settings').deliverySettingsReducer;
const contentPageReducer = require('./reducers/content-pages').contentPageReducer;
const policyReducer = require('./reducers/content-pages').contentPageReducer;
const chatReducer = require('./reducers/chat').chatReducer;
const cartReducer = require('./reducers/carts').cartReducer;
const checkoutReducer = require('./reducers/checkout').checkoutReducer;
const approvalReducer = require('./reducers/approval').approvalReducer;
const quotationReducer = require('./reducers/quotations').quotationReducer;
const requisitionReducer = require('./reducers/requisitions').requisitionReducer;
const receivingNoteReducer = require('./reducers/receiving-notes').recevingNoteReducer;
const invoiceReducer = require('./reducers/invoice').invoiceReducer;
const userGroupReducer = require('./reducers/user-groups').userGroupReducer;
const accountPermissionReducer = require('./reducers/account-permissions').accountPermissionReducer;

const thunk = require('redux-thunk').default;

const headerReducer = redux.combineReducers({
    categoryReducer, userReducer, panelsReducer, marketplaceReducer, inboxReducer, cartReducer
});

const sidebarReducer =  redux.combineReducers({
    userReducer, marketplaceReducer, approvalReducer
});

const homepageReducer = redux.combineReducers({
    itemsReducer, categoryReducer, userReducer, panelsReducer, settingsReducer
});

const itemDetailReducer = redux.combineReducers({
    itemsReducer, userReducer, panelsReducer, merchantReducer, comparisonReducer, marketplaceReducer, cartReducer
});

const purchasePageReducer = redux.combineReducers({
    userReducer, purchaseReducer, orderDiaryReducer, comparisonReducer, marketplaceReducer
});

const storeFrontPageReducer = redux.combineReducers({
    userReducer, itemsReducer, merchantReducer
});

const orderPageReducer = redux.combineReducers({
    userReducer, orderReducer, orderDiaryReducer, marketplaceReducer
});

const inboxPageReducer = redux.combineReducers({
    userReducer, inboxReducer
});

const ActivityLogPageReducer = redux.combineReducers({
    userReducer, activityLogReducer
});

const ComparisonPageReducer = redux.combineReducers({
    userReducer, comparisonReducer
});

const settingPageReducer = redux.combineReducers({
    settingsReducer, userReducer, currentUserReducer
});

const searchPageReducer = redux.combineReducers({
    userReducer, categoryReducer, searchReducer
});

const checkoutReviewPageReducer = redux.combineReducers({
    settingsReducer, merchantReducer, userReducer
});

const dashboardComponentReducer = redux.combineReducers({
    dashboardReducer, userReducer
});

const itemUploadEditReducer = redux.combineReducers({
    uploadEditItemReducer, userReducer
});

const deliverySettingsReducerCombineReducer = redux.combineReducers({
    deliverySettingsReducer, userReducer
});

const footerReducer = redux.combineReducers({
    panelsReducer, contentPageReducer, marketplaceReducer
});

const itemListPageReducer = redux.combineReducers({
    itemsReducer, userReducer
});

const subAccountPageReducer = redux.combineReducers({
    userReducer, subAccountReducer, marketplaceReducer
});

const policyPageReducer = redux.combineReducers({
    userReducer, policyReducer
});

const chatPageReducer = redux.combineReducers({
    userReducer, chatReducer, comparisonReducer
});

const cartPageReducer = redux.combineReducers({
    userReducer, cartReducer, marketplaceReducer
});

const checkoutPageReducer = redux.combineReducers({
    userReducer, checkoutReducer
});

const OnePageCheckoutReducer = redux.combineReducers({
    settingsReducer, merchantReducer, checkoutReducer, userReducer, currentUserReducer, marketplaceReducer
});

const approvalPageReducer = redux.combineReducers({
    userReducer, approvalReducer
});

const QuotationPageReducer = redux.combineReducers({
    userReducer, quotationReducer
});

const RequisitionPageReducer = redux.combineReducers({
    userReducer, requisitionReducer, orderDiaryReducer, marketplaceReducer
});

const ReceivingNotePageReducer = redux.combineReducers({
    userReducer, receivingNoteReducer, orderDiaryReducer, marketplaceReducer
});

const InvoicePageReducer = redux.combineReducers({
    userReducer, invoiceReducer, orderDiaryReducer, marketplaceReducer
});

const UserGroupPageReducer = redux.combineReducers({
    userReducer, userGroupReducer
});

const AccountPermissionPageReducer = redux.combineReducers({
    userReducer, accountPermissionReducer
});

const UnauthorizedAccessPageReducer = redux.combineReducers({
    userReducer
});

function createDeliverySettingsStore(initialState) {
    return redux.createStore(deliverySettingsReducerCombineReducer, initialState, redux.applyMiddleware(thunk));
}

function createHeaderStore(initialState) {
    return redux.createStore(headerReducer, initialState, redux.applyMiddleware(thunk));
}

function createSidebarStore(initialState) {
    return redux.createStore(sidebarReducer, initialState, redux.applyMiddleware(thunk));
}

function createHomepageStore(initialState) {
    return redux.createStore(homepageReducer, initialState, redux.applyMiddleware(thunk));
}

function createEmptyStore(initialState) {
    return redux.createStore(emptyReducer, initialState, redux.applyMiddleware(thunk));
}

function createItemDetailStore(initialState) {
    return redux.createStore(itemDetailReducer, initialState, redux.applyMiddleware(thunk));
}

function createPurchaseStore(initialState) {
    return redux.createStore(purchasePageReducer, initialState, redux.applyMiddleware(thunk));
}

function createSettingsStore(initialState) {
    return redux.createStore(settingPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createOrderStore(initialState) {
    return redux.createStore(orderPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createInboxStore(initialState) {
    return redux.createStore(inboxPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createStoreFrontStore(initialState) {
    return redux.createStore(storeFrontPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createSearchStore(initialState) {
    return redux.createStore(searchPageReducer, initialState, redux.applyMiddleware(thunk));
}

function checkoutReviewPageStore(initialState) {
    return redux.createStore(checkoutReviewPageReducer, initialState, redux.applyMiddleware(thunk));
}

function checkoutTransactionCompletePageStore(initialState) {
    return redux.createStore(settingPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createDashboardStore(initialState) {
    return redux.createStore(dashboardComponentReducer, initialState, redux.applyMiddleware(thunk));
}

function createItemUploadEditStore(initialState) {
    return redux.createStore(itemUploadEditReducer, initialState, redux.applyMiddleware(thunk));
}

function createComparisonStore(initialState) {
    return redux.createStore(ComparisonPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createActivityLogStore(initialState) {
    return redux.createStore(ActivityLogPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createFooterStore(initialState) {
    return redux.createStore(footerReducer, initialState, redux.applyMiddleware(thunk));
}

function createItemListStore(initialState) {
    return redux.createStore(itemListPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createSubAccountStore(initialState) {
    return redux.createStore(subAccountPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createPolicyStore(initialState) {
    return redux.createStore(policyPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createChatStore(initialState) {
    return redux.createStore(chatPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createApprovalStore(initialState) {
    return redux.createStore(approvalPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createCartStore(initialState) {
    return redux.createStore(cartPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createCheckoutStore(initialState) {
    return redux.createStore(checkoutPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createOnePageCheckoutStore(initialState) {
    return redux.createStore(OnePageCheckoutReducer, initialState, redux.applyMiddleware(thunk));
}

function createQuotationStore(initialState) {
    return redux.createStore(QuotationPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createRequisitionStore(initialState) {
    return redux.createStore(RequisitionPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createReceivingNoteStore(initialState) {
    return redux.createStore(ReceivingNotePageReducer, initialState, redux.applyMiddleware(thunk));
}

function createInvoiceStore(initialState) {
    return redux.createStore(InvoicePageReducer, initialState, redux.applyMiddleware(thunk));
}

function createUserGroupStore(initialState) {
    return redux.createStore(UserGroupPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createAccountPermissionStore(initialState) {
    return redux.createStore(AccountPermissionPageReducer, initialState, redux.applyMiddleware(thunk));
}

function createUnauthorizedAccessStore(initialState) {
    return redux.createStore(UnauthorizedAccessPageReducer, initialState, redux.applyMiddleware(thunk));
}

module.exports = {
    createHomepageStore: createHomepageStore,
    createHeaderStore: createHeaderStore,
    createSidebarStore: createSidebarStore,
    createEmptyStore: createEmptyStore,
    createItemDetailStore: createItemDetailStore,
    createPurchaseStore: createPurchaseStore,
    createSettingsStore: createSettingsStore,
    createOrderStore: createOrderStore,
    createInboxStore: createInboxStore,
    createStoreFrontStore: createStoreFrontStore,
    createSearchStore: createSearchStore,
    checkoutReviewPageStore: checkoutReviewPageStore,
    checkoutTransactionCompletePageStore: checkoutTransactionCompletePageStore,
    createDashboardStore: createDashboardStore,
    createItemUploadEditStore: createItemUploadEditStore,
    createActivityLogStore: createActivityLogStore,
    createApprovalStore: createApprovalStore,
    createComparisonStore: createComparisonStore,
    createFooterStore: createFooterStore,
    createDeliverySettingsStore: createDeliverySettingsStore,
    createItemListStore: createItemListStore,
    createSubAccountStore: createSubAccountStore,
    createPolicyStore: createPolicyStore,
    createChatStore: createChatStore,
    createCartStore: createCartStore,
    createCheckoutStore: createCheckoutStore,
    createOnePageCheckoutStore: createOnePageCheckoutStore,
    createQuotationStore: createQuotationStore,
    createRequisitionStore: createRequisitionStore,
    createReceivingNoteStore: createReceivingNoteStore,
    createInvoiceStore: createInvoiceStore,
    createUserGroupStore: createUserGroupStore,
    createAccountPermissionStore: createAccountPermissionStore,
    createUnauthorizedAccessStore: createUnauthorizedAccessStore
};
