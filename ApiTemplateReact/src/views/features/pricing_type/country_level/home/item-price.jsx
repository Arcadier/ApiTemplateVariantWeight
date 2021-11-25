'use strict';
const BaseComponent = require('../../../../shared/base');

class ItemPriceComponent extends BaseComponent {
    render() {
        const { item, user, userPreferredLocationId } = this.props;
        let price = 0;

        if (user && userPreferredLocationId) {
            price = item.Price == null && (item.HasChildItems && item.ChildItems != null && item.ChildItems.length > 0) ? item.ChildItems[0].Price : item.Price;
        }

        return this.renderFormatMoney(item.CurrencyCode, price);
    }
}

module.exports = ItemPriceComponent;