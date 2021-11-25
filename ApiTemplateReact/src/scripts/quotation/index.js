'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "quotation-list") {
    var QuotationListHome = require('../../views/quotation/quotation-list/index').QuotationListHome;

    const store = Store.createQuotationStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <QuotationListHome />
        </ReactRedux.Provider>,
        app);
}
if (window.APP == "quotation-detail") {
    var QuotationDetailHome = require('../../views/quotation/quotation-detail/index').QuotationDetailHome;

    const store = Store.createQuotationStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <QuotationDetailHome />
        </ReactRedux.Provider>,
        app);
}