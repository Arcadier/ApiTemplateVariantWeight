'use strict';
const React = require('react');
const reactDom = require('react-dom');
const reactRedux = require('react-redux');
const store = require('../../redux/store');

if (window.APP === 'user-group-list') {
    const UserGroupListHome = require('../../views/user-group/list/index').UserGroupListHome;
    const reduxStore = store.createUserGroupStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <UserGroupListHome />
        </reactRedux.Provider>, app);
} else if (window.APP === 'add-edit-user-group') {
	const AddEditUserGroupHome = require('../../views/user-group/add-edit/index').AddEditUserGroupHome;
    const reduxStore = store.createUserGroupStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <AddEditUserGroupHome />
        </reactRedux.Provider>, app);
}