'use strict';
const React = require('react');

class StoreFrontAnalytics extends React.Component {
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
		const self = this;

        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/client.js";

        if (self.props.analyticsApiAccess && self.props.analyticsApiAccess.accessToken != '') {
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

                        self.props.onHasPageAnaylytics({ 'key': "merchant-profile" }, function (result) {
                            self.canGetAnalytics({
                                result: result,
                                success: function () {
                                    self.getMerchantPageViews({
                                        domain: self.props.baseUrl,
                                        merchantId: self.props.merchantUser.ID,
                                        success: function (results) {
                                        	console.log(results);
											const viewCount = results.reduce(function (prevVal, elem) {
								                return parseInt(prevVal) + parseInt(elem.uniquePageviews);
								            }, 0);

                                            self.addPageAnaylytics({
                                                data: {
                                                    Category: "merchant",
                                                    Items: [
                                                        { Key: "merchant-profile", ViewCount: viewCount, UserID: self.props.merchantUser.ID },
                                                    ]
                                                },
                                                successMessage: "Saving merchant profile views successful!",
                                                failMessage: "Failed to save merchant profile views.",
                                                success: function () {
                                                }
                                            });
                                        },
                                        fail: function (error) {

                                        }
                                    });
                                }
                            });
                        });
                    });
                });
            }
        }
        document.body.appendChild(script);
	}

	canGetAnalytics(options) {
        if (!options.Result)
            options.success();
    }

    getMerchantPageViews(options) {
        const self = this
        const pathFilter = 'ga:pagePath=~/storefront/' + options.merchantId;
        let hostnameFilter = ';ga:hostname==' + options.domain;
        hostnameFilter += ',ga:hostname==' + window.location.hostname;
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
                filtersExpression: pathFilter +
                    ";ga:uniquePageviews>0" +
                    hostnameFilter
            }]
        }
        self.queryReports(options);
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

	render() {
		return (
            <React.Fragment>

            </React.Fragment>
        );
	}
}

module.exports = StoreFrontAnalytics;