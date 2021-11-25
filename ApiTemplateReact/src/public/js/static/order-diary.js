"use strict";

var OrderDiaryStaticModule = (function () {
    return {
        GetSections: function () {
            return [
                {
                    "key": "Order",
                    "value": "Purchase Order"
                },
                {
                    "key": "Production",
                    "value": "Production"
                },
                {
                    "key": "Shipping",
                    "value": "Shipping"
                },
                {
                    "key": "Finance",
                    "value": "Finance"
                },
                {
                    "key": "Certification",
                    "value": "Certification"
                }
            ];
        },
        GetValidFileTypes: function () {
            return [
                'application/pdf'
            ];
        }
    };

})();

module.exports = OrderDiaryStaticModule;