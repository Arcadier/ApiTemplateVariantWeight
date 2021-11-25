'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'merchant-dashboard') {
    var DashboardReduxConnect = require('../../views/merchant/dashboard/main').DashboardReduxConnect;

    const store = Store.createDashboardStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <DashboardReduxConnect />
        </ReactRedux.Provider>,
        app);
}