'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store');

if (window.APP === "invoice-details") {
    var InvoiceDetailsHome = require('../../views/invoice/detail/index').InvoiceDetailsHome;

    const store = Store.createInvoiceStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <InvoiceDetailsHome />
        </ReactRedux.Provider>,
        app);
}

if (window.APP === "create-invoice") {
    var AddEditInvoiceComponentHome = require('../../views/invoice/add-edit/index').AddEditInvoiceComponentHome;

    const store = Store.createInvoiceStore(window.REDUX_DATA);
    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <AddEditInvoiceComponentHome />
        </ReactRedux.Provider>,
        app);

}

if (window.APP === "invoice-list") {
    var InvoiceListHome = require('../../views/invoice/list/index').InvoiceListHome;

    const store = Store.createInvoiceStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <InvoiceListHome />
        </ReactRedux.Provider>,
        app);
}

if (window.APP === "invoice-payment") {
    var InvoicePaymentHome = require('../../views/invoice/payment/index').InvoicePaymentHome;

    const store = Store.createInvoiceStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <InvoicePaymentHome />
        </ReactRedux.Provider>,
        app);
}

if (window.APP === "invoice-transaction-complete") {
    var InvoiceTransactionCompleteHome = require('../../views/invoice/transaction-complete/index').InvoiceTransactionCompleteHome;

    const store = Store.createInvoiceStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <InvoiceTransactionCompleteHome />
        </ReactRedux.Provider>,
        app);
}