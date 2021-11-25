'use strict';

var Arctick = require('./apiClient');
var client = new Arctick({
    apiBaseUrl: process.env.BASE_URL,
    protocol: process.env.PROTOCOL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});
var resources = {
    Accounts: require('./resources/accounts'),
    Items: require('./resources/items'),
    Categories: require('./resources/categories'),
    Users: require('./resources/users'),
    Panels: require('./resources/panels'),
    Purchases: require('./resources/purchases'),
    Addresses: require('./resources/addresses'),
    Orders: require('./resources/orders'),
    Inbox: require('./resources/inbox'),
    CustomFields: require('./resources/customfields'),
    ShippingMethods: require('./resources/shippingMethods'),
    Transactions: require('./resources/transactions'),
    Files: require('./resources/files'),
    Comparisons: require('./resources/comparisons'),
    Carts: require('./resources/carts'),
    Marketplaces: require('./resources/marketplaces'),
    ActivityLog: require('./resources/activitylog'),
    Emails: require('./resources/emails'),
    Payments: require('./resources/payments'),
    Media: require('./resources/media'),
    ContentPages: require('./resources/contentPages'),
    Chat: require('./resources/chat'),
    CustomTables: require('./resources/customTables'),
    Quotations: require('./resources/quotations'),
    Requisitions: require('./resources/requisitions'),
    ReceivingNotes: require('./resources/receivingNotes'),
    Invoices: require('./resources/invoices'),
    UserGroups: require('./resources/userGroups'),
    PermissionProfiles: require('./resources/PermissionProfiles')
};
client._prepResources(resources);

module.exports = client;
