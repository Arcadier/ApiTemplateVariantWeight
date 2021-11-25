'use strict';
const React = require('react');
const SearchComponent = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/header/search');

class HeaderLayoutBottomComponent extends React.Component {
    constructor(props) {
        super(props);

        this.renderCategories = this.renderCategories.bind(this);
    }

    renderCategories() {
        if (this.props.categories != null && Array.isArray(this.props.categories)) {
            var categoryViews = this.props.categories.map(function (item, index) {
                return (
                    <option value={item.ID} key={item.ID}>{item.Name}</option>
                );
            });
            return categoryViews;
        } else {
            return '';
        }
    }

    renderHomepageUrl() {
        if (this.props.homepageUrl) {
            if (this.props.homepageUrl.startsWith('http')) {

                return this.props.homepageUrl;
            }

            return process.env.PROTOCOL + '://' + this.props.homepageUrl;
        }

        return '/';
    }

    render() {
        return (
            <div className="header-bottom">
                <div className="container">
                    <ul className="header-menus">
                        <li className="h-logo">
                            <a href={this.renderHomepageUrl()}>
                                <img src={this.props.logoUrl} />
                            </a>
                        </li>
                        <li className="h-search">
                            <SearchComponent
                                keyword={this.props.keyword}
                                renderCategories={this.renderCategories}
                                searchGooglePlaces={this.props.searchGooglePlaces} />
                        </li>
                        <li className="h-mobi-search mobi-show" onClick={(e) => this.props.searchMobile(e)}>
                            <i className="fa fa-search"></i>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

module.exports = HeaderLayoutBottomComponent;