'use strict';
const React = require('react');
const toastr = require('toastr');
const Moment = require('moment');

class CheckoutButtonMain extends React.Component {

	isDisabled() {
        return this.props.cartIDs.length !== 0 && this.props.cartIDs.length > 1 ? 'disabled' : '';
	}

    onCheckoutBtnClick() {
        const self = this;
        const opt = {
            cartDataArr: this.props.cartDataArr,
            userID: this.props.user.ID
        }

        if (this.props.processing == true) return;
        this.props.setProcessing(true);
        this.props.validateCarts(opt, function(result) {
            if (result.success) {
                const itemId = opt && opt.cartDataArr && opt.cartDataArr.length > 0 ? opt.cartDataArr[0].ItemID : null;
                const bookingSlot = opt && opt.cartDataArr && opt.cartDataArr.length > 0 ? opt.cartDataArr[0].BookingSlot : null;
                if (itemId && bookingSlot) {
                    //get latest item details
                    self.props.getItemDetails(itemId, (item) => {
                        //ARC-9672
                        if (item && item.ID) {
                            self.validateBookingDetails(item, bookingSlot, (isValid) => {
                                if (isValid) {
                                    self.props.CheckoutButtonPressedWrapper(self.props.cartIDs, self.props.user.ID); 
                                }
                            });
                        } else {
                            self.props.setProcessing(false);
                        }
                    });
                } else {
                    self.props.setProcessing(false);
                }
            } else {
                self.props.setProcessing(false);
            }
        });
    }

    hasTimePicker(item) {
        if (item) {
            const { Scheduler, DurationUnit } = item;
            if (Scheduler) {
                return !Scheduler.Overnight && (DurationUnit 
                    && (DurationUnit.toLowerCase().includes('minute') 
                        || DurationUnit.toLowerCase().includes('hour')));
            } 
        }
        return false;
    }

    getOpeningSchedule(item) {
        if (item) {
            const { Scheduler } = item;
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

    getBlockedDates(item) {
        const self = this;
        if (item) {
            const { Scheduler } = item;
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

    getRestDays(item) {
        if (item) {
            const { Scheduler } = item;
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

    validateBookingDetails(item, bookingSlot, callback) {
        const self = this;
        const selectedDate = Moment.unix(bookingSlot.FromDateTime).utc().format('MM/DD/YYYY');
        let selectedTime = '';
        if (this.hasTimePicker(item)) {
            selectedTime = Moment.unix(bookingSlot.FromDateTime).utc().format('hh:mm A');
        }

        //get service opening hours based on selected date 
        const openingSchedule = this.getOpeningSchedule(item);
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
        const durationUnit = item.DurationUnit.toLowerCase();
        if (durationUnit.includes('hour') || durationUnit.includes('minute')) {
            if (serviceStartTimeOnDay !== '') {
                if (Moment(selectedTimeOn24HFormat, 'HH:mm').diff(Moment(startTimeOn24HFormat, 'HH:mm')) < 0) {
                    toastr.error('Your start time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                    return callback(false);
                }
            }
        }

        const isAllDay = item.Scheduler.AllDay;
        const increment = durationUnit.match(/\d+/) ?  durationUnit.match(/\d+/)[0] : 1;
        const durationCount = bookingSlot.Duration || 1;

        // validate if selected time is within the service start and end time
        if (serviceEndTimeOnDay !== '' && !isAllDay && this.hasTimePicker(item)) {
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
                    return callback(false);
                }
            } else {
                toastr.error('Your end time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                return callback(false);
            }
        }
        // get end date from selected date and time
        const selectedStartDateTime = Moment(Moment.unix(bookingSlot.FromDateTime).utc().format('MM/DD/YYYY hh:mm A'), 'MM/DD/YYYY hh:mm A');
        let selectedEndDateTime = Moment(Moment.unix(bookingSlot.ToDateTime).utc().format('MM/DD/YYYY hh:mm A'), 'MM/DD/YYYY hh:mm A');

        // check if selected booking datetime is within blocked dates
        const blockedDates = this.getBlockedDates(item);
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
                    const isOvernight = item.Scheduler.Overnight;
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
                        selectedDates.map(date => {
                            const day = Moment(date, 'MM/DD/YYYY').format('dddd');
                            const openingSched = isOvernight ? openingSchedule[0] : openingSchedule.find(op => op.day == day);
                            if (openingSched) {
                                const startDateTime = Moment(date + ' ' + openingSched.startTime, 'MM/DD/YYYY hh:mm A');
                                const endDateTime = Moment(date + ' ' + openingSched.endTime, 'MM/DD/YYYY hh:mm A');
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
                toastr.error('Booking time is unavailable. Please pick a new time slot.', 'Oops! Something went wrong.');
                return callback(false);
            }
        }

        const restDays = this.getRestDays(item);
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
                toastr.error('Booking time is unavailable. Please pick a new time slot.', 'Oops! Something went wrong.');
                return callback(false);
            }
        }
        return callback(true);
    }

	render() {
        return (
            <React.Fragment>
                {
                    this.isDisabled() ?
                        <div className="mm-msg">Please only select a single item from a single supplier to continue.</div>
                    : ''
                }
                <div 
                	className={"btn-checkout " + this.isDisabled()}
                	onClick={() => { this.isDisabled() ? null : this.onCheckoutBtnClick() }}
                >
                    <a href={null} className="btn-loader">Pay Now</a>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = CheckoutButtonMain;
