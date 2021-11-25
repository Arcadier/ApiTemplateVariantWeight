'use strict';
var React = require('react');
var EnumCoreModule = require('../../../../../public/js/enum-core');
var BaseComponent = require('../../../../shared/base');
const PermissionToolTip = require('../../../../common/permission-tooltip');

class ItemListTableComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            itemVisibilityMap: new Map(),
        }
    }
    componentDidMount() {
        const { items } = this.props;
        const temp = new Map();
        if (items && items.length > 0) {
            items.map(i => temp.set(i.ID, i.IsAvailable))
        }
        this.setState({ itemVisibilityMap: temp });


    }

    renderStock(item) {
        let quantities = 0;
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

            if (hasUnlimitedStocks) value = infinite;
            if (quantities > 0) value = quantities;

        } else value = item.StockLimited ? item.StockQuantity : infinite;

        return value;
    }

    renderSKU(item) {
        const hasSKUValue = item.SKU && item.SKU.trim().length >= 1;
        return hasSKUValue ? `SKU: ${item.SKU.trim()}` : '';
    }

    renderVariants(item) {
        let combinations = 1;
        if (item.HasChildItems && item.ChildItems) {
            combinations = item.ChildItems.length;
        } 

        return (
            <td className="text-left" data-th="Variant">{combinations} combinations</td>
        )

    }

    updatePurchasable(item, event, id) {
        var self = this;
        var checkedStatus = event.target.checked;

        this.props.validatePermissionToPerformAction('edit-merchant-inventory-api', () => {
            if (self.props.controlFlags.AdminVetting === true && item.IsVisibleToCustomer === false && item.IsAvailable === false) {
                self.showMessage(EnumCoreModule.GetToastStr().Error.FAILED_ITEM_VISIBILITY_UPDATE);
            } else {
                self.props.editItemPurchasable(item.ID, checkedStatus, function (result) {
                    if (result == 'available') {
                        const updated = new Map(self.state.itemVisibilityMap);
                        updated.set(item.ID, checkedStatus);
                        self.setState({ itemVisibilityMap: updated });
                    }
                });
                self.props.createLogForItemVisibilityUpdate(item.ID, checkedStatus);
            }
        });
    }
    renderEmpty() {
        if (this.props.items != null && this.props.items.length === 0) {
            return (

                <tr>
                    <td colspan="6" data-th="Item">
                        <div className="empty-page-sec">
                            <img src="/assets/images/emptypage/bag-icon.svg" alt="empty page img" />
                            <div className="empty-page-title">No items/listing yet.</div>
                            <div className="empty-page-message">After adding an item or listing it will appear here</div>
                        </div>
                    </td>
                </tr>
            )
        }
    }
    render() {
        const self = this;

        return (
            <React.Fragment>
                <table className="table order-data1 item-area">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th className="text-left">Price</th>
                            <th className="text-left">Variant</th>
                            <th>Stock</th>
                            <th>Approved</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.items && this.props.items.length > 0 ? this.props.items.map(function (item, index) {
                                let itemLink = "edit/" + item.ID;
                                let itemDetailsLink = "/items/" + self.generateSlug(item.Name) + "/" + item.ID;
                                const itemAvailable = self.state.itemVisibilityMap.get(item.ID);

                                let IsAvailable = itemAvailable !== null && typeof itemAvailable !== 'undefined' ? itemAvailable : item.IsAvailable;

                                return (
                                    <tr className="item-row" key={item.ID} data-key="" data-id={item.ID}>
                                        <td data-th="ITEM">
                                            {/* <span className="sku-title text-left">{self.renderSKU(item)}</span>*/}  
                                            <a><p className="sort-item-description text-left">{item.Name.substring(0, 300)}</p></a>
                                        </td>
                                        <td data-th="PRICE">
                                            <div className="item-price text-left">
                                                {self.renderFormatMoney(item.CurrencyCode, item.Price === null ? item.ChildItems[0].Price : item.Price)}
                                            </div>
                                        </td>
                                            {self.renderVariants(item)}
                                        <td data-th="Stock">
                                            {self.renderStock(item)}
                                        </td>
                                        <td data-th="Approved">
                                            <PermissionToolTip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                                <div className="onoffswitch">
                                                    <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={index + '-purchaseable'} checked={IsAvailable} onChange={(e) => self.updatePurchasable(item, e, index + '-purchaseable')} />
                                                    <label className="onoffswitch-label" htmlFor={index + '-purchaseable'}> <span className="onoffswitch-inner"></span> <span className="onoffswitch-switch"></span> </label>
                                                </div>
                                            </PermissionToolTip>
                                        </td>
                                        <td data-th="">
                                            <div className="item-actions">
                                                <ul>
                                                    <li>
                                                        <PermissionToolTip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                                            <a href='#' onClick={(e) => self.props.validatePermissionToPerformAction('edit-merchant-inventory-api', () => location.href = itemLink)}><i className="icon icon-edit"></i></a>
                                                        </PermissionToolTip>
                                                    </li>
                                                    <li>
                                                        <PermissionToolTip isAuthorized={self.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                                                            <a href='#' className="delete_item" data-id="1"><i className="icon icon-delete" onClick={(e) => self.props.confirmDelete(item.ID)}></i></a>
                                                        </PermissionToolTip>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })  : this.renderEmpty()
                        }
                        
                    </tbody>
                </table>
            </React.Fragment>
        );
    }
}
module.exports = ItemListTableComponent;