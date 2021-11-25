var express = require('express');
var merchantsApp = express();

merchantsApp.use('/items', require('./items'));
merchantsApp.use('/dashboard', require('./dashboard'));
merchantsApp.use('/', require('./upload-edit'));
merchantsApp.use('/order', require('./order'));
merchantsApp.use('/activity-logs', require('../activity-log'));
merchantsApp.use('/settings', require('./settings'));
merchantsApp.use('/invoice', require('./invoice'));
merchantsApp.use('/user-groups', require('../user-groups'));
merchantsApp.use('/account-permissions', require('../account-permissions'));
merchantsApp.use('/quotation', require('../quotation'));
merchantsApp.use('/subaccount', require('../sub-account'));

module.exports = merchantsApp;