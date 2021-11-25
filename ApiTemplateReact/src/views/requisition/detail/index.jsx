'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;

const RequisitionOrderDetail = require('./order-detail');
const RequisitionOrderItems = require('./order-items');
const RequisitionOrderTotal = require('./order-total');
const RequisitionOrderDiary = require('../../order-diary/index');
const PermissionTooltip = require('../../common/permission-tooltip');

const OrderDiaryActions = require('../../../redux/orderDiaryActions');
const RequisitionActions = require('../../../redux/requisitionActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

const sections = [
    { key: 'Approvals', value: 'Approvals' },
    { key: 'Comments', value: 'Comments' },
];

const editRequisitionOrderDetailsCode = 'edit-consumer-requisition-order-details-api';
const addRequisitionOrderDetailsCode = 'add-consumer-requisition-order-details-api';

class RequisitionDetailComponent extends BaseComponent {

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    handleCancel() {
        $('.order-state-popup').fadeOut(function() {
            $('#cover').fadeOut();
        });
    }

    handleConfirm(isApproved) {
        const self = this;
        self.props.addUserRequisitionApproval({
            'Id': self.props.requisitionDetail.ID,
            'Status': isApproved ? 'Approved' : 'Rejected',
            'Metadata': this.props.requisitionDetail.MetaData || '',
            'Flow': this.props.flow ? JSON.stringify(this.props.flow) : null,
        }, function () {
            $('.order-state-popup').fadeOut(function () {
                $('#cover').fadeOut();
                $('.top-snackbar .snack-slide:visible').slideUp('slow', 'linear', function () {
                    const name = isApproved ? '.slide-approved' : '.slide-rejected';
                    $('.top-snackbar ' + name).slideDown();
                });
            });
            self.props.updateSelectedSection('Approvals');
            const status = isApproved ? 'Accept' : 'Reject';
            self.props.createEvent(status, null, 'requisition-detail');
        });
    }

    renderRejectModal() {
        return (
            <div className="popup-area order-state-popup order-rejected" style={{ display: 'none'}}>
                <div className="wrapper">
                    <div className="title-area text-capitalize text-center">
                        <h1>Confirm Reject Requisition Order</h1>
                    </div>
                    <div className="btn-area">
                        <div className="btn-flex">
                            <input type="button" value="Cancel" className="btn-pop btn-pop-cancel" onClick={() => this.handleCancel()} />
                            <input type="button" value="Okay" className="btn-pop btn-pop-okey" onClick={() => this.handleConfirm(false)} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderApproveModal() {
        return (
            <div className="popup-area order-state-popup order-approved" style={{ display: 'none'}}>
                <div className="wrapper">
                    <div className="title-area text-capitalize text-center">
                        <h1>Confirm Approve Requisition Order</h1>
                    </div>
                    <div className="btn-area">
                        <div className="btn-flex">
                            <input type="button" value="Cancel" className="btn-pop btn-pop-cancel" onClick={() => this.handleCancel()} />
                            <input type="button" value="Okay" className="btn-pop btn-pop-okey" onClick={() => this.handleConfirm(true)} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    handleApproveBtnClick() {
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction(editRequisitionOrderDetailsCode, () => {
            $('#cover').fadeIn(function() {
                $('.order-state-popup.order-approved').fadeIn();
            })
        });
        
    }

    handleRejectBtnClick() {
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction(editRequisitionOrderDetailsCode, () => {
            $('#cover').fadeIn(function() {
                $('.order-state-popup.order-rejected').fadeIn();
            });
        });
    }

    renderApprovalActions() {
        const { isAuthorizedToEdit } = this.props;
        if (this.props.isApprover && !this.props.hasApprovedOrRejected) {
            const extraClass = isAuthorizedToEdit ? '' : 'disabled';
            return (
                <div className="top-snackbar">
                    <div className="orderlist-container">
                        <div className="order-actions snack-slide active">
                            <label htmlFor="">This order needs your approval: </label>
                            <PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="bottom">
                                <button
                                    type="button"
                                    className={`order-act-btn btn-approve ${extraClass}`}
                                    onClick={() => this.handleApproveBtnClick()}
                                >
                                    Approve
                                </button>
                            </PermissionTooltip>
                            <PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="bottom">
                                <button
                                    type="button"
                                    className={`order-act-btn btn-reject ${extraClass}`}
                                    onClick={() => this.handleRejectBtnClick()}
                                >
                                    Reject
                                </button>
                            </PermissionTooltip>
                        </div>
                        <div className="snack-slide slide-approved">
                            <div className="message">You have <strong>Approved</strong> this requisition order. </div>
                        </div>
                        <div className="snack-slide slide-rejected">
                            <div className="message">You have <strong>Rejected</strong> this requisition order. </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    renderRequisitionCreatedDateTime() {
        if (this.props.requisitionDetail && this.props.requisitionDetail.CreatedDateTime) {
            return (<div className="order-date">{this.formatDateTime(this.props.requisitionDetail.CreatedDateTime, 'MM/DD/YYYY HH:mm')}</div>);
        }
        return;
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
                    <div className="main" style={{ paddingTop: '46px' }}>
                        {this.renderApprovalActions()}
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid full-width">
                                        <div className="nav-breadcrumb">
                                            <i className="fa fa-angle-left"></i> <a href="/requisition/list">Back</a>
                                        </div>
                                        <div className="flex-title">
                                            <span className="sc-text-big">
                                                {this.props.isApprover && !this.props.hasApprovedOrRejected ? 'Requisition Order Approval' : 'Requisition Order Details'}
                                            </span>
                                            {this.renderRequisitionCreatedDateTime()}
                                        </div>
                                    </div>
                                </div>
                                <RequisitionOrderDetail {...this.props} />
                                <RequisitionOrderItems {...this.props} />
                                <RequisitionOrderTotal {...this.props} />
                                <RequisitionOrderDiary
                                    sections={sections} 
                                    eventCustomField={this.props.eventCustomField}
                                    events={this.getAllEvents()}
                                    page={"requisition-detail"}
                                    mode={"no-border"}
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
                                    permissionCode={addRequisitionOrderDetailsCode}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderRejectModal()}
                {this.renderApproveModal()}
                <div id="cover" style={{ display: 'none'}}></div>
            </React.Fragment>
        );
    }
}


function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        requisitionDetail: state.requisitionReducer.requisitionDetail,
        isApprover: state.requisitionReducer.isApprover,
        hasApprovedOrRejected: state.requisitionReducer.hasApprovedOrRejected,
        flow: state.requisitionReducer.flow,
        pendingOffer: state.requisitionReducer.pendingOffer,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        // Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate,
        //permissions
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // Order Diary
        fetchEvents: (page) => dispatch(OrderDiaryActions.fetchEvents(page, 'Comments')),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData, page) => dispatch(OrderDiaryActions.createEvent(event, formData, page)),
        addRequisitionStatus: (options, callback) => dispatch(RequisitionActions.addRequisitionStatus(options, callback)),
        addUserRequisitionApproval: (options, callback) => dispatch(RequisitionActions.addUserRequisitionApproval(options, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const RequisitionDetailHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(RequisitionDetailComponent);

module.exports = {
    RequisitionDetailHome,
    RequisitionDetailComponent
};