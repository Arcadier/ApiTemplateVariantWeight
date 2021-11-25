'use strict';
let React = require('react');
let ReactRedux = require('react-redux');

let HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
let SidebarLayoutComponent = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
let BaseComponent = require('../../shared/base');
let toastr = require('toastr');
let TableContentComponent = require('../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/detail/table.jsx');
let TransactionSummaryComponent = require('../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/detail/transaction_summary.jsx');
let OrderDiaryComponent = require('../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/order-diary');
let ShippingPaymentDetailComponent = require('../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/detail/shipping_payment_detail');
import { submitFeedbackForCartItem } from '../../../redux/purchaseActions';
import { validatePermissionToPerformAction } from '../../../redux/accountPermissionActions';

// Order Diary
var OrderDiaryActions = require('../../../redux/orderDiaryActions');

class PurchaseDetailComponent extends BaseComponent {
    componentDidMount() {

        const target = $(".popup-area.order-item-feedback-popup");
        const cover = $("#cover");
        const self = this;
        $('.btn-feedback').click(function (e) {
            if (!self.props.isAuthorizedToAdd) return;
            const $this = $(this);
            self.props.validatePermissionToPerformAction('add-consumer-purchase-order-details-api', () => {
                const hasFeedback = $this.attr('has-feedback');
                if (hasFeedback == '0') {

                    target.fadeIn();
                    cover.fadeIn();

                    $('body').addClass('modal-open');
                    const itemUrl = $this.attr('item-url');
                    const itemImgUrl = $this.attr('item-image-url');
                    const itemName = $this.attr('item-name');
                    const cartItemID = $this.attr('cart-item-id');
                    self.setState({ selectedCartItemID: cartItemID });
                    $('.ordr-dtls-item-iteminfo .item-img a').attr('href', itemUrl)
                    $('.ordr-dtls-item-iteminfo .item-img a img').attr('src', itemImgUrl);
                    $('.ordr-dtls-item-iteminfo .item-info-text div a').attr('href', itemUrl);
                    $('.ordr-dtls-item-iteminfo .item-info-text div a').text(itemName);
                } else {
                    toastr.warning('You already posted a review.', 'Failed in Posting Review')
                }
            });
           
        });

        $('#stars').on('starrr:change', function (e, value) {
            $('input[name=rating_val]').val(value);
        });

        $('.close-popup-icon').click(function (e) {
            target.hide();
            cover.hide();
            $('#stars .glyphicon').removeClass('glyphicon-star');
            $('#stars .glyphicon').addClass('glyphicon-star-empty');
            $('input[name=rating_val]').val();
            $('.content-area .quote').remove();
            $('textarea[name=feedbackText]').val('');
            $('body').removeClass('modal-open');
            self.setState({ selectedCartItemID: null });
        });

        $('body').on('mouseout', '#stars .glyphicon', function () {
            var $this = $(this);
            var rating = parseInt($this.parent('.starrr').find('.glyphicon-star').length);
            if (!rating)
                $this.parent('.starrr').next('.quote').remove();

            if ($('input[name=rating_val]').val())
                $this.parent('.starrr').next('.quote').text(self.getQuote(rating));

        });

        $('body').on('mouseenter', '#stars .glyphicon', function () {
            var $this = $(this);
            var rating = parseInt($this.parent('.starrr').find('.glyphicon-star').length);
            var quote = self.getQuote(rating)
            var ob_quote = '<span class="quote">' + quote + '</span>';
            $this.parent('.starrr').next('.quote').remove();
            $this.parent('.starrr').after(ob_quote);
        });

        $('.my-btn').click(function (e) {
            const rating = $('input[name=rating_val]').val();
            const feedback = $('textarea[name=feedbackText]').val();
            if (rating === null || typeof rating === 'undefined' || rating == '') {
                toastr.warning('You forgot to select your star rating.', 'Oops! Something went wrong.');
            } else {
                self.submitFeedback(rating, feedback);
                target.hide();
                cover.hide();
                $('#stars .glyphicon').removeClass('glyphicon-star');
                $('#stars .glyphicon').addClass('glyphicon-star-empty');
                $('input[name=rating_val]').val();
                $('.content-area .quote').remove();
                $('textarea[name=feedbackText]').val('');
                $('body').removeClass('modal-open');
                self.setState({ selectedCartItemID: null });
            }
        });
    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    getQuote(rating) {
        var quote = '';
        //switch (rating) {
        //    case 1:
        //        quote = 'Unsatisfied.';
        //        break;
        //    case 2:
        //        quote = 'Okay.';
        //        break;
        //    case 3:
        //        quote = 'Good.';
        //        break;
        //    case 4:
        //        quote = 'Great!';
        //        break;
        //    case 5:
        //        quote = 'Excellent!!';
        //        break;
        //}
        return quote;
    }

    renderSupplierAddress() {
        let shippingAddress = null;
        let supplierDisplayName = null;
        let detail = process.env.CHECKOUT_FLOW_TYPE === 'b2b' ? this.props.detail : this.props.detail.Orders[0]

        if (detail) {
            shippingAddress = detail.DeliveryFromAddress;
            supplierDisplayName = detail.MerchantDetail ? detail.MerchantDetail.DisplayName : '';
        }

        if (typeof shippingAddress != 'undefined' && shippingAddress && shippingAddress.Name) {

            const supplierName = typeof shippingAddress != 'undefined' && shippingAddress && shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
            const line2 = typeof shippingAddress != 'undefined' && shippingAddress && shippingAddress.Line2 ? shippingAddress.Line2 : "";

            return (
                <div className="col-md-4">
                    <table className="canon-table purchase-address-sec">
                        <tbody><tr>
                            <th>Supplier :</th>
                        </tr>
                            <tr>
                                <td data-th="Supplier :">
                                    <span className="highlight-text">{supplierDisplayName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="highlight-text">{supplierName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {shippingAddress.Line1},<br />
                                    {line2 &&
                                        <React.Fragment>
                                            {line2} <br />
                                        </React.Fragment>
                                    }
                                    {shippingAddress.City &&
                                        <React.Fragment>
                                            {shippingAddress.City} <br />
                                        </React.Fragment>
                                    }
                                    {shippingAddress.State &&
                                        <React.Fragment>
                                            {shippingAddress.State} <br />
                                        </React.Fragment>
                                    }
                                    {shippingAddress.Country}<br />
                                    {shippingAddress.PostCode}<br />
                                </td>
                            </tr>
                            {this.renderSupplierEmailContact()}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return "";
        }

    }

    renderSupplierEmailContact() {
        let detail = process.env.CHECKOUT_FLOW_TYPE === 'b2b' ? this.props.detail : this.props.detail.Orders[0]
        let contactNo = '';
        let email = '';
        if (detail) {
             contactNo = detail.MerchantDetail.PhoneNumber;
             email = detail.MerchantDetail.Email;
        }
       
        if (process.env.PRICING_TYPE === "service_level") {
            return (
                <React.Fragment>
                    <tr>
                        <td data-th="Supplier :">{ contactNo }</td>
                    </tr>
                    <tr>
                        <td data-th="Supplier :">{ email }</td>
                    </tr>
                </React.Fragment>
            );
        }
        return null;
    }

    renderShippingAddress() {
        let shippingAddress = null;
        if (this.props.detail.Orders) {
            shippingAddress = this.props.detail.Orders[0].DeliveryToAddress;
        } else {
            shippingAddress = this.props.detail.DeliveryToAddress;
        }

        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const line2 = shippingAddress.Line2 ? shippingAddress.Line2 : "";
        if (shippingAddress && shippingAddress.Name) {
            return (
                <div className="col-md-4">
                    <table className="canon-table purchase-address-sec">
                        <tbody><tr>
                            <th>Shipping Address :</th>
                        </tr>
                            <tr>
                                <td data-th="Shipping Address :">
                                    <span className="highlight-text">{buyerName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {shippingAddress.Line1},<br />
                                    {line2 &&
                                        <React.Fragment>
                                            {line2} <br />
                                        </React.Fragment>
                                    }
                                    {shippingAddress.City &&
                                        <React.Fragment>
                                            {shippingAddress.City} <br />
                                        </React.Fragment>
                                    }
                                    {shippingAddress.State &&
                                        <React.Fragment>
                                            {shippingAddress.State} <br />
                                        </React.Fragment>
                                    }
                                    {shippingAddress.Country}<br />
                                    {shippingAddress.PostCode}<br />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return "";
        }
    }

    renderBillingAddress() {
        let shippingAddress = null;
        if (this.props.detail.Orders) {
            shippingAddress = this.props.detail.Orders[0].BillingToAddress;
        } else {
            shippingAddress = this.props.detail.BillingToAddress;
        }

        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const buyerDisplayName = this.props.user.DisplayName;
        const line2 = shippingAddress.Line2 ? shippingAddress.Line2 : "";

        let email = "";
        let number = "";

        if (this.props.detail.Orders && this.props.detail.Orders[0].ConsumerDetail.Email) {
            email = this.props.detail.Orders[0].ConsumerDetail.Email;
        } else {
            email = this.props.detail.ConsumerDetail.Email;
        }

        if (this.props.detail.Orders && this.props.detail.Orders[0].ConsumerDetail.PhoneNumber) {
            number = this.props.detail.Orders[0].ConsumerDetail.PhoneNumber;
        } else {
            number = this.props.detail.ConsumerDetail.PhoneNumber;
        }

        return (
            <div className="col-md-4">
                <table className="canon-table purchase-address-sec">
                    <tbody><tr>
                        <th>Billing Address :</th>
                    </tr>
                        <tr>
                            <td className="billing-address" data-th="Billing Address :">
                                <span className="highlight-text">{buyerDisplayName}</span><br />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="highlight-text">{buyerName}</span><br />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {shippingAddress.Line1},<br />
                                {line2 &&
                                    <React.Fragment>
                                        {line2} <br />
                                    </React.Fragment>
                                }
                                {shippingAddress.City &&
                                    <React.Fragment>
                                        {shippingAddress.City} <br />
                                    </React.Fragment>
                                }
                                {shippingAddress.State &&
                                    <React.Fragment>
                                        {shippingAddress.State} <br />
                                    </React.Fragment>
                                }
                                {shippingAddress.Country}<br />
                                {shippingAddress.PostCode}<br />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a href={"tel:+" + number}>+{number}</a><span className="text-spacer" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a href={"mailto:" + email}>{email}</a>
                            </td>
                        </tr>
                    </tbody></table>
            </div>
        );
    }

    renderCommonView() {
        const detail = this.props.detail;
        const order = detail;
        //ARC8925
        let dateToUse = order.CreatedDateTime;
        if (order.CreatedDateTime == null) {
            if (order.Orders) {
                dateToUse = order.Orders[0].CreatedDateTime;
            }
        }
        return (
            <div className="main" style={{ paddingTop: '46px' }}>
                <div className="orderlist-container">
                    <div className="container-fluid">
                        {/* title */}
                        <div className="sc-upper">
                            <div className="sc-u title-sc-u sc-u-mid full-width">
                                <div className="nav-breadcrumb">
                                    <i className="fa fa-angle-left" /> <a href="/purchase/history">Back</a>
                                </div>
                            </div>
                            <div className="flex-title">
                                <span className="sc-text-big">Purchase Order Details</span>
                                <div className="order-date pull-right">{this.formatDateTime(dateToUse)}</div>
                            </div>
                        </div>
                        {/* title */}
                        <section className="sassy-box">
                            <div className="sassy-box-content box-order-detail">
                                <div className="row">
                                    {this.renderBillingAddress()}
                                    <div className="col-md-4" />
                                    <ShippingPaymentDetailComponent {...this.props} />
                                    <div className="spacer-20" />
                                    <div className="col-md-12">
                                        <div className="row">
                                            {this.renderSupplierAddress()}
                                            {this.renderShippingAddress()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <TableContentComponent {...this.props} />
                        <TransactionSummaryComponent {...this.props} checkoutFlowType={process.env.CHECKOUT_FLOW_TYPE} showNotes={process.env.PRICING_TYPE == 'service_level'} />
                        <OrderDiaryComponent
                            eventCustomField={this.props.eventCustomField}
                            events={this.getAllEvents()}
                            selectedSection={this.props.selectedSection}
                            selectedTabSection={this.props.selectedTabSection}
                            uploadFile={this.props.uploadFile}
                            isValidUpload={this.props.isValidUpload}
                            isSuccessCreate={this.props.isSuccessCreate}
                            fetchEvents={this.props.fetchEvents}
                            updateSelectedSection={this.props.updateSelectedSection}
                            updateSelectedTabSection={this.props.updateSelectedTabSection}
                            setUploadFile={this.props.setUploadFile}
                            createEvent={this.props.createEvent}
                            isAuthorizedToAdd={this.props.isAuthorizedToAdd}
                            validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                        />
                    </div>
                </div>
            </div>
        );
    }

    renderFeedBackPopUp() {
        return (
            <div className="popup-area order-item-feedback-popup" style={{ display: 'none' }}>
                <div className="wrapper">
                    <div className="title-area text-capitalize">
                        <div className="pull-left">LEAVE A FEEDBACK FOR:</div>
                        <div className="pull-right">
                            <a href={'#'} className="close-popup-icon">
                                <img src="/assets/images/icon-cross-black.png" />
                            </a>
                        </div>
                        <div className="clearfix" />
                    </div>
                    <div className="content-area">
                        <div className="ordr-dtls-item-itemdesc">
                            <div className="ordr-dtls-item-iteminfo">
                                <div className="item-img">
                                    <a href={null}>
                                        <span><img src={null} className="item-preview" /></span>
                                    </a>
                                </div>
                                <div className="item-info-text">
                                    <div>
                                        <a href={null} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p>&nbsp;</p>
                        <p>How much do you rate this item?</p>
                        <input type="hidden" value="" name="rating_val" />
                        <div id="stars" className="starrr">
                        </div>
                        <br />
                        <p>
                            <textarea name="feedbackText" className="form-controler" placeholder="Leave a feedback..." />
                        </p>
                    </div>
                    <div className="btn-area text-center">
                        <input type="button" value="SUBMIT" className="my-btn btn-red-popup" />
                        <div className="clearfix" />
                    </div>
                </div>
            </div>
        );
    }

    submitFeedback(rating, feedback) {
        const self = this;
        const { selectedCartItemID } = this.state;
        if (selectedCartItemID && rating !== '') {
            this.props.submitFeedbackForCartItem({ InvoiceNo: this.props.InvoiceNo, cartId: selectedCartItemID, rating, feedback }, function (result) {
                if (result.success === true) {
                    toastr.success(result.message, '');
                }
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayoutComponent user={this.props.user} />
                </aside>
                <div className="main-content">
                    {this.renderCommonView()}
                </div>
                {this.renderFeedBackPopUp()}
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        detail: state.purchaseReducer.detail,
        shippingMethod: state.purchaseReducer.shippingMethod,
        enableReviewAndRating: state.purchaseReducer.enableReviewAndRating,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        orderStatuses: state.purchaseReducer.orderStatuses,
        fulfilmentStatuses: state.purchaseReducer.fulfilmentStatuses,
        paymentStatuses: state.purchaseReducer.paymentStatuses,
        // Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd
    }
}

function mapDispatchToProps(dispatch) {
    return {
        submitFeedbackForCartItem: (options, callback) => dispatch(submitFeedbackForCartItem(options, callback)),
        // Order Diary
        fetchEvents: () => dispatch(OrderDiaryActions.fetchEvents()),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData) => dispatch(OrderDiaryActions.createEvent(event, formData)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const PurchaseDetailHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(PurchaseDetailComponent);

module.exports = {
    PurchaseDetailHome,
    PurchaseDetailComponent,
};