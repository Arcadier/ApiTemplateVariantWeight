'use strict';
const React = require('react');
const ReactDom = require('react-dom');
const ReactRedux = require('react-redux');
const Store = require('../../redux/store.js');

if (window.APP == "one-page-checkout") {
    const OnePageCheckout = require('../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/one-page-checkout/' + process.env.PRICING_TYPE + '/main').OnePageCheckoutMain;
    const store = Store.createOnePageCheckoutStore(window.REDUX_DATA);
    const app = document.getElementById("root");

    ReactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <OnePageCheckout />
        </ReactRedux.Provider>,
        app);
}