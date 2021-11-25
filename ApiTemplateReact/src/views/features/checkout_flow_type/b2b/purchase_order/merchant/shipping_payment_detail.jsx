var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class ShippingPaymentDetailComponent extends BaseComponent {

    render() {
        const order = this.props.detail;
        let shippingMethod = '';
        let shippingMethodMinimumLeadTime = 'N/A';
        let shippingMethodID = null;
        const cartItem = order.CartItemDetails[0];

        if (cartItem.PickupAddress) {
            shippingMethod = cartItem.PickupAddress.Line1;
        } else if (cartItem.ShippingMethod) {
            shippingMethod = cartItem.ShippingMethod.Description;
            shippingMethodID = cartItem.ShippingMethod.ID;
        }

        let paymentTermName = "-";
        if (order.PaymentTerm) {
            paymentTermName = order.PaymentTerm.Name;
        }
        return (
            <div className="col-md-4">
                <table className="canon-table">
                    <tbody><tr>
                        <th>PO No. : </th>
                        <td data-th="Order Status :">{order.CosmeticNo != null && order.CosmeticNo != "" ? order.CosmeticNo : order.PurchaseOrderNo}</td>
                    </tr>
                        <tr>
                            <th>Order Status:</th>
                            <td data-th="Invoice No. :">
                                <div className="select-wrapper osg mxw">
                                    {this.props.renderStatusDropdown(order, 'order')}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Fulfilment Status:</th>
                            <td data-th="Invoice No. :">
                                <div className="select-wrapper osg mxw">
                                    {this.props.renderStatusDropdown(order, 'fulfilment')}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Payment Terms :</th>
                            <td data-th="Invoice No. :">{paymentTermName}</td>
                        </tr>
                        <tr>
                            <th>Shipping Method :</th>
                            <td data-th="Invoice No. :">{shippingMethod}</td>
                        </tr>
                    </tbody></table>
            </div>
        )
    }
}

module.exports = ShippingPaymentDetailComponent;

