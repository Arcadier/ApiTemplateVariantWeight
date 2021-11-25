'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

class SortViewOptionsComponent extends React.Component {

    handleResultDisplay() {
        const { resultDisplayBehavior } = this.props;
        if (resultDisplayBehavior === 'group') {
            $("#items-list").removeClass("behavior2");
            $("#items-list").addClass("behavior1");
            $(".behavior-list").removeClass("active");
            $(".behavior-group").addClass("active");
        }
        else {
            $("#items-list").addClass("behavior2");
            $("#items-list").removeClass("behavior1");
            $(".behavior-group").removeClass("active");
            $(".behavior-list").addClass("active");
        }

    }


    componentDidUpdate() {
        this.handleResultDisplay();
    }

    render() {
        return (
            <div className="sc-right-text">
                <span>Sort by:</span>
                <div className="sc-option">
                    <select onChange={(e) => this.props.sortResult(e.target.value)}>
                        <option value="item_desc">Item-Newest</option>
                        <option value="item_asc">Item-Oldest</option>
                        <option value="price_asc">Price-Lowest</option>
                        <option value="price_desc">Price-Highest</option>
                        <option value="name_asc">Name-Ascending</option>
                        <option value="name_desc">Name-Descending</option>
                        <option value="rating_desc">Rating-Highest</option>
                        <option value="rating_asc">Rating-Lowest</option>
                    </select>
                    <i className="fa fa-angle-down" />
                    <i className="fa fa-angle-up hide" />
                </div>
                <div className="sc-bahavior">
                    <div className="behavior-group" onClick={() => this.props.changeResultDisplay('group')}><span /><span /><span /><span /></div>
                    <div className="behavior-list active" onClick={() => this.props.changeResultDisplay('list')}><span /><span /><span /><span /></div>
                </div>
            </div>
        );
    }
}

module.exports = SortViewOptionsComponent;