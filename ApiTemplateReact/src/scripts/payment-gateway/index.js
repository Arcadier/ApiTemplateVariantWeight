'use strict';
const React = require('react');
const reactDom = require('react-dom');
const reactRedux = require('react-redux');
const store = require('../../redux/store');

if (window.APP === 'payment-gateway-cancel') {
    const PaymentGatewayCancelHome = require('../../views/payment-gateway/cancel').PaymentGatewayCancelHome;
    const reduxStore = store.createEmptyStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <PaymentGatewayCancelHome />
        </reactRedux.Provider>, app);
}