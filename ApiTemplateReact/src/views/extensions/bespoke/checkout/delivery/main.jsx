'use strict';
var React = require('react');

class CheckoutDeliveryComponent extends React.Component {

    render() {
        return (
            <div className="pc-processbar">
                <ul>
                    <li className="active">
                        <span className="icon">1</span>
                        <span className="pcul-text">Delivery</span>
                    </li>
                    <li>
                        <span className="pb-line" />
                    </li>
                    <li>
                        <span className="icon">2</span>
                        <span className="pcul-text">Review</span>
                    </li>
                    <li>
                        <span className="pb-line" />
                    </li>
                    <li>
                        <span className="icon">3</span>
                        <span className="pcul-text">Pay</span>
                    </li>
                </ul>
            </div>
        );
    }
}

module.exports = CheckoutDeliveryComponent;