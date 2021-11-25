'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
let FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;
var HeaderLayout = require('../../../views/layouts/header').HeaderLayoutComponent;
var SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
var Graph = require('./graph');
var TopSold = require('./topsold');
var TopViewed = require('./topviewed');
var BaseComponent = require('../../../views/shared/base');
var transactionActions = require('../../../redux/transactionActions');
var activityLogActions = require('../../../redux/ActivityLogAction');
var moment = require('moment');
var commonModule = require('../../../public/js/common');
var GoogleAnalyticsLogic = require('./google-analytics-logic');

class DashboardPageComponent extends BaseComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    doMenuTopReport(type, e) {
        var self = this;
        let pageSize = 100
        $('[headerfilter]').removeClass('active')
        $(e.target).addClass('active')

        if (type == 'Day') {
            self.props.getMenuTopReports(this.props.user.ID, 'transactions', moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1)
            self.props.getMenuTopReportsTransactionGrowth(this.props.user.ID, 'transactions', moment(new Date()).add(-2, 'days').unix(), moment(new Date()).add(-1, 'days').unix(), 'day', pageSize, 1)
            self.props.getHeaderTotalVisits(this.props.user.ID, 'headerTotalVisits', moment(new Date()).add(-2, 'days').unix(), moment(new Date()).add(-1, 'days').unix(), 'day', pageSize, 1)
        }
        else if (type == 'Week') {
            self.props.getMenuTopReports(this.props.user.ID, 'transactions', moment(new Date()).add(-7, 'week').unix(), moment(new Date()).unix(), 'week', pageSize, 1)
            self.props.getMenuTopReportsTransactionGrowth(this.props.user.ID, 'transactions', moment(new Date()).add(-14, 'week').unix(), moment(new Date()).add(-7, 'week').unix(), 'week', pageSize, 1)
            self.props.getHeaderTotalVisits(this.props.user.ID, 'headerTotalVisits', moment(new Date()).add(-14, 'week').unix(), moment(new Date()).add(-7, 'week').unix(), 'week', pageSize, 1)
        }
        else if (type == 'Month') {
            self.props.getMenuTopReports(this.props.user.ID, 'transactions', moment(new Date()).add(-30, 'month').unix(), moment(new Date()).unix(), 'month', pageSize, 1)
            self.props.getMenuTopReportsTransactionGrowth(this.props.user.ID, 'transactions', moment(new Date()).add(-60, 'month').unix(), moment(new Date()).add(-30, 'month').unix(), 'month', pageSize, 1)
            self.props.getHeaderTotalVisits(this.props.user.ID, 'headerTotalVisits', moment(new Date()).add(-60, 'month').unix(), moment(new Date()).add(-30, 'month').unix(), 'month', pageSize, 1)
        }

    }

    doBottomFooter(type, e) {

        var self = this;
        let pageSize = 100
        $('[bottomfooter]').removeClass('active')
        $(e.target).addClass('active')

        if (type == 'Day') {
            self.props.getBottomFooters(this.props.user.ID, 'items', moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1)
            self.props.getTopViewedTranasctions(this.props.user.ID, 'topViewed', moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1)
        }
        else if (type == 'Week') {
            self.props.getBottomFooters(this.props.user.ID, 'items', moment(new Date()).add(-7, 'week').unix(), moment(new Date()).unix(), 'week', pageSize, 1)
            self.props.getTopViewedTranasctions(this.props.user.ID, 'topViewed', moment(new Date()).add(-7, 'week').unix(), moment(new Date()).unix(), 'week', pageSize, 1)
        }
        else if (type == 'Month') {
            self.props.getBottomFooters(this.props.user.ID, 'items', moment(new Date()).add(-30, 'month').unix(), moment(new Date()).unix(), 'month', pageSize, 1)
            self.props.getTopViewedTranasctions(this.props.user.ID, 'topViewed', moment(new Date()).add(-30, 'month').unix(), moment(new Date()).unix(), 'month', pageSize, 1)
        }

    }

    getTotalSales() {

        if (this.props.headerTransaction && this.props.headerTransaction.length > 0) {
            return (this.props.headerTransaction.map(o => o.TotalSales).reduce((a, c) => a + c)).toFixed(2);;
        }
        return 0
    }

    getTotalOrders() {
        if (this.props.headerTransaction && this.props.headerTransaction.length > 0) {
            return (this.props.headerTransaction.map(o => o.TotalOrders).reduce((a, c) => a + c)).toFixed(2);;
        }
        return 0
    }


    previousTransactions() {
        var self = this;

        return {
            getPreviousTotalSales() {
                if (typeof self.props.headerTransactionGrowthRate !== 'undefined' && self.props.headerTransactionGrowthRate && self.props.headerTransactionGrowthRate.length > 0) {
                    return (self.props.headerTransactionGrowthRate.map(o => o.TotalSales).reduce((a, c) => a + c));
                }
                return 0
            },
            getPreviousTotalOrders() {

                if (self.props.headerTransactionGrowthRate && self.props.headerTransactionGrowthRate.length > 0) {
                    return (self.props.headerTransactionGrowthRate.map(o => o.TotalOrders).reduce((a, c) => a + c));
                }
                return 0
            },
            getPreviousAverageOrderByRevenue() {

                var order = self.previousTransactions().getPreviousTotalOrders();
                var sales = self.previousTransactions().getPreviousTotalSales();

                if (order == 0)
                    return 0
                else {
                    return parseFloat(sales / order).toFixed(2);
                }
            },
            getPreviousTotalCartItemQuantity() {
                if (self.props.headerTransactionGrowthRate && self.props.headerTransactionGrowthRate.length > 0) {
                    return (self.props.headerTransactionGrowthRate.map(o => o.TotalCartItemQuantity).reduce((a, c) => a + c));
                }
                return 0
            },
            getPreviousAverageItemSoldPerOrder() {
                var order = self.previousTransactions().getPreviousTotalOrders();
                var cartItemQuantity = self.previousTransactions().getPreviousTotalCartItemQuantity();

                if (order == 0)
                    return 0
                else {
                    return parseFloat(cartItemQuantity / order).toFixed(2)
                }
            }
        }
    }

    totalSalesPercentage() {
        var self = this;
        return {
            getTotalSalesPercentage() {
                return (self.getGrowthRate(self.getTotalSales(), self.previousTransactions().getPreviousTotalSales()) * 100).toFixed(0)
            },
            getTotalOrdersPercentage() {
                return (self.getGrowthRate(self.getTotalOrders(), self.previousTransactions().getPreviousTotalOrders()) * 100).toFixed(0)
            },
            getAverageOrderByRevenuePercentage() {
                return (self.getGrowthRate(self.getAverageOrderByRevenue(), self.previousTransactions().getPreviousAverageOrderByRevenue()) * 100).toFixed(0)
            },
            getAverageItemSoldPerOrderPercentage() {
                return (self.getGrowthRate(self.getAverageItemSoldPerOrder(), self.previousTransactions().getPreviousAverageItemSoldPerOrder()) * 100).toFixed(0)
            },
            getTotalVisitsPercentage() {
                if (typeof self.props.headerTotalVisits !== 'undefined' && self.props.headerTotalVisits.length > 0) {
                    return (self.props.headerTotalVisits[0].GrowthRate * 100).toFixed(0);
                }
                return 0;
            }

        }
    }

    getGrowthRate(currentValue, previousValue) {
        if (previousValue == currentValue) {
            return 0;
        }
        if (currentValue == 0) {
            return -1;
        }
        if (previousValue == 0) {
            return 1;
        }
        if (previousValue < currentValue) {
            return ((currentValue - previousValue) / currentValue).toFixed(2);;
        }
        return ((currentValue - previousValue) / previousValue).toFixed(2);;
    }

    getTotalCartItemQuantity() {
        if (this.props.headerTransaction && this.props.headerTransaction.length > 0) {
            return (this.props.headerTransaction.map(o => o.TotalCartItemQuantity).reduce((a, c) => a + c));
        }
        return 0
    }


    getAverageOrderByRevenue() {
        var self = this;

        var order = self.getTotalOrders();
        var sales = self.getTotalSales();

        if (order == 0)
            return 0
        else {
            return parseFloat(sales / order).toFixed(2);
        }
    }

    getAverageItemSoldPerOrder() {
        var self = this;

        var order = self.getTotalOrders();
        var cartItemQuantity = self.getTotalCartItemQuantity();

        if (order == 0)
            return 0
        else {
            return parseFloat(cartItemQuantity / order).toFixed(2)
        }
    }

    getTotalVisits() {
        var self = this;

        if (typeof self.props.headerTotalVisits !== 'undefined' && self.props.headerTotalVisits.length > 0) {
            return self.props.headerTotalVisits[0].TotalVisits;
        }

        return 0;
    }

    graphEmpty() {
        return (
            <React.Fragment >
                <div className="graph-empty">
                    <img src="/assets/images/cannot-found.png" />
                </div>
            </React.Fragment>);
    }

    render() {
        var self = this;
        this.props.user.isBuyerSideBar = false;
        return (
            <React.Fragment>
                <GoogleAnalyticsLogic
                    analyticsApiAccess={self.props.analyticsApiAccess}
                    onAddPageAnaylytics={self.props.onAddPageAnaylytics}
                    baseUrl={self.props.baseUrl}
                    user={self.props.user}
                    onHasPageAnaylytics={self.props.onHasPageAnaylytics}
                />
                <div className="header mod" id="header-section">
                    <HeaderLayout user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="dashboard-container">
                            <div className="container-fluid">
                                <div class="sc-upper">
                                    <div class="sc-u title-sc-u sc-u-mid full-width">
                                    <span class="sc-text-big">Dashboard</span>
                                  </div>
                                </div>
                                <div className="dashboard-content">

                                    <div className="dashboard-menus top">
                                        <ul>
                                            <li id="btn24Hrs" onClick={(e) => self.doMenuTopReport('Day', e)} headerfilter="headerFilter" className="active">Last 24 Hrs</li>
                                            <li id="btn7Days" onClick={(e) => self.doMenuTopReport('Week', e)} headerfilter="headerFilter" className="">Last 7 Days</li>
                                            <li id="btn30Days" onClick={(e) => self.doMenuTopReport('Month', e)} headerfilter="headerFilter" className="">Last 30 Days</li>
                                        </ul>
                                    </div>

                                    <div className="dashboard-board">
                                        <ul>
                                            <li className="total-sale">
                                                <p>Total Sales</p>
                                                <div className="total-value">
                                                    {self.renderFormatMoney(self.props.currencyCode, self.getTotalSales())}
                                                   
                                                </div>
                                                <div className="high-low green">
                                                    <div className={self.totalSalesPercentage().getTotalSalesPercentage() > 0 ? 'arrow-up' : 'arrow-up hide'}></div>
                                                    <div className={self.totalSalesPercentage().getTotalSalesPercentage() < 0 ? 'arrow-down' : 'arrow-down hide'}></div>
                                                    <span><span className="odometer" id="salePercentage">{self.totalSalesPercentage().getTotalSalesPercentage()}</span>%</span> </div>
                                            </li>
                                            <li className="total-order">
                                                <p>Total Orders</p>
                                                <div className="total-value odometer" id="orderValue">{self.getTotalOrders()}</div>
                                                <div className={"high-low" + (self.totalSalesPercentage().getTotalOrdersPercentage() > 0 ? "green" : "red")}>
                                                    <div className={self.totalSalesPercentage().getTotalOrdersPercentage() > 0 ? 'arrow-up' : 'arrow-up hide'}></div>
                                                    <div className={self.totalSalesPercentage().getTotalOrdersPercentage() < 0 ? 'arrow-down' : 'arrow-down hide'}></div>
                                                    <span><span className="odometer" id="orderPercentage">{self.totalSalesPercentage().getTotalOrdersPercentage()}</span>%</span> </div>
                                            </li>
                                            <li className="total-visit">
                                                <p>Total Visits</p>
                                                <div className="total-value odometer" id="visitTotal">{self.getTotalVisits()}</div>
                                                <div className="high-low green">
                                                    <div className={self.totalSalesPercentage().getTotalVisitsPercentage() > 0 ? 'arrow-up' : 'arrow-up hide'}></div>
                                                    <div className={self.totalSalesPercentage().getTotalVisitsPercentage() < 0 ? 'arrow-down' : 'arrow-down hide'}></div>
                                                    <span><span className="odometer" id="visitPercantage">{self.totalSalesPercentage().getTotalVisitsPercentage()}</span>%</span> </div>
                                            </li>
                                            <li className="average-rev">
                                                <p>Avr Order By Rev</p>
                                                <div className="total-value odometer" id="averageRev">{self.getAverageOrderByRevenue()}</div>
                                                <div className="high-low">
                                                    <div className={self.totalSalesPercentage().getAverageOrderByRevenuePercentage() > 0 ? 'arrow-up' : 'arrow-up hide'}></div>
                                                    <div className={self.totalSalesPercentage().getAverageOrderByRevenuePercentage() < 0 ? 'arrow-down' : 'arrow-down hide'}></div>
                                                    <span><span className="odometer" id="revPercentage">{self.totalSalesPercentage().getAverageOrderByRevenuePercentage()}</span>%</span> </div>
                                            </li>
                                            <li className="average-sold">
                                                <p>Avr Items Sold Per Order</p>
                                                <div className="total-value odometer" id="averageSold">{self.getAverageItemSoldPerOrder()}</div>
                                                <div className="high-low">
                                                    <div className={self.totalSalesPercentage().getAverageItemSoldPerOrderPercentage() > 0 ? 'arrow-up' : 'arrow-up hide'}></div>
                                                    <div className={self.totalSalesPercentage().getAverageItemSoldPerOrderPercentage() < 0 ? 'arrow-down' : 'arrow-down hide'}></div>
                                                    <span><span className="odometer" id="soldPercentage">{self.totalSalesPercentage().getAverageItemSoldPerOrderPercentage()}</span>%</span> </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <Graph graphEmpty={self.graphEmpty} user={this.props.user} salesTransaction={this.props.salesTransaction} getSaleGraphs={self.props.getSaleGraphs} />

                                    <div className="dashboard-menus bottom">
                                        <ul>
                                            <li onClick={(e) => self.doBottomFooter('Day', e)} bottomfooter="bottomfooter" className="active">Last 24 Hrs</li>
                                            <li onClick={(e) => self.doBottomFooter('Week', e)} bottomfooter="bottomfooter">Last 7 Days</li>
                                            <li onClick={(e) => self.doBottomFooter('Month', e)} bottomfooter="bottomfooter">Last 30 Days</li>
                                        </ul>
                                    </div>

                                    <div className="dashboard-tables">
                                        <TopSold graphEmpty={self.graphEmpty} footerTransaction={this.props.footerTransaction} />
                                        <TopViewed graphEmpty={self.graphEmpty} topViewedTransaction={this.props.topViewedTransaction} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer" id="footer-section">
                        <FooterLayout panels={this.props.panels} />
                    </div>
                </div>

            </React.Fragment>
        );
    }
}


function mapStateToProps(state, ownProps) {
    return {
        user: state.dashboardReducer.user,
        transactions: state.dashboardReducer.transactions,
        headerTransaction: state.dashboardReducer.headerTransaction,
        footerTransaction: state.dashboardReducer.footerTransaction,
        salesTransaction: state.dashboardReducer.salesTransaction,
        topViewedTransaction: state.dashboardReducer.topViewedTransaction,
        headerTransactionGrowthRate: state.dashboardReducer.headerTransactionGrowthRate,
        headerTotalVisits: state.dashboardReducer.headerTotalVisits,
        googleAnalytics: state.dashboardReducer.googleAnalytics,
        analyticsApiAccess: state.dashboardReducer.analyticsApiAccess,
        baseUrl: state.dashboardReducer.baseUrl,
        currencyCode: state.dashboardReducer.currencyCode
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getTransactions: (pageSize, pageNumber, keyWords, startDate, endDate, sort) => dispatch(transactionActions.getTransactions(pageSize, pageNumber, keyWords, startDate, endDate, sort)),
        getMenuTopReports: (merchantId, type, startDate, endDate, report_by, pageSize, pageNumber) => dispatch(transactionActions.getReports(merchantId, type, startDate, endDate, report_by, pageSize, pageNumber, 'menuTop')),
        getBottomFooters: (merchantId, type, startDate, endDate, report_by, pageSize, pageNumber) => dispatch(transactionActions.getReports(merchantId, type, startDate, endDate, report_by, pageSize, pageNumber, 'bottomFooter')),
        getSaleGraphs: (merchantId, type, startDate, endDate, report_by, pageSize, pageNumber) => dispatch(transactionActions.getReports(merchantId, type, startDate, endDate, report_by, pageSize, pageNumber, 'salesGraph')),
        getTopViewedTranasctions: (merchantId, type, startDate, endDate, report_by, pageSize, pageNumber) => dispatch(transactionActions.getReports(merchantId, type, startDate, endDate, report_by, pageSize, pageNumber, 'topViewed')),
        getMenuTopReportsTransactionGrowth: (merchantId, type, startDate, endDate, report_by, pageSize, pageNumber) => dispatch(transactionActions.getReports(merchantId, type, startDate, endDate, report_by, pageSize, pageNumber, 'menuTopGrowthRate')),
        getHeaderTotalVisits: (merchantId, type, startDate, endDate, report_by, pageSize, pageNumber) => dispatch(transactionActions.getReports(merchantId, type, startDate, endDate, report_by, pageSize, pageNumber, 'headerTotalVisits')),
        onAddPageAnaylytics: (data) => dispatch(activityLogActions.addPageAnaylytics(data)),
        onHasPageAnaylytics: (options, callback) => dispatch(activityLogActions.hasPageAnaylytics(options, callback))
    }
}

const DashboardReduxConnect = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(DashboardPageComponent)

module.exports = {
    DashboardReduxConnect,
    DashboardPageComponent
}
