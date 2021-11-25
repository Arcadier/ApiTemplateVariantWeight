'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');
var MainComponent = require('../../../../../merchant/item/upload-edit/main');
var PricingStockComponent = require('./pricing-stock');
var ModalEditVariantComponent = require('./modal-edit-variant');
var MerchantItemActions = require('../../../../../../redux/merchantItemActions');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class UploadEditComponent extends BaseComponent {
    renderPricingStock() {
        return (
            <PricingStockComponent
                itemModel={this.props.itemModel}
                addVariant={this.props.addVariant}
                deleteVariant={this.props.deleteVariant}
                onItemVariantChange={this.props.onItemVariantChange}
                onTextChange={this.props.onTextChange}
                onToggleChange={this.props.onToggleChange}
                sortItemVariants={this.props.sortItemVariants}
                sortVariants={this.props.sortVariants}
                updateVariantGroupName={this.props.updateVariantGroupName}
                updateSelectedVariant={this.props.updateSelectedVariant} />
        );
    }

    renderVariantModal() {
        return (
            <ModalEditVariantComponent
                selectedVariant={this.props.itemModel.selectedVariant}
                updateSelectedVariant={this.props.updateSelectedVariant} />
        );
    }

    render() {
        return (
            <MainComponent {...this.props}
                renderPricingStock={this.renderPricingStock()}
                renderVariantModal={this.renderVariantModal()} />
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
        itemModel: state.uploadEditItemReducer.itemModel,
        pricingItem: state.uploadEditItemReducer.pricingItem,
        modalStatus: state.uploadEditItemReducer.modalStatus
    };
}

function mapDispatchToProps(dispatch) {
    return {
        addVariant: (groupId, variantName) => dispatch(MerchantItemActions.addVariant(groupId, variantName)),
        deleteVariant: (variantId) => dispatch(MerchantItemActions.deleteVariant(variantId)),
        checkboxClickedCustomField: (value, code) => dispatch(MerchantItemActions.checkboxClickedCustomField(value, code)),
        dropDownChange: (e, code) => dispatch(MerchantItemActions.dropDownChange(e, code)),
        onItemVariantChange: (itemId, code, value) => dispatch(MerchantItemActions.onItemVariantChange(itemId, code, value)),
        onTextChange: (value, code) => dispatch(MerchantItemActions.onTextChange(value, code)),
        onToggleChange: (value, code) => dispatch(MerchantItemActions.onToggleChange(value, code)),
        removeImage: (i) => dispatch(MerchantItemActions.removeImage(i)),
        searchShippings: (e) => dispatch(MerchantItemActions.searchShippings(e)),
        selectAllOrNone: (selectAll) => dispatch(MerchantItemActions.selectAllOrNone(selectAll)),
        selectUnselectCategory: (categoryID) => dispatch(MerchantItemActions.selectUnselectCategory(categoryID)),
        setPDFFile: (file, code) => dispatch(MerchantItemActions.setPDFFile(file)),
        setUploadFile: (file) => dispatch(MerchantItemActions.setUploadFile(file)),
        shippingSelectedChanged: (type, id) => dispatch(MerchantItemActions.shippingSelectedChanged(type, id)),
        sortItemVariants: () => dispatch(MerchantItemActions.sortItemVariants()),
        sortVariants: (groupId, variants) => dispatch(MerchantItemActions.sortVariants(groupId, variants)),
        updateCategoryToSearch: (e) => dispatch(MerchantItemActions.updateCategoryToSearch(e)),
        updateVariantGroupName: (groupId, name) => dispatch(MerchantItemActions.updateVariantGroupName(groupId, name)),
        updateSelectedVariant: (variantId, name, isSubmit) => dispatch(MerchantItemActions.updateSelectedVariant(variantId, name, isSubmit)),
        uploadOrEditData: () => dispatch(MerchantItemActions.uploadOrEditData())
    };
}

const UploadEditHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(UploadEditComponent);

module.exports = {
    UploadEditHome,
    UploadEditComponent
};