'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "checkout-review") {
    var CheckoutReviewPage = require('../../views/checkout/review/main').CheckoutReviewPage;

    const store = Store.checkoutReviewPageStore(window.REDUX_DATA);
    window.sessionStorage.setItem("browserBackNavigate", "True");
    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CheckoutReviewPage />
        </ReactRedux.Provider>,
        app);
}