'use strict';

const React = require('react');
const Moment = require('moment');
var BaseComponent = require('../../shared/base');
if (typeof window !== 'undefined') { var $ = window.$; }
require('daterangepicker');


class RequisitionListFilterComponent extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            filterStatusOptions: '', 
            filterSupplierOptions: '',
        }

        this.timestampFilter = '';
        this.statusesFilter = [];
        this.startDateFilter = null;
        this.endDateFilter = null;
        this.onSearchStatusCheckboxChanged = this.onSearchStatusCheckboxChanged.bind(this);
        this.onSearchSupplierCheckboxChanged = this.onSearchSupplierCheckboxChanged.bind(this);
        this.onChange = this.onChange.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.pageSizeOptions = [10, 20, 50, 100];        
    }

    

    componentDidMount() {
        $('#filter-datepicker').daterangepicker({
            opens: 'right',
            autoUpdateInput: false,
            locale: {
                format: 'DD/MM/YYYY',
                cancelLabel: 'Clear'
            }
        });

        $('#filter-datepicker').on('apply.daterangepicker', (event, picker) => {
            this.startDateFilter = picker.startDate.utc(true).format();
            this.endDateFilter = picker.endDate.utc(true).format();
            const dateRange = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
            $('#filter-datepicker').val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));

            this.changeFilterDate(dateRange);
        });

        $('#filter-datepicker').on('cancel.daterangepicker', (event, picker) => {
            this.startDateFilter = null;
            this.endDateFilter = null;
            $('#filter-datepicker').val('');

            this.changeFilterDate('');
        });

        $('.sassy-search-event').click(function(e) {         
            if (e.target.className.includes("sassy-search-event")) {
                $('#form-search-btn').click();
            }            
        });
            

        //Prevent dropdown to close
        $('.advanced-select .dropdown').on('hide.bs.dropdown', function() {
            return false;
        });

        //Close dropdown to click outside
        $('body').on('click', function(e) {
            var $target = $(e.target);
            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });

        $('.advanced-select .trigger').on('click', function() {
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
            } else {
                $('.advanced-select .dropdown.open').removeClass('open');
                $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
            }
        });

        //Toggle sub items
        $('.advanced-select li.has-sub .toggle-sub').on('click', function(e) {
            var $this = $(this);
            var $icon = $this.find('.x-arrow');
            var $ul = $this.next('.sub-items');
            $ul.slideToggle();
            $this.parents('.dropdown').addClass('open');
            if ($icon.hasClass('x-arrow-down')) {
                $icon.removeClass('x-arrow-down');
                $icon.addClass('x-arrow-up');
            } else {
                $icon.removeClass('x-arrow-up');
                $icon.addClass('x-arrow-down');
            }
        });
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    changeFilterDate(value) {
        this.timestampFilter = value;
    }

    onSearchStatusCheckboxChanged(id) {        
        this.props.setStatusFilter(id);        
    }

    onSearchSupplierCheckboxChanged(id) {
        this.props.setSupplierFilter(id);
    }

    applyFilter(e) {
        e.preventDefault();
        let statusesFilter = [];
        const { statuses } = this.props;
        if (statuses) {
            statuses.forEach(item => {
                if (item.isChecked && item.ID > 0) {
                    statusesFilter.push(item.ID);
                }
            });            
        }
        let suppliersFilter = [];
        const { suppliers } = this.props;
        if (suppliers) {
            suppliers.forEach(item => {
                if (item.isChecked && item.ID > 0) {
                    suppliersFilter.push(item.ID);
                }
            });
        }
    
        var startDate = null;
        var endDate = null;
        if (this.timestampFilter && this.timestampFilter.toLowerCase() !== 'Timestamp') {
            var range =  this.timestampFilter.split("-");
            var dtstart = range[0].trim();
            var dtEnd = range[1].trim();
            startDate = Moment(dtstart, 'DD/MM/YYYY').startOf('day').utc().unix();
            endDate = Moment(dtEnd, 'DD/MM/YYYY').endOf('day').utc().unix();
        }
 
        const filters = {
            requisitionNo: e.target["requisitionNo"].value,
            startDate: startDate, 
            endDate: endDate,
            statuses: statusesFilter,
            suppliers: suppliersFilter,
            PageSize: e.target["per-page"].value, 
            PageNumber: 1
        };
        this.props.filterRequisitions(filters);
    }

    renderStatusClearButton() {
        const filterStatus = this.props.statuses || [];
        let selectedStatus = 0;
        if (filterStatus) {
            filterStatus.forEach(item => {
                if (item.isChecked && item.ID > 0) {
                    selectedStatus += 1;
                }
            });         
        }
        if (!!selectedStatus) {
            return (<a onClick={() => this.onSearchStatusCheckboxChanged(100)} style={{cursor: "pointer"}}><i className="fa fa-times-circle"></i></a>);
        }
        return null;
    }

    renderSupplierClearButton() {
        const filterSuppliers = this.props.suppliers || [];
        let selectedSuppliers = 0;
        if (filterSuppliers) {
            filterSuppliers.forEach(item => {
                if (item.isChecked && item.ID > 0) {
                    selectedSuppliers += 1;
                }
            });
        }
        if (!!selectedSuppliers) {
            return (<a onClick={() => this.onSearchSupplierCheckboxChanged(100)} style={{cursor: "pointer"}}><i className="fa  fa-times-circle"></i></a>)
        }
        return null;
    }
    
    render() {
        const self = this;
        let filterStatus = this.props.statuses || [];        
        const selectedPageSize = this.props.filters.PageSize;
        const { filterStatusOptions, filterSupplierOptions } = this.state;
        
        let selectedStatus = 0;
        let filterStatusText = 'Search Status'
        if (filterStatus) {
            filterStatus.forEach(item => {
                if (item.isChecked && item.ID > 0) {
                    filterStatusText = item.Name
                    selectedStatus += 1;
                }
            });         
        }        
        if (selectedStatus > 1) {
            filterStatusText = `${selectedStatus} State Selected`;
        }

        if (!!filterStatusOptions) {
            filterStatus = filterStatus.filter((item) => item.Name.toLowerCase().includes(filterStatusOptions.toLowerCase()));
        }

        let filterSuppliers = this.props.suppliers || [];
        let selectedSuppliers = 0;
        let filterSupplierText = 'Supplier';
        if (filterSuppliers) {
            filterSuppliers.forEach(item => {
                if (item.isChecked && item.ID > 0) {
                    filterSupplierText = item.Name;
                    selectedSuppliers += 1;
                }
            });
        }
        if (selectedSuppliers > 1) {
            filterSupplierText = `${selectedSuppliers} Supplier Selected`;
        }
        if (!!filterSupplierOptions) {
            filterSuppliers = filterSuppliers.filter((item) => item.Name.toLowerCase().includes(filterSupplierOptions.toLowerCase()));
        }

        return (
            <div className="sassy-filter lg-filter">
                <form action="" id="search" onSubmit={this.applyFilter}>
                    <div className="sassy-flex">
                        <div className="sassy-l">
                            <div>
                                <div className="group-search">
                                    <div className="group-search-flex">
                                        <label htmlFor="" className="sassy-label">Filter by:</label>
                                        <span className={"sassy-search sassy-search-event"}>
                                            <input
                                                className="form-control"
                                                name="requisitionNo"
                                                id="keywords"
                                                placeholder="Requisition No."
                                            />
                                        </span>
                                        <div className="filter-list-date-sec sassy-datepicker">
                                            <div className="group-datepicker">
                                                <input
                                                    type="text"
                                                    name="timestamp"
                                                    id="filter-datepicker"
                                                    placeholder="Timestamp"
                                                    onChange={(e) => self.changeFilterDate(e.target.value)}
                                                    className="filled" 
                                                    autoComplete="off"
                                                />
                                                <b className="caret"></b>
                                            </div>
                                        </div>
                                        <span className="select-sassy-wrapper">
                                            <div className="advanced-select" data-model="State Selected">
                                                <div className="dropdown">
                                                    <input
                                                        id="status"
                                                        type="button"
                                                        data-default="Status"
                                                        placeholder="Search Status"
                                                        value={filterStatusText}
                                                        className="trigger"
                                                    />
                                                    <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                                    {
                                                        this.renderStatusClearButton()
                                                    }                                                    
                                                    <ul className="dropdown-menu">
                                                        <li className="skip-li">
                                                            <input 
                                                                type="text" 
                                                                className="q" 
                                                                placeholder="Search Status" 
                                                                name='filterStatusOptions'
                                                                onChange={this.onChange}
                                                                value={this.state.filterStatusOptions}
                                                            />
                                                        </li>
                                                        {
                                                            filterStatus.map(status => {
                                                                return (
                                                                    <li key={`statuskey-${status.ID}`}>
                                                                        <a className="x-check" href="#">
                                                                            <input
                                                                                type="checkbox"
                                                                                name={`status-${status.ID}`}
                                                                                id={`statusCheckbox${status.ID}`}
                                                                                checked={status.isChecked}
                                                                                onChange={(e) => {
                                                                                    this.onSearchStatusCheckboxChanged(status.ID);
                                                                                }}
                                                                            />
                                                                            <label htmlFor={`statusCheckbox${status.ID}`}> {status.Name}</label>
                                                                        </a>
                                                                    </li>
                                                                )
                                                            })
                                                        }                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                        </span>
                                        <span className="select-sassy-wrapper">
                                            <div className="advanced-select" data-model="Supplier Selected">
                                                <div className="dropdown">
                                                    <input id="supplier" type="button" data-default="Supplier" value={filterSupplierText} className="trigger" />
                                                    <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                                    {
                                                        this.renderSupplierClearButton()
                                                    }
                                                    <ul className="dropdown-menu">
                                                        <li className="skip-li">
                                                            <input 
                                                                type="text" 
                                                                className="q" 
                                                                placeholder="Search Supplier" 
                                                                name='filterSupplierOptions'
                                                                onChange={this.onChange}
                                                                value={this.state.filterSupplierOptions}
                                                            />
                                                        </li>
                                                        {
                                                            filterSuppliers.map((supplier) => {
                                                                return (
                                                                    <li key={`supplierKey-${supplier.ID}`}>
                                                                        <a className="x-check" href="#">
                                                                            <input
                                                                                type="checkbox"
                                                                                name={`supplier-${supplier.ID}`}
                                                                                id={`supplierCheckbox${supplier.ID}`}
                                                                                checked={supplier.isChecked}
                                                                                onChange={() => {this.onSearchSupplierCheckboxChanged(supplier.ID)}}
                                                                            />
                                                                            <label htmlFor={`supplierCheckbox${supplier.ID}`}> {supplier.Name}</label>
                                                                        </a>
                                                                    </li>
                                                                )
                                                            })
                                                        }                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                        </span>
                                        <input type="submit" className="btn btn-sassy" value="Apply" id="form-search-btn"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sassy-r">
                            <span className="select-sassy-wrapper sassy-arrow">
                                <select name="per-page" id="per-page" className="sassy-select" defaultValue={selectedPageSize}>
                                    {
                                        this.pageSizeOptions.map((size) => {
                                            return (
                                                <option key={`pageOption${size}`} value={size}>{size}</option>
                                            )
                                        })
                                    }                                    
                                </select>
                            </span>
                            <label htmlFor="" className="sassy-label">Items per page</label>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}; 

module.exports = RequisitionListFilterComponent;