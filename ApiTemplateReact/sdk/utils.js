'use strict';

var hasOwn = {}.hasOwnProperty;

var utils = {
    /**
     * Provide simple "Class" extension mechanism
     */
    protoExtend: function(sub) {
        var Super = this;
        var Constructor = hasOwn.call(sub, 'constructor') ? sub.constructor : function() {
            Super.apply(this, arguments);
        };

        Object.assign(Constructor, Super);
        Constructor.prototype = Object.create(Super.prototype);
        Object.assign(Constructor.prototype, sub);

        return Constructor;
    }
};

module.exports = utils;
