'use strict';
let React = require('react');
let BaseComponent = require('../../../../shared/base');
let PricingComponent = require('../add-edit/pricing');
let MerchantItemActions = require('../../../../../redux/merchantItemActions');
const DeliveryComponent = require('../..../../../../../merchant/item/upload-edit/delivery');
const VariantComponent = require('./variant');

const { validatePermissionToPerformAction } = require('../../../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PricingFeatureComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const self = this;

        //create availability fields if not exist
        if (self.props.itemModel.moqCode === null || self.props.itemModel.moqCode === "") {
            self.props.createCustomField({
                'Name': 'MOQ',
                'DataInputType': 'number',
                'DataFieldType': 'decimal',
                'ReferenceTable': 'Items',
                'GroupName': 'Availability'
            });
        }

        //create availability fields if not exist
        if (self.props.itemModel.weightCode === null || self.props.itemModel.weightCode === "") {
            self.props.createCustomField({
                'Name': 'Weight',
                'DataInputType': 'number',
                'DataFieldType': 'decimal',
                'ReferenceTable': 'Items',
                'GroupName': 'Availability'
            });
        }

        if (self.props.itemModel.bulkPricingCode === null || self.props.itemModel.bulkPricingCode === "") {
            self.props.createCustomField({
                'Name': 'BulkPricing',
                'DataInputType': 'textfield',
                'DataFieldType': 'string',
                'ReferenceTable': 'Items',
                'GroupName': 'Availability'
            });
        }

        if (self.props.itemModel.countryCode === null || self.props.itemModel.countryCode === "") {
            self.props.createCustomField({
                'Name': 'CountryCode',
                'DataInputType': 'textfield',
                'DataFieldType': 'string',
                'ReferenceTable': 'Items',
                'GroupName': 'Availability'
            });
        }
    }

    next(event) {
        event.preventDefault();
        this.props.showTab('pricing_tab');
    }

    back(event) {
        event.preventDefault();

        this.props.showTab('basic_tab');
    }

    render() {
        return (
            <React.Fragment>
                <DeliveryComponent
                    shippingModel={this.props.itemModel.shippingModel}
                    searchShippings={this.props.searchShippings}
                    shippingSelectedChanged={this.props.shippingSelectedChanged} />
                <div className="clearfix" />
                <VariantComponent {...this.props} />
                <div className="clearfix" />
                <div className=" col-sm-12 tab-nextprevbtn-act">
                    <a href="#" className="my-btn btn-next-variation" style={{ display: 'inline-block' }} onClick={(e) => this.next(e)}>Next</a>
                    <a href="#" className="my-btn btn-back-variation" style={{ display: 'none' }} onClick={(e) => this.back(e)}>Back</a>
                </div>
                <div className="clearfix" />
                <PricingComponent
                    ref={(ref) => this.pricingList = ref}
                    {...this.props} />
                <div className="clearfix" />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
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

        closeDeletePopUp: () => dispatch(MerchantItemActions.closeDeletePopUp()),
        createCustomField: (data) => dispatch(MerchantItemActions.createCustomField(data)),
        onPriceChanged: (e, countryCode) => dispatch(MerchantItemActions.onPriceChanged(e, countryCode)),
        saveBulkPricing: (locationId, bulkPricing) => dispatch(MerchantItemActions.saveBulkPricing(locationId, bulkPricing)),
        setBulkToDeleteCountryCode: (countryCode, index) => dispatch(MerchantItemActions.setBulkToDeleteCountryCode(countryCode, index)),
        SkuMoqStockChange: (e, type, locationId) => dispatch(MerchantItemActions.SkuMoqStockChange(e, type, locationId)),
        unliOrPurchasableChanged: (type, countryCode) => dispatch(MerchantItemActions.unliOrPurchasableChanged(type, countryCode)),
        updateSpotOrNegotiateButton: (button) => dispatch(MerchantItemActions.updateSpotOrNegotiateButton(button)),
        validateNonPricingDetails: (callback) => dispatch(MerchantItemActions.validateNonPricingDetails(callback)),

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

        addVariant: (groupId, variantName) => dispatch(MerchantItemActions.addVariant(groupId, variantName)),
        deleteVariant: (variantId) => dispatch(MerchantItemActions.deleteVariant(variantId)),
        deleteVariantGroup: (variantGroupId) => dispatch(MerchantItemActions.deleteVariantGroup(variantGroupId)),
        onItemVariantChange: (itemId, code, value, locationId) => dispatch(MerchantItemActions.onItemVariantChange(itemId, code, value, locationId)),
        sortItemVariants: () => dispatch(MerchantItemActions.sortItemVariants()),
        sortVariantGroups: (variantGroups) => dispatch(MerchantItemActions.sortVariantGroups(variantGroups)),
        sortVariants: (groupId, variants) => dispatch(MerchantItemActions.sortVariants(groupId, variants)),
        updateSelectedVariant: (variantId, name, isSubmit) => dispatch(MerchantItemActions.updateSelectedVariant(variantId, name, isSubmit)),
        updateVariantGroupName: (groupId, name) => dispatch(MerchantItemActions.updateVariantGroupName(groupId, name)),

        addLocations: (locationIds) => dispatch(MerchantItemActions.addLocations(locationIds)),
        removeAllLocations: () => dispatch(MerchantItemActions.removeAllLocations()),
        removeLocation: (locationId) => dispatch(MerchantItemActions.removeLocation(locationId)),
    };
}

module.exports = {
    PricingFeatureComponent,
    mapStateToProps,
    mapDispatchToProps
}