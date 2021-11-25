'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');
var MainComponent = require('../../../../../merchant/item/upload-edit/main');
var CountryComponent = require('./country');
var AvailabilityComponent = require('./availability');
var PricingComponent = require('./pricing');
let PricingModalComponent = require('./pricing-modal');
var MerchantItemActions = require('../../../../../../redux/merchantItemActions');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class UploadEditComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.editPricingItem = this.editPricingItem.bind(this);
        this.saveBulkPricing = this.saveBulkPricing.bind(this);
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

    editPricingItem(countryCode) {
        const editPricingItem = this.props.itemModel.pricing.find((pricing) => pricing.countryCode == countryCode);
        this.editPricingDetail.setPricing(editPricingItem);
        if (editPricingItem.bulkPricing.length > 0) {
            let records = JSON.parse(editPricingItem.bulkPricing).find(function (price) { return price.Onward === "1" });
            if (records != undefined && records != null
                && $.isArray(records) ? records.length > 0 : ($.isPlainObject(records) && !$.isEmptyObject(records))) {

                this.editPricingDetail.setState({ errorMessages: ["Unable to add new calculation if latest is set to 'onwards'"] });
            }
        }

        $('#myModalEditPricing').modal('show');
        $('#modalRemove').modal('hide');
        $('div#myModalEditPricing .modal-content, #myModalEditPricing .bulk-pricing > ul').niceScroll({
            cursorcolor: "#b3b3b3", zindex: "99999999", cursorwidth: "6px",
            cursorborderradius: "5px", cursorborder: "1px solid transparent",
            touchbehavior: true
        });
    }

    saveBulkPricing(countryCode, bulkPricing) {
        let updatedPricing = this.props.itemModel.pricing.map(pricing => {
            if (pricing.countryCode === countryCode) {
                pricing.bulkPricing = JSON.stringify(bulkPricing);
            }
            return pricing;
        });

        this.props.saveBulkPricing(updatedPricing);
        this.pricingList.refreshPricing(updatedPricing);
    }

    renderCountry() {
        return (
            <CountryComponent
                countries={this.props.itemModel.countries}
                addCountries={this.props.addCountries}
                removeCountry={this.props.removeCountry}
                removeAllCountries={this.props.removeAllCountries} />  
        );
    }

    renderAvailability() {
        return (
            <AvailabilityComponent
                availabilities={this.props.itemModel.availabilities}
                SkuMoqStockChange={this.props.SkuMoqStockChange}
                unliOrPurchasableChanged={this.props.unliOrPurchasableChanged} />
        );
    }

    renderPricing() {
        return (
            <PricingComponent
                ref={(ref) => this.pricingList = ref}
                pricing={this.props.itemModel.pricing}
                onPriceChanged={this.props.onPriceChanged}
                editPricingItem={this.editPricingItem}
                formatMoney={this.renderFormatMoney} />  
        );
    }

    renderPricingModal() {
        return (
            <React.Fragment>
                <div id="myModalEditPricing" className="modal fade" role="dialog">
                    <PricingModalComponent
                        ref={(ref) => this.editPricingDetail = ref}
                        bulkToDeleteCountryCode={this.props.itemModel.bulkToDeleteCountryCode}
                        pricing={this.props.itemModel.pricing}
                        saveBulkPricing={this.saveBulkPricing}
                        pricingItem={this.props.pricingItem}
                        formatMoney={this.renderFormatMoney}
                        setBulkToDeleteCountryCode={this.props.setBulkToDeleteCountryCode}
                        closeDeletePopUp={this.props.closeDeletePopUp} />
                </div>
                <div id="modalRemove" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal" onClick={() => this.props.closeDeletePopUp()}>Cancel</div>
                                <div className="btn-green" onClick={() => this.editPricingDetail.removeBulkPrice()} id="btnRemove">Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    render() {
        return (
            <MainComponent {...this.props}
                renderCountry={this.renderCountry()}
                renderAvailability={this.renderAvailability()}
                renderPricing={this.renderPricing()}
                renderPricingModal={this.renderPricingModal()}/>
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
        checkboxClickedCustomField: (value, code) => dispatch(MerchantItemActions.checkboxClickedCustomField(value, code)),
        dropDownChange: (e, code) => dispatch(MerchantItemActions.dropDownChange(e, code)),
        onTextChange: (e, code) => dispatch(MerchantItemActions.onTextChange(e, code)),
        removeImage: (i) => dispatch(MerchantItemActions.removeImage(i)),
        searchShippings: (e) => dispatch(MerchantItemActions.searchShippings(e)),
        selectAllOrNone: (selectAll) => dispatch(MerchantItemActions.selectAllOrNone(selectAll)),
        selectUnselectCategory: (categoryID) => dispatch(MerchantItemActions.selectUnselectCategory(categoryID)),
        setPDFFile: (file, code) => dispatch(MerchantItemActions.setPDFFile(file)),
        shippingSelectedChanged: (type, id) => dispatch(MerchantItemActions.shippingSelectedChanged(type, id)),
        updateCategoryToSearch: (e) => dispatch(MerchantItemActions.updateCategoryToSearch(e)),
        uploadOrEditData: () => dispatch(MerchantItemActions.uploadOrEditData()),

        addCountries: (countries) => dispatch(MerchantItemActions.addCountries(countries)),
        closeDeletePopUp: () => dispatch(MerchantItemActions.closeDeletePopUp()),
        createCustomField: (data) => dispatch(MerchantItemActions.createCustomField(data)),
        onPriceChanged: (e, countryCode) => dispatch(MerchantItemActions.onPriceChanged(e, countryCode)),
        removeAllCountries: () => dispatch(MerchantItemActions.removeAllCountries()),
        removeCountry: (country) => dispatch(MerchantItemActions.removeCountry(country)),
        saveBulkPricing: (bulkPricing) => dispatch(MerchantItemActions.saveBulkPricing(bulkPricing)),
        setBulkToDeleteCountryCode: (countryCode, index) => dispatch(MerchantItemActions.setBulkToDeleteCountryCode(countryCode, index)),
        setUploadFile: (file) => dispatch(MerchantItemActions.setUploadFile(file)),
        SkuMoqStockChange: (e, type, countryCode) => dispatch(MerchantItemActions.SkuMoqStockChange(e, type, countryCode)),
        unliOrPurchasableChanged: (type, countryCode) => dispatch(MerchantItemActions.unliOrPurchasableChanged(type, countryCode)),
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