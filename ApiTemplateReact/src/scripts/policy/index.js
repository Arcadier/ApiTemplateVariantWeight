'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'policy') {
    var PolicyHome = require('../../views/policy/index').PolicyHome;

    const store = Store.createPolicyStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <PolicyHome />
        </ReactRedux.Provider>,
        app);
}