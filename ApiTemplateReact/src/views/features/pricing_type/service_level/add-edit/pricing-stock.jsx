'use strict';
var React = require('react');
var BaseComponent = require('../../../../shared/base');
let toastr = require('toastr');
let CommonModule = require('../../../../../public/js/common');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PricingStockComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.onItemPriceChanged = this.onItemPriceChanged.bind(this);
      //  this.aditional_services_addon_add = this.aditional_services_addon_add(this);
      //  this.aditional_services_addon_remove = this.aditional_services_addon_remove(this);
    }

    componentDidMount() {
        let self = this;
        $("body").on("click", ".cell-unlimited span", function () {
            $(this).parent(".fancy-checkbox").find("input").trigger("click");
        });
        $("#itemNewPrice").on("change", function () {
            this.value = parseFloat(this.value).toFixed(2);
        });
        $("#itemNewPrice").blur(function () {
            this.value = parseFloat(this.value).toFixed(2);
        });

        self.calcPosition();
        $("body").on('click', '.tab-mobile', function () {
            $("#seller-upload-tab").slideToggle();
        });
        $("body").on("click", '#seller-upload-tab li ', function () {
            var active_text = $(this).text();
            /*$(this).parent('#seller-upload-tab').slideUp();*/
            $(".drop-box-area span").html(active_text);
        });
        if (!$('.classy-checkbox input[type=checkbox]:checked').length) {
            $('.classy-checkbox').addClass('error-con');
        }

        $('.classy-checkbox input[type=checkbox]').change(function () {
            if ($('.classy-checkbox input[type=checkbox]:checked').length <= 0) {
                $(this).prop('checked', true);
            }
            if ($(this).is(":checked")) {
                $(this).parents('.classy-checkbox').addClass('active');
            } else {
                $(this).parents('.classy-checkbox').removeClass('active');
            }
        });

        //if (this.props.itemModel.bookingUnit !== "") {
        //    $('#booking-type').val(this.props.itemModel.bookingUnit);
        //}

        //self.buildBookingOptions();


        if (this.props.itemModel.durationUnit && this.props.itemModel.durationUnit.match(/\d+/g) !== null) {
            jQuery('.itmupld-srvcs-durationlst-sec .itmupld-srvcs-durspecifycon').show();
        }

        //if (self.props.itemModel.durationUnit.toLowerCase() == 'custom' && self.props.itemModel.) {

        //    text = $('#itmupld_srvcs_specify1').val() + ' ' + $('#itmupld_srvcs_specify2').val();
        //    self.props.durationChanged(text);

        //} 

        self.stepStuff();
        var $ob_val = jQuery(".min_srvcs_speci");

        if (this.props.itemModel.durationUnit && this.props.itemModel.durationUnit !== "" && this.props.itemModel.durationUnit.match(/\d+/g) !== null) {
            var r = /\d+/;
            var thenum = this.props.itemModel.durationUnit.match(r);

            if (thenum) {
                $ob_val.val(thenum[0]);
            }

            //Fixed for ARC9783
            var $ob_time = jQuery(".srvcs_specify_time")
            let withoutNumbers = this.props.itemModel.durationUnit.replace(/[0-9]/g, '');
            withoutNumbers = withoutNumbers.replace(" ", "");
            var isValidOption = false;
            jQuery(".srvcs_specify_time option").each(function () {
                if ($(this).val() === withoutNumbers) {
                    isValidOption = true;
                }
            });
            if (isValidOption) {
                $ob_time.val(withoutNumbers);
            }

            if ($ob_time.val() == 'Minute(s)') {
                $ob_val.attr('step', 5);
                $ob_val.attr('min', 14);
                $ob_val.attr('max', 151);

            } else if ($ob_time.val() == 'Hour(s)') {
                $ob_val.attr('step', 1);
                $ob_val.attr('min', 0);
                $ob_val.attr('max', 24);

            } else {
                $ob_val.attr('step', 1);
                $ob_val.attr('min', 0);
                $ob_val.attr('max', 29);

            }

        }

        jQuery(".srvcs_specify_time").change(function (e) {
            self.stepStuff();
            self.props.durationChanged(e.target.value + " durReset");
        });

        jQuery('#itmupld_srvcs_specify2').change(function () {
           // self.serviceDescription();
        });


        jQuery('body').on('change', '#unlimit-booking-chk', function () {
            var target = jQuery('#itmupld_srvcs_maxbookingpersession');
            var $this = jQuery(this);
            target.removeAttr('disabled');
            if ($this.is(':checked')) {
                target.attr('disabled', 'disabled');
                jQuery('#maximum-booking-txt').hide();
                jQuery('#itmupld_srvcs_maxbookingpersession').removeClass('required');
            } else {
                jQuery('#maximum-booking-txt').show();
                jQuery('#itmupld_srvcs_maxbookingpersession').addClass('required');
            }
        });

        jQuery('.itmuplodpg-oprthrs-ind input[type="checkbox"]').click(function () {
            if (jQuery(this).is(':checked')) {
                jQuery(this).closest('.itmuplodpg-oprthrs-ind').find('input[type="text"]').removeAttr('disabled');
            } else {
                jQuery(this).closest('.itmuplodpg-oprthrs-ind').find('input[type="text"]').attr('disabled', 'disabled');
            }
        });

        $('.spinner .btn:first-of-type').on('click', function () {
            var btn = $(this);
            var step = 1;
            var input = btn.closest('.spinner').find('input');
            var step_ob = input.attr('step');
            if (typeof step_ob !== typeof undefined && step_ob !== false) {
                step = parseInt(step_ob)
            }
            if (input.attr('max') == undefined || (parseInt(input.val()) + parseInt(step_ob)) < parseInt(input.attr('max'))) {
                input.val(parseInt(input.val(), 10) + step);
            } else {
                btn.next("disabled", true);
            }

            self.props.durationChanged(input.val() + " customDur");
        });
        $('.spinner .btn:last-of-type').on('click', function () {
            var btn = $(this);
            var step = 1;
            var input = btn.closest('.spinner').find('input');
            var step_ob = input.attr('step');
            if (typeof step_ob !== typeof undefined && step_ob !== false) {
                step = parseInt(step_ob)
            }
            if (input.attr('min') == undefined || (parseInt(input.val()) - parseInt(step_ob)) > parseInt(input.attr('min'))) {
                input.val(parseInt(input.val(), 10) - step);
            } else {
                btn.prev("disabled", true);
            }
            self.props.durationChanged(input.val() + " customDur");
        });
        jQuery("#sortable-list").sortable();
       // jQuery('.numbersOnlyd').keyup(function () { this.value = this.value.replace(/[^0-9]/g, ''); });
        /*jQuery('.pickerdaterange').daterangepicker({
          opens: 'left'
        }); */
        $('#st_date').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        $('#end_date').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        $('#st_time').datetimepicker({
            format: 'LT'
        });
        $('#end_time').datetimepicker({
            format: 'LT'
        });
        $(".pickerdaterange").on("keydown", function (e) {
            // e.preventDefault();
        });
      //  CKEDITOR.replace('text-editor');

        jQuery('#operate-24-chk').click(function () {
            if (jQuery(this).is(':checked')) {
                jQuery('.itmuplodpg-oprt-hrssec').hide();
            } else {
                jQuery('.itmuplodpg-oprt-hrssec').show();
            }
        });

        jQuery('.itmuplodpg-oprthrs-timepicker').timepicker({ 'step': 15, 'timeFormat': 'h:i A', 'disableTimeRanges': [], 'className': 'timepicker-hourly' });
        jQuery('.itmuplodpg-bksrvcs-timepicker').timepicker({ 'step': 15, 'timeFormat': 'h:i A', 'disableTimeRanges': [], 'className': 'timepicker-hourly' });

    }

    calcPosition() {
        $('.tab-container').each(function () {
            $(this).attr('data-position', $(this).offset().top);
        });
    }

    buildDurationOptions() {
        var options = $('#booking-type option:selected').data('options')
        var value = $.trim($('#booking-type option:selected').val());
        var $target = $('#itmupld_srvcs_specify2');
        if (options) {
            $target.html('');
            var arrOptions = options.split(',');
            if (arrOptions.length > 0) {
                if ($('#booking-type').val() == 'Person') {
                    arrOptions.splice(arrOptions.indexOf('week'), 1);
                    
                }
                //Remove week and month
                if (value == 'Default' || value == 'Overnight Default') {
                    arrOptions.splice(arrOptions.indexOf('week'), 1);
                    arrOptions.splice(arrOptions.indexOf('month'), 1);
                }

                for (var i = 0; i < arrOptions.length; i++) {
                    var option = arrOptions[i].charAt(0).toUpperCase() + arrOptions[i].slice(1, arrOptions[i].length).toLowerCase() + '(s)';
                    $target.append('<option>' + option + '</option>');
                }
            }
            //if (value == 'Person' || value == 'Overnight Default') {
            //    this.props.dayOrNightSwitch(true);
            //} else {
            //    this.props.dayOrNightSwitch(false);
            //}
        }
    }

    buildBookingOptions() {
        var options = $('#booking-type option:selected').data('options')
        if (options) {
            $('.addon-type').hide();
            var arrOptions = options.split(',');
            if (arrOptions.length > 0) {
                for (var i = 0; i < arrOptions.length; i++) {
                    $('.addon-type-' + arrOptions[i]).css('display', 'inline-block');
                }
            }
            $('.addon-type-Custom').css('display', 'inline-block');
        }
      //  $('.itmupld-srvcs-duration-ind .addon-type:visible').eq(0).find('input[type=radio]').prop('checked', true).trigger('change');
        $('.itmupld-srvcs-durspecifycon').hide();

        var type = $('#booking-type').val();
    //    this.props.bookingTypeChanged(type);
        if (type == 'Default') {
            $('.operate-24-sec').removeClass('hide');
            $('#operate-24-chk').prop('checked', true).trigger('change');
            $('.itmuplodpg-booksrvcs-sec').hide();
        } else if (type == 'Overnight Default') {
            $('.operate-24-sec').addClass('hide');
            $('#operate-24-chk').prop('checked', false).trigger('change');
            jQuery('.itmuplodpg-oprt-hrssec').hide();
            $('.itmuplodpg-booksrvcs-sec').show();
        } else if (type == 'Parking Spot') {
            $('.operate-24-sec').removeClass('hide');
            $('#operate-24-chk').prop('checked', true).trigger('change');
            $('.itmuplodpg-booksrvcs-sec').hide();
        }
        else if (type == 'Person') {
            $('.operate-24-sec').addClass('hide');
            $('#operate-24-chk').prop('checked', false).trigger('change');
            $('.itmuplodpg-booksrvcs-sec').show();
        }
        else {
            $('.operate-24-sec').removeClass('hide');
            $('#operate-24-chk').prop('checked', true).trigger('change');
            $('.itmuplodpg-booksrvcs-sec').hide();
        }

        this.buildDurationOptions();
    }

    service_duration_change() {
        var vl = jQuery('.itmupld-srvcs-durationlst-sec input[name="itmupld-srcs-duation"]:checked').val();
        if (vl == 'Custom') {
            jQuery('.itmupld-srvcs-durationlst-sec .itmupld-srvcs-durspecifycon').show();
        } else {            
            jQuery('.itmupld-srvcs-durationlst-sec .itmupld-srvcs-durspecifycon').hide();
        }
      //  this.serviceDescription();
    }

    serviceDescription() {
        var type = $('#booking-type').val();
        var duration = $('input[name=itmupld-srcs-duation]:checked').val();

        var text = ' ' + duration;
        if (duration == 'Custom') {

            text = $('#itmupld_srvcs_specify1').val() + ' ' + $('#itmupld_srvcs_specify2').val();
            this.props.durationChanged(text);

        } else {
            this.props.durationChanged(duration);
        }

        //For Duration Only
        if (process.env.BOOKING_TYPE === "duration") {
            $('.bs-type').html(text);
        } else {
            if (type == 'Person' || type == 'Parking Spot' || type == 'Car') {
                $('.bs-type').html(type);
            } else {
                $('.bs-type').html(text);
                //$('.bs-time').html(text);
            }
        }

    }

    stepStuff() {
        var $ob_time = jQuery(".srvcs_specify_time");
        var $ob_val = jQuery(".min_srvcs_speci");
        if ($ob_time.val() == 'Minute(s)') {
            $ob_val.attr('step', 5);
            $ob_val.attr('min', 14);
            $ob_val.attr('max', 151);
            $ob_val.val('15');
        } else if ($ob_time.val() == 'Hour(s)') {
            $ob_val.attr('step', 1);
            $ob_val.attr('min', 0);
            $ob_val.attr('max', 24);
            $ob_val.val('1');
        } else {
            $ob_val.attr('step', 1);
            $ob_val.attr('min', 0);
            $ob_val.attr('max', 29);
            $ob_val.val('1');
        }
    }

    aditional_services_addon_add() {
        var ad_name = jQuery('#adtnservcs_addon_name').val();
        var ad_price = jQuery('#adtnservcs_addon_price').val();
        var e = false;
        jQuery('#adtnservcs_addon_name,#adtnservcs_addon_price').removeClass('error-con');
        if (jQuery.trim(ad_name) == '') {
            jQuery('#adtnservcs_addon_name').addClass('error-con');
            e = true;
        }
        if (jQuery.trim(ad_price) == '') {
            jQuery('#adtnservcs_addon_price').addClass('error-con');
            e = true;
        }

        //var x = jQuery('#dummy_addtion_extend_adon li').eq(0).clone(true);
        //jQuery('.item-name', x).text(ad_name);
        //jQuery('.addonsecdrag-price-area span', x).text('SGD $' + ad_price);
        //jQuery('#sortable-list').append(x);
        jQuery('#adtnservcs_addon_name').val('');
        jQuery('#adtnservcs_addon_price').val('');

        if (e == true) {
            return false;
        } else {
            let addOn = {
                Name: ad_name,
                PriceChange: ad_price,
                Active: true,
                ID: CommonModule.guidGenerator()
            };

            if (this.props.itemModel.addOns) {
                let addOnPresent = this.props.itemModel.addOns.filter(a => a.Active === true && a.Name.toLowerCase() === ad_name.toLowerCase());
                if (addOnPresent && addOnPresent.length === 0) {
                    this.props.addOnAdd(addOn);
                } else {
                    toastr.error('Existing Addon Name');
                }
            }


        }

    }

    aditional_services_addon_remove(id) {
       // jQuery(x).closest('li').remove();
        this.props.addOnDelete(id);
    }

    onItemPriceChanged(e) {
        if (e.target.value) {
            this.props.onTextChange(e.target.value, "itemprice")
        }
    }
    renderCustomDuration() {
        if (this.props.itemModel.isOverNight !== true) {
            return (
                <React.Fragment>
                    <option>Minute(s)</option>
                    <option>Hour(s)</option>
                    <option>Day(s)</option>
                </React.Fragment>
                )
        } else {
            return (<option>Night(s)</option>)
        }
    }
    render() {
        let self = this;

        let customCheck = self.props.itemModel.durationUnit && self.props.itemModel.durationUnit.match(/\d+/g) !== null ? true : false;
        let bookingTypes = self.props.itemModel.implementationBookings.BookingUnits;

        let selectedBooking = bookingTypes.find(b => b.Name.toLowerCase() === self.props.itemModel.bookingUnit.toLowerCase());

        let durations = selectedBooking ? selectedBooking.Durations.split("|") : '';
        let acceptedDurations = [];

        if (durations) {

            durations.map(function (dur,i) {
                let dataToCheck = dur.toLowerCase();
                let dataModel = {
                    Name: dur,
                    Selected: self.props.itemModel.durationUnit && dataToCheck === self.props.itemModel.durationUnit.toLowerCase() ? "checked" : ""
                }
                if (self.props.itemModel.durationUnit === "" && i === 0) {
                    dataModel.Selected = "checked";
                }
                //CUSTOM selected
                if (customCheck === true) {
                    if (dataToCheck === "custom") {
                        dataModel.Selected = "checked";
                    }

                }
                acceptedDurations.push(dataModel);
            });
        }

        let stockUnlimited = this.props.itemModel.isUnlimitedStock === true ? "checked" : "";

        if ($) {
            var target = $('#itmupld_srvcs_maxbookingpersession');
            target.removeAttr('disabled');
            if (this.props.itemModel.isUnlimitedStock === true) {
                target.attr('disabled', 'disabled');
                $(target).removeClass('required');
            } else {
                $('#maximum-booking-txt').show();
                $('#itmupld_srvcs_maxbookingpersession').addClass('required');
            }
        }
        let addOnsActive = [];
        if (this.props.itemModel.addOns) {
            addOnsActive = this.props.itemModel.addOns.filter(a => a.Active === true);
        }

        return (
            <React.Fragment>
                <div className="tab-container tabcontent" id="pricing_tab">
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Pricing</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs">
                        <div className="item-form-group">
                            <div className="row">
                                <div className="col-md-6">
                                    <label>Select booking type</label>
                                    <select name="booking-type" id="booking-type" value={self.props.itemModel.bookingUnit}
                                        onChange={(e) => self.props.bookingTypeChanged(e.target.value)}>
                                        {
                                            bookingTypes.map(function (data) {
                                                return (<option value={data.Name}>{data.Name}</option>)
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="clearfix"></div>
                        <div className="itmupld-srvcs-durationlst-sec">
                            <div className="item-form-group">
                                <div className="col-md-12">
                                    <div className="row">
                                        <label>Service Duration</label>
                                        <div className="itmupld-srvcs-duration-ind">
                                            {
                                                acceptedDurations.map(function (dur) {
                                                    return (
                                                        <div className="addon-checkbox-sec addon-type">
                                                            <input id={dur.Name} type="radio" checked={dur.Selected} onChange={(e) => self.props.durationChanged(dur.Name)} name="itmupld-srcs-duation"/>
                                                            <label htmlFor={dur.Name}> <span className="addonbtngray-checkbox-text">/ {dur.Name}</span> </label>
                                                    </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="itmupld-srvcs-duration-specify itmupld-srvcs-durspecifycon" style={{ display: 'none' }}>
                                <div className="item-form-group">
                                    <label>Specify your service duration</label>
                                    <div className="itmupld-srvcs-specify1 ">
                                        <div className="itmupld-srvcs-specify">
                                            <div className="input-group spinner">
                                                <input readOnly="readonly" type="text" className="min_srvcs_speci" id="itmupld_srvcs_specify1" defaultValue={1} min={14} max={151} step={5} />
                                                <div className="input-group-btn-vertical">
                                                    <button className="btn btn-default" type="button"><i className="fa fa-caret-up" /></button>
                                                    <button className="btn btn-default" type="button"><i className="fa fa-caret-down" /></button>
                                                </div>
                                            </div>
                                            {/*<input type="text" class="min_srvcs_speci" id="itmupld_srvcs_specify1"  value="1" class="required" /> */}
                                        </div>
                                    </div>
                                    <div className="itmupld-srvcs-specify">
                                        <select id="itmupld_srvcs_specify2" className="srvcs_specify_time">
                                            {self.renderCustomDuration()}
                                        </select>
                                    </div>
                                    <div className="clearfix" />
                                </div>
                            </div>
                            <div className="itmupld-srvcs-duration-specify" id="upload_svc_price">
                                <div className="item-form-group">
                                    <div className="col-md-12">
                                        <div className="row">
                                            <label>Price</label>
                                            <div className="itmupld-srvcs-specify">
                                                <input className="required numberDecimalOnly validateZero" id="itmupld_srvcs_price" type="text" name="Price" step="0.25" value={this.props.itemModel.price}                                                  
                                                    onChange={(e) => this.props.onTextChange(e.target.value, "itemprice")}
                                                    onBlur={this.onItemPriceChanged} />
                                            </div>
                                            <div className="set-time-slash">/</div>
                                            <div className="itmupld-srvcs-priceunit">
                                                <span className="bs-type">{self.props.itemModel.priceUnit}</span>{/*per <span class="bs-time">hour(s)</span>*/}</div>
                                            <div className="clearfix" />
                                        </div>
                                    </div>
                                </div>
                                <div className="item-form-group">
                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="itmupld-srvcs-duration-specify">
                                                <div className="vant-title">Allow unlimited bookings?<span>*</span></div>
                                                <div className="onoffswitch">
                                                    <input type="checkbox" checked={stockUnlimited} onChange={(e) => this.props.onToggleChange(e.target.checked, "itemunlimitedstock")} name="onoffswitch" className="onoffswitch-checkbox" id="unlimit-booking-chk" />
                                                    <label className="onoffswitch-label" htmlFor="unlimit-booking-chk"> <span className="onoffswitch-inner" /> <span className="onoffswitch-switch" /> </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="item-form-group">
                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="itmupld-srvcs-duration-specify">
                                                <div className="vant-title">Maximum bookings per session<span>*</span></div>
                                                <div className="itmupld-srvcs-specify">
                                                    <input type="text" id="itmupld_srvcs_maxbookingpersession" className="required numbersOnly" onChange={(e) => this.props.onTextChange(e.target.value, "itemquantity")} defaultValue={this.props.itemModel.quantity} />
                                                </div>
                                                <div className="clearfix" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div className="itmupld-adtnservcs-addonsec">
                                <div className="itmupld-adtnservcs-addonedit row">
                                    <div className="col-sm-7">
                                        <label>Add-On Name</label>
                                        <input type="text" defaultValue={this.props.itemModel.addOn.name} id="adtnservcs_addon_name" />
                                    </div>
                                    <div className="col-sm-3">
                                        <label>Surcharge</label>
                                        <input type="text" defaultValue={this.props.itemModel.addOn.priceChange} placeholder="SGD $ 0.00" className="numberDecimalOnly" id="adtnservcs_addon_price" />
                                    </div>
                                    <div className="col-sm-2"> <a onClick={(e) => self.aditional_services_addon_add()} className="adtservs-addon-addbtn">ADD</a> </div>
                                    <div className="clearfix" />
                                </div>
                                <div className="clearfix" />
                                <ul id="sortable-list" className="ui-sortable">
                                    {
                                        addOnsActive.map(function (addOn,i) {
                                            return (
                                                <li className="has-subitems ui-sortable-handle">
                                                    <div className="row-wrapper">
                                                        <div className="addonsec-drag-isec"><a className="cursor-move" href=""><i className="icon icon-draggble" /></a></div>
                                                        <div className="name-area"><span className="item-name" addOnID={addOn.ID} addOnGroupID={addOn.GroupID}>{addOn.Name}</span></div>
                                                        <div className="addonsecdrag-price-area"><span>
                                                            {self.renderFormatMoney(self.props.itemModel.currencyCode, addOn.PriceChange)}
                                                        </span></div>
                                                        <div className="addonsecdrag-btnarea"><a onClick={(e) => self.aditional_services_addon_remove(addOn.ID)} className="delete-cat"><i className="cmn-icon-circlewrong" /></a></div>
                                                        <div className="clearfix" />
                                                    </div>
                                                </li>
                                                )
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="clearfix"></div>
                </div>
            </React.Fragment>
        )
    }
}

module.exports = PricingStockComponent;