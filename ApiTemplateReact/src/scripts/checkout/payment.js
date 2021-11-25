'use strict';
const React = require('react');
const ReactDom = require('react-dom');
const ReactRedux = require('react-redux');
const Store = require('../../redux/store.js');

if (window.APP == "checkout-payment") {
    const CheckoutPaymentHome = require('../../views/checkout/payment/index').CheckoutPaymentHome;
    const store = Store.createCheckoutStore(window.REDUX_DATA);
    const app = document.getElementById("root");

    ReactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CheckoutPaymentHome />
        </ReactRedux.Provider>,
        app);
}