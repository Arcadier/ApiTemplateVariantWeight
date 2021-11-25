'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class EmptySearchResultComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            suggestedItems: []
        };

        var markers = null;
        var map = null;
        var bounds = null;
    }

    componentDidMount() {
        const self = this;
        const userLatitude = sessionStorage.getItem("userLatitude");
        const userLongitude = sessionStorage.getItem("userLatitude");

        this.props.searchSuggestedItems(userLatitude, userLongitude, (response) => {
            if (response && response.Records.length > 0) {
                self.setState({
                    suggestedItems: response.Records
                });
            }
        });
    }

    componentDidUpdate() {
        this.initMap();
    }

    initMap() {
        const mapOtions = {
            center: new google.maps.LatLng(5.6361135408768765, -55.075928136573886),
            zoom: 11
        };

        this.map = new google.maps.Map(document.getElementById('load-map'), mapOtions);
        this.setMarkers(this.map, this.getLocations());
    }

    setMarkers(map, locations) {
        this.removeMarkers();
        this.markers = [];

        locations.map((location) => {
            const { title, image, link, price, lat, lng } = location;

            const marker = new google.maps.Marker({
                map: map,
                title: title,
                position: new google.maps.LatLng(lat, lng)
            });

            const content =
                `<div class="map-popover-main">` +
                `<div class="map-popover-content">` +
                `<a href="${link}">` +
                `<div class="map-desc-price">${price}</div>` +
                `<img src="${image}" class="img-tooltip-map">` +
                `</a>` +
                `</div>` +
                `<h3 class="map-popover-title">${title}</h3>` +
                `</div>`;

            const infowindow = new google.maps.InfoWindow()

            google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
                return function () {
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                };
            })(marker, content, infowindow));

            this.markers.push(marker);
        });

        this.bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < this.markers.length; i++) {
            this.bounds.extend(this.markers[i].getPosition());
        }

        map.fitBounds(this.bounds);
    }

    removeMarkers() {
        if (this.markers) {
            for (let i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
        }

        this.bounds = new google.maps.LatLngBounds(null);
    }

    getLocations() {
        var locations = [];

        this.state.suggestedItems.map((item) => {
            locations.push({
                title: item.Name,
                image: item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : '',
                link: `/items/${this.generateSlug(item.Name)}/${item.ID}`,
                price: this.formatMoney(this.props.currencyCode, item.Price, item.PriceUnit),
                lat: item.Location ? item.Location.Latitude : '',
                lng: item.Location ? item.Location.Longitude : '',
            });
        });

        return locations;
    }

    render() {
        const self = this;

        return (
            <React.Fragment>
                <div className="item-no-result-msg">
                    <div className="no-result-red">Sorry!</div>
                    <img src="/assets/images/no_result.svg" />
                    <div className="no-result-text">
                        <span>We couldn't find anything that matches. <br />Would you like to review your search, and you can check out what others are looking at below.</span>
                    </div>
                    <div className="product-list">
                        <div className="tab-content">
                            <div id="item-for-sell" className="tab-pane fade in active">
                                <div className="row">
                                    {Array.from(self.state.suggestedItems).map(function (item, index) {
                                        const { averageRating } = item;
                                        const stars = averageRating ? averageRating * 20 : 0;
                                        return (
                                            <div className="col-md-6 col-xs-6 xs-mb-15" key={item.ID}>
                                                <a href={"/items/" + self.generateSlug(item.Name) + "/" + item.ID} className="item-box-small">
                                                    <div className="item-image">
                                                        <img src={item.Media[0].MediaUrl} alt={item.Name} title={item.Name} className="img-responsive" />
                                                    </div>
                                                    <div className="item-detail">
                                                        <h4 className="item-name">{item.Name}</h4>
                                                        <div className="item-price">
                                                            {self.renderFormatMoney(item.CurrencyCode, item.Price)}
                                                        </div>
                                                        <div className="store-rating">
                                                            <span className="stars"><span style={{ width: `${stars}%` }}></span></span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div id="item-reviews" className="tab-pane fade storefront-review">
                        </div>
                    </div>
                </div>
                <div className="clearfix" />
            </React.Fragment>
        );
    }
}

module.exports = EmptySearchResultComponent;