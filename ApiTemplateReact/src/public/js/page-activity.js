"use strict";
var pageActivityModule = (function () {
    var self = this;
    if (typeof window !== 'undefined') {
        var $ = window.$;
    }

    function logPageActivity(e) {
        $.ajax({
            url: '/activity-logs/logPageActivity',
            type: 'POST',
            data: {
                pageUrl: window.location.href + window.location.search
            },
            success: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }

    return {
        logPageActivity: logPageActivity
    };

})();

window.onload = function () {
    pageActivityModule.logPageActivity();
};

window.onbeforeunload = function () {
    pageActivityModule.logPageActivity();
};