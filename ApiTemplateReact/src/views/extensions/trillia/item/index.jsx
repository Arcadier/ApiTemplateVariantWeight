'use strict';
var React = require('react');
var BaseComponent = require('../../../../views/shared/base');
var BreadcrumbComponent = require('../../../../views/item/breadcrumb');
var ItemCustomFieldsComponent = require('../../../../views/item/item-custom-fields');

var ItemInfoComponent = require('./item-info');
var SellerInfoComponent = require('./seller-info');
var PurchaseOrderComponent = require('./purchase-order');

var BulkPricingComponent = require('./bulk-pricing');
var ComparisonWidgetComponent = require('../comparison/comparison-widget/index');

var ItemDetailActions = require('../../../../redux/itemDetailsActions');
var ComparisonActions = require('../../../../redux/comparisonActions');
var ChatActions = require('../../../../redux/chatActions');
var actionTypes = require('../../../../redux/actionTypes');

class ItemDetailMainComponent extends BaseComponent {
    //TODO: find a way to call this same method from ComparisonWidget component (refs not working)
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



    render() {
        return (
            <React.Fragment>
                <div className="item-detail-container">
                    <div className="container">
                        <BreadcrumbComponent itemDetails={this.props.itemDetails} />
                        <div className="idc-left">
                            <ItemInfoComponent countryCode={this.props.countryCode} itemDetails={this.props.itemDetails} />
                            <SellerInfoComponent merchantDetails={this.props.merchantDetails}
                                countryCode={this.props.countryCode}
                                getUserChannels={this.props.getUserChannels}
                                createChatChannel={this.props.createChatChannel}
                                itemDetails={this.props.itemDetails}
                                user={this.props.user}/>
                            <ItemCustomFieldsComponent itemDetails={this.props.itemDetails} decodeHTMLEntities={this.decodeHTMLEntities} />
                        </div>
                        <div className="idc-right">
                            <PurchaseOrderComponent
                                countryCode={this.props.countryCode}
                                itemDetails={this.props.itemDetails}
                                updateQuantity={this.props.updateQuantity}
                                priceValues={this.props.priceValues}
                                bulkDiscounts={this.props.bulkDiscounts}
                                comparison={this.props.comparison}
                                addOrEditCart={this.props.addOrEditCart}
                                createComparisonDetail={this.props.createComparisonDetail}
                                updateComparisonDetail={this.props.updateComparisonDetail}
                                showHideWidget={this.showHideWidget}
                                processing={this.props.processing}
                                setProcessing={this.props.setProcessing}
                                user={this.props.user}
                                getUserChannels={this.props.getUserChannels}
                                createChatChannel={this.props.createChatChannel}
                                haveBulk={this.props.haveBulk}
                                getChatDetails={this.props.getChatDetails}
                            />
                            <BulkPricingComponent itemDetails={this.props.itemDetails} countryCode={this.props.countryCode}
                                haveBulk={this.props.haveBulk}
                            />
                        </div>
                    </div>
                </div>
                <ComparisonWidgetComponent
                    comparisonList={this.props.comparisonList}
                    comparison={this.props.comparison}
                    comparisonToUpdate={this.props.comparisonToUpdate}
                    comparisonDetailToUpdate={this.props.comparisonDetailToUpdate}
                    getUserComparisons={this.props.getUserComparisons}
                    getComparison={this.props.getComparison}
                    createComparison={this.props.createComparison}
                    editComparison={this.props.editComparison}
                    setComparisonToUpdate={this.props.setComparisonToUpdate}
                    setComparisonDetailToUpdate={this.props.setComparisonDetailToUpdate}
                    deleteComparisonDetail={this.props.deleteComparisonDetail} />
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
        bulkDiscounts: state.itemsReducer.bulkDiscounts,
        customFieldsDefinitions: state.itemsReducer.customFieldsDefinitions,
        processing: state.itemsReducer.processing,
        haveBulk: state.itemsReducer.haveBulk,
        //Comparison Widget
        comparisonList: state.comparisonReducer.comparisonList,
        comparison: state.comparisonReducer.comparison,
        comparisonToUpdate: state.comparisonReducer.comparisonToUpdate,
        comparisonDetailToUpdate: state.comparisonReducer.comparisonDetailToUpdate,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        contactSeller: () => dispatch({ type: actionTypes.LATEST_ITEMS }),
        updateQuantity: (e, price, bulkDiscounts) => dispatch(ItemDetailActions.updateQuantity(e.target.value, price, bulkDiscounts)),
        addOrEditCart: (cartItemId, quantity, discount, itemId, force, successCallback, failedCallback) => dispatch(ItemDetailActions.addOrEditCart(cartItemId, quantity, discount, itemId, force, successCallback, failedCallback)),
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

        setProcessing: (processing) => dispatch({ type: actionTypes.PROCESSING, processing: processing }),
        getUserChannels: (options, callback) => dispatch(ChatActions.getUserChannels(options, callback)),
        createChatChannel: (options, callback) => dispatch(ChatActions.createChannel(options, callback)),
        getChatDetails: (channelId, callback) => dispatch(ChatActions.getChatDetails(channelId, callback))
    }
}


module.exports = {
    mapStateToProps,
    mapDispatchToProps,
    ItemDetailMainComponent
}