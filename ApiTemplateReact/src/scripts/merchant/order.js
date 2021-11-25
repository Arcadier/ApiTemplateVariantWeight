'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "merchant-order-history" || window.APP == "merchant-order-detail") {
    const store = Store.createOrderStore(window.REDUX_DATA);
    const app = document.getElementById("root");

    if (window.APP == "merchant-order-history") {
        var OrderHistoryHome = require('../../views/merchant/order/history/index').OrderHistoryHome;
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <OrderHistoryHome />
            </ReactRedux.Provider>,
            app);
    }
    if (window.APP == "merchant-order-detail") {
        var OrderDetailHome = require('../../views/merchant/order/detail/index').OrderDetailHome;
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <OrderDetailHome />
            </ReactRedux.Provider>,
            app);
    }

}