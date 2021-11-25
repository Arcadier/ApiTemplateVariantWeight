'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class FilterComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.applyFilter = this.applyFilter.bind(this);
        this.state = { keyword: this.props.keyword };
    }

    applyFilter() {
        this.props.searchUserGroups({ keyword: this.state.keyword, pageNumber: 1 });
    }

    handlePageSizeChange(e) {
        this.props.searchUserGroups({ pageSize: parseInt(e.target.value) });
    }

    render() {
        return (
            <div className="sassy-filter lg-filter">
                <div className="sassy-flex">
                    <div className="sassy-l grey_filter">
                        <div>
                            <div className="group-search">
                                <div className="group-search-flex">
                                    <label htmlFor="" className="sassy-label">Filter by:</label>
                                    <span className="sassy-search">                                                    
                                        <input 
                                            className="form-control"
                                            name="keywords"
                                            id="keywords"
                                            placeholder="Search"
                                            value={this.state.keyword}
                                            onChange={(e) => this.setState({ keyword: e.target.value })}
                                        />
                                        <input type="submit" className="searh-btn" onClick={this.applyFilter}/>
                                    </span>
                                    <input type="submit" className="btn btn-sassy" value="Apply" onClick={this.applyFilter} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sassy-r desktop-only"> 
                        <span className="select-sassy-wrapper sassy-arrow">                                        
                            <select
                                name="per-page"
                                id="per-page"
                                className="sassy-select"
                                value={`${this.props.userGroups && this.props.userGroups.PageSize}`}
                                onChange={(e) => this.handlePageSizeChange(e)}
                            >                                            
                                <option value="10">10</option>                                            
                                <option value="20">20</option>                                            
                                <option value="50">50</option>                                            
                                <option value="100">100</option>                                        
                            </select>                                    
                        </span>
                        <label htmlFor="" className="sassy-label">Items per page</label>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = FilterComponent;