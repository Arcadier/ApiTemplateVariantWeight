'use strict';
const BaseComponent = require('../../../../shared/base');
let React = require('react');
let EnumCoreModule = require('../../../../../public/js/enum-core');
let toastr = require('toastr');

class LocationMapComponent extends BaseComponent {

    constructor(props) {
        super(props);
        let tempSelectedCountries = [];
        EnumCoreModule.GetCountries().map(function (country) {
            tempSelectedCountries.push({
                name: country.name,
                alpha2code: country.alpha2code,
                selected: false
            })
        })
        this.state = {
            countries: tempSelectedCountries,
            geoLocation: this.props.itemModel.geoLocation                    
        };
        var markers = null;
        var map = null;
    }

    componentDidMount() {
        this.initMap();
    }

    componentDidUpdate() {
        this.setMarkers(this.map, this.getLocations());
    }

    onChangeCountry(e) {
        let self = this;
        let data = {
            name: e.target.value,
            location: this.props.itemModel.geoLocation.location,
            state: this.props.itemModel.geoLocation.state,
            city: this.props.itemModel.geoLocation.city,
            postal: this.props.itemModel.geoLocation.postal,
            long: this.props.itemModel.geoLocation.long,
            lat: this.props.itemModel.geoLocation.lat
        };

        self.props.locationChanged(data);

        //this.setState({
        //    countries: self.state.countries,
        //    geolocation: data,
        //});
    }

    onChangeLocation(e) {
        let self = this;
        let data = {
            name: this.props.itemModel.geoLocation.name,
            location: e.target.value,
            state: this.props.itemModel.geoLocation.state,
            city: this.props.itemModel.geoLocation.city,
            postal: this.props.itemModel.geoLocation.postal,
            long: this.props.itemModel.geoLocation.long,
            lat: this.props.itemModel.geoLocation.lat
        };


        self.props.locationChanged(data);
        //this.setState({
        //    countries: self.state.countries,
        //    geoLocation: data,
        //});
    }

    onChangeState(e) {
        let self = this;
        let data = {
            name: this.props.itemModel.geoLocation.name,
            location: this.props.itemModel.geoLocation.location,
            state: e.target.value,
            city: this.props.itemModel.geoLocation.city,
            postal: this.props.itemModel.geoLocation.postal,
            long: this.props.itemModel.geoLocation.long,
            lat: this.props.itemModel.geoLocation.lat
        };


        self.props.locationChanged(data);
        //this.setState({
        //    countries: self.state.countries,
        //    geoLocation: data,
        //});
    }

    onChangeCity(e) {
        let self = this;
        let data = {
            name: this.props.itemModel.geoLocation.name,
            location: this.props.itemModel.geoLocation.location,
            state: this.props.itemModel.geoLocation.state,
            city: e.target.value,
            postal: this.props.itemModel.geoLocation.postal,
            long: this.props.itemModel.geoLocation.long,
            lat: this.props.itemModel.geoLocation.lat
        };


        self.props.locationChanged(data);
        //this.setState({
        //    countries: self.state.countries,
        //    geoLocation: data,
        //});
    }

    onChangePostal(e) {
        let self = this;
        let data = {
            name: this.props.itemModel.geoLocation.name,
            location: this.props.itemModel.geoLocation.location,
            state: this.props.itemModel.geoLocation.state,
            city: this.props.itemModel.geoLocation.city,
            postal: e.target.value,
            long: this.props.itemModel.geoLocation.long,
            lat: this.props.itemModel.geoLocation.lat
        };


        self.props.locationChanged(data);
        //this.setState({
        //    countries: self.state.countries,
        //    geoLocation: data,
        //});
    }

    initMap() {
        const mapOtions = {
            center: new google.maps.LatLng(5.6361135408768765, -55.075928136573886),
            zoom: 6
        };

        this.map = new google.maps.Map(document.getElementById('load-map'), mapOtions);
        this.setMarkers(this.map, this.getLocations());
    }

    removeMarkers() {
        if (this.markers) {
            for (let i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
        }
    }

    getLocations() {
        var locations = [];

            locations.push({
               // title: item.Name,
              //  image: item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : '',
              //  link: `/items/${this.generateSlug(item.Name)}/${item.ID}`,
              //  price: this.formatMoney(this.props.currencyCode, item.Price, item.PriceUnit),
                lat: this.props.itemModel.geoLocation.lat ? this.props.itemModel.geoLocation.lat : '',
                lng: this.props.itemModel.geoLocation.long ? this.props.itemModel.geoLocation.long : '',
            });

        return locations;
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

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < this.markers.length; i++) {
            bounds.extend(this.markers[i].getPosition());
        }

        map.fitBounds(bounds);
    }

    renderMap() {
        return (
            <React.Fragment>
                <div className="map-iframe">
                    <div id="load-map" />
                </div>
            </React.Fragment>
        )
    }

    //renderLocationMap() {
    //    if (this.props.itemModel) {
    //        const googleMapKey = process.env.GOOGLE_MAP_API_KEY;
    //        if (this.props.itemModel.geoLocation) {

    //            const location = `${this.props.itemModel.geoLocation.location}, ${''} ${this.props.itemModel.geoLocation.city} ${this.props.itemModel.geoLocation.country} ${this.props.itemModel.geoLocation.postal} ${this.props.itemModel.geoLocation.state || ''}`;

    //            const encodedLocation = this.props.itemModel.geoLocation.lat !== 0 && this.props.itemModel.geoLocation.long !== 0 ? `${this.props.itemModel.geoLocation.lat}, ${this.props.itemModel.geoLocation.long}` : location;
    //            let srcUrl = "https://www.google.com/maps/embed/v1/place?q=" + encodeURI(encodedLocation) + "&key=" + googleMapKey;

    //            if (this.props.itemModel.geoLocation.lat === 0 && this.props.itemModel.geoLocation.long === 0) {
    //                 srcUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d41289.181748745556!2d6.978070321229147!3d49.69999722089068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479585f02cf48a95%3A0x3d3004824605eca9!2s54426+Malborn%2C+Germany!5e0!3m2!1sen!2sau!4v1474716115305";
    //            }

    //            return (
    //                <div id="locationMap" className="location-map">
    //                    <iframe src={srcUrl} width="100%" height={250} frameBorder={0} style={{ border: 0 }} allowFullScreen />
    //                </div>   
    //            );
    //        }
    //    }
    //}

    render() {
        let self = this;
        //FIx for ARC9849
        if (self.state.countries) {
            self.state.countries.sort((a, b) => a.name.localeCompare(b.name))
        }

        return (
            <React.Fragment>
                <div className="tab-container tabcontent active" id="location_tab" data-position="3925">
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Location</span>
                        </div>
                    </div>
                    <div className="itmupld-location-sec">
                        <div className="seller-common-box">
                            <div className="box-shadow un-inputs">

                                <div className="item-form-group">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <label>Location*</label>
                                            <input name="address" type="text" className="required" defaultValue={self.props.itemModel.geoLocation.location} onChange={(e) => self.onChangeLocation(e)} id="upload_location"/>
                                                </div>
                                            <div className="col-md-6">
                                                <label>Country*</label>
                                            <select name="country" className="country-box required" defaultValue={self.props.itemModel.geoLocation.name} onChange={(e) => self.onChangeCountry(e)}>
                                                    <option value="">-select-</option>
                                                {
                                                    self.state.countries.map(function (country) {
                                                        return (
                                                            <option key={country.alpha2code} value={country.name}>{country.name}</option>
                                                        )
                                                    })
                                                }


                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label>State</label>
                                            <input name="state" type="text" className="" defaultValue={self.props.itemModel.geoLocation.state} onChange={(e) => self.onChangeState(e)}/>
                                                </div>
                                                <div className="col-md-6">
                                                    <label>City*</label>
                                            <input name="city" type="text" className="required" defaultValue={self.props.itemModel.geoLocation.city} onChange={(e) => self.onChangeCity(e)}/>
                                                </div>
                                                    <div className="col-md-6">
                                                        <label>Postal Code*</label>
                                            <input name="postalcode" type="text" className="required" defaultValue={self.props.itemModel.geoLocation.postal} onChange={(e) => self.onChangePostal(e)} id="upload_loc_code"/>
                                                </div>
                                                    </div>
                                                </div>


                                <div className="row itmupld-loc-maparea map-active">
                                    <div className="col-md-8 upload-map">
                                        {this.renderMap()}                                              
                                    </div>
                                    <div className="clearfix"></div>

                                </div>

                                <div className="clearfix"></div>                                                

                            </div>

                        </div>

                    </div>


                </div>
            </React.Fragment>
        )

    }

}

module.exports = LocationMapComponent;