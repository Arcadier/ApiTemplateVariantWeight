'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP === 'chat') {
    var ChatComponent = require('../../views/chat/index').ChatComponentHome;
    const store = Store.createChatStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ChatComponent />
        </ReactRedux.Provider>,
        app);
}

if (window.APP === 'chat-quotation') {
    const ChatQuotationHome = require('../../views/chat/quotation/index').ChatQuotationHome;
    const store = Store.createChatStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ChatQuotationHome />
        </ReactRedux.Provider>,
        app);
}