"use strict";

var CustomFieldStaticModule = (function () {
    return {
        GetGroups: function () {
            return {
                Availability: 'Availability',
                NewDelivery: 'Delivery 2.0',
                OrderDiary: 'OrderDiary'
            }
        },
        GetReferenceTables: function () {
            return {
                Items: 'Items',
                Orders: 'Orders'
            }
        },
        GetAvailabilityProperties() {
            return {
                CountryCode: 'CountryCode',
                MOQ: 'MOQ',
                BulkPricing:'BulkPricing'
            }
        },
        GetOrderDiaryProperties() {
            return {
                EventAdmin: 'EventAdmin',
                EventMerchant: 'EventMerchant',
                EventConsumer: 'EventConsumer'
            }
        }
    };

})();

module.exports = CustomFieldStaticModule;