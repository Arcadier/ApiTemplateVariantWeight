'use strict';

const $ = require('jquery');
const daterange = require('daterangepicker');

const React = require('react');
const ReactRedux = require('react-redux');
const Toastr = require('toastr');
const moment = require('moment');
const CommonModule = require('../../public/js/common.js');

const ActivityLogAction = require('../../redux/ActivityLogAction');

const HeaderLayoutComponent = require('../layouts/header').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../layouts/sidebar').SidebarLayoutComponent;
const FooterLayout = require('../layouts/footer').FooterLayoutComponent;

const PaginationComponent = require('../common/pagination');
const LoginDetailsComponent = require('./login-details');
const PageLogDetailsComponent = require('./page-details');
const ItemLogDetailsComponent = require('./item-details');


class ActivityLogComponent extends React.Component {

    componentDidMount() {
        $('input[name="dates"]').daterangepicker({
            opens: 'left',
            autoUpdateInput: false,
            locale: {
                 format: 'DD/MM/YYYY',
            }
        }, function (start_date, end_date) {
            $('#date-range').val(start_date.format('DD/MM/YYYY') + ' - ' + end_date.format('DD/MM/YYYY'));
            $('#from_date').val(start_date.format('DD/MM/YYYY'));
            $('#to_date').val(end_date.format('DD/MM/YYYY'));
        });

        $('input[name="dates"]').on('apply.daterangepicker', function(ev, picker) {
           $('#date-range').val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            $('#from_date').val(picker.startDate.format('DD/MM/YYYY'));
            $('#to_date').val(picker.endDate.format('DD/MM/YYYY'));
        });

        $('input[name="dates"]').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
            $(this).removeClass('filled');
        });
    }

    ExportLogsToExcel() {
        const self = this;
        var values = $('input[name="dates"]').data('daterangepicker');
        var isValid = CommonModule.validateDateComparison($('input[name="dates"]').val());
        if (!isValid) {
            Toastr.error("Please Check the Start Date and End Date.Date is not Valid", "Oops! Something went wrong.");
            return;
        }

        var startDate = (moment(values.startDate).format('MM/DD/YYYY hh:mm A'));
        var endDate = (moment(values.endDate).format('MM/DD/YYYY hh:mm A'));

        self.props.exportToExcel(Math.round(new Date(startDate).getTime() / 1000), Math.round(new Date(endDate).getTime() / 1000));
    }

    getMessages(type) {
        if (type == this.props.logName) {
            return !(this.props.messages.Records) ? '' : this.props.messages.Records;
        }
        return '';
    }

    render() {
        const self = this;
        const filters = {
            keyword: self.props.logName,
            dateRange: ''
        };
        return (
            <React.Fragment>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayoutComponent user={this.props.user} approvalSettings={this.props.settings} />
                </aside>
                <div className='main-content'>
                    <div className='orderlist-container un-seller-body'>
                        <div className='container-fluid'>
                            <div className='sc-upper'>
                                <div className='sc-u sc-u-mid full-width'>
                                    <div className='pull-left'> <span className='sc-text-big'>Activity Log</span> </div>
                                </div>
                                {/* search section */}
                                <div className='seller-actions'>
                                    <div className='container-fluid'>
                                        <div className='row'>
                                            <div className='pull-left'>
                                                <ul className='nav nav-tabs'>
                                                    <li className='active' ><a data-toggle='tab' href='#tab-login' data-log-name='activity-logs' onClick={(e) => this.props.searchActivityLog(e)}>Login</a></li>
                                                    <li><a data-toggle='tab' href='#tab-pages' data-log-name='page-logs' onClick={(e) => this.props.searchActivityLog(e)}>Pages</a></li>
                                                    <li><a data-toggle='tab' href='#tab-items' data-log-name='item-activity-logs' onClick={(e) => this.props.searchActivityLog(e)}>Items</a></li>
                                                </ul>
                                            </div>
                                            <div className='pull-right'>

                                                <div className='action-btns filter-box'>
                                                    <div className='form-inline'>
                                                        <span>
                                                            <label>Date:</label>
                                                            <input className='form-control' type='text' name='dates' id='date-range' placeholder='DD/MM/YYYY' />
                                                        </span>
                                                    </div>
                                                    <button onClick={(e) => self.ExportLogsToExcel()} id='btn-export-log' className='btn-action btn-red'>Export Log</button>
                                                </div>

                                            </div>
                                            <div className='clearfix' />
                                        </div>
                                    </div>
                                </div>
                                {/* search section */}
                            </div>
                            <div className='tab-content'>
                                <LoginDetailsComponent messages={self.getMessages('activity-logs')} />
                                <div id='tab-pages' className='tab-pane fade'>
                                    <PageLogDetailsComponent messages={self.getMessages('page-logs')} />
                                </div>
                                <div id='tab-items' className='tab-pane fade '>
                                    <ItemLogDetailsComponent messages={self.getMessages('item-activity-logs')} />
                                </div>
                            </div>
                            <PaginationComponent
                                totalRecords={!(this.props.messages && this.props.messages.TotalRecords) ? '' : this.props.messages.TotalRecords}
                                pageNumber={!(this.props.messages && this.props.messages.PageNumber) ? '' : this.props.messages.PageNumber}
                                pageSize={!(this.props.messages && this.props.messages.PageSize) ? '' : this.props.messages.PageSize}
                                goToPage={this.props.goToPage}
                                filters={filters} 
                            />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        messages: state.activityLogReducer.messages,
        logName: state.activityLogReducer.logName,
        keyword: state.activityLogReducer.keyword,
        user: state.userReducer.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        searchActivityLog: (e) => dispatch(ActivityLogAction.searchActivityLog(e.target.getAttribute('data-log-name'))),
        goToPage: (pageNo, filters) => dispatch(ActivityLogAction.goToPage(pageNo, filters)),
        exportToExcel: (startDate, endDate) => dispatch(ActivityLogAction.exportToExcel(startDate, endDate))
    };
}

const ActivityLogPage = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ActivityLogComponent);

module.exports = {
    ActivityLogPage,
    ActivityLogComponent
};
