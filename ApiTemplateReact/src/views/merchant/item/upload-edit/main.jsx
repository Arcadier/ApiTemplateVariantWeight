'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../../shared/base');
const HeaderLayout = require('../../../layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../layouts/sidebar').SidebarLayoutComponent;
const FooterLayout = require('../../../layouts/footer').FooterLayoutComponent;

const CategoryComponent = require('./categories');
const CustomFieldComponent = require('./customfield');
const ImageModalViewComponent = require('./image-modal-view');
const NegotiateComponent = require('../../../features/pricing_type/' + process.env.PRICING_TYPE + '/add-edit/negotiate');
const CommonModule = require('../../../../public/js/common');

const { PricingFeatureComponent, mapStateToProps, mapDispatchToProps } = require('../../../features/pricing_type/' + process.env.PRICING_TYPE + '/add-edit/index');
const TabLinksComponent = require('../../../features/pricing_type/' + process.env.PRICING_TYPE + '/add-edit/tab-links');
const AddButtonComponent = require('../../../features/pricing_type/' + process.env.PRICING_TYPE + '/add-edit/add-button');

const PermissionTooltip = require('../../../common/permission-tooltip');

class UploadEditComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.browseFile = this.browseFile.bind(this);
        this.showTab = this.showTab.bind(this);
        this.uploadOrEditItem = this.uploadOrEditItem.bind(this);
        this.isCountryLevel = false;
    }

    componentDidUpdate() {
        this.checkImageIsMaximumNumber();
        console.log('test', this.props)
    }

    calcPosition() {
        $('.tab-container').each(function () {
            $(this).attr('data-position', $(this).offset().top);
        });
    }

    getDocHeight() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    }

    handleWindowScroll() {
        const self = this;

        $(window).scroll(function () {
            if (!self.isCountryLevel || $('.btn-next-variation').is(':visible')) {
                var scrollPosition = $(window).scrollTop();
                if (scrollPosition > 0) {
                    if ($(window).scrollTop() + $(window).height() >= self.getDocHeight()) {
                        const tab = $('.tab-container:not([style*="display: none"])').last().attr('id');
                        $('#seller-upload-tab li').removeClass('active');
                        $(`[data-tab="${tab}"]`).addClass('active');
                    } else {
                        $('#seller-upload-tab li').each(function () {
                            var currentLink = $(this);
                            var refElement = $('#' + currentLink.attr("data-tab"));
                            if (refElement.length) {
                                scrollPosition = $('.header').height() + scrollPosition;
                                if (refElement.position().top <= scrollPosition && refElement.position().top + refElement.height() > scrollPosition) {
                                    if (!self.isCountryLevel || currentLink.attr("data-tab") != 'pricing_tab') {
                                        $('#seller-upload-tab li').removeClass('active');
                                        $(this).addClass('active');
                                    }
                                }
                            }
                        });
                    }
                } else {
                    $('#seller-upload-tab li').removeClass('active');
                    $('#seller-upload-tab li:first-child').addClass('active');
                }
            }
        });
    }

    componentDidMount() {
        var self = this;


        setInterval(() => {

            $('#customfields input').each(function (index, element) {
                if (typeof ($(element).attr('data-code')) != 'undefined' && $(element).attr('data-code').indexOf('-WEIGHT-') >= 0) {
                    var theLabel = $(element).parent().find('label')
                    theLabel.find('i').remove()
                    $('.weight-variatns-placeholder').html(theLabel.html())
                    $(element).parent().find('label').append('<i class="icon icon-info" data-toggle="tooltip" data-placement="top" title="" data-original-title="Weight value from this field will be the default of the variants weight if left empty."><img src="/assets/images/Info.svg"></i>')
                    $('[data-toggle="tooltip"]').tooltip();
                }
            });

        }, 2000)

        $("li.check-category.has-child-sub").append('<div class="cat-line"></div>');
        if (typeof window !== 'undefined') {
            CommonModule.init();

            $(".cat-toggle .up").on("click", function () {
                var $this = $(this);
                var $parent = $this.parents(".parent-cat");
                var $findSubCat = $parent.find("ul.sub-cat");
                $findSubCat.slideToggle();
                $parent.find(".cat-toggle > .down").removeClass("hide");
                $this.addClass("hide");
                $parent.find(".cat-line").addClass("hide");
            });

            $(".cat-toggle .down").on("click", function () {
                var $this = $(this);
                var $parent = $this.parents(".parent-cat");
                var $findSubCat = $parent.find("ul.sub-cat");
                $findSubCat.slideToggle();
                $parent.find(".cat-toggle > .up").removeClass("hide");
                $this.addClass("hide");
                $parent.find(".cat-line").removeClass("hide");
            });

            $("li.check-category.has-child-sub").on("click", function () {
                $(this).find("li.check-category.has-child-sub").each(function () {
                    var $ulFirst = $(this).find("ul").first();
                    var $ulliFirst1 = $ulFirst.children("li").last().find("label").first().innerHeight() * 1.3;
                    var $ulliFirst = $ulFirst.children("li").last().innerHeight();
                    var newHeight = $ulliFirst + $ulliFirst1;
                    var completeHeight = parseInt(newHeight) - parseInt($(this).height());

                    if ($(this).find(".cat-line").length) {

                        $(this).find(".cat-line").css("height", Math.abs(completeHeight) + "px");
                    } else {
                        $(this).append('<div class="cat-line"></div>');
                        $(this).find(".cat-line").css("height", Math.abs(completeHeight) + "px");
                        $(this).find(".cat-line:not(:first)").remove();
                    }
                });
            });
            self.checkImageIsMaximumNumber();

            this.calcPosition();

            $("body").on('click' , '.tab-mobile' , function(){
                $("#seller-upload-tab").slideToggle();  
            });

            $("body").on("click", '#seller-upload-tab li ', function () {
                var active_text = $(this).text();
                /*$(this).parent('#seller-upload-tab').slideUp();*/
                $(".drop-box-area span").html(active_text);
            });

            this.handleWindowScroll();
            this.isCountryLevel = $('#selectCountries').length > 0;
        }
    }

    checkImageIsMaximumNumber() {
        const { images } = this.props.itemModel;
        const total = images.length;
        const maxUpload = 5;

        if (maxUpload > total) {
            $("#btn-browse").fadeIn();
            $(".add-item-box").fadeIn();
        }

        if (maxUpload <= total) {
            $("#btn-browse").fadeOut();
            $(".add-item-box").fadeOut();
        }
    }

    callbackUploadItem() {
        this.checkImageIsMaximumNumber();
    }

    addImage(self, data) {
        self.props.setUploadFile(data);
        self.callbackUploadItem();
    }

    browseFile() {
        this.props.validatePermissionToPerformAction("add-merchant-create-item-api", () => {
            $(".tools").addClass("hide");
            var canvas = document.getElementById("visbleCanvas");

            if ($(".imageBox").find(canvas).length !== 0) {
                canvas.remove();
            }
            $(".upload-wapper > .upload-wrapper-container > input").val("");
        });
    }

    showTab(tabName) {
        $('.tablinks').removeClass('active');
        $('.tab-container.tabcontent').removeClass('active');
        const $container = $("html,body");
        const $totalHeaderHeight = $(".header").innerHeight() + 50;

        if (this.isCountryLevel && tabName == 'pricing_tab') {
            if ($('.btn-next-variation').is(':visible')) {
                this.props.validateNonPricingDetails((hasError) => {
                    if (!hasError) {
                        $('#basic_tab,#description_tab,#delivery_tab,#variants_tab').hide();
                        $('.btn-next-variation').hide();
                        $('#pricing_tab').show();
                        $('.btn-back-variation').show();
                        $(`[data-tab="${tabName}"]`).addClass('active');
                        $(`#${tabName}`).addClass('active');
                    } else {
                        var $scrollTo = $('.error-con').eq(0);
                        if ($scrollTo.parent().children('label').length > 0) {
                            $scrollTo = $scrollTo.parent().children('label');
                        }
                        $container.animate({
                            scrollTop: $scrollTo.offset().top - $totalHeaderHeight,
                            scrollLeft: 0
                        }, 500);
                    }
                });
            }
        } else {
            if (this.isCountryLevel && $('.btn-back-variation').is(':visible')) {
                $('#basic_tab,#description_tab,#delivery_tab,#variants_tab').show();
                $('.btn-next-variation').show();
                $('#pricing_tab').hide();
                $('.btn-back-variation').hide();
            }

            $(`[data-tab="${tabName}"]`).addClass('active');

            let tabActive = "#" + tabName;
            $(tabActive).addClass('active');
            var $scrollTo = $('.tab-container.tabcontent.active');

            $container.animate({
                scrollTop: $scrollTo.offset().top - $totalHeaderHeight,
                scrollLeft: 0
            }, 500);
        }
    }

    uploadOrEditItem() {
        const self = this;

        this.props.validatePermissionToPerformAction("add-merchant-create-item-api", () => {
            self.props.uploadOrEditData();
        });
    }

    removeImage(i) {
        const self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-create-item-api", () => {
            self.props.removeImage(i);
        });
    }

    renderImages() {
        let self = this;
        let images = this.props.itemModel.images;

        if (images != null) {
            return images.map(function (item, i) {
                return (
                    <div key={i} data-id={item.ID} className="uploded-box">
                        <img src={item.MediaUrl} />
                        <div className="action-area">
                            <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                                <a onClick={() => self.removeImage(i)}>
                                    <i className="icon icon-close" />
                                </a>
                            </PermissionTooltip>
                        </div>
                    </div>
                );
            });
        }
    }

    render() {
        let self = this;

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="un-seller-tab">
                            <div className="container">
                                <ul id="seller-upload-tab" className="pull-left un-item-uplod-tab">
                                    <TabLinksComponent showTab={this.showTab} />
                                </ul>
                                <AddButtonComponent
                                    pagePermissions={this.props.pagePermissions}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                    uploadOrEditItem={this.uploadOrEditItem} />
                            </div>
                        </div>
                        <div className="sticky-support"></div>
                        <div className="un-seller-body">
                            <div className="container">
                                <div className="tab-container tabcontent active" id="basic_tab">
                                    <div className="tab-title">
                                        <div className="tab-text">
                                            <span>Basic Details</span>
                                        </div>
                                    </div>
                                    <div className="tab-content un-inputs">
                                        <div className="item-form-group">
                                            <div className="col-md-6">
                                                <div className="row">
                                                    <label>Listing Name*</label>
                                                    <input type="text" className="required"
                                                        name="listing-name"
                                                        id="listing_name"
                                                        defaultValue={this.props.itemModel.listingName}
                                                        onChange={(e) => this.props.onTextChange(e.target.value, "itemname")}
                                                        maxLength={130} />
                                                </div>
                                            </div>
                                        </div>
                                        <CategoryComponent
                                            itemModel={this.props.itemModel}
                                            updateCategoryToSearch={this.props.updateCategoryToSearch}
                                            selectAllOrNone={this.props.selectAllOrNone}
                                            selectUnselectCategory={this.props.selectUnselectCategory} />
                                        <NegotiateComponent {...this.props} />
                                        <div className="item-form-group">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <label>Item Cover Image* ( Maximum 5 images ) </label>
                                                    <p>Images must be in a ratio of 1:1 and no larger than 2MB (recommended 600px x 600px)</p>
                                                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                                        <div className="browse-image required">
                                                            <a data-toggle="modal" data-target="#myModal" href="#" id="btn-browse" onClick={() => this.browseFile()} />
                                                            <span className="icon-browse" />
                                                        </div>
                                                    </PermissionTooltip>
                                                    <div className="uploded-items">
                                                        {this.renderImages()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="clearfix" />
                                <div className="tab-container tabcontent" id="description_tab">
                                    <div className="tab-title">
                                        <div className="tab-text">
                                            <span>Description</span>
                                        </div>
                                    </div>
                                    <div className="tab-content un-inputs">
                                        <div className="item-form-group">
                                            <div className="col-md-12">
                                                <label>Item Description*</label>
                                                <textarea className="required"
                                                    name="item-description"
                                                    onChange={(e) => this.props.onTextChange(e.target.value, "itemdescription")}
                                                    defaultValue={this.props.itemModel.description}
                                                    maxLength={5000}>
                                                </textarea>
                                            </div>
                                        </div>
                                        <div className="item-form-line" />
                                        <div className="item-custom-fields full-width">
                                            <CustomFieldComponent
                                                pagePermissions={this.props.pagePermissions}
                                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                                itemModel={this.props.itemModel}
                                                checkboxClickedCustomField={this.props.checkboxClickedCustomField}
                                                dropDownChange={this.props.dropDownChange}
                                                onTextChange={this.props.onTextChange}
                                                setPDFFile={this.props.setPDFFile} />
                                        </div>
                                    </div>
                                </div>
                                <div className="clearfix" />
                                <PricingFeatureComponent
                                    {...this.props}
                                    uploadOrEditItem={this.uploadOrEditItem}
                                    showTab={this.showTab} />
                            </div>
                        </div>
                    </div>
                    <div className="footer" id="footer-section">
                        <FooterLayout panels={this.props.panels} />
                    </div>
                </div>
                <div id="myModal" className="modal fade" role="dialog">
                    <ImageModalViewComponent
                        base={self}
                        addImage={this.addImage} />
                </div>
            </React.Fragment>
        );
    }
}

const UploadEditHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(UploadEditComponent);

module.exports = {
    UploadEditHome,
    UploadEditComponent,
};