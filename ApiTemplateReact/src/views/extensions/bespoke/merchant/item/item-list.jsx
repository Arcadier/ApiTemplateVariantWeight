'use strict';
var React = require('react');
var EnumCoreModule = require('../../../../../public/js/enum-core');
var BaseComponent = require('../../../../shared/base');

class ItemListTableComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            itemVisibilityMap: new Map(),
        }
    }
    componentDidMount() {
        const { items } = this.props;
        const temp =  new Map();
        if (items && items.length > 0) {   
            items.map(i => temp.set(i.ID, i.IsAvailable))
        }
        this.setState({ itemVisibilityMap: temp });

    
    }

    renderStock(item) {
    	let quantities = 0;
    	let combinations = 1;
    	let hasUnlimitedStocks = false;
    	let value = 0;
        const infinite = <span className="infinite-stock">&#8734;</span>;

    	if (item.HasChildItems && item.ChildItems) {
            hasUnlimitedStocks = item.ChildItems.filter(c => c.Active === true && c.StockLimited === false).length > 0;

            item.ChildItems.forEach(function (child) {
                if (child.Active === true && child.StockLimited === true) {
                    quantities += parseInt(child.StockQuantity);
                }
            });

            combinations = item.ChildItems.length;

            if (hasUnlimitedStocks) value = infinite;
            if (quantities > 0) value = quantities;
        } else value = item.StockLimited ? item.StockQuantity : infinite;

        return (
            <React.Fragment>
    			{value}
	        	<hr />
	        	<span className="across-sec">Across <b>{combinations}</b><br/> Combinations</span>
	    	</React.Fragment>
        )
    }

    renderSKU(item) {
    	const hasSKUValue = item.SKU && item.SKU.trim().length >= 1;
    	return hasSKUValue? `SKU: ${item.SKU.trim()}` : '';
    }

    updatePurchasable(item, event) {

        if (item.IsVisibleToCustomer === false) {
            this.showMessage(EnumCoreModule.GetToastStr().Error.FAILED_ITEM_VISIBILITY_UPDATE);
        } else {
            const updated = new Map(this.state.itemVisibilityMap);
            updated.set(item.ID, event.target.checked);
            this.setState({ itemVisibilityMap: updated });
            this.props.editItemPurchasable(item.ID, event.target.checked);
            this.showMessage(EnumCoreModule.GetToastStr().Success.UPDATED_ITEM_PURCHASABILITY);
            this.props.createLogForItemVisibilityUpdate(item.ID, event.target.checked);
        }
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
                            <th>STOCK</th>
                            <th>PURCHASABLE</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.items.map(function (item, index) {
                                let itemLink = "edit/" + item.ID;
                                let itemDetailsLink = "/items/" + self.generateSlug(item.Name) + "/" + item.ID;
                                const itemAvailable = self.state.itemVisibilityMap.get(item.ID);

                                let IsAvailable = itemAvailable !== null && typeof itemAvailable !== 'undefined' ? itemAvailable : item.IsAvailable;

                                return (
                                    <tr className="item-row" key={item.ID} data-key="" data-id={item.ID}>
                                        <td data-th="ITEM">
                                        	<span className="sku-title text-left">{self.renderSKU(item)}</span>
                                            <a href={itemDetailsLink}><p className="sort-item-description text-left">{item.Name.substring(0, 300)}</p></a>
                                        </td>
                                        <td data-th="PRICE">
                                            <div className="item-price">
                                                {self.renderFormatMoney(item.CurrencyCode, item.Price === null ? item.ChildItems[0].Price : item.Price)}
                                            </div>
                                        </td>
                                        <td data-th="STOCK">{self.renderStock(item)}</td>
                                        <td data-th="APPROVED">
                                            <div className="onoffswitch">
                                                <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={index + '-purchaseable'} checked={IsAvailable} onChange={(e) => self.updatePurchasable(item, e)} />
                                                <label className="onoffswitch-label" htmlFor={index + '-purchaseable'}> <span className="onoffswitch-inner"></span> <span className="onoffswitch-switch"></span> </label>
                                            </div>
                                        </td>
                                        <td data-th="">
                                            <div className="item-actions">
                                                <ul>
                                                    <li><a href={itemLink}><i className="icon icon-edit"></i></a></li>
                                                    <li><a href={null} className="delete_item" data-id="1"><i className="icon icon-delete" onClick={(e) => self.props.confirmDelete(item.ID)}></i></a></li>
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