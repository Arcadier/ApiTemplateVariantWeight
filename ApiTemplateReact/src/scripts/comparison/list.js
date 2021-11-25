'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "comparison-list") {
    var ComparisonList = require('../../views/comparison/comparison-list/index').ComparisonList;

    const store = Store.createComparisonStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ComparisonList />
        </ReactRedux.Provider>,
        app);
}