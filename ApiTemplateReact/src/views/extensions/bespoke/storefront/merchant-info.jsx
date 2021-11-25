'use strict';
var React = require('react');
var BaseComponent = require('../../../shared/base');

class MerchantInfo extends BaseComponent {

    setMediaUrl(merchantUser) {

        if (merchantUser.Media[0])
            return merchantUser.Media[0].MediaUrl

        return ''
    }


    getAllMerchantAverage() {

        var self = this;

        if (typeof self.props.allMerchantFeedback == 'undefined' ||
            typeof self.props.allMerchantFeedback.Records == 'undefined' ||
            self.props.allMerchantFeedback != [] && !self.props.allMerchantFeedback ||
            self.props.allMerchantFeedback.TotalRecords < 1 ||
            self.props.allMerchantFeedback.Records < 1) {
            return 0
        }

        var total = self.props.allMerchantFeedback.Records.map(feedback => feedback.AverageRating).reduce((accumulator, feedback) => feedback + accumulator);
        var average = (total / (self.props.allMerchantFeedback.TotalRecords * 5)) * 100;

        return average.toFixed(2);
    }
    renderRating() {
        var self = this;
        return (
            <div className="item-rating">
                <span className="stars"><span style={{ width: `${self.getAllMerchantAverage()}%` }} /></span>
                <span className="feedback-text">({`${self.getAllMerchantAverage()}%`} positive feedback)</span>
            </div>
        );
    }
    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="store-detail-box">
                    <div className="thumb-outer">
                        <img src={self.setMediaUrl(self.props.merchantUser)} alt="" title="" />
                    </div>
                    <div className="store-description">
                        <h3 className="merchant-name">{self.props.merchantUser.DisplayName}</h3>
                        <span className="user-location">{self.props.sellerCountry}</span>
                        {self.props.ReviewAndRating === true ? self.renderRating() : ''}
                        <p className="merchant-description">
                            {self.props.merchantUser.Description}
                        </p>
                        <ul className="count-detial">
                            <li>Member since <span className="year-of-join">{self.formatYear(self.props.merchantUser.DateJoined)}</span></li>
                        </ul>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = MerchantInfo;