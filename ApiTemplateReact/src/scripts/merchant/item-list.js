'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "merchant-item-list") {
    var MerchantItemListHome = require('../../views/merchant/item/list/index').MerchantItemListHome;

    const store = Store.createItemListStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <MerchantItemListHome />
        </ReactRedux.Provider>,
        app);
}