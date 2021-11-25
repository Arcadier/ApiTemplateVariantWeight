'use strict';

let React = require('react');
let BaseComponent = require('../../../../shared/base');
let PricingStockComponent = require('../add-edit/pricing-stock');
let MerchantItemActions = require('../../../../../redux/merchantItemActions');
const DeliveryComponent = require('../..../../../../../merchant/item/upload-edit/delivery');

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
                    pagePermissions={this.props.pagePermissions}
                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                    itemModel={this.props.itemModel}
                    addVariant={this.props.addVariant}
                    deleteVariant={this.props.deleteVariant}
                    onItemVariantChange={this.props.onItemVariantChange}
                    onTextChange={this.props.onTextChange}
                    onToggleChange={this.props.onToggleChange}
                    sortItemVariants={this.props.sortItemVariants}
                    sortVariants={this.props.sortVariants}
                    updateVariantGroupName={this.props.updateVariantGroupName}
                    updateSelectedVariant={this.props.updateSelectedVariant}
                    selectedVariant={this.props.itemModel.selectedVariant}
                    updateSelectedVariant={this.props.updateSelectedVariant} />
                <div className="clearfix" />
                <DeliveryComponent
                    shippingModel={this.props.itemModel.shippingModel}
                    searchShippings={this.props.searchShippings}
                    shippingSelectedChanged={this.props.shippingSelectedChanged} />
                <div className="clearfix" />
                <div className="col-md-12">
                    <div className="item-upload-btn">
                        <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                            <div className="btn-upload" id="btnItemUpload"onClick={() => this.props.uploadOrEditItem()}>Add Item</div>
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
        modalStatus: state.uploadEditItemReducer.modalStatus
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
        uploadOrEditData: () => dispatch(MerchantItemActions.uploadOrEditData())
    };
}

module.exports = {
    PricingFeatureComponent,
    mapStateToProps,
    mapDispatchToProps
}
