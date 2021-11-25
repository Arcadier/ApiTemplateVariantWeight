'use strict';
const React = require('react');
const BaseComponent = require('../../../../../views/shared/base');

class OriginalPriceComponent extends BaseComponent {
    render() {
        const { bulkPricing, currencyCode, priceValues, } = this.props;

        if (bulkPricing && bulkPricing.length > 0) {
            return (
                <React.Fragment>
                    <span className="pull-left realPrice">Original Price:</span>
                    <span className="total-price pull-right">
                        <div className="realPrice">
                            <del>
                                {this.renderFormatMoney(currencyCode, priceValues.originalPrice)}
                            </del>
                        </div>
                    </span>
                    <div className="clearfix" />
                </React.Fragment>
            );
        }

        return null;
    }
}

module.exports = OriginalPriceComponent;