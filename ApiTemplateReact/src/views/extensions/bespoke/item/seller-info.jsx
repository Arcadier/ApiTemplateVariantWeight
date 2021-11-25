'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var toastr = require('toastr');
var actionTypes = require('../../../../redux/actionTypes');

class SellerInfoComponent extends React.Component {
    render() {
        let self = this;
        let storeFrontUrl = "/storefront/" + self.props.merchantDetails.ID;
        let merchantImage = "";
        if (self.props.merchantDetails.Media && self.props.merchantDetails.Media[0]) {
            merchantImage = self.props.merchantDetails.Media[0].MediaUrl;
        }
        return (
            <div className="idcl-mid">
                <div className="idclm-content">
                    <div className="idclmc-img">
                        <span className="helper"></span> <img src={merchantImage} />
                    </div>
                    <div className="idclmc-name">
                        <a href={storeFrontUrl} className="seller-name">{self.props.merchantDetails.DisplayName}</a>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SellerInfoComponent;