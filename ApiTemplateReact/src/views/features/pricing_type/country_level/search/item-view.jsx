'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class SearchItemViewComponent extends BaseComponent {
    renderRating(item) {
        return (
            <div className="item-rating">
                <span className="stars"><span style={{ width: `${item.AverageRating != null ? item.AverageRating * 20 : 0}px` }} /></span>
            </div>
        );
    }

    render() {
        var self = this;

        return (
            <div className="items-content behavior2" id="items-list">
                {Array.from(self.props.items).map(function (item, index) {
                    let price = item.ChildItems && item.ChildItems[0] ? item.ChildItems[0].Price : 0;
                    //ARC8602
                    if (!self.props.user || !self.props.userPreferredLocationId) {
                        price = 0;
                    }
                    return (
                        <div className="item-box" key={item.ID}>
                            <a href={"/items/" + self.generateSlug(item.Name) + "/" + item.ID}>
                                <div className="item-image">
                                    <img src={item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : ''} />
                                </div>
                                <div className="item-info">
                                    <div className="item-price">
                                        {self.renderFormatMoney(item.CurrencyCode, price)}
                                    </div>
                                    <div className="item-desc">
                                        <p className="item-name">{item.Name}</p>
                                        {self.props.reviewAndRating === true ? self.renderRating(item) : ''}
                                        <p className="item-seller">{item.MerchantDetail.DisplayName} </p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    }
}

module.exports = SearchItemViewComponent;