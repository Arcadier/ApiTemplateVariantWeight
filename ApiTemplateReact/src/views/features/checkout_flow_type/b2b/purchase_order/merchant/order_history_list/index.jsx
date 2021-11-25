'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../../shared/base');
var Moment = require('moment');

if (typeof window !== 'undefined') { var $ = window.$; }

const PermissionTooltip = require('../../../../../../common/permission-tooltip');

class MerchantFeaturePurchaseOrderListB2cComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            invoiceNo:''
        };
    }

    onDropdownChange(e) {
        var self = this;
        var target = e.target;

        this.props.validatePermissionToPerformAction("edit-merchant-purchase-orders-api", () => {
            self.setState({ status: target.value, invoiceNo: target.id });
            self.renderModalPopup();
            self.props.updateHistoryOrdersB2B(target.id, target.value);
        });
    }

    onCheckboxChange(e, cartitemId) {
        const self = this;
        const checked = e.target.checked;

        this.props.validatePermissionToPerformAction("edit-merchant-purchase-orders-api", () => {
            self.props.revertPaymentOrderList(checked, cartitemId);
        });
    }

    renderModalPopup() {
        var target = jQuery(".popup-area.order-itemstatus-popup");
        var cover = jQuery("#cover");
        target.fadeIn();
        cover.fadeIn();
    }

    closeModalPopUp() {
        jQuery(".popup-area.order-pickup-dilvery-popup").fadeOut();
        jQuery(".popup-area.order-dilvery-popup").fadeOut();
        jQuery("#cover").fadeOut();
    }

    componentDidMount() {
        $('body').on('click', '.slrordrlst-refnd-chk', function () {
           order_itemstatus_popup(this);
        });
        
        $('body').on('change', '.order-item-status-popup', function () {
          // order_itemstatus_popup(this);
        });

        jQuery(".btn-saffron").click(function () {
            $(this).parents(".popup-area").hide();
            jQuery("#cover").hide();
        });

        $('body').on('click', function (e) {
            var $target = $(e.target);

            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });

        $('body').on('click', '.close-status-change-popup', function () {
          //  closeStatusChangePopup();
        });

        function closeStatusChangePopup() {
            jQuery(".popup-area.order-pickup-dilvery-popup").fadeOut();
            jQuery(".popup-area.order-dilvery-popup").fadeOut();
            jQuery("#cover").fadeOut();
        }

        function order_itemstatus_popup(obj) {
            var target = jQuery(".popup-area.order-itemstatus-popup");
            var cover = jQuery("#cover");
            target.fadeIn();
            cover.fadeIn();
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

    renderStatusDropdown(order, type) {
        if (order && order.CartItemDetails) {
            const cartItem = order.CartItemDetails[0];

            let latestStatus = null;
            let statuses = [];

            if (type == 'order') {
                latestStatus = this.getLatestOrderStatus(cartItem);
                statuses = this.props.statuses;
            } else if (type == 'fulfilment') {
                latestStatus = this.getLatestFulfillmentStatus(cartItem);
                statuses = this.props.fulfilmentStatuses;
            }

            //if the status was deleted
            const statusExist = statuses.find(d => d.ID == latestStatus.ID);
            if (!statusExist)
                latestStatus = null;

            return (
                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                    <div className="select-wrapper mxwr">
                        <select className="order-item-status-popup" id={order.ID} defaultValue={latestStatus ? latestStatus.ID : ''} onChange={(e) => this.onDropdownChange(e)}>
                            {
                                <option disabled value="" selected></option>
                            }
                            {
                                statuses.map(function (status, index) {
                                    let statusText = status.ComputedAlias;

                                    return (
                                        <option key={index} value={status.ID}>{statusText}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </PermissionTooltip>
            )
        } else {
            return "";
        }
    }

    renderInvoiceList(order) {
        let links = [];
        if (order && order.PaymentDetails && order.PaymentDetails.length > 0) {
            let uniquePayments = this.getUnique(order.PaymentDetails, 'InvoiceNo');

            if (uniquePayments) {
                //ARC10131
                uniquePayments.forEach(function (payment, index) {
                    links.push(<a href={`/invoice/detail/${payment.InvoiceNo}`} key={index}>{payment.CosmeticNo != null && payment.CosmeticNo != "" ? payment.CosmeticNo : payment.InvoiceNo}</a>);
                    links.push(<span key={'comma-' + index}> , </span>);
                });
            }
            links.pop();

            return (
                <React.Fragment>
                    {links}
                </React.Fragment>
            )
        }

        return (<a href='#'>-</a>);
    }

    renderRecords() {
        var self = this;
        if (self.props.Records != null && self.props.Records.length > 0) {
            var html = this.props.Records.map(function (obj, index) {
                return <tr className="account-row " data-key="item" data-id={1} key={obj.ID}>
                    <td><a href={"/merchants/order/detail/orderid/" + obj.ID}>{obj.CosmeticNo != null && obj.CosmeticNo != "" ? obj.CosmeticNo : obj.PurchaseOrderNo}</a></td>
                    <td><a href={"/merchants/order/detail/orderid/" + obj.ID}>{self.formatDateTime(obj.CreatedDateTime)}</a></td>
                    <td><a href={"/merchants/order/detail/orderid/" + obj.ID}>{obj.ConsumerDetail.DisplayName}</a></td>
                    <td className="wrap-col" data-th="Invoice No">
                        <div className="ids-wrap">
                            {self.renderInvoiceList(obj)}
                        </div>
                    </td>
                    <td className="text-right">
                        <a href={"/merchants/order/detail/orderid/" + obj.ID}>
                            <div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.formatMoney(obj.CurrencyCode, obj.GrandTotal)}</span></div>
                        </a>
                    </td>
                    <td className="no-click">{self.renderStatusDropdown(obj, 'order')}</td>
                    <td className="no-click">{self.renderStatusDropdown(obj, 'fulfilment')}</td>
                </tr>
            });
            return html;
        } 
    }

    renderUpdatePopup() {
      return(  <div className="popup-area order-itemstatus-popup">
            <div className="wrapper">
                <div className="title-area text-capitalize">
                    <h1 className="text-center">STATUS CHANGED</h1>
                </div>
                <div className="content-area text-center">
                    <p>The order status for this item has been updated.</p>
                </div>
                <div className="btn-area text-center">
                    <input data-key data-id type="button" defaultValue="Okay" className="my-btn btn-saffron" />
                    <div className="clearfix" />
                </div>
            </div>
        </div>)
    }

    renderEmpty() {
        if (this.props.Records != null && this.props.Records.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/order-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">No orders yet.</div>
                    <div className="empty-page-message">Your Orders will be shown here</div>
                </div>
            );
        }
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="subaccount-data-table table-responsive">
                    <table className="table order-data1 tb-left sub-account clickable">
                        <thead>
                            <tr>
                                <th>Order No.</th>
                                <th>Timestamp</th>
                                <th>Buyer</th>
                                <th>Invoice No</th>
                                <th>Total</th>
                                <th>Order Status</th>
                                <th>Fulfillment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.renderRecords()
                            }
                        </tbody>
                    </table>
                    {this.renderEmpty()}
                </div>
                {self.renderUpdatePopup()}
            </React.Fragment>
        );
    }
}

module.exports = MerchantFeaturePurchaseOrderListB2cComponent;