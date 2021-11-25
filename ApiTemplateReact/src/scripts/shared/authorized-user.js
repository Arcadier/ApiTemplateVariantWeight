'use strict';

module.exports = function isAuthorizedUser(req, res, next) {
    if (req.user) {
        return next();
    }

    //return res.redirect('/accounts/sign-in?returnUrl=' + req.originalUrl.substring(1));
    return res.redirect('/accounts/sign-in');
};
