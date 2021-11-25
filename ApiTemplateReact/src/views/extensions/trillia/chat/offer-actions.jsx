'use strict';
var React = require('react');

class ChatOfferActionComponent extends React.Component {
    renderCreateOfferAction() {
        return (
            <div className="user-product-buttons">
                <div className="btn-container">
                    <button className="green-btn" id="create-offer-btn" onClick={() => this.props.createOffer()}>Create Offer</button>
                </div>
            </div>
        );
    }

    renderDeclineAcceptAction() {
        return (
            <div className="user-product-buttons">
                <p>Add offer to comparison?</p>
                <div className="btn-container">
                    <button className="decline-btn openModalRemove" onClick={() => this.props.displayDeclineModal(true)}>Decline</button>
                    <button className="accept-btn" id="itemAddCompare" onClick={() => this.props.addOfferToComparison()}>Add to comparison</button>
                </div>
            </div>
        );
    }

    renderMerchantSentOfferMessage() {
        return (
            <div className="user-product-buttons">
                <span className="sent_offer_note">You have sent this offer</span>
            </div>
        );
    }

    renderOfferAcceptedMessage() {
        return (
            <div className="user-product-buttons">
                <p className="offer-accept-txt">Offer has been accepted</p>
                <div className="btn-container">
                    <div>
                        <a href={'/merchants/order/detail/' + this.props.invoiceNo} className="btn-black">View Details</a>
                    </div>
                </div>
            </div>
        );
    }

    renderAction() {
        var self = this;
        const offer = self.props.offer;
        if (offer && self.props.showMerchantActions) {
            if (offer.Accepted) {
                return self.renderOfferAcceptedMessage();
            }
            else if (!offer.Declined && !offer.Accepted) {
                return self.renderMerchantSentOfferMessage();
            }
        }
        else if (offer) {
            if (!offer.Declined && !offer.Accepted) {
                return self.renderDeclineAcceptAction();
            }
        }

        if (self.props.showMerchantActions) {
            return self.renderCreateOfferAction();
        }

        return null;
    }

    render() {
        var self = this;
        return (
            <div>
                {self.renderAction()}
            </div>
        );
    }
}

module.exports = ChatOfferActionComponent;
