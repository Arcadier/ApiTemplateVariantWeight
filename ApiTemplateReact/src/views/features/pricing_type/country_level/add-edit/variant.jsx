'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

const PermissionTooltip = require('../../../../common/permission-tooltip');

class VariantComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.addVariant = this.addVariant.bind(this);
        this.deleteVariant = this.deleteVariant.bind(this);
        this.sortVariants = this.sortVariants.bind(this);
        this.initialFirstVariantGroupId = '';
    }

    componentDidMount() {
        const self = this;

        this.initializeTagsInput();
        this.refreshVariantTags();

        $('body').on('blur', '.bootstrap-tagsinput input', (event) => {
            self.addVariant(event);
        });

        $('body').on('keyup', '.bootstrap-tagsinput input', (event) => {
            if (event.which == 13 || event.which == 188) {
                self.addVariant(event);
            }
        });

        $('input[name="option_choices"]').on('itemRemoved', this.deleteVariant);

        $('.bootstrap-tagsinput').sortable({
            items: 'span',
            stop: (event) => self.sortVariants(event)
        });

        $('.options-body').sortable({
            handle: '.opt-row-sorder',
            stop: (event, ui) => {
                self.sortVariantGroups(event);
            }
        });

        this.props.sortItemVariants();

        $('body').on('click', '.bootstrap-tagsinput span.tag', (event) => {
            const target = event.target;
            let id = '';

            if ($(target).hasClass('tag')) {
                id = $(target).attr('class').substring('tag fa fa-bars '.length);
            } else {
                id = $(target).parents('span').attr('class').substring('tag fa fa-bars '.length);
            }

            self.props.updateSelectedVariant(id);
        });

        const { variantGroups } = this.props.itemModel;
        this.initialFirstVariantGroupId = variantGroups[0].id;
    }

    componentDidUpdate() {
        const self = this;

        this.initializeTagsInput();
        this.refreshVariantTags();

        $('.bootstrap-tagsinput').sortable({
            axis: 'x',
            items: '> span',
            cancel: '.bootstrap-tagsinput input[type="text"]',
            stop: (event) => self.sortVariants(event)
        });

        const { selectedVariant, variantGroups } = this.props.itemModel;

        if (selectedVariant) {
            $('.popup-tag-update').fadeIn();
        } else {
            $('.popup-tag-update').fadeOut();
        }

        const isInitialFirstVariantGroupExist = variantGroups.find(g => g.id == this.initialFirstVariantGroupId) != null;
        if (!isInitialFirstVariantGroupExist) {
            this.initialFirstVariantGroupId = variantGroups[0].id;
        }
    }

    initializeTagsInput() {
        $('input[name="option_choices"]').tagsinput({
            confirmKeys: [],
            maxChars: 20,
            tagClass: (item) => 'fa fa-bars ' + item.id,
            addOnBlur: false,
            itemValue: 'id',
            itemText: 'name'
        });
    }

    refreshVariantTags() {
        const { variantGroups } = this.props.itemModel;
        const isInitialFirstVariantGroupExist = variantGroups.find(g => g.id == this.initialFirstVariantGroupId) != null;
        
        variantGroups.forEach((variantGroup, index) => {
            const tags = $('div[data-id="' + variantGroup.id + '"]').find('input[name="option_choices"]');
            const input = $(tags).parents('.options-row').find('.bootstrap-tagsinput input');

            $(tags).tagsinput('removeAll');

            variantGroup.variants.forEach((variant) => {
                $(tags).tagsinput('add', { id: variant.id, name: variant.name });
            });

            let placeholder = "";

            if ($(tags).tagsinput('items').length == 0) {
                if (isInitialFirstVariantGroupExist) {
                    placeholder = this.initialFirstVariantGroupId === variantGroup.id ? "e.g. Red" : "";
                } else {
                    placeholder = index == 0 ? "e.g. Red" : "";
                }
            }

            input.attr('placeholder', placeholder);
        });
    }

    capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    addVariant(event) {
        const target = event.target;
        let variantName = $(target).val().trim();

        if (event.which == 188) {
            variantName = variantName.replace(',', '');
        }

        if (variantName) {
            const div = $(target).parents('.options-row');
            const input = div.find('input[name="option_name"]');
            const groupId = div.attr('data-id');

            this.props.addVariant(groupId, this.capitalize(variantName));

            $(target).removeAttr('placeholder');
            $(target).val('');
            $(target).focus();

            if (!input.val()) {
                input.addClass('error-con');
            }
        }
    }

    deleteVariant(event) {
        event.preventDefault();

        const { selectedVariant } = this.props.itemModel;
        let id = null;

        if (selectedVariant) {
            id = selectedVariant.id;
            $('span.' + id).parent().find('.option_choices').tagsinput('remove', { id: id })
        } else {
            id = event.item.id;
        }

        this.props.deleteVariant(id);
    }

    deleteVariantGroup(event, id) {
        event.preventDefault();
        const self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-create-item-api", () => {
            self.props.deleteVariantGroup(id);
        });
    }

    renameVariant(event) {
        event.preventDefault();
        this.props.updateSelectedVariant(null, null, true);
    }

    sortVariants(event) {
        const div = $(event.target).parents('.options-row');
        const tags = div.find('input[name="option_choices"]').tagsinput('items');
        const groupId = div.attr('data-id');
        let variants = [];

        Array.from(event.target.children).forEach((element) => {
            if (element.tagName.toLowerCase() == 'span') {
                tags.forEach((tag) => {
                    if (tag.name == element.innerText) {
                        variants.push(tag);
                    }
                });
            }
        });

        this.props.sortVariants(groupId, variants);
    }

    sortVariantGroups(event) {
        let variantGroups = [];

        Array.from(event.target.children).forEach((element) => {
            variantGroups.push({
                id: $(element).attr('data-id')
            });
        });

        this.props.sortVariantGroups(variantGroups);
    }

    renderVariantGroups() {
        const self = this;
        const { variantGroups } = this.props.itemModel;
        const isInitialFirstVariantGroupExist = variantGroups.find(g => g.id == this.initialFirstVariantGroupId) != null;

        return (
            <div className="options-body">
                {
                    variantGroups.map((variantGroup, index) => {
                        let placeholder = "";

                        if (!variantGroup.name) {
                            if (isInitialFirstVariantGroupExist) {
                                placeholder = this.initialFirstVariantGroupId === variantGroup.id ? "e.g. Color" : "";
                            } else {
                                placeholder = index == 0 ? "e.g. Color" : "";
                            }
                        }

                        return (                            
                            <div key={variantGroup.id} data-id={variantGroup.id} className="options-row">
                                <div className="opt-row-sorder">
                                    <i className="fa fa-bars" />
                                </div>
                                <div className="options-cell option-name">
                                    <input multiple=""
                                        type="text"
                                        value={variantGroup.name}
                                        name="option_name"
                                        className="option_name"
                                        placeholder={placeholder}
                                        onChange={(e) => self.props.updateVariantGroupName(variantGroup.id, e.target.value)} />
                                </div>
                                <div className="options-cell option-choices">
                                    <input type="text"
                                        name="option_choices"
                                        className="option_choices" />
                                </div>
                                <div className="options-cell option-actions">
                                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                                        <a href="#" onClick={(e) => this.deleteVariantGroup(e, variantGroup.id)}><i className="icon icon-dustbin" /></a>
                                    </PermissionTooltip>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        );
    }

    renderVariantModal() {
        const { selectedVariant } = this.props.itemModel;

        return (
            <div style={{ display: 'none' }} className="popup-tag-update">
                <div className="popup-wrapper">
                    <h4>Change</h4>
                    <input id=""
                        type="text"
                        className="form-control"
                        value={selectedVariant ? selectedVariant.name : ''}
                        onChange={(e) => this.props.updateSelectedVariant(null, e.target.value)} />
                    <div className="popup-btn text-right">
                        <a href="#" onClick={(e) => this.deleteVariant(e)} className="btn btn-default">Delete</a>
                        <a href="#" onClick={(e) => this.renameVariant(e)} className="btn btn-okay btn-black">Okay</a>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="tab-container tabcontent" id="variants_tab">
                <div className="tab-title">
                    <div className="tab-text">
                        <span>Variant Details</span>
                        <div className="onoffswitch">
                            <input type="checkbox" 
                                name="onoffswitch"
                                className="onoffswitch-checkbox"
                                id="toggle-variants"
                                checked={this.props.itemModel.hasVariants}
                                onChange={(e) => this.props.onToggleChange(e.target.checked, "itemvariants")} />
                            <label className="onoffswitch-label" htmlFor="toggle-variants">
                                <span className="onoffswitch-inner" />
                                <span className="onoffswitch-switch" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="tab-content un-inputs">
                    <div className="col-md-12">
                        <div className="row">
                            <p>Add up to 3 different available options for the item, e,g . Colour, Size, and Material</p>
                            <div className="item-form-group">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderVariantModal()}
            </div>
        );
    }
}

module.exports = VariantComponent;