'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "homepage") {
    var HomepageWithPanelHome = require('../../views/home/home-page-panels').HomepageWithPanelHome;

    const store = Store.createHomepageStore(window.REDUX_DATA);

    const app = document.getElementById("homepage-list");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <HomepageWithPanelHome />
        </ReactRedux.Provider>,
        app);
}