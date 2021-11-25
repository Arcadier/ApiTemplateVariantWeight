'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'activity-log') {
    var ActivityLogPage = require('../../views/activity-log/index').ActivityLogPage;

    const store = Store.createActivityLogStore(window.REDUX_DATA);
    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ActivityLogPage />
        </ReactRedux.Provider>,
        app);

}