'use strict';
var React = require('react');

class CheckoutDeliveryComponent extends React.Component {

    render() {
        return (
            <div className="pc-processbar">
                <ul>
                    <li className="active">
                        <span className="icon">
                            <i className="fa fa-check"></i>
                        </span>
                        <span className="pcul-text">Delivery</span>
                    </li>
                    <li>
                        <span className="pb-line"></span>
                    </li>
                    <li>
                        <span className="icon">2</span>
                        <span className="pcul-text">Review</span>
                    </li>
                </ul>
            </div>
        );
    }
}

module.exports = CheckoutDeliveryComponent;