'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class OrderItems extends BaseComponent {

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
                                `${offerDetail.Price * 100}%`
                                : <div className="item-price">{this.renderFormatMoney(currencyCode, offerDetail.Price)}</div>
                        }
                    </td>
                    <td data-th="Total Cost"><div className="item-price">{this.renderFormatMoney(currencyCode, offerDetail.TotalAmount)}</div></td>
                </tr>

            )
        }
        return;
    }

    renderCartItemInfo(cart) {
        const { AcceptedOffer } = cart;
        const hasQuotation = AcceptedOffer && AcceptedOffer.Accepted;
        const offerDetails = hasQuotation ? AcceptedOffer.OfferDetails : null;

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

    componentDidMount() {
    }

    renderItem(cart, hasQuotation) {
        const { ItemDetail } = cart;
         //ARC10053  the discountamount should not be round off to have the correct value.
        return (
            <tr className={hasQuotation ? 'brdt' : ''} key={cart.ID}>
                <td data-th="Item Description">
                    <div className="flex-wrap">
                        <div className="thumb-group mr-15">
                            <img src={ItemDetail.Media[0].MediaUrl} alt="Item" style={{ maxWidth: '64px' }} />
                        </div>
                        <div className="text-left">
                            <span>{ItemDetail.Name}</span>
                            <div className="item-field">
                                {
                                    ItemDetail.SKU ?
                                        <span class="if-txt">
                                            <span>SKU: </span>
                                            <span>{ItemDetail.SKU}</span>
                                        </span> : ''
                                }
                                {this.renderVariants(ItemDetail.Variants)}
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

    renderVariants(variants) {
        if (variants && variants.length > 0) {
            return (
                variants.filter(v => v.GroupID != this.props.locationVariantGroupId).map((variant, index) => {
                    return (
                        <span className="if-txt" key={index}>
                            <span>{variant.GroupName}:</span>
                            <span>{variant.Name}</span>
                        </span>
                    )
                })
            );
        }
        return null;
    }

    renderOrderItems() {
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders[0] && this.props.invoiceDetail.Orders[0].CartItemDetails) {
            const { CartItemDetails } = this.props.invoiceDetail.Orders[0];
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

module.exports = OrderItems;