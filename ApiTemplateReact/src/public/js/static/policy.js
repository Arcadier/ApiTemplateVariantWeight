"use strict";

var PolicyStaticModule = (function () {
    return {
        GetMappings: function () {
            return [
                {
                    key: 'About',
                    name: {
                        trillia: 'About',
                        bespoke: 'About Us'
                    },
                    url: {
                        trillia: 'about-us',
                        bespoke: 'about-us'
                    },
                    value: 'ABOUT US'
                },
                {
                    key: 'Terms',
                    name: {
                        trillia: 'Terms of Use',
                        bespoke: 'Terms of Service'
                    },
                    url: {
                        trillia: 'terms-of-use',
                        bespoke: 'terms-of-service'
                    },
                    value: 'TERMS OF SERVICE'
                },
                {
                    key: 'Privacy',
                    name: {
                        trillia: 'Privacy',
                        bespoke: 'Privacy Policy'
                    },
                    url: {
                        trillia: 'privacy-policy',
                        bespoke: 'privacy-policy'
                    },
                    value: 'PRIVACY POLICY'
                },
                {
                    key: 'Contact',
                    name: {
                        trillia: 'Contact Us',
                        bespoke: 'Contact'
                    },
                    url: {
                        trillia: 'contact-us',
                        bespoke: 'contact-us'
                    },
                    value: 'CONTACT US'
                },
                {
                    key: 'Faq',
                    name: {
                        trillia: 'Faq',
                        bespoke: 'Faq'
                    },
                    url: {
                        trillia: 'faq',
                        bespoke: 'faq'
                    },
                    value: 'FAQ'
                },
                {
                    key: 'Return',
                    name: {
                        trillia: 'Returns',
                        bespoke: 'Return Policy'
                    },
                    url: {
                        trillia: 'return-policy',
                        bespoke: 'return-policy'
                    },
                    value: 'RETURN POLICY'
                }
            ];
        },
        GetValidUrls: function () {
            let urls = [];

            this.GetMappings().forEach(function (mapping) {
                urls = urls.concat(mapping.url[`${process.env.TEMPLATE}`]);
            });

            return urls;
        },
        GetMappingByUrl: function (url) {
            let value = {};
            
            this.GetMappings().forEach(function (mapping) {
                if (mapping.url[`${process.env.TEMPLATE}`] == url) {
                    value = mapping;
                    value.name = value.name[`${process.env.TEMPLATE}`];
                    value.url = value.url[`${process.env.TEMPLATE}`];
                }
            });

            return value;
        },
        GetMappingByKey: function (key) {
            let value = {};

            this.GetMappings().forEach(function (mapping) {
                if (mapping.key == key) {
                    value = mapping;
                    value.name = value.name[`${process.env.TEMPLATE}`];
                    value.url = value.url[`${process.env.TEMPLATE}`];
                }
            });

            return value;
        },
    };

})();

module.exports = PolicyStaticModule;