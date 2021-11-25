'use strict';
var React = require('react');
import { GoogleCharts } from 'google-charts';
var moment = require('moment');

class Graph extends React.Component {
    constructor(props) {
        super(props);

        this.drawChart = this.drawChart.bind(this);
    }

    componentDidMount() {
        var self = this;
        GoogleCharts.load(self.drawChart);

        $('.salesGraphDay').prop('checked', true)
    }

    drawChart() {
        var self = this;
        // Standard google charts functionality is available as GoogleCharts.api after load

        if (typeof self == 'undefined')
            return '';

        $('#chart_div').show();
        var dataContainer = [];
        dataContainer.push(['X', 'Total Revenue', 'Total Orders'])

        if (typeof self.props != 'undefined' && self.props && self.props.salesTransaction && self.props.salesTransaction.length > 0) {
            this.props.salesTransaction.forEach(function (tran) {
                var temp = [];
                temp.push(tran.Date)
                temp.push(tran.TotalSales)
                temp.push(tran.TotalOrders)
                dataContainer.push(temp);
            });
            var optionsa = {
                colors: ['#00837c', '#ef1c59'],
                width: '100%', height: '400',
                chartArea: { width: '85%', color: 'red' },
                legend: { position: 'top', color: 'red' },
                series: {
                    0: { targetAxisIndex: 0 },
                    1: { targetAxisIndex: 0 }
                }
            };

            const data = GoogleCharts.api.visualization.arrayToDataTable(
                dataContainer
            );

            const pie_1_chart = new GoogleCharts.api.visualization.LineChart(document.getElementById('chart_div'));
            pie_1_chart.draw(data, optionsa);

        } else {
            //show something cool and informative
            
            return self.props.graphEmpty()
        }


    }

    componentDidUpdate() {
        var self = this;
        self.drawChart();
    }

    doDrawChart(type, e) {
        var self = this;
        let pageSize = 100
        $('.saleGraph').prop('checked', false)
        $(e.target).prop('checked', true)
        if (type == 'Day') {
            self.props.getSaleGraphs(this.props.user.ID, 'transactions', moment(new Date()).add(-1, 'days').unix(), moment(new Date()).unix(), 'day', pageSize, 1)
        }
        else if (type == 'Week') {
            self.props.getSaleGraphs(this.props.user.ID, 'transactions', moment(new Date()).add(-7, 'week').unix(), moment(new Date()).unix(), 'week', pageSize, 1)
        }
        else if (type == 'Month') {
            self.props.getSaleGraphs(this.props.user.ID, 'transactions', moment(new Date()).add(-30, 'month').unix(), moment(new Date()).unix(), 'month', pageSize, 1)
        }

    }


    showEmpty() {
        var self = this;
        if (this.props.salesTransaction && this.props.salesTransaction.length > 0) {
            return ''
        }
        else
            return self.props.graphEmpty()
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="dashboard-graph"> <span className="dashboard-grapth-title">Sales</span>
                    <div className="dashlet-choices">
                        <div className="switch-toggle switch-3 switch-candy">
                            <input id="day" name="state-d" type="radio" className="saleGraph salesGraphDay" onChange={(e) => self.doDrawChart('Day', e)} />
                            <label htmlFor="day" onClick={null} id="Graph1Day">Days</label>
                            <input id="week" name="state-d" type="radio" className="saleGraph" onChange={(e) => self.doDrawChart('Week', e)} />
                            <label htmlFor="week" onClick={null} id="Graph1Week">Weeks</label>
                            <input id="month" name="state-d" type="radio" className="saleGraph" onChange={(e) => self.doDrawChart('Month', e)} />
                            <label htmlFor="month" onClick={null} id="Graph1Month">Months</label>
                            <a></a> </div>
                    </div>

                    <div className="chart-style-backoutter">
                        <div id="chart_div" className="chart chart-style">
                            {self.showEmpty()}
                        </div>
                    </div>

                </div>
            </React.Fragment>
        );
    }
}

module.exports = Graph;



