'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'purchase-history' || window.APP === 'purchase-history-detail') {
    const store = Store.createPurchaseStore(window.REDUX_DATA);
    const app = document.getElementById("root");

    if (window.APP === 'purchase-history') {
        var PurchaseHistoryHome = require('../../views/purchase/history/index').PurchaseHistoryHome;
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <PurchaseHistoryHome />
            </ReactRedux.Provider>,
            app);
    }

    if (window.APP === 'purchase-history-detail') {
        var PurchaseDetailHome = require('../../views/purchase/detail/index').PurchaseDetailHome;
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <PurchaseDetailHome />
            </ReactRedux.Provider>,
            app);
    }
}