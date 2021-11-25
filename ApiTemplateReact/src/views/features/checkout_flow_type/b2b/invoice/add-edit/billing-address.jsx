'use strict';
var React = require('react');
class FeatureCreateInvoiceB2bBillingAddressComponent extends React.Component {
    render() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { BillingToAddress, ConsumerDetail } = invoiceDetail.Orders[0];
            if (!BillingToAddress || !ConsumerDetail) return;
            const buyerDisplayName = ConsumerDetail.DisplayName;
            const buyerContact = ConsumerDetail.PhoneNumber;
            const buyerEmail = ConsumerDetail.Email;
            return (
                <React.Fragment>
                    <table className="canon-table">
                        <tbody>
                            <tr>
                                <th>Billing Address :</th>
                            </tr>
                            <tr>
                                <td className="billing-address">
                                    <span className="highlight-text">{buyerDisplayName}</span><br />
                                    <span className="highlight-text">{BillingToAddress.Name}</span><br />
                                    {BillingToAddress.Line1 || ''},<br />
                                    {BillingToAddress.City}<br />
                                    {BillingToAddress.Country}<br />
                                    {BillingToAddress.PostCode}<br />
                                    <a href={`tel:${buyerContact}`}>+{buyerContact}</a><span className="text-spacer"></span><a href={`mailto:${buyerEmail}`}>{buyerEmail}</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </React.Fragment>
            );
        }
        return null;
    }
}

module.exports = FeatureCreateInvoiceB2bBillingAddressComponent;