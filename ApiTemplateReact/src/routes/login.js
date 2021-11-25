'use strict';
var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var React = require('react');
var useragent = require('express-useragent');
router.use(useragent.express());
var ipstack = require('ipstack');

var reactDom = require('react-dom/server');
var Store = require('../redux/store');
var template = require('../views/layouts/template');

var LandingPage = require('../views/login/landing').LandingComponent;
var LoginPage = require('../views/login/login');
var passport = require('passport');
var BuyerSignUpPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/buyer-sign-up').BuyerSignUpComponent;
var SellerSignUpPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/seller-sign-up').SellerSignUpComponent;

var ForgotPasswordPage = require('../views/login/forgot-password').ForgotPasswordComponent;
var ResetPasswordPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/reset-password').ResetPasswordComponent;
var ChangePasswordPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/change-password').ChangePasswordComponent;
var RegisterInterestPage = require('../views/extensions/bespoke/login/register-interest').RegisterInterestComponent;

var client = require('../../sdk/client');
var EnumCoreModule = require('../public/js/enum-core');
var authenticated = require('../scripts/shared/authenticated');
var authorizedUser = require('../scripts/shared/authorized-user');

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage } = require('../scripts/shared/user-permissions');

function setApiToken(res, token, expiry) {
    var maxAge = expiry * 1000;
    res.cookie('webapitoken', token, { maxAge: maxAge, httpOnly: false });
}

function getHostname(req) {
    var fullUrl = req.protocol + '://' + req.get('host');
    return fullUrl;
}

function buildExternalLoginUrl(hostname, provider, clientId = '', token = '', chatChannelId = '', isSeller = '') {
    let url = process.env.PROTOCOL + '://' + process.env.OAUTH_URL + '/oauth2/authorize?response_type=code';
    url += '&client_id=' + (clientId ? clientId : process.env.CLIENT_ID);
    url += '&provider=' + provider;
    let urlRedirect = '/accounts/api-token';
    if (chatChannelId.length > 1) {
        urlRedirect = '/accounts/api-token?chatChannelId=' + chatChannelId;
    }
    if (isSeller && isSeller.toLowerCase() == 'true') {
        urlRedirect += (urlRedirect.indexOf('?') > -1 ? '&' : '?') + 'isSeller=true';
    }
    if (!hostname) {
        hostname = 'http://www.example.com';
    }
    url += '&redirect_uri=' + hostname + urlRedirect;
    if (token) {
        url += '&token=' + token;
    }
    return url;
}

function getMarketplaceInfo(withBusinessProfile = false, withOpenIdProviders = false) {
    return new Promise((resolve, reject) => {
        let options = null;
        let includes = [];

        if (withBusinessProfile) {
            includes.push('BusinessProfile');
        }
        if (withOpenIdProviders) {
            includes.push('OpenIdProviders');
        }

        if (includes.length > 0) {
            options = {
                includes: includes.join()
            }
        }

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            if (result && result.OpenIdProviders) {
                result.OpenIdProviders.forEach(function (provider) {
                    provider.ClientSecret = null;
                });
            }
            resolve(result);
        });
    });
}

function logLoginActivity(req, res, loginActivityId, alternateId, callback) {
    const cookieName = 'arcticktrack';
    const cookie = getActivityCookie(res, req, loginActivityId, alternateId);

    function getActivityCookie(res, req, loginActivityId, alternateId) {
        const cookie = req.cookies[cookieName];

        if (cookie) {
            return cookie;
        }
        else {
            const value = {
                loginActivityId: loginActivityId || 0,
                alternateId: alternateId || Math.random().toString(36).substr(2, 10)
            };

            res.cookie(cookieName, value, {
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                httpOnly: true
            });

            return value;
        }

        return null;
    }

    const promiseUserLocation = new Promise((resolve, reject) => {
        const excluded = ['sign-out', 'change-password'];
        let isGetUserLocation = true;

        excluded.forEach((url) => {
            if (req.originalUrl.endsWith(url)) {
                isGetUserLocation = false;
            }
        });

        if (isGetUserLocation) {
            const ipAddress = (req.headers && (req.headers['x-forwarded-for'] || '').split(',').pop()) ||
                (req.connection && req.connection.remoteAddress) ||
                (req.socket && req.socket.remoteAddress) ||
                (req.connection && req.connection.socket && req.connection.socket.remoteAddress) ||
                req.ip;

            if (ipAddress && !ipAddress.endsWith('127.0.0.1')) {
                ipstack(ipAddress, process.env.IPSTACK_API_ACCESS_KEY, (err, response) => {
                    if (!err) {
                        const location = `ip:${response.ip || ''}, city:${response.city || ''}, country:${response.country_name || ''}`;
                        return resolve(location);
                    }

                    resolve(null);
                });
            } else {
                resolve(null);
            }
        } else {
            resolve(null);
        }
    });

    Promise.all([promiseUserLocation]).then((responses) => {
        const location = responses[0];

        var promiseActivityLog = new Promise((resolve, reject) => {
            const options = {
                userId: req.user.ID,
                geoLocation: location,
                browser: req.useragent.browser,
                alternateId: cookie.alternateId
            };

            client.ActivityLog.logLoginActivity(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseActivityLog]).then((responses) => {
            callback(cookieName);
        });
    });
}

function signOut(req, res, callback) {
    logLoginActivity(req, res, 0, null, function (cookieName) {
        req.logout();

        if (req.cookies) {
            [...Object.keys(req.cookies)].forEach(function (c) {
                if (c.toLowerCase() !== "acceptcookiepolicy") {
                    res.clearCookie(c)
                }
            });
        }

        callback();
    });
}

router.get('/api-token', passport.authenticate('auth_code', { failureRedirect: '/accounts/sign-in', failureFlash: true }), function (req, res) {
    let redirectUrl = '/';
    let isSeller = req.query['isSeller'];

    if (req.token) {
        setApiToken(res, req.token.access_token, req.token.expires_in);
    }
    
    if (req.query.chatChannelId) {
        return res.redirect('/chat?channelId=' + req.query.chatChannelId);
    }

    let promiseMerchantUserRole = null;

    if (isSeller && isSeller.toLowerCase() == 'true') {
        if (!req.user.Roles.includes('Merchant') && !req.user.Roles.includes('Submerchant')) {
            promiseMerchantUserRole = new Promise((resolve, reject) => {
                client.Accounts.updateUserRole({ userId: req.user.ID, role: 'Merchant' }, function (err, result) {
                    resolve(result);
                });
            });
        }
    }

    Promise.all([promiseMerchantUserRole]).then((responses) => {
        const merchantUserRole = responses[0];
        
        let promiseMerchant = null;

        if (merchantUserRole && merchantUserRole.Result) {
            promiseMerchant = new Promise((resolve, reject) => {
                client.Users.getUserDetails({ userId: req.user.ID }, function (err, details) {
                    resolve(details);
                });
            });

            if (merchantUserRole.AccessToken) {
                setApiToken(res, merchantUserRole.AccessToken.access_token, merchantUserRole.AccessToken.expires_in);
            }
        }

        Promise.all([promiseMerchant]).then((responses) => {
            const merchant = responses[0];

            if (merchant) {
                req.logIn(merchant, function (err) {
                    if (err) {
                        return res.redirect('/');
                    }
                    res.redirect('/merchants/settings');
                });
            } else {
                if (req.user.Roles.includes('Merchant')) {
                    if (!req.user.Onboarded) {
                        redirectUrl = '/merchants/settings';
                    }
                    else {
                        redirectUrl = '/merchants/dashboard';
                    }
                }

                res.redirect(redirectUrl);
            }
        });
    });
});

router.get('/interested-user', function (req, res) {
    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ marketplaceLogoUrl: marketplace.LogoUrl });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<RegisterInterestPage marketplaceLogoUrl={marketplace.LogoUrl} />);
        let seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-interest', seoTitle, app, appString, reduxState));
    });
});

router.post('/interested-user', function (req, res) {
    const { name, email, type } = req.body;
    const options = { Name: name, Email: email, IsSeller: req.body.type === 'seller', Status: 'Interested' };

    const promiseRegisterInterestedUser = new Promise((resolve, reject) => {
        client.Accounts.registerInterestedUser(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRegisterInterestedUser]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

router.post('/sign-out', authenticated, function (req, res) {
    signOut(req, res, function () {
        if (req.isPrivateEnabled) {
            if (!req.isPrivateSellerSignUp) {
                return res.redirect('/accounts/sign-in');
            }
        }

        res.redirect('/');
    });
});

router.get('/non-private/sign-in', function (req, res) {
    const error = req.query.error;
    const errorMessage = req.query.errorMessage;
    const host = getHostname(req);
    const isSeller = req.query['isSeller'];

    getMarketplaceInfo(false, true).then((marketplace) => {
        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplace.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplace.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplace.OpenIdProviders) {
                    customFacebook = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        let favIconData = '';

        let chatChannelId = '';

        if (req.query.chatChannelId) {
            chatChannelId = req.query["chatChannelId"];
        }

        if (marketplace.Settings &&
            marketplace.Settings["themes"] &&
            marketplace.Settings["themes"]["theme-1"] &&
            marketplace.Settings["themes"]["theme-1"]["favicon"]) {
            favIconData = marketplace.Settings["themes"]["theme-1"]["favicon"];
        }
        let guestUserID = "";
        if (req.query.guestUserID) {
            guestUserID = req.query.guestUserID;
        }

        const appString = 'login';
        let token = req.query['token'] || '';
        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, '', token, chatChannelId, isSeller) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, '', token, chatChannelId, isSeller) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';
        const NonPrivateLoginPage = require('../views/login/non-private-login').NonPrivateLoginComponent;

        const s = Store.createEmptyStore({
            type: 'non-private-guest',
            host: getHostname(req),
            error: error,
            loginConfigurationSettings: loginConfigurationSettings,
            cookieData: marketplace.CustomFields,
            favIconData: favIconData,
            chatChannelId: chatChannelId,
            guestUserID: guestUserID,
            customFacebookDisplayName: customFacebookDisplayName,
            customGoogleDisplayName: customGoogleDisplayName,
            isMerge: req.query.merge,
            isSeller: isSeller,
            errorMessage: errorMessage
        });

        const reduxState = s.getState();

        const nonPrivateLogin = reactDom.renderToString(
            <NonPrivateLoginPage
                type='non-private-guest'
                host={host}
                facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook', '', token, chatChannelId, isSeller)}
                googleLoginUrl={buildExternalLoginUrl(host, 'Google', '', token, chatChannelId, isSeller)}
                customFacebookLoginUrl={customFacebookLoginUrl}
                customGoogleLoginUrl={customGoogleLoginUrl}
                marketplaceLogoUrl={marketplace.LogoUrl}
                error={error}
                loginConfigurationSettings={loginConfigurationSettings}
                cookieData={marketplace.CustomFields}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                customFacebookDisplayName={customFacebookDisplayName}
                customGoogleDisplayName={customGoogleDisplayName}
                isSeller={isSeller}
                errorMessage={errorMessage}
            />
        );

        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login guest', seoTitle, nonPrivateLogin, appString, reduxState));
    });
});

router.post('/non-private/sign-in', function (req, res, next) {
    const isSeller = req.body['isSeller'];

    passport.authenticate('login', function (err, user, info) {
        if (!err && info) {            
            if (info.message.toLowerCase().indexOf('sub account login is disabled by admin.') > 1) {
                return res.redirect(`/accounts/non-private/sign-in?isSeller=${isSeller}&error=5`);
            }
        } else if (err) {
            return res.redirect(`/accounts/non-private/sign-in?isSeller=${isSeller}&error=invalid-login`);
        } else {
            if (!user) {
                return res.redirect(`/accounts/non-private/sign-in?isSeller=${isSeller}&error=invalid-login`);
            }

            if (req.token) {
                setApiToken(res, req.token.access_token, req.token.expires_in);
            }

            req.logIn(user, function (err) {
                if (err) {
                    return res.redirect(`/accounts/non-private/sign-in?isSeller=${isSeller}&error=invalid-login`);
                }

                if (req.cookies.guestUserID && (req.body.isMerge == true || req.body.isMerge == 'true')) {
                    let options = {
                        guestUserId: req.cookies.guestUserID,
                        userId: req.user.ID
                    };

                    var promiseMergeUser = new Promise((resolve, reject) => {

                        client.Users.mergeGuestToUser(options, function (err, result) {
                            console.log('promiseMergeUser', err);
                            resolve(result);
                        });
                    });

                    Promise.all([promiseMergeUser]).then((responses) => {
                        let data = responses[0];
                    });
                }

                logLoginActivity(req, res, 0, null, function () {
                    if (req.body.returnUrl) {
                        return res.redirect("/" + req.body.returnUrl);
                    }

                    if (req.query.chatChannelId) {
                        return res.redirect('/chat?channelId=' + req.query.chatChannelId);
                    }

                    if (req.user.Roles.includes('Merchant')) {
                        return res.redirect('/merchants/dashboard');
                    }

                    res.redirect('/');
                });
            });
        }
    })(req, res, next);
});

router.get('/non-private/register', function (req, res) {
    var error = req.query['error'];
    var isSeller = req.query['isSeller'];
    var host = getHostname(req);
    var token = null;
    var googleLoginUrl = buildExternalLoginUrl(host, 'Google', '', token);
    var facebookLoginUrl = buildExternalLoginUrl(host, 'Facebook', '', token);
    var NonPrivateSignUpPage = require('../views/login/non-private-sign-up').NonPrivateSignUpComponent;

    Promise.all([getMarketplaceInfo()]).then((responses) => {
        let marketplaceInfo = responses[0];
        let marketplaceRegistration = responses[1];

        const s = Store.createEmptyStore({
            error: error,
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            googleLoginUrl: googleLoginUrl,
            facebookLoginUrl: facebookLoginUrl,
            isSeller: isSeller
        });

        const reduxState = s.getState();
        const appString = 'login';

        const app = reactDom.renderToString(<NonPrivateSignUpPage error={error}
            marketplaceInfo={marketplaceInfo}
            googleLoginUrl={buildExternalLoginUrl(host, 'Google')}
            facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook')}
            isSeller={isSeller}
        />);
        let seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/non-private/sign-up', function (req, res, next) {
    req.body.token = null;
    req.body.isSeller = req.body.isSeller.toLowerCase() == 'true';

    passport.authenticate('signup', function (err, user, token) {
        if (err) {
            return res.redirect(`/accounts/non-private/register?isSeller=${req.body.isSeller}&error=invalid-signup`);
        } else {
            if (token) {
                setApiToken(res, token.access_token, token.expires_in);
            }
            if (user) {
                req.logIn(user, function (err) {
                    if (err) {
                        return res.redirect(`/accounts/non-private/register?isSeller=${req.body.isSeller}&error=invalid-login`);
                    }
                    if (req.body.isSeller == true) return res.redirect('/merchants/settings');

                    res.redirect('/');
                });
            }
        }
    })(req, res, next);
});

router.get('/non-private/forgot-password', function (req, res) {
    const success = req.query.success;
    const isSeller = req.query.isSeller;

    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ success: success, marketplaceLogoUrl: marketplace.LogoUrl, type: 'non-private', isSeller: isSeller });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<ForgotPasswordPage marketplaceLogoUrl={marketplace.LogoUrl} success={success} type='non-private' isSeller={isSeller} />);
        let seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
})

router.get('/sign-in', function (req, res) {
    getMarketplaceInfo().then((marketplace) => {
        const settingsTemp = marketplace.Settings['private-settings']['private-settings-area'];
        const isMerchantRestrictedOnly = settingsTemp && settingsTemp.enabled == 'true' && settingsTemp['mode'] === '0';
        const aboutUs = settingsTemp['about-us'];
        //ARC10778 fix for non Debug. debug mode will have wrong image.
        //const backgroundImage = process.env.PROTOCOL + '://' + process.env.BASE_URL + '/userdata/' + process.env.BASE_URL + '/images/' + settingsTemp["background-image-url"];
        const backgroundImage = process.env.PROTOCOL + '://' + process.env.BASE_URL + '/images/' + settingsTemp["background-image-url"];

        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        const cookieData = marketplace.CustomFields;
        let favIconData = '';
        let chatChannelId = '';
        const error = req.query.error;
        const errorMessage = req.query.errorMessage;

        let isPrivateEnabled = false;
        if (marketplace.Settings &&
            marketplace.Settings['private-settings']['private-settings-area'].enabled === 'true') {
            isPrivateEnabled = true;
        }
        //const isNonPrivateGuest = isPrivateEnabled && process.env.TEMPLATE === 'bespoke';
        if (!isPrivateEnabled) {
            let url = '/accounts/non-private/sign-in';

            if (error) {
                url += `?error=${error}`;
            }
            if (req.query.returnUrl) {
                url += url.indexOf('?') >= 0 ? '&' : '?';
                url += `returnUrl=${req.query.returnUrl}`;
            }
            if (errorMessage) {
                url += '&errorMessage=' + errorMessage;
            }
            return res.redirect(url);
        }

        if (marketplace.Settings &&
            marketplace.Settings["themes"] &&
            marketplace.Settings["themes"]["theme-1"] &&
            marketplace.Settings["themes"]["theme-1"]["favicon"]) {
            favIconData = marketplace.Settings["themes"]["theme-1"]["favicon"];
        }

        if (req.query.chatChannelId) {
            chatChannelId = req.query["chatChannelId"];
        }

        const s = Store.createEmptyStore({
            aboutUs,
            backgroundImage,
            cookieData,
            isMerchantRestrictedOnly,
            favIconData,
            chatChannelId,
            error
        });

        const reduxState = s.getState();
        const appString = 'login';

        const landingApp = reactDom.renderToString(
            <LandingPage
                aboutUs={aboutUs}
                backgroundImage={backgroundImage}
                cookieData={cookieData}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                isMerchantRestrictedOnly={isMerchantRestrictedOnly}
                error={error} />
        );
        res.send(template('page-landing', seoTitle, landingApp, appString, reduxState));
    });
});

router.get('/buyer/sign-in', function (req, res) {
    const error = req.query.error;
    const host = getHostname(req);

    getMarketplaceInfo(false, true).then((marketplace) => {
        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplace.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplace.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplace.OpenIdProviders) {
                    customFacebook = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        let favIconData = '';

        let chatChannelId = '';

        if (req.query.chatChannelId) {
            chatChannelId = req.query["chatChannelId"];
        }


        if (marketplace.Settings &&
            marketplace.Settings["themes"] &&
            marketplace.Settings["themes"]["theme-1"] &&
            marketplace.Settings["themes"]["theme-1"]["favicon"]) {
            favIconData = marketplace.Settings["themes"]["theme-1"]["favicon"];
        }

        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, '', token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, '', token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';

        const s = Store.createEmptyStore({
            type: 'buyer',
            host: getHostname(req),
            error: error,
            loginConfigurationSettings: loginConfigurationSettings,
            cookieData: marketplace.CustomFields,
            favIconData: favIconData,
            chatChannelId: chatChannelId,
            customFacebookDisplayName: customFacebookDisplayName,
            customGoogleDisplayName: customGoogleDisplayName
        });

        const reduxState = s.getState();
        const appString = 'login';
        let token = req.query['token'];




        const buyerLogin = reactDom.renderToString(
            <LoginPage
                type='buyer'
                host={host}
                facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook', '', token, chatChannelId)}
                googleLoginUrl={buildExternalLoginUrl(host, 'Google', '', token, chatChannelId)}
                customFacebookLoginUrl={customFacebookLoginUrl}
                customGoogleLoginUrl={customGoogleLoginUrl}
                marketplaceLogoUrl={marketplace.LogoUrl}
                error={error}
                loginConfigurationSettings={loginConfigurationSettings}
                cookieData={marketplace.CustomFields}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                customFacebookDisplayName={customFacebookDisplayName}
                customGoogleDisplayName={customGoogleDisplayName}
            />
        );

        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-landing', seoTitle, buyerLogin, appString, reduxState));
    });
});

router.post('/buyer/sign-in', function (req, res, next) {
    passport.authenticate('login', function (err, user, info) {
        if (!err && info) {
            if (info.message.toLowerCase().indexOf('sub account login is disabled by admin.') > 1) {
                return res.redirect(`/accounts/buyer/sign-in?error=5`);
            }
        } else if (err) {
            return res.redirect(`/accounts/buyer/sign-in?error=invalid-login`);
        } else {
            if (!user) {
                return res.redirect(`/accounts/buyer/sign-in?error=invalid-login`);
            }

            if (req.token) {
                setApiToken(res, req.token.access_token, req.token.expires_in);
            }

            req.logIn(user, function (err) {
                logLoginActivity(req, res, 0, null, function () {
                    if (req.query.chatChannelId) {
                        return res.redirect('/chat?channelId=' + req.query.chatChannelId);
                    }

                    res.redirect('/');
                });
            });
        }
    })(req, res, next);
});

router.get('/buyer/register', function (req, res) {
    let error = req.query['error'];
    let token = req.query['token'];
    var host = getHostname(req);
    var googleLoginUrl = buildExternalLoginUrl(host, 'Google', '', token);
    var facebookLoginUrl = buildExternalLoginUrl(host, 'Facebook', '', token);

    if (!token) {
        return res.redirect('/accounts/sign-in?error=1');
    }

    var promiseMarketPlaceRegistration = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceRegistration({ token: token }, function (err, userInfo) {
            if (err) {
                const serverError = err.message.split('Error Code:');
                if (serverError && serverError.length > 0) {
                    resolve({
                        errorMessage: serverError[0].trim(),
                        errorCode: serverError[1].trim()
                    });
                }
                else {
                    resolve(null);
                }
            }
            else {
                resolve(userInfo);
            }
        });
    });

    Promise.all([getMarketplaceInfo(), promiseMarketPlaceRegistration]).then((responses) => {
        let marketplaceInfo = responses[0];
        let marketplaceRegistration = responses[1];

        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplaceInfo.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplaceInfo.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplaceInfo.OpenIdProviders) {
                    customFacebook = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        if (!marketplaceRegistration) {
            return res.redirect('/accounts/sign-in?error=1');
        }

        if (marketplaceRegistration.errorCode == '400') {
            return res.redirect(`/accounts/sign-in?error=1&errorMessage=${marketplaceRegistration.errorMessage}`);
        }

        if (marketplaceRegistration.IsSeller) {
            return res.redirect('/accounts/sign-in?error=1');
        }

        const s = Store.createEmptyStore({
            error: error,
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            googleLoginUrl: googleLoginUrl,
            facebookLoginUrl: facebookLoginUrl,
            loginConfigurationSettings: loginConfigurationSettings,
            marketplaceRegistration: marketplaceRegistration
        });

        const reduxState = s.getState();
        const appString = 'login';

        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, customFacebook.ClientId, token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, customGoogle.ClientId, token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';
        const app = reactDom.renderToString(<BuyerSignUpPage error={error}
            marketplaceInfo={marketplaceInfo}
            customFacebookLoginUrl={customFacebookLoginUrl}
            customGoogleLoginUrl={customGoogleLoginUrl}
            loginConfigurationSettings={loginConfigurationSettings}
            customFacebookDisplayName={customFacebookDisplayName}
            customGoogleDisplayName={customGoogleDisplayName}
            googleLoginUrl={buildExternalLoginUrl(host, 'Google')}
            facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook')}
            marketplaceRegistration={marketplaceRegistration}
        />);
        let seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/buyer/sign-up', function (req, res, next) {
    passport.authenticate('signup', function (err, user, token) {
        if (err) {
            res.redirect('/accounts/buyer/register?token=' + req.body['token'] + '&error=invalid-signup');
        } else {
            if (token) {
                setApiToken(res, token.access_token, token.expires_in);
            }
            if (user) {
                req.logIn(user, function (err) {
                    if (err) {
                        return res.redirect('/accounts/buyer/register?token=' + req.body['token'] + '&error=invalid-login');
                    }

                    res.redirect('/');
                });
            }
        }
    })(req, res, next);
});

router.get('/seller/register', function (req, res) {
    let error = req.query['error'];
    let token = req.query['token'];
    var host = getHostname(req);
    var googleLoginUrl = buildExternalLoginUrl(host, 'Google', '', token) + '&isSeller=true';
    var facebookLoginUrl = buildExternalLoginUrl(host, 'Facebook', '', token) + '&isSeller=true';
    if (!token) {
        return res.redirect('/accounts/sign-in?error=1');
    }

    var promiseMarketPlaceRegistration = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceRegistration({ token: token }, function (err, userInfo) {
            resolve(userInfo);
        });
    });

    Promise.all([getMarketplaceInfo(), promiseMarketPlaceRegistration]).then((responses) => {
        let marketplaceInfo = responses[0];
        let marketplaceRegistration = responses[1];

        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplaceInfo.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplaceInfo.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplaceInfo.OpenIdProviders) {
                    customFacebook = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }
        if (!marketplaceRegistration) {
            return res.redirect('/accounts/sign-in?error=1');
        }

        if (!marketplaceRegistration.IsSeller) {
            return res.redirect('/accounts/sign-in?error=1');
        }

        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, customFacebook.ClientId, token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, customGoogle.ClientId, token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';
        const s = Store.createEmptyStore({
            error: error,
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            googleLoginUrl: googleLoginUrl,
            facebookLoginUrl: facebookLoginUrl,
            loginConfigurationSettings: loginConfigurationSettings,
            marketplaceRegistration: marketplaceRegistration
        });
        const reduxState = s.getState();
        const appString = 'login';

        const app = reactDom.renderToString(<SellerSignUpPage error={error}
            googleLoginUrl={googleLoginUrl}
            facebookLoginUrl={facebookLoginUrl}
            customFacebookLoginUrl={customFacebookLoginUrl}
            customGoogleLoginUrl={customGoogleLoginUrl}
            loginConfigurationSettings={loginConfigurationSettings}
            customFacebookDisplayName={customFacebookDisplayName}
            customGoogleDisplayName={customGoogleDisplayName}
            marketplaceRegistration={marketplaceRegistration}
        />);
        let seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/seller/sign-up', function (req, res, next) {
    passport.authenticate('signup', function (err, user, token) {
        if (err) {
            res.redirect('/accounts/seller/register?token=' + req.body['token'] + '&error=invalid-signup');
        } else {
            if (token) {
                setApiToken(res, token.access_token, token.expires_in);
            }
            if (user) {
                req.logIn(user, function (err) {
                    if (err) {
                        return res.redirect('/accounts/seller/register?token=' + req.body['token'] + '&error=invalid-login');
                    }

                    res.redirect('/merchants/settings');
                });
            }
        }
    })(req, res, next);
});

router.get('/seller/sign-in', function (req, res) {
    const error = req.query['error'];
    const host = getHostname(req);
    getMarketplaceInfo(false, true).then((marketplace) => {
        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplace.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplace.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplace.OpenIdProviders) {
                    customFacebook = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        let favIconData = '';
        let chatChannelId = '';

        if (req.query.chatChannelId) {
            chatChannelId = req.query["chatChannelId"];
        }

        if (marketplace.Settings &&
            marketplace.Settings["themes"] &&
            marketplace.Settings["themes"]["theme-1"] &&
            marketplace.Settings["themes"]["theme-1"]["favicon"]) {
            favIconData = marketplace.Settings["themes"]["theme-1"]["favicon"];
        }

        let token = req.query['token'];
        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, '', token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, '', token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';

        const s = Store.createEmptyStore({
            type: 'seller',
            host: getHostname(req),
            error: error,
            loginConfigurationSettings: loginConfigurationSettings,
            cookieData: marketplace.CustomFields,
            favIconData: favIconData,
            chatChannelId: chatChannelId,
            customFacebookDisplayName: customFacebookDisplayName,
            customGoogleDisplayName: customGoogleDisplayName
        });

        const reduxState = s.getState();
        const appString = 'login';

        const sellerLogin = reactDom.renderToString(
            <LoginPage
                type='seller'
                host={host}
                facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook', '', token, chatChannelId)}
                googleLoginUrl={buildExternalLoginUrl(host, 'Google', '', token, chatChannelId)}
                customFacebookLoginUrl={customFacebookLoginUrl}
                customGoogleLoginUrl={customGoogleLoginUrl}
                marketplaceLogoUrl={marketplace.LogoUrl}
                error={error}
                loginConfigurationSettings={loginConfigurationSettings}
                cookieData={marketplace.CustomFields}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                customFacebookDisplayName={customFacebookDisplayName}
                customGoogleDisplayName={customGoogleDisplayName}
            />
        );

        let seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-landing', seoTitle, sellerLogin, appString, reduxState));
    });
});

router.post('/seller/sign-in', function (req, res, next) {
    passport.authenticate('login', function (err, user, info) {
        if (!err && info) {
            if (info.message.toLowerCase().indexOf('sub account login is disabled by admin.') > 1) {
                return res.redirect(`/accounts/seller/sign-in?error=5`);
            }
        } else if (err) {
            return res.redirect(`/accounts/seller/sign-in?error=invalid-login`);
        } else {
            if (!user) {
                return res.redirect(`/accounts/seller/sign-in?error=invalid-login`);
            }

            if (req.token) {
                setApiToken(res, req.token.access_token, req.token.expires_in);
            }

            req.logIn(user, function (err) {
                logLoginActivity(req, res, 0, null, function () {
                    if (req.query.chatChannelId) {
                        return res.redirect('/chat?channelId=' + req.query.chatChannelId);
                    }

                    res.redirect('/merchants/dashboard');
                });
            });
        }
    })(req, res, next);
});

router.get('/buyer/forgot-password', function (req, res) {
    const success = req.query.success;

    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ success: success, marketplaceLogoUrl: marketplace.LogoUrl, type: 'buyer' });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<ForgotPasswordPage marketplaceLogoUrl={marketplace.LogoUrl} success={success} type='buyer' />);
        let seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.get('/seller/forgot-password', function (req, res) {
    const success = req.query.success;

    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ success: success, marketplaceLogoUrl: marketplace.LogoUrl, type: 'seller' });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<ForgotPasswordPage marketplaceLogoUrl={marketplace.LogoUrl} success={success} type='seller' />);
        let seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/forgot-password', function (req, res) {
    const loginName = req.body.username;
    const type = req.body.type;
    const isSeller = req.body.isSeller;

    if (loginName === "") {
        res.redirect('/accounts/' + type + `/forgot-password?isSeller=${isSeller}&success=false`);
        return;
    }
    const promiseUsers = new Promise((resolve, reject) => {
        const options = {
            keyword: loginName,
            role: type === 'non-private' ? 'buyer' : type,
            findExact: true
        };

        client.Users.getUsers(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUsers]).then((responses) => {
        const users = responses[0];
        const promiseResets = [];

        if (users.TotalRecords > 0) {
            users.Records.forEach(function (user) {
                promiseResets.push(new Promise((resolve, reject) => {
                    const options = {
                        userId: user.ID,
                        action: 'token'
                    };

                    client.Accounts.requestResetPassword(options, function (err, result) {
                        resolve(result);
                    });
                }));
            });

            Promise.all(promiseResets).then((responses) => {
                res.redirect('/accounts/' + type + `/forgot-password?isSeller=${isSeller}&success=true`);
            });

        } else {
            res.redirect('/accounts/' + type + `/forgot-password?isSeller=${isSeller}&success=false`);
        }
    });
});

router.get('/reset-password', function (req, res) {
    const userId = req.query['userId'];
    const token = req.query['token'];
    const success = req.query['success'] || null;

    if (!(userId && token) && success !== 'true')
        res.redirect('/?error=invalid-reset-password');

    Promise.all([getMarketplaceInfo()]).then((responses) => {
        const marketplaceInfo = responses[0];

        let isPrivate = marketplaceInfo.Settings['private-settings']['private-settings-area']['enabled'];

        const s = Store.createEmptyStore({
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            token: token,
            userId: userId,
            success: success,
            isPrivatemarketPlace: isPrivate

        });
        const reduxState = s.getState();
        const appString = 'login';

        const app = reactDom.renderToString(
            <ResetPasswordPage marketplaceLogoUrl={marketplaceInfo.LogoUrl}
                token={token}
                userId={userId}
                isPrivatemarketPlace={isPrivate}
                success={success} />
        );
        let seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/reset-password', function (req, res) {
    var promiseResetPassword = new Promise((resolve, reject) => {
        const options = {
            userId: req.body['userId'],
            resetPasswordToken: querystring.unescape(req.body['token']),
            password: req.body['new_password'],
            confirmPassword: req.body['reconfirm_password']
        };
        client.Accounts.resetUserPassword(options, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });

    Promise.all([promiseResetPassword]).then((responses) => {
        const result = responses[0];

        res.redirect('/accounts/reset-password?success=true');
    }, (err) => {
        res.redirect('/accounts/sign-in?error=1');
    });
});

const viewChangePWPage = {
    code: 'view-consumer-change-password-api'
}

router.get('/change-password', authenticated, authorizedUser, isAuthorizedToAccessViewPage(viewChangePWPage), function (req, res) {
    let success = req.query['success'];
    
    Promise.all([getMarketplaceInfo()]).then((responses) => {
        const user = req.user;

        getUserPermissionsOnPage(user, "Change Password", "Consumer", (permissions) => {
            const { isAuthorizedToEdit } = permissions;
            console.log('permissions', permissions);
            const s = Store.createEmptyStore({
                changePasswordReducer: { success: success },
                userReducer: { user: user, isAuthorizedToEdit: isAuthorizedToEdit }
            });
            const marketplaceInfo = responses[0];
            const reduxState = s.getState();
            const appString = 'login';

            const app = reactDom.renderToString(
                <ChangePasswordPage success={success} user={req.user} isAuthorizedToEdit={isAuthorizedToEdit} />);
            let seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
            res.send(template('page-reset', seoTitle, app, appString, reduxState));
        });        
    });
});

router.post('/change-password', authenticated, function (req, res) {
    let userID = req.user.ID;
    if (req.user.SubmerchantID) {
        userID = req.user.SubmerchantID;
    }
    if (req.user.SubBuyerID) {
        userID = req.user.SubBuyerID;
    }

    const options = {
        userId: userID,
        oldPassword: req.body['oldPassword'],
        password: req.body['password'],
        confirmPassword: req.body['confirmPassword']
    };
    
    var promiseChangePassword = new Promise((resolve, reject) => {
        client.Accounts.resetUserPassword(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChangePassword]).then((responses) => {
        const result = responses[0];
        if (result && result.Result === true) {
            signOut(req, res, function () {
                res.send({ ...result, user: null });
            });
        } else res.send({ Result: false, user: req.user });
    });
});

router.get('/non-private/be-seller', authenticated, function (req, res) {

    if (req.user === undefined) {
        return res.redirect('/accounts/non-private/sign-in?isSeller=true');
    }

    if (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) {
        return res.redirect('/');
    }

    if (req.user && req.user.Guest === false) {

        let promiseMerchantUserRole = new Promise((resolve, reject) => {
            client.Accounts.updateUserRole({ userId: req.user.ID, role: 'Merchant' }, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseMerchantUserRole]).then((responses) => {
            const merchantUserRole = responses[0];
            let promiseMerchant = null;

            if (merchantUserRole && merchantUserRole.Result) {
                promiseMerchant = new Promise((resolve, reject) => {
                    client.Users.getUserDetails({ userId: req.user.ID }, function (err, details) {
                        resolve(details);
                    });
                });

                if (merchantUserRole.AccessToken) {
                    setApiToken(res, merchantUserRole.AccessToken.access_token, merchantUserRole.AccessToken.expires_in);
                }
            }

            Promise.all([promiseMerchant]).then((responses) => {
                const merchant = responses[0];

                if (merchant) {
                    req.logIn(merchant, function (err) {
                        if (err) {
                            return res.redirect('/');
                        }
                        return res.redirect('/merchants/settings');
                    });
                }

                res.redirect('/');
            });
        });
    } else {

        if (req.user) {
            return res.redirect('/accounts/non-private/sign-in?isSeller=true');
        }
    }

});

module.exports = router;
