'use strict';
var React = require('react');
var Currency = require('currency-symbol-map');
var Numeral = require('numeral');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatOfferComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            offerCss: 'right-message-bar offer hide'
        }
        this.quantityRef = React.createRef();
        this.totalRef = React.createRef();
    }

    showCreateOffer() {
        const self = this;
        self.setState({ offerCss: 'right-message-bar offer' });
    }

    reset() {
        const self = this;

        $("#sp-offer").find('.required').each(function () {
            $(this).val($(this)[0].name === 'qty' ? self.props.orderQuantity : '');
            $(this).removeClass('error-con');
        });

        self.setState({ offerCss: 'right-message-bar offer hide' });
        self.props.showMessages();

        $('#modalOffer').modal('hide');
    }

    sendOffer() {
        const self = this;
        let format = process.env.MONEY_FORMAT;

        const target = $("#sp-offer");
        let e = false;
        target.find('.required').each(function () {
            const val = jQuery(this).val();
            if (!$.trim(val)) {
                $(this).addClass('error-con');
                e = true;
            }
        });

        if (e) {
            return false;
        }
        const originalPrice = parseFloat(self.props.itemDetail.Price) * parseFloat(self.quantityRef.current.value);
        const offer = {
            ID: 0,
            FromUserID: self.props.senderId,
            ToUserID: self.props.recipientId,
            CartItemID: self.props.cartItemDetail.ID,
            Total: self.totalRef.current.value,
            CurrencyCode: self.props.itemDetail.CurrencyCode,
            CurrencySymbol: Currency(self.props.itemDetail.CurrencyCode),
            ChannelID: self.props.channelId,
            MessageType: 'PRE-APPROVED',
            Message: 'Sent an offer',
            Accepted: false,
            Declined: false,
            Active: true,
            Quantity: self.quantityRef.current.value,
            ItemId: self.props.itemDetail.ID,
            FormattedTotal: Numeral(self.totalRef.current.value).format(format),
            FormattedOriginalPrice: Numeral(originalPrice).format(format)
        }
        self.props.sendOffer(offer);
        return true;
    }

    validateOffer() {
        const self = this;
        let isValidQuantity = true;
        let isValidTotal = true;

        $(self.quantityRef.current).removeClass('error-con');
        $(self.totalRef.current).removeClass('error-con');

        const quantity = self.quantityRef.current.value;
        const total = self.totalRef.current.value;

        if (quantity.trim() === '' || parseInt(quantity) <= 0 || isNaN(quantity)) {
            $(self.quantityRef.current).val('');
            $(self.quantityRef.current).addClass('error-con');
            isValidQuantity = false;
        }

        if (total.trim() === '' || parseFloat(total) <= 0.00 || isNaN(total)) {
            $(self.totalRef.current).val('');
            $(self.totalRef.current).addClass('error-con');
            isValidTotal = false;
        }

        if (isValidQuantity && isValidTotal) {
            $('#modalOffer').modal('show');
        }
    }

    render() {
        const self = this;
        const currencyCode = self.props.itemDetail.CurrencyCode;
        return (
            <div>
                <div className={self.state.offerCss}>
                    <div className="special-offer">
                        <h4>Special Offer</h4>
                        <form id="sp-offer" name="sp-offer" method="post">
                            <div className="form-element">
                                <label>Quantity:</label>
                                <input type="text" name="qty" defaultValue={self.props.orderQuantity} className="r1 required numbersOnlyD" ref={this.quantityRef} />
                            </div>
                            <div className="form-element">
                                <label>Offer Price: </label>
                                <label><span id="currencyCode">{currencyCode}</span> <span id="currencySym">{Currency(currencyCode)}</span> <input type="text" name="price" className="r2 required number2DecimalOnly" ref={this.totalRef} /></label>
                            </div>
                            <hr />
                            <div className="form-element">
                                <span className="back-btn" id="back_from_offer" onClick={() => self.reset()}>Back</span>
                                <button className="offer-btn" type="button" onClick={() => self.validateOffer()}>Send Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div id="modalOffer" className="modal fade delete_item" role="dialog" data-backdrop="static" data-keyboard="false" aria-labelledby="mySmallModalLabel" style={{ display: "none" }}>
                    <div className="modal-dialog compare-delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <button type="button" className="close" data-dismiss="modal">×</button>
                                <p align="center">Do you want to proceed with this offer?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <a className="btn-green confirm-offer" href="#" onClick={() => self.sendOffer()}>Okay</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ChatOfferComponent;