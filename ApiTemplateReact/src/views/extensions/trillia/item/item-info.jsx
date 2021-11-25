'use strict';
var React = require('react');
var BaseComponent = require('../../../../views/shared/base');

class ItemInfoComponent extends BaseComponent {

    renderPrice() {
        let self = this;
        if (this.props.itemDetails.ChildItems != null) {
            let ele = this.props.itemDetails.ChildItems.map(function(itemDetail, index) {
                if (itemDetail.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    return (
                        <div key={index} className="item-price">
                            {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, itemDetail.Price)}
                        </div>
                    );
                }
            });
            return ele;
        } else {
            return (
                <div className="item-price">
                    {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, self.props.itemDetails.Price)}
                </div>
            );
        }
    }

    renderLogoImage() {
        if (this.props.itemDetails.Media != null && this.props.itemDetails.Media.length > 0) {
            return (
                <div>
                    <a rel="lightbox" href={this.props.itemDetails.Media[0].MediaUrl} data-lightbox="gallery-group" id="item-thumbnail">
                        <img className="item-big-img lazyload" src={this.props.itemDetails.Media[0].MediaUrl} data-src={this.props.itemDetails.Media[0].MediaUrl} />
                    </a>
                    {
                        this.props.itemDetails.Media.slice(1).map(function (obj) {
                            return (<a rel="lightbox" key={obj.ID} data-lightbox="gallery-group" id="item-thumbnail">
                                <img className="item-big-img lazyload" data-src={obj.MediaUrl} style={{ display: 'none' }}/>
                                    </a>);
                        })   
                    }
                </div>
            );
        }
        return '';
    }
       
    render() {
        return (
            <div className="idcl-top preview-image">
                <div className="idclt-img loadarea">
                    {this.renderLogoImage()}
                </div>
                <div className="idctl-desc">
                    <span className="item-name">{this.props.itemDetails.Name}</span>
                    <div className="full-width group-buy-top">
                        {this.renderPrice()}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ItemInfoComponent;