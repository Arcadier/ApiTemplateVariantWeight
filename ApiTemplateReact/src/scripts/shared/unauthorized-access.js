'use strict';
const React = require('react');
const reactDom = require('react-dom');
const ReactRedux = require('react-redux');
const Store = require('../../redux/store.js');

if (window.APP.includes("unauthorized-access-with-sidebar")) {
	const UnauthorizedAccessPageWithSidebarHome = require('../../views/common/unauthorized-access-with-sidebar').UnauthorizedAccessPageWithSidebarHome;

    const store = Store.createUnauthorizedAccessStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <UnauthorizedAccessPageWithSidebarHome />
        </ReactRedux.Provider>,
    app);
} else if (window.APP.includes("unauthorized-access")) {
	const UnauthorizedAccessPageHome = require('../../views/common/unauthorized-access').UnauthorizedAccessPageHome;

    const store = Store.createUnauthorizedAccessStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <UnauthorizedAccessPageHome />
        </ReactRedux.Provider>,
    app);
}

