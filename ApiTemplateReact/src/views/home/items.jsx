'use strict';
const React = require('react');
const BaseComponent = require('../shared/base');
const ItemPriceComponent = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/home/item-price');

class ItemsComponent extends BaseComponent {
    itemUrl(itemName, itemId) {
        return "/items/" + this.generateSlug(itemName) + "/" + itemId;
    }

    render() {
        var self = this;    
        return (
            <div className="latest-item-list">
                <div className="container">
                    <div className="section-title">
                        <h3>Latest</h3>
                        <div className="divider"></div>
                    </div>
                    <div className="row">
                        {Array.from(this.props.items.slice(0, (self.props.layoutItemCount))).map(function (item, index) {
                            let imgSrc = "";
                            if (item.Media) {                                
                                imgSrc = item.Media[0].MediaUrl
                            }
                            return (<div className="col-md-2 col-sm-4 col-xs-6 xs-mb-15" key={item.ID}>
                                <a href={self.itemUrl(item.Name, item.ID)} className="item-box-small">
                                    <div className="item-image">
                                        <img data-src={imgSrc} alt={item.Name} title={item.Name} className="img-responsive lazyload" />
                                    </div>
                                    <div className="item-detail">
                                        <h4 className="item-name">{item.Name}</h4>
                                        <div className="item-price">
                                            <ItemPriceComponent
                                                item={item}
                                                user={self.props.user}
                                                userPreferredLocationId={self.props.userPreferredLocationId} />
                                        </div>
                                    </div>
                                </a>
                            </div>);
                        })}

                        <div className="vew-more-btn text-center">
                            <a href="/search" className="more-btn">View More <i className="fa fa-angle-right"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ItemsComponent;