'use strict';
var React = require('react');
var ReactRedux = require('react-redux');

var OrderDiaryActions = require('../../../../redux/orderDiaryActions');
var OrderActions = require('../../../../redux/orderActions');
var Moment = require('moment');
var HeaderLayoutComponent = require('../../../../views/layouts/header').HeaderLayoutComponent;
var SidebarLayoutComponent = require('../../../../views/layouts/sidebar').SidebarLayoutComponent;
var FooterLayout = require('../../../../views/layouts/footer').FooterLayoutComponent;
var BaseComponent = require('../../../../views/shared/base');

let TableHeaderComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/order_history_detail/' + process.env.PRICING_TYPE + '/headeritem.jsx');
let TableItemsComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/order_history_detail/' + process.env.PRICING_TYPE + '/table-items.jsx');
let TransactionSummaryComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/order_history_detail/' + process.env.PRICING_TYPE + '/transaction_summary.jsx');
let ModalSuccessChangeComponent = require('../../../features/checkout_flow_type/modal-success-change.jsx');
let OrderDiaryComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/order_history_detail/order-diary/index-with-border');
let ShippingPaymentDetailComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/shipping_payment_detail');
let servicelevel = process.env.PRICING_TYPE === 'service_level' ? true : false;
let ModalEditBooking = require('../../../features/checkout_flow_type/b2c/purchase_order/merchant/order_history_detail/modal-edit-booking');
let ModalConfirmCancel = require('../../../features/checkout_flow_type/b2c/purchase_order/merchant/order_history_detail/modal_confirm_cancel');

const PermissionTooltip = require('../../../common/permission-tooltip');
const { validatePermissionToPerformAction } = require('../../../../redux/accountPermissionActions');

class OrderDetailComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            displayStyle: 'none',
            orderStatus:''
        }

        this.renderStatusDropdown = this.renderStatusDropdown.bind(this);
        this.onCheckboxChange = this.onCheckboxChange.bind(this);
    }
    
    componentDidUpdate() {
        if (this.props.isShowSuccessMessage === true) {
            $(".order-itemstatus-popup").modal("show");
        } else {
            $(".order-itemstatus-popup").modal("hide");
        }

        this.initializeCancelButton();
    }

    componentDidMount() {
        $("#cover").hide();
        $('.edit-booking-modal').modal('hide');
        this.handleDatepicker();

        this.initializeCancelButton();
    }

    initializeCancelButton() {
        if ($("#fulfilmentChangeStatus").is(':disabled') && $("#orderChangeStatus").is(':disabled')) {
            $(".order-item-status-popup").attr("disabled", true);
            $("#cancelOrder").attr("disabled", true);
            $("#cancelOrder").addClass('lightgray');
            $('#cancelOrder').contents().filter(function () {
                return this.nodeType == 3
            }).each(function () {
                this.textContent = this.textContent.replace(' Cancel Order', ' Order Cancelled');
            });
        }
    }
    
    formatDateTime(timestamp, format) {
        if (typeof format === 'undefined') {
            format = process.env.DATETIME_FORMAT;
        }

        if (typeof timestamp === 'number') {
            return Moment.unix(timestamp).utc().local().format(format);
        } else {
            return Moment.utc(timestamp).local().format(format);
        }
    }

    handleDatepicker() {
        if (servicelevel) {
            $('#booking_date').datetimepicker({
                format: 'MM/DD/YYYY',
            }).keypress(function (event) { 
                // event.preventDefault(); 
            });

            $('#booking_time').timepicker({
                'step': 15,
                'timeFormat': 'h:i A'
            }).keypress(function (event) { 
                // event.preventDefault(); 
            });
        }
    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    renderSupplierAddress() {
        let shippingAddress = null;
        let supplierDisplayName = null;
        let detail = process.env.CHECKOUT_FLOW_TYPE === 'b2b' ? this.props.detail : this.props.detail.Orders[0]

        if (detail) {
            shippingAddress = detail.DeliveryFromAddress;
            supplierDisplayName = detail.MerchantDetail ? detail.MerchantDetail.DisplayName : '';
        }
        let email = "";
        let number = "";

        if (this.props.detail.Orders && detail.MerchantDetail.Email) {
            email = detail.MerchantDetail.Email;
        } else {
            email = detail.MerchantDetail.Email;
        }

        if (detail.Orders && detail.MerchantDetail.PhoneNumber) {
            number = detail.MerchantDetail.PhoneNumber;
        } else {
            number = detail.MerchantDetail.PhoneNumber;
        }
        const supplierName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const addressLine1 = shippingAddress.Line1 ? [shippingAddress.Line1, <br />] : '';
        const addressLine2 = shippingAddress.Line2 ? [shippingAddress.Line2, <br />] : '';
        const state = shippingAddress.State ? [shippingAddress.State, <br />] : '';
        const city = shippingAddress.City ? [shippingAddress.City, <br />] : '';
        const country = shippingAddress.Country ? [shippingAddress.Country, <br />] : ''; 
        const postCode = shippingAddress.PostCode ? [shippingAddress.PostCode, <br />] : '';
        if (shippingAddress && shippingAddress.Name) {
            return (
                <div className="col-md-4">
                    <table className="canon-table purchase-address-sec">
                        <tbody><tr>
                            <th>Supplier :</th>
                        </tr>
                            <tr>
                                <td data-th="Supplier :">
                                    <span className="highlight-text">{supplierDisplayName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="highlight-text">{supplierName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {addressLine1}
                                    {addressLine2}
                                    {city}
                                    {state}
                                    {country}
                                    {postCode}
                                </td>
                            </tr>
                            {
                                servicelevel && 
                                (
                                    <React.Fragment>
                                        <tr>
                                            <td>
                                                <a href={"tel:+" + number}>+{number}</a><span className="text-spacer" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href={"mailto:" + email}>{email}</a>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                )
                            }                            
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return "";
        }

    }

    renderShippingAddress() {
        let shippingAddress = null;
        let detail = process.env.CHECKOUT_FLOW_TYPE === 'b2b' ? this.props.detail : this.props.detail.Orders[0]
        if (detail) {
            shippingAddress = detail.DeliveryToAddress;
        } 

        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const addressLine1 = shippingAddress.Line1 ? [shippingAddress.Line1, <br />] : '';
        const addressLine2 = shippingAddress.Line2 ? [shippingAddress.Line2, <br />] : '';
        const state = shippingAddress.State ? [shippingAddress.State, <br />] : '';
        const city = shippingAddress.City ? [shippingAddress.City, <br />] : '';
        const country = shippingAddress.Country ? [shippingAddress.Country, <br />] : ''; 
        const postCode = shippingAddress.PostCode ? [shippingAddress.PostCode, <br />] : '';
        if (shippingAddress && shippingAddress.Name) {
            return (
                <div className="col-md-4">
                    <table className="canon-table purchase-address-sec">
                        <tbody><tr>
                            <th>Shipping Address :</th>
                        </tr>
                            <tr>
                                <td data-th="Shipping Address :">
                                    <span className="highlight-text">{buyerName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {addressLine1}
                                    {addressLine2}
                                    {city}
                                    {state}
                                    {country}
                                    {postCode}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return "";
        }
    }

    renderBillingAddress() {
        let shippingAddress = null;
        if (this.props.detail.Orders) {
            shippingAddress = this.props.detail.Orders[0].BillingToAddress;
        } else {
            shippingAddress = this.props.detail.BillingToAddress;
        }

        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const addressLine1 = shippingAddress.Line1? [shippingAddress.Line1, <br />]:'';
        const addressLine2 = shippingAddress.Line2? [shippingAddress.Line2, <br />]:'';
        const state = shippingAddress.State ? [shippingAddress.State, <br />] : ''; 
        const city = shippingAddress.City ? [shippingAddress.City, <br />] : '';
        const country = shippingAddress.Country ? [shippingAddress.Country, <br />] : ''; 

        let email = "";
        let number = "";
        let buyerDisplayName = "";

        if (this.props.detail.Orders && this.props.detail.Orders[0].ConsumerDetail.Email) {
            email = this.props.detail.Orders[0].ConsumerDetail.Email;
        } else {
            email = this.props.detail.ConsumerDetail.Email;
        }

        if (this.props.detail.Orders && this.props.detail.Orders[0].ConsumerDetail.PhoneNumber) {
            number = this.props.detail.Orders[0].ConsumerDetail.PhoneNumber;
        } else {
            number = this.props.detail.ConsumerDetail.PhoneNumber;
        }

        if (this.props.detail.Orders && this.props.detail.Orders[0].ConsumerDetail) {
            buyerDisplayName =  this.props.detail.Orders[0].ConsumerDetail.DisplayName;
        } else {
            buyerDisplayName = this.props.detail.ConsumerDetail.DisplayName;
        }

        return (
            <div className="col-md-4">
                <table className="canon-table purchase-address-sec">
                    <tbody><tr>
                        <th>Billing Address :</th>
                        </tr>
                            <tr>
                                <td className="billing-address" data-th="Billing Address :">  
                                    <span className="highlight-text">{buyerDisplayName}</span>
                                </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="highlight-text">{buyerName?buyerName.trim():''}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {addressLine1}
                                {addressLine2} 
                                {city}
                                {state}
                                {country}
                                {shippingAddress.PostCode}<br />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a href={"tel:+" + number}>+{number}</a><span className="text-spacer" />
                            </td>
                        </tr>
                        <tr>
                            <td>    
                                <a href={"mailto:" + email}>{email}</a>
                            </td>
                        </tr>
                    </tbody></table>
            </div>
        );
    }

    getLatestFulfillmentStatus(cartItem) {
        let status = null;
        let fulfilmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');

        if (fulfilmentStatuses.length > 0) {
            //fulfilmentStatuses.sort((a, b) => (a.CreatedDateTime > b.CreatedDateTime) ? 1 : -1)
            status = fulfilmentStatuses[fulfilmentStatuses.length - 1];
        }

        return status;
    }

    getLatestOrderStatus(cartItem) {
        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');

        if (orderStatuses.length > 0) {
            //orderStatuses.sort((a, b) => (a.CreatedDateTime > b.CreatedDateTime) ? 1 : -1);
            status = orderStatuses[orderStatuses.length - 1];
        }

        return status;
    }


    onDropdownChange(e) {
        const self = this;
        const value = e.target.value;

        this.props.validatePermissionToPerformAction("edit-merchant-purchase-order-details-api", () => {
            if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                self.props.updateOrderStatusb2binDetails(value);
            } else {
                self.props.updateDetailOrder(value);
            }
        });        
    }

    renderStatusDropdown(order, type) {
        if (order && order.CartItemDetails) {
            const cartItem = order.CartItemDetails[0];

            let latestStatus = null;
            let otherLatestStatus = null;
            let statuses = [];

            if (type == 'order') {
                latestStatus = this.getLatestOrderStatus(cartItem);
                otherLatestStatus = this.getLatestFulfillmentStatus(cartItem);
                statuses = this.props.orderStatuses;
            } else if (type == 'fulfilment') {
                latestStatus = this.getLatestFulfillmentStatus(cartItem);
                otherLatestStatus = this.getLatestOrderStatus(cartItem);
                statuses = this.props.fulfilmentStatuses;
            }

            //if the status was deleted
            var statusExist = statuses.find(d => d.ID == latestStatus.ID);
            if (!statusExist)
                latestStatus = null;

            const isTransactionCancelled = servicelevel && (latestStatus && latestStatus.Name == 'Cancelled') && (otherLatestStatus && otherLatestStatus.Name == 'Cancelled');

            return (
                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                    <select className="order-item-status-popup" id={type + "ChangeStatus"} disabled={isTransactionCancelled} value={latestStatus ? latestStatus.ID : ''} onChange={(e) => this.onDropdownChange(e)}>
                        {
                            <option disabled value="" selected></option>
                        }
                        {
                            statuses.map(function (status, index) {
                                return (
                                    <option key={index} value={status.ID}>{status.ComputedAlias}</option>
                                )
                            })
                        }
                    </select>
                </PermissionTooltip>
            );
        } else {
            return "";
        }      
    } 

    renderCommonView() {
        const detail = this.props.detail;
        let order = null;
        if (detail.Orders) {
            order = detail.Orders[0];
        } else {
            order = detail;
        }

        return (
            <div className="main" style={{ paddingTop: '46px' }}>
                <div className="orderlist-container">
                    <div className="container-fluid">
                        {/* title */}
                        <div className="sc-upper">
                            <div className="sc-u title-sc-u sc-u-mid full-width">
                                <div className="nav-breadcrumb">
                                    <i className="fa fa-angle-left" /> <a href="/merchants/order/history">Back</a>
                                </div>
                                <div className="flex-title">
                                    <span className="sc-text-big">Purchase Order Details</span>
                                    <div className="order-date pull-right">{this.formatDate(order.CreatedDateTime)} {this.formatTime(order.CreatedDateTime)}</div>
                                </div>
                            </div>
                        </div>
                        {/* title */}
                        <section className="sassy-box">
                            <div className="sassy-box-content box-order-detail">
                                <div className="row">
                                    {this.renderBillingAddress()}
                                    <div className="col-md-4">{servicelevel ? this.renderShippingAddress() : ''} </div>
                                    <ShippingPaymentDetailComponent
                                        serviceLevel={servicelevel}
                                        renderStatusDropdown={this.renderStatusDropdown}
                                        onDropdownChange={this.onDropdownChange}
                                        onCheckboxChange={this.onCheckboxChange}
                                        getLatestFulfillmentStatus={this.getLatestFulfillmentStatus}
                                        getLatestOrderStatus={this.getLatestOrderStatus}
                                        {...this.props} />
                                    <div className="spacer-20" />
                                    <div className="col-md-12">
                                        <div className="row">
                                            {this.renderSupplierAddress()}
                                            {servicelevel ? '': this.renderShippingAddress()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="sassy-box no-border box-order-items">
                            <table className="table order-data table-items">
                                <TableHeaderComponent enableReviewAndRating={this.props.enableReviewAndRating} />
                          
                                <tbody><TableItemsComponent {...this.props} 
                                    enableReviewAndRating={this.props.enableReviewAndRating} />
                                </tbody>
                        
                            </table>
                        </section>
                        <TransactionSummaryComponent {...this.props} />
                        <OrderDiaryComponent
                            eventCustomField={this.props.eventCustomField}
                            events={this.getAllEvents()}
                            selectedSection={this.props.selectedSection}
                            selectedTabSection={this.props.selectedTabSection}
                            uploadFile={this.props.uploadFile}
                            isValidUpload={this.props.isValidUpload}
                            isSuccessCreate={this.props.isSuccessCreate}
                            fetchEvents={this.props.fetchEvents}
                            updateSelectedSection={this.props.updateSelectedSection}
                            updateSelectedTabSection={this.props.updateSelectedTabSection}
                            setUploadFile={this.props.setUploadFile}
                            createEvent={this.props.createEvent}
                            pagePermissions={this.props.pagePermissions}
                            validatePermissionToPerformAction={this.props.validatePermissionToPerformAction} />

                    </div>
                </div>
                <ModalEditBooking onUpdateBookingSlot={this.props.onUpdateBookingSlot}/>
                <ModalConfirmCancel orderStatus={this.state.orderStatus} displayStyle={this.state.displayStyle} updateDetailOrder={this.props.updateDetailOrder}/>
                <ModalSuccessChangeComponent showHideSuccessMessage={this.props.showHideSuccessMessage} />
                <div id="cover" style={{ display: 'block' }} />
            </div>
        );
    }

    onCheckboxChange(e, cartItemID) {
        const self = this;
        const checked = e.target.checked;

        this.props.validatePermissionToPerformAction("edit-merchant-purchase-order-details-api", () => {
            self.props.revertPayment(checked, cartItemID);
        });
    }
    
    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayoutComponent user={this.props.user} />
                </aside>
                <div className="main-content">
                    {this.renderCommonView()}
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
        user: state.userReducer.user,
        pagePermissions: state.userReducer.pagePermissions,
        detail: state.orderReducer.detail,
        isShowSuccessMessage: state.orderReducer.isShowSuccessMessage,
        enableReviewAndRating: state.orderReducer.enableReviewAndRating,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        bookingDuration: state.orderReducer.bookings,
        orderStatuses: state.orderReducer.orderStatuses,
        fulfilmentStatuses: state.orderReducer.fulfilmentStatuses,
        paymentStatuses: state.orderReducer.paymentStatuses,
        //Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate
    }
}

function mapDispatchToProps(dispatch) {
 
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),

        updateOrderStatusb2binDetails: (status) => dispatch(OrderActions.updateOrderStatusb2binDetails(status)),
        updateDetailOrder: (status) => dispatch(OrderActions.updateDetailOrder(status)),
        showHideConfirmCancel: (isShow) => dispatch(OrderActions.showHideConfirmCancel(isShow)),
        showHideSuccessMessage: (isShow) => dispatch(OrderActions.showHideSuccessMessage(isShow)),
        revertPayment: (isRefund, cartItemID) => dispatch(OrderActions.revertPayment(isRefund, cartItemID)),
        onUpdateBookingSlot: (bookDate, bookTime) => dispatch(OrderActions.onUpdateBookingSlot(bookDate, bookTime)),

        //Order Diary
        fetchEvents: () => dispatch(OrderDiaryActions.fetchEvents()),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData) => dispatch(OrderDiaryActions.createEvent(event, formData))
    }
}

const OrderDetailHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderDetailComponent)

module.exports = {
    OrderDetailHome,
    OrderDetailComponent
}