'use strict';
const React = require('react');
const reactDom = require('react-dom/server');
const express = require('express');
const receivingNoteRouter = express.Router();
const store = require('../redux/store');
const template = require('../views/layouts/template');
const authenticated = require('../scripts/shared/authenticated');
const authorizedUser = require('../scripts/shared/authorized-user');
const client = require('../../sdk/client');
const CreateReceivingNoteComponent = require('../views/receiving-note/create/index').CreateReceivingNoteComponent;
const ReceivingNoteDetailComponent = require('../views/receiving-note/detail/index').ReceivingNoteDetailComponent;
const ReceivingNoteListComponent = require('../views/receiving-note/list/index').ReceivingNoteListComponent;
const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

function getReceivingNotes(userId, filters, callback) {
    if (!filters) {
        filters = {
            pageSize: '20',
            pageNumber: '1',
            keyword: null,
            startDate: null,
            endDate: null,
            merchantIds: null
        };
    }

    const promiseReceivingNotes = new Promise((resolve, reject) => {
        const options = {
            userId: userId,
            ...filters
        };

        client.ReceivingNotes.getReceivingNotes(options, (err, result) => {
            resolve(result);
        });
    });

    const promiseSuppliers = new Promise((resolve, reject) => {
        const options = {
            userId: userId
        };

        client.Orders.getMerchantsFromOrdersB2B(options, (err, result) => {
            resolve(result);
        });
    });

    const promisePurchaseOrders = new Promise((resolve, reject) => {
        //let orderStatuses = [...new Set(process.env.DELIVERY_FULFILLMENT_STATUSES_b2b.split(',').concat(process.env.PICKUP_FULFILLMENT_STATUSES_b2b.split(',')))];
        //orderStatuses = orderStatuses.filter((status) => status.toLowerCase() != 'rejected');

        getAllRecords();

        function getAllRecords(pageNumber = 1, records = []) {
            const promise = new Promise((resolve, reject) => {
                const options = {
                    userId: userId,
                    pageSize: 1000,
                    pageNumber: pageNumber,
                    //orderStatuses: orderStatuses,
                };

                client.Purchases.getHistoryB2B(options, (err, result) => {
                    resolve(result);
                });
            });

            Promise.all([promise]).then((responses) => {
                const result = responses[0];
                records = records.concat(result.Records);

                if (result.PageNumber * result.PageSize < result.TotalRecords) {
                    getAllRecords(result.PageNumber + 1, records);
                } else {
                    resolve(records);
                }
            });
        }
    });

    Promise.all([promiseReceivingNotes, promiseSuppliers, promisePurchaseOrders]).then((responses) => {
        callback({
            receivingNotes: responses[0],
            suppliers: responses[1],
            orders: responses[2],
            filters: filters
        });
    });
}

const viewReceivingNotesData = {
    code: 'view-consumer-receiving-notes-api',
    renderSidebar: true,
};

const viewCreateReceivingNoteData = {
    code: 'view-consumer-create-receiving-note-api',
    renderSidebar: true,
};

const viewReceivingNoteDetailsData = {
    code: 'view-consumer-receiving-note-details-api',
    renderSidebar: true,
};

const addCreateReceivingNotePermissionCode = 'add-consumer-create-receiving-note-api';
const editReceivingNoteDetailsPermissionCode = 'edit-consumer-receiving-note-details-api';

receivingNoteRouter.get('/create', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewCreateReceivingNoteData), (req, res) => {
    const user = req.user;
    const purchaseOrderId = req.query['id'];

    if (!purchaseOrderId)
        return res.redirect('/?error=missing-purchase-order-id');

    const promisePurchaseOrder = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            orderId: purchaseOrderId
        };

        client.Orders.getOrderDetails(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promisePurchaseOrder]).then((responses) => {
        const orderDetail = responses[0];

        //TODO: add validation if purchase order is still allowed to create receiving note
        getUserPermissionsOnPage(user, 'Create Receiving Note', 'Consumer', (pagePermissions) => {
            const reduxState = store.createReceivingNoteStore({
                userReducer: {
                    user: user,
                    pagePermissions: pagePermissions
                },
                receivingNoteReducer: {
                    orderDetail: orderDetail
                },
                marketplaceReducer: {
                    locationVariantGroupId: req.LocationVariantGroupId
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<CreateReceivingNoteComponent pagePermissions={pagePermissions} user={user} orderDetail={orderDetail} locationVariantGroupId={req.LocationVariantGroupId} />);

            res.send(template('page-seller create-good-receipt page-sidebar', seoTitle, app, 'create-receiving-note', reduxState));
        });
    });
});

receivingNoteRouter.post('/create-receiving-note', authenticated, isAuthorizedToPerformAction(addCreateReceivingNotePermissionCode), (req, res) => {
    const user = req.user;

    const promiseReceivingNote = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            receivingNoteNo: 'GR' + new Date().getTime().toString(),
            orderId: req.body['orderId'],
            receiveDateTime: req.body['receiveDateTime'],
            receivingNoteDetails: JSON.parse(req.body['receivingNoteDetails'])
        };

        client.ReceivingNotes.createReceivingNote(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseReceivingNote]).then((responses) => {
        const receivingNote = responses ? responses[0] : null;
        res.send(receivingNote);
    });
})

receivingNoteRouter.get('/detail', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewReceivingNoteDetailsData), (req, res) => {
    const user = req.user;
    const id = req.query["id"];
    if (!id) return res.send("Receiving note not found.");
    const promiseReceivingNote = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            receivingNoteId: req.query["id"]
        }
        client.ReceivingNotes.getReceivingNoteById(options, (err, result) => {
            resolve(result);
        });
    });
    Promise.all([promiseReceivingNote]).then(responses => {
        const receivingNoteDetails = responses[0];
        if (!receivingNoteDetails) return res.send('Receiving note not found.');
        if (receivingNoteDetails && !receivingNoteDetails.OrderID) return res.send('Order not found.');

        const orderDetail = receivingNoteDetails && receivingNoteDetails.Order ? receivingNoteDetails.Order : null
        getUserPermissionsOnPage(user, 'Receiving Note Details', 'Consumer', (pagePermissions) => {
            const reduxState = store.createReceivingNoteStore({
                userReducer: {
                    user: user,
                    pagePermissions: pagePermissions
                },
                receivingNoteReducer: {
                    orderDetail: orderDetail,
                    receivingNoteDetails: receivingNoteDetails
                },
                marketplaceReducer: {
                    locationVariantGroupId: req.LocationVariantGroupId
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<ReceivingNoteDetailComponent 
                user={user}
                receivingNoteDetails={receivingNoteDetails}
                orderDetail={orderDetail}
                locationVariantGroupId={req.LocationVariantGroupId}
                pagePermissions={pagePermissions}
            />);

            res.send(template('page-seller create-good-receipt view-receipt page-sidebar', seoTitle, app, 'receiving-note-detail', reduxState));
        });
    });
});

receivingNoteRouter.get('/list', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewReceivingNotesData), (req, res) => {
    const user = req.user;

    const filters = {
        pageNumber: 1,
        pageSize: 20
    };

    getReceivingNotes(user.ID, filters, (result) => {
        getUserPermissionsOnPage(user, 'Receiving Notes', 'Consumer', (pagePermissions) => {
            const reduxState = store.createReceivingNoteStore({
                userReducer: {
                    user: user,
                    pagePermissions: pagePermissions
                },
                receivingNoteReducer: {
                    receivingNotes: result.receivingNotes,
                    suppliers: result.suppliers,
                    orders: result.orders,
                    filters: result.filters
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(
                <ReceivingNoteListComponent
                    user={user}
                    pagePermissions={pagePermissions}
                    receivingNotes={result.receivingNotes}
                    suppliers={result.suppliers}
                    orders={result.orders}
                    filters={result.filters} />);

            res.send(template('page-seller goods-receipt-list page-sidebar', seoTitle, app, 'receiving-note-list', reduxState));
        });
    });
});

receivingNoteRouter.get('/filter', authenticated, (req, res) => {
    const user = req.user;

    getReceivingNotes(user.ID, req.query, (result) => {
        res.send(result);
    });
});

receivingNoteRouter.put('/void-receiving-note', authenticated, isAuthorizedToPerformAction(editReceivingNoteDetailsPermissionCode), (req, res) => {
    const user = req.user;
    if (!req.body || !req.body.ID) return res.send({ success: false, message: 'Receiving note ID not found.'});

    const promiseVoidReceivingNote = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            receivingNoteId: req.body.ID,
            Void: true,
        }
        client.ReceivingNotes.updateReceivingNote(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseVoidReceivingNote]).then(responses => {
        const receivingNoteDetails = responses[0];
        let promisePurchaseOrder = null;
        let promiseAutoReceivingNote = null;
        if (receivingNoteDetails) {
            let updatedGRNDetails = [];
            if (req.body.ReceivingNoteDetails && req.body.Request) {
                const detail = JSON.parse(req.body.ReceivingNoteDetails);
                const updateRequestArr = JSON.parse(req.body.Request);
                if (detail && Array.isArray(detail) && detail.length > 0 && updateRequestArr && Array.isArray(updateRequestArr) && updateRequestArr.length > 0) {
                    detail.map(d => {
                        let updateCartNote = updateRequestArr.find(u => u.cartItemId == d.CartItemID);
                        let request = { cartItemId: d.CartItemID, quantity: -d.Quantity };
                        if (updateCartNote && updateCartNote.cartItemId) {
                            request.remainingQuantity = updateCartNote.remainingQuantity || 0;
                            request.receivedQuantity = updateCartNote.receivedQuantity || 0;
                        }

                        updatedGRNDetails.push(request);
                    });
                }
            }

            promiseAutoReceivingNote = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    receivingNoteNo: 'GR' + new Date().getTime().toString(),
                    orderId: receivingNoteDetails.OrderID,
                    receiveDateTime: receivingNoteDetails.ModifiedDateTime,
                    receivingNoteDetails: updatedGRNDetails,
                    referenceId: receivingNoteDetails.ID,
                };
                client.ReceivingNotes.createReceivingNote(options, (err, result) => {
                    resolve(result);
                });
            });

            promisePurchaseOrder = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    orderId: receivingNoteDetails.OrderID
                };

                client.Orders.getOrderDetails(options, (err, result) => {
                    resolve(result);
                });
            });
        }

        Promise.all([promiseAutoReceivingNote, promisePurchaseOrder]).then(responses => {
            const [ auto, orderDetail] = responses;
            res.send({ success: receivingNoteDetails && receivingNoteDetails.Void == true, receivingNoteDetails, orderDetail });            
        })
    });
});

module.exports = receivingNoteRouter;