'use strict';

var https = require('https');
var http = require('http');
var qs = require('querystring');
var url = require('url');

var DEFAULT_ERROR_CODE = -1;
var DEFAULT_TIMEOUT_MS = 60000;

function ApiClient(options) {
    this._enforce(options, ['clientId', 'clientSecret']);
    this._apiBaseUrl = options.apiBaseUrl;
    this._protocol = options.protocol;
    this._clientId = options.clientId;
    this._clientSecret = options.clientSecret;
    this._accessToken = '';
}

ApiClient.prototype.setAccessToken = function(accessToken) {
    this._accessToken = accessToken;
    return this;
};

ApiClient.prototype.getAuthorizationUrl = function(state, redirectUrl, requestedScope) {
    return url.format({
        port: this._protocol == 'https' ? 443 : 80,
        host: this._apiBaseUrl,
        pathname: '/token',
        query: {
            client_id: this._clientId,
            scope: requestedScope.join(','),
            response_type: 'code',
            state: state,
            redirect_uri: redirectUrl
        }
    });
};

ApiClient.prototype.exchangeAuthorizationCode = function(code, redirectUrl, callback) {
    this._acquireAccessToken({
        code: code,
        client_id: this._clientId,
        client_secret: this._clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUrl
    }, callback);
};

ApiClient.prototype.exchangeRefreshToken = function(refreshToken, callback) {
    this._acquireAccessToken({
        refresh_token: refreshToken,
        client_id: this._clientId,
        client_secret: this._clientSecret,
        grant_type: 'refresh_token'
    }, callback);
};

ApiClient.prototype.exchangeImpersonationCode = function (code, callback) {
    this._acquireAccessToken({
        code: code,
        client_id: this._clientId,
        client_secret: this._clientSecret,
        grant_type: 'user_impersonation'
    }, callback);
};

ApiClient.prototype._acquireAdminAccessToken = function(callback) {
    this._acquireAccessToken({
        scope: 'admin',
        client_id: this._clientId,
        client_secret: this._clientSecret,
        grant_type: 'client_credentials'
    }, callback);
};

ApiClient.prototype._acquireAccessToken = function(params, callback) {
    this._makeRequest({
        method: 'POST',
        path: '/token',
        contentType: 'application/x-www-form-urlencoded',
        data: qs.stringify(params)
    }, function(err, data) {
        if (!err && data != null) {
            this._accessToken = data.access_token;
        }
        callback(err, data);
    }.bind(this));
};

ApiClient.prototype._enforce = function(options, requiredKeys) {
    if (!options) {
        throw new Error('Parameters for this call are undefined', DEFAULT_ERROR_CODE);
    }
    requiredKeys.forEach(function(requiredKey) {
        if (!options[requiredKey]) throw new Error('Missing required parameter "' + requiredKey + '"', DEFAULT_ERROR_CODE);
    });
};

ApiClient.prototype._makeRequest = function(options, callback) {
    var requestParams = {
        host: this._apiBaseUrl,
        port: this._protocol === 'https' ? 443 : 80,
        method: options.method,
        path: options.path
    };
    if (options.params) {
        requestParams.path += '?' + qs.stringify(options.params);
    }

    if (options.formData) {
        // formData should be a npm form-data
        requestParams.headers = options.formData.getHeaders();
    }

    var req = (this._protocol === 'https' ? https : http).request(requestParams, function(res) {
        var body = [];        
        res.setEncoding('utf-8');
        res.on('data', function(data) {
            body.push(data);
        });
        res.on('end', function() {
            var payload;
            var responseText = body.join('');
            try {
                payload = JSON.parse(responseText);
            } catch (err) {
                callback(new Error('Failed to parse response', DEFAULT_ERROR_CODE), null);
                return;
            }

            var statusCode = res.statusCode;
            var statusType = Math.floor(statusCode / 100);

            if (statusType == 4 || statusType == 5) {
                var err = payload;
                console.log('error from _makeRequest', err);

                let error = new Error(err.Message + " Error Code: " + err.Code);

                if (err.error) {
                    error = new Error(err.error + " Error Code: " + err.error_description);
                }

                let innerErrors = [];
                if (err.InnerErrors) {
                    innerErrors = err.InnerErrors.map(e => e.Message);
                    error = new Error(err.Message +  " Error Code: " + err.Code + " InnerErrors: " + innerErrors.join(','));
                }
                callback(error, null);
            } else if (statusType == 2) {
                if (payload != null) {
                    callback(null, payload.data || payload);
                } else {
                    callback(new Error('Unexpected response', DEFAULT_ERROR_CODE), null);
                }
               
            } else {
                callback(new Error('Unexpected response', DEFAULT_ERROR_CODE), null);
            }
        });
    }).on('error', function(err) {
        callback(new Error(err.message, DEFAULT_ERROR_CODE), null);
    });

    if (typeof options.formData === 'undefined') {
        req.setHeader('Content-Type', options.contentType || 'application/json');
    }
    req.setHeader('Authorization', 'Bearer ' + this._accessToken);
    req.setHeader('Accept', 'application/json');
    req.setHeader('Accept-Charset', 'utf-8');

    req.setTimeout(DEFAULT_TIMEOUT_MS, function() {
        // Aborting a request triggers the 'error' event.
        req.abort();
    });

    if (options.data) {
        var data = options.data;
        if (typeof data == 'object') {
            data = JSON.stringify(data);
        }
        req.write(data);
    }

    if (options.formData) {
        options.formData.pipe(req);
    }

    req.end();
};

ApiClient.prototype._prepResources = function(resources) {
    for (var name in resources) {
        if (resources.hasOwnProperty(name)) {
            this[name] = new resources[name]({
                apiBaseUrl: this._apiBaseUrl,
                protocol: this._protocol,
                clientId: this._clientId,
                clientSecret: this._clientSecret
            });
        }
    }
};

// Exports

module.exports = ApiClient;
