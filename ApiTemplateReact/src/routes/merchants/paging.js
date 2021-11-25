'use strict';
var express = require('express');
var pagingLogRouter = express.Router();
var React = require('react');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var reactDom = require('react-dom/server');
var template = require('../../views/layouts/template');
var ActivityLogPage = require('../../views/merchant/activitylog/index').ActivityLogComponent;
var authenticated = require('../../scripts/shared/authenticated')
var client = require('../../../sdk/client');
var Store = require('../../redux/store');
/* GET review checkout data. */
pagingLogRouter.get('/', authenticated, function (req, res) {
    console.log('load activity log paging: ', Date.now());
    let user = req.user;
    console.log(">>>>>>>>>routes pageNumber paging req query>>>>>>>>>>>>>>>>>>>", req.query['pageNumber'])
    //let keyword = req.query['keyword'];
    const pageNumber = req.query['pageNumber'];
    let pageSize = 20;
    //console.log(">>>>>>>>>routes pageNumber>>>>>>>>>>>>>>>>>>>", pageNumber)
    //console.log(">>>>>>>>>routes pageSize>>>>>>>>>>>>>>>>>>>", pageSize)
    let promiseLog = new Promise((resolve, reject) => {
        client.ActivityLog.getActivityLog(user.ID, pageSize, pageNumber, "", "", "", function (err, callback) {
            resolve(callback);
        });
    });

    Promise.all([promiseLog]).then((responses) => {
        let messages = responses[0];
        res.send(messages);
    });
});

module.exports = pagingLogRouter;
