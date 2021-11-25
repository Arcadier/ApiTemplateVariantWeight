'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "checkout-transaction-complete") {

    var TransactionCompletePage = require('../../views/checkout/transaction-complete/transaction_complete').TransactionCompletePage;

    const store = Store.checkoutTransactionCompletePageStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <TransactionCompletePage />
        </ReactRedux.Provider>,
        app);

}
if (window.APP == "checkout-requisition-created") {
    const CheckoutCompleteHome = require('../../views/features/checkout_flow_type/b2b/checkout-complete/index').CheckoutCompleteHome;

    const store = Store.createRequisitionStore(window.REDUX_DATA);
    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CheckoutCompleteHome />
        </ReactRedux.Provider>,
        app);
}