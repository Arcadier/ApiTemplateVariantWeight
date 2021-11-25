'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class MapComponent extends BaseComponent {
    constructor(props) {
        super(props);

        var markers = null;
        var map = null;
        var bounds = null;
    }

    componentDidMount() {
        this.initMap();
    }

    componentDidUpdate() {
        this.setMarkers(this.map, this.getGroupLocations());
    }

    initMap() {
        const mapOtions = {
            center: new google.maps.LatLng(5.6361135408768765, -55.075928136573886),
            zoom: 11
        };

        this.map = new google.maps.Map(document.getElementById('load-map'), mapOtions);
        this.setMarkers(this.map, this.getGroupLocations());
    }

    setMarkers(map, groupLocations) {
        this.removeMarkers();
        this.markers = [];

        groupLocations.map((group) => {
            const marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(group[0].lat, group[0].lng)
            });

            let contents = [];

            group.map((location) => {
                const { title, image, link, price, lat, lng } = location;

                contents.push(`<div class="map-popover-main">` +
                    `<div class="map-popover-content">` +
                    `<a href="${link}">` +
                    `<div class="map-desc-price">${price}</div>` +
                    `<img src="${image}" class="img-tooltip-map">` +
                    `</a>` +
                    `</div>` +
                    `<h3 class="map-popover-title">${title}</h3>` +
                    `</div>`);
            });

            const infowindow = new google.maps.InfoWindow()

            google.maps.event.addListener(marker, 'click', (function (marker, contents, infowindow) {
                return function () {
                    infowindow.setContent(contents.join(''));
                    infowindow.open(map, marker);
                };
            })(marker, contents, infowindow));

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

    toggleMap(e) {
        $(e.target).parents('.search-container').toggleClass('map-active');
        if ($(e.target).parents('.search-container').hasClass('map-active')) {
            $(e.target).text('Hide Map');
        } else {
            $(e.target).text('Show Map');
        }
    }

    getGroupLocations() {
        var groups = {};

        const locations = this.props.items.filter(i => i.Location && i.Location.Latitude && i.Location.Longitude).map((item) => {
            return {
                title: item.Name,
                image: item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : '',
                link: `/items/${this.generateSlug(item.Name)}/${item.ID}`,
                price: this.formatMoney(this.props.currencyCode, item.Price, item.PriceUnit),
                lat: item.Location.Latitude,
                lng: item.Location.Longitude,
            };
        });

        locations.map((location) => {
            const key = JSON.stringify([location.lat, location.lng]);

            groups[key] = groups[key] || [];
            groups[key].push(location);
        });

        return Object.keys(groups).map((key) => {
            return groups[key];
        })
    }

    render() {
        return (
            <React.Fragment>
                <button className="btn btn-primary btn-map pull-right" onClick={(e) => this.toggleMap(e)}>Hide Map</button>
                <div className="map-iframe">
                    <div id="load-map" />
                </div>
            </React.Fragment>
        );
    }
}

module.exports = MapComponent;