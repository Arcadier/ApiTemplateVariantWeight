'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');


if (window.APP == "requisition-detail") {
    var RequisitionDetailHome = require('../../views/requisition/detail/index').RequisitionDetailHome;

    const store = Store.createRequisitionStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <RequisitionDetailHome />
        </ReactRedux.Provider>,
        app);
}

if (window.APP == "requisition-list") {
    var RequisitionListHome = require('../../views/requisition/list/index').RequisitionListHome;

    const store = Store.createRequisitionStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <RequisitionListHome />
        </ReactRedux.Provider>,
        app);
}