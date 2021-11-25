'use strict';

var React = require('react');
var BaseComponent = require('../../shared/base');

class SearchChatComponent extends BaseComponent {
    componentDidMount() {
        if (typeof window !== 'undefined') {
            var $ = window.$;
        }
    }

    getCurrency(message) {
        if (message == null) return '';
        if (message.CartItemDetail !== null && message.CartItemDetail.CurrencyCode != null) return message.CartItemDetail.CurrencyCode;
        if (message.ItemDetail !== null && message.ItemDetail.CurrencyCode) return message.ItemDetail.CurrencyCode;
        return '';
    }

    getSubtotalAmount(message) {
        if (message == null) return '';
        if (message.CartItemDetail !== null && message.CartItemDetail.SubTotal != null) return message.CartItemDetail.SubTotal;
        return '';
    }

    getItemPrice(message) {
        if (message == null) return '';
        if (message.CartItemDetail !== null && message.CartItemDetail.ItemDetail != null) return message.CartItemDetail.ItemDetail.Price;
        if (message.CartItemDetail !== null && message.ItemDetail != null) return message.ItemDetail.Price;
    }

    renderDetails(message) {
        const self = this;
        return (
            <React.Fragment>
                <div className="col-md-3" key={message.ID} >
                    <span className="inbox-not-read"></span>
                    <div className="user-avatar">
                        <img src={'images/user-avatar.png" alt="user-avatar"'} title="user-avatar" />
                    </div>
                    <div className="user-info">
                        <h3 className="user_name">{message.CartItemDetail !== null ? message.CartItemDetail.User.DisplayName : message.ItemDetail.MerchantDetail.DisplayName}</h3>
                        <span className="time_status">{self.formatDateTime(message.CreatedDateTime)}</span>
                    </div>
                </div>
                <div className="col-md-7">
                    <p className="inbox-item-name">{message.CartItemDetail !== null ? message.CartItemDetail.ItemDetail.Name : message.ItemDetail.Name}</p>
                    <div className="offer_status">
                        <span>Sent an offer:</span>
                        <p className="price">{self.renderFormatMoney(self.getCurrency(message), self.getSubtotalAmount(message))}</p>
                        <span>Order Quantity: {message.CartItemDetail !== null ? message.CartItemDetail.Quantity : message.ItemDetail.StockQuantity}</span>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="text-center">{self.renderFormatMoney(self.getCurrency(message), self.getItemPrice(message))}</div>
                    <div className="text-center"><span className="pre-approved">PRE-APPROVED</span></div>
                </div>
            </React.Fragment>
        )
    }
    render() {
        const self = this;
        return (
            <React.Fragment>
                <div className="inbox-panel-outer">
                    {
                        messages.Records.map(function (message) {
                            return (
                                <div className="panel-box recent" key={message.ChannelID}>
                                    {self.renderDetails(message)}
                                </div>
                            )
                        })
                    }
                </div>
            </React.Fragment>
        );
    }
}

module.exports = SearchChatComponent;

