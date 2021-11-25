'use strict';
let express = require('express');
let itemRouter = express.Router();
let React = require('react');
let Redux = require('redux');
let ReactRedux = require('react-redux');
let reactDom = require('react-dom/server');
let Store = require('../redux/store');
let template = require('../views/layouts/template');
let actionTypes = require('../redux/actionTypes');
let actions = require('../redux/actions');

let LandingPage = require('../views/login/landing');
let ItemDetailComponent = require('../views/item/index').ItemDetailComponent;

let client = require('../../sdk/client');
let authenticated = require('../scripts/shared/authenticated');
const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage } = require('../scripts/shared/user-permissions');
var EnumCoreModule = require('../public/js/enum-core');

const viewItemDetailsPage = {
    code: 'view-consumer-item-details-api',
}

itemRouter.get('/:slug/:id', authenticated, isAuthorizedToAccessViewPage(viewItemDetailsPage), function (req, res) {
    const pricingType = process.env.PRICING_TYPE;
    
    let currentUser = req.user;
    const promiseItem = new Promise((resolve, reject) => {
        const options = {
            itemId: req.params.id,
            activeOnly: true
        };

        client.Items.getItemDetails(options, function (err, details) {
            resolve(details);
        });
    });

    const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Items", function (err, details) {
            resolve(details);
        });

    });

    const promiseItemFeedback = new Promise((resolve, reject) => {
        client.Items.getItemFeedback({ itemId: req.params.id }, function(err, feedback) {
            resolve(feedback);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        let options = {
            includes: 'ControlFlags'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });
    //ARC 9590
    let idToUse = "";
    if (req.cookies && req.cookies.guestUserID && !req.user) {
        idToUse = req.cookies.guestUserID;
    } else if (req.user) {
        idToUse = req.user.ID;
    }

    const options = {
        userId: idToUse,
        pageSize: 99,
        pageNumber: 1,
        includes: ['User']
    };
    var promiseCarts = new Promise((resolve, reject) => {
        client.Carts.getCarts(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseItemBookings = new Promise((resolve, reject) => {
        if (pricingType == 'service_level') {
            client.Items.getItemBookings({ itemId: req.params.id }, function (err, bookings) {
                resolve(bookings);
            });
        } else {
            resolve([]);
        }
    });

    const promiseComparisonWidgetUserPermissions = new Promise((resolve, reject) => {
        if (!currentUser) {
            resolve({
                isAuthorizedToView: true,
                isAuthorizedToAdd: true,
                isAuthorizedToEdit: true,
                isAuthorizedToDelete: true
            });
        }
        const options = {
            userId: currentUser.SubBuyerID || currentUser.SubmerchantID || currentUser.ID,
            permissionName: 'Comparison Widget',
            permissionType: 'Consumer'
        };
        client.Users.getUserPermissions(options, function (err, userDetails) {
            const pageTypeWithName = `${options.permissionType.toLowerCase()}-${options.permissionName.toLowerCase().replace(/ /g, '-')}`;
            resolve({
                isAuthorizedToView: userDetails.includes(`view-${pageTypeWithName}-api`),
                isAuthorizedToAdd: userDetails.includes(`add-${pageTypeWithName}-api`),
                isAuthorizedToEdit: userDetails.includes(`edit-${pageTypeWithName}-api`),
                isAuthorizedToDelete: userDetails.includes(`delete-${pageTypeWithName}-api`)
            })
        });
    });



    Promise.all([promiseItem, promiseCustomFieldDefinitions, promiseItemFeedback, promiseMarketplace, promiseCarts, promiseItemBookings, promiseComparisonWidgetUserPermissions]).then((responses) => {
        const appString = 'item-detail';
        const itemDetails = responses[0];
        const customFieldsDefinitions = responses[1].Records;
        const feedback = responses[2];
        const marketplaceInfo = responses[3];

        const cartItems = responses[4];
        const bookings = responses[5];
        const comparisonWidgetPermissions = responses[6];
        
        if (!itemDetails || !itemDetails.Active) return res.redirect(`/search?keywords=${req.query['name'] || req.params.slug}`);

        //ARC9590 also fix user experience
        if (cartItems && cartItems.Records) {
            if (itemDetails && itemDetails.ChildItems && itemDetails.ChildItems.length !== 0) {
                itemDetails.ChildItems.map(function (ci) {
                    cartItems.Records.forEach(function (cart) {
                        if (cart.ItemDetail && ci.ID === cart.ItemDetail.ID) {
                            ci.StockQuantity = ci.StockQuantity - cart.Quantity;
                        }
                    });
                });
            } else {
                cartItems.Records.forEach(function (cart) {
                    if (cart.ItemDetail && itemDetails.ID === cart.ItemDetail.ID) {
                        itemDetails.StockQuantity = itemDetails.StockQuantity - cart.Quantity;
                    }
                });
            }
        }

        if (itemDetails.ParentID) return res.redirect('/');

        if (!currentUser) {
            let guestID = '00000000-0000-0000-0000-000000000000';

            if (req.cookies && req.cookies.guestUserID) {
                guestID = req.cookies.guestUserID;
            }
            currentUser = {
                ID: guestID,
                Guest: true
            };
        }

        let reviewAndRating = marketplaceInfo.ControlFlags.ReviewAndRating;


        //need to Call this Because in itemDetails.merchantDetail, profpic of merchant is Null
        const promiseMerchantDetail = new Promise((resolve, reject) => {
            const options = {
                token: null,
                userId: itemDetails.MerchantDetail.ID,
                includes: ''
            };

            client.Users.getUserDetails(options, function (err, details) {
                resolve(details);
            });
        });

        const promiseMerchantPaymentTerms = new Promise((resolve, reject) => {
            client.Payments.getPaymentTerms({ merchantId: itemDetails.MerchantDetail.ID }, function (err, paymentTerms) {
                resolve(paymentTerms);
            });
        });

        let priceValues = {
            originalPrice: 0,
            bulkPrice: 0,
            quantity: 0,
            discount: 0
        };

        //Customfield Adding of DataInput
        if (customFieldsDefinitions) {
            customFieldsDefinitions.forEach(function (cfd) {
                if (itemDetails.CustomFields) {
                    itemDetails.CustomFields.forEach(function (cf) {
                        if (cfd.Code == cf.Code) {
                            cf.DataInputType = cfd.DataInputType;
                            cf.DataFieldType = cfd.DataFieldType;
                        }
                        //Remove must get from API shippingMethod.
                        if (cf.Name == "ItemAvailableDeliveryOptions") {
                            itemDetails.CustomFields.pop(cf);
                        }


                        if (cf.Name == "WEIGHT") {
                            //arc7786 get weight unit
                            if (req.CustomFields) {
                                req.CustomFields.forEach(function (mc) {
                                    if (mc.Name.toLowerCase() === "weight unit" && mc.Values) {
                                        itemDetails.WeightUnit = '(' + mc.Values[0] + ')';
                                        cf.Name = cf.Name + itemDetails.WeightUnit;
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
        //Get DeliveryOption
        const promiseShippingOptions = new Promise((resolve, reject) => {
            client.ShippingMethods.getShippingOptions(function (err, shipping) {
                resolve(shipping);
            });
        });

        const promiseShippingOptionsMerchant = new Promise((resolve, reject) => {
            client.ShippingMethods.getShippingMethods(itemDetails.MerchantDetail.ID, function (err, addresses) {
                resolve(addresses);
            });
        });

        let categoryIds = [];
        if (itemDetails.Categories) {
            categoryIds = itemDetails.Categories.map(cat => cat.ID);
        };
        const promiseCategoriesWithCustomFields = new Promise((resolve, reject) => {
            client.Categories.getCategoriesByIds(categoryIds, function (err, categories) {
                resolve(categories);
            });
        });

        Promise.all([promiseMerchantDetail, promiseShippingOptions, promiseShippingOptionsMerchant, promiseCategoriesWithCustomFields, promiseMerchantPaymentTerms]).then((responses) => {
            let merchantDetails = responses[0];
            let shippingOptions = responses[1];
            let shippingOptionsMerchant = responses[2];
            let paymentTerms = responses[4];

            // UN-1428
            // filter custom fields based on selected categories
            let selectedCategoriesWithCustomFields = responses[3];
            let temp = [];
            if (customFieldsDefinitions) {
                const [weightCField] = customFieldsDefinitions.filter(x => x.Name.toLowerCase() === 'weight');
                if (weightCField) temp.push(weightCField);
            }

            if (selectedCategoriesWithCustomFields && customFieldsDefinitions) {
                selectedCategoriesWithCustomFields.map(cat => {
                    if (cat.CustomFields) {
                        let cfieldCodes = cat.CustomFields.map(c => c.Code);
                        const matches = customFieldsDefinitions.filter(x => cfieldCodes.includes(x.Code));
                        matches.length > 0 && matches.map(m => {
                            if (temp && temp.filter(t => t.Code == m.Code).length === 0) temp.push(m);
                        });
                    }
                });
                if (temp && itemDetails.CustomFields) {
                    const tempCodes = temp.map(t => t.Code);
                    const filteredCustomFieldDef = itemDetails.CustomFields.filter(cf => tempCodes.includes(cf.Code));
                    itemDetails.CustomFields = filteredCustomFieldDef;
                }
            }

            let shippingOptionsCombine = shippingOptions.concat(shippingOptionsMerchant);
            let deliversTo = {
                Name: pricingType == 'service_level' ? "Ships to: " : "Delivers to: ",
                Values: []
            };

            let isAllCountries = false;
            let itemShippingMethods = [];
            if (itemDetails && itemDetails.ShippingMethods) {
                itemShippingMethods = itemDetails.ShippingMethods;
            }
            if (shippingOptionsCombine && itemShippingMethods) {
                let splitCountries = [];
                for (let itemShippingMethod of itemShippingMethods) {
                    const shippingMethod = shippingOptionsCombine.find(p => p.ID === itemShippingMethod.ID);
                    if (shippingMethod && shippingMethod.CustomFields) {
                        const deliveryOption = shippingMethod.CustomFields.find(p => p.Name === 'DeliveryOptions');
                        if (deliveryOption) {
                            const deliveryOptionValue = JSON.parse(deliveryOption.Values);
                            if (deliveryOptionValue) {
                                if (deliveryOptionValue.IsAllCountries) {
                                    isAllCountries = true;
                                    break;
                                }
                                else if (deliveryOptionValue.Countries) {
                                    const countries = deliveryOptionValue.Countries.replace(/[\;]/gm, ',');
                                    const countryToSplit = countries.split(",");
                                    countryToSplit.map(function (country) {
                                        country = country.replace(/^\s+/g, '');
                                        if (!splitCountries.includes(country)) {
                                            splitCountries.push(country);
                                        }
                                    });
                                }
                                else if (deliveryOptionValue.Countries == '' && deliveryOptionValue.SelectedCountries && deliveryOptionValue.SelectedCountries.length > 0) {
                                    deliveryOptionValue.SelectedCountries.map(country => {
                                        if (!splitCountries.includes(country.Name)) {
                                            splitCountries.push(country.Name);
                                        }
                                    });
                                }
                            }
                        }
                    }
                }

                if (isAllCountries || EnumCoreModule.GetCountries().length === splitCountries.length) {
                    deliversTo.Values[0] = ['All'];
                } else {
                    splitCountries.sort();
                    splitCountries = splitCountries.join(", ");
                    deliversTo.Values[0] = splitCountries.length > 0 ? splitCountries
                        : itemShippingMethods.length > 0 ? itemShippingMethods[0].Description : '';
                }
            }

            if (deliversTo.Values.length > 0) {
                if (!itemDetails.CustomFields) {
                    itemDetails.CustomFields = [];
                }
                itemDetails.CustomFields.push(deliversTo);
            }
            //Pickup
            if (itemDetails && itemDetails.PickupAddresses) {
                let pickupData = {
                    Name: pricingType == 'service_level' ? "Pick-up Availability" : "Pickup Locations: ",
                    Values: []
                };
                itemDetails.PickupAddresses.forEach(function(dataPick) {
                    if (dataPick.Pickup === true) {
                        pickupData.Values.push(dataPick.Line1);
                    }
                });
                if (pickupData.Values.length == 0) {
                    pickupData.Values.push("No");
                }
                if (pickupData.Values.length > 0) {
                    if (!itemDetails.CustomFields) {
                        itemDetails.CustomFields = [];
                    }
                    itemDetails.CustomFields.push(pickupData);
                }
            }

            if (merchantDetails === null) {
                merchantDetails = itemDetails.MerchantDetail;
            }
            if (pricingType === 'country_level') {
                const locationVariantGroupId = req.LocationVariantGroupId;
                const userPreferredLocationId = req.UserPreferredLocationId;

                if (itemDetails.ChildItems && itemDetails.ChildItems.length > 0) {
                    itemDetails.ChildItems = itemDetails.ChildItems.filter((child) => {
                        if (child.Variants && child.Variants.length > 0) {
                            const hasUserLocationVariant = child.Variants.find(v => v.GroupID == locationVariantGroupId && v.ID == userPreferredLocationId) != null;

                            if (hasUserLocationVariant) {
                                return true;
                            }
                        }

                        return false;
                    });

                    if (itemDetails.ChildItems.length > 0) {
                        //remove location variant in variants array
                        itemDetails.ChildItems.map((child) => {
                            child.Variants = child.Variants.filter(v => v.GroupID != locationVariantGroupId || v.ID != userPreferredLocationId);
                        });
                    } else {
                        itemDetails.HasChildItems = false;
                    }
                } else {
                    return res.redirect('/'); 
                }
            }

            getUserPermissionsOnPage(currentUser, "Item Details", "Consumer", (permissions) => {
                console.log('view-consumer-item-details-api', permissions);
                let message = "";
                const store = Store.createItemDetailStore({
                    itemsReducer: {
                        items: itemDetails,
                        priceValues: priceValues,
                        customFieldsDefinitions: customFieldsDefinitions,
                        feedback: feedback,
                        ReviewAndRating: reviewAndRating,
                        message: message,
                        bookings: bookings
                    },
                    cartReducer: {},
                    userReducer: {
                        user: currentUser,
                        permissions: permissions,
                        comparisonWidgetPermissions: comparisonWidgetPermissions
                    },
                    merchantReducer: {
                        user: merchantDetails,
                        paymentTerms: paymentTerms
                    },
                    marketplaceReducer: {
                        ControlFlags: marketplaceInfo.ControlFlags
                    }
                });
                const reduxState = store.getState();
                const itemDetailApp = reactDom.renderToString(<ItemDetailComponent customFieldsDefinitions={customFieldsDefinitions}
                    itemDetails={itemDetails}
                    categories={[]}
                    merchantDetails={merchantDetails}
                    feedback={feedback}
                    message={message}
                    ControlFlags={marketplaceInfo.ControlFlags}
                    paymentTerms={paymentTerms}
                    priceValues={priceValues}
                    user={currentUser}
                    bookings={bookings}
                    ReviewAndRating={reviewAndRating}
                    comparisonWidgetPermissions={comparisonWidgetPermissions}
                    permissions={permissions} />);

                let seoTitle = 'Item Detail';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                res.send(template('page-item-detail', seoTitle, itemDetailApp, appString, reduxState));
            });            
        });
    });
});

itemRouter.post('/addCart', function (req, res) {

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
        quantity: req.body['quantity'],
        discount: req.body['discount'],
        itemId: req.body['itemId'],
        force: req.body['force'], 
        forComparison: req.body['forComparison']
    };

    if (process.env.PRICING_TYPE == 'service_level') {
        options.serviceBookingUnitGuid = req.body['serviceBookingUnitGuid'];
        options.bookingSlot = req.body['bookingSlot'] ? JSON.parse(req.body['bookingSlot']) : null;
        options.addOns = req.body['addOns'] ? JSON.parse(req.body['addOns']) : null;
    }

    var promiseCart = new Promise((resolve, reject) => {
        client.Carts.addCart(options, function (err, result) {
            if(err) {
                if (err.toString().includes('Insufficient stock')) {
                    reject({ Code: 'INSUFFICIENT_STOCK' });
                }

                if (err.toString().includes('Invalid service booking')) {
                    reject({ Code: 'INVALID_SERVICE_BOOKING' });
                }
            }
            else {
                resolve(result);
            }
        });
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        res.send(cart);
    },(err) => {
        res.send(err);
    });
});

itemRouter.put('/editCart', function (req, res) {
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
        userID: req.user.ID,
        cartID: req.body['cartItemId'],
        quantity: req.body['quantity'],
        discount: req.body['discount'],
        itemID: req.body[['itemId']],
        forComparison: req.body['forComparison'],
    };

    if (process.env.PRICING_TYPE == 'service_level') {
        options.serviceBookingUnitGuid = req.body['serviceBookingUnitGuid'];
        options.bookingSlot = req.body['bookingSlot'] ? JSON.parse(req.body['bookingSlot']) : null;
        options.addOns = req.body['addOns'] ? JSON.parse(req.body['addOns']) : null;
    }

    var promiseCart = new Promise((resolve, reject) => {
        client.Carts.editCart(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        res.send(cart);
    });
});

itemRouter.get('/getItemDetails', authenticated, function (req, res) {
    const itemId = req.query['itemId'];

    const promiseItem = new Promise((resolve, reject) => {
        const options = {
            itemId: itemId,
            activeOnly: true
        };

        client.Items.getItemDetails(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseItem]).then((responses) => {
        res.send(responses[0]);
    });
});

itemRouter.post('/addReplyFeedback', authenticated, function (req, res) {
    const merchantId = req.body['merchantId'];
    const feedbackId = req.body['feedbackId'];
    const message = req.body['message'];

    const promiseAddReplyFeedBack = new Promise((resolve, reject) => {
        const options = {
            merchantId: merchantId,
            feedbackId: feedbackId,
            message: message
        };

        client.Items.addReplyFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseAddReplyFeedBack]).then((responses) => {
        res.send(responses[0]);
    });
});


module.exports = itemRouter;