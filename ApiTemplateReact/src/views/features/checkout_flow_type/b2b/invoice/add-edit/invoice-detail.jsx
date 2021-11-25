'use strict';
var React = require('react');
var Moment = require('moment');
var toastr = require('toastr');

const PermissionTooltip = require('../../../../../common/permission-tooltip');

class FeatureCreateInvoiceB2bInvoiceDetailComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isButtonDisabled: false
        }
    }

    componentDidMount() {
        $(document).ready(function () {
            $('#payment-due-date').datetimepicker({
                format: 'DD/MM/YYYY'
            });

            $('#payment-due-time').timepicker({
                timeFormat: 'h:i A',
                forceRoundTime: true
            });

            $('#payment-due-time').on('timeFormatError', function () {
                $('#payment-due-time').timepicker('setTime', '');
            });

            $('[data-toggle="tooltip"]').tooltip();
        });
    }

    getAlreadyPaidAmount(orderDetail) {
        if (orderDetail.PaymentDetails && orderDetail.PaymentDetails.length > 0) {
            let paidAmount = 0;
            orderDetail.PaymentDetails.map(function (payment) {
                if (payment.Status === 'Success' || (payment.Status == 'Waiting for Payment' && payment.GatewayPayKey)) {
                    paidAmount += payment.Total;
                }
            });
            return paidAmount.toFixed(2);
        }
        return (0).toFixed(2);
    }

    getBalance(orderDetail) {
        return (orderDetail.GrandTotal - this.getAlreadyPaidAmount(orderDetail)).toFixed(2);
    }

    renderTotals() {
        const self = this;
        const { invoiceDetail } = this.props;

        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const orderDetail = invoiceDetail.Orders[0];
            return (
                <tbody>
                    <tr>
                        <td className="col25">{self.props.renderFormatMoney(orderDetail.CurrencyCode, orderDetail.GrandTotal)}</td>
                        <td className="col25">{self.props.renderFormatMoney(orderDetail.CurrencyCode, self.getAlreadyPaidAmount(orderDetail))}</td>
                        <td className="col25">{self.props.renderFormatMoney(orderDetail.CurrencyCode, self.getBalance(orderDetail))}</td>
                        <td className="col25">
                            <div className="editable-amt-group">
                                <span>{self.props.renderFormatMoney(orderDetail.CurrencyCode)}</span><span className="priceAmount"><input id="invoice-total" className="editable-amt numbersWithD required-invoice" type="number" defaultValue={self.getBalance(orderDetail)} /></span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            );
        }
    }

    createInvoice() {
        const self = this;

        this.props.validatePermissionToPerformAction('add-merchant-create-invoice-api', () => {
            var hasError = false;
            $('.required-invoice').each(function () {
                $(this).removeClass('error-con');
                if (!$.trim($(this).val())) {
                    $(this).addClass('error-con');
                    hasError = true;
                }
            });

            if (!hasError) {
                const { invoiceDetail } = self.props;
                const orderDetail = invoiceDetail.Orders[0];

                if (parseFloat($('#invoice-total').val()) > self.getBalance(orderDetail)) {
                    toastr.error('Amount to be collected should be equal or less than the balance amount.', 'Oops! Something went wrong.');
                    return;
                }
                if (self.state.isButtonDisabled) {
                    return;
                }
                self.setState({
                    isButtonDisabled: true
                });

                let paymetnDueDateTime = $('#payment-due-time').val().length > 0 ? $('#payment-due-time').val() : '12:00 AM'
                paymetnDueDateTime = Moment($('#payment-due-date').val() + ' ' + paymetnDueDateTime, 'DD/MM/YYYY HH:mm A', true).format('X');

                const options = {
                    currencyCode: orderDetail.CurrencyCode,
                    total: $('#invoice-total').val(),
                    orderId: orderDetail.ID,
                    payeeId: orderDetail.MerchantDetail.ID,
                    payerId: orderDetail.ConsumerDetail.ID,
                    paymentDueDateTime: paymetnDueDateTime,
                    gatewayTransactionId: $('#invoice-ref').val()
                };

                self.props.createInvoice(options, function (result) {
                    if (result) {
                        window.location.href = '/merchants/invoice/list';
                    }
                    else {
                        toastr.error('Error creating invoice.', 'Oops! Something went wrong.');
                    }
                });
            }
        });
    }

    render() {
        return (
            <React.Fragment>
                <section className="sassy-box no-border invoice-form">
                    <div className="horizontal-form">
                        <div className="l-side">
                            <div className="l-side-wrap">
                                <div className="form-group">
                                    <label htmlFor="">Payment Due</label>
                                    <div className="join-control">
                                        <span className="relative-ele">
                                            <input type="text" className="border-input due-date required-invoice" id="payment-due-date" placeholder="DD/MM/YYYY" />
                                        </span>
                                        <input type="text" className="border-input due-time" id="payment-due-time" placeholder="HH:MM" />
                                    </div>
                                </div>
                                <div className="form-group spacer-left-30">
                                    <label htmlFor="">Invoice Ref. No. (External)
                                        &nbsp;<a data-toggle="tooltip" title="This is not the same number as the system generated invoice no.<br/> This is the invoice reference number you can tag to this invoice, e.g. from an invoice generated by an external software. You're responsible for verifying that your issued invoices meet local tax requirements" data-placement="bottom" data-html="true" href=""><img src="/assets/images/Info.svg" alt="" /></a>
                                    </label>
                                    <div>
                                        <input type="text" id="invoice-ref" className="border-input invoice-ref" placeholder="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="r-side" disabled={this.state.isButtonDisabled}>
                            <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                <a href="#" className="sassy-btn sassy-btn-bg btn-create-invoice" onClick={() => this.createInvoice()}>Create Invoice</a>
                            </PermissionTooltip>
                        </div>
                    </div>
                </section>
                <section className="sassy-box no-border">
                    <div className="table-responsive">
                        <table className="table tbl-border">
                            <thead>
                                <tr>
                                    <th className="col25">Total Cost</th>
                                    <th className="col25">Already Paid</th>
                                    <th className="col25">Balance</th>
                                    <th className="col25">Amount to be collected</th>
                                </tr>
                            </thead>
                            {this.renderTotals()}
                        </table>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

module.exports = FeatureCreateInvoiceB2bInvoiceDetailComponent;