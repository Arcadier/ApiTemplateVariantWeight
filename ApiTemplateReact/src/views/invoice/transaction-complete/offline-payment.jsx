'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');
const Entities = require('html-entities').XmlEntities;

class InvoiceOfflinePaymentComponent extends BaseComponent {
    renderOrderSummary() {
        const { invoiceDetail } = this.props;
        const { CurrencyCode } = invoiceDetail.Orders[0];

        return (
            <React.Fragment>
                <div className="tccc-top">
                    <span className="tccct-icon">
                        <span>
                            <span><i className="fa fa-check" /></span>
                        </span>
                    </span>
                    <span className="tccc-text">Transaction Complete</span>
                </div>
                <div className="tccc-bot">
                    <span className="title">Your Invoice ID is: </span>
                    <span className="inv-text">{invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo != null && invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo != "" ? invoiceDetail.Orders[0].PaymentDetails[0].CosmeticNo : invoiceDetail.InvoiceNo}</span>
                    <span className="title">Total Cost : </span>
                    <span className="inv-text cost">
                        <div className="item-price">{this.renderFormatMoney(CurrencyCode, invoiceDetail.Total)}</div>
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
            </React.Fragment>
        );
    }

    renderPaymentInstruction() {
        const { paymentMethods } = this.props;
        const paymentMethod = paymentMethods[0];

        const decodeText = new Entities().decode(paymentMethod.Description);

        return (
            <div className="offline_transaction">
                <div className="off_title">
                    <h3>{paymentMethod.PaymentGateway.Gateway}</h3>
                </div>
                <div className="off_content_detail" dangerouslySetInnerHTML={{ __html: decodeText }} />
            </div> 
        );
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-4 col-sm-5 mob-bot-15">
                    {this.renderOrderSummary()}
                </div>
                <div className="col-md-8 col-sm-7">
                    {this.renderPaymentInstruction()}
                </div>
            </div>
        );
    }
}

module.exports = InvoiceOfflinePaymentComponent;