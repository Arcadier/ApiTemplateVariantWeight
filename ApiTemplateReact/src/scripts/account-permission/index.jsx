'use strict';
const React = require('react');
const reactDom = require('react-dom');
const reactRedux = require('react-redux');
const store = require('../../redux/store');

if (window.APP === 'account-permission-list') {
    const AccountPermissionListHome = require('../../views/account-permission/list/index').AccountPermissionListHome;
    const reduxStore = store.createAccountPermissionStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <AccountPermissionListHome />
        </reactRedux.Provider>, app);
} else if (window.APP === 'add-edit-account-permission') {
	const AddEditPermissionProfileHome = require('../../views/account-permission/add-edit/index').AddEditPermissionProfileHome;
    const reduxStore = store.createAccountPermissionStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <AddEditPermissionProfileHome />
        </reactRedux.Provider>, app);
}