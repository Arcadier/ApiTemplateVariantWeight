"use strict";

var GatewaysModule = (function () {

    return {
        Get: function () {
            return {
                Stripe: 'Stripe',
                Omise: 'Omise',
                PayPal: 'PayPal',
                Custom: 'Custom',
                CashOnDelivery: 'Cash on delivery',
                OfflinePayments :'offline-payments'
            }
        },
        GetStripeCurrenciesNoMinors: () => {
            return [ 'BIF', 'BYR', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF' ];
        },
        GetOmiseCurrenciesNoMinors: () => {
            return [ 'JPY' ];
        },
        GetNonCustomGatewayCodes: () => {
            return ['stripe', 'omise', 'paypal-adaptive'];
        }
    };

})();

module.exports = GatewaysModule;


