'use strict';
var React = require('react');
var BaseComponent = require('../../../shared/base');

class SearchItemViewComponent extends BaseComponent {
    renderRating(stars) {
        return (
            <div className="item-rating">
                <span className="stars"><span style={{ width: `${stars}%` }} /></span>
            </div>
        );
    }
    render() {
        
        var self = this;
        return (
            <div className="items-content behavior2" id="items-list">
                {Array.from(self.props.items).map(function (item, index) {
                	const { AverageRating } = item;
                	const stars = AverageRating ? AverageRating * 20 : 0;
                    return (
                        <div className="item-box" key={item.ID}>
                            <a href={"/items/" + self.generateSlug(item.Name) + "/" + item.ID + "?name="+ item.Name}>
                                <div className="item-image">
                                    <img src={item.Media[0].MediaUrl} />
                                </div>
                                <div className="item-info">
                                    <div className="item-price">
                                        {self.renderFormatMoney(item.CurrencyCode, item.Price)}
                                    </div>
                                    <div className="item-desc">
                                        <p className="item-name">{item.Name}</p>
                                        {self.props.ReviewAndRating === true ? self.renderRating(stars):''}
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