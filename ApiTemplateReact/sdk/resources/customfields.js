'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function CustomFields() {
    ArctickClient.apply(this, arguments);
}

util.inherits(CustomFields, ArctickClient);

CustomFields.prototype.getDefinitions = function(referenceTable, callback) {
    var self = this;
    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/custom-field-definitions',
                params: {
                    referenceTable: referenceTable
                }
            }, callback);
        }
    });
};

CustomFields.prototype.getPackageCustomFields = function(options, callback) {
    const packageId = options.packageId;

    this._makeRequest({
        method: 'GET',
        path: '/api/v2/plugins/' + packageId + '/custom-field-definitions'
    }, callback);
};

CustomFields.prototype.create = function (data, callback) {
    const self = this;

    this._acquireAdminAccessToken(function (err, admin) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                contentType: 'application/json',
                accept: 'application/json',
                path: '/api/v2/admins/' + admin.UserId + '/custom-field-definitions',
                data: data.customField
            }, callback);
        }
    });
};

module.exports = CustomFields;
