'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "delivery-settings") {
    var DeliverySettingsPage = require('../../views/delivery/settings/index').DeliverySettingsIndexReduxConnect;

    const store = Store.createDeliverySettingsStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <DeliverySettingsPage />
        </ReactRedux.Provider>,
        app);
}