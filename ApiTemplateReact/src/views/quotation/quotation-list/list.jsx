'use strict';

const React = require('react');
var BaseComponent = require('../../shared/base');
class QuotationComponent extends BaseComponent {
    redirectQuotationDetail(id) {
        const extraPath = this.props.isMerchantAccess == 'true' || this.props.isMerchant ? '/merchants' : '';
        window.location = `${extraPath}/quotation/detail?id=${id}`;
    }

    getStatus(quotation) {
        if (quotation.Accepted) {
            return 'Approved';
        } else if (quotation.Declined) {
            return 'Declined';
        } else if (quotation.MessageType == 'CANCELLED') {
            return 'Cancelled';
        }

        return 'Pending';
    }

    getItemName(quotation) {
        if (quotation.OfferDetails && quotation.OfferDetails.length > 0) {
            return quotation.OfferDetails[0].Name;
        }

        return null;
    }

    renderEmpty() {
        if (this.props.quotations && this.props.quotations.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/list-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">Nothing to see here.</div>
                    <div className="empty-page-message">Your quotes will appear here after they are created</div>
                </div>
            )
        }
    }

    render() {
        const self = this;
        const { isMerchant, quotations } = self.props;
        return (
            <div className="subaccount-data-table responsive-table">
                <table className="table order-data1 sub-account tbl-department clickable">
                    <thead>
                        <tr>
                            <th width="15%">Quotation No.</th>
                            <th width="15%">Item Name</th>
                            <th width="10%">Quantity</th>
                            <th width="25%">{isMerchant ? 'Buyer' : 'Supplier'}</th>
                            <th width="35%">Validity Date</th>
                            <th width="20%">Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotations && quotations.length > 0 ?
                            quotations.map(function (quotation, index) {
                                return (
                                    <tr key={quotation.ID} className="account-row " data-key="item" data-id={quotation.ID} onClick={(e) => self.redirectQuotationDetail(quotation.ID)}>
                                        <td data-th="Quotation No.">{quotation.CosmeticNo != null && quotation.CosmeticNo != "" ? quotation.CosmeticNo : quotation.QuoteNo}</td>
                                        <td data-th="Item Name">{self.getItemName(quotation)}</td>
                                        <td data-th="Quantity">{quotation.Quantity}</td>
                                        <td data-th="Buyer Name">{isMerchant ? quotation.ToUserName : quotation.FromUserName}</td>
                                        <td data-th="Validity Date">{self.formatDate(quotation.ValidStartDate)} - {self.formatDate(quotation.ValidEndDate)}</td>
                                        <td data-th="Status">{self.getStatus(quotation)}</td>
                                        <td data-th="Action"></td>
                                    </tr>
                                )
                            }) :
                            ""
                        }
                    </tbody>
                </table>
                {this.renderEmpty()}
            </div>
        );
    }
}

module.exports = QuotationComponent;