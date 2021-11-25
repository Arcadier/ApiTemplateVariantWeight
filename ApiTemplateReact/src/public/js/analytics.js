
var analytics = new function () {
    var VIEW_ID;
    var DISCOVERY = 'https://analyticsreporting.googleapis.com/$discovery/rest';
    var isAuthorized = false;

    function authorize(options) {
        if (isAuthorized) {
            if (options && options.success) {
                options.success();
            }
        }
        else {
            //Get access codes
            $.get("/Account/GetAnalyticsApiAccess",
                function (result) {
                    if (result && result.accessToken) {
                        VIEW_ID = result.viewId;

                        //Authorize API access
                        gapi.auth.setToken({
                            access_token: result.accessToken
                        });

                        if (options && options.success) {
                            options.success();
                        }
                        isAuthorized = true;
                    } else {
                        isAuthorized = false;

                        if (options && options.fail) {
                            options.fail();
                        }
                    }
                },
                "json")
                .fail(function (xhr, status, error) {
                    isAuthorized = false;
                    if (options && options.fail) options.fail(error);
                });
        }
    }

    /*
    options:

    data - the report parameter to send to google
    success - success callback function
    fail - fail callback function
    propertyNames - a list of friendly property names for resulting data
    parsePagePath - interceptor function to convert pagePath to desirable data

    */
    function queryReports(options) {
        // Load the API from the client discovery URL.        
        gapi.client.load(DISCOVERY)
            .then(function () {
                // Call the Analytics Reporting API V4 batchGet method.
                gapi.client
                    .analyticsreporting
                    .reports
                    .batchGet(options.data)
                    .then(function (response) {
                        if (options.success) {
                            //Parse result into an array of items
                            var data = parseResult(response, options);
                            options.success(data);
                        }
                    })
                    .then(null, function (err) {
                        // Log any errors.
                        if (options.fail) {
                            options.fail(err);
                        }
                    });
            });
    }

    //convert result into an array of items
    function parseResult(response, options) {
        var items = [];

        if (response
            && response.result
            && response.result.reports
            && response.result.reports.length > 0) {

            var report = response.result.reports[0];
            if (report.data && report.data.rows && report.data.rows.length > 0) {
                //create the item object based on headers from result
                var columns = parseColumns(report.columnHeader, options);
                //get actual values into an array of items
                items = parseValues(report, columns, options);
            }
        }

        return items;
    }

    //create the item object based on headers from result
    function parseColumns(header, options) {
        var customNames = options.propertyNames || {};
        var names = [];

        if (header.dimensions) {
            header.dimensions.forEach(function (name) {
                name = name.replace("ga:", "");
                name = customNames[name] || name;
                names.push(name);
            });
        }

        if (header.metricHeader && header.metricHeader.metricHeaderEntries) {
            header.metricHeader.metricHeaderEntries.forEach(function (metric) {
                var name = metric.name.replace("ga:", "");
                name = customNames[name] || name;
                names.push(name)
            });
        }

        return names;
    };

    //get the values from result
    function parseValues(report, columns, options) {
        var items = [];

        if (report.data.rows.length > 0) {
            $(report.data.rows).each(function () {
                var item = {};
                var columnIndex = 0;
                var row = this;
                var columName;

                if (row.dimensions) {
                    row.dimensions.forEach(function (value) {
                        columName = columns[columnIndex];
                        item[columName] = parsePagePath(value, columName, options);
                        ++columnIndex;
                    });
                }
                if (row.metrics) {
                    row.metrics.forEach(function (metricsData) {
                        if (metricsData.values) {
                            metricsData.values.forEach(function (value) {
                                item[columns[columnIndex]] = value;
                                ++columnIndex;
                            });
                        }
                    });
                }

                items.push(item);
            });
        }

        return items;
    }

    //interceptor to convert pagePath to desirable data
    function parsePagePath(value, columnName, options) {
        if (options.parsePagePath) {
            var propertyNames = options.propertyNames || {};
            if (columnName.toLowerCase() === 'pagepath'
                || (propertyNames['pagePath'] || '').toLowerCase() === columnName.toLowerCase()) {
                return options.parsePagePath(value);
            }
        }

        return value;
    }


    return {
        //isAuthorized : isAuthorized,
        init: function (options) {
            if (options) {
                CLIENT_ID = options.clientId;
                VIEW_ID = options.viewId;
            }
        },

        authorize: function (options) {
            authorize(options);
        },

        getItemDetailViews: function (options) {
            var host = options.domain || window.location.hostname;
            if (!options) options = {};

            if (!options.startDate) {
                options.startDate = "yesterday";
            }

            if (!options.endDate) {
                options.endDate = "yesterday";
            }

            options.propertyNames = {
                pagePath: "ItemId",
                pageviews: "ViewCount",
                uniquePageviews: "ViewCount"
            }
            options.data = {
                reportRequests: [{
                    viewId: VIEW_ID,
                    metrics: [{
                        expression: "ga:uniquePageviews",
                        formattingType: "INTEGER"
                    }],
                    dimensions: [
                        { name: "ga:pagePath" }
                    ],
                    dateRanges: [{
                        startDate: options.startDate,
                        endDate: options.endDate
                    }],
                    filtersExpression: "ga:pagePath=~^/User/Item/Detail/;ga:uniquePageviews>0;ga:hostname==" + host,
                }]
            }
            options.parsePagePath = function (path) {
                var parts = path.split('/').filter(function (e) { return e });
                return (parts.length > 0) ? parts[parts.length - 1] : path;
            }

            queryReports(options);
        },

        getHomePageViews: function (options) {
            var host = options.domain || window.location.hostname;

            if (!options.startDate) {
                options.startDate = "yesterday";
            }
            options.propertyNames = {
                date: "Date",
                pageviews: "ViewCount",
                uniquePageviews: "ViewCount"
            }
            options.data = {
                reportRequests: [{
                    viewId: VIEW_ID,
                    metrics: [{
                        expression: "ga:uniquePageviews",
                        formattingType: "INTEGER"
                    }],
                    dimensions: [
                        { name: "ga:date" }
                    ],
                    dateRanges: [{
                        startDate: options.startDate,
                        endDate: "yesterday"
                    }],
                    filtersExpression: "ga:pagePath==/,ga:pagePath==/user,ga:pagePath==/user/,ga:pagePath==/user/marketplace,ga:pagePath==/user/marketplace/" +
                    ";ga:uniquePageviews>0" +
                    ";ga:hostname==" + host,
                    orderBys: [{
                        fieldName: "ga:date",
                        sortOrder: "DESCENDING"
                    }]
                }]
            }
            queryReports(options);
        },

        getMerchantPageViewsByDate: function (options) {
            var host = options.domain || window.location.hostname;
            var pathFilter = 'ga:pagePath=~/User/MerchantAccount\\?merchantId=' + options.merchantId;
            pathFilter += ',ga:pagePath=~/User/MerchantAccount/Index\\?merchantId=' + options.merchantId;

            if (!options.startDate) {
                options.startDate = "yesterday";
            }
            options.propertyNames = {
                date: "Date",
                pageviews: "ViewCount",
                uniquePageviews: "ViewCount"
            }
            options.data = {
                reportRequests: [{
                    viewId: VIEW_ID,
                    metrics: [{
                        expression: "ga:uniquePageviews",
                        formattingType: "INTEGER"
                    }],
                    dimensions: [
                        { name: "ga:date" }
                    ],
                    dateRanges: [{
                        startDate: options.startDate,
                        endDate: "yesterday"
                    }],
                    filtersExpression: pathFilter +
                    ";ga:uniquePageviews>0" +
                    ";ga:hostname==" + host,
                    orderBys: [{
                        fieldName: "ga:date",
                        sortOrder: "DESCENDING"
                    }]
                }]
            }
            queryReports(options);
        },

        getMerchantPageViews: function (options) {
            var host = options.domain || window.location.hostname;
            options.data = {
                reportRequests: [{
                    viewId: VIEW_ID,
                    metrics: [{
                        expression: "ga:uniquePageviews",
                        formattingType: "INTEGER"
                    }],
                    dimensions: [
                        { name: "ga:pagePath" },
                        { name: "ga:hostname" }
                    ],
                    filtersExpression: "ga:pagePath=~^/User/MerchantAccount,ga:pagePath=~/User/MerchantAccount/Index" +
                    ";ga:uniquePageviews>0" +
                    ";ga:hostname==" + host
                }]
            }
            queryReports(options);
        }
    }
}();

module.exports = analytics;