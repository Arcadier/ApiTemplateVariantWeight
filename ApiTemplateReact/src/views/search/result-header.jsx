'use strict';
const React = require('react');
const SortViewOptions = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/search/sort-view-options');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class SearchResultHeaderComponent extends React.Component {
    componentDidMount() {
        this.setSelectedCategory();
        this.props.setCategoryBreadcrumb();
    }

    componentDidUpdate() {
        this.setSelectedCategory();
        this.props.setCategoryBreadcrumb();
        this.handleResultDisplay();
    }

    handleBack(e) {
        e.stopPropagation();
    }

    renderParentCategories() {
        const self = this;
        return (
            Array.from(self.props.categories).map(function (category, index) {
                if (category.ChildCategories.length > 0) {
                    return (
                        <li key={category.ID}>
                            <div>
                                <a href="#" data-id={category.ID} className="category-anchor-trigger root-category" onClick={() => self.searchByCategory(category.ID)}>{category.Name}</a>
                                <ul className="st-subcat hide-me">
                                    <li className="back" data-id={category.ID}>
                                        <div>
                                            <i className="fa fa-angle-left" onClick={(e) => self.handleBack(e)}/>
                                            <a href="#"> All of {category.Name}</a>
                                        </div>
                                    </li>
                                    {self.renderChildCategories(category, category.ChildCategories)}
                                </ul>
                            </div>
                        </li>
                    );
                }
                else {
                    return (
                        <li key={category.ID}>
                            <div>
                                <a href="#" className="root-category" data-id={category.ID} onClick={() => self.searchByCategory(category.ID)}>{category.Name}</a>
                            </div>
                        </li>
                    );
                }
            }));
    }

    renderChildCategories(parentCategory, childCategories) {
        const self = this;
        return (
            Array.from(childCategories).map(function (category, index) {
                if (category.ChildCategories.length > 0) {
                    return (
                        <li key={category.ID}>
                            <div>
                                <a href="#" data-id={category.ID} root-category-id={parentCategory.ID} root-category-name={parentCategory.Name} className="category-anchor-trigger" onClick={() => self.searchByCategory(category.ID)}>{category.Name}</a>
                                <ul className="st-subcat hide-me">
                                    <li className="back" data-id={category.ID}>
                                        <div>
                                            <i className="fa fa-angle-left" />
                                            <a href="#">All of Parent {category.Name}</a>
                                        </div>
                                    </li>
                                    {self.renderChildCategories(parentCategory, category.ChildCategories)}
                                </ul>
                            </div>
                        </li>
                    );
                }
                else {
                    return (
                        <li key={category.ID}>
                            <div>
                                <a href="#" className="category-anchor-trigger" data-id={category.ID} root-category-id={parentCategory.ID} root-category-name={parentCategory.Name} onClick={() => self.searchByCategory(category.ID)}>{category.Name}</a>
                            </div>
                        </li>
                    );
                }
            }));
    }

    setSelectedCategory() {
        if (this.props.selectedCategories) {
            Array.from(this.props.selectedCategories).map(function (category, index) {
                let categoryId = category.ID;
                if (category.ParentId) {
                    categoryId = category.ParentId;
                }
                $('.header-menus .h-search-category select').val(categoryId);

                $('.root-category[data-id="' + category.ID + '"]').each(function (index, item) {
                    var self = $(this).first();
                    self.parent().closest('li').addClass('selected');
                });

                $('.back[data-id="' + category.ID + '"]').each(function (index, item) {
                    $(this).addClass('selected');
                });

                $('ul.st-subcat').each(function (index, item) {
                    var self = $(this);
                    if (self.find('li.selected').length > 1) {
                        self.find('li.selected').first().removeClass('selected');
                    }
                });
            });
        }
    }

    toggleCategory() {
        $(".h-st-menus").slideToggle();
        $(".h-dd-menu").hide();
    }

    searchByCategory(categoryId) {
        const self = this;
        let categories = null;
        $('a[data-id="' + categoryId + '"]').each(function (index, item) {
            var self = $(this).first();
            categories = [];
            if (self.hasClass('root-category')) {
                categories.push({
                    ID: categoryId,
                    Name: self.text(),
                    ParentId: null,
                    ParentName: null
                });
            }
            else {
                categories.push({
                    ID: categoryId,
                    Name: self.text(),
                    ParentId: self.attr('root-category-id'),
                    ParentName: self.attr('root-category-name')
                });
            }
        });

        self.props.searchByCategory(categories);
    }

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

    render() {
        var self = this;

        return (
            <div className="sc-upper">
                <div className="sc-u sc-u-top h-parent-child-txt full-width">
                    <div className="search-tog">
                        <div className="h-search-toggle">
                            <div className="h-toggle-menu" id="slideToggleCat" onClick={() => self.toggleCategory()}>
                                <i className="fa fa-bars" />
                            </div>
                        </div>
                        <div className="h-st-menus hide-me">
                            <ul className="st-parent">
                                {self.renderParentCategories()}
                            </ul>
                        </div>
                    </div>
                    {this.props.renderBreadcrumbTrail()}
                </div>
                <div className="sc-u sc-u-mid full-width">
                    <div className="pull-left">
                        <span className="sc-text-big">{this.props.breadcrumbText === '' ? 'Search' : this.props.breadcrumbText}</span>
                    </div>
                    <div className="pull-right">
                        <div className="sc-right-text">
                            <span>
                                <span className="count">{this.props.totalRecords} </span>
                                items found
                           </span>
                        </div>
                        <div className="sc-right-text">
                            <span className="sc-divider" />
                        </div>
                        <div className="sc-right-text">
                            <span>Sort by:</span>
                            <div className="sc-option">
                                <select onChange={(e) => this.props.sortResult(e.target.value)}>
                                    <SortViewOptions />
                                </select>
                                <i className="fa fa-angle-down" />
                                <i className="fa fa-angle-up hide" />
                            </div>
                            <div className="sc-bahavior">
                                <div className="behavior-group" onClick={() => this.props.changeResultDisplay('group')}><span /><span /><span /><span /></div>
                                <div className="behavior-list active" onClick={() => this.props.changeResultDisplay('list')}><span /><span /><span /><span /></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sc-u sc-u-bot full-width hide">
                    <ul className="category-middle-menu">
                    </ul>
                </div>
            </div>
        );
    }
}

module.exports = SearchResultHeaderComponent;