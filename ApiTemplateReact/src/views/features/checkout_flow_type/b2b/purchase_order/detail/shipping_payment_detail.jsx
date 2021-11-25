var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class ShippingPaymentDetailComponent extends BaseComponent {
    getLatestOrderStatus(cartItem) {
        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1];
        }

        if (status) {
            if (this.props.orderStatuses && this.props.orderStatuses.Records) {
                const statusExist = this.props.orderStatuses.Records.find(s => s.ID == status.ID);

                if (statusExist) return status.StatusAlias;
            }
        }

        return '';
    }

    getLatestFulfilmentStatus(cartItem) {
        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1];
        }

        if (status) {
            if (this.props.fulfilmentStatuses && this.props.fulfilmentStatuses.Records) {
                const statusExist = this.props.fulfilmentStatuses.Records.find(s => s.ID == status.ID);

                if (statusExist) return status.StatusAlias;
            }
        }

        return '';
    }


    render() {
        const order = this.props.detail;
        let shippingMethod = '';
      //  let shippingMethodID = '';
        var cartItem = null;

        //Precaution cause 9532 was fix because of this but i had fix mine using the below error 9399
        if (order.CartItemDetails)
            cartItem = order.CartItemDetails[0];

        if (typeof cartItem == 'undefined' || cartItem == null) {
            cartItem = order.Orders[0].CartItemDetails[0];
        }


        if (cartItem.PickupAddress) {
            shippingMethod = cartItem.PickupAddress.Line1;
        } else if (cartItem.ShippingMethod) {
            shippingMethod = cartItem.ShippingMethod.Description;
          //  shippingMethodID = cartItem.ShippingMethod.ID;
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
                            <th>Order Status :</th>
                            <td data-th="Invoice No. :">{this.getLatestOrderStatus(cartItem)}</td>
                        </tr>
                        <tr>
                            <th>Fulfilment Status :</th>
                            <td data-th="Invoice No. :">{this.getLatestFulfilmentStatus(cartItem)}</td>
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

