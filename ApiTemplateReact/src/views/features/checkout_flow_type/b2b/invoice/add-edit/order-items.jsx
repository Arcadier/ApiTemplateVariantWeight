'use strict';
var React = require('react');

class FeatureCreateInvoiceB2bOrderItemsComponent extends React.Component {

    renderItem(cart, hasQuotation) {
        const { ItemDetail } = cart;

            //ARC10053  the discountamount should not be round off to have the correct value.
        return (
            <tr className={hasQuotation ? 'brdt' : ''} key={cart.ID}>
                <td>
                    <div className="flex-wrap">
                        <div className="thumb-group mr-15">
                            <img src={ItemDetail.Media[0].MediaUrl} alt="Item" style={{ maxWidth: '64px' }} />
                        </div>
                        {this.renderAdditionalDetails(ItemDetail)}
                    </div>
                </td>
                <td>{cart.Quantity}</td>
                <td>{this.props.renderFormatMoney(cart.CurrencyCode, ItemDetail.Price)}</td>
                <td>{this.props.renderFormatMoney(cart.CurrencyCode, (cart.ItemDetail.Price * cart.Quantity) - (cart.DiscountAmountNotRoundOff || 0))}</td>
            </tr>
        );
    }

    renderAdditionalDetails(ItemDetail) {
        return (
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
                                <span>{v.GroupName}:</span>
                                <span>{v.Name}</span>
                            </span>
                        )
                    }
                </div>
            </div>
        );
    }

    renderOfferDetails(offerDetails, currencyCode) {
        const self = this;

        if (offerDetails && offerDetails.length > 1) {
            const arr = offerDetails.slice(1);
            return arr.map(offerDetail =>
                <tr className="extra bb-none" key={offerDetail.ID}>
                    <td>
                        <div className="thumb-group">
                            <span><b>{offerDetail.Name} -</b> {offerDetail.Description}</span>
                        </div>
                    </td>
                    <td>{offerDetail.Type == 'Quantity' ? offerDetail.Quantity : offerDetail.Type}</td>
                    <td>
                        {
                            offerDetail.Type == 'Percentage' ?
                                `${offerDetail.Price * 100}%`
                                : <div className="item-price">{self.props.renderFormatMoney(currencyCode, offerDetail.Price)}</div>
                        }
                    </td>
                    <td><div className="item-price">{self.props.renderFormatMoney(currencyCode, offerDetail.TotalAmount)}</div></td>
                </tr>

            )
        }
        return null;
    }

    renderCartItemInfo(cart) {
        const { AcceptedOffer } = cart;
        //const hasQuotation = (AcceptedOffer && AcceptedOffer.Accepted) || (self.props.pendingOffer && !self.props.pendingOffer.Accepted && !self.props.pendingOffer.Declined);
        //const offerDetails = AcceptedOffer ? AcceptedOffer.OfferDetails : self.props.pendingOffer ? self.props.pendingOffer.OfferDetails : null;
        const hasQuotation = AcceptedOffer && AcceptedOffer.Accepted;
        const offerDetails = AcceptedOffer ? AcceptedOffer.OfferDetails : null;

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
                                <th style={{ width: '171px' }}>Unit Price</th>
                                <th style={{ width: '171px' }}>Total Cost</th>
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

module.exports = FeatureCreateInvoiceB2bOrderItemsComponent;