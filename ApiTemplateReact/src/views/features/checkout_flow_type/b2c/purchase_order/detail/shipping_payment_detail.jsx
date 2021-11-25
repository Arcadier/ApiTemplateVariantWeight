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

                if (statusExist) return statusExist.ComputedAlias;
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

                const statusExistName = this.props.fulfilmentStatuses.Records.find(s => s.Name == status.Name);
                if (statusExistName) return statusExistName.ComputedAlias;
            }
        }

        return '';
    }

    getLatestPaymentStatus(cartItem) {
        
        let status = null;
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Payment');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1];
        }

        if (status) {
            if (this.props.paymentStatuses && this.props.paymentStatuses.Records) {
                const statusExist = this.props.paymentStatuses.Records.find(s => s.ID == status.ID);
                if (statusExist) return status.StatusAlias;

                const statusExistName = this.props.paymentStatuses.Records.find(s => s.Name == status.Name);
                if (statusExistName) return statusExistName.ComputedAlias;
            }
        }

        return '';
    }

    componentDidMount() {
        var self = this;
    }

    render() {
        const detail = this.props.detail;
        const order = detail.Orders[0];

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
         
        if (cartItem.ShippingMethod && cartItem.ShippingMethod.CustomFields) {
            var customFieldValue = JSON.parse(cartItem.ShippingMethod.CustomFields[0].Values[0]);
            shippingMethodMinimumLeadTime = customFieldValue.MinimumLeadTime;
        }

        let orderNo = "-";
        if (order.PurchaseOrderNo) {
            orderNo = order.CosmeticNo != null && order.CosmeticNo != "" ? order.CosmeticNo : order.PurchaseOrderNo;
        }
          
       

        let paymentStatusTableBase = order.PaymentStatus || '';
        //if (order.PaymentDetails != null && order.PaymentDetails.length > 0) {
        //    paymentStatusTableBase = order.PaymentDetails[0].Status == "Success" ? 'Paid' : order.PaymentDetails[0].Status
        //}

        return (
            <div className="col-md-4">
                <table className="canon-table">
                    <tbody><tr>
                        <th>Order No. : </th>
                        <td data-th="Invoice No. :">{orderNo}</td>
                    </tr>
                        <tr>
                            <th>Invoice No. :</th>
                            <td data-th="Invoice No. :">{order.PaymentDetails[0].CosmeticNo != null && order.PaymentDetails[0].CosmeticNo != "" ? order.PaymentDetails[0].CosmeticNo : detail.InvoiceNo}</td>
                        </tr>
                        <tr>
                            <th>Payment Type :</th>
                            <td data-th="Invoice No. :">{order.PaymentDetails[0].Gateway ? order.PaymentDetails[0].Gateway.Gateway : "N / A"}</td>
                        </tr>
                        <tr>
                            <th>Payment Status :</th>
                            <td data-th="Invoice No. :">{this.getLatestPaymentStatus(cartItem)}</td>
                        </tr>
                        <tr>
                            <th>Shipping Method:</th>
                            <td data-th="Invoice No. :">{shippingMethod}</td>
                        </tr>
                        <tr>
                            <th>Minimum Lead Time: </th>
                            <td data-th="Invoice No. :">{shippingMethodMinimumLeadTime}</td>
                        </tr>
                        <tr>
                            <th>Order Status:</th>
                            <td data-th="Invoice No. :">{this.getLatestOrderStatus(cartItem)}</td>
                        </tr>
                        <tr>
                            <th>Fulfilment Status:</th>
                            <td data-th="Invoice No. :">{this.getLatestFulfilmentStatus(cartItem)}</td>
                        </tr>
                    </tbody></table>
            </div>
        );
    }
}

module.exports = ShippingPaymentDetailComponent;

