'use strict';
const BaseComponent = require('../../../../shared/base');

class ItemPriceComponent extends BaseComponent {
    render() {
        const { item } = this.props;
        const price = item.Price == null && (item.HasChildItems && item.ChildItems != null && item.ChildItems.length > 0) ? item.ChildItems[0].Price : item.Price;

        return this.renderFormatMoney(item.CurrencyCode, price);
    }
}

module.exports = ItemPriceComponent;