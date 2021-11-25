'use strict';
var React = require('react');

var BaseComponent = require('../../../shared/base');
class SearchItemViewComponent extends BaseComponent {

    renderRating() {
        return (
            <div className="item-rating">
            <span className="stars"><span /></span>
            </div>
        );
    }
    render() {
        var self = this;
        return (
            <div className="items-content behavior2" id="items-list">
                {Array.from(self.props.items).map(function (item, index) {
                    return (
                        <div className="item-box" key={item.ID}>
                            <a href={"/items/" + self.generateSlug(item.Name) + "/" + item.ID}>
                                <div className="item-image">
                                    <img src={item.Media[0].MediaUrl} />
                                </div>
                                <div className="item-info">
                                    <div className="item-price">
                                        {self.renderFormatMoney(item.CurrencyCode, item.ChildItems[0].Price)}
                                    </div>
                                    <div className="item-desc">
                                        <p className="item-name">{item.Name}</p>
                                        {self.props.ReviewAndRating === true ? self.renderRating() : ''}
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