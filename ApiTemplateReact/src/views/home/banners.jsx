'use strict';
var React = require('react');

class BannersHome extends React.Component {
    getBannerImage(detail) {
        if (detail != null && detail.PanelMedia != null
            && detail.PanelMedia.length > 0) {
            return detail.PanelMedia[0].MediaUrl;
        }
        return '';
    }

    setBannerActive(active) {
        if (active == true) return "item overlay active";
        else return "item overlay";
    }

    componentDidMount() {
        if (this.props.panel && this.props.panel.Details.length == 1) {
            $('.carousel-control').hide();
            $('#HomeCarousel').carousel('pause');
        }
    }

    renderDefault() {
        if (this.props.panel == null) {
            return (
                <div className="item active" key="0">
                    <img src="/assets/images/banner.jpg" alt="" />
                    <div className="banner-inner">
                        <div className="container">
                            <div className="row">
                                <div className="banner-quote">
                                    <h1>Arcadier Marketplace</h1>
                                    <p>Use admin portal to setup...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return this.renderCarousel();
        }
    }

    renderCarousel() {
        let self = this;
        let active = true;
        var carousel = this.props.panel.Details.map(function (detail, index) {
            if (index > 0) active = false;
            if (detail.Url != null) {
                return (
                    <div className={self.setBannerActive(active)} key={index}>
                        <div className="slide-video">
                            <video title={detail.Title} id={detail.ID} autoPlay loop muted><source src={detail.Url} type="video/mp4" />Your browser does not support the video tag.</video>
                        </div>
                        <div className="banner-text">
                            <span className="banner-slogan">{detail.Description}</span>
                            <h1 className="banner-title">{detail.Title}</h1>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className={self.setBannerActive(active)} key={index}>
                        <img src={self.getBannerImage(detail)} title={detail.Title} alt={detail.Description}/>
                        <div className="banner-text">
                            <span className="banner-slogan">{detail.Description}</span>
                            <h1 className="banner-title">{detail.Title}</h1>
                        </div>
                    </div>
                );
            }
        });
        return carousel;
    }


    render() {
        return (
            <div className="hmpg-banner banner-slider">
                <div className="carousel slide" data-ride="carousel" id="HomeCarousel">
                    <div className="carousel-inner" role="listbox">
                        {this.renderDefault()}
                        <a className="carousel-control" href="#HomeCarousel" role="button" data-slide="prev">
                            <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                            <span className="sr-only">Previous</span>
                        </a>

                        <a className="right carousel-control" href="#HomeCarousel" role="button" data-slide="next">
                            <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                            <span className="sr-only">Next</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = BannersHome;