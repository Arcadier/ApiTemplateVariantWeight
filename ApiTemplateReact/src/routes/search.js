'use strict';
const express = require('express');
const searchRouter = express.Router();
const React = require('react');
const reactDom = require('react-dom/server');
const { Client } = require("@googlemaps/google-maps-services-js");
const Store = require('../redux/store');
const template = require('../views/layouts/template');
const SearchPage = require('../views/search/index').SearchComponent;
const client = require('../../sdk/client');
const authenticated = require('../scripts/shared/authenticated');
const ipstack = require('ipstack');
const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction, UNIQUE_CODE_LOGIC_CONSTANT } = require('../scripts/shared/user-permissions');

function geocode(address, callback) {
    const client = new Client({});

    client.geocode({
        params: {
            key: process.env.GOOGLE_MAP_API_KEY,
            address: address
        },
        timeout: 5000
    }).then((response) => {
        if (response && response.data) {
            const { status } = response.data

            if (status == 'OK') {
                const result = response.data.results[0];
                callback(null, result.geometry.location);
            } else if (status == 'ZERO_RESULTS') {
                callback(null, {
                    lat: 0,
                    lng: 0
                });
            } else {
                callback('geocode api error');
            }
        } else {
            callback('geocode response undefined');
        }
    }).catch((e) => {
        console.log(e);
        callback('exception error');
    });
}

function searchItems(options, serviceOptions, marketplaceInfo, callback) {
    if (process.env.PRICING_TYPE != 'service_level') {
        const promiseItems = new Promise((resolve, reject) => {
            client.Items.searchItems(options, (err, result) => {
                resolve(result);
            });
        });

        Promise.all([promiseItems]).then((responses) => {
            callback(responses[0]);
        });
    } else {
        if (process.env.SEARCH_TYPE == 'keyword')
            serviceOptions.location = null;

        if (process.env.SEARCH_TYPE == 'location')
            options.keywords = null;

        const promiseOwnerGeocode = new Promise((resolve, reject) => {
            if (options.categories || options.keywords || (serviceOptions.userLatitude && serviceOptions.userLongitude) || serviceOptions.location) {
                return resolve(null);
            }

            client.Addresses.getUserAddresses(marketplaceInfo.Owner.ID, (err, result) => {
                const ownerAddress = result.Records[0];

                let address = [];
                if (ownerAddress.Line1) {
                    address.push(ownerAddress.Line1);
                }
                if (ownerAddress.Line2) {
                    address.push(ownerAddress.Line2);
                }
                if (ownerAddress.City) {
                    address.push(ownerAddress.City);
                }
                if (ownerAddress.Country) {
                    address.push(ownerAddress.Country);
                }

                geocode(address.join(', '), (err, latLng) => {
                    if (!err) {
                        return resolve(latLng);
                    }

                    resolve(null);
                });
            });
        });

        const promiseLocationGeocode = new Promise((resolve, reject) => {
            if (options.categories || !serviceOptions.location) {
                return resolve(null);
            }

            geocode(serviceOptions.location, (err, latLng) => {
                if (!err) {
                    return resolve(latLng);
                }

                resolve(null);
            });
        });

        Promise.all([promiseOwnerGeocode, promiseLocationGeocode]).then((responses) => {
            const ownerGeocode = responses[0];
            const locationGeocode = responses[1];

            options.latitude = null;
            options.longitude = null;

            if (ownerGeocode) {
                options.latitude = ownerGeocode.lat;
                options.longitude = ownerGeocode.lng;
            } else if (locationGeocode) {
                options.latitude = locationGeocode.lat;
                options.longitude = locationGeocode.lng;
            } else if (!options.keywords && !options.categories) {
                options.latitude = serviceOptions.userLatitude;
                options.longitude = serviceOptions.userLongitude;
            }

            options.radius = process.env.SEARCH_RADIUS || 20000;
            options.location = serviceOptions.location;
            options.startDate = serviceOptions.startTimestamp;
            options.endDate = serviceOptions.endTimestamp;

            if (process.env.SEARCH_TYPE == 'keyword' || (!options.latitude || !options.longitude)) {
                options.radius = 20000;
            } else {
                if (process.env.SEARCH_UNIT == 'mi' && !serviceOptions.radius) {
                    options.radius = options.radius * 1.60934;
                }
            }

            const promiseItems = new Promise((resolve, reject) => {
                client.Items.searchItems(options, (err, result) => {
                    resolve(result);
                });
            });

            Promise.all([promiseItems]).then((responses) => {
                callback(responses[0]);
            });
        });
    }
}

searchRouter.get('/', [authenticated, isAuthorizedToAccessViewPage({ code: 'view-consumer-item-search-api' })], function (req, res) {
    
    if (req.isPrivateEnabled && !req.isPrivateSellerSignUp) {
        if (!req.user) {
            return res.redirect('/');
        }
    }

    function getSelectedCategory(categoryId, categories) {
        if (categories) {
            const category = categories.find(x => x.ID === categoryId);
            if (category) {
                return {
                    ID: category.ID,
                    Name: category.Name,
                    ParentID: category.ParentCategoryID,
                    ParentName: category.ParentCategoryID !== null
                        ? categories.find(x => x.ID === category.ParentCategoryID).Name
                        : null
                };
            }
        }

        return null;
    }

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function (err, categories) {
            resolve(categories);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'ControlFlags'
        };
        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCategories, promiseMarketplace]).then((responses) => {
        const allCategories = responses[0];
        const marketplaceInfo = responses[1];
        const categoryIDs = allCategories.map(c => c.ID);

        let breadcrumbText = '';
        let keywords = '';
        let categories = null;
        let location = '';
        let startTimestamp = '';
        let endTimestamp = '';
        let userLatitude = '';
        let userLongitude = '';
        let isAllDates = 'false';

        if (req.query['keywords']) {
            keywords = decodeURIComponent(req.query['keywords'].replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
            breadcrumbText = keywords;
        }

        if (req.query['categories']) {
            categories = [];
            categories.push(req.query['categories']);
        }

        if (process.env.PRICING_TYPE == 'service_level') {
            if (req.query['location']) {
                location = decodeURIComponent(req.query['location'].replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
            }

            if (req.query['startTimestamp'] && !isNaN(req.query['startTimestamp'])) {
                startTimestamp = parseInt(req.query['startTimestamp']);
            }

            if (req.query['endTimestamp'] && !isNaN(req.query['endTimestamp'])) {
                endTimestamp = parseInt(req.query['endTimestamp']);
            }

            if (req.query['userLatitude'] && !isNaN(req.query['userLatitude'])) {
                userLatitude = parseFloat(req.query['userLatitude']);
            }

            if (req.query['userLongitude'] && !isNaN(req.query['userLongitude'])) {
                userLongitude = parseFloat(req.query['userLongitude']);
            }

            if (req.query['isAllDates'] && req.query['isAllDates'].toLowerCase() == 'true') {
                isAllDates = 'true';
            }
        }

        const isGuestUser = req.user == null || typeof req.user == 'undefined';
        const locationVariantGroupId = req.LocationVariantGroupId;
        const userPreferredLocationId = req.UserPreferredLocationId;
        const isPrivateAndSellerRestricted = req.isPrivateEnabled && req.isSellerVisibilityRestricted;
        const sellerId = !isGuestUser && isPrivateAndSellerRestricted && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) ? req.user.ID : null;

        let promiseCategoriesWithCustomFields = null;
        let promiseAllCategoriesWithCustomFields = null;

        const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
            client.CustomFields.getDefinitions("Items", function (err, details) {
                resolve(details);
            });
        });

        if (categories != null) {
            promiseCategoriesWithCustomFields = new Promise((resolve, reject) => {
                client.Categories.getCategoriesByIds(categories, function (err, categories) {
                    resolve(categories);
                });
            });
        } else {
            promiseAllCategoriesWithCustomFields = new Promise((resolve, reject) => {
                client.Categories.getCategoriesByIds(categoryIDs, function (err, categories) {
                    resolve(categories);
                });
            });
        }

        const sort = process.env.PRICING_TYPE != 'service_level' ? 'item_desc' : 'nearest';

        const options = {
            categories: categories,
            keywords: keywords,
            minimumPrice: null,
            maximumPrice: null,
            pageNumber: 1,
            pageSize: 20,
            sellerId: sellerId,
            sort: sort,
            tags: [],
            withChildItems: true,
            variantGroupId: locationVariantGroupId,
            variantId: userPreferredLocationId,
        };

        const serviceOptions = {
            location: location,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            userLatitude: userLatitude,
            userLongitude: userLongitude,
            isAllDates: isAllDates
        };

        searchItems(options, serviceOptions, marketplaceInfo, (items) => {
            Promise.all([promiseCustomFieldDefinitions, promiseCategoriesWithCustomFields, promiseAllCategoriesWithCustomFields]).then((responses) => {
                const appString = 'item-search';
                //const items = responses[0];
                const customFieldDefinitions = responses[0];
                const categoryCustomFields = responses[1];
                const allCategoryCustomFields = responses[2];
                const reviewAndRating = marketplaceInfo.ControlFlags.ReviewAndRating;

                let listCustomFields = [];
                let selectedCategories = null;
                if (categories != null) {
                    const category = getSelectedCategory(categories[0], allCategories);
                    if (category) {
                        selectedCategories = [];
                        selectedCategories.push(category);
                        breadcrumbText = breadcrumbText == "" ? category.Name : breadcrumbText;
                    }
                }

                if (customFieldDefinitions && categoryCustomFields) {
                    if (customFieldDefinitions.Records) {
                        Array.from(customFieldDefinitions.Records).map(function (customField, index) {
                            if (customField.DataFieldType === 'list') {
                                let categoryCustomField = {};
                                if (categoryCustomFields.length > 0 && categoryCustomFields[0].CustomFields) {
                                    categoryCustomField = categoryCustomFields[0].CustomFields.find(c => c.Code === customField.Code);
                                }

                                if (categoryCustomField) {
                                    listCustomFields.push(customField);
                                }
                            }
                        });
                    }
                }
                //all categories selected
                if (categories == null && categoryCustomFields == null && customFieldDefinitions && allCategoryCustomFields) {
                    if (customFieldDefinitions.Records) {
                        customFieldDefinitions.Records.map(customFieldDefinition => {
                            for (var category of allCategoryCustomFields) {
                                if (customFieldDefinition.DataFieldType === 'list' && !listCustomFields.find(c => c.Code == customFieldDefinition.Code)) {
                                    listCustomFields.push(customFieldDefinition);
                                }
                            }
                        });
                    }
                }

                const priceRange = items && items.Meta && items.Meta.PriceRange ? items.Meta.PriceRange : null;
                const itemRecords = items && items.Records ? items.Records : [];
                const totalRecords = items && items.TotalRecords ? items.TotalRecords : 0;

                const userReducer = {
                    user: req.user,
                    userPreferredLocationId: userPreferredLocationId
                };

                const categoryReducer = {
                    categories: allCategories
                };

                const searchReducer = {
                    breadcrumbText: breadcrumbText,
                    selectedCategories: selectedCategories,
                    currencyCode: req.CurrencyCode || process.env.DEFAULT_CURRENCY,
                    customFilters: listCustomFields,
                    items: itemRecords,
                    keywords: keywords,
                    tags: [],
                    withChildItems: true,
                    totalRecords: totalRecords,
                    pageSize: 20,
                    pageNumber: 1,
                    sort: sort,
                    minimumPrice: null,
                    maximumPrice: null,
                    resultDisplayBehavior: 'list',
                    priceRange: priceRange,
                    reviewAndRating: reviewAndRating,
                };

                if (process.env.PRICING_TYPE == 'service_level') {
                    Object.assign(searchReducer, serviceOptions);
                }

                const s = Store.createSearchStore({
                    userReducer,
                    categoryReducer,
                    searchReducer
                });

                let seoTitle = 'Search';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const reduxState = s.getState();
                const searchPageApp = reactDom.renderToString(<SearchPage {...userReducer} {...categoryReducer} {...searchReducer} />);

                res.send(template('page-search', seoTitle, searchPageApp, appString, reduxState));
            });
        });
    });
});

searchRouter.get('/items/ajax', authenticated, function (req, res) {
    const isGuestUser = req.user == null || typeof req.user == 'undefined';
    const isPrivateAndSellerRestricted = req.isPrivateEnabled && req.isSellerVisibilityRestricted;
    const sellerId = !isGuestUser && isPrivateAndSellerRestricted && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) ? req.user.ID : null;
    const customFilterValues = req.query['customValues'];
    const customFilterMap = new Map();
    const customValues = [];
    customFilterValues && customFilterValues.map(customFilter => {
        const { code, value } = customFilter;
        const temp = customFilterMap.get(code);
        if (!temp) customFilterMap.set(code, [value]);
        else customFilterMap.set(code, [...temp, value]);
        customValues.push(value);
    });

    const locationVariantGroupId = req.LocationVariantGroupId;
    const userPreferredLocationId = req.UserPreferredLocationId;

    let location = '';
    let startTimestamp = '';
    let endTimestamp = '';
    let userLatitude = '';
    let userLongitude = '';
    let isAllDates = 'false';

    if (process.env.PRICING_TYPE == 'service_level') {
        if (req.query['location']) {
            location = decodeURIComponent(req.query['location'].replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
        }

        if (req.query['startTimestamp'] && !isNaN(req.query['startTimestamp'])) {
            startTimestamp = parseInt(req.query['startTimestamp']);
        }

        if (req.query['endTimestamp'] && !isNaN(req.query['endTimestamp'])) {
            endTimestamp = parseInt(req.query['endTimestamp']);
        }

        if (req.query['userLatitude'] && !isNaN(req.query['userLatitude'])) {
            userLatitude = parseFloat(req.query['userLatitude']);
        }

        if (req.query['userLongitude'] && !isNaN(req.query['userLongitude'])) {
            userLongitude = parseFloat(req.query['userLongitude']);
        }

        if (req.query['isAllDates'] && req.query['isAllDates'].toLowerCase() == 'true') {
            isAllDates = 'true';
        }
    }

    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        if (process.env.PRICING_TYPE != 'service_level') {
            return resolve(null);
        }

        client.Marketplaces.getMarketplaceInfo(null, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMarketplaceInfo]).then((responses) => {
        const marketplaceInfo = responses[0];

        const options = {
            pageSize: req.query['pageSize'],
            pageNumber: req.query['pageNumber'],
            tags: [],
            withChildItems: req.query['withChildItems'],
            sort: req.query['sort'],
            keywords: req.query['keywords'],
            minimumPrice: req.query['minPrice'],
            maximumPrice: req.query['maxPrice'],
            categories: req.query['categories'],
            customValues: customValues,
            sellerId: sellerId,
            variantGroupId: locationVariantGroupId,
            variantId: userPreferredLocationId
        };

        const serviceOptions = {
            location: location,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            userLatitude: userLatitude,
            userLongitude: userLongitude,
            isAllDates: isAllDates
        };

        searchItems(options, serviceOptions, marketplaceInfo, (items) => {
            // filter items based on custom filters
            const filteredItems = [];

            if (items && items.Records && items.Records.length > 0 && customFilterValues) {
                items.Records.map(item => {
                    const { CustomFields } = item;
                    const trueCount = customFilterMap.size;
                    let matchedField = null
                    let result = 0;

                    if (CustomFields && CustomFields.length > 0) {
                        for (let code of customFilterMap.keys()) {
                            matchedField = CustomFields.find(c => c.Code === code);
                            const fieldValues = customFilterMap.get(code);
                            if (fieldValues && fieldValues.length > 0) {
                                let includeItem = false;
                                fieldValues.map(val => {
                                    if (matchedField && matchedField.Values.includes(val)) includeItem = true;
                                });
                                if (includeItem == true) result += 1;
                            }
                        }

                        if (result === trueCount) filteredItems.push(item);
                        // for (var cfield of customFilterValues) {
                        //     const { code, value } = cfield;
                        //     matchedField = CustomFields.find(c => c.Code === code);
                        //     if (matchedField && !matchedField.Values.includes(value)) includeItem = false;
                        // }
                        // if (matchedField && includeItem == true) filteredItems.push(item);
                    }

                });

                items.Records = filteredItems;
                items.TotalRecords = filteredItems.length;
            }
            if (items == null) {
                return res.send({
                    Records: [],
                    TotalRecords: 0,
                    PageSize: parseInt(req.query['pageSize']),
                    pageNumber: parseInt(req.query['pageNumber']),
                    Meta: { PriceRange: { Minimum: parseInt(req.query['minPrice']) || 0, Maximum: parseInt(req.query['maxPrice']) || 0 } }
                });
            }

            return res.send(items)
        });
    });
});

searchRouter.get('/items/custom-fields', authenticated, function (req, res) {
    const categoryIds = req.query['categoryIds'];
    const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Items", function (err, details) {
            resolve(details);
        });
    });

    const promiseCategoriesWithCustomFields = new Promise((resolve, reject) => {
        client.Categories.getCategoriesByIds(categoryIds, function (err, categories) {
            resolve(categories);
        });
    });

    Promise.all([promiseCustomFieldDefinitions, promiseCategoriesWithCustomFields]).then((responses) => {
        const definitions = responses[0];
        let categoryCustomFields = responses[1];
        let listCustomFields = [];
        if ((definitions && definitions.Records && definitions.Records.length > 0) && (categoryCustomFields && categoryCustomFields.length > 0)) {
            Array.from(definitions.Records).map(function (customField, index) {
                if (customField.DataFieldType === 'list') {
                    if (categoryCustomFields[0].CustomFields && categoryCustomFields[0].CustomFields.length > 0) {
                        const categoryCustomField = categoryCustomFields[0].CustomFields.find(c => c.Code === customField.Code);
                        if (categoryCustomField && customField.IsComparable) {
                            listCustomFields.push(customField);
                        }
                    }
                }
            });
        }

        res.send(listCustomFields);
    });
});

searchRouter.get('/geocode', authenticated, function (req, res) {
    const { address } = req.query;

    geocode(address, (err, latLng) => {
        if (!err) {
            res.send(latLng);
        }
    });
});

searchRouter.get('/google-places', authenticated, function (req, res) {
    const { keyword } = req.query;

    if (!keyword || !process.env.GOOGLE_PLACE_API_KEY) {
        return res.send('');
    }

    const client = new Client([]);

    client.placeAutocomplete({
        params: {
            key: process.env.GOOGLE_PLACE_API_KEY,
            input: keyword,
            types: '(regions)'
        },
        timeout: 5000
    }).then((response) => {
        if (response && response.data) {
            const { status } = response.data;

            if (status == 'OK') {
                const { predictions } = response.data;
                const descriptions = predictions.map((p) => p.description);

                return res.send(descriptions);
            }
        }

        res.send([]);
    }).catch((e) => {
        console.log(e);
        res.send([]);
    });
});

searchRouter.get('/ip-geocode', authenticated, function (req, res) {
    let ipAddress = (req.headers && (req.headers['x-forwarded-for'] || '').split(',').pop()) ||
        (req.connection && req.connection.remoteAddress) ||
        (req.socket && req.socket.remoteAddress) ||
        (req.connection && req.connection.socket && req.connection.socket.remoteAddress) ||
        req.ip;

    // for local testing only, please remove
    ipAddress = '13.76.218.54';

    if (!process.env.IPSTACK_API_ACCESS_KEY || !ipAddress || ipAddress.endsWith('127.0.0.1')) {
        return res.send({
            lat: 0,
            lng: 0
        });
    }

    ipstack(ipAddress, process.env.IPSTACK_API_ACCESS_KEY, (err, response) => {
        if (!err) {
            return res.send({
                lat: response.latitude,
                lng: response.longitude
            });
        }

        res.send({
            lat: 0,
            lng: 0
        });
    });
});

searchRouter.get('/suggested-items', authenticated, function (req, res) {
    let { userLatitude, userLongitude } = req.query;

    const isGuestUser = req.user == null || typeof req.user == 'undefined';
    const isPrivateAndSellerRestricted = req.isPrivateEnabled && req.isSellerVisibilityRestricted;
    const sellerId = !isGuestUser && isPrivateAndSellerRestricted && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) ? req.user.ID : null;
    const pageSize = 8;
    const pageNumber = 1;

    function getIpGeocode(callback) {
        if (!userLatitude || !userLongitude) {
            let ipAddress = (req.headers && (req.headers['x-forwarded-for'] || '').split(',').pop()) ||
                (req.connection && req.connection.remoteAddress) ||
                (req.socket && req.socket.remoteAddress) ||
                (req.connection && req.connection.socket && req.connection.socket.remoteAddress) ||
                req.ip;

            //for local testing only, please remove
            //ipAddress = '13.76.218.54';

            if (!process.env.IPSTACK_API_ACCESS_KEY || !ipAddress || ipAddress.endsWith('127.0.0.1')) {
                return callback({
                    lat: null,
                    lng: null
                });
            }

            ipstack(ipAddress, process.env.IPSTACK_API_ACCESS_KEY, (err, response) => {
                if (!err) {
                    return callback({
                        lat: response.latitude,
                        lng: response.longitude
                    });
                }

                callback({
                    lat: null,
                    lng: null
                });
            });
        } else {
            callback({
                lat: userLatitude,
                lng: userLongitude
            });
        }
    }

    function promiseItemsWithinGeocode(geocode) {
        return new Promise((resolve, reject) => {
            if (geocode.lat == null || geocode.lng == null) {
                return resolve(null);
            }

            const options = {
                pageSize: pageSize,
                pageNumber: pageNumber,
                sellerId: sellerId,
                withChildItems: false,
                sort: 'nearest',
                latitude: geocode.lat,
                longitude: geocode.lng,
                radius: 100
            };

            client.Items.searchItems(options, (err, result) => {
                resolve(result);
            });
        });
    }

    function promiseLatestItemsSold() {
        return new Promise((resolve, reject) => {
            const options = {
                pageSize: pageSize,
                pageNumber: pageNumber,
                sellerId: sellerId,
                withChildItems: false,
                sort: 'item_sold_desc',
                minimumQuantity: 1
            };

            client.Items.searchItems(options, (err, result) => {
                resolve(result);
            });
        });
    }

    function promiseLatestUploadedItems() {
        return new Promise((resolve, reject) => {
            const options = {
                pageSize: pageSize,
                pageNumber: pageNumber,
                sellerId: sellerId,
                withChildItems: false,
                sort: 'item_desc',
                minimumQuantity: 1
            };

            client.Items.searchItems(options, (err, result) => {
                resolve(result);
            });
        });
    }

    if (process.env.PRICING_TYPE != 'service_level')
        return res.send(null);

    getIpGeocode((geocode) => {
        promiseItemsWithinGeocode(geocode).then((response) => {
            if (response && response.TotalRecords >= 8) {
                return res.send(response);
            } else {
                promiseLatestItemsSold().then((response) => {
                    if (response && response.TotalRecords >= 8 && false) {
                        return res.send(response);
                    } else {
                        promiseLatestUploadedItems().then((response) => {
                            return res.send(response);
                        });
                    }
                });
            }
        });
    });
});

module.exports = searchRouter;