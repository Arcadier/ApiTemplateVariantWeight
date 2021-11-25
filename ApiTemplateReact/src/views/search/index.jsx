'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var FooterLayout = require('../layouts/footer').FooterLayoutComponent;
var HeaderLayout = require('../../views/layouts/header').HeaderLayoutComponent;
var Pagination = require('../../views/common/pagination');
var SearchItemView = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/search/item-view');
var SearchMain = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/search/main');
var EmptyResult = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/search/empty-result');
var BaseComponent = require('../../views/shared/base');
var SearchActions = require('../../redux/searchActions');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class SearchComponent extends BaseComponent {
    renderResult() {
        if (parseInt(this.props.totalRecords) > 0) {
            return (
                <div className="sc-bottom">
                    <SearchItemView user={this.props.user}
                        userPreferredLocationId={this.props.userPreferredLocationId}
                        items={this.props.items}
                        reviewAndRating={this.props.reviewAndRating} />
                    <Pagination totalRecords={this.props.totalRecords}
                        pageNumber={this.props.pageNumber}
                        pageSize={this.props.pageSize}
                        filters={{}}
                        goToPage={this.props.goToPage}
                    />
                </div>
            );
        } else {
            return (
                <div className="sc-bottom">
                    <EmptyResult
                        searchSuggestedItems={this.props.searchSuggestedItems}/>
                </div>
            );
        }
    }

    setupPage() {
        //$(".h-dd-menu, .h-search-toggle ").on("click", function (event) {
        //    event.stopPropagation();
        //});

        $("ul.st-parent li").each(function () {
            var $this = $(this);
            $this.find('a').click(function () {
                $(this).siblings('.st-subcat').show();
            });
            if ($this.hasClass("back")) {
                $(this).find("i").click(function () {
                    $(this).closest(".st-subcat").hide();
                });
            }
        });

        //$('li.h-mobi-search').click(function () {
        //    $(".header-bottom ul.header-menus > li.h-search").toggle();
        //});

        var highest = -Infinity;
        $(".fsc-categories ul.st-subcat").each(function () {
            var $this = $(this);
            highest = Math.max(highest, $(">li", this).length);
        })
        var $newHeight = 26 * highest;
        $(".fsc-categories .fsc-ul-cat > ul.st-parent").css("min-height", $newHeight + "px");

        var $headerHeight = $(".header").innerHeight();
        $(".main").css("padding-top", $headerHeight + "px");
        var $hheaderHeight = $(".header").innerHeight() - 30;
        $(".page-home .main").css("padding-top", $hheaderHeight + "px");

        if ($(window).width() <= 768) {
            if ($("body").hasClass("page-search")) {
                // $(".fixed-sidebar").removeClass("open");
                // $(".search-container").removeClass("open-sidebar");
            }
        }

        $(".fsc-ul-cat ul").each(function () {
            var $this = $(this);
            var $li = $(">li", this);
            $li.on("click", function () {
                $($li, ".selected").removeClass("selected");
                $(this).addClass("selected");
            });
        });
    }

    componentDidMount() {
        this.setupPage();
    }

    componentDidUpdate() {
        this.setupPage();
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main" style={{ "paddingTop": "120px" }}>
                     <SearchMain 
                        items={this.props.items}
                        totalRecords={this.props.totalRecords}
                        priceRange={this.props.priceRange}
                        categories={this.props.categories}
                        manimumPrice={0}
                        maximumPrice={0}
                        currencyCode={this.props.currencyCode}
                        searchByFilters={this.props.searchByFilters}
                        searchByCategory={this.props.searchByCategory}
                        selectedCategories={this.props.selectedCategories}
                        customFilters={this.props.customFilters}
                        user={this.props.user}
                        userPreferredLocationId={this.props.userPreferredLocationId}
                        breadcrumbText={this.props.breadcrumbText}
                        resultDisplayBehavior={this.props.resultDisplayBehavior}
                        sortResult={this.props.sortResult}
                        changeResultDisplay={this.props.changeResultDisplay}
                        renderResult={this.renderResult()}
                        keywords={this.props.keywords}
                        location={this.props.location}
                        startTimestamp={this.props.startTimestamp}
                        endTimestamp={this.props.endTimestamp}
                        userLatitude={this.props.userLatitude}
                        userLongitude={this.props.userLongitude}
                        isAllDates={this.props.isAllDates}
                    />
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        userPreferredLocationId: state.userReducer.userPreferredLocationId,
        items: state.searchReducer.items,
        totalRecords: state.searchReducer.totalRecords,
        pageNumber: state.searchReducer.pageNumber,
        pageSize: state.searchReducer.pageSize,
        priceRange: state.searchReducer.priceRange,
        resultDisplayBehavior: state.searchReducer.resultDisplayBehavior,
        categories: state.categoryReducer.categories,
        breadcrumbText: state.searchReducer.breadcrumbText,
        selectedCategories: state.searchReducer.selectedCategories,
        customFilters: state.searchReducer.customFilters,
        currencyCode: state.searchReducer.currencyCode,
        keywords: state.searchReducer.keywords,
        reviewAndRating: state.searchReducer.reviewAndRating,
        location: state.searchReducer.location,
        startTimestamp: state.searchReducer.startTimestamp,
        endTimestamp: state.searchReducer.endTimestamp,
        userLatitude: state.searchReducer.userLatitude,
        userLongitude: state.searchReducer.userLongitude,
        isAllDates: state.searchReducer.isAllDates
    };
}

function mapDispatchToProps(dispatch) {
    return {
        goToPage: (pageNumber, filters) => dispatch(SearchActions.goToPage(pageNumber, filters)),
        sortResult: (sort) => dispatch(SearchActions.sortResult(sort)),
        changeResultDisplay: (resultDisplayBehavior) => dispatch(SearchActions.changeResultDisplay(resultDisplayBehavior)),
        searchByCategory: (categories) => dispatch(SearchActions.searchByCategory(categories)),
        searchByFilters: (filters) => dispatch(SearchActions.searchByFilters(filters)),
        searchSuggestedItems: (lat, lng, callback) => dispatch(SearchActions.searchSuggestedItems(lat, lng, callback))
    };
}

const SearchComponentHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchComponent);

module.exports = {
    SearchComponentHome,
    SearchComponent
};