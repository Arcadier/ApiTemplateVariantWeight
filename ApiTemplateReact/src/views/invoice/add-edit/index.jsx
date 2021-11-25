'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const AddEditComponent = require('../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/index');
const InvoiceActions = require('../../../redux/invoiceActions');

const OrderDiary = require('../../order-diary/index');
const OrderDiaryWithBorder = require('../../order-diary/index-with-border');
const OrderDiaryActions = require('../../../redux/orderDiaryActions');

const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

const sections = [
    { key: 'Comment', value: 'Comment' },
];

class AddEditInvoiceComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    render() {
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
                                <AddEditComponent
                                    invoiceDetail={this.props.invoiceDetail}
                                    renderFormatMoney={this.renderFormatMoney}
                                    createInvoice={this.props.createInvoice}
                                    locationVariantGroupId={this.props.locationVariantGroupId}
                                    pagePermissions={this.props.pagePermissions}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                                <OrderDiaryWithBorder
                                    sections={sections}
                                    eventCustomField={this.props.eventCustomField}
                                    events={this.getAllEvents()}
                                    page={"create-invoice"}
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
                                    isAuthorizedToAdd={this.props.pagePermissions.isAuthorizedToAdd}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                    permissionCode={'add-merchant-create-invoice-api'}
                                />
                            </div>
                        </div>
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
        invoiceDetail: state.invoiceReducer.invoiceDetail,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        // Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate
    };
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        createInvoice: (options, callback) => dispatch(InvoiceActions.createInvoice(options, callback)),
        // Order Diary
        fetchEvents: (page, selectedSection) => dispatch(OrderDiaryActions.fetchEvents(page, selectedSection)),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData, page) => dispatch(OrderDiaryActions.createEvent(event, formData, page))
    };
}

const AddEditInvoiceComponentHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(AddEditInvoiceComponent);

module.exports = {
    AddEditInvoiceComponentHome,
    AddEditInvoiceComponent
};