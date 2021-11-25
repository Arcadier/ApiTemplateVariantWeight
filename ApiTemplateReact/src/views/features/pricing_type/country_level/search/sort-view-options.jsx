'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

class SortViewOptionsComponent extends React.Component {
    render() {
        return (
            <React.Fragment>
                <option value="item_desc">Item-Newest</option>
                <option value="item_asc">Item-Oldest</option>
                <option value="price_asc">Price-Lowest</option>
                <option value="price_desc">Price-Highest</option>
                <option value="name_asc">Name-Ascending</option>
                <option value="name_desc">Name-Descending</option>
            </React.Fragment>
        );
    }
}

module.exports = SortViewOptionsComponent;