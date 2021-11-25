'use strict';
const React = require('react');
const reactDom = require('react-dom');
const reactRedux = require('react-redux');
const store = require('../../redux/store');

if (window.APP === 'create-receiving-note') {
    const CreateReceivingNoteHome = require('../../views/receiving-note/create/index').CreateReceivingNoteHome;
    const reduxStore = store.createReceivingNoteStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <CreateReceivingNoteHome />
        </reactRedux.Provider>, app);
} 

if (window.APP === 'receiving-note-detail') {
	const ReceivingNoteDetailHome = require('../../views/receiving-note/detail/index').ReceivingNoteDetailHome;
	const reduxStore = store.createReceivingNoteStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <ReceivingNoteDetailHome />
        </reactRedux.Provider>, app);
}

if (window.APP === 'receiving-note-list') {
    const ReceivingNoteListHome = require('../../views/receiving-note/list/index').ReceivingNoteListHome;
    const reduxStore = store.createReceivingNoteStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <reactRedux.Provider store={reduxStore}>
            <ReceivingNoteListHome />
        </reactRedux.Provider>, app);
}