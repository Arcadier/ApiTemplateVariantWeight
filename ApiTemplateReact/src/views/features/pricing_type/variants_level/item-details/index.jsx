'use strict';
const React = require('react');
const BaseComponent = require('../../../../../views/shared/base');
const BreadcrumbComponent = require('../../../../../views/item/breadcrumb');
const ItemCustomFieldsComponent = require('../../../../../views/item/item-custom-fields');

const ItemInfoComponent = require('../../../../item/item-info');
const PurchaseOrderComponent = require('../../../../item/purchase-order');
const ReviewsComponent = require('../../../../item/reviews');
const SellerInfoComponent = require('../../../../item/seller-info');

const ComparisonWidgetComponent = require('../../../../comparison/comparison-widget/index');

const ComparisonActions = require('../../../../../redux/comparisonActions');
const ItemDetailActions = require('../../../../../redux/itemDetailsActions');
const ChatActions = require('../../../../../redux/chatActions');
const CartActions = require('../../../../../redux/cartActions');
const userActions = require('../../../../../redux/userActions');
const actionTypes = require('../../../../../redux/actionTypes');
import { validatePermissionToPerformAction } from '../../../../../redux/accountPermissionActions';

class ItemDetailMainComponent extends BaseComponent {
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

    renderDefaultPaymentTerm() {
        if (this.props.paymentTerms && this.props.paymentTerms.length > 0) {
            const defaultPaymentTerm = this.props.paymentTerms.find(p => p.Default);
            if (!defaultPaymentTerm) return;
            return (
                <div className="idcrb-bot">
                    <span className="title">Payment Terms</span>
                    <div className="payment-terms-box">
                        <div><span className="title">{defaultPaymentTerm.Name}</span></div>
                        <div>{defaultPaymentTerm.Description}</div>
                    </div>
                </div>
            );
        }
        return;
    }

    render() {
        let percentage = 0;
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
                                decodeHTMLEntities={this.decodeHTMLEntities} />
                            <ReviewsComponent
                                feedback={this.props.feedback}
                                itemDetails={this.props.itemDetails}
                                ReviewAndRating={this.props.ReviewAndRating}
                                selectedFeedBack={this.props.selectedFeedBack}
                                user={this.props.user} />
                        </div>
                        <div className="idc-right">
                            <PurchaseOrderComponent
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
                                updateQuantity={this.props.updateQuantity}
                                permissions={this.props.permissions}
                                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                            />
                            {this.renderDefaultPaymentTerm()}
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
        updateQuantity: (quantity, price, bulkDiscounts) => dispatch(ItemDetailActions.updateQuantity(quantity, price, bulkDiscounts)),
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
        updateComparisonDetail: (cartItemId, quantity, subTotal, discountAmount) => dispatch(ComparisonActions.updateComparisonDetail(cartItemId, quantity, subTotal, discountAmount)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback))
    }
}

module.exports = {
    mapStateToProps,
    mapDispatchToProps,
    ItemDetailMainComponent
}