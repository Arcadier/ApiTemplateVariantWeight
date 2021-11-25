'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Panels() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Panels, ArctickClient);

Panels.prototype.getPanels = function(options, callback) {
    const type = options.type;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;

    this._makeRequest({
        method: 'GET',
        path: '/api/v2/panels',
        params: {
            pageSize: pageSize,
            pageNumber: pageNumber,
            type: type
        }
    }, callback);
};

module.exports = Panels;
