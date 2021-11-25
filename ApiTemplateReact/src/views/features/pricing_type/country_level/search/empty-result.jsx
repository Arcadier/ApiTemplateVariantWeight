'use strict';
var React = require('react');

class EmptySearchResultComponent extends React.Component {
    render() {
        return (
            <div className="item-no-result-msg">
                <div className="no-result-red">Sorry!</div>
                <img src="/assets/images/no_result.svg" />
                <div className="no-result-text">
                    <span>Seems like no matches were found. Try searching new terms.</span>
                </div>
                <div className="clearfix" />
            </div>
        );
    }
}

module.exports = EmptySearchResultComponent;