'use strict';
var React = require('react');
const BaseComponent = require('../../shared/base');

const PermissionTooltip = require('../../common/permission-tooltip');

class DeliverySettingsComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            deleteObjectId: 0,
            deliveryModal_To: '',
            deliveryModal_ShippingRate: '',
            deliveryModal_DeliveryFrom: '',
            deliveryModal_MinimumLeadTime: '',
            deliveryModal_DeliveryRate: [],
            deliveryModal_CurrencyCode: null,
        };

    }

    componentDidMount() {
    }

    toTrigger() {
    }

    showCountry(customFields) {
        var self = this;

        if (typeof customFields != 'undefined' && customFields && customFields != null) {

            return customFields.map(function (inner) {

                var value = JSON.parse(inner.Values[0]);

                if (value.IsAllCountries) {
                    return 'All';
                }
                else {
                    if (value.SelectedCountries) {
                        let countries = "";
                        Array.from(value.SelectedCountries).map(function (country, index) {
                            if (countries === "") {
                                countries = country.Name;
                            }
                            else {
                                countries += ", " + country.Name;
                            }
                        });
                        return countries;
                    }
                    else {
                        return value.Countries.replace(/;/, ',');
                    }
                }

            });
        }
        else {
            return '';
        }
    }

    checkIfExcluded(shippingMethodGuid) {
        var self = this;
        var cf = self.props.user.CustomFields

        if (typeof cf != 'undefined' && cf !== null && cf.length > 0) {
            var theShippingMethodObject = cf.find(function (element) {
                return element.Name == "DeliveryMethodAvailability";
            });

            if (typeof theShippingMethodObject != 'undefined') {
                var theValue = JSON.parse(theShippingMethodObject.Values[0]);

                if (typeof theValue.UnavailableDeliveryMethods != 'undefined') {
                    var isExist = theValue.UnavailableDeliveryMethods.find(function (element) {
                        return element.ShippingMethodGuid == shippingMethodGuid;
                    });

                    return !isExist;
                }
            }
        }
        return true;
    }

    onExcludeDeliveryOption() {
        var self = this;

        this.props.validatePermissionToPerformAction('edit-merchant-delivery-methods-api', () => {
            var cf = self.props.user.CustomFields;
            var deliveryAvailabilityCustomFieldDef = self.props.customFieldDefinition.find(el => el.Name == 'DeliveryMethodAvailability');
            if (typeof cf !== 'undefined' && cf !== null && cf.length > 0) {
                var theShippingMethodObject = cf.find(function (element) {
                    return element.Name == "DeliveryMethodAvailability";
                });

                if (typeof theShippingMethodObject != 'undefined') {
                    var theValue = JSON.parse(theShippingMethodObject.Values[0]);

                    if (typeof theValue.UnavailableDeliveryMethods != 'undefined') {

                        var unAvailability = theValue.UnavailableDeliveryMethods;

                        //remove the array first
                        unAvailability = [];

                        $('.delivery-option-checkbox:checkbox:not(:checked)').each(function (index, element) {
                            var theObject = {
                                ShippingMethodGuid: $(element).attr('data-id')
                            };

                            unAvailability.push(theObject);
                        });
                        theValue.UnavailableDeliveryMethods = unAvailability;
                        theShippingMethodObject.Values[0] = JSON.stringify(theValue);

                        self.props.updateUserInfo({ 'CustomFields': [theShippingMethodObject] }, 'delivery-option-settings');
                    }
                } else {
                    if (deliveryAvailabilityCustomFieldDef) {
                        const value = { UnavailableDeliveryMethods: [] };
                        $('.delivery-option-checkbox:checkbox:not(:checked)').each(function (index, element) {
                            value.UnavailableDeliveryMethods.push({ ShippingMethodGuid: $(element).attr('data-id') });
                        });
                        const deliveryAvailCustomField = {
                            Code: deliveryAvailabilityCustomFieldDef.Code,
                            Values: [JSON.stringify(value)],
                            DataFieldType: 'string'
                        }
                        const user = self.props.user;
                        user.CustomFields.push(deliveryAvailCustomField);
                        self.props.updateUserInfo(user);
                    }
                }
            }
        });
    }

    showDeliveryAdminOptionList() {
        var self = this;

        if (this.props.shippingOptionsAdmin && this.props.shippingOptionsAdmin.length > 0) {
            return (
                this.props.shippingOptionsAdmin.map(function(shippingOptions) {
                    if (typeof shippingOptions.CustomFields != 'undefined' && shippingOptions.CustomFields && shippingOptions.CustomFields != null) {
                        return (
                            <tr className="parent-r-b" key={shippingOptions.ID}>
                                <td data-th="Name">{shippingOptions.Description} </td>
                                <td data-th="Delivers To">{self.showCountry(shippingOptions.CustomFields)}</td>
                                <td data-th className="text-right">
                                    <span className="ellipsis-dot rateListModal" onClick={(e) => self.showAdminModalDetails(shippingOptions)}>
                                        <i className="fa fa-ellipsis-h"/>
                                    </span>
                                    <span>
                                        <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                            <div className="onoffswitch">
                                                <input type="checkbox" onChange={(e) => self.onExcludeDeliveryOption()} name="onoffswitch" data-id={shippingOptions.ID} className="onoffswitch-checkbox delivery-option-checkbox" id={'deliveryOption' + shippingOptions.ID} defaultChecked={self.checkIfExcluded(shippingOptions.ID)} />
                                                <label className="onoffswitch-label" htmlFor={'deliveryOption' + shippingOptions.ID}> <span className="onoffswitch-inner" /> <span className="onoffswitch-switch" /> </label>
                                            </div>
                                        </PermissionTooltip>
                                    </span>
                                </td>
                            </tr>
                        );
                    } else {
                        return null;
                    }
                })
            );
        } 
    }

    showDeleteModal(deleteObjectId) {
        var self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-delivery-methods-api", () => {
            self.setState({
                deleteObjectId: deleteObjectId
            }, function () {
                $('#modalRemove').modal('show');
            });
        });
    }

    doDelete() {
        var self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-delivery-methods-api", () => {
            $('#modalRemove').modal('hide');
            self.props.deleteShippingMethod(self.props.user.ID, self.state.deleteObjectId);
        });
    }

    showDeliveryMerchantOptionList() {
        var self = this;
        if (this.props.shippingOptionsMerchant && this.props.shippingOptionsMerchant.length > 0) {
            return (
                this.props.shippingOptionsMerchant.map(function (shippingOptions) {

                    if (typeof shippingOptions.CustomFields != 'undefined' && shippingOptions.CustomFields && shippingOptions.CustomFields != null) {
                        return (
                            <tr className="parent-r-b" key={shippingOptions.ID}>
                                <td data-th="Name">{shippingOptions.Description} </td>
                                <td data-th="Delivers To">{self.showCountry(shippingOptions.CustomFields)}</td>
                                <td data-th className="text-right">
                                    <span className="ellipsis-dot rateListModal hide">
                                        <i className="fa fa-ellipsis-h" />
                                    </span>
                                    <span className="delivery-option-edit-img">
                                        <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                            <img src="/assets/images/edit_btn.svg" onClick={(e) => self.props.validatePermissionToPerformAction('edit-merchant-delivery-methods-api', () => location.href = '/delivery/add-edit?shippingmethodid=' + shippingOptions.ID)} />
                                        </PermissionTooltip>
                                    </span>
                                    <span>
                                        <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                            <div className="onoffswitch">
                                                <input type="checkbox" onChange={(e) => self.onExcludeDeliveryOption()} name="onoffswitch" data-id={shippingOptions.ID} className="onoffswitch-checkbox delivery-option-checkbox" id={'deliveryOption' + shippingOptions.ID} defaultChecked={self.checkIfExcluded(shippingOptions.ID)} />
                                                <label className="onoffswitch-label" htmlFor={'deliveryOption' + shippingOptions.ID}> <span className="onoffswitch-inner" /> <span className="onoffswitch-switch" /> </label>
                                            </div>
                                        </PermissionTooltip>
                                    </span>
                                    <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                                        <span className="pickup-remove openModalRemove pull-right" onClick={(e) => self.showDeleteModal(shippingOptions.ID)}>
                                            <i className="fa fa-times" />
                                        </span>
                                    </PermissionTooltip>
                                </td>
                            </tr>
                        );
                    } else {
                        return null;
                    }

                })
            );
        } 

    }

    showAdminModalDetails(shippingMethod) {
        var self = this;
        var theObject = null;
        const customFields = shippingMethod.CustomFields;

        if (typeof customFields != 'undefined' && customFields && customFields != null) {
            customFields.map(function (inner) {
                theObject = JSON.parse(inner.Values[0]);
            });
        }
        else {
            return '';
        }

        self.setState(
            {
                deliveryModal_To: self.showCountry(customFields),
                deliveryModal_ShippingRate: theObject.CalculationType,
                deliveryModal_DeliveryFrom: theObject.DeliveryFrom,
                deliveryModal_MinimumLeadTime: theObject.MinimumLeadTime,
                deliveryModal_DeliveryRate: theObject.Rates,
                deliveryModal_CurrencyCode: shippingMethod.CurrencyCode
            }, function() {
                $('.rate_list').modal('show');
            });
    }

    showMaxRange(rate) {
        if (rate.Onwards == 'true') {
            return rate.MinimumRange + " onwards";
        }
        else {
            return rate.MinimumRange + " - " + rate.MaximumRange;
        }
    }

    showAdminDefaultDeliveryRates() {
        var self = this;
        if (this.state.deliveryModal_DeliveryRate && this.state.deliveryModal_DeliveryRate.length > 0) {
            let index = 0;
            const currencyCode = self.state.deliveryModal_CurrencyCode || process.env.DEFAULT_CURRENCY;
            return (
                this.state.deliveryModal_DeliveryRate.map(function (rate) {
                    return (
                        <tr key={rate.Name + index++}>
                            <td>{rate.Name}</td>
                            <td>{self.showMaxRange(rate)}</td>
                            <td>{self.formatMoney(currencyCode, rate.Cost)}</td>
                        </tr>
                    );
                })
            );
        }
        return null;
    }
    renderEmpty() {
        const { shippingOptionsAdmin, shippingOptionsMerchant } = this.props;
        const allShippingOptions = (shippingOptionsAdmin || []).concat(shippingOptionsMerchant || []);
        if (allShippingOptions.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/delivery-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">Nothing to see here.</div>
                    <div className="empty-page-message">When you create delivery rates will be shown here</div>
                </div>
            );
        }
    }
    render() {
        var self = this;

        return (
            <React.Fragment>
                {self.toTrigger()}
                <div className="ds-content">
                    <div className="dsc-table">
                        <div className="dsct-top full-width">
                            <div className="pull-left">
                                <span className="dsct-text">Shipping Options</span>
                            </div>
                            <div className="pull-right">
                                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                    <div className="dsct-btn" onClick={(e) => this.props.validatePermissionToPerformAction('add-merchant-delivery-methods-api', () => location.href = "/delivery/add-edit")}>
                                        <a>Add Shipping Option</a>
                                    </div>
                                </PermissionTooltip>
                            </div>
                        </div>
                        <div className="ph-t-table">
                            <table className="table delivery-set-data">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>SHIPS TO</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {self.showDeliveryAdminOptionList()}
                                    {self.showDeliveryMerchantOptionList()}
                                </tbody>
                            </table>
                            {this.renderEmpty()}
                        </div>
                    </div>
                </div>

                <div id="modalRemove" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemove" onClick={(e) => self.doDelete()}>Okay</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade rate_list" id="deliveryOptionDetail" tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-md" role="document">
                        <div className="modal-content"> <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                            <div className="col-md-12 inline">
                                <div className="head_box">
                                    <h5 className="bold">Admin Default Shipping</h5>
                                    <p />
                                </div>
                                <div className="row">
                                    <div className="Labeled">
                                        <div className="col-md-12"> <label>Delivers to</label>
                                            <p>{self.state.deliveryModal_To}</p>
                                        </div>
                                    </div>
                                    <div className="Labeled">
                                        <div className="col-md-12"> <label>Shipping rate by </label>
                                            <p>{self.state.deliveryModal_ShippingRate}</p>
                                        </div>
                                    </div>
                                    <div className="Labeled">
                                        <div className="col-md-12"> <label>Delivering from</label>
                                            <p>{self.state.deliveryModal_DeliveryFrom}</p>
                                        </div>
                                    </div>
                                    <div className="Labeled">
                                        <div className="col-md-12">
                                            <label>Minimum lead time</label>
                                            <p>{self.state.deliveryModal_MinimumLeadTime}</p>
                                        </div>
                                    </div>

                                    <div className="Labeled">
                                        <div className="col-md-12"> <label>Delivery rates(s)</label> </div>
                                        <div className="tbl-delivery-rates col-md-12">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Range <span className="unit_label">(kg)</span></th>
                                                        <th>Delivery Cost</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {self.showAdminDefaultDeliveryRates()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="action_area_box text-center">
                                <div className="btn-save" data-dismiss="modal">Okay</div>
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        );
    }
}

module.exports = DeliverySettingsComponent;