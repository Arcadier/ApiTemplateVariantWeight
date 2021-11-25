'use strict';
var React = require('react');
var BaseComponent = require('../../../shared/base');

class MerchantInfo extends BaseComponent{

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="store-detail-box">
                    <div className="thumb-outer">
                        <img src={self.props.merchantUser.Media[0].MediaUrl} alt="" title="" />
                    </div>
                    <div className="store-description">
                        <h3 className="merchant-name">{self.props.merchantUser.DisplayName}</h3>
                        <span className="user-location">{self.props.sellerCountry}</span>
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