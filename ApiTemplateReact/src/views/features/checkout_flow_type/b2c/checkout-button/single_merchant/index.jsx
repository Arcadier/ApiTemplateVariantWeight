'use strict';
const React = require('react');
const toastr = require('toastr');
const CheckoutButtonMain = require('./' + process.env.PRICING_TYPE + '/index');

class CheckoutButtonComponent extends React.Component {

	render() {
        return (
            <CheckoutButtonMain {...this.props} />
        );
    }
}

module.exports = CheckoutButtonComponent;
