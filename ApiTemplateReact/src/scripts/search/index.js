'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'item-search') {
    var SearchComponent = require('../../views/search/index').SearchComponentHome;
    const store = Store.createSearchStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
        <SearchComponent />
    </ReactRedux.Provider>,
        app);
}