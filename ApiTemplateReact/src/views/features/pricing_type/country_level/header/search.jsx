'use strict';
const React = require('React');
const BaseComponent = require('../../../../shared/base');
const SearchCategoryComponent = require('../../../../layouts/search-category');

class SearchComponent extends BaseComponent {
    render() {
        return <SearchCategoryComponent {...this.props} />
    }
}

module.exports = SearchComponent;