'use strict';
var React = require('react');

class CategoriesHomeComponent extends React.Component {
    renderCategories() {
        var self = this;
        var loadCategories = (self.props.collapsableCategories === 'true'
            && self.props.numberOfCategories === 4) ? 4 : self.props.numberOfCategories;
        var categoryViews = self.props.categories.slice(0, loadCategories).map(function (item, index) {
            const mediaUrl = item.Media != null ? item.Media[0].MediaUrl : '';
            return (
                <div className="col-md-3 col-sm-6 col-xs-12 xs-mb-15" key={item.ID}>
                    <a href={"/search?categories=" + item.ID} className="category-box">
                        <div className="img-box">
                            <div className="background-image-holder" style={{ background: 'rgba(0, 0, 0, 0) url("' + mediaUrl + '") repeat scroll 0% 0%' }}>
                                <img src={mediaUrl} alt={item.Name} title={item.Name} style={{ display: 'none', maxHeight: 160 + 'px' }} />
                            </div>
                        </div>
                        <h4 className="category-name">{item.Name}</h4>
                    </a>
                </div>);
        });
        return categoryViews;
    }

    renderToggleViewMore() {
        var self = this;
        if (self.props.collapsableCategories === 'true') {
            if (self.props.numberOfCategories == self.props.categories.length && self.props.categories.length > 4) {
                return (<div className="vew-more-btn text-center">
                    <div className="more-btn" id="viewMoreCat" onClick={(e) => self.props.loadLess()}>View Less</div>
                </div>)
            } else {
                return (<div className="vew-more-btn text-center">
                    <div className="more-btn" id="viewMoreCat" onClick={(e) => self.props.loadMore()}>View More</div>
                </div>)
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="section-title">
                    <h3>Categories</h3>
                    <div className="divider"></div>
                </div>
                <div className="section-category-list">
                    {this.renderCategories()}
                    {this.renderToggleViewMore()}
                </div>
            </React.Fragment>
        );
    }
}

module.exports = {
    CategoriesHomeComponent
}