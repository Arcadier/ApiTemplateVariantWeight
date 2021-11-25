'use strict';

let React = require('react');
let BaseComponent = require('../../../../shared/base');
let PricingStockComponent = require('../add-edit/pricing-stock');
let MerchantItemActions = require('../../../../../redux/merchantItemActions');
const DeliveryComponent = require('../..../../../../../merchant/item/upload-edit/delivery');
let ScheduleComponent = require('../add-edit/schedule');
let LocationMapComponent = require('../add-edit/location-map');

const PermissionTooltip = require('../../../../common/permission-tooltip');

const { validatePermissionToPerformAction } = require('../../../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PricingFeatureComponent extends BaseComponent {
    render() {
        return (
            <React.Fragment>
                <PricingStockComponent
                    itemModel={this.props.itemModel}
                    onToggleChange={this.props.onToggleChange}
                    onTextChange={this.props.onTextChange}
                    durationChanged={this.props.durationChanged}
                    bookingTypeChanged={this.props.bookingTypeChanged}
                    dayOrNightSwitch={this.props.dayOrNightSwitch}
                    addOnAdd={this.props.addOnAdd}
                    addOnDelete={this.props.addOnDelete}/>
                <div className="clearfix" />
                <ScheduleComponent itemModel={this.props.itemModel}
                    onToggleChange={this.props.onToggleChange}
                    handleItemChange={this.props.handleItemChange}
                    addBlockDate={this.props.addBlockDate}
                    deleteBlockDate={this.props.deleteBlockDate}
                    bookings={this.props.bookings}
                />
                <LocationMapComponent itemModel={this.props.itemModel}
                    locationChanged={this.props.locationChanged}/>
                <DeliveryComponent
                    shippingModel={this.props.itemModel.shippingModel}
                    searchShippings={this.props.searchShippings}
                    shippingSelectedChanged={this.props.shippingSelectedChanged} />
                <div className="clearfix" />
                <div className="col-md-12">
                    <div className="item-upload-btn">
                        <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                            <div className="btn-upload" id="btnItemUpload" onClick={() => this.props.uploadOrEditItem()}>Add Item</div>
                        </PermissionTooltip>
                    </div>
                </div>
            </React.Fragment>
        );
    }

}

function mapStateToProps(state, ownProps) {
    if (state.uploadEditItemReducer.modalStatus.openDeleteBulkPopUp) {
        $('#modalRemove').modal('show');
    } else {
        $('#modalRemove').modal('hide');
    }

    return {
        user: state.userReducer.user,
        pagePermissions: state.userReducer.pagePermissions,
        itemModel: state.uploadEditItemReducer.itemModel,
        pricingItem: state.uploadEditItemReducer.pricingItem,
        modalStatus: state.uploadEditItemReducer.modalStatus,
        bookings: state.uploadEditItemReducer.bookings
    };
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),

        addVariant: (groupId, variantName) => dispatch(MerchantItemActions.addVariant(groupId, variantName)),
        deleteVariant: (variantId) => dispatch(MerchantItemActions.deleteVariant(variantId)),
        updateVariantGroupName: (groupId, name) => dispatch(MerchantItemActions.updateVariantGroupName(groupId, name)),
        updateSelectedVariant: (variantId, name, isSubmit) => dispatch(MerchantItemActions.updateSelectedVariant(variantId, name, isSubmit)),
        sortItemVariants: () => dispatch(MerchantItemActions.sortItemVariants()),
        sortVariants: (groupId, variants) => dispatch(MerchantItemActions.sortVariants(groupId, variants)),
        onItemVariantChange: (itemId, code, value) => dispatch(MerchantItemActions.onItemVariantChange(itemId, code, value)),
        updateSpotOrNegotiateButton: (button) => dispatch(MerchantItemActions.updateSpotOrNegotiateButton(button)),

        checkboxClickedCustomField: (value, code) => dispatch(MerchantItemActions.checkboxClickedCustomField(value, code)),
        dropDownChange: (e, code) => dispatch(MerchantItemActions.dropDownChange(e, code)),
        onTextChange: (value, code) => dispatch(MerchantItemActions.onTextChange(value, code)),
        onToggleChange: (value, code) => dispatch(MerchantItemActions.onToggleChange(value, code)),
        removeImage: (i) => dispatch(MerchantItemActions.removeImage(i)),
        searchShippings: (e) => dispatch(MerchantItemActions.searchShippings(e)),
        selectAllOrNone: (selectAll) => dispatch(MerchantItemActions.selectAllOrNone(selectAll)),
        selectUnselectCategory: (categoryID) => dispatch(MerchantItemActions.selectUnselectCategory(categoryID)),
        setPDFFile: (file, code) => dispatch(MerchantItemActions.setPDFFile(file)),
        setUploadFile: (file) => dispatch(MerchantItemActions.setUploadFile(file)),
        shippingSelectedChanged: (type, id) => dispatch(MerchantItemActions.shippingSelectedChanged(type, id)),
        updateCategoryToSearch: (e) => dispatch(MerchantItemActions.updateCategoryToSearch(e)),
        uploadOrEditData: () => dispatch(MerchantItemActions.uploadOrEditData()),

        locationChanged: (data) => dispatch(MerchantItemActions.locationChanged(data)),
        durationChanged: (data) => dispatch(MerchantItemActions.durationChanged(data)),
        bookingTypeChanged: (data) => dispatch(MerchantItemActions.bookingTypeChanged(data)),
        dayOrNightSwitch: (data) => dispatch(MerchantItemActions.dayOrNightSwitch(data)),
        addOnAdd: (data) => dispatch(MerchantItemActions.addOnAdd(data)),
        addOnDelete: (data) => dispatch(MerchantItemActions.addOnDelete(data)),
        handleItemChange: (data) => dispatch(MerchantItemActions.handleItemChange(data)),
        addBlockDate: (data) => dispatch(MerchantItemActions.addBlockDate(data)),
        deleteBlockDate: (data) => dispatch(MerchantItemActions.deleteBlockDate(data))
    };
}

module.exports = {
    PricingFeatureComponent,
    mapStateToProps,
    mapDispatchToProps
}
