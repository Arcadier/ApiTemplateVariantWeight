'use strict';

var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == 'login') {
    var BuyerLoginComponentTemplate = require('../../views/login/buyer-login').BuyerLoginHome;
    var SellerLoginComponentTemplate = require('../../views/login/seller-login').SellerLoginHome;
    var ForgotPasswordComponentTemplate = require('../../views/login/forgot-password').ForgotPasswordHome;
    var BuyerSignUpReduxConnect = require('../../views/login/buyer-sign-up').BuyerSignUpReduxConnect;
    var SellerSignUpReduxConnect = require('../../views/login/seller-sign-up').SellerSignUpReduxConnect;
    var ResetPasswordComponentTemplate = require('../../views/login/reset-password').ResetPasswordHome;
    var ChangePasswordComponentTemplate = require('../../views/login/change-password').ChangePasswordHome;
    var LandingReduxConnect = require('../../views/login/landing').LandingReduxConnect;

    var RegisterInterestComponentTemplate = require('../../views/login/register-interest').RegisterInterestHome;
    var NonPrivateLoginComponentTemplate = require('../../views/login/non-private-login').NonPrivateLoginHome;
    var NonPrivateSignUpReduxConnect = require('../../views/login/non-private-sign-up').NonPrivateSignUpReduxConnect;

    const store = Store.createEmptyStore(window.REDUX_DATA);

    let pageID = 'login-page';

    if (window.location.pathname.indexOf('/forgot-password') > -1 ||
        window.location.pathname.indexOf('/reset-password') > -1 ||
        window.location.pathname.indexOf('/change-password') > -1 ||
        window.location.pathname.indexOf('/interested-user') > -1 ||
        window.location.pathname.indexOf('/non-private/sign-in') > -1)
        pageID = 'root';

    const app = document.getElementById(pageID);

    if (window.location.href.indexOf('/buyer/register') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <BuyerSignUpReduxConnect />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/non-private/register') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <NonPrivateSignUpReduxConnect />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/seller/register') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <SellerSignUpReduxConnect />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/forgot-password') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <ForgotPasswordComponentTemplate />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/buyer/') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <BuyerLoginComponentTemplate />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/seller/') > -1) {

        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <SellerLoginComponentTemplate />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/interested-user') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <RegisterInterestComponentTemplate />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/reset-password') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <ResetPasswordComponentTemplate />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/change-password') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <ChangePasswordComponentTemplate />
            </ReactRedux.Provider>,
            app);
    } else if (window.location.href.indexOf('/non-private/sign-in') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <NonPrivateLoginComponentTemplate />
            </ReactRedux.Provider>, app);
    } else if (window.location.href.indexOf('/') > -1) {
        reactDom.hydrate(
            <ReactRedux.Provider store={store}>
                <LandingReduxConnect />
            </ReactRedux.Provider>,
            document.getElementById("root"));
    }
}