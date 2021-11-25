'use strict';
const BaseComponent = require('../../../../shared/base');
let React = require('react');
let CalendarComponent = require('../add-edit/calendar-view');
let moment = require('moment');


class ScheduleComponent extends BaseComponent {

    constructor(props, context) {
        super(props, context);

        this.defaultStartTime = '00:00 AM';
        this.defaultEndTime = '00:00 AM';
        this.restDayStartTime = '00:00 AM';
        this.restDayEndTime = '00:00 AM';

        this.openingHours = [
            {
                Day: 1,
                IsRestDay: true,
                StartTime: this.restDayStartTime,
                EndTime: this.restDayEndTime,
                Value: 'Sunday',
                SortOrder: 7
            },
            {
                Day: 2,
                IsRestDay: false,
                StartTime: this.defaultStartTime,
                EndTime: this.defaultEndTime,
                Value: 'Monday',
                SortOrder: 1
            },
            {
                Day: 3,
                IsRestDay: false,
                StartTime: this.defaultStartTime,
                EndTime: this.defaultEndTime,
                Value: 'Tuesday',
                SortOrder: 2
            },
            {
                Day: 4,
                IsRestDay: false,
                StartTime: this.defaultStartTime,
                EndTime: this.defaultEndTime,
                Value: 'Wednesday',
                SortOrder: 3,
            },
            {
                Day: 5,
                IsRestDay: false,
                StartTime: this.defaultStartTime,
                EndTime: this.defaultEndTime,
                Value: 'Thursday',
                SortOrder: 4,
            },
            {
                Day: 6,
                IsRestDay: false,
                StartTime: this.defaultStartTime,
                EndTime: this.defaultEndTime,
                Value: 'Friday',
                SortOrder: 5,
            },
            {
                Day: 7,
                IsRestDay: true,
                StartTime: this.restDayStartTime,
                EndTime: this.restDayEndTime,
                Value: 'Saturday',
                SortOrder: 6,
            }
        ];

        this.nightOpeningHours = [{
            Day: 2,
            IsRestDay: false,
            StartTime: this.restDayStartTime,
            EndTime: this.restDayEndTime,
            Value: 'Monday',
            SortOrder: 1
        }];

        if (this.props.itemModel.isOverNight === true && this.props.itemModel.scheduler
            && this.props.itemModel.scheduler.OpeningHours && this.props.itemModel.scheduler.OpeningHours[0]) {

            //this.nightOpeningHours[0].StartTime = moment(this.props.itemModel.scheduler.OpeningHours[0].StartTime, 'HH:mm').format('hh:mm a');
            //this.nightOpeningHours[0].EndTime = moment(this.props.itemModel.scheduler.OpeningHours[0].EndTime, 'HH:mm').format('hh:mm a');

            this.nightOpeningHours[0].StartTime = this.props.itemModel.scheduler.OpeningHours[0].StartTime;
            this.nightOpeningHours[0].EndTime = this.props.itemModel.scheduler.OpeningHours[0].EndTime;

        } else if (this.props.itemModel.isOverNight === false && this.props.itemModel.scheduler
            && this.props.itemModel.scheduler.OpeningHours && this.props.itemModel.scheduler.OpeningHours.length !== 0) {
            this.openingHours = this.props.itemModel.scheduler.OpeningHours;
            if (this.openingHours) {
                this.openingHours.map(function (oh) {
                    if (oh.Day === 1) {
                        oh.Value = "Sunday";
                        oh.SortOrder = 7;
                    }
                    if (oh.Day === 2) {
                        oh.Value = "Monday";
                        oh.SortOrder = 1;
                    }
                    if (oh.Day === 3) {
                        oh.Value = "Tuesday";
                        oh.SortOrder = 2;
                    }
                    if (oh.Day === 4) {
                        oh.Value = "WednesDay";
                        oh.SortOrder = 3;
                    }
                    if (oh.Day === 5) {
                        oh.Value = "Thursday";
                        oh.SortOrder = 4;
                    }
                    if (oh.Day === 6) {
                        oh.Value = "Friday";
                        oh.SortOrder = 5;
                    }
                    if (oh.Day === 7) {
                        oh.Value = "Saturday";
                        oh.SortOrder = 6;
                    }
                });
            }
        }

        this.state = {
            events: []
        }
        this.handleOpeningHoursChange = this.handleOpeningHoursChange.bind(this);
        this.allDayToggleChanged = this.allDayToggleChanged.bind(this);
        this.calendarRef = React.createRef();
    }

    componentDidMount() {
        this.initializeScheduler();
        this.initializeTimepicker();

        jQuery('#operate-24-chk').click(function () {
            if (jQuery(this).is(':checked')) {
                jQuery('.itmuplodpg-oprt-hrssec').hide();
            } else {
                jQuery('.itmuplodpg-oprt-hrssec').show();
            }
        });
    }

    componentDidUpdate() {
        this.initializeScheduler();
        this.initializeTimepicker();
    }

    getBookingUnit() {
        return null;
    }

    initializeScheduler() {
        const self = this;
        const { scheduler } = this.props.itemModel;

        if (!scheduler.OpeningHours && this.props.itemModel.isOverNight == true) {
            scheduler.OpeningHours = this.nightOpeningHours.map((openingHour) => {
                return self.createOpeningHour(openingHour);
            });
        } else {
            if (!scheduler.OpeningHours || scheduler.OpeningHours.length === 0) {
                scheduler.OpeningHours = this.openingHours.map((openingHour) => {
                    return self.createOpeningHour(openingHour);
                });
            }

        }
    }

    initializeTimepicker() {
        let self = this;
        $('.itmuplodpg-oprthrs-timepicker, .itmuplodpg-bksrvcs-timepicker').timepicker({
            'step': 15,
            'timeFormat': 'h:i A',
            'disableTimeRanges': [],
            'className': 'timepicker-hourly'
        });

        $('.itmuplodpg-oprthrs-timepicker, .itmuplodpg-bksrvcs-timepicker').off('change');
        $('.itmuplodpg-oprthrs-timepicker, .itmuplodpg-bksrvcs-timepicker').on('change', (event) => {
            const { value } = event.target;
            const day = $(event.target).data('opening-hour-day');
            const key = $(event.target).data('opening-hour-key');

            self.handleOpeningHoursChange(day, key, moment(value, 'hh:mm A').format('HH:mm:ss'));

           // this.handleOpeningHoursChange(day, key, moment(value, 'hh:mm A').format('HH:mm:ss'));
        });
    }

    handleOpeningHoursChange(day, key, value) {
        const { scheduler } = this.props.itemModel;

        if (scheduler.OpeningHours && scheduler.OpeningHours.length !== 0) {
            let openingHour = scheduler.OpeningHours.find(h => h.Day == day);

            if (openingHour) {
                if (key == 'IsRestDay') {
                    // openingHour.StartTime = "00:00" ? this.restDayStartTime : this.defaultStartTime;
                    // openingHour.EndTime = value ? this.restDayEndTime : this.defaultEndTime;
                }

                openingHour[key] = value;
            }
        } else {
            if (this.props.itemModel.isOverNight === true) {

                scheduler.OpeningHours.push({
                    Day: 2,
                    IsRestDay: false,
                    StartTime: this.restDayStartTime,
                    EndTime: this.restDayEndTime,
                    Value: 'Monday',
                    SortOrder: 1
                });

                let openingHour = scheduler.OpeningHours.find(h => h.Day == day);

                if (openingHour) {
                    if (key == 'IsRestDay') {
                        // openingHour.StartTime = "00:00" ? this.restDayStartTime : this.defaultStartTime;
                        // openingHour.EndTime = value ? this.restDayEndTime : this.defaultEndTime;
                    }

                    openingHour[key] = value;
                }
            }
        }

        this.props.handleItemChange(scheduler);
        if (this.props.itemModel.isOverNight === false) {
            //Handle Calendar for non Overnight only.
            this.calendarRef.current.getBlockDates(false);
        }

    }

    createOpeningHour(options) {
        let obj = {};
        const defaults = {
            Day: null,
            IsRestDay: null,
            StartTime: null,
            EndTime: null
        };

        Object.keys(defaults).map((key) => {
            obj[key] = options[key];
        });

        return obj;
    }

    renderOpeningHours() {
        if (this.props.itemModel && this.props.itemModel.isOverNight === false) {

            let display = "none";
            if (this.props.itemModel.isAllDay === false) {
                display = "block";
            }
            return (
                <div className="itmuplodpg-oprt-hrssec" style={{ display: display }}>
                    <label>Operating Hours</label>
                    <p>Check the days and specify the times you will be available.</p>
                    <div className="itmuplodpg-oprt-list operating-hours">
                        {
                            this.openingHours.sort((a, b) => (a.SortOrder - b.SortOrder)).map((defaultOpeningHour,i) => {
                                const openingHour = this.props.itemModel.scheduler.OpeningHours ? this.props.itemModel.scheduler.OpeningHours.find(h => h.Day == defaultOpeningHour.Day) : null;

                                if (openingHour) {
                                    return (
                                        <div key={i} className="itmuplodpg-oprthrs-ind">
                                            <div className="itmuplodpg-oprthrs-col1">
                                                <div className="fancy-checkbox">
                                                    <input type="checkbox"
                                                        id={`chk_oprthrs_day_${openingHour.Day}`}
                                                        checked={!openingHour.IsRestDay}
                                                        onChange={(e) => this.handleOpeningHoursChange(openingHour.Day, 'IsRestDay', !e.target.checked)} />
                                                    <label htmlFor={`chk_oprthrs_day_${openingHour.Day}`}>{defaultOpeningHour.Value}</label>
                                                </div>
                                            </div>
                                            <div className="itmuplodpg-oprthrs-col2">
                                                <input type="text"
                                                    className="itmuplodpg-oprthrs-day1con1 startTime itmuplodpg-oprthrs-timepicker"
                                                    disabled={openingHour.IsRestDay}
                                                    value={moment(openingHour.StartTime, 'HH:mm').format('hh:mm A')}
                                                    data-opening-hour-day={openingHour.Day}
                                                    data-opening-hour-key={'StartTime'}
                                                    onChange={(e) => this.handleOpeningHoursChange(openingHour.Day, 'StartTime', !e.target.value)} />
                                            </div>
                                            <div className="itmuplodpg-oprthrs-col3">-</div>
                                            <div className="itmuplodpg-oprthrs-col4">
                                                <input type="text"
                                                    className="itmuplodpg-oprthrs-day1con2 endTime itmuplodpg-oprthrs-timepicker"
                                                    disabled={openingHour.IsRestDay}
                                                    value={moment(openingHour.EndTime, 'HH:mm').format('hh:mm A')}
                                                    data-opening-hour-day={openingHour.Day}
                                                    data-opening-hour-key={'EndTime'}
                                                    onChange={(e) => this.handleOpeningHoursChange(openingHour.Day, 'EndTime', !e.target.value)} />
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })
                        }
                    </div>
                </div>
            );
        }

        return null;
    }

    renderNightOpeningHours() {
        if (this.props.itemModel && this.props.itemModel.isOverNight === true) {

            return (
                <div className="itmuplodpg-booksrvcs-sec" style={{ display: "block" }}>
                    <h5>Check-in / Check-out Timing</h5>
                    <p>Enter the time your customers will be able to check-in and check-out.</p>
                    {
                        this.nightOpeningHours && this.nightOpeningHours.sort((a, b) => (a.SortOrder - b.SortOrder)).map((defaultOpeningHour,i) => {
                            let openingHour = this.props.itemModel.scheduler.OpeningHours ? this.props.itemModel.scheduler.OpeningHours.find(h => h.Day == defaultOpeningHour.Day) : null;
                            if (this.props.itemModel.scheduler.OpeningHours && this.props.itemModel.scheduler.OpeningHours.length === 0) {
                                //started item was not Overnight
                                openingHour = defaultOpeningHour;
                            }
                            if (openingHour) {
                                return (
                                    <div key={i} className="itmuplodpg-bksrvcs-chkdatesec">
                                        <div className="itmuplodpg-bksrvcs-chkdateind">
                                            <label>Check-in time</label>
                                            <div>
                                                <input type="text"
                                                    className="itmuplodpg-bksrvcs-timepicker itmuplodpg-bksrvcs-chkdate ui-timepicker-input"
                                                    id="upload_sched_chin"
                                                    value={moment(openingHour.StartTime, 'HH:mm').format('hh:mm A')}
                                                    data-opening-hour-day={openingHour.Day}
                                                    data-opening-hour-key={'StartTime'}/>
                                            </div>
                                        </div>
                                        <div className="itmuplodpg-bksrvcs-chkdateind">
                                            <label>Check-out time</label>
                                            <div>
                                                <input type="text"
                                                    className="itmuplodpg-bksrvcs-timepicker itmuplodpg-bksrvcs-chkdate ui-timepicker-input"
                                                    id="upload_sched_chout"
                                                    value={moment(openingHour.EndTime, 'HH:mm').format('hh:mm A')}
                                                    data-opening-hour-day={openingHour.Day}
                                                    data-opening-hour-key={'EndTime'} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            );
        }

        return null;
    }

    renderAllDayToggle() {
        if (this.props.itemModel.isOverNight === false) {
            return (
                <div className="operate-24-sec mb-20" >
                    <h4>Do you operate 24/7?</h4>
                    <div className="onoffswitch" id="247_toggle">
                        <input type="checkbox"
                            className="onoffswitch-checkbox"
                            id="operate-24-chk"
                            name="onoffswitch"
                            checked={this.props.itemModel.isAllDay}
                            data-scheduler-key={'AllDay'}
                            onChange={(e) => this.allDayToggleChanged(e)} />
                        <label className="onoffswitch-label" htmlFor="operate-24-chk"> <span className="onoffswitch-inner" /> <span className="onoffswitch-switch" /> </label>
                    </div>
                </div>
            );
        } else {
            return "";
        }

    }
    allDayToggleChanged(e) {
        this.props.onToggleChange(e.target.checked, "is24");
       this.calendarRef.current.getBlockDates(e.target.checked);
    }
    render() {
        return (
            <React.Fragment>
                <div className="tab-container tabcontent" id="schedule_tab" data-position="3172">
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Schedule</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs">
                        <div className="seller-common-box itmuplodpg-schedule-sec">
                            <div>
                                {this.renderAllDayToggle()}
                                {this.renderOpeningHours()}
                                {this.renderNightOpeningHours()}
                                <div className="flex-itmuplodpg">
                                    <CalendarComponent itemModel={this.props.itemModel}
                                        deleteBlockDate={this.props.deleteBlockDate}
                                        addBlockDate={this.props.addBlockDate}
                                        bookings={this.props.bookings}
                                        ref={this.calendarRef}/>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </React.Fragment>
            )
    }
}

module.exports = ScheduleComponent;