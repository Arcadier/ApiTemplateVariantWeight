'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "merchant-item-edit") {
    var UploadEditHome = require('../../views/merchant/item/upload-edit/main').UploadEditHome;

    const store = Store.createItemUploadEditStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <UploadEditHome />
        </ReactRedux.Provider>,
        app);
}