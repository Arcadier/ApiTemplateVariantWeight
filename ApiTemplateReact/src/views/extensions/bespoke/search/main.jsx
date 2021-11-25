'use strict';
const React = require('react');
const SearchFilter = require('../../../search/filters');
const SearchResultHeader = require('../../../search/result-header');

class SearchMain extends React.Component {
    constructor(props) {
        super(props)
        this.setCategoryBreadcrumb = this.setCategoryBreadcrumb.bind(this);
        this.renderBreadcrumbTrail = this.renderBreadcrumbTrail.bind(this);
    }
	getItemPrices() {
        return this.props.items.map(i => i.Price);
    }
    /* 
        empty keyword + specific cat = specific cat
        empty keyword + all cat = search
        keyword + specific or all cat = keyword
        empty keyword + child cat = home > search > parent cat
        if keyword has value -> crumb value must be the keyword
    */
    setCategoryBreadcrumb() {
        if (this.props.selectedCategories && (this.props.keywords === '' || this.props.keywords === null)) {
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
        let breadcrumbVal = '';
        if (this.props.keywords && this.props.keywords !== '' && this.props.keywords.length > 0)  {
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
                    customFields={{}}
                    priceRange={this.props.priceRange}
                    searchByFilters={this.props.searchByFilters}
                    searchByCategory={this.props.searchByCategory}
                    totalRecords={this.props.totalRecords}
                    itemPrices={this.getItemPrices()}
                    selectedCategories={this.props.selectedCategories}
                    customFilters={this.props.customFilters}
                    user={this.props.user}
                    currencyCode={this.props.currencyCode}
				/>
				<div className="search-container open-sidebar">
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