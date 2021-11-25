'use strict';
const React = require('React');
const BaseComponent = require('../shared/base');

class SearchCategoryComponent extends BaseComponent {
    onKeyDown(e) {
        if (e.keyCode == 13) {
            this.gotoSearch(e);
        }
    }

    gotoSearch(event) {
        const keyword = $('.h-search-bar input').val();
        let categories = $('.h-search-bar select').val();
        if (categories === "All Categories") {
            categories = "";
        }

        window.location.href = '/search?keywords=' + encodeURIComponent(keyword) + "&categories=" + categories;
    }

    render() {
        return (
            <div className="h-search-bar">
                <div className="h-search-input">
                    <input type="text"
                        placeholder="Search..."
                        defaultValue={this.props.keyword}
                        onKeyDown={(e) => this.onKeyDown(e)} />
                    <i className="fa fa-search" onClick={(e) => this.gotoSearch(e)} />
                </div>
                <div className="h-search-category">
                    <select>
                        <option value="All Categories">All Categories</option>
                        {this.props.renderCategories()}
                    </select>
                    <i className="fa fa-angle-down" />
                </div>
            </div>
        );
    }
}

module.exports = SearchCategoryComponent;