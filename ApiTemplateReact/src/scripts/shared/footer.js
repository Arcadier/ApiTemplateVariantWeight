'use strict';
var React = require('react');
var reactDom = require('react-dom');

var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');
const app = document.getElementById('footer-section');
if (app !== null) {
    var FooterLayout = require('../../views/layouts/footer').FooterLayout;
    const store = Store.createFooterStore(window.REDUX_DATA);
    reactDom.hydrate(<ReactRedux.Provider store={store}><FooterLayout /></ReactRedux.Provider>, app);
}
