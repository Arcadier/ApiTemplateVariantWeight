'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

var ModalAddEditComponent = require('../comparison-widget/modal-add-edit');
var ModalDeleteComponent = require('../comparison-widget/modal-delete');
var BaseComponent = require('../../../../shared/base');

class ComparisonWidgetComponent extends BaseComponent {
    initializeCarousel() {
        if (!$('.multiple-compare').hasClass('slick-initialized')) {
            $('.multiple-compare').slick({
                infinite: false,
                slidesToShow: 4,
                slidesToScroll: 4,
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3,
                            infinite: true,
                            dots: true
                        }
                    },
                    {
                        breakpoint: 600,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    }
                    // You can unslick at a given breakpoint now by adding:
                    // settings: "unslick"
                    // instead of a settings object
                ]
            });
        }
    }

    destroyCarousel() {
        if ($('.multiple-compare').hasClass('slick-initialized')) {
            $('.multiple-compare').slick('unslick');
        }
    }

    getComparisons(comparisonId) {
        this.props.getUserComparisons(true, true, 1000);
    }

    getComparisonName() {
        if (typeof this.props.comparison !== 'undefined' && typeof this.props.comparison.Name !== 'undefined') {
            return this.props.comparison.Name;
        }

        return '';
    }

    getComparisonId() {
        if (typeof this.props.comparison !== 'undefined' && typeof this.props.comparison.ID !== 'undefined') {
            return this.props.comparison.ID;
        }

        return '';
    }

    onComparisonChange(e) {
        const id = e.target.value;
        if (id !== '') {
            this.props.getComparison(id, 'CartItem,Order');
            window.sessionStorage.setItem('selectedComparison', id);
        } else {
            this.showAddEditModal();
        }
    }

    showAddEditModal(id) {
        this.props.setComparisonToUpdate(id);

        $('.bs-example-modal-sm').modal('show');
    }

    showDeleteModal(id) {
        this.props.setComparisonDetailToUpdate(id);

        $('#modalRemove').modal('show');
    }

    showHideWidget(isShow) {
        if (typeof isShow === 'undefined') {
            $('.compare-desk').toggleClass('active');
        } else if (isShow === true) {
            $('.compare-desk').addClass('active');
        } else {
            $('.compare-desk').removeClass('active');
        }

        if ($('.compare-desk').hasClass('active')) {
            $('.toggle-btn-compare i').addClass('fa-angle-down');
            $('.toggle-btn-compare i').removeClass('fa-angle-up');
        } else {
            $('.toggle-btn-compare i').removeClass('fa-angle-down');
            $('.toggle-btn-compare i').addClass('fa-angle-up');
        }
    }
    EnableDisableComparisonWidget() {
        if (this.props.controlFlags.ComparisonEnabled === false) {
            $('.compare-desk').addClass('hide');
        }
    }
    componentDidMount() {
        this.initializeCarousel();
        this.getComparisons();
        this.EnableDisableComparisonWidget();
    }

    componentWillUpdate() {
        this.destroyCarousel();
    }

    componentDidUpdate() {
        const comparisonList = this.props.comparisonList;

        if ($.isEmptyObject(this.props.comparison)) {
            if (comparisonList.length > 0) {
                const lastSelected = window.sessionStorage.getItem('selectedComparison');
                const comparisonListIds = comparisonList.map(cl => cl.ID);
                let comparisonToLoad = comparisonList[0].ID;
                if (comparisonListIds.includes(lastSelected)) {
                    comparisonToLoad = lastSelected;
                }
                this.props.getComparison(comparisonToLoad, 'CartItem,Order');
            }
        } else {
            this.initializeCarousel();
        }
    }

    renderComparisonDropdown() {
        let comparisonList = [];

        if (typeof this.props.comparisonList !== 'undefined') {
            this.props.comparisonList.map(function (comparison) {
                comparisonList.push(comparison);
            });
        }

        return (
            <React.Fragment>
                <select id="compare-list-add" value={this.getComparisonId()} onChange={(e) => this.onComparisonChange(e)}>
                    {
                        comparisonList.map(function (comparison) {
                            return (
                                <option key={comparison.ID} value={comparison.ID}>{comparison.Name}</option>
                            )
                        })
                    }
                    <option value="">Create new comparison table</option>
                </select>
                <i className="fa fa-angle-down"></i> 
            </React.Fragment>
        )
    }

    renderComparisonDetails() {
        const self = this;
        let slides = [];

        if (typeof this.props.comparison !== 'undefined' && $.isEmptyObject(this.props.comparison) === false) {
            slides = (this.props.comparison.ComparisonDetails || []).map(function (detail, index) {
                let cartItem = detail.CartItem;
                let item = null;
                let merchant = null;
                let price = 0;
                if (cartItem) {
                    item = detail.CartItem.ItemDetail;
                    merchant = detail.CartItem.ItemDetail.MerchantDetail;
                    price = detail.Offer ? detail.Offer.Total : detail.CartItem.SubTotal - detail.CartItem.DiscountAmount;
                } else {
                    return;
                }

                return (
                    <div key={detail.ID} className="col-sm-3">
                        <div className="compare-item">
                            <div id={'product_' + index}>
                                <span className="sup-tit">{merchant.DisplayName}<span className=" delete-comp-item" ><i className="fa fa-times" onClick={(e) => self.showDeleteModal(detail.ID)}></i></span></span>
                                <div className="compimg-thumb">
                                    <img src={item.Media[0].MediaUrl} className="img-responsive" />
                                </div>
                                <div className="comp-desc">
                                    <span className="item-name"> {item.Name} </span>
                                    <span className="comp-qty">Qty: {cartItem.Quantity}</span>
                                    <span className="comp-price">
                                        {self.renderFormatMoney(cartItem.CurrencyCode, price)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }

        const length = slides.length;
        for (let i = 0; i < 5 - length; i++) {
            slides.push((
                <div key={i} className="col-sm-3">
                    <div className="empty-item"> </div>
                </div>
            ));
        }

        return slides;
    }

    render() {
        return (
            <React.Fragment>
                <div className="compare-desk">
                    <div className="mauto-top">
                        <span className="toggle-btn-compare" onClick={(e) => this.showHideWidget()}>
                            <i className="fa fa-angle-up"></i> Comparison Table <span id="listname_title">({this.getComparisonName()})</span>
                        </span>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-9">
                                <div className="multiple-compare">
                                    {this.renderComparisonDetails()}
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <div className="form-element w-65">
                                    {this.renderComparisonDropdown()}
                                </div>
                                <div className="w-35">
                                    <button className="add-comp-list-btn white" type="button" data-toggle="" data-target=".bs-example-modal-sm" onClick={(e) => this.showAddEditModal(this.getComparisonId())}>
                                        <img src="/assets/images/pencil.svg" />
                                    </button>
                                </div>
                                <div className="form-element half">
                                    <a href={"/comparison/detail?comparisonId=" + this.getComparisonId()} className="gr-compare-btn">Compare Now</a> <a href={"/comparison/detail?comparisonId=" + this.getComparisonId()} className="gr-order-btn pull-right">Order Now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ModalAddEditComponent
                    comparison={this.props.comparison}
                    comparisonToUpdate={this.props.comparisonToUpdate}
                    createComparison={this.props.createComparison}
                    editComparison={this.props.editComparison} />
                <ModalDeleteComponent
                    deleteComparisonDetail={this.props.deleteComparisonDetail} />
            </React.Fragment>
        );
    }
}

module.exports = ComparisonWidgetComponent;