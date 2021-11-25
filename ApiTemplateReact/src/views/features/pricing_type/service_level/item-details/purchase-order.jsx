'use strict';
const React = require('react');
const Moment = require('moment');
const toastr = require('toastr');
const Currency = require('currency-symbol-map');
const CommonModule = require('../../../../../public/js/common');
const EnumCoreModule = require('../../../../../public/js/enum-core');
const BaseComponent = require('../../../../shared/base');
const PermissionTooltip = require('../../../../common/permission-tooltip');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PurchaseOrderComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedAddOns: [],
        };
        this.skipCart = process.env.SKIP_CART == 'true' || false;
    }

    componentDidMount() {
        let daysOfWeekDisabled = [];
        let disabledDates = [];
        if (this.props.itemDetails) {
            const { Scheduler } = this.props.itemDetails;
            if (Scheduler && Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                Scheduler.OpeningHours.map(opening => {
                    if (opening.IsRestDay) { daysOfWeekDisabled.push(opening.Day - 1)}
                });
            }
            const blockedDates = this.getBlockedDates();
            const dateTimeFormat = 'MM/DD/YYYY hh:mm A';
            blockedDates.map(blockedDate => {
                if (Moment(blockedDate.start, dateTimeFormat).format('HH:mm') == '00:00'
                    && Moment(blockedDate.end, dateTimeFormat).format('HH:mm') == '23:59') {
                    disabledDates.push(Moment(blockedDate.start).format('MM/DD/YYYY'));
                }
            });
        }

        $('.date-picker').datetimepicker({
            format: 'MM/DD/YYYY',
            ignoreReadonly: true,
            daysOfWeekDisabled,
            disabledDates,
            minDate: new Date().setHours(0,0,0,0),
        }).keypress(function(event){ 
            // event.preventDefault(); 
        });

        $('.time-picker').timepicker({ 'step': 15, 'timeFormat': 'h:i A'}).keypress(function(event){ 
            // event.preventDefault(); 
        });
    }

    doShowTimePicker() {
        if (this.props.itemDetails) {
            const { Scheduler, DurationUnit } = this.props.itemDetails;
            if (Scheduler) {
                return !Scheduler.Overnight && (DurationUnit 
                    && (DurationUnit.toLowerCase().includes('minute') 
                        || DurationUnit.toLowerCase().includes('hour')));
            } 
        }
        return false;
    }
 
    getBookingType() {
        const { DurationUnit, BookingUnit, PriceUnit } = this.props.itemDetails;
        if (!DurationUnit && !BookingUnit && !PriceUnit) return null;

        if (!DurationUnit || PriceUnit.toLowerCase() == DurationUnit.toLowerCase()) {
            return 'Book by duration';
        }
        if (BookingUnit && PriceUnit.toLowerCase() == BookingUnit.toLowerCase()) {
            return 'Book by unit';
        }

        return 'Book by duration and unit';
    }

    doShowDurationInputField() {
        const bookingType = this.getBookingType();
        return bookingType != null && bookingType != 'Book by unit';
    }

    doShowUnitInputField() {
        const bookingType = this.getBookingType();
        return bookingType != null && bookingType !== 'Book by duration';
    }

    getDurationStr() {
        if (this.props.itemDetails) {
            const { DurationUnit } = this.props.itemDetails

            return DurationUnit && DurationUnit.length > 0 ? 
                `${DurationUnit.charAt(0).toUpperCase() + DurationUnit.slice(1)}`
                : '';
        }
        return '';
    }

    getUnitStr() {
        if (this.props.itemDetails) {
            const { BookingUnit } = this.props.itemDetails

            return BookingUnit && BookingUnit.length > 0 ? 
                `${BookingUnit.charAt(0).toUpperCase() + BookingUnit.slice(1)}`
                : '';
        }
        return '';
    }

    onAddOnChange(e) {
        const self = this;
        const id = e.target.value;
        if (e.target.checked) {
            if (!this.state.selectedAddOns.some(a => a == id)) {
                this.setState({ selectedAddOns: [...self.state.selectedAddOns, id]});
            }
        } else {
            if (this.state.selectedAddOns.some(a => a == id)) {
                this.setState({ selectedAddOns: self.state.selectedAddOns.filter(a => a !== id) });
            }
        }
    }

    renderAddOns() {
        const self = this;
        if (this.props.itemDetails) {
            const { AddOns, CurrencyCode } = this.props.itemDetails;
            if (AddOns && AddOns.length > 0) {
                const activeAddOns = AddOns.filter(a => a.Active == true);
                const sortedAddOns = activeAddOns.sort((a,b) => a.SortOrder - b.SortOrder);
                return (
                    <span className="full-width">
                        <span className="title full-width">Select add-ons for your service</span>
                        <span className="idcrtl-right full-width relation order-radio">
                            {
                                sortedAddOns.map(addOn => 
                                    <span className="radio" key={addOn.ID}>
                                        <input type="checkbox" name="add-ons" id={addOn.ID} value={addOn.ID} onChange={(e) => this.onAddOnChange(e)} />
                                        <label htmlFor={addOn.ID}>
                                          <span>{addOn.Name}</span>
                                          <span>+ {self.formatMoney(CurrencyCode, addOn.PriceChange)}</span>
                                        </label>
                                    </span>
                                )
                            }           
                        </span>
                    </span>
                );               
            }
        }
    }

    getSubtotal() {
        let subtotal = 0;
        if (this.props.itemDetails) {
            const self = this;
            const { CurrencyCode, Price, AddOns } = this.props.itemDetails;
            const durationCount = parseInt(this.state.durationCount || 0);
            const unitCount = parseInt(this.state.unitCount || 0);

            if (this.doShowDurationInputField()) {
                subtotal = durationCount;
            }
            if (this.doShowUnitInputField()) {
                subtotal = subtotal > 0 ? subtotal * unitCount : unitCount;
            }

            if (subtotal > 0) {
                subtotal *= Price;
            }
            if (AddOns && AddOns.length > 0 && this.state.selectedAddOns && this.state.selectedAddOns.length > 0) {
                AddOns.map(addOn => {
                    if (self.state.selectedAddOns.includes(addOn.ID)) {
                        subtotal += addOn.PriceChange;
                    }
                });
            }
            
        }
        return subtotal;
    }

    getOpeningSchedule() {
        if (this.props.itemDetails) {
            const { Scheduler } = this.props.itemDetails;
            let scheduleArr = [];
            if (Scheduler) {
                if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                    Scheduler.OpeningHours.map(opening => {
                        let day = '';
                        switch(opening.Day) {
                            case 1:
                                day = 'Sunday';
                                break;
                            case 2:
                                day = 'Monday';
                                break;
                            case 3:
                                day = 'Tuesday';
                                break;
                            case 4:
                                day = 'Wednesday';
                                break;
                            case 5:
                                day = 'Thursday';
                                break;
                            case 6:
                                day = 'Friday';
                                break;
                            case 7:
                                day = 'Saturday';
                                break;

                        }

                        if (!opening.IsRestDay) {
                            const checkInTime = Moment(opening.StartTime, "HH:mm:ss").format('hh:mm A');
                            let checkOutTime = Moment(opening.EndTime, "HH:mm:ss").format('hh:mm A');
                            checkOutTime = checkOutTime == '12:00 AM' ? '11:59 PM' : checkOutTime;
                            scheduleArr.push({ day, startTime: checkInTime, endTime: checkOutTime });
                        }
                    });
                }
                return scheduleArr;
            }
        }
        return null;
    }

    getDatesBetweenRange(start, end, includeTime = false) {
        let dateArray = [];
        let currentDate = start;
        const dateFormat = 'MM/DD/YYYY';
        let format = dateFormat;
        if (includeTime) {
            format += ' hh:mm A'
        }
        while (Moment(currentDate, dateFormat).diff(Moment(end, dateFormat).set({ h: 23, m: 59})) <= 0) {
            dateArray.push(Moment(currentDate).format(format));
            currentDate = Moment(currentDate, dateFormat).add(1, 'd');
        }
        return dateArray;
    }

    getBlockedDates() {
        const self = this;
        if (this.props.itemDetails) {
            const { Scheduler } = this.props.itemDetails;
            let blockedDates = [];
            if (Scheduler) {
                if (Scheduler.Unavailables && Scheduler.Unavailables.length > 0) {
                    Scheduler.Unavailables.map(sched => {
                        if (sched && sched.Active) {
                            let fromDateTime = Moment.unix(sched.StartDateTime).utc();
                            let toDateTime = Moment.unix(sched.EndDateTime).utc();
                            const blockedDatesArr = self.getDatesBetweenRange(fromDateTime, toDateTime, true);
                            const blockedDatesRange = blockedDatesArr && blockedDatesArr.map((blockedDate, index) => {
                                return { 
                                    start: index == 0 ? blockedDate : Moment(blockedDate).format('MM/DD/YYYY') + ' 12:00 AM', 
                                    end: Moment(blockedDate).format('MM/DD/YYYY') + ' ' + (index == blockedDatesArr.length - 1 ?  Moment(toDateTime).format('hh:mm A') : '11:59 PM')
                                }
                            });
                            blockedDates = [...blockedDates, ...blockedDatesRange];
                        }
                    });
                }
            }
            return blockedDates;
        }
        return null;
    }

    getRestDays() {
        if (this.props.itemDetails) {
            const { Scheduler } = this.props.itemDetails;
            let restDays = [];
            if (Scheduler) {
                if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                    Scheduler.OpeningHours.map(opening => {
                        let day = '';
                        switch(opening.Day) {
                            case 1:
                                day = 'Sunday';
                                break;
                            case 2:
                                day = 'Monday';
                                break;
                            case 3:
                                day = 'Tuesday';
                                break;
                            case 4:
                                day = 'Wednesday';
                                break;
                            case 5:
                                day = 'Thursday';
                                break;
                            case 6:
                                day = 'Friday';
                                break;
                            case 7:
                                day = 'Saturday';
                                break;

                        }

                        if (opening.IsRestDay) {
                            restDays.push(day);
                        }
                    });
                }
                return restDays;
            }
        }
        return null;
    }

    validateBookingDetails() {
        const self = this;
        let hasEmpty = false;

        $('.required').removeClass('error-con');
        $('.idcrt-order-val .required').each(function () {
            if ($.trim($(this).val()) == '') {
                hasEmpty = true;
                $(this).addClass('error-con');
            }
        });

        if (hasEmpty) {
            return { isBookingValid: false };
        };

        if (self.props.user.Guest && self.props.controlFlags.GuestCheckoutEnabled === false) {
            toastr.error('Feature not available for guest user.')
            return { isBookingValid: false };
        }

        if (this.doShowDurationInputField() && this.state.durationCount == 0) {
            toastr.error('Duration is invalid.', 'Oops! Something went wrong.');
            return { isBookingValid: false };
        }

        if (this.doShowUnitInputField() && this.state.unitCount == 0) {
            toastr.error('Unit is invalid.', 'Oops! Something went wrong.');
            return { isBookingValid: false };
        }

        const selectedDate = $('#selectedDate').val();
        let selectedTime = '';
        if (this.doShowTimePicker()) {
            selectedTime = $('#selectedTime').val();
        }

        //get service opening hours based on selected date 
        const openingSchedule = this.getOpeningSchedule();
        let serviceStartTimeOnDay = '';
        let serviceEndTimeOnDay = '';

        const selectedDay = Moment(selectedDate, 'MM/DD/YYYY').format('dddd');
        if (openingSchedule && openingSchedule.length > 0) {
            let opening = openingSchedule.find(op => op.day == selectedDay);
            if (opening) {
                serviceStartTimeOnDay = opening.startTime;
                serviceEndTimeOnDay = opening.endTime;
            }
        }
        
        // get 24h format of selected time, service start & end time
        let selectedTimeOn24HFormat = '00:00';
        let startTimeOn24HFormat = '00:00';
        let endTimeOn24HFormat = '00:00';
        if (serviceEndTimeOnDay !== '') {
            selectedTimeOn24HFormat = Moment(selectedTime, 'hh:mm A').format('HH:mm');
            startTimeOn24HFormat = Moment(serviceStartTimeOnDay, 'hh:mm A').format('HH:mm');
            endTimeOn24HFormat = Moment(serviceEndTimeOnDay, 'hh:mm A').format('HH:mm');
        }

        // validate if selected time is same or after service start time
        const durationUnit = this.getDurationStr().toLowerCase();
        if (durationUnit.includes('hour') || durationUnit.includes('minute')) {
            if (serviceStartTimeOnDay !== '') {
                if (Moment(selectedTimeOn24HFormat, 'HH:mm').diff(Moment(startTimeOn24HFormat, 'HH:mm')) < 0) {
                    toastr.error('Your start time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                    return { isBookingValid: false };
                }
            }
        }

        const isAllDay = this.props.itemDetails.Scheduler.AllDay;
        const increment = durationUnit.match(/\d+/) ?  durationUnit.match(/\d+/)[0] : 1;
        const durationCount = parseInt(this.state.durationCount || 1);

        // validate if selected time is within the service start and end time
        if (serviceEndTimeOnDay !== '' && !isAllDay && this.doShowTimePicker()) {
            let isBeforeStartTime = Moment(selectedTimeOn24HFormat, 'HH:mm').diff(Moment(startTimeOn24HFormat, 'HH:mm')) < 0;
            let isAfterEndTime = Moment(endTimeOn24HFormat, 'HH:mm').diff(Moment(selectedTimeOn24HFormat, 'HH:mm')) < 0;
            if (!isBeforeStartTime && !isAfterEndTime) {
                let selectedDateTime = Moment(`${selectedDate} ${selectedTime.length > 0 ? selectedTime : '12:00 AM'}`, 'MM/DD/YYYY hh:mm A');
                let endDateTime = Moment(`${selectedDate} ${serviceEndTimeOnDay}`, 'MM/DD/YYYY hh:mm A');
                if (durationUnit.includes('hour')) {
                    selectedDateTime = Moment(selectedDateTime).add(durationCount * increment, 'h');
                } else if (durationUnit.includes('minute')) {
                    const totalMinutes = durationCount * increment;
                    selectedDateTime = Moment(selectedDateTime).add(parseInt(totalMinutes / 60), 'hours').add(parseInt(totalMinutes % 60), 'minutes');
                }
                
                if (Moment(endDateTime, 'HH:mm').diff(Moment(selectedDateTime, 'HH:mm')) < 0) {
                    toastr.error('Your end time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                    return { isBookingValid: false };
                }
            } else {
                toastr.error('Your end time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                return { isBookingValid: false };
            }
        }

        // get end date from selected date and time
        const selectedStartDateTime = Moment(`${selectedDate} ${selectedTime.length > 0 ? selectedTime : '12:00 AM'}`, 'MM/DD/YYYY hh:mm A');
        let selectedEndDateTime = Moment(`${selectedDate} ${selectedTime.length > 0 ? selectedTime : '12:00 AM'}`, 'MM/DD/YYYY hh:mm A');
        if (durationUnit !== '' && typeof durationUnit !== 'undefined') {
            if (durationUnit.includes('hour')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'h');
            } else if (durationUnit.includes('minute')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'm');
            } else if (durationUnit.includes('day')) {
                selectedEndDateTime = selectedEndDateTime.add((durationCount * increment) - 1, 'd');
            } else if (durationUnit.includes('night')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'd');
            } else if (durationUnit.includes('week')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'w').subtract(1, 'd');
            } else if (durationUnit.includes('month')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'M').subtract(1, 'd');
            } else if (durationUnit.match(/\d+/)) {
                //ARC10113
                if (this.props.itemDetails && this.props.itemDetails.Scheduler) {
                    let isOverNight = this.props.itemDetails.Scheduler.Overnight;
                    if (isOverNight === true) {
                        selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'd');
                    } else {
                        selectedEndDateTime = selectedEndDateTime.add((durationCount * increment) - 1, 'd');
                    }
                }
                
            }
        }

        // check if selected booking datetime is within blocked dates
        const blockedDates = this.getBlockedDates();
        if (blockedDates && blockedDates.length > 0) {
            let blockedDaysErrCount = 0;
            //validate selected datetime on blockdates within opening schedule
            blockedDates.map(blockedDate => {
                const is24HoursOpen = isAllDay && openingSchedule && openingSchedule.length == 0;
                if (is24HoursOpen) {
                    if (durationUnit.includes('hour') || durationUnit.includes('minute')) {
                        if (Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '[)')) {
                            blockedDaysErrCount += 1;
                        }
                        if (Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '(]')) {
                            blockedDaysErrCount += 1;
                        }
                        if (selectedStartDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '[)')) {
                            blockedDaysErrCount += 1;
                        }
                        if (selectedEndDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '(]')) {
                            blockedDaysErrCount += 1;
                        }
                    } else {
                        const date = Moment(blockedDate.start).format('MM/DD/YYYY');
                        const isUnavailable = Moment(date) >= Moment(Moment(selectedStartDateTime).format('MM/DD/YYYY')) && Moment(date) <= Moment(Moment(selectedEndDateTime).format('MM/DD/YYYY'));
                        if (isUnavailable) blockedDaysErrCount += 1;
                    }
                } else {
                    const isOvernight = this.props.itemDetails.Scheduler.Overnight;
                    if (durationUnit.includes('hour') || durationUnit.includes('minute')) {
                        if (Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '[)')) {
                            blockedDaysErrCount += 1;
                        }
                        if (Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '(]')) {
                            blockedDaysErrCount += 1;
                        }
                        if (selectedStartDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '[)')) {
                            blockedDaysErrCount += 1;
                        }
                        if (selectedEndDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '(]')) {
                            blockedDaysErrCount += 1;
                        }
                    } else {
                        const selectedDates = this.getDatesBetweenRange(Moment(selectedStartDateTime), Moment(selectedEndDateTime).add(23, 'h'));
                        selectedDates.forEach((date, i) => {
                            const day = Moment(date, 'MM/DD/YYYY').format('dddd');
                            const openingSched = isOvernight ? openingSchedule[0] : openingSchedule.find(op => op.day == day);
                            if (openingSched) {
                                const startTime = moment(i == 0 ? openingSched.minHour : '00:00 AM', 'HH:mm A').format('hh:mm A');
                                const endTime = moment(i  == selectedDates.length - 1 ? openingSched.maxHour : '23:59 PM', 'HH:mm A').format('hh:mm A');
                                const startDateTime = moment(date + ' ' + startTime, 'MM/DD/YYYY hh:mm A');
                                const endDateTime = moment(date + ' ' + endTime, 'MM/DD/YYYY hh:mm A');
                                if (Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A').isBetween(startDateTime, endDateTime, undefined, '[)')) {
                                    blockedDaysErrCount += 1;
                                }
                                if (Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A').isBetween(startDateTime, endDateTime, undefined, '(]')) {
                                    blockedDaysErrCount += 1;
                                }
                            }
                        });
                    }

                }
            });
            
            if (blockedDaysErrCount > 0) {
                toastr.error('Your selected booking period contains unavailable dates.', 'Oops! Something went wrong.');
                return { isBookingValid: false };
            }
        }


        const restDays = this.getRestDays();
        const selectedDates = this.getDatesBetweenRange(Moment(selectedStartDateTime), Moment(selectedEndDateTime).add(23, 'h'));
        
        // validate if selected date falls on rest days
        if (durationUnit.includes('day') && increment == 1) {
            let hasUnavailableDate = false;
            if (selectedDates && selectedDates.length > 0 && restDays && restDays.length > 0) {
                for (let i = 0; i < selectedDates.length > 0; i++) {
                    if (restDays.includes(Moment(selectedDates[i], 'MM/DD/YYYY').format('dddd'))) {
                        hasUnavailableDate = true;
                        break;
                    }
                }
            }
            if (hasUnavailableDate) {
                toastr.error('Your selected booking period contains unavailable dates.', 'Oops! Something went wrong.');
                return { isBookingValid: false };
            }
        }
        return { isBookingValid: true, selectedStartDateTime, selectedEndDateTime };
    }

    getBookingSlotData(selectedStartDateTime, selectedEndDateTime) {
        const { itemDetails } = this.props;
        const bookingSlot = {};

        if (itemDetails) {
            if (itemDetails.Scheduler) {
                bookingSlot.TimeZoneID = itemDetails.Scheduler.TimeZoneID;
            }

            bookingSlot.DurationUnit = itemDetails.DurationUnit;
            bookingSlot.Duration = this.state.durationCount || 1;
            if (selectedStartDateTime && selectedEndDateTime) {
                const FromDateTime = selectedStartDateTime.toDate();
                const ToDateTime = selectedEndDateTime.toDate();
                bookingSlot.FromDateTime = new Date(FromDateTime.getTime() + (1000 * 60 * (-FromDateTime.getTimezoneOffset()))).getTime()/1000;
                bookingSlot.ToDateTime = new Date(ToDateTime.getTime() + (1000 * 60 * (-ToDateTime.getTimezoneOffset()))).getTime()/1000;
            }

            const options = {
                selectedQuantity: 0,
                discount: 0,
                itemId: itemDetails.ID,
                force: true,
                isComparisonOnly: false,
                serviceBookingUnitGuid: itemDetails.ServiceBookingUnitGuid,
                bookingSlot: bookingSlot
            };

            if (this.state.selectedAddOns && this.state.selectedAddOns.length > 0) {
                options.addOns = this.state.selectedAddOns.map(addOnId => { return { ID: addOnId } });    
            }
            return options;
        }
        return {};
    }

    addItemToCart(e) {
        const self = this;
        if (!this.props.permissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-item-details-api', () => {
            if (self.props.processing === true) {
                return false;
            }

            const { isBookingValid, selectedStartDateTime, selectedEndDateTime } = self.validateBookingDetails();
            if (!isBookingValid) return;

            if (self.props.user && self.props.itemDetails.MerchantDetail.ID === self.props.user.ID) {
                toastr.error('self item seems to belong to you.', 'Oops! Something went wrong.');
                return;
            }

            self.props.setProcessing(true);

            let guestUserID = "";
            if (!self.props.user) {
                if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                    guestUserID = CommonModule.getCookie("guestUserID");
                }
            }

            if (self.props.itemDetails) {
                const quantity = self.state.unitCount || 1;
                const options = self.getBookingSlotData(selectedStartDateTime, selectedEndDateTime);

                self.props.addOrEditCart(
                    null,
                    quantity,
                    options,
                    (cartItem) => self.handleAddToCartSuccess(cartItem),
                    (errorMessage) => self.showMessage(errorMessage)
                    
                );
            }
            

            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            setTimeout(function () {
                self.props.setProcessing(false);
            }, 1000);
        });
    }

    contactSeller() {
        const self = this;
        if (!this.props.permissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-item-details-api', () => {
            if (self.props.processing === true) {
                return;
            }

            const { isBookingValid, selectedStartDateTime, selectedEndDateTime } = self.validateBookingDetails();
            if (!isBookingValid) return;

            const userDetail = self.props.user;
            const itemDetail = self.props.itemDetails;

            if (userDetail.ID === itemDetail.MerchantDetail.ID) {
                toastr.error('Cannot open chat, this item seems to belong to you.', 'Oops! Something went wrong.');
                return;
            }

            let item = self.props.itemDetails;
            const priceValues = self.props.priceValues;

            const options = {
                pageSize: 100,
                pageNumber: 1,
                includes: ['CartItemDetail', 'ItemDetail', 'User']
            }
            
            self.props.setProcessing(true);

            self.props.getUserChannels(options, function (channels) {
                let createNewChannel = false;
                let channel = null;

                //TODO: adjust API to include and check for open channels with pending offer
                if (channels && channels.TotalRecords === 0) {
                    createNewChannel = true;
                }
                else {
                    for (let i = 0; i < channels.TotalRecords; i++) {
                        let tempChannel = channels.Records[i];
                        if (tempChannel && tempChannel.ItemDetail) {
                            if (tempChannel.ItemDetail.ID === item.ID) {
                                channel = tempChannel;
                                break;
                            }
                            if (tempChannel && tempChannel.CartItemDetail && tempChannel.CartItemDetail.ItemDetail.ID === item.ID) {
                                channel = tempChannel;
                                break;
                            }
                        }
                    }
                    createNewChannel = !channel;
                }

                function getChatDetails(channel, callback) {
                    if (channel) {
                        self.props.getChatDetails(channel.ChannelID, function (details) {
                            callback(details);
                        });
                    } else {
                        callback();
                    }
                }
                $(".btn-loader").addClass('btn-loading');
                getChatDetails(channel, function (chatDetails) {
                    if (chatDetails && chatDetails.Channel && chatDetails.Channel.Offer && chatDetails.Channel.Offer.Accepted) {
                        createNewChannel = true;
                    }

                    if (createNewChannel) {
                        const quantity = self.state.unitCount || 1;
                        const options = self.getBookingSlotData(selectedStartDateTime, selectedEndDateTime);
                        self.props.createChatChannel({
                            recipientId: itemDetail.MerchantDetail.ID,
                            itemId: item.ID,
                            quantity: quantity,
                            serviceBookingUnitGuid: options.serviceBookingUnitGuid,
                            bookingSlot: options.bookingSlot,
                            addOns: options.addOns,
                            createCartItem: true
                        }, function (newChannel) {
                                $(".btn-loader").removeClass('btn-loading');

                            if (newChannel && newChannel != "" && newChannel.ChannelID != null) {
                                window.location = "/chat?channelId=" + newChannel.ChannelID;
                            } else {
                                if (newChannel.Code == 'INSUFFICIENT_STOCK') {
                                    self.showMessage(EnumCoreModule.GetToastStr().Error.INSUFFICIENT_STOCK);
                                } else if (newChannel.Code == 'INVALID_SERVICE_BOOKING') {
                                    self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_SERVICE_BOOKING);
                                } else {
                                    toastr.error('Error creating chat channel.', 'Error!');
                                }
                                self.props.setProcessing(false);
                            }
                        });
                    }
                    else {
                        $(".btn-loader").removeClass('btn-loading');
                        toastr.error('You still have an open channel/offer for this item.', 'Oops! Something went wrong.');
                        window.location = "/chat?channelId=" + channel.ChannelID;
                    }
                });
            });
        });
    }
    
    getLatestCartList() {
        let guestUserID = "";

        if (this.props.user && this.props.user.Guest !== undefined) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }
        if (!this.props.user) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }

        const options = {
            pageSize: 100,
            pageNumber: 1,
            includes: null,
            guestUserID: guestUserID
        };

        this.props.getUserCarts(options, null);
    }

    handleAddToCartSuccess(cartItem) {

        if (this.skipCart && cartItem && cartItem.ID) {
            this.props.generateInvoiceByCartItem([cartItem.ID], (invoiceNo) => {
                if (invoiceNo) {
                    return window.location = "/checkout/one-page-checkout?invoiceNo=" + invoiceNo;
                }

                self.showMessage(EnumCoreModule.GetToastStr().Error.INSUFFICIENT_STOCK);
            });
            
            return;
        }

        function fadeOutCart() {
            var target = $(".h-cart .h-dd-menu.add-cart");
            setTimeout(function () {
                target.removeClass('fadeout');
            }, 3000);
        }

        function isMobile() {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)) {
                return true;
            }
            return false;
        }

        this.getLatestCartList();

        const { CurrencyCode, Media, Name } = this.props.itemDetails;
        const image = Media && Media.length > 0 ? Media[0].MediaUrl : '';

        $(".h-cart .h-dd-menu.add-cart").addClass('fadeout');
        $('.h-cart .h-dd-menu.add-cart.fadeout').css('display', '');
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-img > img').attr('src', image);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > p').text(Name);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .currency').text(`${CurrencyCode} ${Currency(CurrencyCode)}`);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .value').text(this.formatMoneyWithoutCurrency(this.getSubtotal()));

        
        $('#selectedDate').val('');
        $('#selectedTime').val('');
        $('#durationCount').val('');
        $('#unitCount').val('');
        this.setState({
            durationCount: 0,
            unitCount: 0,
            selectedAddOns: []
        });
        $('input[name="add-ons"]').each(function (i, addOn) {
            $(addOn).prop('checked', false);
            $(addOn).attr('checked', false);
        });
        $('html, body').animate({
            'scrollTop': $(".h-cart").position().top
        });
        var itemImg = $(".idclt-img > img");
        if (!isMobile()) {
            var t = window.flyToElement($(itemImg), $('.h-cart'));
        }
        fadeOutCart();
        return false;
    }

    render() {
        const isNegotiate = this.props.itemDetails && !this.props.itemDetails.Negotiation ? "hide" : "";
        const isSpotPurchase = this.props.itemDetails && !this.props.itemDetails.InstantBuy ? "hide" : "";
        const currencyCode = this.props.itemDetails.CurrencyCode || '';
        const isDisabled = this.props.permissions.isAuthorizedToAdd ? "" : "disabled";
        return (
            <div className="idcr-top pull-left w-100">
                <div className="idcrt-order-val pull-left w-100">
                    <span className="idcrt-title">Book Listing</span>
                    <div className="idcrt-list-val">
                        <div className="full-width mb-15">
                            <span className="title full-width">Select Date:</span>
                            <div className="idcrtl-right full-width relation">
                                <input type="text" id="selectedDate" className="form-control text-left theme-input date-picker required" />
                            </div>
                        </div>
                        {
                            this.doShowTimePicker()?
                                <div className="full-width mb-15">
                                    <span className="title full-width">Select Time:</span>
                                    <div className="idcrtl-right full-width relation">
                                        <input type="text" id="selectedTime" className="form-control text-left theme-input time-picker required ui-timepicker-input" autoComplete="off"/>
                                    </div>
                                </div>
                            : ''
                        }
                        {
                            this.doShowDurationInputField()?
                                <span className="full-width">
                                    <span className="title full-width">No. of {this.getDurationStr() + 's:'}</span>
                                    <span className="idcrtl-right full-width relation">
                                        <input type="text" id='durationCount' className="form-control theme-input required numbersOnly" data-react-state-name={"durationCount"} onChange={(e) => this.onChange(e)}/>
                                    </span>
                                </span>
                            : ''
                        }
                        {
                            this.doShowUnitInputField()?
                                <span className="full-width">
                                    <span className="title full-width">No. of {this.getUnitStr() + 's:'}</span>
                                    <span className="idcrtl-right full-width relation">
                                        <input type="text" id='unitCount' className="form-control theme-input required numbersOnly" data-react-state-name={"unitCount"} onChange={(e) => this.onChange(e)}/>
                                    </span>
                                </span>
                            : ''
                        }
                    </div>
                    {this.renderAddOns()}
                </div>
                <div className="idcrt-order-total pull-left w-100">
                    <span>Subtotal:</span>
                    <span className="total-price">
                        <div className="item-price">
                            {this.renderFormatMoney(currencyCode, this.getSubtotal())}
                        </div>
                    </span>
                </div>
                <div className="idcrt-order-btn pull-left w-100">
                    <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToAdd} >
                        <div className={"btn-group btn-cart" + isSpotPurchase + " " + isDisabled} id="itemAddCart" onClick={(e) => this.addItemToCart(e)}>{this.skipCart ? 'Buy now' : 'Add to Cart' }</div>
                    </PermissionTooltip>
                    <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToAdd} >
                        <div className={"btn-group contact-btn btn-loader " + isNegotiate + " " + isDisabled} id="negotiate" onClick={(e) => this.contactSeller(e)}>Negotiate</div>
                    </PermissionTooltip>
                </div>
            </div>
        );
    }
}

module.exports = PurchaseOrderComponent;