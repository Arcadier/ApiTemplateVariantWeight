'use strict';
var React = require('react');
var reactDom = require('react-dom');

var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

const app = document.getElementById('header-section');
if (app !== null) {
    var HeaderLayout = require('../../views/layouts/header').HeaderLayout;

    const store = Store.createHeaderStore(window.REDUX_DATA);

    reactDom.hydrate(<ReactRedux.Provider store={store}><HeaderLayout /></ReactRedux.Provider>, app);
}
