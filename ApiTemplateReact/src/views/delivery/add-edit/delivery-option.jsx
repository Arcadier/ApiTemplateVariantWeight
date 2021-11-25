/// <reference path="../../../routes/policy.js" />
'use strict';
var React = require('react');
var Currency = require('currency-symbol-map');
var BaseClassComponent = require('../../shared/base.jsx');
var EnumCoreModule = require('../../../../src/public/js/enum-core.js');
var toastr = require('toastr');

const PermissionTooltip = require('../../common/permission-tooltip');

class DeliveryOptionComponent extends BaseClassComponent {

    constructor(props) {
        super(props);

        this.state = {
            manageShippingOptions: this.props.manageShippingOptions,
            customFields: this.props.manageShippingOptions.CustomFields,
            deliveryModal_Code: '',
            deliveryModal_DataFieldType: '',
            deliveryModal_IsComparable: '',
            deliveryModal_Name: '',
            deliveryModal_To: '',
            deliveryModal_ShippingRate: 'weight',
            deliveryModal_DeliveryFrom: '',
            deliveryModal_MinimumLeadTime: '',
            deliveryModal_DeliveryRate: [],
            description: this.props.manageShippingOptions.Description,
            selectedCountries: [],
            delvieryModal_countries: [],
            delvieryModal_countriesWithCode: null,
            countrySelectElement: [],
            crud_deliveryRatename: '',
            crud_rangeFrom: '',
            crud_rangeTo: '',
            crud_onwards: false,
            crud_deliveryCost: '',
            latestFromRatePrice: 0,
            hasDeliveryRate: true
        };

    }

    componentDidMount() {
        var self = this;
        var theObject = null;
        var theCustomField = null;

        if (typeof self.state.customFields != 'undefined' && self.state.customFields && self.state.customFields != null) {
            self.state.customFields.map(function (inner) {
                theObject = JSON.parse(inner.Values[0]);
                theCustomField = inner;
            });

            self.setState(
                {
                    deliveryModal_Code: theCustomField.Code,
                    deliveryModal_DataFieldType: theCustomField.DataFieldType,
                    deliveryModal_IsComparable: theCustomField.IsComparable,
                    deliveryModal_Name: theCustomField.Name,
                    deliveryModal_ShippingRate: theObject.CalculationType,
                    deliveryModal_DeliveryFrom: theObject.DeliveryFrom,
                    deliveryModal_MinimumLeadTime: theObject.MinimumLeadTime,
                    deliveryModal_DeliveryRate: theObject.Rates,
                    delvieryModal_countries: theObject.Countries,
                    delvieryModal_countriesWithCode: theObject.SelectedCountries
                }, function () {
                    var tempSelectedCountries = [];

                    if (theObject.IsAllCountries) {
                        EnumCoreModule.GetCountries().map(function (country) {
                            tempSelectedCountries.push({
                                name: country.name,
                                alpha2code: country.alpha2code,
                                selected: true
                            })
                        })
                    }
                    else {
                        let countryCodes = "";
                        if (self.state.delvieryModal_countriesWithCode) {
                            Array.from(self.state.delvieryModal_countriesWithCode).map(function (country, index) {
                                if (countryCodes === "") {
                                    countryCodes = country.Code;
                                }
                                else {
                                    countryCodes += "," + country.Code;
                                }
                            });
                        }

                        EnumCoreModule.GetCountries().map(function (country) {
                            var isSelected = false;
                            if (self.state.delvieryModal_countriesWithCode) {
                                isSelected = countryCodes.indexOf(country.alpha2code) >= 0;
                            }
                            else {
                                isSelected = self.state.delvieryModal_countries.indexOf(country.name) >= 0;
                            }

                            tempSelectedCountries.push({
                                name: country.name,
                                alpha2code: country.alpha2code,
                                selected: isSelected
                            });
                        });
                    }

                    self.setState(
                        {
                            selectedCountries: tempSelectedCountries
                        }, function () {
                            $('#my-select').searchableOptionList();
                        });
                })
        } else {
            var tempSelectedCountries = [];
            EnumCoreModule.GetCountries().map(function (country) {
                tempSelectedCountries.push({
                    name: country.name,
                    alpha2code: country.alpha2code,
                    selected: false
                })
            })

            self.setState(
                {
                    selectedCountries: tempSelectedCountries
                }, function () {
                    $('#my-select').searchableOptionList();
                });
        }

        $("body").on("change", "#Onwards", function () {
            if ($(this).is(":checked")) {
                $(".range-b").removeClass('hide');
                $(".range-a").addClass('hide');
                $(".range-a input").removeClass("required-me error-con");
                $(".range-b input").addClass("required-me");
            } else {
                $(".range-b").addClass('hide');
                $(".range-a").removeClass('hide');
                $(".range-b input").removeClass("required-me error-con");
                $(".range-a input").addClass("required-me");
            }
        });
    }

    showMaxRange(rate) {
        if (rate.Onwards == 'true') {
            return "> " + rate.MinimumRange + " onwards"
        }
        else {
            return rate.MinimumRange + " - " + rate.MaximumRange
        }
    }

    showDefaultDeliveryRates() {
        var self = this;
        if (self.state.deliveryModal_DeliveryRate && self.state.deliveryModal_DeliveryRate.length > 0) {
            return (
                self.state.deliveryModal_DeliveryRate.map(function (rate, index) {
                    let currencyCode = self.state.manageShippingOptions.CurrencyCode || process.env.DEFAULT_CURRENCY;
                    return (
                        <tr className="parent-r-b">
                            <td data-th="Name">{rate.Name}</td>
                            <td data-th="Range" data-last-val={10.00}>{self.showMaxRange(rate)}</td>
                            <td data-th="Delivery Cost">
                                <div className="item-price">
                                    <span id="price_amt">{[currencyCode, Currency(currencyCode), parseFloat(rate.Cost).toFixed(2)].join(' ')}</span>
                                </div>
                            </td>
                            <td data-th className="text-right">
                                <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                                    <span className={self.showRemoveButton(index)} onClick={(e) => self.showRemoveRate()}><i class="fa fa-times"></i></span>
                                </PermissionTooltip>
                            </td>
                        </tr>
                    )
                })
            );
        }

    }

    showRemoveButton(index) {
        var self = this;
        if (index == self.state.deliveryModal_DeliveryRate.length - 1)
            return "openModalRemove pickup-remove pull-right"
        else
            return "openModalRemove pickup-remove pull-right hide"
    }

    onDeliveryOptionSave() {
        var self = this;
    }

    checkDeliveryRates() {

    }

    buildDeliveryOption() {
        var self = this;

        var selectedCountries = [];
        $('.sol-selection input:checked').each(function () {
            selectedCountries.push({
                Code: $($(this)).val(),
                Name: $($(this)).next().text()
            });
        });

        var values = {
            IsAllCountries: $('#my-select').val().length >= 240,
            Countries: '',
            SelectedCountries: selectedCountries,
            MinimumLeadTime: self.state.deliveryModal_MinimumLeadTime,
            DeliveryFrom: self.state.deliveryModal_DeliveryFrom,
            CalculationType: self.state.deliveryModal_ShippingRate,
            Rates: self.state.deliveryModal_DeliveryRate,
        }


        var customFields = [{
            Code: self.props.customFieldDefinition? self.props.customFieldDefinition[0].Code:'',
            DataFieldType: self.state.deliveryModal_DataFieldType,
            IsComparable: self.state.deliveryModal_IsComparable,
            Name: self.state.deliveryModal_Name,
            Values: [JSON.stringify(values)]
        }]

        var core = {
            
            CombinedPrice: self.state.manageShippingOptions.CombinedPrice,
            Courier: self.state.manageShippingOptions.Courier,
            CurrencyCode: self.props.marketplaceInformation.CurrencyCode,
            ID: self.state.manageShippingOptions.ID,
            Method: self.state.manageShippingOptions.Method,
            Description: self.state.description,
            CustomFields: customFields,
            Price: self.state.manageShippingOptions.Price,
            HasDeliveryRate: true
        }

        self.validateFields();

        //custom css reding of the select
        if ($(".sol-current-selection div").length < 1) {
            $('.sol-container').addClass('error-con');
        } else {
            $('.sol-container').removeClass('error-con');
        }

        if (!self.state.description || $('#my-select').val().join() == "" || self.state.deliveryModal_MinimumLeadTime.length < 1 || self.state.deliveryModal_DeliveryFrom.length < 1)
            return false;

        //validate if no existing delivery rates.
        if ($("#tblDeliveryRates tbody tr").length < 1) {
            if (self.state.crud_deliveryRatename.length < 1 || self.state.crud_deliveryCost.length < 1 || self.state.crud_rangeFrom.length < 1 || self.state.crud_rangeTo.length < 1 || self.state.crud_deliveryCost.length < 1)

                core.HasDeliveryRate = false;

        }

        return core;
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    onDeliveryRateSave(e) {

        var self = this;
        var dRate = self.state.deliveryModal_DeliveryRate;

        this.props.validatePermissionToPerformAction('add-merchant-delivery-option-api', () => {
            $('.range-box-notif ').hide()

            // check here the latset delivery
            if (dRate.length > 0) {
                var latestDrate = self.state.deliveryModal_DeliveryRate[dRate.length - 1];
                if (parseFloat(latestDrate.MaximumRange) >= parseFloat(self.state.crud_rangeFrom)) {

                    self.setState(
                        {
                            latestFromRatePrice: latestDrate.MaximumRange
                        }, function () {
                            $('.range-box-notif ').show()
                        });
                    e.preventDefault()
                    return;
                }
            }

            if (!self.isNumeric(self.state.crud_deliveryCost) && self.state.crud_deliveryCost !== "") {
                $('.delivery-cost').addClass('error-con');
                toastr.error("Invalid Delivery Cost", "Invalid Value");
                return
            }

            $('.fromTo-notif').hide();
            //check if from and to logic
            if (parseFloat(self.state.crud_rangeFrom) > parseFloat(self.state.crud_rangeTo) && self.state.crud_onwards == false) {
                $('.fromTo-notif').show()
                e.preventDefault()
                return;
            }

            self.validateFields();

            //custom css reding of the select
            //// SELECT
            if ($(".sol-current-selection div").length < 1) {
                $('.sol-container').addClass('error-con');
            } else {
                $('.sol-container').removeClass('error-con');
            }

            if (self.state.description.length < 1 || $('#my-select').val().join() == "" || self.state.deliveryModal_MinimumLeadTime.length < 1 || self.state.deliveryModal_DeliveryFrom.length < 1)
                return false;
            ///SELECT

            //GENERIC
            if (self.state.crud_deliveryCost.length < 1 || self.state.crud_rangeFrom.length < 1 || self.state.crud_deliveryRatename.length < 1)
                return false;

            if (self.state.crud_rangeTo.length < 1 && self.state.crud_onwards == false)
                return false;

            dRate.push({
                Cost: self.state.crud_deliveryCost,
                MaximumRange: self.state.crud_rangeTo,
                MinimumRange: self.state.crud_rangeFrom,
                Name: self.state.crud_deliveryRatename,
                Onwards: self.state.crud_onwards.toString()
            })

            self.setState({
                deliveryModal_DeliveryRate: dRate,
                crud_deliveryCost: '',
                crud_rangeTo: '',
                crud_rangeFrom: '',
                crud_deliveryRatename: ''
            }, function () {
                $('#btnAddDeliveryRate').click()
            });
        });
    }

    showRemoveRate() {
        this.props.validatePermissionToPerformAction('delete-merchant-delivery-option-api', () => {
            $('#modalRemoveRate').modal('show');
        });
    }

    onDoRemoveRate() {
        var self = this;

        this.props.validatePermissionToPerformAction('delete-merchant-delivery-option-api', () => {
            var test = self.state.deliveryModal_DeliveryRate;
            test.splice(self.state.deliveryModal_DeliveryRate.length - 1, 1);

            self.setState({
                deliveryModal_DeliveryRate: test
            }, function () {
            });
        });
    }

    toShowErrorOnwards() {
        var self = this;
        var theLength = self.state.deliveryModal_DeliveryRate.length;
        var theDelArray = self.state.deliveryModal_DeliveryRate;

        if (theLength < 1) {
            return 'text text-danger hide'
        }

        if (theDelArray[theLength - 1].Onwards == 'true') {
            return 'text text-danger'
        }
        else {
            return 'text text-danger hide'
        }
    }

    disableDataEntryForRates() {
        var self = this;
        return self.toShowErrorOnwards() == 'text text-danger' ? true : false
    }

    onChangeSetStateCallBack(stateName) {
        if (stateName == 'deliveryModal_ShippingRate') {
            $('#popupConfirmOpt').fadeIn();
            $('#cover').fadeIn()
        }
    }

    showRangeHeader(e) {
        var self = this;
        if (self.state.deliveryModal_ShippingRate == 'weight' || typeof e != 'undefined') {
            var searchWeightUnit = self.props.marketplaceInformation.CustomFields.filter(d => d.Name == 'Weight Unit');
            if (searchWeightUnit.length !== 0) {
                return searchWeightUnit[0].Values[0]
            }
            return;
        }
        else {
            return self.props.marketplaceInformation.CurrencyCode + ' ' + Currency(self.props.marketplaceInformation.CurrencyCode);
        }
    }

    toggleDeliveryRate() {
        this.props.validatePermissionToPerformAction('add-merchant-delivery-option-api', () => {
            $(".delivery-rate-content").slideToggle();
        });
    }
    renderEmpty() {
        if (this.state.deliveryModal_DeliveryRate && this.state.deliveryModal_DeliveryRate.length === 0) {
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
        var unitStr = self.showRangeHeader('forDataEntry') ? `(${self.showRangeHeader('forDataEntry')})` : '';
        var rangeHeaderUnitStr = self.showRangeHeader() ? `(${self.showRangeHeader()})` : '';

        return (
            <React.Fragment>
                <div id="modalRemoveRate" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure you want to delete this?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemove" data-dismiss="modal" onClick={(e) => self.onDoRemoveRate()}>Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dsae-content-inputs un-inputs">
                    <div className="item-form-group">
                        <div className="col-md-5">
                            <div className="row">
                                <label>Shipping option name</label>
                                <input type="text" name="delivery_name" className="required" data-react-state-name="description" defaultValue={self.state.description} onChange={(e) => this.onChange(e)} />
                            </div>
                        </div>
                    </div>
                    <div className="item-form-group">
                        <div className="col-md-12">
                            <div className="row">
                                <label>Shipping to</label>
                                <select id="my-select" name="character" multiple="multiple" className="required" data-react-state-name="countrySelectElement" defaultValue={self.state.countrySelectElement} onChange={(e) => this.onChange(e)}>
                                    <optgroup>
                                        {
                                            self.state.selectedCountries.map(function (country) {
                                                return (
                                                    <option selected={country.selected} key={country.name} value={country.alpha2code}>{country.name}</option>
                                                )
                                            })
                                        }
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="item-form-group">
                        <div className="col-md-5">
                            <div className="row">
                                <label>Minimum lead time</label>
                                <input type="text" name="minimum_time" className="required" data-react-state-name="deliveryModal_MinimumLeadTime" defaultValue={self.state.deliveryModal_MinimumLeadTime} onChange={(e) => this.onChange(e)} />
                            </div>
                        </div>
                    </div>
                    <div className="item-form-group">
                        <div className="col-md-5">
                            <div className="row">
                                <label>Where are you shipping from</label>
                                <input type="text" name="delivering_from" className="required" data-react-state-name="deliveryModal_DeliveryFrom" defaultValue={self.state.deliveryModal_DeliveryFrom} onChange={(e) => this.onChange(e)} />
                            </div>
                        </div>
                    </div>
                    <br />
                    <div className="item-form-group">
                        <div className="col-md-12">
                            <div className="row">
                                <label className="bold">Select if you would like to calculate shipping by total order weight or total order price</label>
                                <div className="option_box">
                                    <div className="fancy-radio">
                                        <input type="radio" defaultValue="weight" name="opt_del" id="weight" className data-react-state-name="deliveryModal_ShippingRate" checked={self.state.deliveryModal_ShippingRate == 'weight'} onChange={(e) => this.onChange(e)} />
                                        <label htmlFor="weight"><span>Weight <span>{unitStr}</span></span></label>
                                    </div>
                                    <div className="fancy-radio">
                                        <input type="radio" defaultValue="price" name="opt_del" id="price" className data-react-state-name="deliveryModal_ShippingRate" checked={self.state.deliveryModal_ShippingRate == 'price'} onChange={(e) => this.onChange(e)} />
                                        <label htmlFor="price"><span>Price</span></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dsc-table">
                    <div className="dsct-top full-width">
                        <div className="pull-left">
                            <span className="dsct-text light">Shipping Rate(s)</span>
                        </div>
                    </div>
                    <div className="ph-t-table">
                        <table className="table" id="tblDeliveryRates">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Range <span className="unit_area">{rangeHeaderUnitStr}</span></th>
                                    <th>Shipping Cost</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {self.showDefaultDeliveryRates()}
                            </tbody>
                        </table>
                        {this.renderEmpty()}
                    </div>
                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                        <div className="btn-add-delivery-rate" id="btnAddDeliveryRate" onClick={(e) => this.toggleDeliveryRate()}>Add Shipping Rate</div>
                    </PermissionTooltip>
                    <div className="delivery-rate-content">
                        <div className="dsae-content-inputs un-inputs">
                            <div className="dsae-form-input">
                                <div className="item-form-group">
                                    <div className="col-md-5">
                                        <div className="row">
                                            <label>Shipping Rate Name (Buyers will not see this)</label>
                                            <input className="required" type="text" disabled={self.disableDataEntryForRates()} name="delivery_rate" data-react-state-name="crud_deliveryRatename" defaultValue={self.state.crud_deliveryRatename} value={self.state.crud_deliveryRatename} onChange={(e) => this.onChange(e)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="item-form-group">
                                    <div className="col-md-6">
                                        <div className="row">
                                            <label>Range</label>
                                            <div className="col-md-9 range-a">
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <div className="row">
                                                            <input className="required number2DecimalOnly" disabled={self.disableDataEntryForRates()} type="number" name="range_start" data-react-state-name="crud_rangeFrom" defaultValue={self.state.crud_rangeFrom} value={self.state.crud_rangeFrom} onChange={(e) => this.onChange(e)} /> <span className="unit_area">{self.showRangeHeader()}</span>
                                                        </div>
                                                    </div>
                                                    <span>to</span>
                                                    <div className="col-md-5">
                                                        <div className="row">
                                                            <input className="required number2DecimalOnly" disabled={self.disableDataEntryForRates()} type="number" name="range_end" data-react-state-name="crud_rangeTo" defaultValue={self.state.crud_rangeTo} value={self.state.crud_rangeTo} onChange={(e) => this.onChange(e)} /> <span className="unit_area">{self.showRangeHeader()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="range-b hide">
                                                <div className="col-md-5">
                                                    <div className="row">
                                                        <input className="required number2DecimalOnly" disabled={self.disableDataEntryForRates()} type="number" name="input_onwards" data-react-state-name="crud_rangeFrom" defaultValue={self.state.crud_rangeFrom} value={self.state.crud_rangeFrom} onChange={(e) => this.onChange(e)} /> <span>{self.showRangeHeader()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="fancy-checkbox">
                                                    <input className="required" disabled={self.disableDataEntryForRates()} type="checkbox" name="opt_del" id="Onwards" data-react-state-name="crud_onwards" checked={self.state.crud_onwards} value={self.state.crud_onwards} onChange={(e) => this.onChange(e)} />
                                                    <label htmlFor="Onwards"><span>Onwards</span></label>
                                                </div>
                                            </div>
                                            <div className="range-box-notif full-width" style={{ 'display': 'none' }}>
                                                <div className="text text-danger">Cannot be smaller than or equal to last value {self.state.latestFromRatePrice}</div>
                                            </div>
                                            <div className="fromTo-notif full-width" style={{ 'display': 'none' }}>
                                                <div className="text text-danger">To range cannot be lower than From Range</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="item-form-group">
                                    <div className="col-md-4">
                                        <div className="row">
                                            <label>Shipping Cost</label>
                                            <input className="required delivery-cost number2DecimalOnly" disabled={self.disableDataEntryForRates()} type="number" name="delivery_cost" placeholder={this.formatMoney(self.props.marketplaceInformation.CurrencyCode, '0.00')} data-react-state-name="crud_deliveryCost" checked={self.state.crud_deliveryCost} value={self.state.crud_deliveryCost} onChange={(e) => this.onChange(e)} />
                                        </div>
                                    </div>
                                </div>
                                <div id='onwardError' className={self.toShowErrorOnwards()}>Unable to add new calculation if latest is set to 'onwards'</div>
                            </div>
                            <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                <div className="btn-save" id="btnSaveDeliveryRate" onClick={(e) => self.onDeliveryRateSave(e)}>Save</div>
                            </PermissionTooltip>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        );
    }
}

module.exports = DeliveryOptionComponent;