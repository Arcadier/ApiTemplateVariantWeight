'use strict';
var passport = require('passport');
var client = require('../../../sdk/client');

module.exports = function isAuthenticated(req, res, next) {
    function getLocationVariantGroup(marketplaceCustomFields) {
        if (process.env.PRICING_TYPE == 'country_level') {
            if (marketplaceCustomFields) {
                const customField = marketplaceCustomFields.find(c => c.Code.startsWith('locationid'));

                if (customField && customField.Values.length > 0) {
                    return customField.Values[0];
                }
            }
        }

        return null;
    }

    function getUserPreferredLocationId(userCustomFields) {
        if (process.env.PRICING_TYPE == 'country_level') {
            if (userCustomFields) {
                const customField = userCustomFields.find(c => c.Code.startsWith('user_preferred_location'));

                if (customField && customField.Values.length > 0) {
                    return customField.Values[0];
                }
            }
        }

        return null;
    }

    const isBespoke = process.env.TEMPLATE === 'bespoke';
    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, function (err, result) {
            if (!err) {
                const { SeoTitle, CustomFields, Name, Settings, CurrencyCode, LogoUrl } = result;
                resolve({
                    SeoTitle,
                    CustomFields,
                    Name,
                    CurrencyCode,
                    LogoUrl,
                    isPrivateEnabled: Settings != null && Settings['private-settings']['private-settings-area'].enabled === 'true',
                    isSellerVisibilityRestricted: Settings != null && Settings['private-settings']['private-settings-area']['restrict-seller-visibility'] === 'true',
                    isPrivateSellerSignUp: Settings != null && Settings['private-settings']['private-settings-area']['mode'] === '0',
                });
            }
        });
    });

    Promise.all([promiseMarketplaceInfo]).then(info => {
        const { SeoTitle, CustomFields, Name, isPrivateEnabled, CurrencyCode, isSellerVisibilityRestricted, LogoUrl, isPrivateSellerSignUp } = info[0];
        req.SeoTitle = SeoTitle;
        req.CustomFields = CustomFields;
        req.Name = Name;
        req.CurrencyCode = CurrencyCode;
        req.LogoUrl = LogoUrl;
        req.isPrivateEnabled = isPrivateEnabled;
        req.isSellerVisibilityRestricted = isSellerVisibilityRestricted;
        req.isPrivateSellerSignUp = isPrivateSellerSignUp;
        req.LocationVariantGroupId = getLocationVariantGroup(CustomFields);
        req.UserPreferredLocationId = null;

        if (req.user) {
            req.UserPreferredLocationId = getUserPreferredLocationId(req.user.CustomFields);
            return next();
        } else {
            const { isPrivateEnabled } = req;
            const trillia = isPrivateEnabled && !isBespoke;
            const privateBespoke = isPrivateEnabled && isBespoke;
            if (trillia || privateBespoke) {
                passport.authenticate('cookie',
                    { session: false, failureRedirect: '/accounts/sign-in', failureFlash: 'Invalid username or password.' },
                    function (err, user, info) {
                        if (err) {
                            return next(err);
                        }
                        if (!user) {
                            if (req.query["channelId"]) {
                                const chatChannelId = "?chatChannelId=" + req.query["channelId"];
                                return res.redirect('/accounts/sign-in' + chatChannelId);
                            }

                            if (isPrivateEnabled == 'true' || isPrivateEnabled == true) {
                                if (!isPrivateSellerSignUp) {
                                    const error = req.query.error != null && req.query.error === 'invalid-login' ? '?error=invalid-login' : "";
                                    return res.redirect('/accounts/sign-in' + error);
                                }
                            }

                            return next();
                        }

                        req.UserPreferredLocationId = getUserPreferredLocationId(user.CustomFields);

                        req.logIn(user,
                            function (err) {
                                if (err) {
                                    return next(err);
                                }
                                return next();
                            }
                        );
                    }
                )(req, res, next);
            } else return next();
        }
    });
};