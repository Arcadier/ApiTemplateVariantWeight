'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var Toastr = require('toastr');

var BaseComponent = require('../../../../../../views/shared/base');

var OrderActionComponent = require('./order-action');
var OrderListComponent = require('./order-list');
var PaginationComponent = require('../../../../../../views/common/pagination');
var ModalStatusChangeComponent = require('./modal-status-change');
var ModalSuccessChangeComponent = require('./modal-success-change');


var EnumCoreModule = require('../../../../../../public/js/enum-core');

class OrderHistoryComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.showHideChangeStatusModal = this.showHideChangeStatusModal.bind(this);
    }

    showHideChangeStatusModal(isShow) {
        if (this.props.selectedOrders.length > 0) {
            this.props.showHideChangeStatus(isShow);
        } else {
            this.showMessage(EnumCoreModule.GetToastStr().Error.NO_ORDER_SELECTED_TO_UPDATE);
        }
    }

    componentDidUpdate() {
        if (this.props.isShowChangeStatus === true || this.props.isShowSuccessMessage === true) {
            $("#cover").fadeIn();
            if (this.props.isShowChangeStatus == true) {
                $(".popup-area.order-pickup-dilvery-popup").fadeIn();
                $(".popup-area.order-itemstatus-popup").hide();
            } else {
                $(".popup-area.order-itemstatus-popup").fadeIn();
                $(".popup-area.order-pickup-dilvery-popup").hide();
            }
        } else {
            $(".popup-area.order-pickup-dilvery-popup").hide();
            $(".popup-area.order-itemstatus-popup").hide();
            $("#cover").hide();
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="main">
                    <div className="orderlist-container">
                        <div className="container">
                            <div className="sc-upper">
                                <div className="sc-u sc-u-mid full-width">
                                    <div className="pull-left">
                                        <span className="sc-text-big">Order History</span>
                                    </div>
                                    <OrderActionComponent
                                        keyword={this.props.keyword}
                                        searchOrder={this.props.searchOrder}
                                        showHideChangeStatusModal={this.showHideChangeStatusModal} />
                                </div>
                            </div>
                            <div className="oreder-data-table">
                                <OrderListComponent
                                    invoices={this.props.history !== null ? this.props.history.Records : null}
                                    selectedOrders={this.props.selectedOrders}
                                    selectUnselectOrder={this.props.selectUnselectOrder}
                                    updateHistoryOrders={this.props.updateHistoryOrders} />
                                <PaginationComponent
                                    totalRecords={this.props.history.TotalRecords}
                                    pageNumber={this.props.history.PageNumber}
                                    pageSize={this.props.history.PageSize}
                                    filters={{}}
                                    goToPage={this.props.goToPage} />
                            </div>
                        </div>
                    </div>
                </div>
                <ModalStatusChangeComponent
                    invoices={this.props.history !== null ? this.props.history.Records : null}
                    selectedOrders={this.props.selectedOrders}
                    selectedOrderStatus={this.props.selectedOrderStatus}
                    selectedFulfillmentStatuses={this.props.selectedFulfillmentStatuses}
                    selectedDeliveryTypeName={this.props.selectedDeliveryTypeName}
                    updateSelectedOrderStatus={this.props.updateSelectedOrderStatus}
                    updateHistoryOrders={this.props.updateHistoryOrders}
                    showHideChangeStatus={this.props.showHideChangeStatus} />
                <ModalSuccessChangeComponent
                    showHideSuccessMessage={this.props.showHideSuccessMessage} />
                <div id="cover"></div>
            </React.Fragment>
        );
    }
}

module.exports = OrderHistoryComponent