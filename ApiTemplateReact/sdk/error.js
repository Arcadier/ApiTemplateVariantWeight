'use strict';

var utils = require('./utils');

module.exports = _Error;

/**
 * Generic Error klass to wrap any errors returned by stripe-node
 */
function _Error(raw) {
    this.populate.apply(this, arguments);
    this.stack = (new Error(this.message)).stack;
}

// Extend Native Error
_Error.prototype = Object.create(Error.prototype);

_Error.prototype.type = 'GenericError';
_Error.prototype.populate = function(type, message) {
    this.type = type;
    this.message = message;
};

_Error.extend = utils.protoExtend;
