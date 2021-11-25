'use strict';
var React = require('react');
var EnumCoreModule = require('../../../../../public/js/enum-core');
const BaseComponent = require('../../../../shared/base');
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
        if (item.StockLimited) {
            return <td>{item.StockQuantity}</td>;
        }
        else {
            return <td>&#8734;</td>;
        }
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
            <div className="oreder-data-table  tb-up table-responsive">
                <table className="table order-data1 item-area">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th className="text-left">Price</th>
                            <th>Approved</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.items && this.props.items.length > 0 ? this.props.items.map((item, index) => {
                                let itemLink = "edit/" + item.ID;
                                let itemDetailsLink = "/items/" + self.generateSlug(item.Name) + "/" + item.ID;
                                const itemAvailable = self.state.itemVisibilityMap.get(item.ID);
                                let mediaUrl = "";
                                if (item.Media && item.Media.length > 0) {
                                    mediaUrl = item.Media[0].MediaUrl;
                                }
                                let itemPrice = 0;

                                if (item.Price === null && item.ChildItems !== null) {
                                    itemPrice = item.ChildItems[0].Price;
                                } else {
                                    itemPrice = item.Price;
                                }

                                let IsAvailable = itemAvailable !== null && typeof itemAvailable !== 'undefined' ? itemAvailable : item.IsAvailable;
                                return (
                                    <tr className="item-row" data-key="item" data-id="1">
                                        <td data-th="Item">
                                            <div className="sort-item-image">
                                                <img src={mediaUrl} />
                                                <p className="sort-item-description text-left">{item.Name}</p>
                                            </div>                                            
                                        </td>
                                        <td data-th="Price">
                                            <div className="item-price text-left">
                                                {self.renderFormatMoney(item.CurrencyCode, itemPrice)} / {item.PriceUnit}
                                            </div>
                                        </td>                                        
                                        <td data-th="Approved">
                                            <PermissionToolTip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                                <div className="onoffswitch">
                                                    <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={index + '-purchaseable'} checked={IsAvailable} onChange={(e) => self.updatePurchasable(item, e, index + '-purchaseable')} />
                                                    <label className="onoffswitch-label" htmlFor={index + '-purchaseable'}>
                                                        <span className="onoffswitch-inner"></span>
                                                        <span className="onoffswitch-switch"></span>
                                                    </label>
                                                </div>
                                            </PermissionToolTip>
                                        </td>
                                        <td>
                                            <div className="item-actions">
                                                <ul>
                                                    <li>
                                                        <PermissionToolTip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                                            <a href='#' onClick={(e) => self.props.validatePermissionToPerformAction('edit-merchant-inventory-api', () => location.href = itemLink)}><i className="icon icon-edit"></i></a>
                                                        </PermissionToolTip>
                                                    </li>
                                                    <li>
                                                        <PermissionToolTip isAuthorized={self.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                                                            <a href='#' className="delete_item" data-id="1"><i onClick={(e) => self.props.confirmDelete(item.ID)} className="icon icon-delete"></i></a>
                                                        </PermissionToolTip>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : this.renderEmpty()
                        }
                         
                    </tbody>
                   
                </table>
            </div>
        );
    };
};

module.exports = ItemListTableComponent;