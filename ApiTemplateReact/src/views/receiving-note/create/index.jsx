'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const Moment = require('moment');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const OrderItemsComponent = require('../shared/order-items');
const OrderTotalComponent = require('../shared/order-total');
const OrderDiaryComponent = require('../../order-diary/index-with-border');
const PermissionTooltip = require('../../common/permission-tooltip');
const ReceivingNoteActions = require('../../../redux/recevingNoteActions');
const OrderDiaryActions = require('../../../redux/orderDiaryActions');
const CommonModule = require('../../../public/js/common');

const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

const addReceivingNotePermissionCode = 'add-consumer-create-receiving-note-api';

const sections = [
    { key: 'Comment', value: 'Comment' }
];

class CreateReceivingNoteComponent extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            isSaving: false
        };
    }

    componentDidMount() {
        $(document).ready(function () {
            $('#date-received').datetimepicker({
                format: 'DD/MM/YYYY'
            });

            $('#time-received').timepicker({
                timeFormat: 'h:i A',
                forceRoundTime: true
            });

            $('#time-received').on('timeFormatError', function () {
                $('#time-received').timepicker('setTime', '');
            });
        });
    }

    createReceipt(e) {
        e.preventDefault();
        let self = this;
        if (!self.state.isSaving) {
            self.setState({
                isSaving: true
            }, () => {
                if (CommonModule.validateFields('.required-input')) {

                    self.setState({
                        isSaving: false
                    }, () => {

                    });

                    return;
                }

                let options = {
                    receiveDateTime: Moment($('#date-received').val() + ' ' + $('#time-received').val(), 'DD/MM/YYYY HH:mm A', true).format('X'),
                    receivingNoteDetails: []
                };

                $('input[name="item-quantity-received"]').each((index, element) => {
                    const $this = $(element);
                    const cartItemId = $this.data('cart-item-id');
                    const remainingQuantity = parseInt($this.data('remaining-quantity'));
                    const quantity = parseInt($this.val());

                    if (quantity > remainingQuantity) {
                        $this.addClass('error-con');
                    } else {
                        options.receivingNoteDetails.push({
                            cartItemId: cartItemId,
                            quantity: quantity
                        });
                    }
                });

                if (options.receivingNoteDetails.length <= 0) {
                    self.setState({
                        isSaving: false
                    }, () => {

                    });
                    return;
                }

                if (!this.props.isAuthorizedToAdd) return;
                self.props.validatePermissionToPerformAction(addReceivingNotePermissionCode, () => {
                    self.props.createReceivingNote(options, (result) => {
                        window.location = '/receiving-note/list';
                    });
                })
            });
        }
    }

    render() {
        const { locationVariantGroupId, orderDetail, isAuthorizedToAdd } = this.props;
        const extraBtnClass = isAuthorizedToAdd ? '' : 'disabled';
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
                        <div className="orderlist-container pdt-50">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="nav-breadcrumb mb-15 clearfix">
                                            <i className="fa fa-angle-left" /> <a href="/receiving-note/list">Back</a>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="send-quotation clearfix">
                                            <span className="sc-text-big full-width mb-15">Create Receiving Notes </span>
                                            <div className="form-group">
                                                <div className="quick-details">
                                                    <div className="details-row">
                                                        <div>
                                                            <label>PO No.</label>
                                                            <div>{orderDetail.CosmeticNo != null && orderDetail.CosmeticNo != "" ? orderDetail.CosmeticNo : orderDetail.PurchaseOrderNo}</div>
                                                        </div>
                                                        <div>
                                                            <label>Supplier</label>
                                                            <div>{orderDetail.MerchantDetail.DisplayName}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group clearfix">
                                                <label>DATE RECEIVED</label>
                                                <div>
                                                    <input className="sassy-control required-input" type="text" name="date-received" id="date-received" placeholder="DD/MM/YYYY" />
                                                    <input className="sassy-control required-input ui-timepicker-input" type="text" name="startTime" id="time-received" placeholder="HH:MM" autoComplete="off" />
                                                </div>
                                                <div className="save-actions pull-right">
                                                    <PermissionTooltip isAuthorized={isAuthorizedToAdd}>
                                                        <a href="#" className={`sassy-btn sassy-btn-bg submit-receipt ${extraBtnClass}`} onClick={(e) => this.createReceipt(e)}>Create Receipt</a>
                                                    </PermissionTooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4" />
                                    <OrderItemsComponent orderDetail={orderDetail} isCreateReceivingNote={true} locationVariantGroupId={locationVariantGroupId} />
                                </div>
                                <OrderTotalComponent orderDetail={orderDetail} />
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
                                    isAuthorizedToAdd={isAuthorizedToAdd}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                    permissionCode={addReceivingNotePermissionCode}
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
        orderDetail: state.receivingNoteReducer.orderDetail,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
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
        createReceivingNote: (options, callback) => dispatch(ReceivingNoteActions.createReceivingNote(options, callback)),
        //Order Diary
        fetchEvents: (page) => dispatch(OrderDiaryActions.fetchEvents(page, 'Comment')),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData, page) => dispatch(OrderDiaryActions.createEvent(event, formData, page)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const CreateReceivingNoteHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateReceivingNoteComponent);

module.exports = {
    CreateReceivingNoteHome,
    CreateReceivingNoteComponent
};