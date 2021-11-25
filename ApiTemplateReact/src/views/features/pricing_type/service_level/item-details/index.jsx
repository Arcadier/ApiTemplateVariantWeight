'use strict';
const React = require('react');
const Moment = require('moment');
const BaseComponent = require('../../../../shared/base');
const BreadcrumbComponent = require('../../../../item/breadcrumb');
const ItemCustomFieldsComponent = require('../../../../item/item-custom-fields');
const ItemInfoComponent = require('../../../../item/item-info');

const PurchaseOrderComponent = require('./purchase-order');
const ReviewsComponent = require('../../../../item/reviews');
const SellerInfoComponent = require('./seller-info');
const CalendarComponent = require('./calendar');

const ComparisonWidgetComponent = require('../../../../comparison/comparison-widget/index');
const QuotationActions = require('../../../../../redux/quotationActions');
const ComparisonActions = require('../../../../../redux/comparisonActions');
const ItemDetailActions = require('../../../../../redux/itemDetailsActions');
const ChatActions = require('../../../../../redux/chatActions');
const CartActions = require('../../../../../redux/cartActions');
const userActions = require('../../../../../redux/userActions');
const actionTypes = require('../../../../../redux/actionTypes');

import { validatePermissionToPerformAction } from '../../../../../redux/accountPermissionActions';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ItemDetailMainComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.purchaseOrder = React.createRef();
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

    getItemInfoPrice() {
        return this.props.itemDetails.Price;
    }

    renderServiceSchedule() {
        if (this.props.itemDetails) {
            const { Scheduler } = this.props.itemDetails;
            if (Scheduler) {
                if (Scheduler.Overnight) {
                    if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                        const checkInTime = Moment(Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format('hh:mm A');
                        const checkOutTime = Moment(Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format('hh:mm A');
                        return (
                            <div className="idclt-custom-field full-width">
                            <span className="title">Availability</span>
                                <span className="custom-field">
                                    <p>
                                        Check-in: {checkInTime}
                                        <br />
                                        Check-out: {checkOutTime}
                                    </p>
                                </span>
                        </div>

                        )
                    }
                } else {
                    let label = '';
                    let scheduleArr = [];
                    if (Scheduler.AllDay) {
                        label = 'Open 24/7';
                    } else {
                        label = 'Opening Hours or Check-in/Check-out';
                    }

                    if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                        var groupBy = function(xs, key) {
                          return xs.reduce(function(rv, x) {
                            (rv[x[key]] = rv[x[key]] || []).push(x);
                            return rv;
                          }, {});
                        };
                        const scheduleGroupedByDay = groupBy(Scheduler.OpeningHours, 'Day');
                        if (scheduleGroupedByDay) {
                            scheduleArr = Object.keys(scheduleGroupedByDay).map(num => {
                                let day = '';
                                switch(num) {
                                    case '1':
                                        day = 'Sunday';
                                        break;
                                    case '2':
                                        day = 'Monday';
                                        break;
                                    case '3':
                                        day = 'Tuesday';
                                        break;
                                    case '4':
                                        day = 'Wednesday';
                                        break;
                                    case '5':
                                        day = 'Thursday';
                                        break;
                                    case '6':
                                        day = 'Friday';
                                        break;
                                    case '7':
                                        day = 'Saturday';
                                        break;
                                }
                                const opening = scheduleGroupedByDay[num];
                                if (opening && opening.length > 0) {
                                    if (opening.length == 1 && opening[0] && opening[0].IsRestDay) {
                                        return `${day}: Closed`;
                                    }

                                    const openingsOnday = opening.map(op => {
                                        const checkInTime = Moment(op.StartTime, "HH:mm:ss").format('hh:mm A');
                                        const checkOutTime = Moment(op.EndTime, "HH:mm:ss").format('hh:mm A');
                                        return `${checkInTime} - ${checkOutTime}`;
                                    });
                                    const openingStr = `${day}: ${openingsOnday.join('\n')}`;
                                    return openingStr;
                                }
                            });
                        }
                    }
                    return (
                        <div className="idclt-custom-field full-width">
                            <span className="title">{label}</span>
                            {
                                scheduleArr && scheduleArr.length > 0 ?
                                    <span className="custom-field">
                                        {scheduleArr.map(s => <p key={s}>{s}</p>)}
                                    </span>
                                : ''
                            }
                        </div>

                    );
                }
            }
        }
        return '';
    }

    renderLocationMap() {
        if (this.props.itemDetails) {
            const { itemDetails } = this.props;
            const googleMapKey = process.env.GOOGLE_MAP_API_KEY;
            if (itemDetails.Location) {
                const {
                    Line1,
                    Line2,
                    State,
                    City,
                    Country,
                    CountryCode,
                    Latitude,
                    Longitude,
                    PostCode
                } = itemDetails.Location; 
                const location = `${Line1}, ${Line2 || ''} ${City} ${Country} ${PostCode} ${State || ''}`;

                const encodedLocation = Latitude !== 0 && Longitude !== 0 ? `${Latitude}, ${Longitude}` : location;
                const srcUrl = "https://www.google.com/maps/embed/v1/place?q=" + encodeURI(encodedLocation) + "&key=" + googleMapKey;
                return (
                    <div className="idclt-custom-field full-width">
                        <span className="title">Location:</span>
                        <h5>{location}</h5>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="item-details-location">
                                     <iframe style={{ height: '350px', width: '100%', border: '0', }} frameBorder="0"
                                        src={srcUrl}></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }

    render() {
        let percentage = 0;
        const self = this;
        if (this.props.feedback) {
            percentage = this.props.feedback.PositiveFeedbackPercentage;
        }
        return (
            <React.Fragment>
                <div className="item-detail-container">
                    <div className="container">
                        <BreadcrumbComponent itemDetails={this.props.itemDetails} />
                        <div className="idc-left">
                            <ItemInfoComponent
                                defaultPrice={this.getItemInfoPrice()}
                                itemDetails={this.props.itemDetails}
                                PositiveFeedbackPercentage={percentage}
                                ReviewAndRating={this.props.ReviewAndRating} />
                            <SellerInfoComponent
                                comparison={this.props.comparison}
                                controlFlags={this.props.controlFlags}
                                itemDetails={this.props.itemDetails}
                                merchantDetails={this.props.merchantDetails}
                                priceValues={this.props.priceValues}
                                processing={this.props.processing}
                                user={this.props.user}
                                addOrEditCart={this.props.addOrEditCart}
                                createChatChannel={this.props.createChatChannel}
                                purchaseOrder={this.purchaseOrder}
                                createComparisonDetail={this.props.createComparisonDetail}
                                deleteCartItem={this.props.deleteCartItem}
                                getChatDetails={this.props.getChatDetails}
                                getUserChannels={this.props.getUserChannels}
                                setProcessing={this.props.setProcessing}
                                showHideWidget={this.showHideWidget}
                                updateComparisonDetail={this.props.updateComparisonDetail}
                                permissions={this.props.permissions}
                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                            />
                            <ItemCustomFieldsComponent
                                itemDetails={this.props.itemDetails}
                                customContent={this.renderServiceSchedule()}
                                decodeHTMLEntities={this.decodeHTMLEntities} />
                            <CalendarComponent itemDetails={this.props.itemDetails} bookings={this.props.bookings} />
                            {this.renderLocationMap()}
                            <ReviewsComponent
                                feedback={this.props.feedback}
                                itemDetails={this.props.itemDetails}
                                ReviewAndRating={this.props.ReviewAndRating}
                                selectedFeedBack={this.props.selectedFeedBack}
                                user={this.props.user}
                                useDisplayName
                            />
                        </div>
                        <div className="idc-right">
                            <PurchaseOrderComponent
                                ref={(ref) => this.purchaseOrder = ref}
                                controlFlags={this.props.controlFlags}
                                itemDetails={this.props.itemDetails}
                                priceValues={this.props.priceValues}
                                processing={this.props.processing}
                                user={this.props.user}
                                addOrEditCart={this.props.addOrEditCart}
                                createChatChannel={this.props.createChatChannel}
                                getChatDetails={this.props.getChatDetails}
                                getUserCarts={this.props.getUserCarts}
                                getUserChannels={this.props.getUserChannels}
                                setProcessing={this.props.setProcessing}
                                generateInvoiceByCartItem={this.props.generateInvoiceByCartItem}
                                permissions={this.props.permissions}
                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                            />
                        </div>
                    </div>
                </div>
                <ComparisonWidgetComponent
                    comparison={this.props.comparison}
                    comparisonList={this.props.comparisonList}
                    comparisonToUpdate={this.props.comparisonToUpdate}
                    comparisonDetailToUpdate={this.props.comparisonDetailToUpdate}
                    controlFlags={this.props.controlFlags}
                    user={this.props.user}
                    createComparison={this.props.createComparison}
                    editComparison={this.props.editComparison}
                    deleteComparisonDetail={this.props.deleteComparisonDetail}
                    getComparison={this.props.getComparison}
                    getUserComparisons={this.props.getUserComparisons}
                    setComparisonToUpdate={this.props.setComparisonToUpdate}
                    setComparisonDetailToUpdate={this.props.setComparisonDetailToUpdate}
                    comparisonWidgetPermissions={this.props.comparisonWidgetPermissions}
                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction} />
            </React.Fragment>   
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        customFieldsDefinitions: state.itemsReducer.customFieldsDefinitions,
        feedback: state.itemsReducer.feedback,
        itemDetails: state.itemsReducer.items,
        merchantDetails: state.merchantReducer.user,
        message: state.itemsReducer.message,
        paymentTerms: state.merchantReducer.paymentTerms,
        priceValues: state.itemsReducer.priceValues,
        processing: state.itemsReducer.processing,
        ReviewAndRating: state.itemsReducer.ReviewAndRating,
        bookings: state.itemsReducer.bookings, 
        user: state.userReducer.user,
        //Comparison Widget
        comparisonList: state.comparisonReducer.comparisonList,
        comparison: state.comparisonReducer.comparison,
        comparisonToUpdate: state.comparisonReducer.comparisonToUpdate,
        comparisonDetailToUpdate: state.comparisonReducer.comparisonDetailToUpdate,

        controlFlags: state.marketplaceReducer.ControlFlags,
        comparisonWidgetPermissions: state.userReducer.comparisonWidgetPermissions,
        permissions: state.userReducer.permissions
    };
}

function mapDispatchToProps(dispatch) {
    return {
        contactSeller: () => dispatch({ type: actionTypes.LATEST_ITEMS }),
        addOrEditCart: (cartItemId, quantity, options, successCallback, failedCallback) => dispatch(ItemDetailActions.addOrEditCart(cartItemId, quantity, options, successCallback, failedCallback)),
        getUserCarts: (options, callback) => dispatch(CartActions.getUserCarts(options, callback)),
        deleteCartItem: (cartItemId, userId) => dispatch(CartActions.deleteCartItem(cartItemId, userId)),
        setProcessing: (processing) => dispatch({ type: actionTypes.PROCESSING, processing: processing }),
        getUserChannels: (options, callback) => dispatch(ChatActions.getUserChannels(options, callback)),
        createChatChannel: (options, callback) => dispatch(ChatActions.createChannel(options, callback)),
        getChatDetails: (channelId, callback) => dispatch(ChatActions.getChatDetails(channelId, callback)),
        updateUserInfo: (userInfo) => dispatch(userActions.updateUserInfo(userInfo)),
        selectedFeedBack: (feedbackId) => dispatch(ItemDetailActions.selectedFeedBack(feedbackId)),
        addReplyFeedBack: (message) => dispatch(ItemDetailActions.addReplyFeedBack(message)),
        updateMessage: (message) => dispatch(ItemDetailActions.updateMessage(message)),
        //Comparison Widget
        getUserComparisons: (createIfEmpty, namesOnly, pageSize) => dispatch(ComparisonActions.getUserComparisons(createIfEmpty, namesOnly, pageSize)),
        getComparison: (id, includes) => dispatch(ComparisonActions.getComparison(id, includes)),
        createComparison: (name) => dispatch(ComparisonActions.createComparison(name)),
        editComparison: (name) => dispatch(ComparisonActions.editComparison(name)),
        setComparisonToUpdate: (id) => dispatch(ComparisonActions.setComparisonToUpdate(id)),
        setComparisonDetailToUpdate: (id) => dispatch(ComparisonActions.setComparisonDetailToUpdate(id)),
        deleteComparisonDetail: () => dispatch(ComparisonActions.deleteComparisonDetail()),
        createComparisonDetail: (cartItemId, includes, comparisonFields) => dispatch(ComparisonActions.createComparisonDetail(cartItemId, includes, comparisonFields)),
        updateComparisonDetail: (cartItemId, quantity, subTotal, discountAmount, addOns) => dispatch(ComparisonActions.updateComparisonDetail(cartItemId, quantity, subTotal, discountAmount, addOns)),
    
        //skip cart
        generateInvoiceByCartItem: (cartItemIds, callback) => dispatch(QuotationActions.generateInvoiceByCartItem(cartItemIds, callback)),

        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback))

    }
}

module.exports = {
    mapStateToProps,
    mapDispatchToProps,
    ItemDetailMainComponent
}