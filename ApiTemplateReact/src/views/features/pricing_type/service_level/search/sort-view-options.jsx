'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class SortViewOptionsComponent extends BaseComponent {
    render() {
        return (
            <React.Fragment>
                <option value="nearest">Nearest</option>
                <option value="item_desc">Item-Newest</option>
                <option value="item_asc">Item-Oldest</option>
                <option value="price_asc">Price-Lowest</option>
                <option value="price_desc">Price-Highest</option>
                <option value="rating_desc">Rating-Highest</option>
                <option value="rating_asc">Rating-Lowest</option>
            </React.Fragment>
        );
    }
}

module.exports = SortViewOptionsComponent;