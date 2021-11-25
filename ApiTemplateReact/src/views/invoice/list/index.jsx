'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../layouts/header').HeaderLayoutComponent;
let FooterLayoutComponent = require('../../layouts/footer').FooterLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const PaginationComponent = require('../../common/pagination');
const InvoiceActions = require('../../../redux/invoiceActions');

const InvoiceListFilterComponent = require('./filter');
const ListComponent = require('./list');
const TitleComponent = require('./title');
const POModalComponent = require('./po-modal');

const moment = require('moment');

if (typeof window !== 'undefined') { var $ = window.$; }

const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

class InvoiceListComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            users: this.props && this.props.users ? this.props.users : [],
            paymentGateways: this.props && this.props.paymentGateways ? this.props.paymentGateways : [],
            statuses: this.props && this.props.statuses ? this.props.statuses : [],
            paymentDues: [
                {
                    ID: 0,
                    Value: 'Select All',
                    isChecked: false
                },
                {
                    ID: 1,
                    Value: 'Upcoming',
                    isChecked: false
                },
                {
                    ID: 2,
                    Value: 'Past',
                    isChecked: false
                }
            ],
            pageNumber: this.props && this.props.invoiceList ? this.props.invoiceList.PageNumber : 1,
            pageSize: this.props && this.props.invoiceList ? this.props.invoiceList.PageSize : 20,
            keywords: ''
        };
        this.onSearchStatusCheckboxChanged = this.onSearchStatusCheckboxChanged.bind(this);
        this.onSearchPaymentMethodCheckboxChanged = this.onSearchPaymentMethodCheckboxChanged.bind(this);
        this.onSearchPaymentDueCheckboxChanged = this.onSearchPaymentDueCheckboxChanged.bind(this);
        this.onSearchUserCheckboxChanged = this.onSearchUserCheckboxChanged.bind(this);
        this.onClearSelectedItems = this.onClearSelectedItems.bind(this);
        this.onTimestampChanged = this.onTimestampChanged.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.goToPage = this.goToPage.bind(this);
        this.onSearchKeywordChanged = this.onSearchKeywordChanged.bind(this);
        this.onChangePageSize = this.onChangePageSize.bind(this);
        this.onCreateInvoiceClicked = this.onCreateInvoiceClicked.bind(this);
        this.updateInvoiceStatus = this.updateInvoiceStatus.bind(this);
        this.startDateFilter = null;
        this.endDateFilter = null;

        this.permissionPageType = props.isUserMerchant ? 'merchant' : 'consumer';
    }

    componentDidMount() {
        const self = this;

      //comment alert for card ARC-11005
      //  alert()

        //Prevent dropdown to close
        $('.advanced-select .dropdown').on('hide.bs.dropdown', function () {
            return false;
        });
        //Close dropdown to click outside
        $('body').on('click', function (e) {
            var $target = $(e.target);
            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });
        $('.advanced-select .trigger').on('click', function () {
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
            } else {
                $('.advanced-select .dropdown.open').removeClass('open');
                $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
            }
        });

        $('.advanced-select .x-check input[type=checkbox]').on('change', function () {
            var $control = $(this).parents('.advanced-select');
            var model = $control.data('model');
            var $input = $control.find('.trigger');
            var default_val = $input.attr('data-default');
            var checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;
            if (checked === 1) {
                $input.val($control.find('.x-check:not(.parent-check) input[type=checkbox]:checked + label').text());
                $control.addClass('choosen');
            } else if (checked > 0) {
                $control.addClass('choosen');
                if (checked > 1) {
                    $input.val(checked + ' ' + model);
                }
            } else {
                $input.val(default_val);
                $control.removeClass('choosen');
            }
        });

        $('#modalHavePO .advanced-select .x-check input[type=checkbox]').on('change', function () {
            var $control = $(this).parents('.advanced-select');
            var $input = $control.find('.form-control:eq(0)');
            var default_val = $input.attr('data-default');
            var checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;
            $(".advanced-select .x-check input:checkbox").prop("checked", false);
            $(this).prop("checked", true);
            if (checked) {
                $input.val($control.find('.x-check input[type=checkbox]:checked + label').text());
                $control.addClass('choosen');
                $('#modalHavePO .advanced-select .dropdown').removeClass('open');
            }
            else {
                $input.val(default_val);
                $control.removeClass('choosen');
            }
        });

        //Check all
        $('#modalHavePO .advanced-select .parent-check input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('ul');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find('input[type=checkbox]').prop("checked", false);
            }
        });

        //sub with parent
        $('#modalHavePO .advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('li.has-sub');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find(' input[type=checkbox]').prop("checked", false);
            }
        });

        $('#modalHavePO .advanced-select input[type=text]').focusin(function () {
            $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
        });
    }

    onSearchStatusCheckboxChanged(name) {
        let { statuses } = this.state;
        const defaultStatus = statuses.find(item => (item.Name == "Select All"));
        if (name === "Select All") {
            if (defaultStatus) {
                defaultStatus.isChecked = !defaultStatus.isChecked;
                statuses = statuses.map((status) => {
                    status.isChecked = defaultStatus.isChecked;
                    return status;
                });
            }
        }
        else {
            const status = statuses.find(item => (item.Name == name));
            if (status) {
                status.isChecked = !status.isChecked;
            }
            if (status.isChecked) {
                const otherStatus = statuses.find(item => (item.isChecked != status.isChecked && item.Name !== "Select All"))
                if (!otherStatus) {
                    defaultStatus.isChecked = status.isChecked;
                }
            }
            else {
                const otherStatus = statuses.find(item => (item.isChecked != status.isChecked && item.Name != status.Name));
                if (otherStatus) {
                    defaultStatus.isChecked = status.isChecked;
                }
            }
        }
        this.setState({
            statuses
        });
    }

    onSearchPaymentMethodCheckboxChanged(code) {
        let { paymentGateways } = this.state;
        const defaultPayment = paymentGateways.find(item => (item.Code == "0"));
        if (code == "0") {
            if (defaultPayment) {
                defaultPayment.isChecked = !defaultPayment.isChecked;
                paymentGateways = paymentGateways.map((gateway) => {
                    gateway.isChecked = defaultPayment.isChecked;
                    return gateway;
                })
            }
        }
        else {
            const gateway = paymentGateways.find(item => (item.Code === code));
            if (gateway) {
                gateway.isChecked = !gateway.isChecked;
            }
            if (gateway.isChecked) {
                const otherGateway = paymentGateways.find(item => (item.isChecked != gateway.isChecked && item.Code != '0'));
                if (!otherGateway) {
                    defaultPayment.isChecked = gateway.isChecked;
                }
            }
            else {
                const otherGateway = paymentGateways.find(item => (item.isChecked != gateway.isChecked && item.Code != gateway.ID));
                if (otherGateway) {
                    defaultPayment.isChecked = gateway.isChecked
                }
            }

        }
        this.setState({
            paymentGateways
        });
    }

    onSearchPaymentDueCheckboxChanged(id) {
        let { paymentDues } = this.state;
        const defaultPayment = paymentDues.find(item => (item.ID == '0'));
        if (id == '0') {
            if (defaultPayment) {
                defaultPayment.isChecked = !defaultPayment.isChecked;
                paymentDues = paymentDues.map((due) => {
                    due.isChecked = defaultPayment.isChecked;
                    return due;
                })
            }
        }
        else {
            const due = paymentDues.find(item => (item.ID == id));
            if (due) {
                due.isChecked = !due.isChecked;
            }
            if (due.isChecked) {
                const otherDue = paymentDues.find(item => (item.isChecked != due.isChecked && item.ID != '0'));
                if (!otherDue) {
                    defaultPayment.isChecked = due.isChecked;
                }
            }
            else {
                const otherDue = paymentDues.find(item => (item.isChecked != due.isChecked && item.ID != due.ID));
                if (otherDue) {
                    defaultPayment.isChecked = due.isChecked;
                }
            }
        }
        this.setState({
            paymentDues
        });
    }

    onSearchUserCheckboxChanged(id) {
        let { users } = this.state;
        const defaultUser = users.find(item => (item.ID == 0));
        if (id === 0) {
            if (defaultUser) {
                defaultUser.isChecked = !defaultUser.isChecked;
                users = users.map((user) => {
                    user.isChecked = defaultUser.isChecked;
                    return user;
                });
            }
        }
        else {
            const user = users.find(item => (item.ID == id));
            if (user) {
                user.isChecked = !user.isChecked;
            }
            if (user.isChecked) {
                const otherUser = users.find(item => (item.isChecked != user.isChecked && item.ID != '0'))
                if (!otherUser) {
                    defaultUser.isChecked = user.isChecked;
                }
            }
            else {
                const otherUser = users.find(item => (item.isChecked != user.isChecked && item.ID != user.ID));
                if (otherUser) {
                    defaultUser.isChecked = user.isChecked;
                }
            }
        }
        this.setState({
            users
        });
    }

    onSearchKeywordChanged(e) {
        this.setState({
            keywords: e.target.value
        });
    }

    onClearSelectedItems(optionType) {
        let options = [];
        switch (optionType) {
            case "statuses":
                let statuses = this.state.statuses;
                statuses = statuses.map((status) => {
                    status.isChecked = false;
                    return status;
                });
                this.setState({
                    statuses
                });
                break;
            case "paymentmethods":
                let paymentGateways = this.state.paymentGateways;
                paymentGateways = paymentGateways.map((gateway) => {
                    gateway.isChecked = false;
                    return gateway;
                });
                this.setState({
                    paymentGateways
                });
                break;
            case "paymentdues":
                let paymentDues = this.state.paymentDues;
                paymentDues = paymentDues.map((due) => {
                    due.isChecked = false;
                    return due;
                });
                this.setState({
                    paymentDues
                });
                break;
            case "users":
                let users = this.state.users;
                users = users.map((user) => {
                    user.isChecked = false;
                    return user;
                });
                this.setState({
                    users
                });
                break;
            default:
                return;
        }
    }

    onTimestampChanged(startDate, endDate) {
        this.startDateFilter = startDate;
        this.endDateFilter = endDate;
    }

    onChangePageSize(e) {
        var self = this;
        this.setState({
            pageNumber: 1,
            pageSize: e.target.value
        }, function () {
            self.applyFilter(e);
        });
    }

    applyFilter(e) {
        if (e) {
            e.preventDefault();
        }
        let statusesFilter = '';
        this.state.statuses
            .filter(item => {
                return (item.isChecked && item.Name != 'Select All');
            })
            .forEach(item => {
                statusesFilter += item.Name + ",";
            });
        statusesFilter = statusesFilter.slice(0, -1);
        statusesFilter = statusesFilter.length === 0 ? 'Processing,Pending,Paid.Failed,Refunded,Created,Acknowledged,Waiting For Payment,Invoiced,Overdue' : statusesFilter;
        // .map(item => {
        //     return item.Name;
        // });
        const paymentGatewaysFilter = this.state.paymentGateways
            .filter(item => {
                return (item.isChecked && item.Code != '0')
            })
            .map(item => {
                return item.Code;
            });
        const paymentDuesFilter = this.state.paymentDues
            .filter(item => {
                return (item.isChecked && item.ID != '0')
            })
            .map(item => {
                return item.Value;
            });
        //paymentDuesFilter = paymentDuesFilter.slice(0, -1);
        const usersFilter = this.state.users
            .filter(item => {
                return (item.isChecked && item.ID != '0')
            })
            .map(item => {
                return item.ID;
            });


        let getInvoiceRequest = {
            pageSize: this.state.pageSize,
            pageNumber: this.state.pageNumber,
            keyword: this.state.keywords,
            startDate: this.startDateFilter ? moment(this.startDateFilter).format('X') : undefined,
            endDate: this.endDateFilter ? moment(this.endDateFilter).format('X') : undefined,
            supplier: (usersFilter && usersFilter.length > 0) ? usersFilter : undefined,
            paymentDues: (paymentDuesFilter && paymentDuesFilter.length > 0) ? paymentDuesFilter : undefined,
            paymentGateways: (paymentGatewaysFilter && paymentGatewaysFilter.length > 0) ? paymentGatewaysFilter : undefined
        };

        statusesFilter = statusesFilter.replace("Paid", "Success");
        if (this.isUserMerchant()) {
            getInvoiceRequest.status = (statusesFilter && statusesFilter != '') ? statusesFilter : undefined;
        } else {
            getInvoiceRequest.pStatus = (statusesFilter && statusesFilter != '') ? statusesFilter : undefined;
        }

        this.props.filterInvoices(getInvoiceRequest);
    }

    isUserMerchant() {
        const { isUserMerchant = false } = this.props;

        return isUserMerchant;
    }

    goToPage(e) {
        this.setState({
            pageNumber: e
        }, () => {
            this.applyFilter();
        });
    }

    onCreateInvoiceClicked(e) {
        e.preventDefault();

        this.props.validatePermissionToPerformAction(`add-${this.permissionPageType}-invoices-api`, () => {
            $("#modalHavePO").modal("show");
        });
    }

    updateInvoiceStatus(invoiceNo, status) {
        const self = this;

        this.props.validatePermissionToPerformAction('edit-merchant-invoices-api', () => {
            self.props.updateInvoiceStatus(invoiceNo, status);
        });
    }

    render() {
        const { users, paymentDues, paymentGateways, statuses, pageNumber, pageSize, keywords } = this.state || [];
        const { invoiceList, purchaseOrders } = this.props || [];
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={null} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                {/* main-content */}
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                {/* title */}
                                <TitleComponent
                                    totalRecords={invoiceList.TotalRecords}
                                    selectedPageSize={pageSize}
                                    onChangePageSize={this.onChangePageSize}
                                    isUserMerchant={this.isUserMerchant()}
                                    pagePermissions={this.props.pagePermissions}
                                    onCreateInvoiceClicked={this.onCreateInvoiceClicked}
                                />
                                {/* title */}
                                {/* filter */}
                                <InvoiceListFilterComponent
                                    isUserMerchant={this.isUserMerchant()}
                                    users={users}
                                    statuses={statuses}
                                    paymentGateways={paymentGateways}
                                    paymentDues={paymentDues}
                                    startDateFilter={this.startDateFilter}
                                    endDateFilter={this.endDateFilter}
                                    onSearchStatusCheckboxChanged={this.onSearchStatusCheckboxChanged}
                                    onSearchPaymentMethodCheckboxChanged={this.onSearchPaymentMethodCheckboxChanged}
                                    onSearchPaymentDueCheckboxChanged={this.onSearchPaymentDueCheckboxChanged}
                                    onSearchUserCheckboxChanged={this.onSearchUserCheckboxChanged}
                                    onClearSelectedItems={this.onClearSelectedItems}
                                    onTimestampChanged={this.onTimestampChanged}
                                    applyFilter={this.applyFilter}
                                    onSearchKeywordChanged={this.onSearchKeywordChanged}
                                    keywords={keywords}
                                    selectedPageSize={pageSize}
                                    onChangePageSize={this.onChangePageSize}
                                />
                                {/* filter */}
                                {/* table */}
                                <ListComponent
                                    invoiceList={invoiceList.Records}
                                    isUserMerchant={this.isUserMerchant()}
                                    statuses={this.props.statuses || []}
                                    updateInvoiceStatus={this.updateInvoiceStatus}
                                    pagePermissions={this.props.pagePermissions}
                                />
                                {/* table */}
                                <PaginationComponent
                                    totalRecords={invoiceList.TotalRecords}
                                    pageNumber={invoiceList.PageNumber}
                                    pageSize={invoiceList.PageSize}
                                    goToPage={this.goToPage} />
                            </div>
                        </div>
                    </div>
                    {/* Start of footer */}
                    <div className="footer" id="footer-section">
                        <FooterLayoutComponent panels={this.props.panels} />
                    </div>
                    {/* End of footer */}
                </div>
                {/* main-content */}
                <POModalComponent
                    purchaseOrders={purchaseOrders}
                    permissionPageType={this.permissionPageType}
                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                />

            </React.Fragment>
        )
    };
};

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        pagePermissions: state.userReducer.pagePermissions,
        invoiceList: state.invoiceReducer.invoiceList,
        purchaseOrders: state.invoiceReducer.purchaseOrders,
        users: state.invoiceReducer.users,
        paymentGateways: state.invoiceReducer.paymentGateways,
        statuses: state.invoiceReducer.statuses,
        isUserMerchant: state.invoiceReducer.isUserMerchant,
        //filters: state.requisitionReducer.filters, 
        //suppliers: state.requisitionReducer.suppliers
    };
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        filterInvoices: (filters) => dispatch(InvoiceActions.filterInvoices(filters)),
        updateInvoiceStatus: (invoiceNo, status) => dispatch(InvoiceActions.updateInvoiceStatus(invoiceNo, status))
    }
}

const InvoiceListHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(InvoiceListComponent);

module.exports = {
    InvoiceListHome,
    InvoiceListComponent
};