'use strict';
const React = require('react');
const BaseComponent = require('../shared/base');

class PageItemCountComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
       
    }
   
    handleChange(event) {
        const text = event.target.value;
        this.props.onChange(text);
    }
    render() {
        return (
            <div className="sassy-r">
                <span className="select-sassy-wrapper sassy-arrow right">
                    <select name="per-page" id="per-page" className="sassy-select" onChange={this.handleChange} value={this.props.value}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </span>
                <label className="sassy-label">Items per page</label>
            </div>
        );
    }
}

module.exports = PageItemCountComponent;