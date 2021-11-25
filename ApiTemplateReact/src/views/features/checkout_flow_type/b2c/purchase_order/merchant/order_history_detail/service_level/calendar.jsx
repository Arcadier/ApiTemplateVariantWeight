const React = require('react');
const Moment = require('moment');

const BaseComponent = require('../../../../../../../shared/base');
const CommonModule = require('../../../../../../../../public/js/common');

class CalendarView extends BaseComponent {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.initCalendar()
	}
    isAllDay() {
        const itemDetail = this.props.itemModel;
        if (itemDetail) {
            const { Scheduler, DurationUnit } = itemDetail;
            if (Scheduler) {
                return !Scheduler.Overnight && (DurationUnit
                    && !DurationUnit.toLowerCase().includes('minute')
                    && !DurationUnit.toLowerCase().includes('hour'));
            }
        }
        return false;
    }
    eventLinksPress() {
        $("#itm_dtls_calendar_start .fc-toolbar .fc-toolbar-chunk.dmy-type")
            .before($("#itm_dtls_calendar_start .fc-toolbar .fc-toolbar-chunk.month-Day-Title"));
    }
    disableMonthTab() {
        if ($("#itm_dtls_calendar_start .fc-dayGridMonth-button").hasClass("fc-button-active")) {
            //$('#itm_dtls_calendar_start .fc-dayGridMonth-button').prop('disabled', true);
        } else {
            $('#itm_dtls_calendar_start #itm_dtls_calendar_start .fc-dayGridMonth-button').prop('disabled', false);
        }
    }

    eventBGEvents() {
        $('.event-bg-color').each(function () {
            var $this = $(this);
            var ex = $this.find(".event-booked").length;
            if ($this.hasClass("event-dis-bg-color")) {
                $this.find("div.fc-daygrid-event-harness-abs").attr("style", "position: relative");
                $this.find(".event-links").attr("style", "display: none");

                $this.find(".event-act").each(function () {
                    var $thisBg = $(this);
                    if ($thisBg.text().indexOf('Booked') > 0) {
                        $thisBg.addClass("event-booked");
                        $thisBg.text("Booked");
                    }
                });

                $this.find(".event-dis").each(function () {
                    var $thisBg = $(this);

                    if ($thisBg.text().indexOf('Unavailable') > 0) {
                        $thisBg.text("Unavailable");
                        $thisBg.addClass("event-unavailable-remove");
                    }
                });

            }
            if ($this.find(".event-booked").length > 1) {
                $this.find(".event-booked").not(':first').hide();
            }

            if ($this.find(".event-unavailable-remove").length > 1) {
                $this.find(".event-unavailable-remove").not(':first').hide();
            }

            $this.find(".event-booked").text("+" + $this.find(".event-booked").length + " Booked");
        });
        $('.fc-timegrid-col').each(function () {
            var $this = $(this);
            $this.find(".event-act").each(function () {
                var $thisBg = $(this);
                if ($thisBg.text().indexOf('Unavailable') >= 0) {
                    $thisBg.addClass("event-duo-unavailable");
                }
            });
        });

        $('.fc-daygrid-day').each(function () {
            var $this = $(this);

            setTimeout(function () {

                $this.find('.fc-event-title').each(function () {
                    var $thisBg = $(this);
                    if ($thisBg.text().indexOf('Booked') >= 0) {
                        if ($this.hasClass("event-bg-color") || $this.hasClass("event-dis-bg-color")) {

                        } else {
                            $thisBg.parents(".fc-daygrid-day").addClass("event-book-full");
                        }

                    }

                });
                //if class event-links is displayed
                $this.find('.fc-daygrid-day-bottom').each(function () {
                    var $thisBg = $(this);
                    const moreLinks = $thisBg.find("a.fc-daygrid-more-link.event-links");
                    if (moreLinks && moreLinks.length > 0) {
                        moreLinks.each(function () {
                            const $thisLink = $(this);
                            if ($thisLink.css('display') !== 'none') {
                                $this.addClass('event-book-full');
                            }
                        })
                    }

                });
            });
        }, 600);

    }

    setBackgroundColorEventRender() {
        let self = this;
        $('.fc-scrollgrid-sync-table td.fc-daygrid-day').each(function (i, item) {

            const $item = $(item);
            if ($item.find('a').hasClass('event-links')) {
                $item.addClass('event-bg-color');
                $item.find('a').each(function () {
                    let text = $(this).text();
                    if (text.includes('more')) {
                        $(this).text(text.replace('more', ' -Booked'));
                    } else {
                        if (text.includes('Booked')) {
                            // $(this).text(text.replace(text,commonModule.replaceNullOrEmptyValue($("#bookedTrans").val(), 'Booked')));
                            text = text.replace(text, "    Booked");
                        }
                    }
                });
            }

            if ($item.find('a').hasClass('event-dis')) {
                $item.addClass('event-dis-bg-color');

            }

            if ($item.find('a').hasClass('event-unavailable')) {
                $item.addClass('event-unavailable-bg-color');
            }
        });



        $('.fc-scrollgrid.fc-scrollgrid-liquid td.fc-timegrid-col').each(function (i, item) {
            const $item = $(item);
            $item.find('a').find(".fc-event-title:contains('Booked')").parents(".fc-timegrid-event").addClass('event-bg-color');

            if ($item.find('a').hasClass('event-dis')) {
                $item.find('.event-dis').addClass('event-dis-bg-color');
            }

            if ($item.find('a').hasClass('event-unavailable')) {
                $item.find('.event-dis').addClass('event-unavailable-bg-color');
            }
        });

        //Fixed for 9856 9841
        self.eventBGEvents();

    }
    getBlockedDates() {
        const self = this;
        const itemDetail = this.props.itemModel;
        if (itemDetail) {
            const { Scheduler } = itemDetail;
            let blockedDates = [];
            if (Scheduler) {
                if (Scheduler.Unavailables && Scheduler.Unavailables.length > 0) {
                    Scheduler.Unavailables.map(sched => {
                        if (sched && sched.Active) {
                            let fromDateTime = Moment.unix(sched.StartDateTime).utc();
                            let toDateTime = Moment.unix(sched.EndDateTime).utc();

                            let dateArray = [];
                            let currentDate = fromDateTime;
                            const dateFormat = 'MM/DD/YYYY';
                            const format = dateFormat + ' hh:mm A';
                            while (Moment(currentDate, dateFormat).diff(Moment(toDateTime, dateFormat).set({ h: 23, m: 59})) <= 0) {
                                dateArray.push(Moment(currentDate).format(format));
                                currentDate = Moment(currentDate, dateFormat).add(1, 'd');
                            }

                            const blockedDatesRange = dateArray && dateArray.map((blockedDate, index) => {
                                return { 
                                    start: index == 0 ? blockedDate : Moment(blockedDate).format('MM/DD/YYYY') + ' 12:00 AM', 
                                    end: Moment(blockedDate).format('MM/DD/YYYY') + ' ' + (index == dateArray.length - 1 ?  Moment(toDateTime).format('hh:mm A') : '11:59 PM')
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
    
    getBlockedTimeBasedOnAvailability(opening) {
        const militaryTimeFormat = 'HH:mm';
        const startTime = Moment(opening.StartTime, 'HH:mm:ss');
        const endTime = Moment(opening.EndTime, 'HH:mm:ss');
        const openWholeDay = startTime.format(militaryTimeFormat) == '00:00' && endTime.format(militaryTimeFormat) == '00:00';
        if (!openWholeDay) {
            // get blocked times based on opening hour of the day
            const startNum = startTime.hours();
            let endNum = endTime.hours();
            endNum = endNum == 0 ? 24 : endNum;

            const startMinNum = startTime.minutes();
            const endMinNum = endTime.minutes();
            let blockedHoursArr = [];
            if (startNum < endNum) {
                const numKeys = [...Array(25).keys()];
                const blockedHourNumArr = numKeys.filter(x => !(x > startNum && x < endNum));
                //group by sequence/consecutive nums
                blockedHoursArr = blockedHourNumArr.reduce(
                    (result, value, index, collection) => {
                        if (value - collection[index -1] === 1) {
                            const group = result[result.length-1];
                            group.push(value)
                        } else {
                            result.push([value]);
                        }
                        return result;
                    }, []);
            } else {
                const beforeStart = [...Array(startNum+1).keys()];
                const afterEnd = [...Array(endNum+1).keys()];
                blockedHoursArr = [beforeStart, afterEnd];
            }

            //blockedHoursArr is expected to have at most 2 blocked duration
            const blockedTimeRange = blockedHoursArr.map((blockedArr, i) => {
                if (blockedArr.length > 1) {
                    const startHour = blockedArr[0];
                    const endHour = blockedArr[blockedArr.length -1];
                    return { 
                        start : { h: startHour, m: i == 0? 0 : endMinNum },
                        end: { h: endHour, m: i == 1 ?  0  : startMinNum }
                    }
                }
            });
            return blockedTimeRange;
        }
        return [];
    }

    getRestDayEvents() {
        const self = this;
        if (this.props.itemModel) {
            const { Scheduler } = this.props.itemModel;
            let restDays = [];
            if (Scheduler) {
                if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                    if (!Scheduler.Overnight) { 
                        Scheduler.OpeningHours.map(opening => {
                            if (opening.IsRestDay) {
                                restDays.push({
                                    title: "Unavailable",
                                    allDay: true,
                                    textColor :'#ffffff',
                                    classNames:'event-unavailable',
                                    daysOfWeek: [opening.Day - 1],
                                    user: '',
                                });
                            } else {
                                const blockedTimeRange = self.getBlockedTimeBasedOnAvailability(opening);
                                if (blockedTimeRange) {
                                    for (let i = 0; i < blockedTimeRange.length; i+=1) {
                                        if (blockedTimeRange[i]) {
                                            const startStr = Moment().set(blockedTimeRange[i].start).format('HH:mm');
                                            const endStr = blockedTimeRange[i].end.h == 24 ? '23:59' : Moment().set(blockedTimeRange[i].end).format('HH:mm');
                                            restDays.push({
                                                title: "Unavailable",
                                                allDay: false,
                                                textColor :'#ffffff',
                                                classNames:'event-dis',
                                                daysOfWeek: [opening.Day - 1],
                                                user: '',
                                                startTime: startStr,
                                                endTime: endStr
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        const opening = Scheduler.OpeningHours[0];
                        const blockedTimeRange = self.getBlockedTimeBasedOnAvailability(opening);
                        if (blockedTimeRange) {
                            for (let i = 0; i < blockedTimeRange.length; i+=1) {
                                if (blockedTimeRange[i]) {
                                    const startStr = Moment().set(blockedTimeRange[i].start).format('HH:mm');
                                    const endStr = blockedTimeRange[i].end.h == 24 ? '23:59' : Moment().set(blockedTimeRange[i].end).format('HH:mm');

                                     //if overnight should not put unavailables.
                                    //restDays.push({
                                    //    title: "Unavailable",
                                    //    allDay: false,
                                    //    textColor :'#ffffff',
                                    //    classNames:'event-dis',
                                    //    daysOfWeek: [...Array(7).keys()],
                                    //    user: '',
                                    //    startTime: startStr,
                                    //    endTime: endStr
                                    //});
                                }
                            }
                        }
                    }
                }
                return restDays;
            }
        }
        return [];
    }

    getDatesByRange(startDate, stopDate, allDay) {
        //allDay - variables refers to these unit of time: day, week, month

        //check if valid date range. 
        if (startDate >= stopDate) {
            //if not return the start date
            return [{
                start: startDate,
                end: startDate,
                allDay: false
            }];
        }
        else {
            //check if range is within the same day
            if (Moment(startDate).isSame(stopDate, 'day')) {
                //return a single date item
                return [{
                    start: allDay ? Moment(startDate).startOf('day').toDate() : startDate,
                    end: allDay ? Moment(stopDate).endOf('day').toDate() : stopDate,
                    allDay: false
                }];
            }
            else {
                //if not same day,
                //check difference in days
                var start = Moment(startDate).startOf('day');
                var end = Moment(stopDate).startOf('day');
                var numberOfDays = end.diff(start, 'days');

                //Initialize the first date
                var dates = [
                    {
                        start: allDay ? Moment(startDate).startOf('day').toDate() : startDate,
                        end: Moment(startDate).endOf('day').toDate(),
                        allDay: allDay
                    }
                ];

                //If difference in days is more than 1, 
                //loop through the difference to generate a list of whole day events
                if (numberOfDays > 1) {
                    var nextDate = Moment(start.toDate());

                    Array.apply(null, Array(numberOfDays - 1))
                        .map(function (_, i) { return i; })
                        .forEach(function () {
                            nextDate.add(1, 'days');

                            //in between dates are always an all day event
                            dates.push({
                                start: Moment(nextDate.startOf('day').format('MM/DD/YYYY HH:mm')).toDate(),
                                end: Moment(nextDate.endOf('day').format('MM/DD/YYYY HH:mm')).toDate(),
                                allDay: true
                            });
                        });
                }

                //Add the last date:
                dates.push(
                    {
                        start: Moment(stopDate).startOf('day').toDate(),
                        end: allDay ? Moment(stopDate).endOf('day').toDate() : stopDate,
                        allDay: allDay
                    }
                );

                return dates;
            }
        }
    }
    getBlockedDatesEvents() {
        const blockedDates = this.getBlockedDates();
        if (blockedDates) {
            return blockedDates.map(blockedDate => 
            {
                let start = Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A');
                let end = Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A');
                let isAllDay =  start.format('HH:mm') == '00:00' && end.format('HH:mm') == '23:59';
                return {
                    title: 'Unavailable',
                    start: start.toDate(),
                    end: end.toDate(),
                    allDay: isAllDay,
                    textColor :'#DCDCDC',
                    classNames: isAllDay ? 'event-unavailable' : 'event-dis',
                    eventCount:1
                };
            });
        }
        return [];
    }
    getBookingDatesEvents() {
        const self = this;
        const bookings = self.props.bookings;
        const itemDetails = this.props.itemModel;
        if (bookings && bookings.length > 0 && itemDetails) {
            let helper = {};
            let bookingsGroupedbyDateRange = bookings.reduce(function (r, o) {
                const key = o.FromDateTime + '-' + o.ToDateTime;

                if (!helper[key]) {
                    helper[key] = Object.assign({}, o); // create a copy of o
                    if (!helper[key].instances) {
                        helper[key].instances = 0;
                    }
                    r.push(helper[key]);
                }

                helper[key].instances += 1;

                return r;
            }, []);

            const allDay = this.isAllDay();
            const datetimeFormat = 'MM/DD/YYYY HH:mm';

            if (bookingsGroupedbyDateRange.length > 0) {
                let bookingsArr = [];
                const { Scheduler } = itemDetails;
                bookingsGroupedbyDateRange.map(booking => {
                    let fromDateTime;
                    let toDateTime;
                    if (Scheduler.Overnight && Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                        let start = Moment(Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").get('hour') * 60;
                        start += Moment(Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").get('minute');
                        let end = Moment(Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").get('hour') * 60;
                        end += Moment(Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").get('minute');
                        fromDateTime = Moment.unix(booking.FromDateTime).startOf('day').add(start, 'm').toDate();
                        toDateTime = Moment.unix(booking.ToDateTime).startOf('day').add(end, 'm').toDate();
                    } else {
                        let unixFromDate = new Date(booking.FromDateTime).getTime() / 1000;
                        let unixToDate = new Date(booking.ToDateTime).getTime() / 1000;
                        fromDateTime = new Date(Moment.unix(unixFromDate).utc().format(datetimeFormat));
                        toDateTime = new Date(Moment.unix(unixToDate).utc().format(datetimeFormat));
                    }

                    const arr = self.getDatesByRange(fromDateTime, toDateTime, allDay);
                    arr.map(el => {
                        if (!Scheduler.Overnight && Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                            let openingHour = Scheduler.OpeningHours[el.start.getDay()];
                            if (openingHour) {
                                if (openingHour.IsRestDay) return;
                                if (allDay) {
                                    let startInMin = Moment(openingHour.StartTime, "HH:mm:ss").get('hour') * 60;
                                    startInMin += Moment(openingHour.StartTime, "HH:mm:ss").get('minute');
                                    let endInMin = Moment(openingHour.EndTime, "HH:mm:ss").get('hour') * 60;
                                    endInMin += Moment(openingHour.EndTime, "HH:mm:ss").get('minute');
                                    el.start = Moment(el.start).startOf('day').add(startInMin, 'm')
                                    el.end = Moment(el.end).startOf('day').add(endInMin, 'm')

                                }
                            }
                        }
                        bookingsArr.push({
                            start: Moment(el.start).toDate(),
                            end: Moment(el.end).toDate(),
                            allDay: allDay,
                            instances: booking.instances
                        });
                    })
                });
                const test = bookingsArr.map(booking => {

                    return {
                        title: `${booking.instances}-Booked`,
                        start: booking.start,
                        end: booking.end,
                        allDay: booking.allDay,
                        textColor: '#00c8b2',
                        user: '',
                        classNames: 'event-act',
                        eventCount: booking.instances
                    }
                })
                return test
            }
            return [];
        }
        return [];
    }
    initCalendar() {
        const self = this;
        const calendarDesktop = document.getElementById('itm_dtls_calendar_start');
        const calendarMobile = document.getElementById('mobicalender');
        const currentScreenSize = $('body').width() >= 768 ? calendarDesktop : calendarMobile;
        const events = [
            ...this.getBlockedDatesEvents(),
            ...this.getRestDayEvents(),
            ...this.getBookingDatesEvents()
        ];
        const calendar = new FullCalendar.Calendar(currentScreenSize, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next',
                center: 'dayGridMonth,timeGridWeek,timeGridDay',
                right: 'title'
            },
            editable: false,
            droppable: false,
            events: events,
            dayMaxEventRows: 1,
            moreLinkClassNames: 'event-links',
            moreLinkClick: 'week',
            eventClick: function (calEvent, jsEvent, view) { },
            eventDrop: function (event, jsEvent, ui, view) { },
            eventReceive: function (event) { },

        });
        calendar.render();

        $("#itm_dtls_calendar_start .fc-toolbar .fc-toolbar-chunk:nth-child(2)").addClass("dmy-type");
        $("#itm_dtls_calendar_start .fc-toolbar .fc-toolbar-chunk:nth-child(3)").addClass("month-Day-Title");

        $('#itm_dtls_calendar_start .fc-dayGridMonth-button, .fc-timeGridWeek-button').click(function () {
            self.disableMonthTab();
        });

        $('#itm_dtls_calendar_start .fc-dayGridMonth-button,.fc-prev-button,.fc-next-button').click(function () {
            self.setBackgroundColorEventRender();
            self.eventLinksPress();
        });

        $('#itm_dtls_calendar_start .fc-timeGridWeek-button,.fc-timeGridDay-button, .fc-daygrid-more-link').click(function () {
            self.eventLinksPress();
            self.setBackgroundColorEventRender();
        });

        this.eventLinksPress();
        this.setBackgroundColorEventRender();

        // Select the node that will be observed for mutations
        const targetNode = document.documentElement || document.body;

        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        const callback = function (mutationsList, observer) {
            // Use traditional 'for loops' for IE 11
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                } else if (mutation.type === 'attributes') {
                    if ($('body').hasClass('fc-unselectable')) {

                        setTimeout(function () {
                            self.eventLinksPress();
                            self.setBackgroundColorEventRender();

                        }, 300);
                    }
                }
            }
        }

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }

   
	render() {
		return (
			<div className="itm-dtls-calendararea">
				<div id="itm_dtls_calendar_start" className="fc fc-media-screen fc-direction-ltr fc-theme-standard" />
				<div id="mobicalendar" />
			</div>
		)
	}

}


module.exports = CalendarView;