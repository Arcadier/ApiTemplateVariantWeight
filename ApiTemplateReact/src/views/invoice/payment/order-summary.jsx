'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class InvoiceOrderSummaryComponent extends BaseComponent {
    renderInvoice() {
        const { invoiceDetail } = this.props;

        return (
            <span>
                <span className="title">Invoice No</span>
                <div className="item-price">
                    <span className="currencyCode">{invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo != null && invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo != "" ? invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo : invoiceDetail.InvoiceNo}</span>
                </div>
            </span>
        );
    }

    renderSubTotal() {
        const { invoiceDetail } = this.props;

        return (
            <span>
                <span className="title">Sub-Total</span>
                <div className="item-price">
                    {this.renderFormatMoney(invoiceDetail.CurrencyCode, invoiceDetail.Total)}
                </div>
            </span>  
        );
    }

    renderTotal() {
        const { invoiceDetail } = this.props;

        return (
            <div className="pccr-total">
                <span className="pccrt-sml">Total</span>
                <span className="total-amount">
                    <div className="item-price">
                        {this.renderFormatMoney(invoiceDetail.CurrencyCode, invoiceDetail.Total)}
                    </div>
                </span>   
            </div> 
        );
    }

    render() {
        const { invoiceDetail, proceedPayment } = this.props;

        return (
            <div className="pcc-rigth pull-right">
                <div className="cbcir-box">
                    <span className="cbcir-title">Order Summary</span>
                    <div className="cbcir-text">
                        <div className="pccr-text2">
                            {this.renderInvoice()}
                            {this.renderSubTotal()}
                        </div>
                    </div>
                    {this.renderTotal()}
                    <div className="pccr-btn">
                        <div className="btn-green" onClick={(e) => proceedPayment()}>
                            <a href="#" className="btn-loader" onClick={(e) => e.preventDefault()}>Pay Now</a>
                        </div>
                        <div className="btn-white">
                            <a href={`/invoice/detail/${invoiceDetail.InvoiceNo}`}>Previous</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = InvoiceOrderSummaryComponent;