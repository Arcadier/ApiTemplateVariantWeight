'use strict'
const React = require('react');
const BaseComponent = require('../../../../shared/base');
const PricingModalComponent = require('./pricing-modal');

const PermissionTooltip = require('../../../../common/permission-tooltip');

class LocationComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.currencyCode = props.itemModel.currencyCode;

        this.locationIdToRemove = '';
    }

    componentDidMount() {
        $("body").on("click", ".btn-pricing-toggle", function () {
            $(this).closest("tr").next("tr").slideToggle('slow');
            $(this).toggleClass("active");
        });

        $("body").on("click", ".delete-con-row", function () {
            var $parent = $(this).parents("tr");
            $parent.addClass("modal-delete-open");
            $("#modalRemove").modal("show");
        });

        console.log('LocationComponent', this.props)
    }

    showPricingModal(locationItem) {
        const self = this;

        this.props.validatePermissionToPerformAction("add-merchant-create-item-api", () => {
            const { pricing } = locationItem;
            self.pricingModal.setPricing(Object.assign({}, pricing));

            if (pricing.bulkPricing.length > 0) {
                const records = JSON.parse(pricing.bulkPricing).find((price) => { return price.Onward === "1" });
                if (typeof records != 'undefined' && records != null
                    && $.isArray(records) ? records.length > 0 : ($.isPlainObject(records) && !$.isEmptyObject(records))) {

                    self.pricingModal.setState({ errorMessages: ["Unable to add new calculation if latest is set to 'onwards'"] });
                }
            }

            $('#myModalEditPricing').modal('show');
            $('#myModalEditPricing .modal-content, #myModalEditPricing .bulk-pricing').niceScroll({
                cursorcolor: "#b3b3b3", zindex: "99999999", cursorwidth: "6px",
                cursorborderradius: "5px", cursorborder: "1px solid transparent",
                touchbehavior: true
            });
        });
    }

    browseImage(locationId, itemVariantId) {
        this.props.validatePermissionToPerformAction("add-merchant-create-item-api", () => {
            $(".tools").addClass("hide");
            var canvas = document.getElementById("visbleCanvas");

            if ($(".imageBox").find(canvas).length !== 0) {
                canvas.remove();
            }

            $(".upload-wapper > .upload-wrapper-container > input").val("");
            $(".upload-wapper > .upload-wrapper-container > input").attr("data-location-id", locationId);
            $(".upload-wapper > .upload-wrapper-container > input").attr("data-variant-id", itemVariantId);
        });
    }

    getLocationGroupName() {
        const { locations } = this.props.itemModel;

        if (locations && locations.length > 0) {
            return locations[0].GroupName;
        }

        return '';
    }

    showRemoveLocationModal(locationId) {
        this.props.validatePermissionToPerformAction("delete-merchant-create-item-api", () => {
            const $modal = $('#modalRemoveLocation');
            const $button = $modal.find('#btnRemove')

            $button.attr('data-location-id', locationId);
            this.locationIdToRemove = locationId;
            $modal.modal('show');
        });
    }

    removeLocation(event) {
        this.props.validatePermissionToPerformAction("delete-merchant-create-item-api", () => {
            let locationId = $(event.target).attr('data-location-id');
            if (!locationId) {
                locationId = this.locationIdToRemove;
            }

            $('.sol-option input[value="' + locationId + '"]').removeAttr('checked');
            this.props.removeLocation(locationId);

            $('#modalRemoveLocation').modal('hide');
        });
    }

    renderPricingModal() {
        return (
            <PricingModalComponent
                validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                ref={(ref) => this.pricingModal = ref}
                closeDeletePopUp={this.props.closeDeletePopUp}
                saveBulkPricing={this.props.saveBulkPricing} />
        );
    }

    renderDiscount(bulkPricing, currencyCode) {
        const self = this;
        let bulkDiscount = "";

        if (bulkPricing.length > 0) {
            const data = JSON.parse(bulkPricing);

            return data.map((bulk, i) => {
                if (bulk.IsFixed == '0') {
                    bulkDiscount = bulk.Discount + '%';
                }

                if (bulk.IsFixed !== '0') {
                    bulkDiscount = bulk.Discount;
                    return (
                        <span key={i}>{self.formatMoney(currencyCode, bulkDiscount)}</span>
                    );
                } else {
                    return (
                        <span key={i}>{bulkDiscount}</span>
                    );
                }
            });
        }
    }

    renderBulkPricing(bulkPricing) {
        if (bulkPricing.length > 0) {
            const data = JSON.parse(bulkPricing);

            return data.map((bulk, i) => {
                if (bulk.Onward == '1') {
                    return (
                        <span key={i}>
                            &ge; {bulk.OnwardPrice}
                        </span>
                    )
                }

                return (
                    <span key={i}>
                        {bulk.RangeStart + ' - ' + bulk.RangeEnd}
                    </span>
                );
            });
        }
    }

    renderVariantHeaders(locationItem) {
        const { itemModel } = this.props;
        const { locationId, itemVariants } = locationItem;
        let isUnlimitedAll = false;
        let variantGroups = [];

        if (itemModel.hasVariants) {
            isUnlimitedAll = itemVariants.length > 0 && itemVariants.filter(i => !i.isUnlimited).length == 0;
            variantGroups = itemModel.variantGroups;
        } else {
            isUnlimitedAll = locationItem.isUnlimited;
        }

        return (
            <tr>
                <td className="table-cell cell-image">Image</td>
                <td className="mobi-show">Variant(s)</td>
                {
                    variantGroups.map((variantGroup) => {
                        if (variantGroup.name && variantGroup.variants.length > 0) {
                            return (
                                <td key={variantGroup.id} className={"table-cell mobi-hide cell-" + variantGroup.name} data-id={variantGroup.id}>{variantGroup.name}</td>
                            )
                        }
                    })
                }
                <td className="cell-sku">SKU</td>
                <td className="cell-surcharge"> Price</td>
                <td className="cell-stock">Stock</td>
                <td className="cell-weight"><span class="weight-variatns-placeholder">Weight</span> <i class="icon icon-info" data-toggle="tooltip" data-placement="top" title="" data-original-title="If the weight is left empty, it will default to the weight set from the parent"><img src="/assets/images/Info.svg"/></i></td>
                <td className="cell-unlimited">
                    <div className="fancy-checkbox checkbox-sm black-checkbox">
                        <input type="checkbox"
                            name="unlimited[]"
                            id={locationId + "-unlimited"}
                            checked={isUnlimitedAll}
                            onChange={(e) => this.props.onItemVariantChange(null, 'variantunlimitedall', e.target.checked, locationId)} />
                        <label htmlFor={locationId + "-unlimited"} />
                        <span htmlFor={locationId + "-unlimited"}>Unlimited<span htmlFor={locationId + "-unlimited"} /></span>
                    </div>
                </td>
            </tr>
        );
    }

    renderItemVariants(locationItem) {
        const { itemModel } = this.props;
        let { locationId } = locationItem;
        let itemVariants = [];

        if (!itemModel.hasVariants) {
            itemVariants.push({
                id: locationItem.id,
                sku: locationItem.sku,
                surcharge: locationItem.surcharge,
                stock: locationItem.stock,
                isUnlimited: locationItem.isUnlimited,
                media: locationItem.media,
                isSameImage: locationItem.isSameImage,
                weight: locationItem.weight,
                variantGroups: []
            });
        } else {
            itemVariants = locationItem.itemVariants;
        }

        return (
            itemVariants.map((itemVariant) => {
                return (
                    <tr key={itemVariant.id}>
                        <td className="table-cell cell-image image-upload-container">
                            <div>
                                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                    <a href="#" className="btn-varient-img model-btn image-placeholder" id={"btn-browse-" + itemVariant.id} data-target="#myModal" data-toggle="modal" data-width={600} data-height={600} onClick={(e) => this.browseImage(locationId, itemVariant.id)}>
                                        <img src={itemVariant.media ? itemVariant.media.MediaUrl : "/assets/images/image_add.svg"} alt="add" />
                                    </a>
                                </PermissionTooltip>
                            </div>
                            <div className="variant-img-bottom">
                                <span>
                                    <input type="checkbox"
                                        name={`same-image-${itemVariant.id}`}
                                        checked={itemVariant.isSameImage}
                                        onChange={(e) => this.props.onItemVariantChange(itemVariant.id, 'variantsameimage', e.target.checked, locationId)} />
                                </span>
                                <span className="variant-same-img">Same image &uarr;</span>
                            </div>
                        </td>
                        {
                            itemVariant.variantGroups.map((variantGroup, index) => {
                                return (
                                    variantGroup.variants.map((variant) => {
                                        return (
                                            <td key={variant.id} className={`table-cell options-name mobi-hide cell-${index} cellopt-${variantGroup.name}`} data-tcell={variant.name}>{variant.name}</td>
                                        )
                                    })
                                )
                            })
                        }
                        <td className="mobi-show">
                            {
                                itemVariant.variantGroups.map((variantGroup) => {
                                    return (
                                        variantGroup.variants.map((variant) => {
                                            return (
                                                <p key={variant.id}>{variant.name}</p>
                                            )
                                        })
                                    )
                                })
                            }
                        </td>
                        <td className="table-cell cell-sku">
                            <input className="sku_input"
                                type="text"
                                name="sku[]"
                                value={itemVariant.sku}
                                onChange={(e) => this.props.onItemVariantChange(itemVariant.id, 'variantsku', e.target.value, locationId)} />
                        </td>
                        <td className="table-cell cell-surcharge">
                            <input className="surcharge_input number2DecimalOnly required"
                                type="text"
                                name="Surcharge[]"
                                placeholder={this.formatMoney(this.currencyCode, 0)}
                                value={itemVariant.surcharge}
                                onChange={(e) => this.props.onItemVariantChange(itemVariant.id, 'variantsurcharge', e.target.value, locationId)} />
                        </td>
                        <td className="table-cell cell-stock">
                            <input className={itemVariant.isUnlimited ? "stock_input number2DecimalOnly" : "stock_input number2DecimalOnly required"}
                                type="text"
                                name="stock[]"
                                disabled={itemVariant.isUnlimited ? 'disabled' : ''}
                                value={itemVariant.stock}
                                onChange={(e) => this.props.onItemVariantChange(itemVariant.id, 'variantstock', e.target.value, locationId)} />
                        </td>
                        <td className="table-cell cell-weight">
                            <input className="weight_input"
                                type="text"
                                name="weight[]"
                                value={itemVariant.weight}
                                onChange={(e) => this.props.onItemVariantChange(itemVariant.id, 'variantweight', e.target.value, locationId)} />
                        </td>
                        <td className="table-cell cell-stock-limit">
                            <div className="fancy-checkbox checkbox-sm black-checkbox">
                                <input type="checkbox"
                                    name="unlimited[]"
                                    id={itemVariant.id + '-' + locationId + "-unlimited"}
                                    checked={itemVariant.isUnlimited}
                                    onChange={(e) => this.props.onItemVariantChange(itemVariant.id, 'variantunlimited', e.target.checked, locationId)} />
                                <label htmlFor={itemVariant.id + '-' + locationId + "-unlimited"} />
                            </div>
                        </td>
                    </tr>
                )
            })
        );
    }

    renderLocationItems() {
        const { locationItems } = this.props.itemModel;

        return (
            locationItems.map((locationItem) => {
                const { pricing, locationId } = locationItem;

                return (
                    <tr key={locationId}>
                        <td colSpan={5}>
                            <table>
                                <tbody>
                                    <tr id="rowPric-AF">
                                        <td className="country">{locationItem.locationName}</td>
                                        <td>
                                            <input type="text"
                                                className="table-input required numbersOnly"
                                                placeholder="MOQ"
                                                value={locationItem.moq}
                                                onChange={(e) => this.props.SkuMoqStockChange(e.target.value, "moq", locationId)} />
                                        </td>
                                        <td className="tb-span-text bulk-price">
                                            {this.renderBulkPricing(pricing.bulkPricing)}
                                        </td>
                                        <td className="tb-span-text discount-price">
                                            {this.renderDiscount(pricing.bulkPricing, pricing.currencyCode)}
                                        </td>
                                        <td className="btn-table">
                                            <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey delete-con-row'}>
                                                <span className="delete-con-row" onClick={() => this.showRemoveLocationModal(locationId)}>
                                                    <i className="fa fa-times" />
                                                </span>
                                            </PermissionTooltip>
                                            <span className="btn-pricing-toggle active">Pricing <i className="fa fa-angle-up" /></span>
                                            <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey btn-edit liner'}>
                                                <span className="btn-edit open-bulk-modal liner" data-id="rowPric-AF" onClick={(e) => this.showPricingModal(locationItem)}>Bulk Pricing</span>
                                            </PermissionTooltip>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="variation_resultTable">
                                                <div className="resultTable">
                                                    <table width="100%">
                                                        <thead>
                                                            {this.renderVariantHeaders(locationItem)}
                                                        </thead>
                                                        <tbody>
                                                            {this.renderItemVariants(locationItem)}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                )
            })
        );
    }

    render() {
        return (
            <React.Fragment>
                <div className="col-md-12 mt-20">
                    <div className="row">
                        <div className="un-ul-table">
                            <div className="table-responsive">
                                <table className="table" id="tblPricing">
                                    <thead>
                                        <tr>
                                            <th>{this.getLocationGroupName()}</th>
                                            <th>MOQ</th>
                                            <th>Bulk Pricing:</th>
                                            <th>Discount</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.renderLocationItems()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderPricingModal()}
                <div id="modalRemoveLocation" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemove" data-location-id="" onClick={(e) => this.removeLocation(e)}>Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="cover"></div>
            </React.Fragment>
        );
    }
}

module.exports = LocationComponent;