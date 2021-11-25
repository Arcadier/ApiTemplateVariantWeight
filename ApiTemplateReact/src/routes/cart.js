'use strict';
let express = require('express');
let cartPageRouter = express.Router();
let CartPage = require('../views/cart/main').CartPageComponent;
let reactDom = require('react-dom/server');
let React = require('react');
let template = require('../views/layouts/template');
let client = require('../../sdk/client');
let Store = require('../redux/store');
let authenticated = require('../scripts/shared/authenticated');
let CommonModule = require('../public/js/common');
const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../scripts/shared/user-permissions');

const viewCartPage = {
    renderSidebar: true,
    code: 'view-consumer-cart-api',
}

cartPageRouter.get('/', authenticated, isAuthorizedToAccessViewPage(viewCartPage), function (req, res) {
    if (!req.user) {
        let guestID = '00000000-0000-0000-0000-000000000000';

        if (req.cookies && req.cookies.guestUserID) {
            guestID = req.cookies.guestUserID;          
        }
        req.user = {
            ID: guestID,
            Guest: true
        }
    }

    let currentUser = req.user;
    const options = {
        userId: currentUser.ID,
        pageSize: 99,
        pageNumber: 1,
        includes: ['User']
    };
    var promiseCarts = new Promise((resolve, reject) => {
        client.Carts.getCarts(options, function (err, result) {
            resolve(result);
        });
    });

    let promiseMarketplace = new Promise((resolve, reject) => {
        let options = {
            includes: 'ControlFlags'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCarts, promiseMarketplace]).then((responses) => {
        let itemCarts = responses[0];
        let marketInfo = responses[1];
        let cartPageModel = {};
        let cartList = [];
        if (itemCarts.Records) {
            cartList = itemCarts.Records;
        }

        cartList = itemCarts.Records;
        let cartItemListFullDetails = [];
        let merchantPaymentTerms = [];
        if (cartList.length !== 0) {
            //Add All VariantList
            const merchantIds = [];
            cartList.map(function (cart) {
               //ARC10053 the discountamount should not be round off to have the correct value.
                if (cart.DiscountAmount) {
                    cart.DiscountAmount = parseFloat(cart.DiscountAmountNotRoundOff) || 0;
                }
                let promiseItems = new Promise((resolve, reject) => {
                    const options = {
                        itemId: cart.ItemDetail.ParentID,
                        activeOnly: true
                    };
                    //Only For Variants Check
                    if (cart.ItemDetail.ParentID) {
                        client.Items.getItemDetails(options, function (err, details) {
                            resolve(details);
                        });
                    }
                });
                //Only For Variants Check
                if (cart.ItemDetail.ParentID) {
                    cartItemListFullDetails.push(promiseItems);
                }
                if (!merchantIds.includes(cart.ItemDetail.MerchantDetail.ID)) merchantIds.push(cart.ItemDetail.MerchantDetail.ID);
            });
            if (merchantIds.length > 0) {
                merchantPaymentTerms = Promise.all(merchantIds.map(merchantID => 
                    new Promise((resolve, reject) => 
                        client.Payments.getPaymentTerms({ merchantId: merchantID }, function (err, paymentTerms) {
                            resolve({ merchantID, paymentTerms});
                        })
                    )
                ));
            }
        }

        Promise.all([cartItemListFullDetails, merchantPaymentTerms]).then((responses) => {
            const paymentTerms = responses[1];
            cartList.map(function (cart) {
                let quantityModel = {};
                let variantModel = {};
                cart.isChecked = "";
                cart.isItemDisabled = !(cart.ItemDetail && cart.ItemDetail.Active && cart.ItemDetail.IsAvailable && cart.ItemDetail.IsVisibleToCustomer); 
                cart.isMerchantDisabled = !(cart.ItemDetail && cart.ItemDetail.MerchantDetail && cart.ItemDetail.MerchantDetail.Visible && cart.ItemDetail.MerchantDetail.Active);
                //For variants Only to get correct value
                if (cart.ItemDetail.Variants) {
                   // cart.SubTotal = cart.Quantity * cart.ItemDetail.Price;
                }
                quantityModel.SubTotal = cart.SubTotal;
                quantityModel.Quantity = cart.Quantity;
                quantityModel.StockQuantity = cart.ItemDetail.StockQuantity;
                quantityModel.StockLimited = cart.ItemDetail.StockLimited;
                quantityModel.Price = cart.ItemDetail.Price;
                quantityModel.DiscountAmount = cart.DiscountAmount || 0;
                if (cart.ItemDetail.Variants && cart.ItemDetail.Variants.length === 0) {
                    variantModel.variantsSelected = [];
                    variantModel.quantityModel = quantityModel;
                    cart.variantModel = variantModel;
                }
                if (cart.ItemDetail && cart.ItemDetail.Variants) {
                    variantModel.variantsSelected = [];
                    let sameVariants = [];
                    cart.ItemDetail.Variants.forEach(function (variant) {                        
                        if (responses && responses[0]) {
                            responses[0].forEach(function (data) {
                                if (data && data.ID === cart.ItemDetail.ParentID) {
                                    variantModel.variantDataList = data.ChildItems;
                                    if (data.ChildItems) {
                                        data.ChildItems.forEach(function (child) {                                            
                                            if (child.Variants) {
                                                child.Variants.forEach(function (cVar) {
                                                    if (variant.ID === cVar.ID && variant.GroupID === cVar.GroupID) {
                                                        sameVariants.push("true");
                                                    }
                                                });
                                                if (sameVariants.length !== 0 && sameVariants.length === cart.ItemDetail.Variants.length) {
                                                    variantModel.selectedChildID = child.ID;
                                                    sameVariants = [];
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            variantModel.quantityModel = quantityModel;
                            cart.variantModel = variantModel;
                        }

                        variantModel.variantsSelected.push(variant);
                    });
                }
                if (process.env.PRICING_TYPE == 'country_level') {
                    const parentItem = responses.find(item => cart.ItemDetail.ParentID == item.ID);
                    if (parentItem && typeof parentItem !== 'undefined' && parentItem.ChildItems && parentItem.ChildItems.length > 0) {
                        const item = parentItem.ChildItems.find(i => cart.ItemDetail.ID == i.ID);
                        if (item && typeof item !== 'undefined') {
                            if (item.CustomFields && item.CustomFields.length > 0) {
                                const moq = item.CustomFields.find(c => c.Name == 'MOQ');
                                if (moq && typeof moq !== 'undefined') {
                                    quantityModel.MOQ = JSON.parse(moq.Values[0]) || null;
                                }
                            }
                        }
                    }
                }
            });

            cartPageModel.cartList = cartList;
            cartPageModel.cartItemToEdit = "";
            cartPageModel.cartItemToDelete = "";
            cartPageModel.isArranged = false;
            cartPageModel.merchantPaymentTerms = paymentTerms;

            getUserPermissionsOnPage(currentUser, "Cart", "Consumer", (pagePermissions) => {
                const s = Store.createCartStore({
                    userReducer: {
                        user: currentUser,
                        pagePermissions: pagePermissions
                    },
                    cartReducer: {
                        cartPageModel: cartPageModel

                    },
                    marketplaceReducer: {
                        ControlFlags: marketInfo.ControlFlags,
                        locationVariantGroupId: req.LocationVariantGroupId
                    }
                });

                const reduxState = s.getState();

                const cart = reactDom.renderToString(
                    <CartPage
                        cartPageModel={cartPageModel}
                        user={currentUser}
                        ControlFlags={marketInfo.ControlFlags}
                        locationVariantGroupId={req.LocationVariantGroupId}
                        pagePermissions={pagePermissions}
                    />
                );
                const appString = 'user-cart';
                let seoTitle = 'Cart Page';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }
                res.send(template('page-cart', seoTitle, cart, appString, reduxState));
            });
            
        });

    });
});

cartPageRouter.put('/editCart', authenticated, function (req, res) {
    const options = {
        userID: req.user.ID,
        cartID: req.body.cartID,
        itemID: req.body.itemID,
        quantity: req.body.quantity,
        discount: req.body.discountAmount,
        updateCartAsPending: req.body.updateCartAsPending || false
    };
    var promiseCarts = new Promise((resolve, reject) => {
        client.Carts.editCart(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCarts]).then((responses) => {
        res.send(responses[0]);
    });
});

cartPageRouter.delete('/deleteCart', authenticated, function (req, res) {

    //Fix for ARC10600
    const options = {
        userId: req.user ? req.user.ID : req.body.userId,
        cartId: req.body.cartId
    };

    var promiseCarts = new Promise((resolve, reject) => {
        client.Carts.deleteCartItem(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCarts]).then((responses) => {
        res.send(responses[0]);
    });
});

cartPageRouter.post('/generateInvoiceByCartIDs', authenticated, function (req, res) {
    let cartItemIds = req.body['cartId[]'];
    let userID = req.body['userId'];
    const defaultPaymentTerms = JSON.parse(req.body['defaultPaymentTerms']);
    
    let promiseInvoiceNumber = new Promise((resolve, reject) => {
        let options = {
            userId: userID,
            cartItemIds: cartItemIds,
            updateInventory: false, // ARC-8709
            updateCartItemsAsProcessed: true
        };

        client.Payments.generateInvoiceNumber(options, function (err, invoiceNumber) {
            if (err) {
                if (err.toString().includes('Cannot book') && process.env.PRICING_TYPE == 'service_level') {
                    resolve({ code: 'INSUFFICIENT_STOCKS'});
                } else {
                    resolve(null);
                }
            } else  resolve(invoiceNumber);
        });
    });

    Promise.all([promiseInvoiceNumber]).then((responses) => {
        const invoiceDetails = responses[0];
        const orders = invoiceDetails.Orders && invoiceDetails.Orders.length > 0 ? invoiceDetails.Orders : null;
        
        if (orders && defaultPaymentTerms && defaultPaymentTerms.length > 0) {
            let promiseOrderDetail = new Promise((resolve, reject) => {
                let ordersList = [];
                orders.map(order => {
                    let paymentTermId = null;
                    if (order.MerchantDetail) {
                        const paymentTerm = defaultPaymentTerms.find(p => p.merchantId == order.MerchantDetail.ID);

                        if (paymentTerm) {
                            paymentTermId = paymentTerm.paymentTermId;
                        }
                    }

                    ordersList.push({
                        orderId: order.ID,
                        paymentTermId: paymentTermId
                    });
                });

                const options = { orders: ordersList };

                client.Orders.updateOrderDetails(options, function (err, result) {
                    resolve(result);
                });
            });

            Promise.all([promiseOrderDetail]).then((responses) => {
                res.send(invoiceDetails);
            });
        } else {
            res.send(invoiceDetails);
        }
    }, (err) => {
        res.send(err);
    });

});

cartPageRouter.post('/generateOrderByCartIDs', authenticated, function (req, res) {
    let cartItemIds = req.body['cartId[]'];
    let userID = req.user.ID;
    const defaultPaymentTerms = JSON.parse(req.body['defaultPaymentTerms']);

    let promiseCheckout = new Promise((resolve, reject) => {
        let options = {
            userId: userID,
            cartItemIds: cartItemIds,
            updateCartItemsAsProcessed: true
        };

        client.Orders.generateOrderFromCartItems(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCheckout]).then((responses) => {
        const orders = responses[0] ? responses[0].Orders : null;
        if (orders && defaultPaymentTerms && defaultPaymentTerms.length > 0) {
            let promiseOrderDetail = new Promise((resolve, reject) => {
                let ordersList = [];
                orders.map(order => {
                    let paymentTermId = null;
                    if (order.MerchantDetail) {
                        const paymentTerm = defaultPaymentTerms.find(p => p.merchantId == order.MerchantDetail.ID);

                        if (paymentTerm) {
                            paymentTermId = paymentTerm.paymentTermId;
                        }
                    }

                    ordersList.push({
                        orderId: order.ID,
                        paymentTermId: paymentTermId
                    });
                });

                const options = { orders: ordersList };

                client.Orders.updateOrderDetails(options, function (err, result) {
                    resolve(result);
                });
            });

            Promise.all([promiseOrderDetail]).then((responses) => {
                res.send(orders);
            });
        } else {
            res.send(orders);
        }
    });
});

cartPageRouter.get('/getUserCarts', function (req, res) {

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
        pageSize: req.query['pageSize'],
        pageNumber: req.query['pageNumber'],
        includes: req.query['includes']
    };

    var promiseCarts = new Promise((resolve, reject) => {
        client.Carts.getCarts(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCarts]).then((responses) => {
        res.send(responses[0]);
    });
});

cartPageRouter.post('/validateCart', function(req, res) {
    let arr = req.body['cartData'];
    const isServiceLevel = process.env.PRICING_TYPE == 'service_level';
    if (arr) {
        arr = JSON.parse(arr);
        const promiseItem = (cart) => 
            new Promise((resolve, reject) => {
                const options = {
                    itemId: cart.ItemParentID? cart.ItemParentID : cart.ItemID,
                    activeOnly: false
                };

                client.Items.getItemDetails(options, function (err, details) {
                    let ItemDetail = details;
                    if (details && cart.ItemParentID !== null && details.ChildItems.length > 0) {
                        ItemDetail = details.ChildItems.find(d => d.ID == cart.ItemID);
                        ItemDetail.IsVisibleToCustomer = details.IsVisibleToCustomer;
                        ItemDetail.IsAvailable = details.IsAvailable;
                    }
                    if (err) {
                        resolve({...cart, error: err.toString() })
                    } else {
                        resolve({ ...cart, ItemDetail });
                    }
                });
            });
        const promiseItemDetailArr = Promise.all(arr.map(cart => promiseItem(cart)));
        const results = [];
        Promise.all([promiseItemDetailArr]).then(responses => {
            const cartItemDetailsArr = responses[0];
            if (cartItemDetailsArr && cartItemDetailsArr.length > 0) {
                cartItemDetailsArr.map(cart => {
                    if (cart.error) {
                        if (cart.error.includes('Item is not found.')) {
                            results.push({ merchantID: cart.MerchantID, ID: cart.ID, code: 'NOT_FOUND'});
                        }
                    } else {
                        if (!cart.ItemDetail.IsVisibleToCustomer || !cart.ItemDetail.IsAvailable) {
                            //not purchasable
                            results.push({ ID: cart.ID, code: 'NOT_PURCHASABLE'});
                        } else if (cart.ItemDetail.StockLimited && parseInt(cart.ItemDetail.StockQuantity) == 0) {
                            results.push({ ID: cart.ID, code: 'SOLD_OUT' });
                        } else if (cart.ItemDetail.StockLimited && process.env.PRICING_TYPE !== 'service_level') {
                            const remainingStocks = parseInt(cart.ItemDetail.StockQuantity);
                            // insufficient stocks
                            if (remainingStocks < parseInt(cart.Quantity)) {
                                results.push({
                                    ID: cart.ID,
                                    remainingStocks,
                                    code: 'INSUFFICIENT_STOCKS'
                                });
                            }
                        }
                    }

                });
                res.send({ success: results.length == 0, data: results });
            } else res.send({ success: false });
        });
    } else res.send({ success: false });


});

module.exports = cartPageRouter;