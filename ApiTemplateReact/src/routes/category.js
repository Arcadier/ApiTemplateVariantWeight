'use strict';
var express = require('express');
var categoryRouter = express.Router();

var client = require('../../sdk/client');

categoryRouter.get('/getCategories', function (req, res) {
    var promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCategories]).then((responses) => {
        res.send(responses[0]);
    });
});

module.exports = categoryRouter;