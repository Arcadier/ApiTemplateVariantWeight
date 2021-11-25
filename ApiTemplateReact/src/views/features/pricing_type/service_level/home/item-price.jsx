'use strict';
const BaseComponent = require('../../../../shared/base');

class ItemPriceComponent extends BaseComponent {
    render() {
        const { item } = this.props;

        return this.renderFormatMoney(item.CurrencyCode, item.Price, item.PriceUnit);
    }
}

module.exports = ItemPriceComponent;