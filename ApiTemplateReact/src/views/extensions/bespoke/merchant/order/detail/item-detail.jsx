'use strict';
var React = require('react');

var BaseComponent = require('../../../../../../views/shared/base');

class ItemDetailComponent extends BaseComponent {
    onCheckboxChange(e, cartItemID) {
        this.props.revertPayment(e.target.checked, cartItemID);
    }

    showPaymentStatus(statuses) {
        var returnStatus = ''

        for (var i = statuses.length -1; i >= 0; i--) {
            let theStatus = statuses[i]

            if (theStatus.Type == 'Payment') {
                returnStatus = theStatus.Name;
                break;
            }
        }

        return returnStatus
    }

    render() {
        const self = this;
        const order = this.props.orders[0];
       

        return (
            <div className="order-box product-detail">
                <table className="table order-data">
                    <thead>
                    <tr>
                        <th>ITEM</th>
                        <th>PRICE</th>
                        <th>QTY</th>
                        <th>ADMIN FEE</th>
                        <th>PAYMENT STATUS</th>
                        <th>REFUND</th>
                        <th>REVIEW</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            self.props.orders.map(function (order) {
                                
                                if (order.CartItemDetails !== null && order.MerchantDetail.ID == self.props.user.ID) {
                                    let isRefunded = order.PaymentStatus === 'Refunded' ? "checked" : "";
                                    return (
                                        order.CartItemDetails.map(function(cartItem) {
                                            let item = cartItem.ItemDetail;
                                            let itemImageUrl = item.Media !== null && item.Media.length > 0 ? item.Media[0].MediaUrl : '';

                                            //ARC 7992
                                            let paymentGateWay = "";
                                            let payStatus = order.PaymentStatus;
                                            if (order.PaymentDetails && order.PaymentDetails[0].Gateway) {
                                                paymentGateWay = order.PaymentDetails[0].Gateway.Gateway;
                                            }

                                            if (paymentGateWay.toLowerCase().includes("cash on") && order.CartItemDetails && order.CartItemDetails[0].Statuses) {
                                                if (order.CartItemDetails[0].Statuses[order.CartItemDetails[0].Statuses.length - 1].Name === "Delivered" && isRefunded === "") {
                                                    payStatus = "Paid";
                                                }

                                            }
                                            return (
                                                <tr key={cartItem.ID}>
                                                    <td data-th="ITEM">
                                                        <div className="thumb">
                                                            <img src={itemImageUrl} alt="" title="" className="img-responsive"/>
                                                        </div>
                                                        <div className="product-detail-info">
                                                            <span className="sku">SKU: {item.SKU}</span> <span className="product-detail-des">{item.Name}</span>
                                                        </div>
                                                    </td>
                                                    <td data-th="PRICE">{self.renderFormatMoney(item.CurrencyCode, item.Price)}</td>
                                                    <td data-th="QTY"> {cartItem.Quantity} </td>
                                                    <td data-th="ADMIN FEE">{self.props.detail.CurrencyCode} {self.props.detail.Fee} </td>
                                                    <td data-th="PAYMENT STATUS"> {payStatus} </td>
                                                    <td data-th="REFUND">
                                                        <div className="cb-checkbox slrordrlst-refnd-act">
                                                            <span className="fancy-checkbox full-width">
                                                                <input type="checkbox" className="slrordrlst-refnd-chk" id="selectItem1" name="item-options[]" checked={isRefunded} onChange={(e) => self.onCheckboxChange(e, cartItem.ID)}/>
                                                                <label htmlFor="selectItem1"></label>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td data-th="REVIEW">
                                                        <a href="#"><i className="icon icon-review"></i></a>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    );
                                }

                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

module.exports = ItemDetailComponent;