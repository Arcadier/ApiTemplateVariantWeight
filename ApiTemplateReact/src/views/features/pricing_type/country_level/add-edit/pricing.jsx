'use strict';
var React = require('react');
const LocationComponent = require('./location');
const LocationListComponent = require('./location-list');

const PermissionTooltip = require('../../../../common/permission-tooltip');

class PricingComponent extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className="tab-container tabcontent mt-50 new-country" id="pricing_tab" style={{ display: 'none' }}>
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Pricing & Stock</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs">
                        <div className="item-form-element">
                            <LocationListComponent
                                locations={this.props.itemModel.locations}
                                selectedLocationIds={this.props.itemModel.selectedLocationIds}
                                addLocations={this.props.addLocations}
                                removeLocation={this.props.removeLocation}
                                removeAllLocations={this.props.removeAllLocations} />
                            <LocationComponent
                                {...this.props} />
                        </div>
                        <div className="col-md-12">
                            <div className="item-upload-btn">
                                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                    <div className="un-btn-upload" id="btnItemUpload" onClick={(e) => this.props.uploadOrEditItem(e)}>
                                        <a href="#" onClick={(e) => e.preventDefault()}>Add Item</a>
                                    </div>
                                </PermissionTooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = PricingComponent;