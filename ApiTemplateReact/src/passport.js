'use strict';
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var CookieStrategy = require('passport-cookie');
var LocalStrategy = require('passport-local');
var CustomStrategy = require('passport-custom').Strategy;

var client = require('../sdk/client');

passport.use('auth_code', new CustomStrategy(
    function (req, done) {
        const code = req.query.code;
        const isSeller = req.query.isSeller;
        const hostname = req.protocol + '://' + req.get('host');
        let redirectUrl = hostname + '/accounts/api-token';
        if (isSeller && isSeller.toLowerCase() == 'true') {
            redirectUrl += '?isSeller=' + isSeller;
        }
        client.exchangeAuthorizationCode(code, redirectUrl, function (err, token) {
            if (err) {
                done(err);
            } else {
                client.Users.getCurrentUser(token.access_token, function (err, user) {
                    if (err) {
                        done(err);
                    } else if (!user) {
                        done(null, false);
                    } else if ((!user.Enabled || !user.Visible)) {
                        done(null, false);
                    } else {
                        req.token = token;
                        done(null, user);
                    }
                });
            }
        });
    }
));

passport.use('user_impersonation_code', new CustomStrategy(
    function (req, done) {
        const code = req.query.code;
        client.exchangeImpersonationCode(code, function (err, token) {
            if (err) {
                done(err);
            } else {
                client.Users.getCurrentUser(token.access_token, function (err, user) {
                    if (err) {
                        done(err);
                    } else if (!user) {
                        done(null, false);
                    } else if ((!user.Enabled || !user.Visible)) {
                        done(null, false);
                    } else {
                        req.token = token;
                        done(null, user);
                    }
                });
            }
        });
    }
));

passport.use('login', new LocalStrategy({
    passReqToCallback: true
},
    function (req, username, password, done) {
        client.Accounts.loginWithUsernameAndPassword(username, password, function (err, token) {

            if (err) {
                // done(err);
                 //3-15-2021/ we needed to set the err passed by the api so that we can get the  actual response error for displaying
                if (err.message && err.message.indexOf('Sub account login is disabled by admin') > 0) {
                    done(null, false, err);
                }
                else{
                    done(null, false); //prevent interpreting invalid login credentials as exception error
                }
            } else {
                client.Users.getCurrentUser(token.access_token, function (err, user) {

                    if (err) {
                        done(err);
                    } else if (!user) {
                        done(null, false);
                    } else if ((!user.Enabled || !user.Visible)) {
                        done(null, false);
                    } else {
                        req.token = token;
                        done(null, user);
                    }
                });
            }
        });
    }
));

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
},
    function (req, username, password, done) {
        const findOrCreateUser = function () {
            const options = {
                firstName: req.body['firstName'],
                lastName: req.body['lastName'],
                username: username,
                password: password,
                confirmPassword: req.body['confirmPassword'],
                email: req.body['email'],
                token: req.body['token'],
                IsSeller: req.body['isSeller']
            };

            client.Accounts.registerWithUsernameAndPassword(options, function (err, token) {
                if (err) {
                    done(err);
                } else {
                    client.Users.getCurrentUser(token.access_token, function (err, user) {
                        if (err) {
                            done(err);
                        } else if (!user) {
                            done(null, false);
                        } else {
                            done(null, user, token);
                        }
                    });
                }
            });
        };

        // Delay the execution of findOrCreateUser and execute
        // the method in the next tick of the event loop
        process.nextTick(findOrCreateUser);
    })
);

passport.use(new CookieStrategy({
    cookieName: 'webapitoken',
    signed: false,
    passReqToCallback: true
}, function (req, token, done) {
    client.Users.getCurrentUser(token, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    });
}));

passport.use(new BearerStrategy(
    function (token, done) {
        client.Users.getCurrentUser(token, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    if (user) {
        if (user.Media && user.Media.length > 0) {
            user.Media = [user.Media.pop()];
        }

        if (user.Roles && user.Roles.includes('Submerchant')) {
            if (user.AccountOwnerID && user.ID != user.AccountOwnerID) {
                user.SubmerchantID = user.ID;
                user.ID = user.AccountOwnerID;
            }
        }

        if (user.Roles && user.Roles.includes('User')) {
            if (user.AccountOwnerID && user.ID != user.AccountOwnerID) {
                user.SubBuyerID = user.ID;
                user.ID = user.AccountOwnerID;
            }
        }

        //let serializedUser = {
        //    Description: user.Description
        //};
        if (user.Description && user.Description.length > 800) {
            user.Description = user.Description.substring(0, 800);
        }        
        if (user.CustomFields && user.CustomFields.length > 0) {
            user.CustomFields = user.CustomFields.filter(r => r.Name === 'user_seller_location' || r.Name === 'user_preferred_location');
            //serializedUser.CustomFields = user.CustomFields.filter(r => r.Name !== 'user_seller_location' || r.Name !== 'user_preferred_location');
        }      
        //console.log('passport', user);
        //if (localStorage.getItem("serializedUser")) {
        //    localStorage.removeItem("serializedUser");
        //}
        //localStorage.setItem("serializedUser", JSON.stringify(serializedUser));
    }

    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});