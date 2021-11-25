'use strict';
const React = require('react');
const BaseComponent = require('../../../../../views/shared/base');

class MoqComponent extends BaseComponent {
    renderMoq() {
        const { moq } = this.props;

        if (moq) {
            return (
                <span className="moq-val">{this.formatNumberWithCommas(moq, 2)}</span>  
            );
        }

        return null;
    }

    render() {
        return (
            <span className="idcrtl-moq full-width">
                <span className="title">Minimum Order:</span>
                <span className="idcrtl-right">
                    {this.renderMoq()}
                </span>
            </span>
        );
    }
}

module.exports = MoqComponent;