'use strict';
var React = require('react');

var BuyerLoginComponentTemplate = require('./buyer-login').BuyerLoginComponent;
var SellerLoginComponentTemplate = require('./seller-login').SellerLoginComponent;

class LoginComponent extends React.Component {
    render() {
        return (
            <React.Fragment key='login-component'>
                <div id='login-page'>
                    {this.props.type == 'buyer'
                        ? <BuyerLoginComponentTemplate {...this.props} />
                        : <SellerLoginComponentTemplate {...this.props} />
                    }
                </div>
            </React.Fragment>
        );
    }
}

module.exports=LoginComponent;
