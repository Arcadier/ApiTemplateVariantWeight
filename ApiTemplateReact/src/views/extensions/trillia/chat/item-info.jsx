'use strict';
var React = require('react');

class ChatItemInformationComponent extends React.Component {

    componentDidMount() {
        const self = this;
        if (!self.props.offerTotal) {
            $('li.user-product-info-special-price span').hide();
        }
        //NO BULK
        if (self.props.hasBulk === true) {
            $('.originPrice').removeClass("hide");
        } else {
            $('.originPrice').addClass("hide");
        }
    }

    render() {
        const self = this;
        const itemDetail = self.props.itemDetail;
        let imageSource = self.props.itemDetail.Media ? self.props.itemDetail.Media[0].MediaUrl : "";
        return (
            <div>
                <div className="user-product-image">
                    <img src={imageSource} alt="user-product-info" title="Product Info" />
                </div>
                <ul className="user-product-container">
                    <li className="user-product-info-name">{itemDetail.Name}</li>
                    <li className="user-product-info-price">Price per item: <span>{self.props.renderFormatMoney(itemDetail.CurrencyCode, itemDetail.Price)}</span></li>
                    <li className="user-product-info-quantity">Order Quantity: <span>{self.props.orderQuantity}</span></li>
                    <li className="user-product-info-price">Original Price:<span>{self.props.renderFormatMoney(itemDetail.CurrencyCode, self.props.originalPrice)}</span></li>
                    <li className="user-product-info-special-price">Offer Price: <span>{self.props.renderFormatMoney(itemDetail.CurrencyCode, self.props.offerTotal)}</span></li>
                </ul>
            </div>
        );
    }
}

module.exports = ChatItemInformationComponent;