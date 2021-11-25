'use strict';
var React = require('react');
var reactDom = require('react-dom');

var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

const app = document.getElementById('sidebar-section');

if (app !== null) {
    var SidebarLayout = require('../../views/layouts/sidebar').SidebarLayout;
    const store = Store.createSidebarStore(window.REDUX_DATA);
    reactDom.hydrate(<ReactRedux.Provider store={store}><SidebarLayout /></ReactRedux.Provider>, app);
}
