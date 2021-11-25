'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "comparison-detail") {
    var ComparisonDetail = require('../../views/comparison/comparison-detail/index').ComparisonDetail;

    const store = Store.createComparisonStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ComparisonDetail />
        </ReactRedux.Provider>,
        app);
}