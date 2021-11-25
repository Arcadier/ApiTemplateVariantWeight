'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PricingStockComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.addVariant = this.addVariant.bind(this);
        this.deleteVariant = this.deleteVariant.bind(this);
        this.sortVariants = this.sortVariants.bind(this);
    }

    browseFile(itemVariantId) {
        $(".tools").addClass("hide");
        var canvas = document.getElementById("visbleCanvas");

        if ($(".imageBox").find(canvas).length !== 0) {
            canvas.remove();
        }

        $(".upload-wapper > .upload-wrapper-container > input").val("");
        $(".upload-wapper > .upload-wrapper-container > input").attr("data-variant-id", itemVariantId);
    }

    initializeTagsInput() {
        $('input[name="option_choices"]').tagsinput({
            confirmKeys: [],
            maxChars: 20,
            tagClass: function(item) {
                return 'fa fa-bars ' + item.id
            },
            addOnBlur: false,
            itemValue: 'id',
            itemText: 'name'
        });
    }

    refreshVariantTags() {
        this.props.itemModel.variantGroups.forEach(function (variantGroup, index) {
            const tags = $('div[data-id="' + variantGroup.id + '"]').find('input[name="option_choices"]');
            const input = $(tags).parents('.options-row').find('.bootstrap-tagsinput input');

            $(tags).tagsinput('removeAll');

            variantGroup.variants.forEach(function (variant) {
                $(tags).tagsinput('add', { id: variant.id, name: variant.name });
            });

            if ($(tags).tagsinput('items').length == 0 && index == 0) {
                input.attr('placeholder', 'e.g. Red');
            }
        });
    }

    addVariant(event) {
        function capitalize(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }

        const target = event.target;
        let variantName = target.value.trim();

        if (event.which == 188) {
            variantName = variantName.replace(',', '');
        }

        if (variantName) {
            const div = $(target).parents('.options-row');
            const input = div.find('input[name="option_name"]');
            const groupId = div.attr('data-id');

            this.props.addVariant(groupId, capitalize(variantName));

            $(target).removeAttr('placeholder');
            $(target).val('');
            $(target).focus();

            if (!input.val()) {
                input.addClass('error-con');
            }
        }
    }

    deleteVariant(event) {
        this.props.deleteVariant(event.item.id);
    }

    sortVariants(event) {
        const div = $(event.target).parents('.options-row');
        const tags = div.find('input[name="option_choices"]').tagsinput('items');
        const groupId = div.attr('data-id');
        let variants = [];

        Array.from(event.target.children).forEach(function (element) {
            if (element.tagName.toLowerCase() == 'span') {
                tags.forEach(function (tag) {
                    if (tag.name == element.innerText) {
                        variants.push(tag);
                    }
                });
            }
        });

        this.props.sortVariants(groupId, variants);
    }

    componentDidMount() {
        const self = this;

        this.initializeTagsInput();
        this.refreshVariantTags();

        $('.bootstrap-tagsinput input').on('blur', this.addVariant);
        $('.bootstrap-tagsinput input').on('keyup', function (event) {
            if (event.which == 13 || event.which == 188) {
                self.addVariant(event);
            }
        });

        $('input[name="option_choices"]').on('itemRemoved', this.deleteVariant);

        $('.bootstrap-tagsinput').sortable({
            items: 'span',
            update: function (event, ui) {
                self.sortVariants(event);
            }
        });

        this.props.sortItemVariants();

        $('body').on('click', '.bootstrap-tagsinput span.tag', function () {
            const id = $(this).attr('class').substring('tag fa fa-bars '.length);
            const tags = $(this).parent().siblings('input[name="option_choices"]');

            self.props.updateSelectedVariant(id);
        });
    }

    componentDidUpdate() {
        this.refreshVariantTags();
    }

    renderVariantGroups() {
        const self = this;

        return (
            <div className="options-body">
                {
                    this.props.itemModel.variantGroups.map(function (variantGroup, index) {
                        const placeholder = index == 0 && !variantGroup.name ? "e.g. Color" : "";

                        return (
                            <div key={index} data-id={variantGroup.id} className="options-row">
                                <div className="opt-row-sorder">
                                    <i className="fa fa-bars hide" />
                                </div>
                                <div className="options-cell option-name">
                                    <input multiple="" type="text" value={variantGroup.name} name="option_name" className="option_name" placeholder={placeholder}
                                        onChange={(e) => self.props.updateVariantGroupName(variantGroup.id, e.target.value)} />
                                </div>
                                <div className="options-cell option-choices">
                                    <input type="text" defaultValue={""} name="option_choices" className="option_choices" placeholder="" />
                                </div>
                                <div className="options-cell option-actions">
                                    <a href="#" onClick={(e) => e.preventDefault()}><i className="icon icon-dustbin hide" /></a>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        );
    }

    renderHeaders() {
        const isUnlimitedAll = this.props.itemModel.itemVariants.length > 0 && this.props.itemModel.itemVariants.filter(i => !i.isUnlimited).length == 0;

        return (
            <tr>
                <td className="table-cell cell-image">Image</td>
                <td className="mobi-show">Variant(s)</td>
                {
                    this.props.itemModel.variantGroups.map(function (variantGroup, index) {
                        if (variantGroup.name && variantGroup.variants.length > 0) {
                            return (
                                <td key={index} className={"table-cell mobi-hide cell-" + variantGroup.name} data-id={variantGroup.id}>{variantGroup.name}</td>
                            )
                        }
                    })
                }
                <td className="cell-sku">SKU</td>
                <td className="cell-surcharge"> Surcharge</td>
                <td className="cell-price mobi-hide">Total Price</td>
                <td className="cell-stock">Stock</td>
                <td className="cell-unlimited">
                    <div className="fancy-checkbox checkbox-sm black-checkbox">
                        <input type="checkbox" name="unlimited[]" id="c0-unlimited" checked={isUnlimitedAll}
                            onChange={(e) => this.props.onItemVariantChange(null, 'variantunlimitedall', e.target.checked)} />
                        <label htmlFor="c0-unlimited" /><span htmlFor="c0-unlimited">Unlimited<span /></span>
                    </div>
                </td>
            </tr>
        );
    }

    renderItemVariants() {
        const self = this;

        return (
            <React.Fragment>
                {
                    this.props.itemModel.itemVariants.map(function (itemVariant, index) {
                        const totalPrice = parseFloat(self.props.itemModel.price || 0) + parseFloat(itemVariant.surcharge || 0);

                        return (
                            <tr key={index}>
                                <td className="table-cell cell-image image-upload-container">
                                    <div>
                                        <a className="btn-varient-img model-btn image-placeholder" href="#" id={"btn-browse-" + itemVariant.id} data-toggle="modal" data-target="#modalImage" data-width={600} data-height={600}
                                            onClick={(e) => self.browseFile(itemVariant.id)}>
                                            <img src={itemVariant.media ? itemVariant.media.MediaUrl : "/assets/images/image_add.svg"} alt="add" />
                                        </a>
                                    </div>
                                    <div className="variant-img-bottom" style={{ display: 'block' }}>
                                        <span>
                                            <input type="checkbox" name="same-image-201848" checked={itemVariant.isSameImage}
                                                onChange={(e) => self.props.onItemVariantChange(itemVariant.id, 'variantsameimage', e.target.checked)} />
                                        </span>
                                        <span className="variant-same-img">Same Image &uarr;</span>
                                    </div>
                                </td>
                                <td className="mobi-show">
                                {
                                    itemVariant.variantGroups.map(function (variantGroup) {
                                        return (
                                            variantGroup.variants.map(function (variant, index) {
                                                return (
                                                    <p key={index}>{variant.name}</p>
                                                )
                                            })
                                        )
                                    })
                                }
                                </td>
                                {
                                    itemVariant.variantGroups.map(function (variantGroup) {
                                        return (
                                            variantGroup.variants.map(function (variant, index) {
                                                return (
                                                    <td key={index} className={"table-cell options-name mobi-hide cell-0 cellopt-" + variantGroup.name} data-tcell={variant.name}>{variant.name}</td>
                                                )
                                            })
                                        )
                                    })
                                }
                                <td className="table-cell cell-">
                                    <input className="sku_input" type="text" value={itemVariant.sku} name="sku[]"
                                        onChange={(e) => self.props.onItemVariantChange(itemVariant.id, 'variantsku', e.target.value)} />
                                </td>
                                <td className="table-cell cell-surcharge">
                                    <input className="surcharge_input number2DecimalOnly" type="text" value={itemVariant.surcharge} name="Surcharge[]" placeholder={self.formatMoney(self.props.itemModel.currencyCode, 0)}
                                        onChange={(e) => self.props.onItemVariantChange(itemVariant.id, 'variantsurcharge', e.target.value)} />
                                </td>
                                <td className="table-cell cell-price mobi-hide">{self.renderFormatMoney(self.props.itemModel.currencyCode, totalPrice)}</td>
                                <td className="table-cell cell-stock">
                                    <input className={itemVariant.isUnlimited || !self.props.itemModel.hasVariants ? "stock_input number2DecimalOnly" : "stock_input number2DecimalOnly required"} type="text" name="stock[]" value={itemVariant.stock} disabled={itemVariant.isUnlimited ? 'disabled' : ''}
                                        onChange={(e) => self.props.onItemVariantChange(itemVariant.id, 'variantstock', e.target.value)} />
                                </td>
                                <td className="table-cell cell-stock-limit">
                                    <div className="fancy-checkbox checkbox-sm black-checkbox">
                                        <input type="checkbox" name="unlimited[]" id={itemVariant.id + "-unlimited"} checked={itemVariant.isUnlimited}
                                            onChange={(e) => self.props.onItemVariantChange(itemVariant.id, 'variantunlimited', e.target.checked)} />
                                        <label htmlFor={itemVariant.id + "-unlimited"} />
                                    </div>
                                </td>
                            </tr>
                        )
                    })
                }
            </React.Fragment>
        );
    }

    render() {
        return (
            <div className="tab-container tabcontent" id="pricing_tab">
                <div className="tab-title">
                    <div className="tab-text">
                        <span>Pricing &amp; Stock</span>
                    </div>
                </div>
                <div className="tab-content un-inputs">
                    <div className="col-md-12">
                        <div className="row">
                            <div className="item-form-group">
                                <div className="col-md-6">
                                    <label>Price<span>*</span></label>
                                    <input className="required number2DecimalOnly" id="itemNewPrice" type="text" name="Price" step="0.25" value={this.props.itemModel.price}
                                        onChange={(e) => this.props.onTextChange(e.target.value, "itemprice")} />
                                </div>
                                <div className="col-md-6">
                                    <label>SKU</label>
                                    <input className="" type="text" name="SKU" value={this.props.itemModel.sku}
                                        onChange={(e) => this.props.onTextChange(e.target.value, "itemsku")} />
                                </div>
                            </div>
                            <div className="item-form-group">
                                <div className="inventory-section">
                                    <div className="col-md-6">
                                        <label className="vant-title">Quantity<span>*</span></label>
                                        <input type="text" name="item-quantity" value={this.props.itemModel.quantity}
                                            className={this.props.itemModel.isUnlimitedStock || this.props.itemModel.hasVariants ? "numbersOnly" : "required numbersOnly"}
                                            disabled={this.props.itemModel.isUnlimitedStock ? "disabled" : ""}
                                            onChange={(e) => this.props.onTextChange(e.target.value, "itemquantity")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label>&nbsp;</label>
                                        <div className="onoffswitch">
                                            <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="3-purchaseable" checked={this.props.itemModel.isUnlimitedStock}
                                                onChange={(e) => this.props.onToggleChange(e.target.checked, "itemunlimitedstock")} />
                                            <label className="onoffswitch-label" htmlFor="3-purchaseable"> <span className="onoffswitch-inner" />
                                                <span className="onoffswitch-switch" />
                                            </label>
                                        </div>
                                        <span className="item-stock-lbl">&nbsp;Unlimited Stock</span>
                                    </div>
                                    <div className="clearfix" />
                                    <div className={this.props.itemModel.hasVariants ? "disabled-overlay" : "disabled-overlay hide"} />
                                </div>
                                <hr />
                                <div className="variant-option-top">
                                    <div>
                                        <div className="col-sm-6 ">
                                            <h3 className="vant-title">Variants</h3>
                                            <p>Add up to 3 different available options for the item, e.g. Colour, Size, and Material</p>
                                        </div>
                                        <div className="col-sm-6 ">
                                            <div className="onoffswitch">
                                                <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="toggle-variants" checked={this.props.itemModel.hasVariants}
                                                    onChange={(e) => this.props.onToggleChange(e.target.checked, "itemvariants")} />
                                                <label className="onoffswitch-label" htmlFor="toggle-variants">
                                                    <span className="onoffswitch-inner" />
                                                    <span className="onoffswitch-switch" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="clearfix" />
                                </div>
                                <div className="variants-section">
                                    <div className={this.props.itemModel.hasVariants ? "disabled-overlay hide" : "disabled-overlay"} />
                                    <div className="col-sm-12">
                                        <div className="options-draw">
                                            <div className="add-options-table">
                                                <div className="options-header">
                                                    <div className="options-row">
                                                        <div className="options-cell option-name">VARIANTS OPTIONS</div>
                                                        <div className="options-cell option-choices">VARIANTS CHOICES</div>
                                                        <div className="options-cell option-actions" />
                                                    </div>
                                                    {this.renderVariantGroups()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="clearfix" />
                                    <div className="resultTable">
                                        <table width="100%">
                                            <thead>
                                                {this.renderHeaders()}
                                            </thead>
                                            <tbody>
                                                {this.renderItemVariants()}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className={this.props.itemModel.hasVariants ? "disabled-overlay hide" : "disabled-overlay"} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = PricingStockComponent;