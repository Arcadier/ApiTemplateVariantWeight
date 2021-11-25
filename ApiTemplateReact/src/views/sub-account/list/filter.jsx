'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class FilterComponent extends BaseComponent {
    applyFilter() {
        this.props.search(null, null, $('#keywords').val().trim());
    }

    render() {
        return (
            <div className="sassy-l">
                <div>
                    <label className="sassy-label">Filter by:</label>
                    <div className="group-search">
                        <div className="group-search-flex">
                            <span className="sassy-search">
                                <input className="form-control" name="keywords" id="keywords" placeholder="Search" defaultValue="" />
                                <input type="button" className="searh-btn" onClick={(e) => this.applyFilter()} />
                            </span>
                            <input type="button" className="btn btn-sassy" defaultValue="Apply" onClick={(e) => this.applyFilter()} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = FilterComponent;