'use strict';
var React = require('react');
var BaseComponent = require('../shared/base');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class SearchFilterComponent extends BaseComponent {
    componentDidMount() {
        if (typeof window !== 'undefined') {
            if ($(window).width() > 767) {
                $(window).on("scroll", function () {
                    var $getHeightFooter = $(".footer").innerHeight();
                    var $getHeightHeader = $(".header").innerHeight();
                    var $totalHeight = $getHeightFooter + $getHeightHeader;

                    var scrollHeight = $(document).height();
                    var scrollPosition = $(window).height() + $(window).scrollTop();
                    if ((scrollHeight - scrollPosition) / scrollHeight <= 0.001) {
                        $(".fsc-container.fsc-buttons").css("padding-bottom", "30px");
                        $(".fixed-sidebar .fs-scroll").addClass("bottom-scroll");
                        $(".fixed-sidebar .fs-scroll").css("bottom", $totalHeight + "px");
                        $(".fixed-sidebar .fs-scroll").css("position", "absolute");
                        $(".fixed-sidebar .fs-scroll > .fsc-container:first-child()").css("margin-top", $totalHeight + "px");
                    }
                    else {
                        $(".fsc-container.fsc-buttons").css("padding-top", "30px");
                        $(".fsc-container.fsc-buttons").css("padding-bottom", "135px");
                        $(".fixed-sidebar .fs-scroll").removeClass("bottom-scroll");
                        $(".fixed-sidebar .fs-scroll").css("bottom", "auto");
                        $(".fixed-sidebar .fs-scroll").css("position", "relative");
                        $(".fixed-sidebar .fs-scroll > .fsc-container:first-child()").css("margin-top", "auto");
                    }
                });
            }
        }

        var $filterWidth = $(".fs-content").innerWidth();
        $(".fs-content").css("margin-left", -$filterWidth + "px");

        $('.fs-btn-slide').on('click', function () {
            if ($(".fixed-sidebar").hasClass("open")) {
                $(".fs-content").animate({ left: "0" }, "slow");
                $('.fs-btn-slide').animate({ left: "0" }, "slow");
                $(".open-sidebar").css("margin-left", "0");
                $(".search-container").removeClass("open-sidebar");
                $(".fs-btn-slide .fa-angle-up").addClass("hide");
                $(".fs-btn-slide .fa-angle-down").removeClass("hide");
                $(".fixed-sidebar").removeClass("open");
            }
            else if (!$(".fixed-sidebar").hasClass("open")) {
                $(".fs-content").animate({ left: $filterWidth + "px" }, "slow");
                $('.fs-btn-slide').animate({ left: $filterWidth + "px" }, "slow");
                $(".search-container").addClass("open-sidebar");
                $(".open-sidebar").css("margin-left", $filterWidth + "px");
                $(".fs-btn-slide .fa-angle-up").removeClass("hide");
                $(".fs-btn-slide .fa-angle-down").addClass("hide");
                $(".fixed-sidebar").addClass("open");
            }
        });

        if (this.props.totalRecords === 0) {
            $(".fs-content").animate({ left: "0" }, "slow");
            $('.fs-btn-slide').animate({ left: "0" }, "slow");
            $(".open-sidebar").css("margin-left", "0");
            $(".search-container").removeClass("open-sidebar");
            $(".fs-btn-slide .fa-angle-up").addClass("hide");
            $(".fs-btn-slide .fa-angle-down").removeClass("hide");
            $(".fixed-sidebar").removeClass("open");
        }

        $(".fs-content").niceScroll({
            cursorcolor: "#b3b3b3 ",
            cursorwidth: "6px",
            cursorborderradius: "5px",
            cursorborder: "1px solid transparent",
            touchbehavior: true,
            preventmultitouchscrolling: true,
            enablekeyboard: true
        });

        $('.fs-scroll').niceScroll({
            cursorcolor: "#b3b3b3",
            zindex: "99999999",
            cursorwidth: "6px",
            cursorborderradius: "5px",
            cursorborder: "1px solid transparent",
            touchbehavior: true
        });


        var range_slider = $('.item-range').slider({
            precision: 2,
            range: true
        });
        range_slider.on("slide", function (slideEvt) {
            var i = slideEvt.value;
            var start = i[0];
            var end = i[1];
            $("#start").text(start);
            $("#end").text(end);
        });

        this.setupPriceSlider();
        this.setSelectedCategory();
    }

    componentDidUpdate() {
        this.setSelectedCategory();
        this.setupPriceSlider();
    }

    setupPriceSlider() {
        let price = this.getMinMaxPrice();

        $('.item-range').slider({
            min: price.Minimum,
            max: price.Maximum,
            value: [price.Minimum, price.Maximum]
        });

        $('.item-range').slider('refresh');
       
        $('.filter-price-label').html(this.formatMoney(this.props.currencyCode) + ' ');
        $('.start-range').html(price.Minimum);
        $('.end-range').html(price.Maximum);
    }

    getMinMaxPrice() {
        if (this.props.priceRange) {
            return { ...this.props.priceRange };
        }
        let prices = this.props.itemPrices;
        if (prices.length === 0) {
            prices.push(0);
        }

        const minPrice = Math.min.apply(null, prices);
        const maxPrice = Math.max.apply(null, prices);

        return {
            Minimum: minPrice,
            Maximum: maxPrice
        };
    }

    getCustomFields(categoryIds, callback) {
        if (categoryIds && categoryIds.length > 0) {
            $.ajax({
                url: '/search/customfields',
                type: 'post',
                data: { categoryids: categoryIds },
                success: function (customfields) {
                    callback(customfields);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
        }
    }

    setSelectedCategory() {
        if (this.props.selectedCategories) {
            $('.fsc-ul-cat ul').each(function (index, item) {
                var self = $(this);
                if (self.find('li.selected').length > 0) {
                    self.find('li.selected').first().removeClass('selected');
                }
            });

            Array.from(this.props.selectedCategories).map(function (category, index) {
                $('.category-anchor-trigger[data-id="' + category.ID + '"]').each(function (index, item) {
                    var self = $(this).first();
                    self.parent().closest('li').addClass('selected');
                    self.siblings('.st-subcat').show();
                    self.siblings('.st-subcat').css("opacity", "1");
                });

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
                    } else if (self.parents('.selected').length == 0 && self.find('li').hasClass('selected') == false) {
                        self.hide();
                    }
                });

                
            });
        }

        $('.st-parent li').click(function(e) {
            $('.st-parent li').removeClass('selected');
            var $this = $(this);
            if (!$this.hasClass('selected')) {
                $this.addClass('selected');
            };
            e.preventDefault();
        });
    }

    renderParentCategories() {
        const self = this;
        return (
            Array.from(self.props.categories).map(function (category, index) {
                if (category.ChildCategories.length > 0) {
                    return (
                        <li key={category.ID}>
                            <div className="parent-category" data-id={category.ID}>
                                <a href="#" data-id={category.ID} className="category-anchor-trigger root-category" onClick={() => self.searchByCategory(category.ID)}>{category.Name}</a>
                                <ul className="st-subcat hide-me">
                                    <li className="back">
                                        <div>
                                            <i className="fa fa-angle-left" />
                                            <a href="#"> All of {category.Name}</a>
                                        </div>
                                    </li>
                                    {self.renderChildCategories(category, category.ChildCategories)}
                                </ul>
                            </div>
                        </li>
                    );
                } else {
                    return (
                        <li key={category.ID}>
                            <div className="parent-category" data-id={category.ID}>
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
                            <div className="parent-category" data-id={category.ID}>
                                <a href="#" data-id={category.ID} root-category-id={parentCategory.ID} root-category-name={parentCategory.Name} className="category-anchor-trigger" onClick={() => self.searchByCategory(category.ID)}>{category.Name}</a>
                                <ul className="st-subcat hide-me">
                                    <li className="back">
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
                } else {
                    return (
                        <li key={category.ID}>
                            <div className="parent-category" data-id={category.ID}>
                                <a href="#" className="category-anchor-trigger" data-id={category.ID} root-category-id={parentCategory.ID} root-category-name={parentCategory.Name} onClick={() => self.searchByCategory(category.ID)}>{category.Name}</a>
                            </div>
                        </li>
                    );
                }
            }));
    }

    renderCustomFields() {
        if (this.props.customFilters && this.props.customFilters.length > 0) {
            return (
                Array.from(this.props.customFilters).map(function (customField, index) {
                    return (
                        <div className="fsc-container" key={customField.Code}>
                            <div className="fsc-field">
                                <span className="title">{customField.Name}</span>
                                <div className="fsc-filter-checkbox full-width">
                                    {Array.from(customField.Options).map(function (option, optIndex) {
                                        return (
                                            <span className="fancy-checkbox full-width" key={'option' + optIndex}>
                                                <input type="checkbox" id={customField.Code + "_option_" + optIndex} name={customField.Code + "_custom-options[]"} className="custom-values-checkbox" data-id={customField.Code} data-name={option.Name}/>
                                                <label htmlFor={customField.Code + "_option_" + optIndex}>{option.Name}</label>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                }));
        }
    }

    resetFilters() {
        const selectedCustomFieldOptions = $('.custom-values-checkbox:checked');
        Array.from(selectedCustomFieldOptions).map(function (option, index) {
            $(option).prop('checked', false);
        });

        const filters = {
            minimumPrice: null,
            maximumPrice: null,
            customfields: null,
            customValues: null,
        };

        this.props.searchByFilters(filters);
    }

    applyFilters() {

        let customFields = $('.custom-values-checkbox:checked').map(function () {
            return $(this).attr('data-id');
        }).get();
        let customValues = $('.custom-values-checkbox:checked').map(function () {
            return { code: $(this).attr('data-id'), value: $(this).attr('data-name') };
        }).get();

        let minimumPrice = parseFloat($('.slider-handle.min-slider-handle.round').attr('aria-valuenow'));
        let maximumPrice = parseFloat($('.slider-handle.max-slider-handle.round').attr('aria-valuenow'));

        const filters = {
            minimumPrice: minimumPrice === 0 && maximumPrice === 0 ? null : minimumPrice,
            maximumPrice: minimumPrice === 0 && maximumPrice === 0 ? null : maximumPrice,
            customfields: customFields.length > 0 ? customFields : null,
            customValues: customValues.length > 0 ? customValues : null,
            sellerId: this.props.user ? this.props.user.ID : null
        };

        this.props.searchByFilters(filters);
    }

    searchByCategory(categoryId) {
        const self = this;
        let categories = [];

        $('.fixed-sidebar a[data-id="' + categoryId + '"]').each(function (index, item) {
            categories = [];
            var element = $(item);
            var hierarchy = [];
            if (element.parents('.parent-category').length > 0) {
                element.parents('.parent-category').each(function () {
                    hierarchy.push($(this).data('id'));
                });
            }

            if (element.hasClass('root-category')) {
                categories.push({
                    ID: categoryId,
                    Name: element.text(),
                    ParentId: null,
                    ParentName: null,
                    Hierarchy: null
                });
            } else {
                categories.push({
                    ID: categoryId,
                    Name: element.text(),
                    ParentId: element.attr('root-category-id'),
                    ParentName: element.attr('root-category-name'),
                    Hierarchy: hierarchy
                });
            }
        });

        self.props.searchByCategory(categories);
    }

    render() {
        const self = this;
        const price = self.getMinMaxPrice();
        return (
            <div className="fixed-sidebar open">
                <div className="fs-content">
                    <div className="fs-scroll">
                        <div className="fsc-container">
                            <div className="fsc-categories">
                                <span className="title">Categories</span>
                                <div className="fsc-ul-cat">
                                    <ul className="st-parent">
                                        {self.renderParentCategories()}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="fsc-container">
                            <div className="fsc-field">
                                <span className="title">Price Range</span>
                                <div className="fsc-filter-range">
                                    <span className="full-width range-slider">
                                        <input type="text" className="item-range" />
                                    </span>
                                    <span className="full-width range-value">
                                        <span className="pull-left">
                                            <span className="filter-price-label">$</span>
                                            <span className="start-range" id="start">0</span>
                                        </span>
                                        <span className="pull-right">
                                            <span className="filter-price-label">$</span>
                                            <span className="end-range" id="end">1.00</span>
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            {self.renderCustomFields()}
                        </div>
                        <div className="fsc-container fsc-buttons">
                            <div className="fsc-filter-action">
                                <div className="btn-gray" onClick={() => self.resetFilters()}>Reset</div>
                                <div className="btn-blue" onClick={() => self.applyFilters()}>Apply</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fs-btn-slide">
                    <span>Filters</span>
                    <span>
                        <i className="fa fa-angle-down" />
                        <i className="fa fa-angle-up hide" />
                    </span>
                </div>
            </div>
        );
    }
}

module.exports = SearchFilterComponent;