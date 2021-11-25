'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store');

if (window.APP === 'merchant-storefront') {
    var StoreFrontPage = require('../../views/storefront/main').StoreFrontPage;

    const store = Store.createStoreFrontStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
        <StoreFrontPage />     
        </ReactRedux.Provider>,
        app);

}