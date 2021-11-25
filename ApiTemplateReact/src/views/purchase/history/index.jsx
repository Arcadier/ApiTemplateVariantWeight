'use strict';
require('daterangepicker');
var React = require('react');
var ReactRedux = require('react-redux');


var HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
var SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
var FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;
var BaseComponent = require('../../shared/base');

//let PurchaseTableB2CComponent = require('../../features/purchase_order_type/b2c/purchase_order_list/index');
//let PurchaseTableB2BComponent = require('../../features/purchase_order_type/b2b/purchase_order_list/index');

//let MerchantFeaturePurchaseOrderListB2cComponent = require('../../features/order_history_type/b2c/order_history_list/index');
//let MerchantFeaturePurchaseOrderListB2bComponent = require('../../features/order_history_type/b2b/order_history_list/index');

var PurchaseSearchComponent = require('../history/purchase-search');
var PurchaseListComponent = require(`../../extensions/${process.env.TEMPLATE}/purchase/history/purchase-list`);
var PaginationComponent = require('../../common/pagination');
const PageItemCountComponent = require('../../common/page-item-count');
var purchaseActions = require('../../../redux/purchaseActions');
var OrderActions = require('../../../redux/orderActions');
//var OrderActions = require('../../../../redux/orderActions');

let PurchaseOrderListComponent = require('../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/purchase_order_list/index');
class PurchaseHistoryComponent extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            orderStatusSearchLabel: 'Order Status', 
            supplierSearchLabel: process.env.PRICING_TYPE == 'service_level' ? 'Seller' : 'Supplier'
        }
    }

    isUserMerchant() {
        const { user } = this.props;

        if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
            return true;
        }

        return false;
    }
    //renderPurchaseTable() {
    //    const self = this;
    //    let checkoutType = process.env.CHECKOUT_FLOW_TYPE;
    //    const isUserMerchant = self.isUserMerchant();
    //    if (isUserMerchant) {
    //        if (checkoutType === "b2c") {
    //            return (<MerchantFeaturePurchaseOrderListB2cComponent Records={self.props.history.Records} statuses={this.props.statuses.Records} updateDetailOrder={this.props.updateDetailOrder} />);
    //        }
    //        return (<MerchantFeaturePurchaseOrderListB2bComponent Records={self.props.history.Records} statuses={this.props.statuses.Records} updateDetailOrder={this.props.updateDetailOrder} />);
    //    }
    //    else {
    //        if (checkoutType === "b2c") {
    //            return (<PurchaseTableB2CComponent Records={self.props.history.Records} />);
    //        }
    //            return (<PurchaseTableB2BComponent Records={self.props.history.Records} />);
    //    }
        
    //}

    renderPurchaseSearch() {
        return (
            <PurchaseSearchComponent Records={this.props.suppliers} searchPurchase={this.props.searchPurchase}
                statuses={this.props.statuses.Records} isUserMerchant={this.isUserMerchant} TotalRecords={this.props.history.TotalRecords}
                updateSelectedOrderStatus={this.props.updateSelectedOrderStatus}
                updateSelectedSuppliers={this.props.updateSelectedSuppliers}
                updateSelectedDates={this.props.updateSelectedDates}
                updateKeyword={this.props.updateKeyword}
                orderStatusSearchLabel={this.state.orderStatusSearchLabel}
                supplierSearchLabel={this.state.supplierSearchLabel}
                updateSelectedCartItemStatus={this.props.updateSelectedCartItemStatus}
            />
        );
    }
    onDropdownChange(e) {
        this.props.updateDetailOrder(e.target.value);
    }
    componentDidMount() {
        var self = this;
        $('td').each(function () {

            var th = $(this).closest('table').find('th').eq(this.cellIndex);

            var thContent = $(th).html();

            $(this).attr('data-th', thContent);

        });

        $(".sub-account.clickable tbody tr").each(function () {

            $(this).on("click", function () {

                var cusHref = $(this).find("a").attr("href");

                if (cusHref) {

                  //  window.location.href = cusHref;

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
                if ($input[0].name === "OrderStatusSearchLabel") {
                    self.setState({
                        orderStatusSearchLabel: $input.val()
                    });
                }
                if ($input[0].name === "SupplierSearchLabel") {
                    self.setState({
                        supplierSearchLabel: $input.val()
                    });
                }                

            } else if (checked > 0) {

                $control.addClass('choosen');

                if (checked > 1) {

                    $input.val(checked + ' ' + model);
                    if ($input[0].name === "OrderStatusSearchLabel") {
                        self.setState({
                            orderStatusSearchLabel: $input.val()
                        });
                    }
                    if ($input[0].name === "SupplierSearchLabel") {
                        self.setState({
                            supplierSearchLabel: $input.val()
                        });
                    }

                }

            } else {

                $input.val(default_val);
                $control.removeClass('choosen');
                if ($input[0].name === "OrderStatusSearchLabel") {
                    self.setState({
                        orderStatusSearchLabel: $input.val()
                    });
                }
                if ($input[0].name === "SupplierSearchLabel") {
                    self.setState({
                        supplierSearchLabel: $input.val()
                    });
                }

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

            //$this.parents('.dropdown').addClass('open--');

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
        this.props.user.isBuyerSideBar = true;
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                {this.renderPurchaseSearch()}
                                <PurchaseOrderListComponent Records={this.props.history.Records}
                                    statuses={this.props.statuses}
                                    fulfilmentStatuses={this.props.fulfilmentStatuses}
                                />
                                <PaginationComponent
                                    totalRecords={this.props.history.TotalRecords}
                                    pageNumber={this.props.history.PageNumber}
                                    pageSize={this.props.history.PageSize}
                                    goToPage={this.props.goToPage}/>
                               
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
        history: state.purchaseReducer.history,
        suppliers: state.purchaseReducer.suppliers,
        buyers: state.purchaseReducer.buyers,
        statuses: state.purchaseReducer.statuses,
        fulfilmentStatuses: state.purchaseReducer.fulfilmentStatuses,
        keyword: state.purchaseReducer.keyword,
        selectedOrderStatus: state.purchaseReducer.selectedOrderStatus,
        selectedOrderStatuses: state.purchaseReducer.selectedOrderStatuses,
        selectedSuppliers: state.purchaseReducer.selectedSuppliers,
        selectedDates: state.purchaseReducer.selectedDates,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateDetailOrder: (filters) => dispatch(OrderActions.updateDetailOrder(filters)),
        searchPurchase: (filters) => dispatch(purchaseActions.searchPurchase(filters)),
        goToPage: (pageNo, filters) => dispatch(purchaseActions.goToPage(pageNo, filters)),
        updateSelectedOrderStatus: (status) => dispatch(purchaseActions.updateSelectedOrderStatus(status)),
        updateSelectedSuppliers: (suppliers) => dispatch(purchaseActions.updateSelectedSuppliers(suppliers)),
        updateSelectedDates: (date) => dispatch(purchaseActions.updateSelectedDates(date)),
        updateKeyword: (keyword) => dispatch(purchaseActions.updateKeyword(keyword)),
        updateSelectedCartItemStatus: (status) => dispatch(purchaseActions.updateSelectedCartItemStatus(status))
    };
}

const PurchaseHistoryHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(PurchaseHistoryComponent);

module.exports = {
    PurchaseHistoryHome,
    PurchaseHistoryComponent
};