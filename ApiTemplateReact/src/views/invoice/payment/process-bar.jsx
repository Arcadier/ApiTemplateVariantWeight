'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class InvoiceProcessBarComponent extends BaseComponent {
    render() {
        return (
            <div className="pc-processbar hide">
                <ul>
                    <li className="active">
                        <span className="icon">
                            <i className="fa fa-check" />
                        </span>
                        <span className="pcul-text">Shipping</span>
                    </li>
                    <li className="active">
                        <span className="pb-line" />
                    </li>
                    <li className="active">
                        <span className="icon">
                            <i className="fa fa-check" />
                        </span>
                        <span className="pcul-text">Review</span>
                    </li>
                    <li className="active">
                        <span className="pb-line" />
                    </li>
                    <li className="active">
                        <span className="icon">3</span>
                        <span className="pcul-text">Pay</span>
                    </li>
                </ul>
            </div>
        );
    }
}

module.exports = InvoiceProcessBarComponent;