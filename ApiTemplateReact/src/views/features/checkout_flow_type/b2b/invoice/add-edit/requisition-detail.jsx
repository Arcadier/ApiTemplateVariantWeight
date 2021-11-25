'use strict';
var React = require('react');

class FeatureCreateInvoiceB2bRequisitionComponent extends React.Component {
    render() {
        const { invoiceDetail } = this.props;
        if (invoiceDetail) {
            const { Orders } = invoiceDetail;
            let shippingMethod = '-';
            let paymentTerms = '-';
            let purchaseNo = '-';
            if (Orders && Orders.length > 0) {
                if (Orders[0].PurchaseOrderNo) {
                    purchaseNo = Orders[0].CosmeticNo != null && Orders[0].CosmeticNo != "" ? Orders[0].CosmeticNo : Orders[0].PurchaseOrderNo;
                }
                if (Orders[0].PaymentTerm) {
                    paymentTerms = Orders[0].PaymentTerm.Name;
                }
                if (Orders[0].CartItemDetails && Orders[0].CartItemDetails.length > 0) {
                    const cartItem = Orders[0].CartItemDetails[0];
                    shippingMethod = cartItem.CartItemType == 'pickup' ? cartItem.PickupAddress.Line1 : cartItem.ShippingMethod.Description;
                }

                return (
                    <React.Fragment>
                        <table className="canon-table">
                            <tbody>
                                <tr>
                                    <th>PO No. : </th>
                                    <td>{purchaseNo}</td>
                                </tr>
                                <tr>
                                    <th>Order Status :</th>
                                    <td>
                                        {Orders[0].OrderStatus}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Payment Terms :</th>
                                    <td>{paymentTerms}</td>
                                </tr>
                                <tr>
                                    <th>Shipping Method :</th>
                                    <td>{shippingMethod}</td>
                                </tr>
                            </tbody>
                        </table>
                    </React.Fragment>
                );
            }
        }
        return null;
    }
}

module.exports = FeatureCreateInvoiceB2bRequisitionComponent;