'use strict';
var React = require('react');
var BaseComponent = require('../../../../views/shared/base');
var BreadcrumbComponent = require('../../../../views/item/breadcrumb');
var ItemCustomFieldsComponent = require('../../../../views/item/item-custom-fields');

var ItemInfoComponent = require('./item-info');
var SellerInfoComponent = require('./seller-info');
var PurchaseOrderComponent = require('./purchase-order');
var ReviewsComponent = require('./reviews.jsx');

var ItemDetailActions = require('../../../../redux/itemDetailsActions');
var ChatActions = require('../../../../redux/chatActions');
var CartActions = require('../../../../redux/cartActions');
var userActions = require('../../../../redux/userActions');
var actionTypes = require('../../../../redux/actionTypes');

class ItemDetailMainComponent extends BaseComponent {

    render() {
        return (
            <React.Fragment>
                <div className="item-detail-container">
                    <div className="container">
                        <BreadcrumbComponent itemDetails={this.props.itemDetails} />
                        <div className="idc-left">
                            <ItemInfoComponent countryCode={this.props.countryCode} itemDetails={this.props.itemDetails} PositiveFeedbackPercentage={this.props.feedback.PositiveFeedbackPercentage} />
                            <SellerInfoComponent merchantDetails={this.props.merchantDetails}
                                itemDetails={this.props.itemDetails}
                                user={this.props.user}/>
                            <ItemCustomFieldsComponent itemDetails={this.props.itemDetails} decodeHTMLEntities={this.decodeHTMLEntities} />
                            <ReviewsComponent feedback={this.props.feedback}/>
                        </div>
                        <div className="idc-right">
                            <PurchaseOrderComponent
                                itemDetails={this.props.itemDetails}
                                addOrEditCart={this.props.addOrEditCart}
                                updateSubTotal={this.props.updateSubTotal}
                                priceValues={this.props.priceValues}
                                processing={this.props.processing}
                                setProcessing={this.props.setProcessing}
                                getUserCarts={this.props.getUserCarts}
                                user={this.props.user}
                                getUserChannels={this.props.getUserChannels}
                                createChatChannel={this.props.createChatChannel}
                                updateUserInfo={this.props.updateUserInfo}
                            />
                        </div>
                    </div>
                </div>
            </React.Fragment>   
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        merchantDetails: state.merchantReducer.user,
        user: state.userReducer.user,
        countryCode: state.itemsReducer.countryCode,
        itemDetails: state.itemsReducer.items,
        priceValues: state.itemsReducer.priceValues,
        customFieldsDefinitions: state.itemsReducer.customFieldsDefinitions,
        processing: state.itemsReducer.processing,
        feedback: state.itemsReducer.feedback,
        ReviewAndRating:state.itemsReducer.ReviewAndRating
    };
}

function mapDispatchToProps(dispatch) {
    return {
        contactSeller: () => dispatch({ type: actionTypes.LATEST_ITEMS }),
        updateSubTotal: (quantity, price) => dispatch(ItemDetailActions.updateSubTotal(quantity, price)),
        addOrEditCart: (cartItemId, quantity, discount, itemId, force, successCallback, failedCallback) => dispatch(ItemDetailActions.addOrEditCart(cartItemId, quantity, discount, itemId, force, successCallback, failedCallback)),
        getUserCarts: (options, callback) => dispatch(CartActions.getUserCarts(options, callback)),
        setProcessing: (processing) => dispatch({ type: actionTypes.PROCESSING, processing: processing }),
        getUserChannels: (options, callback) => dispatch(ChatActions.getUserChannels(options, callback)),
        createChatChannel: (options, callback) => dispatch(ChatActions.createChannel(options, callback)),
        updateUserInfo: (userInfo) => dispatch(userActions.updateUserInfo(userInfo))
    }
}


module.exports = {
    mapStateToProps,
    mapDispatchToProps,
    ItemDetailMainComponent
}