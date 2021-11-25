'use strict';
const React = require('react');
const toastr = require('toastr');
const BaseComponent = require('../../../../shared/base');

class OrderSummary extends BaseComponent {

    getShippingOptionCost() {
        let shippingOptionCost = 0;
        this.props.shippingOptions.map(function (data, index) {
            if (data.Selected == true) {
                shippingOptionCost = parseFloat(data.ShippingCost);
            }
        });
        return shippingOptionCost;
    }
    getTotal() {
        var self = this;
        let total = 0;
        //BAD DATA PREVENTION ERROR

        total = this.getSubTotal();

        this.props.shippingOptions.map(function (data, index) {
            if (data.Selected == true) {
                total = total + parseFloat(data.ShippingCost);
            }
        })
        if (total === 0) {
            total = parseFloat(self.props.invoiceDetails.Total);
        }

        return total;
    }
    getSubTotal() {
        let subTotal = 0;
        //BAD DATA PREVENTION ERROR
        if (this.props.invoiceDetails.Orders && this.props.invoiceDetails.Orders[0] &&
            this.props.invoiceDetails.Orders[0].CartItemDetails && this.props.invoiceDetails.Orders[0].CartItemDetails[0] &&
            this.props.invoiceDetails.Orders[0].CartItemDetails[0].SubTotal) {
            subTotal = this.props.invoiceDetails.Orders[0].CartItemDetails[0].SubTotal;

            if (this.props.invoiceDetails.Orders && this.props.invoiceDetails.Orders[0] &&
                this.props.invoiceDetails.Orders[0].CartItemDetails && this.props.invoiceDetails.Orders[0].CartItemDetails[0] &&
                this.props.invoiceDetails.Orders[0].CartItemDetails[0].DiscountAmount) {
                subTotal = parseFloat(subTotal) - parseFloat(this.props.invoiceDetails.Orders[0].CartItemDetails[0].DiscountAmount);
            }

        }
        return subTotal;
    }
    previousClicked() {
        window.location = "/checkout/delivery?invoiceNo=" + this.props.invoiceDetails.InvoiceNo + "&comparisonId=" + this.props.comparisonId;
    }

    issueOrderClicked() {
        const self = this;
        let shouldProceed = false;
        this.props.shippingOptions.map(function (data, index) {
            if (data.Selected == true) {
                shouldProceed = true;
            }
        });
        this.props.pickupOptions.map(function (data, index) {
            if (data.Selected == true) {
                shouldProceed = true;
            }
        });
        if (shouldProceed) {
            this.props.updateToPaid(this.props.invoiceDetails, this.props.comparisonId, function(errorMessage) {
                self.showMessage(errorMessage);
            })
        } else {
            toastr.error("Oops! Something went wrong.Please select a delivery method.");
        }

    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="pcc-rigth pull-right">
                    <div className="cbcir-box">
                        <span className="cbcir-title">Order Summary</span>
                        <div className="cbcir-text">
                            <span className="title full-width">
                                Delivery Address
                                <span className="sbcir-btn" onClick={() => { this.previousClicked() }}>
                                    Edit
                                    </span>
                            </span>
                            <div className="pccr-text1">
                                <span>{this.props.address.FirstName} {this.props.address.LastName}</span>
                                <span>{this.props.address.Address1}</span>
                                <span>{this.props.address.Country}</span>
                                <span>{this.props.address.City}</span>
                                <span>{this.props.address.State}</span>
                                <span>{this.props.address.PostalCode}</span>
                            </div>
                            <div className="pccr-text2">
                                <span>
                                    <span className="title">Sub-Total</span>
                                    <div className="item-price subTotal">
                                        <span className="item-price">
                                            {self.renderFormatMoney(self.props.invoiceDetails.CurrencyCode, self.getSubTotal())} 
                                        </span>
                                    </div>
                                </span>
                                <span>
                                    <span className="title">Delivery Cost</span>
                                    <div className="item-price deliveryCost">
                                        <span className="item-price">
                                            {self.renderFormatMoney(self.props.invoiceDetails.CurrencyCode, self.getShippingOptionCost())} 
                                        </span>
                                    </div>
                                </span>
                            </div>
                        </div>
                        <div className="pccr-total">
                            <span className="pccrt-sml">Total</span>
                            <span className="total-amount">
                                <div className="item-price totalCost">
                                    <span className="item-price">
                                        {self.renderFormatMoney(self.props.invoiceDetails.CurrencyCode, self.getTotal())} 
                                    </span>
                                </div>
                            </span>
                        </div>
                        <div className="pccr-btn">
                            <div className="btn-green"
                                onClick={() => { this.issueOrderClicked() }}
                                id="btnProceedPayment">Issue Purchase Order</div>
                            <div className="btn-white"
                                onClick={() => { this.previousClicked() }}>
                                <a>Previous</a></div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = OrderSummary;