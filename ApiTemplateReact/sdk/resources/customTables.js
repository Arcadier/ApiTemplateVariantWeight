'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function CustomTables() {
    ArctickClient.apply(this, arguments);
}

util.inherits(CustomTables, ArctickClient);


CustomTables.prototype.searchCustomTable = function(options, callback) {
	const self = this;
	const { pluginId, tableName, query } = options;

	self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: `/api/v2/plugins/${pluginId}/custom-tables/${tableName}`,
            data: query,
        }, callback);
    });
}

CustomTables.prototype.getCustomTableContents = function(options, callback) {
	const self = this;
	const { pluginId, tableName, rowId = null } = options;
	self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: `/api/v2/plugins/${pluginId}/custom-tables/${tableName}`,
            params: { rowId }
        }, callback);
    });
}
CustomTables.prototype.createCustomTableRow = function (options, callback) {
	const self = this;
	const { pluginId, tableName, request } = options;
	self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: `/api/v2/plugins/${pluginId}/custom-tables/${tableName}/rows`,
            data: request 
        }, callback);
    });
}

CustomTables.prototype.updateCustomTableRow = function (options, callback) {
	const self = this;
	const { pluginId, tableName, rowID, request } = options;
	self._acquireAdminAccessToken(function () {
		self._makeRequest({
			method: 'PUT',
			path: `/api/v2/plugins/${pluginId}/custom-tables/${tableName}/rows/${rowID}`,
			data: request
		}, callback)
	})
}

CustomTables.prototype.deleteCustomTableRow = function (options, callback) {
	const self = this;
	const { pluginId, tableName, rowID } = options;
	self._acquireAdminAccessToken(function () {
		self._makeRequest({
			method: 'DELETE',
			path: `/api/v2/plugins/${pluginId}/custom-tables/${tableName}/rows/${rowID}`,
		}, callback)
	})

}
module.exports = CustomTables;