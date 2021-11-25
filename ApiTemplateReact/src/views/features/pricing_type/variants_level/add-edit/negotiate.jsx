'use strict';
var React = require('react');

class NegotiateComponent extends React.Component {
    render() {
        let classyCheckBoxIB = "";
        let classyCheckBoxN = "";

        let instantbuy = "";
        let negotiate = "";

        if (this.props.itemModel.instantbuy === true) {
            classyCheckBoxIB = "active";
            instantbuy = "checked";
        }

        if (this.props.itemModel.negotiation === true) {
            classyCheckBoxN = "active";
            negotiate = "checked";
        }

        return (
            <div className="item-form-group mb-20">
                <div className="col-md-12">
                    <div className="row">
                        <label>How would you like to sell your item?</label>
                        <p>Select if you would like to enable your service to be purchased without pre-approval or if you would like to discuss with the buyer first.<br />
                            (You may choose to have both options for the service)
            </p>
                        <div className="classy-checkbox-group">
                            <div className={"classy-checkbox " + classyCheckBoxIB}>
                                <label htmlFor="purchase-type-1">Spot Purchase</label>
                                <input onChange={(e) => this.props.updateSpotOrNegotiateButton("instantbuy")}
                                    type="checkbox" id="purchase-type-1" defaultValue="instant-purchase" checked={instantbuy} />
                                <span className="check-indicator" />
                            </div>
                            <div className={"classy-checkbox " + classyCheckBoxN}>
                                <label htmlFor="purchase-type-2">Negotiate</label>
                                <input onChange={(e) => this.props.updateSpotOrNegotiateButton("negotiate")}
                                    type="checkbox" id="purchase-type-2" defaultValue="quotation" checked={negotiate} />
                                <span className="check-indicator" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="clearfix" />
            </div>
        )
    }
}
module.exports = NegotiateComponent;