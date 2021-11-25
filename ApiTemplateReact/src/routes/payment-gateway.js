'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const express = require('express');
const paymentGatewayRouter = express.Router();
const store = require('../redux/store');
const template = require('../views/layouts/template');
const authenticated = require('../scripts/shared/authenticated');
const PaymentGatewayCancelComponent = require('../views/payment-gateway/cancel').PaymentGatewayCancelComponent;

paymentGatewayRouter.get('/cancel', authenticated, (req, res) => {
    const user = req.user;

    const reduxState = store.createEmptyStore({
        userReducer: {
            user: user
        }
    }).getState();

    const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
    const app = reactDom.renderToString(<PaymentGatewayCancelComponent user={user} />);

    res.send(template('page-error', seoTitle, app, 'payment-gateway-cancel', reduxState));
});

module.exports = paymentGatewayRouter;