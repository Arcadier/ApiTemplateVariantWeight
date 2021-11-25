'use strict';
var React = require('react');
const PageItemCountComponent = require('../../../common/page-item-count');
var Moment = require('moment');
class MerchantPurchaseSearchComponent extends React.Component {
    constructor(props) {
        super(props);
        // this.searchOrder = this.searchOrder.bind(this);
        // this.inputChange = this.inputChange.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.clearSelectedStatuses = this.clearSelectedStatuses.bind(this);
        this.state = {
            pageCount: 20
        };

    }
    handlePageSizeChange(value) {
        this.setState({ pageCount: parseInt(value) });
        const filter = {
            pageSize: value,
        };
        this.props.searchOrder(filter);
    }

    componentDidMount() {

        let records = this.props.Records;
        // const unique = [...new Set(records.map(i => i.DisplayName))];
        let result = [];
        if (records) {
            records.forEach(function (data) {
                if (data.DisplayName || data.UserName) {
                    result.push({
                        ID: data.ID,
                        Name: data.DisplayName ? data.DisplayName : data.UserName
                    });
                }
            });

        }

        //Dropdown Selections
        let orderstatusCount = this.props.statuses.length;
        let suppliersCount = result.length;

        $('#dropdown-status').find("input[type='checkbox']").on('click', function () {
            let checkCount = 0;
            if ($(this).attr('id') !== "status_0") {
                $('#dropdown-status').find("input[type='checkbox']:checked").each(function (index, element) {
                    var label = $(this).prop("labels");
                    var text = $(label).text().trim();
                    if (text !== "Select All") {
                        checkCount++;
                    }
                });
                if (checkCount !== orderstatusCount) {
                    $("#status_0").prop("checked", false);
                }
                if (checkCount === orderstatusCount) {
                    $("#status_0").prop("checked", true);
                }
            }

        });

        $('#dropdown-supplier').find("input[type='checkbox']").on('click', function () {
            let checkCount = 0;
            if ($(this).attr('id') !== "supplier_0") {
                $('#dropdown-supplier').find("input[type='checkbox']:checked").each(function (index, element) {
                    var label = $(this).prop("labels");
                    var text = $(label).text().trim();
                    if (text !== "Select All") {
                        checkCount++;
                    }
                });
                if (checkCount !== suppliersCount) {
                    $("#supplier_0").prop("checked", false);
                }
                if (checkCount === suppliersCount) {
                    $("#supplier_0").prop("checked", true);
                }
            }
        });
    } 

    componentDidUpdate() {
        $('#btnApply').val('Apply');
    }
    searchOrder(e) {
        if (e === undefined || e.keyCode == 13 || e.target.tagName.toLowerCase() === 'span') {
            const self = this;
            var values = $('#filter-datepicker').val();
            var statuses = "";
            var suppliers = "";

            $('#dropdown-status').find("input[type='checkbox']:checked").each(function (index, element) {
                var id = $(this).attr('id');
                var label = $(this).prop("labels");

                var text = $(this).attr('data-status-id');

                if (id !== "status_0")
                    statuses += text + ',';
            });
            $('#dropdown-supplier').find("input[type='checkbox']:checked").each(function (index, element) {
                var id = $(this).attr('id');
                var pass = $(this).attr('data-status-id');

                if (id !== 'supplier_0')
                    suppliers += pass + ',';
            });

            if (values !== "Timestamp") {
                var dtstart = new Date(values.split("-")[0].trim() + 'Z');
                var dtEnd = new Date(values.split("-")[1].trim() + 'Z');
                var startDate = values !== "Timestamp" ? (Moment(dtstart).format('MM/DD/YYYY hh:mm A')) : '';
                var endDate = values !== "Timestamp" ? (Moment(dtEnd).add(1, 'days').format('MM/DD/YYYY hh:mm A')) : '';
            }
            const filter = {
                pageSize: $('#per-page').val(),
                keyword: this.props.keyword,
                startDate: Math.round(new Date(startDate).getTime() / 1000),
                endDate: Math.round(new Date(endDate).getTime() / 1000),
                supplier: suppliers,
                pageNumber: 1,
                status: statuses.slice(0, -1)
            };
            self.props.searchOrder(filter);
            self.props.updateSelectedSuppliers(suppliers);
            self.props.updateSelectedOrderStatus(statuses.slice(0, -1));
        //    self.props.updateKeyword(this.props.keyword);
            self.props.updateSelectedDates({
                StartDate: Math.round(new Date(startDate).getTime() / 1000),
                EndDate: Math.round(new Date(endDate).getTime() / 1000)
            });
        }
    }
    inputChange(e) {
        this.props.updateKeyword(e.target.value);
        //this.setState({
        //    keyword: e.target.value
        //})
    }
    renderStatuses() {
        const self = this;
        const records = self.props.statuses;
        if (records) {
            return (<ul className="dropdown-menu" id="dropdown-status">
                <li key={0}className="skip-li"><input type="text" className="q" placeholder="Search Status" /></li>
                <li key={1}><a className="x-check parent-check" href="#"><input type="checkbox" name="status_0" id="status_0" />
                    <label htmlFor="status_0"> Select All</label></a></li>
                {
                    records.map(function (obj, index) {
                        return <li key={index + 2}><a className="x-check" href="#">
                     <input type="checkbox" data-status-id={obj.Name} name={obj.Name} id={obj.Name} /><label htmlFor={obj.Name}>{obj.ComputedAlias}</label></a></li>
                    })
                }
            </ul>)
        } else {
            ""
        }
    }
    renderSupplier() {
        const self = this;
        const records = self.props.Records;
        let result = [];

        if (records) {
            records.forEach(function (data) {
                if (data.DisplayName || data.UserName) {
                    result.push({
                        ID: data.ID,
                        Name: data.DisplayName ? data.DisplayName : data.UserName
                    });
                }
            });
        }

        if (result) {
            return (<ul className="dropdown-menu" id="dropdown-supplier">
                <li key={0} className="skip-li"><input type="text" className="q" placeholder="Search Buyer" /></li>
                <li key={1}><a className="x-check parent-check" href="#"><input type="checkbox" name="supplier_0" id="supplier_0" />
                    <label htmlFor="supplier_0"> Select All</label></a></li>
                {
                    result.map(function (obj, index) {
                        return <li key={index + 2}><a className="x-check" href="#">
                            <input type="checkbox" name={obj.ID} id={obj.Name} /><label htmlFor={obj.Name}> {obj.Name}</label></a></li>
                    })
                }
            </ul>)
        } else {
            ""
        }

    }

    clearSelectedStatuses() {
        this.props.updateSelectedOrderStatus(null);
    }

    render() {
        return (
            <React.Fragment>
                <div className="sc-upper">
                    <div className="sc-u title-sc-u sc-u-mid full-width m-change">
                        <span className="sc-text-big">Purchase Order History</span> <small>{this.props.TotalRecords || 0} entries</small>
                        <div className="mobile-only">
                            <PageItemCountComponent onChange={this.handlePageSizeChange} value={this.state.pageCount} />
                        </div>
                    </div>
                </div>
                <div className="sassy-filter lg-filter">
                    <form id="search" onSubmit={(e) => e.preventDefault()}>
                        <div className="sassy-flex">
                            <div className="sassy-l">
                                <div>
                                    <div className="group-search">
                                        <div className="group-search-flex">
                                            <label className="sassy-label">Filter by:</label>
                                            <span className="sassy-search" onClick={(e) => this.searchOrder(e)}>
                                                <input type="text" className="form-control" name="keywords" id="keywords" placeholder="Search..." onKeyUp={(e) => this.searchOrder(e)} defaultValue={this.props.keyword} onChange={(e) => this.inputChange(e)} />
                                            </span>
                                            <div className="filter-list-date-sec sassy-datepicker">
                                                <div className="group-datepicker">
                                                    <input type="text" name="timestamp" id="filter-datepicker" placeholder="Timestamp" />
                                                    <b className="caret" />
                                                </div>
                                            </div>
                                            <span className="select-sassy-wrapper">
                                                <div className="advanced-select" data-model="Supplier Selected">
                                                    <div className="dropdown">
                                                        <input id="supplier" type="button" data-default="Buyer" defaultValue="Buyer" className="trigger" />
                                                        <a href="#" className="btn-toggle" data-toggle="dropdown" aria-expanded="true"><b className="caret" /></a>
                                                        <a href="#" className="x-clear"><i className="fa  fa-times-circle" /></a>
                                                        {this.renderSupplier()}
                                                    </div>
                                                </div>
                                            </span>
                                            <span className="select-sassy-wrapper">
                                                <div className="advanced-select" data-model="Status Selected">
                                                    <div className="dropdown">
                                                        <input id="status" type="button" data-default="Order Status" defaultValue="Order Status" className="trigger" />
                                                        <a href="#" className="btn-toggle" data-toggle="dropdown" aria-expanded="true"><b className="caret" /></a>
                                                        <a href="#" className="x-clear" onClick={this.clearSelectedStatuses}><i className="fa  fa-times-circle" /></a>
                                                        {this.renderStatuses()}
                                                    </div>
                                                </div>
                                            </span>
                                            <input type="submit" className="btn btn-sassy" id="btnApply" defaultValue="Apply" onClick={(e) => this.searchOrder()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <PageItemCountComponent onChange={this.handlePageSizeChange} value={this.state.pageCount} />
                        </div>
                    </form>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = MerchantPurchaseSearchComponent;