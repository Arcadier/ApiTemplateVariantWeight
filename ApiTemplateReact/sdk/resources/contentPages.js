'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function ContentPages() {
    ArctickClient.apply(this, arguments);
}

util.inherits(ContentPages, ArctickClient);

ContentPages.prototype.getPages = function(options, callback) {
    const excludes = options.excludes;

    this._makeRequest({
        method: 'GET',
        path: '/api/v2/content-pages/',
        params: {
            excludes: excludes
        }
    }, callback);
};

module.exports = ContentPages;
