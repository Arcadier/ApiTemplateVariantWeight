'use strict';
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');
var express = require('express');
var comparisonRouter = express.Router();
var Store = require('../redux/store');
var Entities = require('html-entities').Html5Entities;

var ComparisonListComponent = require('../views/comparison/comparison-list/index').ComparisonListComponent;
var ComparisonDetailComponent = require('../views/comparison/comparison-detail/index').ComparisonDetailComponent;
var ComparisonSnapshotTemplate = require('../views/comparison/comparison-snapshot/template');
var ComparisonSnapshotDetailListComponent = require('../views/comparison/comparison-snapshot/detail-list');

var authenticated = require('../scripts/shared/authenticated');
var authorizedUser = require('../scripts/shared/authorized-user');
var client = require('../../sdk/client');
const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

const viewComparisonListPage = {
    renderSidebar: true,
    code: 'view-consumer-comparison-tables-api',
}

comparisonRouter.get('/list', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewComparisonListPage), function (req, res) {
    let user = req.user;
    let promiseComparisonList = new Promise((resolve, reject) => {
        const params = {
            userId: req.user.ID,
            namesOnly: false,
            pageSize: 20,
            pageNumber: 1
        };

        client.Comparisons.getUserComparisons(params, function (err, comparisons) {
            resolve(comparisons);
        });
    });
    
    Promise.all([promiseComparisonList]).then((responses) => {
        const appString = 'comparison-list';

        const comparisons = responses[0];

        getUserPermissionsOnPage(user, "Comparison Tables", "Consumer", (permissions) => {
            const s = Store.createComparisonStore({
                userReducer: {
                    user: user,
                    permissions: permissions
                },
                comparisonReducer: {
                    comparisonList: comparisons,
                    //comparisonList: comparisons.Records,
                    comparisonToUpdate: null
                }
            });
            const reduxState = s.getState();

            const comparisonListApp = reactDom.renderToString(
                <ComparisonListComponent comparisons={comparisons}
                    totalRecords={comparisons.TotalRecords}
                    currentUser={user}
                    pageNumber={comparisons.PageNumber}
                    permissions={permissions} />
            );

            let seoTitle = 'Comparison List';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-comparison-list comparison-list', seoTitle, comparisonListApp, appString, reduxState));
        });
        
    });
});

const viewComparisonDetailPage = {
    renderSidebar: true,
    code: 'view-consumer-comparison-table-details-api',
}

comparisonRouter.get('/detail', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewComparisonDetailPage), function (req, res) {
    let user = req.user;

    const promiseComparisonList = new Promise((resolve, reject) => {
        const params = {
            userId: req.user.ID,
            namesOnly: false,
            pageSize: 1000,
            pageNumber: 1
        };

        client.Comparisons.getUserComparisons(params, function (err, comparisons) {
            resolve(comparisons);
        });
    });

    const promiseComparison = new Promise((resolve, reject) => {
        const options = {
            userId: req.user.ID,
            comparisonId: req.query['comparisonId'],
            includes: ['CartItem']
        };

        client.Comparisons.getComparison(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Items", function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseComparison, promiseComparisonList, promiseCustomFieldDefinitions]).then((responses) => {
        const appString = 'comparison-detail';
        const context = {};
        const comparison = responses[0];

        let comparisonList = [];
        if (responses[1]) {
            comparisonList = responses[1].Records;
        }
        
        let comparableCustomFields = [];
        if (responses[2].TotalRecords > 0) {
            comparableCustomFields = responses[2].Records.filter(c => c.IsComparable == true);
        }

        getUserPermissionsOnPage(user, "Comparison Table Details", "Consumer", (permissions) => {
            const s = Store.createComparisonStore({
                userReducer: {
                    user: user, 
                    permissions: permissions
                },
                comparisonReducer: {
                    comparisonList: comparisonList,
                    comparison: comparison,
                    comparableCustomFields: comparableCustomFields,
                    processing: false
                },
            });

            const reduxState = s.getState();
            const comparisonDetailApp = reactDom.renderToString(<ComparisonDetailComponent context={context}
                comparison={comparison}
                comparisonList={comparisonList}
                comparableCustomFields={comparableCustomFields}
                user={user}
                permissions={permissions} />);

            let seoTitle = 'Comparison Detail';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-compare-requisition', seoTitle, comparisonDetailApp, appString, reduxState));
        });
    });
});

comparisonRouter.get('/getUserComparisons', authenticated, function (req, res) {

    if (!req.user) {
        //Guest Users
        let guestID = '00000000-0000-0000-0000-000000000000';

        if (req.query['guestUserID'] !== "") {
            guestID = req.query['guestUserID'];
        }
        req.user = {
            ID: guestID,
            Guest: true
        }
    }
    
    const options = {
        userId: req.user.ID,
        namesOnly: req.query['namesOnly'],
        pageSize: req.query['pageSize'],
        pageNumber: req.query['pageNumber'],
        includes: req.query['includes']
    };

    var promiseComparisons = new Promise((resolve, reject) => {
        client.Comparisons.getUserComparisons(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparisons]).then((responses) => {
        res.send(responses[0]);
    });
});


comparisonRouter.get('/getComparison', authenticated, function (req, res) {

    if (!req.user) {
        //Guest Users
        let guestID = '00000000-0000-0000-0000-000000000000';
        if (req.query['guestUserID'] !== "") {
            guestID = req.query['guestUserID'];
        }
        req.user = {
            ID: guestID,
            Guest: true
        }
    } 

    const options = {
        userId: req.user.ID,
        comparisonId: req.query['comparisonId'],
        includes: req.query['includes']
    };

    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.getComparison(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.post('/createComparison', authenticated, function (req, res) {

    if (!req.user) {
        //Guest Users
        let guestID = '00000000-0000-0000-0000-000000000000';
        if (req.body['guestUserID'] !== "") {
            guestID = req.body['guestUserID'];
        }
        req.user = {
            ID: guestID,
            Guest: true
        }
    } 

    const options = {
        userId: req.user.ID,
        name: req.body['name'],
        includes: req.body['includes']
    };

    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.createComparison(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.put('/editComparison', authenticated, function (req, res) {
    const options = {
        userId: req.user.ID,
        comparisonId: req.body['comparisonId'],
        name: req.body['name'],
        includes: req.body['includes']
    };

    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.editComparison(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.delete('/deleteComparison', authenticated, function (req, res) {
    const options = {
        userId: req.user.ID,
        comparisonId: req.body['comparisonId']
    };
   
    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.deleteComparison(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.delete('/deleteComparisonDetail', authenticated, function (req, res) {
    const options = {
        userId: req.user.ID,
        comparisonId: req.body['comparisonId'],
        comparisonDetailId: req.body['comparisonDetailId']
    };

    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.deleteComparisonDetail(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.post('/createComparisonDetail', authenticated, function (req, res) {

    if (!req.user) {
        //Guest Users
        let guestID = '00000000-0000-0000-0000-000000000000';
        if (req.body['guestUserID'] !== "") {
            guestID = req.body['guestUserID'];
        }
        req.user = {
            ID: guestID,
            Guest: true
        }
    }

    const options = {
        userId: req.user.ID,
        comparisonId: req.body['comparisonId'],
        cartItemId: req.body['cartItemId'],
        includes: req.body['includes'],
        comparisonFields: req.body['comparisonFields']
    };

    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.createComparisonDetail(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.put('/clearAllComparisonDetails', authenticated, function (req, res) {
    const options = {
        userId: req.user.ID,
        comparisonId: req.body['comparisonId'],
        comparisonDetails: req.body['comparisonDetails'],
        includes: req.body['includes']
    };

    let comparisonOptions = {
        comparisonId: req.body['comparisonId'],
        Active: false,
        ReadOnly: true,
        UserID: req.user.ID
    }

    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.clearAllComparisonDetails(options, function (err, result) {
            resolve(result);
        });
    });

    let promiseUpdateComparison = new Promise((resolve, reject) => {
        client.Comparisons.setComparisonReadOnly(comparisonOptions, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison, promiseUpdateComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.get('/getComparisonByOrderId', authenticated, function (req, res) {
    const options = {
        userId: req.user.ID,
        orderId: req.query['orderId'],
        includeInactive: req.query['includeInactive'],
        includes: req.query['includes']
    };

    var promiseComparison = new Promise((resolve, reject) => {
        client.Comparisons.getComparisonByOrderId(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.post('/getComparisonSnapshot', authenticated, function (req, res) {
    var promiseItemCustomFields = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Items", function (err, result) {
            resolve(result);
        });
    });

    var promiseComparison = new Promise((resolve, reject) => {
        const options = {
            userId: req.user.ID,
            orderId: req.body['orderId'],
            includeInactive: true,
            includes: 'CartItem'
        };

        client.Comparisons.getComparisonByOrderId(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseItemCustomFields, promiseComparison]).then((responses) => {
        let snapshots = [];
        let customFields = [];
        let snapshotsHTML = [];

        if (responses[0]) {
            customFields = responses[0].Records;
        } 
        
        let comparison = responses[1];
        let comparisonDetails = comparison.ComparisonDetails;

        if (customFields.length > 0 && comparisonDetails.length > 0) {
            let comparables = customFields.filter(c => c.IsComparable === true);

            comparisonDetails.forEach(function (detail) {
                let snapshot = {};
                if (detail.Active) {
                    snapshot.sellerName = detail.CartItem.ItemDetail.MerchantDetail.DisplayName;
                    snapshot.itemName = detail.CartItem.ItemDetail.Name;
                    snapshot.currencyCode = detail.CartItem.CurrencyCode;
                    snapshot.itemPrice = detail.CartItem.DiscountAmount ? detail.CartItem.SubTotal -  parseFloat(detail.CartItem.DiscountAmount) : detail.CartItem.SubTotal;
                    snapshot.quantity = detail.CartItem.Quantity;
                    snapshot.originalPrice = detail.CartItem.SubTotal;

                    if (detail.ComparisonFields.find(c => c.Key == 'ItemName')) {
                        snapshot.itemName = detail.ComparisonFields.find(c => c.Key == 'ItemName').Value;
                    }

                    let fields = [];

                    let itemDescription = '';
                    if (detail.ComparisonFields.find(c => c.Key == 'BuyerDescription')) {
                        itemDescription = detail.ComparisonFields.find(c => c.Key == 'BuyerDescription').Value;
                    }

                    fields.push({
                        name: 'Item Description',
                        value: itemDescription
                    });

                    comparables.forEach(function (comparable) {
                        if (!comparison.ReadOnly || (comparison.ReadOnly && comparable.CreatedDateTime < comparison.ModifiedDateTime)) {
                            var field = {};
                            var comparisonField = detail.ComparisonFields.find(c => c.Key == comparable.Code);

                            field.name = comparable.Name;
                            field.value = comparisonField != null ? comparisonField.Value : '';
                            if (comparable.DataInputType.toLowerCase() == 'upload' && field.value.split('_').length > 1) {
                                field.value = field.value.split('_')[1];
                            }
                            if (comparable.DataInputType.toLowerCase() == 'formattedtext') {
                                field.value = Entities.decode(field.value);
                            }
                            fields.push(field);
                        }
                    });

                    snapshot.fields = fields;
                    snapshotsHTML.push(ComparisonSnapshotTemplate(reactDom.renderToString(<ComparisonSnapshotDetailListComponent snapshots={[snapshot]} />)));
                }
            });
            snapshotsHTML = snapshotsHTML.join('<--INSERT PAGE BREAK-->');
            var promiseFile = new Promise((resolve, reject) => {
                var options = {
                    format: 'pdf',
                    type: 'pdf',
                    filename: comparison.Name.replace(/\s/g, '') + '.pdf',
                    sourceUrl: '',
                    content: snapshotsHTML,
                    stylesheetContent: ''
                };

                client.Files.generateFile(options, function (err, result) {
                    resolve(result);
                });
            });

            Promise.all([promiseFile]).then((responses) => {
                res.send(responses[0]);
            });
        }
    });
});

comparisonRouter.get('/paging', authenticated, function (req, res) {
    let pageNumber = req.query['pageNumber'];
    const pageSize = 20;

    const options = {
        userId: req.user.ID,
        pageSize: pageSize,
        pageNumber: pageNumber,
        includes: req.query['includes']
    };

    var promiseComparisons = new Promise((resolve, reject) => {
        client.Comparisons.getUserComparisons(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparisons]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.get('/load', authenticated, function (req, res) {
    let user = req.user;
    let pageNumber = 1;
    const pageSize = 20;

    const options = {
        userId: req.user.ID,
        pageSize: pageSize,
        pageNumber: pageNumber,
        includes: req.query['includes']
    };

    var promiseComparisons = new Promise((resolve, reject) => {
        client.Comparisons.getUserComparisons(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparisons]).then((responses) => {
        res.send(responses[0]);
    });
});

comparisonRouter.post('/validateComparisonDetails', authenticated, function (req, res) {
    const user = req.user;
    const comparisonId = req.body['comparisonId'];
    const itemId = req.body['itemId']; // specific checkout item id to validate

    var promiseComparison = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            comparisonId: comparisonId,
            includes: 'CartItem'
        };

        client.Comparisons.getComparison(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseComparison]).then((responses) => {
        const comparison = responses[0];
        let itemIds = [];

        if (itemId) {
            itemIds.push(itemId);
        } else {
            comparison.ComparisonDetails.forEach(function (comparisonDetail) {
                itemIds.push(comparisonDetail.CartItem.ItemDetail.ParentID);
            });
        }

        let promiseItems = [];

        itemIds.forEach(function (itemId) {
            const promise = new Promise((resolve, reject) => {
                const options = {
                    itemId: itemId,
                    activeOnly: true
                };

                client.Items.getItemDetails(options, function (err, details) {
                    resolve(details);
                });
            });

            promiseItems.push(promise);
        });

        Promise.all(promiseItems).then((responses) => {
            const items = responses;

            let errorMessage = null;
            let updatedItems = [];

            comparison.ComparisonDetails.forEach(function (comparisonDetail) {
                const item = items.find(i => i.ID == comparisonDetail.CartItem.ItemDetail.ParentID);

                if (item) {
                    // Check parent item also since editing purchasability in merchant item list only updates the parent excluding child items
                    if (comparisonDetail.CartItem.ItemDetail.ModifiedDateTime > comparisonDetail.ModifiedDateTime || item.ModifiedDateTime > comparisonDetail.ModifiedDateTime) {
                        updatedItems.push(comparisonDetail.CartItem.ItemDetail.Name);
                    } else if (comparisonDetail.Offer != null && (comparisonDetail.Offer.Declined != null && comparisonDetail.Offer.Declined.Value)) {
                        errorMessage = 'Checkout failed! An offer related to one or more items has been declined.';
                    }
                }
            });

            res.send({
                errorMessage: errorMessage,
                updatedItems: updatedItems
            });
        });
    });
});

comparisonRouter.post('/exportToPDF', authenticated, function (req, res) {
    var promiseItemCustomFields = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Items", function (err, result) {
            resolve(result);
        });
    });

    const promiseComparison = new Promise((resolve, reject) => {
        const options = {
            userId: req.user.ID,
            comparisonId: req.body['comparisonId'],
            includes: ['CartItem']
        };

        client.Comparisons.getComparison(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseItemCustomFields, promiseComparison]).then((responses) => {
        let customFields = [];
        let snapshotsHTML = [];

        if (responses[0]) {
            customFields = responses[0].Records;
        }

        let comparison = responses[1];
        let comparisonDetails = comparison.ComparisonDetails;

        if (customFields.length > 0 && comparisonDetails.length > 0) {
            let comparables = customFields.filter(c => c.IsComparable === true);

            comparisonDetails.forEach(function (detail) {
                let snapshot = {};
                if (detail.Active) {
                    snapshot.sellerName = detail.CartItem.ItemDetail.MerchantDetail.DisplayName;
                    snapshot.itemName = detail.CartItem.ItemDetail.Name;
                    snapshot.currencyCode = detail.CartItem.CurrencyCode;
                    snapshot.itemPrice = detail.CartItem.DiscountAmount ? detail.CartItem.SubTotal - parseFloat(detail.CartItem.DiscountAmount) : detail.CartItem.SubTotal;
                    snapshot.quantity = detail.CartItem.Quantity;
                    snapshot.originalPrice = detail.CartItem.SubTotal;

                    if (detail.ComparisonFields.find(c => c.Key == 'ItemName')) {
                        snapshot.itemName = detail.ComparisonFields.find(c => c.Key == 'ItemName').Value;
                    }

                    let fields = [];

                    let itemDescription = '';
                    if (detail.ComparisonFields.find(c => c.Key == 'BuyerDescription')) {
                        itemDescription = detail.ComparisonFields.find(c => c.Key == 'BuyerDescription').Value;
                    }

                    fields.push({
                        name: 'Item Description',
                        value: itemDescription
                    });

                    comparables.forEach(function (comparable) {
                        if (!comparison.ReadOnly || (comparison.ReadOnly && comparable.CreatedDateTime < comparison.ModifiedDateTime)) {
                            var field = {};
                            var comparisonField = detail.ComparisonFields.find(c => c.Key == comparable.Code);

                            field.name = comparable.Name;
                            field.value = comparisonField != null ? comparisonField.Value : '';
                            if (comparable.DataInputType.toLowerCase() == 'upload' && field.value.split('_').length > 1) {
                                field.value = field.value.split('_')[1];
                            }
                            if (comparable.DataInputType.toLowerCase() == 'formattedtext') {
                                field.value = Entities.decode(field.value);
                            }
                            fields.push(field);
                        }
                    });

                    snapshot.fields = fields;
                    snapshotsHTML.push(ComparisonSnapshotTemplate(reactDom.renderToString(<ComparisonSnapshotDetailListComponent snapshots={[snapshot]} />)));
                }
            });
            snapshotsHTML = snapshotsHTML.join('<--INSERT PAGE BREAK-->');
            var promiseFile = new Promise((resolve, reject) => {
                var options = {
                    format: 'pdf',
                    type: 'pdf',
                    filename: comparison.Name.replace(/\s/g, '') + '.pdf',
                    sourceUrl: '',
                    content: snapshotsHTML,
                    stylesheetContent: ''
                };

                client.Files.generateFile(options, function (err, result) {
                    resolve(result);
                });
            });            

            Promise.all([promiseFile]).then((responses) => {
                let promiseEmails = [];
                promiseEmails.push(new Promise((resolve, reject) => {
                    const options = {
                        from: req.user.Email,
                        to: req.body['emailAddress'],
                        subject: 'Comparison',
                        body: 'Comparison Details',
                        attachments: [responses[0]]
                    };

                    client.Emails.sendEdm(options, function (err, result) {
                        resolve(result);
                    });
                }));

                Promise.all(promiseEmails).then((responses) => {
                    res.send(true);
                });
            });
        }
    });
});

module.exports = comparisonRouter;