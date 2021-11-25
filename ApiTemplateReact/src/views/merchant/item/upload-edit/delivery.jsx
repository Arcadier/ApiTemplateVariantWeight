'use strict';
var React = require('react');

class DeliveryComponent extends React.Component {
    renderPickup(data,i) {
        return (
            <tr key={i}>
                <td>{data.Name}</td>
                <td className="check-box pickup">
                    <span>
                        <input type="checkbox" id={data.GUID}
                        onChange={(e) => this.props.shippingSelectedChanged("pickup", data.GUID)}
                        checked={data.Selected} />
                        <label htmlFor={data.GUID} />
                    </span>
                </td>
            </tr>
        )
    }

    renderDelivery(data,i) {
        let shippingZone = "All";
        if (data.ShippingDetails.IsAllCountries == false) {
            if (data.ShippingDetails.SelectedCountries) {
                let countries = "";
                Array.from(data.ShippingDetails.SelectedCountries).map(function (country, index) {
                    if (countries === "") {
                        countries = country.Name;
                    }
                    else {
                        countries += ", " + country.Name;
                    }
                });
                shippingZone = countries;
            }
            else {
                shippingZone = data.ShippingDetails.Countries;
            }
        }  

        return (
            <tr key={i}>
                <td>{data.Name}</td>
                <td>{shippingZone}</td>
                <td className="check-box available">
                    <span>
                        <input type="checkbox" id={data.GUID}
                            onChange={(e) => this.props.shippingSelectedChanged("delivery", data.GUID)}
                            checked={data.Selected} />
                        <label htmlFor={data.GUID} />
                    </span>
                </td>
            </tr>
            )
    }

    render() {
        let self = this;
        return (
            <React.Fragment>
                <div className="tab-container tabcontent" id="delivery_tab">
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Shipping</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs ">
                        <div className="col-md-12 delivery-tab-class">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="row cat-search">
                                        <input type="text" className="delivery_dropdown" maxLength={130}
                                            onKeyUp={(e) => this.props.searchShippings(e.target.value)}
                                            defaultValue={this.props.shippingModel.shippingWord}
                                            placeholder="Search Shipping method" />
                                        <i className="fa fa-search" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="un-ul-table">
                                    <div className="table-responsive">
                                        <table className="table" id="tblDelivery">
                                            <thead>
                                                <tr>
                                                    <th>Shipping Method(s)</th>
                                                    <th>Shipping Zones</th>
                                                    <th className="check-box available">
                                                        <span>
                                                            <input type="checkbox" id="checkDeliveryAll"
                                                                onChange={(e) => this.props.shippingSelectedChanged("checkDeliveryAll", "none")}
                                                                checked={this.props.shippingModel.checkDeliveryAll} />
                                                            <label htmlFor="checkDeliveryAll" />
                                                        </span>Available</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.props.shippingModel.shippings.map(function (ship, i) {
                                                        if (ship.Show === true && ship.Visible === true && ship.Method.toLowerCase() === "delivery") {
                                                            return self.renderDelivery(ship, i);
                                                        }
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <br />
                                <br />
                                <div className="un-ul-table">
                                    <div className="table-responsive">
                                        <table className="table" id="tblPickupLocation">
                                            <thead>
                                                <tr>
                                                    <th>Pick-up Location</th>
                                                    <th className="check-box pickup">
                                                        <span>
                                                            <input type="checkbox" id="checkPickUpAll"
                                                                onChange={(e) => this.props.shippingSelectedChanged("checkPickUpAll", "none")}
                                                                checked={this.props.shippingModel.checkPickUpAll} />
                                                            <label htmlFor="checkPickUpAll" />
                                                        </span>Available</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.props.shippingModel.shippings.map(function (ship, i) {
                                                        if (ship.Show === true && ship.Visible === true && ship.Method.toLowerCase() === "pickup") {
                                                            return self.renderPickup(ship, i);
                                                        }
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = DeliveryComponent;