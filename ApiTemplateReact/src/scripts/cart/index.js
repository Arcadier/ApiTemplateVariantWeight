'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'user-cart') {
    let CartPageComponent = require('../../views/cart/main').CartPage;
    const store = Store.createCartStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CartPageComponent />
        </ReactRedux.Provider>,
        app);
}