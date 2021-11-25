'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Media() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Media, ArctickClient);

Media.prototype.uploadMedia = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const purpose = options.purpose;
    const formData = options.formData;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/media',
            params: {
                purpose: purpose
            },
            formData: formData
        }, callback);
    });
};

module.exports = Media;
