'use strict';
var express = require('express');
var orderDiaryRouter = express.Router();
var multer = require('multer');
let uploadMulter = multer();
var FormData = require('form-data');
var authenticated = require('../scripts/shared/authenticated');
var client = require('../../sdk/client');
var EnumCoreModule = require('../public/js/enum-core');

function createOrderDiaryCustomFields(eventNames, callback) {
    let promiseCreate = [];

    eventNames.map(function (name) {
        promiseCreate.push(new Promise((resolve, reject) => {
            const options = {
                customField: {
                    'Name': name,
                    'DataInputType': 'textfield',
                    'DataFieldType': 'string',
                    'ReferenceTable': EnumCoreModule.GetCustomFieldReferenceTables().Orders,
                    'IsMandatory': false,
                    'IsComparable': false,
                    'GroupName': EnumCoreModule.GetCustomFieldGroups().OrderDiary
                }
            };

            client.CustomFields.create(options, function (err, result) {
                resolve(result);
            });
        }));
    });
    if (promiseCreate.length > 0) {
        Promise.all(promiseCreate).then((responses) => {
            callback(responses);
        });
    } else {
        callback([]);
    }
}

orderDiaryRouter.get('/getEventCustomField', authenticated, function (req, res) {
    const user = req.user;

    const promiseOrderCustomFields = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions(EnumCoreModule.GetCustomFieldReferenceTables().Orders, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseOrderCustomFields]).then((responses) => {
        const orderCustomFields = responses[0];
        const orderDiaryProperties = EnumCoreModule.GetOrderDiaryProperties();
        let orderDiaryCustomFields = [];
        let eventNamesToCreate = [orderDiaryProperties.EventAdmin, orderDiaryProperties.EventMerchant, orderDiaryProperties.EventConsumer];

        if (orderCustomFields && orderCustomFields.TotalRecords > 0) {
            orderCustomFields.Records.map(function (customField) {
                if (customField.GroupName === EnumCoreModule.GetCustomFieldGroups().OrderDiary) {
                    orderDiaryCustomFields.push(customField);

                    for (var i = 0; i < eventNamesToCreate.length; i++) {
                        if (eventNamesToCreate[i] === customField.Name) {
                            eventNamesToCreate.splice(i, 1);
                        }
                    }
                }
            });
        }

        createOrderDiaryCustomFields(eventNamesToCreate, function (customFields) {
            orderDiaryCustomFields = orderDiaryCustomFields.concat(customFields);

            const eventName = user.Roles.includes('Merchant') || user.Roles.includes('Submerchant') ? orderDiaryProperties.EventMerchant : orderDiaryProperties.EventConsumer;
            const eventCustomField = orderDiaryCustomFields.find(p => p.Name === eventName);

            res.send({
                orderDiaryCustomFields: orderDiaryCustomFields,
                eventCustomField: eventCustomField
            });
        });
    });
});

orderDiaryRouter.post('/uploadFile', authenticated, uploadMulter.any(), function (req, res) {
    const file = req.files[0];

    let formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname });

    const options = {
        userId: req.user.ID,
        purpose: 'OrderDiary',
        formData: formData
    };

    var promiseFile = new Promise((resolve, reject) => {
        client.Files.uploadFile(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseFile]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderDiaryRouter.post('/createEvent', authenticated, function (req, res) {
    const options = {
        userId: req.user.ID,
        orderId: req.body['orderId'],
        balance: req.body['balance'],
        fulfilmentStatus: req.body['fulfilmentStatus'],
        paymentStatus: req.body['paymentStatus'],
        customFields: req.body['customFields'],
    };

    var promiseEvent = new Promise((resolve, reject) => {
        client.Orders.updateMerchantOrder(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseEvent]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

module.exports = orderDiaryRouter;