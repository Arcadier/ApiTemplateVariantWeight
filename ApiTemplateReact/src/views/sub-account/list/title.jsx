'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class TitleComponent extends BaseComponent {
    render() {
        return (
            <div className="sc-u title-sc-u sc-u-mid full-width">
                <span className="sc-text-big">{this.props.title}</span> <small>{this.props.entries} entries</small>
            </div>  
        );
    }
}

module.exports = TitleComponent;