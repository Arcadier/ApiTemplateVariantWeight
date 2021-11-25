'use strict';
var React = require('react');

class FeatureCreateInvoiceB2bShippingAddressComponent extends React.Component {
    render() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { DeliveryToAddress } = invoiceDetail.Orders[0];
            if (!DeliveryToAddress) return;
            return (
                <React.Fragment>
                    <table className="canon-table">
                        <tbody>
                            <tr>
                                <th>Shipping Address :</th>
                            </tr>
                            <tr>
                                <td>
                                    <span className="highlight-text">{DeliveryToAddress.Name}</span><br />
                                    {DeliveryToAddress.Line1 || ''},<br />
                                    {DeliveryToAddress.City}<br />
                                    {DeliveryToAddress.Country}<br />
                                    {DeliveryToAddress.PostCode}
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

module.exports = FeatureCreateInvoiceB2bShippingAddressComponent;