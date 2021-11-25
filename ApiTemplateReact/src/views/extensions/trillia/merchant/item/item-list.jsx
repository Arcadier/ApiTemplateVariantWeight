'use strict';
var React = require('react');
var EnumCoreModule = require('../../../../../public/js/enum-core');
var BaseComponent = require('../../../../shared/base');

class ItemListTableComponent extends BaseComponent {
    updatePurchasable(item, event) {
        if (item.IsVisibleToCustomer === false) {
            this.showMessage(EnumCoreModule.GetToastStr().Error.ITEM_VISIBILITY_DISABLED_BY_ADMIN);
        } else {
            this.props.editItemPurchasable(item.ID, event.target.checked);
            this.showMessage(EnumCoreModule.GetToastStr().Success.UPDATED_ITEM_PURCHASABILITY);
            this.props.createLogForItemVisibilityUpdate(item.ID, event.target.checked);
        }
    }

    renderPriceRange(item) {
        let self = this;
        if (item.HasChildItems) {
            let prices = [];
            let currencyCode = item.CurrencyCode;
            if (item.ChildItems) {
                item.ChildItems.forEach(function (child) {
                    if (child.Active) {
                        prices.push(child.Price);
                    }
                });
            }


            if (prices.length > 1) {
                let min = Math.min(...prices);
                let max = Math.max(...prices);

                return (
                    <React.Fragment>
                        {self.renderFormatMoney(item.CurrencyCode, min)} - {self.renderFormatMoney(item.CurrencyCode, max)}
                    </React.Fragment>
                )
            }

            return (
                <React.Fragment>
                    {self.renderFormatMoney(item.CurrencyCode, prices[0])}
                </React.Fragment>
            )
        }

        return '';
    }

    renderBulkPricing(item) {
        if (item.HasChildItems && item.ChildItems) {
            let optionsCount = 0;
            item.ChildItems.forEach(function (child) {
                if (child.CustomFields) {
                    child.CustomFields.forEach(function (cf) {
                        if (cf.Name.toLowerCase() === "bulkpricing" && cf.Values) {
                            let bulkOptions = JSON.parse(cf.Values);
                            optionsCount = optionsCount + bulkOptions.length;
                        }
                    });
                }
            });
            return optionsCount + ' Options';
        }

    }

    renderStock(item) {
        if (item.HasChildItems && item.ChildItems) {
            let quantities = 0;
            let hasUnlimitedStocks = item.ChildItems.filter(c => c.Active === true && c.StockLimited === false).length > 0;

            item.ChildItems.forEach(function (child) {
                if (child.Active === true && child.StockLimited === true) {
                    quantities += parseInt(child.StockQuantity);
                }
            });

            if (quantities > 0) {
                return quantities;
            } else if (hasUnlimitedStocks) {
                return (
                    <span className="infinite-stock">&#8734;</span>
                )
            }
        }

        return '0';
    }

    render() {
        const self = this;

        return (
            <React.Fragment>
                <table className="table order-data item-area">
                    <thead>
                        <tr>
                            <th>ITEM</th>
                            <th>PRICE</th>
                            <th>BULK PRICING</th>
                            <th>STOCK</th>
                            <th>APPROVED</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.items.map(function (item, index) {
                                let itemLink = "edit/" + item.ID;  
                                return (
                                    <tr className="item-row" key={item.ID} data-key="" data-id={item.ID}>
                                        <td data-th="ITEM">
                                            <p className="sort-item-description text-left">{item.Name.substring(0, 300)}</p>
                                        </td>
                                        <td data-th="PRICE">
                                            <div className="item-price">
                                                {self.renderPriceRange(item)}
                                            </div>
                                        </td>
                                        <td data-th="BULK PRICING">{self.renderBulkPricing(item)}</td>
                                        <td data-th="STOCK">{self.renderStock(item)}</td>
                                        <td data-th="APPROVED">
                                            <div className="onoffswitch">
                                                <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={index + '-purchaseable'} checked={item.IsAvailable === true ? true : false} onChange={(e) => self.updatePurchasable(item, e)} />
                                                <label className="onoffswitch-label" htmlFor={index + '-purchaseable'}> <span className="onoffswitch-inner"></span> <span className="onoffswitch-switch"></span> </label>
                                            </div>
                                        </td>
                                        <td data-th="">
                                            <div className="item-actions">
                                                <ul>
                                                    <li><a href={itemLink}><i className="icon icon-edit"></i></a></li>
                                                    <li><a href="JavaScript:void(0);" className="delete_item" data-id="1"><i className="icon icon-delete" onClick={(e) => self.props.confirmDelete(item.ID)}></i></a></li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>    
                                )
                            })
                        }
                    </tbody>
                </table>
            </React.Fragment>
        );
    }
}

module.exports = ItemListTableComponent;