'use strict';
const React = require('react');
const BaseComponent = require('../../../../../../views/shared/base');
const PermissionTooltip =  require('../../../../../common/permission-tooltip');

class TableItemsComponent extends BaseComponent {
    getItemUrl(itemName, itemId) {
        return '/items/' + this.generateSlug(itemName) + '/' + itemId;
    }

    renderReview(cartItem, itemImageUrl, itemUrl) {
        const item = cartItem.ItemDetail;
        const btnClass = `btn-feedback ${this.props.isAuthorizedToAdd ? '' : 'icon-grey'}`;
        return (
            <td data-th="Review">
                <PermissionTooltip isAuthorized={this.props.isAuthorizedToAdd}>
                    <div className={btnClass} item-name={item.Name} cart-item-id={cartItem.ID} item-url={itemUrl} item-image-url={itemImageUrl} has-feedback={cartItem.Feedback && cartItem.Feedback.FeedbackID ? '1' : '0'}>
                        <span className="purchase-feedback">
                            <span className="feedback-img-sec">
                                {
                                    cartItem.Feedback && cartItem.Feedback.FeedbackID ?
                                        <div className="check-icon">
                                            <img src="/assets/images/done.svg" />
                                        </div>
                                        : <i className="icon feedback" />
                                }
                            </span>
                            <span className="feedback-message">
                                {
                                    cartItem.Feedback && cartItem.Feedback.FeedbackID ?
                                        'Left Feedback'
                                        : 'Leave a feedback'
                                }
                            </span>
                        </span>
                    </div>
                </PermissionTooltip>
            </td>
        );
    }

    renderQuotationData() {
        const self = this;
        let currency = "";
        let ele = '';
        if (this.props.detail) {
            let cartItems = this.props.detail.CartItemDetails;
            if (this.props.detail && cartItems) {
                ele = cartItems.map(function (cartItem) {
                    currency = cartItem.CurrencyCode;
                    if (cartItem.AcceptedOffer && cartItem.AcceptedOffer.OfferDetails) {
                        return cartItem.AcceptedOffer.OfferDetails.map(function (detail) {
                            if (detail.Name === cartItem.ItemDetail.Name) {
                                return "";
                            }
                            return (
                                <tr className="extra bb-none">
                                    <td data-th="Item Description">
                                        <div className="thumb-group">
                                            <span><b>{detail.Name} -</b> {detail.Description}</span>
                                        </div>
                                    </td>
                                    <td data-th="Review">
                                        &nbsp;
                                        </td>
                                    <td data-th="Quantity">
                                        {detail.Type == 'Quantity' ? detail.Quantity : detail.Type}
                                    </td>
                                    <td data-th="Unit Price">
                                        {
                                            detail.Type == 'Percentage' ?
                                                `${parseFloat(detail.Price * 100).toFixed(2)} %`
                                                : <span className="item-price">{self.renderFormatMoney(currency, detail.Price)}</span>
                                        }
                                    </td>
                                    <td data-th="Unit Cost">
                                        <span className="item-price">{self.renderFormatMoney(currency, detail.TotalAmount)}</span>
                                    </td>
                                </tr>
                            )
                        });
                    }
                });
            }
        }

        return ele;
    }

    renderItem(cartItem) {
        const item = cartItem.ItemDetail;
        const itemImageUrl = item.Media !== null && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
        const itemUrl = this.getItemUrl(item.Name, item.ID);
        const itemQty = (cartItem.Quantity * 1).toLocaleString();
        let self = this;
                    //ARC10053  the discountamount should not be round off to have the correct value.
        return (
            <tr key={cartItem.ID}>
                <td data-th="Item Description">
                    <div className="flex-wrap">
                        <div className="thumb-group mr-15">
                            <img src={itemImageUrl} alt="Item" />
                        </div>
                        <div className="text-left">
                            <span>{item.Name}</span>
                            <div className="item-field">
                                {
                                    item.SKU ?
                                        <span className="if-txt">
                                            <span>SKU:</span>
                                            <span>{item.SKU}</span>
                                        </span> : ""

                                }
                                {
                                    item.Variants && item.Variants.length > 0 &&
                                    item.Variants.filter(v => v.GroupID != this.props.locationVariantGroupId).map(v =>
                                        <span key={v.ID} className="if-txt">
                                            <span>{v.GroupName}:</span>
                                            <span>{v.Name}</span>
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </td>
                {self.props.enableReviewAndRating === true ? this.renderReview(cartItem, itemImageUrl, itemUrl) : <td data-th="Review">&nbsp;</td>}
                <td data-th="Quantity">
                    {itemQty}
                </td>
                <td data-th="Unit Price">
                    <span className="item-price">{self.renderFormatMoney(item.CurrencyCode, item.Price)}</span>
                </td>
                <td data-th="Total Cost">
                    <span className="item-price">{self.renderFormatMoney(item.CurrencyCode, (parseFloat(item.Price) * parseInt(itemQty) - parseFloat(cartItem.DiscountAmountNotRoundOff || 0)))}</span>
                </td>
            </tr>
        );
    }

    renderItemData() {
        const self = this;
        let ele = '';
        if (this.props.detail) {
            let cartItems = this.props.detail.CartItemDetails;
            if (this.props.detail && cartItems) {
                ele = cartItems.map(function (cartItem) {
                    return self.renderItem(cartItem);
                });
            }

            return ele;
        } else {
            return null;
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.renderItemData()}
                {this.renderQuotationData()}
            </React.Fragment>
        )
    }
}

module.exports = TableItemsComponent;