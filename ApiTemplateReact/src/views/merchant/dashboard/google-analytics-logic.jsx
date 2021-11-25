var React = require('react');
var moment = require('moment');

class analyticsApiAccessLogic extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            viewId: '',
            accessToken: '',
            discovery: 'https://analyticsreporting.googleapis.com/$discovery/rest',
            isAuthorized: false
        };
    }

    componentDidMount() {
        var self = this;

        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/client.js";

        if (self.props.analyticsApiAccess && self.props.analyticsApiAccess.access_token != '') {

            script.onload = () => {

                gapi.load('client', () => {

                    gapi.auth.setToken({
                        access_token: self.props.analyticsApiAccess.accessToken
                    });

                    self.setState({
                        isAuthorized: true,
                        viewId: self.props.analyticsApiAccess.viewId,
                        accessToken: self.props.analyticsApiAccess.accessToken
                    }, function () {

                        self.props.onHasPageAnaylytics({ 'key': "item-day" }, function(result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function() {
                                    self.getItemDetailViews("day");
                                }
                            });
                        });

                        self.props.onHasPageAnaylytics({ 'key': "item-week" }, function(result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function() {
                                    self.getItemDetailViews("week");
                                }
                            });
                        });

                        self.props.onHasPageAnaylytics({ 'key': "item-month" }, function (result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function () {
                                    self.getItemDetailViews("month");
                                }
                            })
                        })

                        self.props.onHasPageAnaylytics({ 'key': "item-yesterday" }, function (result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function () {
                                    self.getItemDetailViews("yesterday");
                                }
                            })
                        })

                        self.props.onHasPageAnaylytics({ 'key': "item-previousweek" }, function (result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function () {
                                    self.getItemDetailViews("previousweek");
                                }
                            })
                        })

                        self.props.onHasPageAnaylytics({ 'key': "item-previousmonth" }, function (result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function () {
                                    self.getItemDetailViews("previousmonth");
                                }
                            })
                        })

                        self.props.onHasPageAnaylytics({ 'key': "home-today" }, function (result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function () {
                                    self.getHomePageViews({
                                        domain: self.props.baseUrl,
                                        startDate: "61daysAgo",
                                        success: function (result) {
                                            var dates = self.getDateVisits(result);

                                            self.addPageAnaylytics({
                                                data: {
                                                    Category: "home",
                                                    Items: [
                                                        { Key: "home-today", ViewCount: dates.today },
                                                        { Key: "home-yesterday", ViewCount: dates.yesterday },
                                                        { Key: "home-week", ViewCount: dates.week },
                                                        { Key: "home-previous-week", ViewCount: dates.previousWeek },
                                                        { Key: "home-month", ViewCount: dates.month },
                                                        { Key: "home-previous-month", ViewCount: dates.previousMonth }
                                                    ]
                                                },
                                                successMessage: "Saving home page views successful!",
                                                failMessage: "Failed to save home page views.",
                                                success: function () {
                                                    //salesDashboardHandler.RefreshTotals
                                                }
                                            });
                                        },
                                        fail: function (error) {
                                        }
                                    });
                                }
                            })
                        })

                        self.props.onHasPageAnaylytics({ 'key': "merchant-today" }, function (result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function () {
                                    self.getMerchantPageViewsByDate({
                                        domain: self.props.baseUrl,
                                        merchantId: self.props.user.ID,
                                        startDate: "61daysAgo",
                                        success: function (result) {
                                            var dates = self.getDateVisits(result);

                                            self.addPageAnaylytics({
                                                data: {
                                                    Category: "merchant",
                                                    Items: [
                                                        { Key: "merchant-today", ViewCount: dates.today, UserID: self.props.user.ID },
                                                        { Key: "merchant-yesterday", ViewCount: dates.yesterday, UserID: self.props.user.ID },
                                                        { Key: "merchant-week", ViewCount: dates.week, UserID: self.props.user.ID },
                                                        { Key: "merchant-previous-week", ViewCount: dates.previousWeek, UserID: self.props.user.ID },
                                                        { Key: "merchant-month", ViewCount: dates.month, UserID: self.props.user.ID },
                                                        { Key: "merchant-previous-month", ViewCount: dates.previousMonth, UserID: self.props.user.ID }
                                                    ]
                                                },
                                                successMessage: "Saving merchant profile views successful!",
                                                failMessage: "Failed to save merchant profile views.",
                                                success: function () {
                                                    //salesDashboardHandler.RefreshTotals
                                                }
                                            });
                                        },
                                        fail: function (error) {

                                        }
                                    });
                                }
                            })
                        })

                    })
                })
            }
        }

        document.body.appendChild(script);
    }

    canGetAnalytics(options) {
        if (!options.Result)
            options.success();
    }

    getDateVisits(items) {
        var self = this;
        return {
            today: self.getVisitsByDate(items, self.subtractToday(1)),
            yesterday: self.getVisitsByDate(items, self.subtractToday(2), self.subtractToday(1)),
            week: self.getVisitsByDate(items, self.subtractToday(8), self.subtractToday(1)),
            previousWeek: self.getVisitsByDate(items, self.subtractToday(15), self.subtractToday(8)),
            month: self.getVisitsByDate(items, self.subtractToday(31), self.subtractToday(1)),
            previousMonth: self.getVisitsByDate(items, self.subtractToday(61), self.subtractToday(31)),
        }
    }

    subtractToday(days) {
        var today = new Date();
        return new Date((new Date()).setDate(today.getDate() - days));
    }

    getVisitsByDate(items, startDate, endDate) {
        var self = this;
        var viewCount = 0;

        if (items && items.length > 0) {
            startDate.setHours(0, 0, 0, 0);
            if (endDate) {
                endDate.setHours(0, 0, 0, 0);
            }

            items.some(function (item) {
                var date = self.convertGADate(item.Date);
                var value = parseInt(item.ViewCount);
                date.setHours(0, 0, 0, 0);

                if (!endDate && date.getTime() === startDate.getTime()) {
                    viewCount = value;
                    return true;
                } else if (date >= startDate && date <= endDate) {
                    viewCount += value;
                } else {
                    return true;
                }
            });
        }
        return viewCount;
    }

    convertGADate(gaDate) {
        if (gaDate) {
            gaDate = gaDate.slice(0, 4) + "-" + gaDate.slice(4, 6) + "-" + gaDate.slice(6);
            return new Date(gaDate);
        }
        return null;
    }

    addPageAnaylytics(options) {
        var self = this;

        if (options.data) {
            self.props.onAddPageAnaylytics({ data: options.data })
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
    queryReports(options) {
        var self = this
        // Load the API from the client discovery URL.        
        gapi.client.load(self.state.discovery)
            .then(function () {
                // Call the Analytics Reporting API V4 batchGet method.
                gapi.client
                    .analyticsreporting
                    .reports
                    .batchGet(options.data)
                    .then(function (response) {
                        if (options.success) {
                            //Parse result into an array of items
                            var data = self.parseResult(response, options);
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
    parseResult(response, options) {
        var self = this
        var items = [];

        if (response
            && response.result
            && response.result.reports
            && response.result.reports.length > 0) {

            var report = response.result.reports[0];
            if (report.data && report.data.rows && report.data.rows.length > 0) {
                //create the item object based on headers from result
                var columns = self.parseColumns(report.columnHeader, options);
                //get actual values into an array of items
                items = self.parseValues(report, columns, options);
            }
        }

        return items;
    }

    //create the item object based on headers from result
    parseColumns(header, options) {
        var self = this
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
    parseValues(report, columns, options) {
        var self = this
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
                        item[columName] = self.parsePagePath(value, columName, options);
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
    parsePagePath(value, columnName, options) {
        var self = this
        if (options.parsePagePath) {
            var propertyNames = options.propertyNames || {};
            if (columnName.toLowerCase() === 'pagepath'
                || (propertyNames['pagePath'] || '').toLowerCase() === columnName.toLowerCase()) {
                return options.parsePagePath(value);
            }
        }

        return value;
    }


    //Item Detail Visits
    getItemDetailViews(timeFrame) {
        var self = this;

        var startDate = null, endDate = null;

        switch (timeFrame) {
            case 'day':
                startDate = 'yesterday';
                break;
            case 'week':
                startDate = '7daysAgo';
                break;
            case 'month':
                startDate = '30daysAgo';
                break;
            case 'yesterday':
                startDate = '2daysAgo';
                endDate = '2daysAgo';
                break;
            case 'previousweek':
                startDate = '14daysAgo';
                endDate = '8daysAgo';
                break;
            case 'previousmonth':
                startDate = '60daysAgo';
                endDate = '31daysAgo';
                break;
            default:
                break;
        }

        self.doGetItemDetailViews({
            domain: self.props.domain,
            startDate: startDate,
            endDate: endDate,
            success: function (result) {
                if (result) {
                    self.addPageAnaylytics({
                        data: {
                            Category: "item-" + timeFrame,
                            Items: result
                        },
                        successMessage: "Saving item detail views successful!",
                        failMessage: "Failed to save item detail views.",
                        success: function () {
                            //salesDashboardHandler.RefreshMostViewedItems
                        }
                    });
                }
            }
        });
    }


    // Get datas
    doGetItemDetailViews(options) {
        var self = this
        var host = options.domain || window.location.hostname;
        if (!options) options = {};

        if (!options.startDate) {
            //options.endDate = "today";
            options.startDate = "yesterday";
        }

        if (!options.endDate) {
            //options.endDate = "today";
            options.endDate = "yesterday";
        }

        options.propertyNames = {
            pagePath: "ItemID",
            pageviews: "ViewCount",
            uniquePageviews: "ViewCount"
        }

        options.data = {
            reportRequests: [{
                viewId: self.state.viewId,
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
                filtersExpression: "ga:pagePath=~^/items/;ga:uniquePageviews>0;ga:hostname==" + host,
            }]
        }
        options.parsePagePath = function (path) {
            var parts = path.split('/').filter(function (e) { return e });
            return (parts.length > 0) ? parts[parts.length - 1] : path;
        }

        self.queryReports(options);
    }

    getHomePageViews(options) {
        var self = this
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
                viewId: self.state.viewId,
                metrics: [{
                    expression: "ga:uniquePageviews",
                    formattingType: "INTEGER"
                }],
                dimensions: [
                    { name: "ga:date" }
                ],
                dateRanges: [{
                    startDate: options.startDate,
                    //endDate: "today"
                    endDate: "yesterday"
                }],
                filtersExpression: "ga:pagePath==/,ga:pagePath==/user,ga:pagePath==/user/,ga:pagePath==/user/marketplace,ga:pagePath==/user/marketplace/" +
                    ";ga:uniquePageviews>0" +
                    //";ga:hostname==bespokeapi01.rachrah.com",
                    ";ga:hostname==" + host,
                    //";ga:hostname==localhost",
                orderBys: [{
                    fieldName: "ga:date",
                    sortOrder: "DESCENDING"
                }]
            }]
        }
        self.queryReports(options);
    }

    getMerchantPageViewsByDate(options) {
        
        var self = this
        var host = options.domain || window.location.hostname;
        var pathFilter = 'ga:pagePath=~/storefront\\?merchantId=' + options.merchantId;
        pathFilter += ',ga:pagePath=~/storefront/Index\\?merchantId=' + options.merchantId;
        pathFilter += ',ga:pagePath=~/storefront/' + options.merchantId;

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
                viewId: self.state.viewId,
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
                    //endDate: "today"
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
        self.queryReports(options);
    }

    getMerchantPageViews(options) {
        var self = this
        var host = options.domain || window.location.hostname;
        options.data = {
            reportRequests: [{
                viewId: self.state.viewId,
                metrics: [{
                    expression: "ga:uniquePageviews",
                    formattingType: "INTEGER"
                }],
                dimensions: [
                    { name: "ga:pagePath" },
                    { name: "ga:hostname" }
                ],
                filtersExpression: "ga:pagePath=~^/storefront,ga:pagePath=~/storefront/Index" +
                    ";ga:uniquePageviews>0" +
                    ";ga:hostname==" + host
                    //";ga:hostname==localhost"
            }]
        }
        self.queryReports(options);
    }

    render() {
        var self = this;
        return (
            <React.Fragment>

            </React.Fragment>
        );
    }
}

module.exports = analyticsApiAccessLogic;



