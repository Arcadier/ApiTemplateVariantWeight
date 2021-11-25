'use strict';
const React = require('react');
const SearchFilter = require('../../../../search/filters');
const SearchResultHeader = require('../../../../search/result-header');

class SearchMain extends React.Component {
    constructor(props) {
        super(props)
        this.setCategoryBreadcrumb = this.setCategoryBreadcrumb.bind(this);
        this.renderBreadcrumbTrail = this.renderBreadcrumbTrail.bind(this);
    }
    
    getItemPrices() {
        const self = this;
        let prices = [];
        if (this.props.totalRecords > 0) {
            Array.from(this.props.items).map(function (item, index) {
                item.Price = self.props.userPreferredLocationId && item.ChildItems && item.ChildItems.length > 0 ? item.ChildItems[0].Price : 0;
                prices.push(parseFloat(item.ChildItems && item.ChildItems[0] && item.ChildItems[0].Price ? item.ChildItems[0].Price.toString().replace(/,/g, '') : "0"));
            });
        }

        return prices;
    }

    setCategoryBreadcrumb() {
        if (this.props.selectedCategories) {
            Array.from(this.props.selectedCategories).map(function (category, index) {
                if (category.ParentName == null) {
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width i.fa.fa-angle-right.package-breadcrum-text').addClass('hide');
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width p.active.package-breadcrum-text').addClass('hide');
                }
                else {
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width i.fa.fa-angle-right.package-breadcrum-text').removeClass('hide');
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width p.active.package-breadcrum-text').removeClass('hide');
                    $('.sc-u.sc-u-top.h-parent-child-txt.full-width p.active.package-breadcrum-text').text(category.ParentName);
                }
            });
        }
    }

    renderBreadcrumbTrail() {
        return (
            <React.Fragment>
                <p><a href="/">Home</a></p>
                <i className="fa fa-angle-right" />
                <p className="active">Search</p>
                <i className="fa fa-angle-right package-breadcrum-text hide"></i>
                <p className="active package-breadcrum-text hide"></p>
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
                    searchByFilters={this.props.searchByFilters}
                    searchByCategory={this.props.searchByCategory}
                    totalRecords={this.props.totalRecords}
                    itemPrices={this.getItemPrices()}
                    selectedCategories={this.props.selectedCategories}
                    customFilters={this.props.customFilters}
                    user={this.props.user}
                    currencyCode={this.props.currencyCode}
				/>
				<div className="search-container">
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
                            renderBreadcrumbTrail={this.renderBreadcrumbTrail}
                        />
                        {this.props.renderResult}
                    </div>
                </div>
			</React.Fragment>
		)
	}
}

module.exports = SearchMain;