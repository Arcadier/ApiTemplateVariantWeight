'use strict';
const React = require('react');
const reactDom = require('react-dom');
const reactRedux = require('react-redux');
const store = require('../../redux/store');

if (window.APP === 'sub-account-list') {
    const SubAccountListHome = require('../../views/sub-account/list/index').SubAccountListHome;
    const reduxStore = store.createSubAccountStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <SubAccountListHome />
        </reactRedux.Provider>, app);
} else if (window.APP === 'sub-account-registration') {
    const SubAccountRegistrationHome = require('../../views/sub-account/registration/index').SubAccountRegistrationHome;
    const reduxStore = store.createSubAccountStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <SubAccountRegistrationHome />
        </reactRedux.Provider>, app);
}