'use strict';

module.exports = function isOnboardedMerchant(req, res, next) {
    const user = req.user;
    if (user && (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant'))) {
        if (user.Roles.includes('Merchant') && user.Onboarded == false) {
            if (req.originalUrl.indexOf('/merchants/settings') < 0) {
                return res.redirect('/merchants/settings?error=incomplete-onboarding');
            }
        }
    }

    return next();
};
