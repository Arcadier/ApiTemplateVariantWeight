'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "checkout-delivery") {
    var CheckoutDeliveryReduxConnect = require('../../views/checkout/delivery/main').CheckoutDeliveryReduxConnect;

    const store = Store.createSettingsStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CheckoutDeliveryReduxConnect />
        </ReactRedux.Provider>,
        app);
}