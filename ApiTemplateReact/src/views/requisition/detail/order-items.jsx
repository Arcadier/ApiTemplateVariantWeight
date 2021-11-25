'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class Items extends BaseComponent {
    renderOfferDetails(offerDetails, currencyCode) {
        if (offerDetails && offerDetails.length > 1) {
            const arr = offerDetails.slice(1);
            return arr.map(offerDetail =>
                <tr className="extra bb-none" key={offerDetail.ID}>
                    <td data-th="Item Description">
                        <div className="thumb-group">
                            <p><b>{`${offerDetail.Name} -`}</b> {offerDetail.Description}</p>
                        </div>
                    </td>
                    <td data-th="Quantity">{offerDetail.Type == 'Quantity' ? offerDetail.Quantity : offerDetail.Type}</td>
                    <td data-th="Unit Price">
                        {
                            offerDetail.Type == 'Percentage' ?
                                `${parseFloat(offerDetail.Price * 100).toFixed(2)} %`
                                : <span className="item-price">{this.renderFormatMoney(currencyCode, offerDetail.Price)}</span>
                        }
                    </td>
                    <td data-th="Total Cost"><div className="item-price">{this.renderFormatMoney(currencyCode, offerDetail.TotalAmount)}</div></td>
                </tr>

            )
        }
        return;
    }

    renderItem(cart, hasQuotation) {
        const { ItemDetail } = cart;
                   //ARC10053  the discountamount should not be round off to have the correct value.
        return (
            <tr className={hasQuotation ? 'brdt' : ''} key={cart.ID}>
                <td data-th="Item Description">
                    <div className="flex-wrap">
                        <div className="thumb-group mr-15">
                            <img src={ItemDetail.Media ? ItemDetail.Media[0].MediaUrl : ''} alt="Item" style={{ maxWidth: '64px' }} />
                        </div>
                        <div className="text-left">
                            <span>{ItemDetail.Name}</span>
                            <div className="item-field">
                                {
                                    ItemDetail.SKU ?
                                        <span className="if-txt">
                                            <span>SKU:</span>
                                            <span>{ItemDetail.SKU}</span>
                                        </span> : ""

                                }
                                {
                                    ItemDetail.Variants && ItemDetail.Variants.length > 0 &&
                                    ItemDetail.Variants.filter(v => v.GroupID != this.props.locationVariantGroupId).map(v =>
                                        <span key={v.ID} className="if-txt">
                                            <span>{v.GroupName + ":"}</span>
                                            <span>{v.Name}</span>
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </td>
                <td data-th="Quantity">{cart.Quantity}</td>
                <td data-th="Unit Price"><div className="item-price">{this.renderFormatMoney(cart.CurrencyCode, ItemDetail.Price)}</div></td>
                <td data-th="Total Cost"><div className="item-price">{this.renderFormatMoney(cart.CurrencyCode, (cart.ItemDetail.Price * cart.Quantity) - (cart.DiscountAmountNotRoundOff || 0))}</div></td>


            </tr>
        );
    }

    renderCartItemInfo(cart) {
        const { AcceptedOffer } = cart;
        const hasQuotation = (AcceptedOffer && AcceptedOffer.Accepted) || (this.props.pendingOffer && !this.props.pendingOffer.Accepted && !this.props.pendingOffer.Declined);
        const offerDetails = AcceptedOffer ? AcceptedOffer.OfferDetails : this.props.pendingOffer ? this.props.pendingOffer.OfferDetails : null;

        if (hasQuotation) {
            return (
                <React.Fragment>
                    {this.renderItem(cart, hasQuotation)}
                    {this.renderOfferDetails(offerDetails, cart.CurrencyCode)}
                </React.Fragment>
            )
        }

        return this.renderItem(cart, hasQuotation);
    }

    renderOrderItems() {
        if (this.props.requisitionDetail && this.props.requisitionDetail.Orders && this.props.requisitionDetail.Orders[0].CartItemDetails) {
            const { CartItemDetails } = this.props.requisitionDetail.Orders[0];
            if (CartItemDetails.length == 0) return;
            return CartItemDetails.map(cart => this.renderCartItemInfo(cart));
        }
        return;
    }

    render() {
        return (
            <React.Fragment>
                <section className="sassy-box no-border box-order-items">
                    <table className="table order-data table-items">
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Quantity</th>
                                <th style={{ width: "171px" }}>Unit Price</th>
                                <th style={{ width: "171px" }}>Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderOrderItems()}
                        </tbody>
                    </table>
                </section>
            </React.Fragment>
        );
    }
}

module.exports = Items;