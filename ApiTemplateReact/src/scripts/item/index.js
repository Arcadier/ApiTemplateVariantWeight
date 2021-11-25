'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store');

if (window.APP == "item-detail") {
    var ItemDetailsHome = require('../../views/item/index').ItemDetailsHome;

    const store = Store.createItemDetailStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ItemDetailsHome />
        </ReactRedux.Provider>,
        app);
}