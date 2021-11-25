'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');
require('../shared/header');

if (window.APP == "delivery-add-edit") {
    var DeliveryAddEditIndexReduxConnect = require('../../views/delivery/add-edit/index').DeliveryAddEditIndexReduxConnect;

    const store = Store.createDeliverySettingsStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <DeliveryAddEditIndexReduxConnect />
        </ReactRedux.Provider>,
        app);
}