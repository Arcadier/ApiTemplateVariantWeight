'use strict';
var React = require('react');

var BaseComponent = require('../../../../../../views/shared/base');

class ItemDetailComponent extends BaseComponent {
    onCheckboxChange(e, cartItemID) {
        this.props.revertPayment(e.target.checked, cartItemID);
    }

    render() {
        const self = this;
        const order = this.props.orders[0];
        const isRefunded = order.PaymentStatus === 'Refunded' ? true : false;

        return (
            <div className="order-box product-detail">
                <table className="table">
                    <thead>
                    <tr>
                        <th>ITEM</th>
                        <th>PRICE</th>
                        <th>QTY</th>
                        <th>PAYMENT STATUS</th>
                        <th>REFUND</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                            order.CartItemDetails.map(function (cartItem) {
                                let item = cartItem.ItemDetail;
                                let itemImageUrl = item.Media !== null && item.Media.length > 0 ? item.Media[0].MediaUrl : '';

                                return (
                                    <tr key={cartItem.ID}>
                                        <td data-th="ITEM">
                                            <div className="thumb">
                                                <img src={itemImageUrl} alt="" title="" className="img-responsive" />
                                            </div>
                                            <div className="product-detail-info">
                                                <span className="sku">SKU: {item.SKU}</span> <span className="product-detail-des">{item.Name}</span>
                                            </div>
                                        </td>
                                        <td data-th="PRICE">{self.renderFormatMoney(item.CurrencyCode, item.Price)}</td>
                                        <td data-th="QTY"> {cartItem.Quantity} </td>
                                        <td data-th="PAYMENT STATUS"> N/A </td>
                                        <td data-th="REFUND">
                                            <div className="cb-checkbox">
                                                <span className="fancy-checkbox full-width">
                                                    <input type="checkbox" id="selectItem1" name="item-options[]" checked={isRefunded} onChange={(e) => self.onCheckboxChange(e, cartItem.ID)} />
                                                    <label htmlFor="selectItem1"></label>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

module.exports = ItemDetailComponent;