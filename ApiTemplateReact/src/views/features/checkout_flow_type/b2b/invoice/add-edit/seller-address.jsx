'use strict';
var React = require('react');

class FeatureCreateInvoiceB2bSellerAddressComponent extends React.Component {
    renderSellerAddress() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { MerchantDetail, DeliveryFromAddress } = invoiceDetail.Orders[0];
            if (!DeliveryFromAddress || !MerchantDetail) return;
            return (
                <table className="canon-table">
                    <tr>
                        <th>Supplier :</th>
                    </tr>
                    <tr>
                        <td>
                            <span className="highlight-text">{MerchantDetail.DisplayName}</span><br />
                            <span className="highlight-text">{`${DeliveryFromAddress.Name}`}</span><br />
                            {DeliveryFromAddress.Line1 || ''}<br />
                            {DeliveryFromAddress.City}<br />
                            {
                                DeliveryFromAddress.State ?
                                    <React.Fragment>
                                        {DeliveryFromAddress.State}<br />
                                    </React.Fragment>
                                    : null
                            }
                            {DeliveryFromAddress.Country}<br />
                            {DeliveryFromAddress.PostCode}<br />
                        </td>
                    </tr>
                </table>
            );
        }
        return;
    }
    render() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail && invoiceDetail.Orders && invoiceDetail.Orders.length > 0) {
            const { MerchantDetail, DeliveryFromAddress } = invoiceDetail.Orders[0];
            if (!DeliveryFromAddress || !MerchantDetail) return;
            return (
                <React.Fragment>
                    <table className="canon-table">
                        <tbody>
                            <tr>
                                <th>Supplier :</th>
                            </tr>
                            <tr>
                                <td>
                                    <span className="highlight-text">{MerchantDetail.DisplayName}</span><br />
                                    <span className="highlight-text">{`${DeliveryFromAddress.Name}`}</span><br />
                                    {DeliveryFromAddress.Line1 || ''}<br />
                                    {DeliveryFromAddress.City}<br />
                                    {
                                        DeliveryFromAddress.State ?
                                            <React.Fragment>
                                                {DeliveryFromAddress.State}<br />
                                            </React.Fragment>
                                            : null
                                    }
                                    {DeliveryFromAddress.Country}<br />
                                    {DeliveryFromAddress.PostCode}<br />
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

module.exports = FeatureCreateInvoiceB2bSellerAddressComponent;