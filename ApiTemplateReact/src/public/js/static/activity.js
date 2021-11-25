"use strict";

var ActivityStaticModule = (function () {
    return {
        GetTypes: function () {
            return {
                Add: 'Add',
                Edit: 'Edit',
                Delete: 'Delete',
                Visible: 'Visible',
                Invisible: 'Invisible'
            }
        }
    };

})();

module.exports = ActivityStaticModule;