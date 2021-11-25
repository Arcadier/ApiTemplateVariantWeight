'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "login-homepage") {
	var LandingReduxConnect = require('../../views/login/landing').LandingReduxConnect;

	const store = Store.createHomepageStore(window.REDUX_DATA);

	const app = document.getElementById("root");
	reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <LandingReduxConnect />
        </ReactRedux.Provider>,
app);
}