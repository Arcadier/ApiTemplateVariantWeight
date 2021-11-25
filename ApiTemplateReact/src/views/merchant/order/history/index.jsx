'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var Toastr = require('toastr');
require('daterangepicker');
var HeaderLayoutComponent = require('../../../layouts/header').HeaderLayoutComponent;
var SidebarLayoutComponent = require('../../../layouts/sidebar').SidebarLayoutComponent;
var FooterLayout = require('../../../../views/layouts/footer').FooterLayoutComponent;

//let MerchantFeaturePurchaseOrderListB2cComponent = require('../../../features/order_history_type/b2c/order_history_list/index');
//let MerchantFeaturePurchaseOrderListB2bComponent = require('../../../features/order_history_type/b2b/order_history_list/index');

var MerchantPurchaseSearchComponent = require('../../../merchant/order/history/search');

var PaginationComponent = require('../../../common/pagination');

var BaseComponent = require('../../../../views/shared/base');
var OrderActions = require('../../../../redux/orderActions');

let PurchaseOrderListComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/order_history_list/index');

const { validatePermissionToPerformAction } = require('../../../../redux/accountPermissionActions');

class OrderHistoryComponent extends BaseComponent {
    //renderPurchaseTable() {
    //    const self = this;
    //    let checkoutType = process.env.CHECKOUT_FLOW_TYPE;
    //    if (checkoutType === "b2c") {
    //        return (<MerchantFeaturePurchaseOrderListB2cComponent Records={self.props.history.Records} statuses={self.props.statuses.Records} updateHistoryOrders={self.props.updateHistoryOrders} revertPaymentOrderList={self.props.revertPaymentOrderList } />);
    //    }
    //    return (<MerchantFeaturePurchaseOrderListB2bComponent Records={self.props.history.Records} statuses={self.props.statuses.Records} updateHistoryOrders={self.props.updateHistoryOrders}  />);
    //}
    renderPurchaseSearch() {
        return (
            <MerchantPurchaseSearchComponent Records={this.props.suppliers}
                searchOrder={this.props.searchOrder} statuses={this.props.statuses.Records} TotalRecords={this.props.history.TotalRecords}
                updateSelectedOrderStatus={this.props.updateSelectedOrderStatus}
                updateSelectedSuppliers={this.props.updateSelectedSuppliers}
                updateSelectedDates={this.props.updateSelectedDates}
                updateKeyword={this.props.updateKeyword}/>
        );
    }
    componentDidMount() {
        $('td').each(function () {

            var th = $(this).closest('table').find('th').eq(this.cellIndex);

            var thContent = $(th).html();

            $(this).attr('data-th', thContent);

        });

        $(".sub-account.clickable tbody tr").each(function () {

            $(this).on("click", function () {

                var cusHref = $(this).find("a").attr("href");

                if (cusHref) {

                 //   window.location.href = cusHref;

                }

            });

        });
        $('#search').submit(function (e) {
            e.preventDefault();
            var loc = $(location).attr('pathname');

            var values = {};
            var idName = {};
            var bestLine = {};
            $.each($(this).serializeArray(), function (i, field) {
                values[field.name] = field.value;
                idName[i] = field.name;
                bestLine[i] = idName[i] + '=' + values[field.name];
            });


            var blkstr = [];
            $.each(bestLine, function (idx2, val2) {
                var str = val2;
                blkstr.push(str);
            });

            history.replaceState('data to be passed', loc, '?' + blkstr.join("&"));
        });



        /* filter - range calender */

        $('#filter-datepicker').daterangepicker({

            autoUpdateInput: false,

            opens: 'left',

            locale: {

                cancelLabel: 'Clear'

            }

        });



        $('#filter-datepicker').val('Timestamp');

        $('#filter-datepicker').on('apply.daterangepicker', function (ev, picker) {

            $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));

            $(this).addClass('filled');

        });



        $('#filter-datepicker').on('cancel.daterangepicker', function (ev, picker) {

            $(this).val('Timestamp');

            $(this).removeClass('filled');

        });

        /* filter - range calender */



        /* Advanced select */

        //Check all

        $('.advanced-select .parent-check input[type=checkbox]').on('change', function (e) {

            var $this = $(this);

            var $ul = $this.parents('ul');

            if ($this.is(":checked")) {

                $ul.find('input[type=checkbox]').prop("checked", true);

            } else {

                $ul.find('input[type=checkbox]').prop("checked", false);

            }

        });



        //sub with parent



        $('.advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {

            var $this = $(this);

            var $ul = $this.parents('li.has-sub');

            if ($this.is(":checked")) {

                $ul.find('input[type=checkbox]').prop("checked", true);

            } else {

                $ul.find(' input[type=checkbox]').prop("checked", false);

            }

        });





        //Serching

        $('.advanced-select .q').on('keyup', function () {

            var input, filter, ul, li, a, i;

            input = $(this);

            filter = $.trim(input.val().toLowerCase());

            var div = input.parents('.dropdown').find('.dropdown-menu');

            div.find("li:not(.skip-li)").each(function () {

                var $this = $(this).find('label');

                if ($this.text().toLowerCase().indexOf(filter) > -1) {

                    $this.parents('li').show();

                } else {

                    $this.parents('li').hide()

                }

            })

        });



        //Count

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



        //Count on ready

        $('.advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');



        //Prevent dropdown to close

        $('.advanced-select .dropdown').on('hide.bs.dropdown', function () {

            return false;

        });



        //

        $('.advanced-select .x-clear').click(function () {

            var $this = $(this);

            $this.parents('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', false).trigger('change');

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





        //Toggle sub items

        $('.advanced-select li.has-sub .toggle-sub').on('click', function (e) {

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

        /* Advanced select */
    }
    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayoutComponent user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                               
                                {this.renderPurchaseSearch()}
                                <PurchaseOrderListComponent
                                    pagePermissions={this.props.pagePermissions}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                    Records={self.props.history.Records}
                                    statuses={self.props.statuses.Records}
                                    fulfilmentStatuses={self.props.fulfilmentStatuses.Records}
                                    updateHistoryOrders={self.props.updateHistoryOrders}
                                    revertPaymentOrderList={self.props.revertPaymentOrderList}
                                    updateHistoryOrdersB2B={self.props.updateHistoryOrdersB2B}/>
                                <PaginationComponent
                                    totalRecords={this.props.history.TotalRecords}
                                    pageNumber={this.props.history.PageNumber}
                                    pageSize={this.props.history.PageSize}
                                    goToPage={this.props.goToPage} />

                            </div>
                        </div>
                    </div>
                </div>
                <div id="cover" />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        pagePermissions: state.userReducer.pagePermissions,
        history: state.orderReducer.history,
        keyword: state.orderReducer.keyword,
        suppliers: state.orderReducer.suppliers,
        statuses: state.orderReducer.statuses,
        fulfilmentStatuses: state.orderReducer.fulfilmentStatuses,
        paymentStatuses: state.orderReducer.paymentStatuses,
        selectedOrders: state.orderReducer.selectedOrders,
        selectedOrderStatus: state.orderReducer.selectedOrderStatus,
        selectedOrderStatuses: state.orderReducer.selectedOrderStatuses,
        selectedSuppliers: state.orderReducer.selectedSuppliers,
        selectedDates: state.orderReducer.selectedDates,
        selectedFulfillmentStatuses: state.orderReducer.selectedFulfillmentStatuses,
        selectedDeliveryTypeName: state.orderReducer.selectedDeliveryTypeName,
        isShowChangeStatus: state.orderReducer.isShowChangeStatus,
        isShowSuccessMessage: state.orderReducer.isShowSuccessMessage
    }
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        revertPaymentOrderList: (cartItemID, status) => dispatch(OrderActions.revertPaymentOrderList(cartItemID, status)),
        updateDetailOrder: (status,invoiceNo) => dispatch(OrderActions.updateDetailOrder(status,invoiceNo)),
        goToPage: (pageNo, filters) => dispatch(OrderActions.goToPage(pageNo, filters)),
        searchOrder: (filters) => dispatch(OrderActions.searchOrder(filters)),
        selectUnselectOrder: (cartItemID, isSelect) => dispatch(OrderActions.selectUnselectOrder(cartItemID, isSelect)),
        updateSelectedOrderStatus: (status) => dispatch(OrderActions.updateSelectedOrderStatus(status)),
        updateSelectedSuppliers: (suppliers) => dispatch(OrderActions.updateSelectedSuppliers(suppliers)),
        updateSelectedDates: (date) => dispatch(OrderActions.updateSelectedDates(date)),
        updateKeyword: (keyword) => dispatch(OrderActions.updateKeyword(keyword)),
        updateHistoryOrders: (cartItemID, status) => dispatch(OrderActions.updateHistoryOrders(cartItemID, status)),
        updateHistoryOrdersB2B: (orderID, status) => dispatch(OrderActions.updateHistoryOrdersB2B(orderID, status)),
        updateInvoicePaymentStatus: (options, callback) => dispatch(OrderActions.updateInvoicePaymentStatus(options,callback)),
        showHideChangeStatus: (isShow) => dispatch(OrderActions.showHideChangeStatus(isShow)),
        showHideSuccessMessage: (isShow) => dispatch(OrderActions.showHideSuccessMessage(isShow))
    }
}

const OrderHistoryHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderHistoryComponent)

module.exports = {
    OrderHistoryHome,
    OrderHistoryComponent
}