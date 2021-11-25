'use strict';
var express = require('express');
var marketplaceRouter = express.Router();

var client = require('../../sdk/client');

marketplaceRouter.get('/getInfo', function (req, res) {
    var promiseMarketplace = new Promise((resolve, reject) => {
        var options = {
            includes: "ControlFlags"
        };
        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMarketplace]).then((responses) => {
        const result = responses[0];

        let isMerchantSubAccountEnabled = null;
        let isPrivateEnabled = null;
        let isMerchantRestrictedOnly = null;
        try {
            if (typeof result.Settings['merchant-sub-account']['merchant-sub-account-area'] != 'undefined') {
                var temp = result.Settings['merchant-sub-account']['merchant-sub-account-area'];
                isMerchantSubAccountEnabled = temp.enabled == 'True' || temp.enabled == 'true' ? true : false
            }
        } catch (err) { }

        try {
            if (typeof result.Settings['private-settings']['private-settings-area'] != 'undefined') {
                isPrivateEnabled = result.Settings['private-settings']['private-settings-area'].enabled.toLowerCase() == 'true' || result.Settings['private-settings']['private-settings-area'].enabled == 'true' ? true : false;
                isMerchantRestrictedOnly = isPrivateEnabled && result.Settings && result.Settings['private-settings']['private-settings-area']['mode'] === '0';
            }
        } catch (err) { }

        let googleAnalytics = null
        try {
            if (result && typeof result.Settings['analytics'] != 'undefined' &&
                typeof result.Settings['analytics']['google-analytics'] != 'undefined' &&
                result.Settings['analytics'] &&
                result.Settings['analytics']['google-analytics']) {
                googleAnalytics = result.Settings['analytics']['google-analytics'];
            }
        } catch (err) { }

        let favIconData = '';
        if (result.Settings &&
            result.Settings["themes"] &&
            result.Settings["themes"]["theme-1"] &&
            result.Settings["themes"]["theme-1"]["favicon"]) {
            favIconData = result.Settings["themes"]["theme-1"]["favicon"];
        }

        let locationVariantGroupId = null;
        if (process.env.PRICING_TYPE == 'country_level') {
            if (result.CustomFields) {
                const customField = result.CustomFields.find(c => c.Code.startsWith('locationid'));

                if (customField && customField.Values.length > 0) {
                    locationVariantGroupId = customField.Values[0];
                }
            }
        }

        let marketplaceInfo = {
            Name: result.Name,
            SeoTitle: result.SeoTitle,
            LogoUrl: result.LogoUrl,
            Languages: result.Languages,
            HomepageUrl: result.HomepageUrl,
            MerchantSubAccountEnabled: isMerchantSubAccountEnabled,
            IsMerchantRestrictedOnly: isMerchantRestrictedOnly,
            CustomFields: result.CustomFields,
            IsPrivateEnabled: isPrivateEnabled,
            GoogleAnalytics: googleAnalytics,
            FavIconData: favIconData,
            ControlFlags: result.ControlFlags,
            LocationVariantGroupId: locationVariantGroupId
        };
       
        res.send(marketplaceInfo);
    });
});

module.exports = marketplaceRouter;         