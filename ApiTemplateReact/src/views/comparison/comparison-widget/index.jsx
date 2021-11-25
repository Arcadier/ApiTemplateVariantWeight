'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

var ModalAddEditComponent = require('../comparison-widget/modal-add-edit');
var ModalDeleteComponent = require('../comparison-widget/modal-delete');
var BaseComponent = require('../../shared/base');

var PermissionTooltip = require('../../common/permission-tooltip');


class ComparisonWidgetComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            permission: {
                isAuthorizedToView: true,
                isAuthorizedToAdd: true,
                isAuthorizedToDelete: true,
                isAuthorizedToEdit: true
            }
        };
    }

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
            $('[data-toggle="tooltip"]').hover(function () {
                $(this).tooltip({ show: null });
            });
        }        
    }

    compareNow() {
        const { user } = this.props;

        if (user && user.Guest == true) {
            const returnUrl = (location.pathname + location.search).substr(1);
            location.href = `/accounts/non-private/sign-in?returnUrl=${returnUrl}`;

            return;
        }

        location.href = "/comparison/detail?comparisonId=" + this.getComparisonId();
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
        const isSpacetime = process.env.PRICING_TYPE === 'service_level';        

        if (typeof this.props.comparison !== 'undefined' && $.isEmptyObject(this.props.comparison) === false) {
            slides = (this.props.comparison.ComparisonDetails || []).map(function (detail, index) {
                let cartItem = detail.CartItem;
                let item = null;
                let merchant = null;
                let price = 0;

                if (cartItem) {
                    item = detail.CartItem.ItemDetail;
                    merchant = detail.CartItem.ItemDetail.MerchantDetail;
                }
                else {
                    return;
                }

                if (isSpacetime) {
                    let addOnPrice = 0;
                    if (cartItem.AddOns) {
                        cartItem.AddOns.forEach(function (addOn) {
                            addOnPrice += addOn.PriceChange;
                        });
                    }
                    price = cartItem.SubTotal + addOnPrice;
                }
                else {
                    price = detail.Offer ? detail.Offer.Total : detail.CartItem.SubTotal - detail.CartItem.DiscountAmount;                    
                }
                return (
                    <div key={detail.ID} className="col-sm-3">
                        <div className="compare-item">
                            <div id={'product_' + index}>
                                {
                                    !isSpacetime && 
                                    (
                                        <React.Fragment>
                                            <span className="sup-tit">
                                                {merchant.DisplayName}
                                                {self.props.comparisonWidgetPermissions.isAuthorizedToDelete ?
                                                    (<span className=" delete-comp-item">
                                                        <i className="fa fa-times" onClick={(e) => self.showDeleteModal(detail.ID)}></i>
                                                    </span>):
                                                    (<span className=" delete-comp-item" tabindex="0" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="You need permission to perform this action">
                                                        <i className="fa fa-times"></i>
                                                    </span>)}
                                                
                                            </span>
                                            <div className="compimg-thumb">
                                                <img src={item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : ''} className="img-responsive" />
                                            </div>
                                            <div className="comp-desc">
                                                <span className="item-name" style={{ whiteSpace: 'nowrap' }}> {item.Name} </span>
                                                <span className="comp-qty">Qty: {cartItem.Quantity}</span>
                                                <span className="comp-price">
                                                    {self.renderFormatMoney(cartItem.CurrencyCode, price)}
                                                </span>
                                            </div>
                                        </React.Fragment>
                                    )                                    
                                }    
                                {
                                    isSpacetime && 
                                    (
                                        <React.Fragment>
                                            <span className="sup-tit">
                                                {merchant.DisplayName}
                                                {self.props.comparisonWidgetPermissions.isAuthorizedToDelete ?
                                                    (<span className=" delete-comp-item">
                                                        <i className="fa fa-times" onClick={(e) => self.showDeleteModal(detail.ID)}></i>
                                                    </span>) :
                                                    (<span className=" delete-comp-item" tabindex="0" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="You need permission to perform this action">
                                                        <i className="fa fa-times"></i>
                                                    </span>)}
                                            </span>
                                            <div className="compimg-thumb">
                                                <img className="img-responsive" src={item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : ''} />                                            
                                            </div>
                                            <div className="comp-desc">
                                                <span className="item-name">
                                                    {item.Name}
                                                </span>
                                                <span className="comp-price">
                                                    {self.renderFormatMoney(cartItem.CurrencyCode, price)}
                                                </span>
                                            </div>
                                        </React.Fragment>
                                    )
                                }
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
        let compareBtnText = 'Compare Now';
        if (process.env.PRICING_TYPE === 'service_level') {
            compareBtnText = 'Compare';
        }        
        return (
            <React.Fragment>
                <div className="compare-desk">
                    <div className="mauto-top">
                        <span className="toggle-btn-compare" onClick={(e) => this.showHideWidget()}>
                            <i className="fa fa-angle-up"></i> Comparison Table <span id="listname_title">({this.getComparisonName()})</span>
                        </span>
                    </div>
                    {this.state.permission.isAuthorizedToView ?
                        (
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
                                            <PermissionTooltip isAuthorized={this.props.comparisonWidgetPermissions.isAuthorizedToEdit}>
                                                <button className={this.props.comparisonWidgetPermissions.isAuthorizedToEdit ? "add-comp-list-btn white" : "add-comp-list-btn white disabled"} type="button" data-toggle="" data-target=".bs-example-modal-sm" onClick={(e) => this.showAddEditModal(this.getComparisonId())}>
                                                    <img src="/assets/images/pencil.svg" />
                                                </button>
                                            </PermissionTooltip>
                                        </div>
                                        <div className="form-element">
                                            <a href="#" className="gr-compare-btn" onClick={() => this.compareNow()}>{compareBtnText}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) :
                        (
                            <div className="container">
                                <div className="row">
                                    <div className="permission-message">You need permission to access this page</div>
                                </div>
                            </div>
                        )}
                        
                </div>
                <ModalAddEditComponent
                    comparison={this.props.comparison}
                    comparisonToUpdate={this.props.comparisonToUpdate}
                    createComparison={this.props.createComparison}
                    editComparison={this.props.editComparison}
                    isAuthorizedToAdd={this.props.comparisonWidgetPermissions.isAuthorizedToAdd}
                    isAuthorizedToEdit={this.props.comparisonWidgetPermissions.isAuthorizedToEdit}
                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                />
                <ModalDeleteComponent
                    deleteComparisonDetail={this.props.deleteComparisonDetail} />
            </React.Fragment>
        );        
    }
}

module.exports = ComparisonWidgetComponent;