'use strict';
var https = require('https');
var http = require('http');
var qs = require('querystring');

module.exports = function request(options, callback) {
    let url = options.url;
    let data = options.data;
    let method = options.method.toUpperCase();
    let protocol = url.startsWith('https') ? https : http;

    let requestOptions = {
        method: method
    };

    if (method == 'GET') {
        if (data) {
            url += '?' + qs.stringify(data);
        }
    }

    var req = protocol.request(url, requestOptions, (res) => {
        let data = '';

        res.setEncoding('utf-8');
        res.on('data', (d) => {
            data += d;
        });
        res.on('end', function () {
            try {
                if (res.statusCode == 200) {
                    var parsed = JSON.parse(data);
                    callback(null, parsed);
                } else {
                    callback('unexpected status code (' + res.statusCode + '): ' + res.statusMessage);
                }
            } catch (err) {
                callback('exception error: ' + err.message);
            }
        });
    }).on('error', function (err) {
        callback('request error: ' + err.message);
    });

    req.setHeader('Content-Type', 'application/json');
    req.setHeader('Accept', 'application/json');
    req.setHeader('Accept-Charset', 'utf-8');

    if (method == 'POST') {
        if (data) {
            req.write(JSON.stringify(data));
        }
    }

    req.end();
};