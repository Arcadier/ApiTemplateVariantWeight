'use strict';
var React = require('react');
var BaseComponent = require('../../../shared/base');

class ItemList extends BaseComponent {    
    renderItemList() {
        const self = this;
        return (
            this.props.itemDetails.Records.map(function (itemDetail) {
                let detailLink = "/items/" + self.generateSlug(itemDetail.Name) + '/' + itemDetail.ID;
                return (
                    <div key={itemDetail.ID} className="col-md-2 col-sm-4 col-xs-6 xs-mb-15">
                        <a href={detailLink} className="item-box-small">
                            <div className="item-image">
                                <img src={itemDetail.Media ? itemDetail.Media[0].MediaUrl : ""} alt={itemDetail.Name} title={itemDetail.Name} className="img-responsive"/>
                            </div>
                            <div className="item-detail">
                                <h4 className="item-name">{itemDetail.Name}</h4>
                                <div className="item-price">
                                    {self.renderFormatMoney(itemDetail.CurrencyCode, itemDetail.HasChildItems ? itemDetail.ChildItems[0].Price : itemDetail.Price)}
                                </div>
                            </div>
                        </a>
                    </div>
                );
            })
        );
    }

    searchOrUpdateKeyword(e) {
        let self = this;
        if (e.key === 'Enter') {
            self.props.searchStoreFront(self.props.keyword, self.props.merchantID, self.props.itemDetails.PageNumber);
        }
        else {
            self.props.updateKeyWord(e);     
        }
    }

    render() {
        let self = this;
        return (
            <React.Fragment>
                <div className="sc-upper">
                    <div className="sc-u sc-u-mid full-width">
                        <div className="pull-left">
                            <span className="sc-text-big avail"><span className="avail-item">({self.props.itemDetails.TotalRecords})</span> items for sale</span>
                        </div>
                        <div className="pull-right">
                            <div className="order-search-input border-rad-null pull-right">
                                <input type="text" name="" onKeyUp={(e) => self.searchOrUpdateKeyword(e)} defaultValue={self.props.keyword} />
                                <i className="fa fa-search" onClick={(e) => self.props.searchStoreFront(self.props.keyword, self.props.merchantID, self.props.itemDetails.PageNumber)} />
                            </div>
                            </div>
                        </div>
                </div>

                <div className="product-list">
                    <div className="row">
                        {this.renderItemList()}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = ItemList;