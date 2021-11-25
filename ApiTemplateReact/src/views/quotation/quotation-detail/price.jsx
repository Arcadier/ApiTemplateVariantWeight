'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');
const PermissionTooltip = require('../../common/permission-tooltip');

class PriceComponent extends BaseComponent {
    getChargeTotal() {
        const { details } = this.props;
        let total = 0;

        if (details) {
            details.slice(1).forEach((detail) => {
                if (!detail.IsDiscount) {
                    total += detail.TotalAmount;
                }
            });
        }

        return total;
    }

    getDiscountTotal() {
        const { details } = this.props;
        let total = 0;

        if (details) {
            details.slice(1).forEach((detail) => {
                if (detail.IsDiscount) {
                    total += detail.TotalAmount;
                }
            });
        }

        return total;
    }

    getSubTotal() {
        const { details } = this.props;
        var subTotal = details ? details[0].TotalAmount : 0;
        return subTotal
    }


    getTotalCost() {
        return this.getSubTotal() + this.getChargeTotal() - this.getDiscountTotal()
    }

    renderButtons() {
        const { status, isMerchant, generateInvoiceByCartItem, generateOrderByCartItem, buyerdocs, isAuthorizedToEdit } = this.props;
        const handleAcceptQuotation = process.env.CHECKOUT_FLOW_TYPE == 'b2b' ? generateOrderByCartItem : generateInvoiceByCartItem;

        if (status == 'Pending') {
            if ((buyerdocs == 'true') || !isMerchant) {
                const acceptBtnClass = `sassy-btn btn-loader sassy-btn-bg line ${!isAuthorizedToEdit ? 'disabled' : ''}`;
                const declineBtnClass = `sassy-btn sassy-btn-border openModalRemove ${!isAuthorizedToEdit ? 'disabled' : ''}`
                return (
                    <div className="full-width">
                        <div className="flex btn-area">
                            <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                <a href="#" className={declineBtnClass} onClick={() => this.props.openRemoveModal('DECLINE QUOTATION')}>
                                    Decline
                                </a>
                            </PermissionTooltip>
                            <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                <button id="itemAddCompare" className={acceptBtnClass} onClick={() => handleAcceptQuotation()}>Accept</button>
                            </PermissionTooltip>
                        </div>
                    </div>
                )
            }

            const cancelBtnClass = `sassy-btn sassy-btn-bg line openModalRemove ${!isAuthorizedToEdit ? 'disabled' : ''}`;
            return (
                <div className="full-width">
                    <div className="flex btn-area flex-float-reverse">
                        <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                            <button id="cancel-quotation" className={cancelBtnClass} data-toggle="" data-target="" onClick={() => this.props.openRemoveModal('CANCEL QUOTATION')}>Cancel Quotation</button>
                        </PermissionTooltip>
                    </div>
                </div>
            )
        }

        return null;
    }

    renderNote() {
        const { status, isMerchant } = this.props;

        if (status == 'Pending' && !isMerchant) {
            return (
                <p className="tech-note">"Note: This quotation is only valid within the time frame specified. Please ensure there is sufficient time for your requisition to pass internal approval process, if any."</p>
            )
        }

        return null;
    }

    render() {
        const self = this;
        const { currencyCode, buyerdocs } = this.props

        return (
            <div className="col-md-4">
                <div className="qutation_bill_box">
                    <div className="quote_title">
                        <h3>Quotation Price</h3>
                    </div>
                    <div className="quotation-total pull-right">
                        <span className="full-width subtotal">
                            <span className="title">Subtotal</span>
                            <span className="pull-right price">
                                {this.renderFormatMoney(currencyCode, self.getSubTotal())}
                            </span>
                        </span>
                        <span className="full-width freight-cost">
                            <span className="title">Charge(s)</span>
                            <span className="pull-right price">
                                {this.renderFormatMoney(currencyCode, self.getChargeTotal())}
                            </span>
                        </span>
                        <span className="full-width discount">
                            <span className="title">Discount(s)</span>
                            <span className="pull-right price">
                                - {this.renderFormatMoney(currencyCode, self.getDiscountTotal())}
                            </span>
                        </span>
                        <span className="full-width total-cost">
                            <span className="title">Total Cost</span>
                            <span className="pull-right price">
                                {this.renderFormatMoney(currencyCode, self.getTotalCost())}
                            </span>
                        </span>
                        {this.renderButtons()}
                    </div>
                </div>
                {this.renderNote()}
            </div>
        );
    }
}

module.exports = PriceComponent;