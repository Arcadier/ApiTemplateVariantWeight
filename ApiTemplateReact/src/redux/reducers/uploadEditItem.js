'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    itemModel: {
        categories: [],
        categoriesSelected: [],
        categoryWord: '',
        listingName: '',
        description: '',
        images: [],
        customFields: [],
        shippingModel: null,
        currencyCode: '',
        bulkPricing: [],
        shipping: [],
        moqCode: null,
        bulkPricingCode: null,
        countryCode: null,
        pricing: null,
        selectedVariant: null,
        ReviewAndRating: '',
        price: "",
        quantity: "",
        sku: "",
        isUnlimitedStock: false,
        hasVariants: false,
        variantGroups: [],
        itemVariants: [],
        savedItemVariants: [],
        selectedVariant: null,
        locationItems: [],
        locations: [],
        selectedLocationIds: [],
        savedChildItemIds: []
    }
};

function uploadEditItemReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.UPDATE_ITEM_UPLOAD_EDIT_CATEGORIES_TO_SEARCH: {
            return Object.assign({}, state, {
                itemModel: action.itemModel
            });
        }
        case actionTypes.ITEM_UPLOAD_EDIT_SELECT_UNSELECT_CATEGORY: {
            return Object.assign({}, state, {
                itemModel: action.itemModel
            });
        }
        case actionTypes.UPDATE_LISTING_NAME: {
            return Object.assign({}, state, {
                itemModel: action.itemModel
            });
        }
        case actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA: {
            return Object.assign({}, state, {
                itemModel: action.itemModel
            });
        }
        case actionTypes.ITEM_UPLOAD_EDIT_GET_CUSTOMFIELDS: {
            return Object.assign({}, state, {
                itemModel: action.itemModel
            });

        }
        case actionTypes.ITEM_UPLOAD_EDIT_MODAL_CHANGE: {
            return Object.assign({}, state, {
                itemModel: action.itemModel,
                modalStatus: action.modalStatus
            });
        }
        case actionTypes.CREATE_CUSTOM_FIELD: {
            return Object.assign({}, state, {
                itemModel: action.itemModel
            });
        }

        default:
            return state;
    }
}

module.exports = {
    uploadEditItemReducer: uploadEditItemReducer
};
