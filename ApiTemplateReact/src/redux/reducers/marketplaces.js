'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    name: '',
    seoTitle: '',
    logoUrl: '',
    languages: [],
    homepageUrl: '',
    merchantSubAccountActive: false,
    googleAnalytics: null,
    isPrivateEnabled: true,
    ControlFlags: {},
    isMerchantRestrictedOnly: false,
    locationVariantGroupId: null
};

function marketplaceReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_MARKETPLACE_INFO: {

            return Object.assign({}, state, {
                name: action.name,
                seoTitle: action.seoTitle,
                logoUrl: action.logoUrl,
                languages: action.languages,
                homepageUrl: action.homepageUrl,
                merchantSubAccountActive: action.merchantSubAccountActive,
                customFields: action.customFields,
                googleAnalytics: action.googleAnalytics,
                favIconData: action.favIconData,
                chatChannelId: action.chatChannelId,
                isPrivateEnabled: action.isPrivateEnabled,
                ControlFlags: action.ControlFlags,
                isMerchantRestrictedOnly: action.isMerchantRestrictedOnly,
                locationVariantGroupId: action.locationVariantGroupId
            });
        }
        default:
            return state
    }
};

module.exports = {
    marketplaceReducer: marketplaceReducer
}