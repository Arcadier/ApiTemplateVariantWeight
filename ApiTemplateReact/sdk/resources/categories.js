'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Categories() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Categories, ArctickClient);

Categories.prototype.getCategories = function(options, callback) {
    this._makeRequest({
        method: 'GET',
        path: '/api/v2/categories/hierarchy'
    }, callback);
};

Categories.prototype.createCategory = function(options, callback) {
    this._enforce(options, ['merchantId']);
    this._makeRequest({
        method: 'POST',
        path: '/api/v2/admins/' + options.adminId + '/categories',
        data: {

        }
    }, callback);
};

Categories.prototype.getCategoriesByIds = function(categoryIds, callback) {
    this._makeRequest({
        method: 'POST',
        path: '/api/v2/categories',
        data: {
            categoryIds: categoryIds
        }
    }, callback);
};

module.exports = Categories;
