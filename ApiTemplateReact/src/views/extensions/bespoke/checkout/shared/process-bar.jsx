'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class ProcessBarComponent extends BaseComponent {
    setClass(step) {
        if (step <= this.props.step) {
            return 'active';
        } else {
            return '';
        }
    }

    render() {
        return (
            <div className="pc-processbar">
                <ul>
                    <li className={this.setClass(1)}>
                        <span className="icon">
                            <i className="fa fa-check"></i>
                        </span>
                        <span className="pcul-text">Delivery</span>
                    </li>
                    <li className={this.setClass(2)}>
                        <span className="pb-line"></span>
                    </li>
                    <li className={this.setClass(2)}>
                        <span className="icon">2 </span>
                        <span className="pcul-text">Review</span>
                    </li>
                    <li className={this.setClass(3)}>
                        <span className="pb-line"></span>
                    </li>
                    <li className={this.setClass(3)}>
                        <span className="icon">3</span>
                        <span className="pcul-text">Pay</span>
                    </li>
                </ul>
            </div>
        );
    }
}

module.exports = ProcessBarComponent;