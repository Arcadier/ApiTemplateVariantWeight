'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Files() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Files, ArctickClient);

Files.prototype.uploadFile = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const purpose = options.purpose;
    const formData = options.formData;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/files/' + userId + '/' + purpose,
            formData: formData
        }, callback);
    });
};

Files.prototype.generateFile = function(options, callback) {
    const format = options.format;
    const type = options.type;
    const filename = options.filename;
    const sourceUrl = options.sourceUrl;
    const content = options.content;
    const stylesheetContent = options.stylesheetContent;

    this._makeRequest({
        method: 'POST',
        path: '/api/v2/files/' + format,
        data: {
            Type: type,
            Filename: filename,
            SourceUrl: sourceUrl,
            Content: content,
            StylesheetContent: stylesheetContent
        }
    }, callback);
};

module.exports = Files;
