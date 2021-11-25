'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const Moment = require('moment');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const OrderItemsComponent = require('../shared/order-items');
const OrderTotalComponent = require('../shared/order-total');
const PermissionTooltip = require('../../common/permission-tooltip');
const OrderDiaryComponent = require('../../order-diary/index-with-border');
const ReceivingNoteActions = require('../../../redux/recevingNoteActions');
const OrderDiaryActions = require('../../../redux/orderDiaryActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');
const CommonModule = require('../../../public/js/common');

const addReceivingNoteDetailsCode = 'add-consumer-receiving-note-details-api';
const sections = [
    { key: 'Comment', value: 'Comment' }
];

class ReceivingNoteDetailComponent extends BaseComponent {
    renderBanner() {
        if (this.props.receivingNoteDetails && this.props.receivingNoteDetails.Void) {
            return (
                <div className="notify_void">
                    <img src="/assets/images/void_white.svg" height="20" width="20" />&nbsp;
                    {`Receipt has been voided on ${this.formatDateTime(this.props.receivingNoteDetails.ModifiedDateTime)}`}
                </div>
            );
        } else if (this.props.receivingNoteDetails && this.props.receivingNoteDetails.ReferenceReceivingNote && this.props.receivingNoteDetails.ReferenceReceivingNote.ID) {
            const { ReferenceReceivingNote } = this.props.receivingNoteDetails;
            return (
                <div className="notify_void auto">
                    GRO generated from voided &nbsp;<a href={"/receiving-note/detail?id=" + ReferenceReceivingNote.ID}>{ReferenceReceivingNote.CosmeticNo != null && ReferenceReceivingNote.CosmeticNo != "" ? ReferenceReceivingNote.CosmeticNo : ReferenceReceivingNote.ReceivingNoteNo}</a>
                </div>
            );
        }
        return;
    }

    showVoidModal() {
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction('edit-consumer-receiving-note-details-api', () => {
            const target = $(".popup-area.void-popup");
            const cover = $("#cover");
            target.fadeIn();
            cover.fadeIn();
        });
    }

    hideVoidModal() {
        const target1 = $(".popup-area.void-popup");
        const cover1 = $("#cover");
        target1.fadeOut();
        cover1.fadeOut();
    }

    renderVoidButton() {
        if (this.props.receivingNoteDetails && this.props.receivingNoteDetails.Void == false && !this.props.receivingNoteDetails.ReferenceReceivingNote) {
            const btnClass = `sassy-btn sassy-btn-bg ${this.props.isAuthorizedToEdit ? '' : 'disabled'}`;
            return (
                <div className="void-pop pull-left">
                    <PermissionTooltip isAuthorized={this.props.isAuthorizedToEdit}>
                        <a href="#" className={btnClass} onClick={() => this.showVoidModal()}>Void Receipt</a>
                    </PermissionTooltip>
                </div>
            )
        }
        return;
    }

    onCreateReceiptBtnClick(orderID) {
        if (!this.props.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction(addReceivingNoteDetailsCode, () => {
            window.location.href = '/receiving-note/create?id=' + orderID;
        });
    }

    renderCreateReceiptBtn() {
        if (this.props.receivingNoteDetails && this.props.receivingNoteDetails.Void == false && !this.props.receivingNoteDetails.ReferenceReceivingNote) {
            const { isAuthorizedToAdd } = this.props;
            const btnClass = `sassy-btn sassy-btn-bg submit-receipt ${this.props.isAuthorizedToAdd ? '' : 'disabled'}`;
            return (
                <div className="save-actions flex-pull-right">
                    <PermissionTooltip isAuthorized={isAuthorizedToAdd}>
                        <a href={null} onClick={() => this.onCreateReceiptBtnClick(this.props.orderDetail.ID)} className={btnClass}>Create Receipt</a>
                    </PermissionTooltip>
                </div>
            )
        }
        return;
    }
    
    voidReceivingNote() {
        this.props.voidReceivingNote(this.props.receivingNoteDetails.ID, null);
        this.hideVoidModal();
    }

    renderVoidModal() {
        return (
            <div className="popup-area  void-popup" style={{ display: 'none'}}>
                <div className="wrapper">
                    <div className="title-area text-capitalize">
                        <h1>VOID RECEIPT</h1>
                    </div>
                    <div className="content-area">
                        <p>Are you sure you want to void this receipt? </p>
                        <p>This action is irreversible</p>
                    </div>
                    <div className="btn-area">
                        <div className="pull-left">
                            <input type="button" value="Cancel" className="my-btn btn-black cancel_void" onClick={() => this.hideVoidModal()} />
                        </div>
                        <div className="pull-right">
                            <input data-key="" data-id="" type="button" value="Okay" className="my-btn btn-saffron confirm_void" onClick={() => this.voidReceivingNote()} />
                        </div>
                    </div>
                </div>
            </div>
        );
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
                    <div className="main" style={{ paddingTop: '45px' }}>
                        {this.renderBanner()}
                        <div className="orderlist-container pdt-50">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12 mb-15">
                                        <div className="fl_wrapper">
                                            <div className="nav-breadcrumb">
                                                <i className="fa fa-angle-left" />&nbsp;
                                                <a href="/receiving-note/list">Back</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="send-quotation clearfix">
                                            <span className="sc-text-big full-width mb-15">
                                                Receiving Notes
                                            </span>
                                            <div className="form-group clearfix">
                                                <div className="quick-details">
                                                    <div className="details-row">
                                                        <div>
                                                            <label>Date Received</label>
                                                            <p>{this.formatDateTime(this.props.receivingNoteDetails.ReceiveDateTime)}</p>
                                                        </div>
                                                        <div>
                                                            <label>Receiving Notes No.</label>
                                                            <p>{this.props.receivingNoteDetails.CosmeticNo != null && this.props.receivingNoteDetails.CosmeticNo != "" ? this.props.receivingNoteDetails.CosmeticNo : this.props.receivingNoteDetails.ReceivingNoteNo}</p>
                                                        </div>
                                                        <div>
                                                            <label>PO No.</label>
                                                            <p>{this.props.orderDetail.CosmeticNo != null && this.props.orderDetail.CosmeticNo != "" ? this.props.orderDetail.CosmeticNo : this.props.orderDetail.PurchaseOrderNo}</p>
                                                        </div>
                                                        <div>
                                                            <label>Supplier</label>
                                                            <p>{this.props.orderDetail.MerchantDetail.DisplayName}</p>
                                                        </div>
                                                        {this.renderCreateReceiptBtn()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group clearfix" />
                                    </div>
                                    <OrderItemsComponent orderDetail={this.props.orderDetail} receivingNoteDetails={this.props.receivingNoteDetails} locationVariantGroupId={this.props.locationVariantGroupId} />
                                </div>
                                <OrderTotalComponent orderDetail={this.props.orderDetail} />
                                <OrderDiaryComponent
                                    sections={sections}
                                    eventCustomField={this.props.eventCustomField}
                                    events={this.props.allEvents}
                                    page={"receiving-note"}
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
                                    permissionCode={addReceivingNoteDetailsCode}

                                />
                                {this.renderVoidButton()}
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderVoidModal()}
                <div id="cover" style={{ display: 'none' }} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        orderDetail: state.receivingNoteReducer.orderDetail,
        receivingNoteDetails: state.receivingNoteReducer.receivingNoteDetails,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        //Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate,
        allEvents: (state.orderDiaryReducer.events || []).concat(state.orderDiaryReducer.otherEvents || [])
    };
}

function mapDispatchToProps(dispatch) {
    return {
        voidReceivingNote: (receivingNoteId, callback) => dispatch(ReceivingNoteActions.voidReceivingNote(receivingNoteId, callback)),
        //Order Diary
        fetchEvents: (page) => dispatch(OrderDiaryActions.fetchEvents(page, 'Comment')),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData, page) => dispatch(OrderDiaryActions.createEvent(event, formData, page)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const ReceivingNoteDetailHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ReceivingNoteDetailComponent);

module.exports = {
    ReceivingNoteDetailHome,
    ReceivingNoteDetailComponent
};