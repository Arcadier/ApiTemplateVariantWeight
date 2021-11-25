'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'merchant-settings') {
    var SettingsIndex = require('../../views/merchant/settings/index').SettingsIndex;

    const store = Store.createSettingsStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <SettingsIndex />
        </ReactRedux.Provider>,
        app);
}