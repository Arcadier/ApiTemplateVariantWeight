'use strict';
const React = require('react');
const BaseComponent = require('../../views/shared/base');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ItemInfoComponent extends BaseComponent {
    componentDidMount() {
        this.renderThumbnailImages();
    }

    renderPrice() {
        const { itemDetails, defaultPrice } = this.props;
        let priceUnit = itemDetails.PriceUnit ? `${itemDetails.PriceUnit.charAt(0).toUpperCase() + itemDetails.PriceUnit.slice(1)}` : null;

        return (
            <div className="item-price">
                {this.renderFormatMoney(itemDetails.CurrencyCode, defaultPrice, priceUnit)}
            </div>
        );
    }

    renderRating(AverageRating) {
        let self = this;
        return (
            <div className="item-rating">
                <span className="stars"><span style={{ width: `${AverageRating * 20 || 0}%` }} /></span>
                <span className="feedback-text">({`${this.props.PositiveFeedbackPercentage || 0}%`} positive feedback)</span>
            </div>
        );
    }

    renderLogoImage() {
        if (this.props.itemDetails.Media != null && this.props.itemDetails.Media.length > 0) {
            return (
                <div>
                    <a className="item-main-thumbnail" rel="lightbox" href={this.props.itemDetails.Media[0].MediaUrl} data-lightbox={this.props.itemDetails.Media.length > 1 ? "gallery-group" : "gallery"} id="item-thumbnail">
                        <img className="item-big-img" src={this.props.itemDetails.Media[0].MediaUrl} />
                    </a>
                    {
                        this.props.itemDetails.Media.slice(1).map(function (obj) {
                            return <a rel="lightbox" key={obj.ID} href={obj.MediaUrl} data-lightbox="gallery-group" id="item-thumbnail">
                                <img className="item-big-img" src={obj.MediaUrl} style={{ display: 'none' }} />
                            </a>
                        })
                    }
                </div>
            );
        }
        return '';
    }

    renderThumbnailImages() {
        const { Media } = this.props.itemDetails;
        //initialize slider
        $(".slick-slider").slick({
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 3,
            vertical: true,
            draggable: true,
        })
        //map images
        if (Media) {
            Media.map(m =>
                $(".slick-slider").slick('slickAdd',
                    `<div>
                        <li style="width: '100%'; display: 'inline-block'">
                            <a data-lightbox="group" data-imgurl="${m.MediaUrl}" href=${m.MediaUrl} tabIndex="0">
                                <img src=${m.MediaUrl} alt="thumbnail" className="img-responsive" style="width: 100%" />
                            </a>
                        </li>
                    </div>`
                )
            )
        }
        // configure prev and next        
        $(".slick-next, .slick-prev").hide();
        $(".bottom_slide").on("click", function () {
            $(".slick-next").trigger("click");
        });
        $(".top_slide").on("click", function () {
            $(".slick-prev").trigger("click");
        });
    }

    render() {
        const { AverageRating } = this.props.itemDetails;
        return (
            <div className="idcl-top preview-image full-width">
                <div className="images-bunch">
                    <div className="idclt-img loadarea pull-right">
                        {this.renderLogoImage()}
                    </div>
                    <div className="thumbnail-images">
                        <span className="top_slide text-center"><i className="fa fa-angle-up"></i></span>
                        <ul className=" slick-slider slick-vertical" />
                        <span className="bottom_slide text-center"><i className="fa fa-angle-down"></i></span>
                    </div>
                </div>
                <div className="idctl-desc">
                    <span className="item-name">{this.props.itemDetails.Name}</span>
                    {this.renderPrice()}
                    {this.props.ReviewAndRating === true ? this.renderRating(AverageRating) : ''}
                </div>
            </div>
        );
    }
}

module.exports = ItemInfoComponent;