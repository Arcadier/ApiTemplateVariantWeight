'use strict';
const React = require('react');
const SearchFilter = require('../../../../search/filters');
const SearchResultHeader = require('../../../../search/result-header');
const MapComponent = require('./map');

class SearchMain extends React.Component {
    constructor(props) {
        super(props)
        this.setCategoryBreadcrumb = this.setCategoryBreadcrumb.bind(this);
        this.renderBreadcrumbTrail = this.renderBreadcrumbTrail.bind(this);
    }

    componentDidMount() {
        const { selectedCategories, keywords, location, startTimestamp, endTimestamp, userLatitude, userLongitude, isAllDates } = this.props; 

        if (!userLatitude || !userLongitude) {
            if (navigator.geolocation) {
                const options = {
                    maximumAge: 0,
                    timeout: 5000,
                    enableHighAccuracy: true
                };

                navigator.geolocation.getCurrentPosition((pos) => {
                    sessionStorage.setItem('userLatitude', pos.coords.latitude);
                    sessionStorage.setItem('userLongitude', pos.coords.longitude);

                    const urlParams = new URLSearchParams(window.location.search);
                    let params = [];

                    if (urlParams.has('keywords')) {
                        params.push(`keywords=${encodeURIComponent(keywords)}`);
                    }
                    if (urlParams.has('categories')) {
                        const categoryIds = [];

                        Array.from(selectedCategories).map(function (category, index) {
                            categoryIds.push(category.ID);

                            if (category.ParentId)
                                categoryIds.push(category.ParentId);
                        });

                        params.push(`categories=${categoryIds}`);
                    }
                    if (urlParams.has('location')) {
                        params.push(`location=${encodeURIComponent(location)}`);
                    }
                    if (urlParams.has('startTimestamp')) {
                        params.push(`startTimestamp=${startTimestamp}`);
                    }
                    if (urlParams.has('endTimestamp')) {
                        params.push(`endTimestamp=${endTimestamp}`);
                    }
                    if (urlParams.has('isAllDates')) {
                        params.push(`isAllDates=${isAllDates}`);
                    }

                    params.push(`userLatitude=${pos.coords.latitude}`);
                    params.push(`userLongitude=${pos.coords.longitude}`);

                    window.location.href = '/search?' + params.join('&');
                }, () => {
                    sessionStorage.setItem('userLatitude', null);
                    sessionStorage.setItem('userLongitude', null);
                }, options);
            }
        }
    }

    getItemPrices() {
        return this.props.items.map(i => i.Price);
    }

    setCategoryBreadcrumb() {
        if (this.props.selectedCategories) {
            Array.from(this.props.selectedCategories).map(function (category, index) {
                if (category.ParentName == null) {
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width i.fa.fa-angle-right.package-breadcrum-text').addClass('hide');
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width p.active.package-breadcrum-text').addClass('hide');
                } else {
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width i.fa.fa-angle-right.package-breadcrum-text').removeClass('hide');
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width p.active.package-breadcrum-text').removeClass('hide');
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width p.active.package-breadcrum-text').text(category.ParentName);
                }
            });
        }
    }

    renderBreadcrumbTrail() {
        let breadcrumbVal = '';
        if (this.props.keywords && this.props.keywords !== '' && this.props.keywords.length > 0) {
            breadcrumbVal = this.props.keywords;
        } else {
            if (this.props.selectedCategories && this.props.selectedCategories[0].ParentName == null) {
                breadcrumbVal = this.props.selectedCategories[0].Name;
            } else breadcrumbVal = 'Search'
        }
        return (
            <React.Fragment>
                <p><a href="/">Home</a></p>
                <i className="fa fa-angle-right" />
                <p className="active">{breadcrumbVal}</p>
                <i className="fa fa-angle-right package-breadcrum-text hide"></i>
                <p className="active package-breadcrum-text hide"></p>
                <MapComponent currencyCode={this.props.currencyCode}
                    items={this.props.items} />
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <SearchFilter
                    categories={this.props.categories}
                    manimumPrice={0}
                    maximumPrice={0}
                    priceRange={this.props.priceRange}
                    searchByFilters={this.props.searchByFilters}
                    searchByCategory={this.props.searchByCategory}
                    totalRecords={this.props.totalRecords}
                    itemPrices={this.getItemPrices()}
                    selectedCategories={this.props.selectedCategories}
                    customFilters={this.props.customFilters}
                    user={this.props.user}
                    currencyCode={this.props.currencyCode} />
                <div className="search-container map-active open-sidebar">
                    <div className="container">
                        <SearchResultHeader totalRecords={this.props.totalRecords}
                            resultDisplayBehavior={this.props.resultDisplayBehavior}
                            sortResult={this.props.sortResult}
                            changeResultDisplay={this.props.changeResultDisplay}
                            categories={this.props.categories}
                            searchByCategory={this.props.searchByCategory}
                            breadcrumbText={this.props.breadcrumbText}
                            selectedCategories={this.props.selectedCategories}
                            setCategoryBreadcrumb={this.setCategoryBreadcrumb}
                            renderBreadcrumbTrail={this.renderBreadcrumbTrail} />
                        {this.props.renderResult}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = SearchMain;