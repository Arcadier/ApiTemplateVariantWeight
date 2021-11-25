"use strict";

var CountryStaticModule = require('./static/country.js');
var OrderDiaryStaticModule = require('./static/order-diary.js');
var FlagStaticModule = require('./static/flag.js');
var ToastStrStaticModule = require('./static/toaststr.js');
var ActivityStaticModule = require('./static/activity');
var EdmStaticModule = require('./static/edm');
var PolicyStaticModule = require('./static/policy');
var CustomFieldStaticModule = require('./static/custom-field.js');
var GatewaysModule = require('./static/gateways.js');

var EnumCoreModule = (function () {

    return {
        GetCountries: function () {
            return CountryStaticModule.GetCountries()
        },
        GetOrderDiarySections: function () {
            return OrderDiaryStaticModule.GetSections()
        },
        GetOrderDiaryValidFileTypes: function () {
            return OrderDiaryStaticModule.GetValidFileTypes()
        },
        GetFlags: function () {
            return FlagStaticModule.Get();
        },
        GetToastStr: function () {
            return ToastStrStaticModule.Get()
        },
        GetItemActivityLogTypes: function () {
            return ActivityStaticModule.GetTypes()
        },
        GetEdmParameters: function () {
            return EdmStaticModule.GetParameters()
        },
        GetEdmTemplates: function (languageCode) {
            return EdmStaticModule.GetTemplates(languageCode)
        },
        GetEdmOrderStatuses: function () {
            return EdmStaticModule.GetOrderStatuses()
        },
        MapMarketplaceToEdmParameters: function (marketplace, protocol, host) {
            return EdmStaticModule.MapMarketplaceToParameters(marketplace, protocol, host);
        },
        MapInvoiceToEdmParameters: function (transaction, protocol, hostname) {
            return EdmStaticModule.MapInvoiceToParameters(transaction, protocol, hostname);
        },
        MapEdmParametersToTemplate: function (template, parameters) {
            return EdmStaticModule.MapParametersToTemplate(template, parameters)
        },
        GetValidPolicyUrls: function (template) {
            return PolicyStaticModule.GetValidUrls()
        },
        GetPolicyMappingByUrl: function (name) {
            return PolicyStaticModule.GetMappingByUrl(name)
        },
        GetPolicyMappingByKey: function (key) {
            return PolicyStaticModule.GetMappingByKey(key)
        },
        GetCustomFieldGroups: function () {
            return CustomFieldStaticModule.GetGroups();
        },
        GetCustomFieldReferenceTables: function () {
            return CustomFieldStaticModule.GetReferenceTables();
        },
        GetAvailabilityProperties: function () {
            return CustomFieldStaticModule.GetAvailabilityProperties();
        },
        GetOrderDiaryProperties: function () {
            return CustomFieldStaticModule.GetOrderDiaryProperties();
        },
        GetChatEmailTypes: function () {
            return EdmStaticModule.GetChatEmailTypes();
        },
        MapChatToEdmParameters: function (chatOptions, protocol, hostname) {
            return EdmStaticModule.MapChatToEdmParameters(chatOptions, protocol, hostname);
        },
        GetGateways: function () {
            return GatewaysModule.Get();
        },
        GetStripeCurrenciesNoMinors: function () {
            return GatewaysModule.GetStripeCurrenciesNoMinors();
        },
        GetOmiseCurrenciesNoMinors: function () {
            return GatewaysModule.GetOmiseCurrenciesNoMinors();
        },
        GetNonCustomGatewayCodes: function () {
            return GatewaysModule.GetNonCustomGatewayCodes();
        },
        GetQuotationEmailTypes: function () {
            return EdmStaticModule.GetQuotationEmailTypes();
        },
        MapQuotationToEdmParameters: function (options, protocol, hostname) {
            return EdmStaticModule.MapQuotationToParameters(options, protocol, hostname);
        }
    };
})();

module.exports = EnumCoreModule;


