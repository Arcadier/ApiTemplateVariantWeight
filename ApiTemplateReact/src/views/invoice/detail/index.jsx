'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const Entities = require('html-entities').XmlEntities;
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const OrderDiary = require('../../order-diary/index');
const OrderDiaryWithBorder = require('../../order-diary/index-with-border');
const PermissionTooltip = require('../../common/permission-tooltip');
const InvoiceDetail = require('../shared/invoice-detail');
const OrderDetail = require('../shared/order-detail');
const OrderItems = require('../shared/order-items');
const OrderTotal = require('../shared/order-total');
const InvoiceActions = require('../../../redux/invoiceActions');
const OrderDiaryActions = require('../../../redux/orderDiaryActions');

const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

const sections = [
    { key: 'Comment', value: 'Comment' },
];

class InvoiceDetailsComponent extends React.Component {

    componentDidMount() {
        $('#inv-payment-intro').on('click', function () {

            const target = $(".popup-area.offline-transaction-popup");
            const cover = $("#cover");

            target.fadeIn();
            cover.fadeIn();

        });



        $('.close_popup').on('click', function () {
            const target = $(".popup-area.offline-transaction-popup");
            const cover = $("#cover");

            target.fadeOut();
            cover.fadeOut();
        });
    }
    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    isUserMerchant() {
        const { isUserMerchant = false } = this.props;

        return isUserMerchant;
    }

    onPayBtnClick(invoiceNo) {
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction('edit-consumer-invoice-details-api', () => window.location.href = `/invoice/payment/${invoiceNo}`);
    }

    renderPay() {
        const { invoiceDetail, isAuthorizedToEdit } = this.props;
        let isMerchant = this.isUserMerchant();
        if (!isMerchant) {
            const { Orders } = invoiceDetail;
            if (Orders && Orders[0] && Orders[0].PaymentDetails && Orders[0].PaymentDetails.length > 0) {
                const { PaymentDetails } = Orders[0];
                const payment = PaymentDetails.find(i => i.InvoiceNo == invoiceDetail.InvoiceNo);
                if ((payment && payment.Status === null
                    || payment.Status.toLowerCase() === 'waiting for payment'
                    || payment.Status.toLowerCase() === 'processing'
                    || payment.Status.toLowerCase() === 'pending'
                    || payment.Status.toLowerCase() === 'failed') || (payment.Status && payment.Status.toLowerCase() === "success" && payment.GatewayPayKey === null && payment.DateTimePaid === null)) {
                    const btnClass = `sassy-btn sassy-btn-bg ${!isAuthorizedToEdit ? 'disabled' : ''}`;
                    return (
                        <section className="sassy-box no-border">
                            <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                <a href="#" onClick={() => this.onPayBtnClick(invoiceDetail.InvoiceNo)} className={btnClass}>Pay this Invoice</a>
                            </PermissionTooltip>
                        </section>
                    );
                }
            }
        }

        return null;
    }
    renderPaymentInstructionModal() {
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders[0]) {
            const order = this.props.invoiceDetail.Orders[0];
            if (order && order.PaymentDetails && order.PaymentDetails.length > 0) {
                const thisInvoice = order.PaymentDetails.find(inv => inv.InvoiceNo == this.props.invoiceDetail.InvoiceNo);
                if (thisInvoice && thisInvoice.Gateway && this.props.paymentMethods && this.props.paymentMethods.length > 0) {
                    const paymentMethod = this.props.paymentMethods.find(p => p.PaymentGateway && p.PaymentGateway.Gateway == thisInvoice.Gateway.Gateway) || null;
                    if (thisInvoice.Gateway.Code.includes('-offline-payments-') && paymentMethod !== null) {
                        const decodeText = new Entities().decode(paymentMethod.Description);
                        return (
                            <div className="popup-area offline-transaction-popup" style={{ display: 'none' }}>
                                <div className="wrapper">
                                    <div className="title-area text-capitalize">
                                        <h1>{thisInvoice.Gateway.Gateway}</h1>
                                        <span className="close_popup"><i className="fa fa-close"></i></span>
                                    </div>
                                    <div className="content-area text-left" dangerouslySetInnerHTML={{ __html: decodeText }} />
                                </div>
                            </div>
                        );
                    }
                }
            }
        }
        return null;
    }

    render() {
        const OrderDiaryComponent = this.isUserMerchant() ? OrderDiaryWithBorder : OrderDiary;
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={null} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="nav-breadcrumb mt-15">
                                    <i className="fa fa-angle-left"></i> <a href={`${this.isUserMerchant() ? '/merchants' : ''}/invoice/list`}>Back</a>
                                </div>
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid full-width">
                                        <span className="sc-text-big">Invoice</span>
                                    </div>
                                </div>
                                <InvoiceDetail
                                    invoiceDetail={this.props.invoiceDetail}
                                    isUserMerchant={this.isUserMerchant()} renderPay={this.renderPay()} />
                                <OrderDetail
                                    invoiceDetail={this.props.invoiceDetail}
                                    isUserMerchant={this.isUserMerchant()}
                                    updateInvoiceStatus={this.props.updateInvoiceStatus} 
                                    isAuthorizedToEdit={this.props.isAuthorizedToEdit}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                                <OrderItems
                                    invoiceDetail={this.props.invoiceDetail}
                                    locationVariantGroupId={this.props.locationVariantGroupId} />
                                <OrderTotal
                                    invoiceDetail={this.props.invoiceDetail}
                                    isUserMerchant={this.isUserMerchant()} />
                                <OrderDiaryComponent
                                    sections={sections}
                                    eventCustomField={this.props.eventCustomField}
                                    events={this.getAllEvents()}
                                    page={"invoice-detail"}
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
                                    showDropdownPlaceholder={false}
                                    isAuthorizedToAdd={this.props.isAuthorizedToAdd}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                    permissionCode={`add-${this.isUserMerchant() ? 'merchant' : 'consumer'}-invoice-details-api`}
                                />
                            </div>
                            <section className="sassy-box no-border">
                                {this.renderPay()}
                            </section>
                        </div>
                    </div>
                </div>
                {this.renderPaymentInstructionModal()}
                <div id="cover" style={{ display: 'none' }} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        invoiceDetail: state.invoiceReducer.invoiceDetail,
        paymentMethods: state.invoiceReducer.paymentMethods,
        isUserMerchant: state.invoiceReducer.isUserMerchant,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        // Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateInvoiceStatus: (invoiceNo, status) => dispatch(InvoiceActions.updateInvoiceStatus(invoiceNo, status)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        // Order Diary
        fetchEvents: (page) => dispatch(OrderDiaryActions.fetchEvents(page, 'Comment')),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData, page) => dispatch(OrderDiaryActions.createEvent(event, formData, page)),
    };
}

const InvoiceDetailsHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(InvoiceDetailsComponent);

module.exports = {
    InvoiceDetailsHome,
    InvoiceDetailsComponent
};