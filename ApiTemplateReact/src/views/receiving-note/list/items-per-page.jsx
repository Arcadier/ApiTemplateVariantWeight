'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class ItemsPerPageComponent extends BaseComponent {
    render() {
        return (
            <React.Fragment>
                <span className="select-sassy-wrapper sassy-arrow">
                    <select name="per-page" id="per-page" className="sassy-select" value={this.props.itemsCount} onChange={(e) => this.props.getItems(e.target.value)}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </span>
                <label className="sassy-label">Items per page</label>
            </React.Fragment>
        );
    }
}

module.exports = ItemsPerPageComponent;