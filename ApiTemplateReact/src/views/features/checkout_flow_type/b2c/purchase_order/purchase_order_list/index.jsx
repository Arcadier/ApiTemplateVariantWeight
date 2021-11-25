'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');
var Moment = require('moment');
const Currency = require('currency-symbol-map');
const PurchaseTableContents = require('./' + process.env.PRICING_TYPE + '/index');

class FeaturePurchaseOrderListB2cComponent extends PurchaseTableContents {

    getLatestOrderStatus(cartItem) {
        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1];
        }

        if (status) {
            if (this.props.statuses && this.props.statuses.Records) {
                const statusExist = this.props.statuses.Records.find(s => s.ID == status.ID);

                if (statusExist) return status.StatusAlias;
            }
        }

        return '';
    }

    getLatestFulfilmentStatus(cartItem) {

        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1];
        }
        
        if (status) {
            if (this.props.fulfilmentStatuses && this.props.fulfilmentStatuses.Records) {
                const statusExist = this.props.fulfilmentStatuses.Records.find(s => s.ID == status.ID);

                if (statusExist) return status.StatusAlias;
                else {
                    //find  by name
                    var statusEx = this.props.fulfilmentStatuses.Records.find(d => d.Name == status.Name);
                    if (statusEx)
                        return statusEx.StatusAlias == null ? statusEx.Alias : statusEx.StatusAlias
                }

            }
        }

        return '';
    }

    renderHeader() {
        if (typeof this.renderCustomHeader == 'function') return this.renderCustomHeader();
        return (
            <thead>
                <tr>
                    <th>Order No.</th>
                    <th>Timestamp</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Order Status</th>
                    <th>Fulfillment Status</th>
                </tr>
            </thead>
        );
    }

    renderCustomListItemContent(contentCode, invoice) {
        if (contentCode == 'BOOKING_DETAILS') {
            if (typeof this.renderBookingDetails == 'function') {
                return this.renderBookingDetails(invoice);
            }
        }
        return;
    }
    renderEmpty() {
        if (this.props.Records && this.props.Records.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/order-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">No orders yet.</div>
                    <div className="empty-page-message">Your Orders will be shown here</div>
                </div>
            )
        }
    }
    render() {
        const self = this;
        if (this.props.Records) {
            return (
                <React.Fragment>
                    <div className="subaccount-data-table table-responsive">
                        <table className="table order-data1 sub-account tb-left clickable">
                            {this.renderHeader()}
                            <tbody>
                                {
                                    this.props.Records && this.props.Records.length > 0 ? this.props.Records.map(function (obj, index) {
                                        //ARC8930 need to adjust here, since the FailedTransaction is using the same Manager as PO here
                                        if (obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Processing" ||
                                            obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Failed" ||
                                            obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Created")
                                            return ""
                                        return <tr className="account-row " data-key="item" data-id={1} key={obj.Orders[0].ID}>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{obj.Orders[0].CosmeticNo != null && obj.Orders[0].CosmeticNo != "" ? obj.Orders[0].CosmeticNo : obj.Orders[0].PurchaseOrderNo}</a></td>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{self.formatDateTime(obj.Orders[0].CreatedDateTime)}</a></td>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{obj.Orders[0].MerchantDetail.DisplayName}</a></td>
                                            {self.renderCustomListItemContent('BOOKING_DETAILS', obj)}
                                            <td className="text-right">
                                                <div className="item-price test">
                                                    <span className="currencyCode"></span>
                                                    <span className="currencySymbol"></span>
                                                    <span className="priceAmount">{self.formatMoney(obj.Orders[0].CurrencyCode, obj.Orders[0].GrandTotal)}</span>
                                                </div>
                                            </td>
                                            {
                                                obj.Orders[0].CartItemDetails ?
                                                    <td>{self.getLatestOrderStatus(obj.Orders[0].CartItemDetails[0])}</td>
                                                    : <td> N/A </td>
                                            }
                                            {
                                                obj.Orders[0].CartItemDetails ?
                                                    <td>{self.getLatestFulfilmentStatus(obj.Orders[0].CartItemDetails[0])}</td>
                                                    : <td> N/A </td>
                                            }

                                        </tr>
                                    }) : ""
                                }
                            </tbody>
                        </table>
                        {this.renderEmpty()}
                    </div>

                </React.Fragment>
            );
        } else {
            return "";
        }

    }
}

module.exports = FeaturePurchaseOrderListB2cComponent;