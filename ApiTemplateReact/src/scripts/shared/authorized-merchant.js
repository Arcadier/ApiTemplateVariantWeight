'use strict';


module.exports = function isAuthorizedMerchant(req, res, next) {
    if (req.user && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant'))) {
        return next();
    }

    return res.redirect('/');
};
