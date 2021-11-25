'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class InvoiceCreditCardPaymentComponent extends BaseComponent {
    render() {
        const { invoiceDetail } = this.props;
        const { CurrencyCode } = invoiceDetail.Orders[0];

        return (
            <div className="tcc-content">
                <div className="tccc-top">
                    <span className="tccct-icon">
                        <span>
                            <span><i className="fa fa-check" /></span>
                        </span>
                    </span>
                    <span className="tccc-text">Transaction Complete</span>
                </div>
                <div className="tccc-bot">
                    <span className="title">
                        <span className="title-separator">Your Invoice ID is:</span>
                        <span className="inv-text">{invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo != null && invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo != "" ? invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo : invoiceDetail.InvoiceNo}</span>
                    </span>
                    <span className="title">
                        <span className="title-separator">Total Cost :</span>
                        <span className="inv-text cost">
                            <div className="item-price">{this.renderFormatMoney(CurrencyCode, invoiceDetail.Total)}</div>
                        </span>
                    </span>
                    <span className="inv-desc">You will receive an order confirmation email shortly. if you have any enquiry, please contact our staff.</span>
                    <div className="tccct-btn ">
                        <div className="btn-transparent-blue text-left">
                            <a href={`/invoice/detail/${invoiceDetail.InvoiceNo}`}>See Invoice details</a>
                        </div>
                        <div className="btn-return text-left">
                            <a href="/">Return home</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = InvoiceCreditCardPaymentComponent;