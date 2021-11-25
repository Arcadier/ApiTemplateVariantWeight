var events = [];
var calendar;

let React = require('react');
const BaseComponent = require('../../../../shared/base');
let CommonModule = require('../../../../../public/js/common');
let moment = require('moment');
let toastr = require('toastr');

class CalendarView extends BaseComponent {
    constructor(props, context) {
        super(props, context);
        this.deleteBlockDate = this.deleteBlockDate.bind(this);
        this.getBlockDates = this.getBlockDates.bind(this);
        this.addBlockDate = this.addBlockDate.bind(this);
    }

    getBookingType() {
        const { DurationUnit, BookingUnit, PriceUnit } = this.props.itemModel;
        if (!DurationUnit && !BookingUnit && !PriceUnit) return null;

        if (!DurationUnit || PriceUnit == DurationUnit) {
            return 'Book by duration';
        }
        if (BookingUnit && PriceUnit == BookingUnit) {
            return 'Book by unit';
        }

        return 'Book by duration and unit';
    }

    isAllDay() {
        if (this.props.itemModel) {
            const { Scheduler, DurationUnit } = this.props.itemModel;
            if (Scheduler) {
                return !Scheduler.Overnight && (DurationUnit
                    && !DurationUnit.toLowerCase().includes('minute')
                    && !DurationUnit.toLowerCase().includes('hour'));
            }
        }
        return false;
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
            if (moment(startDate).isSame(stopDate, 'day')) {
                //return a single date item
                return [{
                    start: allDay ? moment(startDate).startOf('day').toDate() : startDate,
                    end: allDay ? moment(stopDate).endOf('day').toDate() : stopDate,
                    allDay: false
                }];
            }
            else {
                //if not same day,
                //check difference in days
                var start = moment(startDate).startOf('day');
                var end = moment(stopDate).startOf('day');
                var numberOfDays = end.diff(start, 'days');

                //Initialize the first date
                var dates = [
                    {
                        start: allDay ? moment(startDate).startOf('day').toDate() : startDate,
                        end: moment(startDate).endOf('day').toDate(),
                        allDay: allDay
                    }
                ];

                //If difference in days is more than 1, 
                //loop through the difference to generate a list of whole day events
                if (numberOfDays > 1) {
                    var nextDate = moment(start.toDate());

                    Array.apply(null, Array(numberOfDays - 1))
                        .map(function (_, i) { return i; })
                        .forEach(function () {
                            nextDate.add(1, 'days');

                            //in between dates are always an all day event
                            dates.push({
                                start: moment(nextDate.startOf('day').format('MM/DD/YYYY HH:mm')).toDate(),
                                end: moment(nextDate.endOf('day').format('MM/DD/YYYY HH:mm')).toDate(),
                                allDay: true
                            });
                        });
                }

                //Add the last date:
                dates.push(
                    {
                        start: moment(stopDate).startOf('day').toDate(),
                        end: allDay ? moment(stopDate).endOf('day').toDate() : stopDate,
                        allDay: allDay
                    }
                );

                return dates;
            }
        }
    }

    getBookingDatesEvents() {
        const self = this;
        if (this.props.bookings && this.props.bookings.length > 0 && this.props.itemModel) {
            let helper = {};
            let bookingsGroupedbyDateRange = this.props.bookings.reduce(function (r, o) {

                let formattedToDateTime = o.ToDateTime;
                //fix calendar when book by unit (day) has ToDateTime's time set to 23:59
                if (self.getBookingType() == 'Book by unit') {
                    if (o.DurationUnit.toLowerCase() == 'day') {
                        const ToDateTime = moment.unix(o.ToDateTime).utc();
                        if (ToDateTime.format('HH:mm') == '23:59') {
                            let dateObj = moment(ToDateTime.format('MM/DD/YYYY') + ' 00:00', 'MM/DD/YYYY HH:mm').toDate();
                            formattedToDateTime = new Date(dateObj.getTime() + (1000 * 60 * (-dateObj.getTimezoneOffset()))).getTime() / 1000;
                        }
                    }
                }

                const key = o.FromDateTime + '-' + formattedToDateTime;

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
                const { scheduler } = self.props.itemModel;
                bookingsGroupedbyDateRange.map(booking => {
                    let fromDateTime;
                    let toDateTime;
                    if (scheduler.Overnight && scheduler.OpeningHours && scheduler.OpeningHours.length > 0) {
                        let start = moment(scheduler.OpeningHours[0].StartTime, "HH:mm:ss").get('hour') * 60;
                        start += moment(scheduler.OpeningHours[0].StartTime, "HH:mm:ss").get('minute');
                        let end = moment(scheduler.OpeningHours[0].EndTime, "HH:mm:ss").get('hour') * 60;
                        end += moment(scheduler.OpeningHours[0].EndTime, "HH:mm:ss").get('minute');
                        fromDateTime = moment.unix(booking.FromDateTime).startOf('day').add(start, 'm').toDate();
                        toDateTime = moment.unix(booking.ToDateTime).startOf('day').add(end, 'm').toDate();
                    } else {
                        fromDateTime = new Date(moment.unix(booking.FromDateTime).utc().format(datetimeFormat));
                        toDateTime = new Date(moment.unix(booking.ToDateTime).utc().format(datetimeFormat));
                    }

                    const arr = self.getDatesByRange(fromDateTime, toDateTime, allDay);
                    arr.map(el => {
                        if (!scheduler.Overnight && scheduler.OpeningHours && scheduler.OpeningHours.length > 0) {
                            let openingHour = scheduler.OpeningHours[el.start.getDay()];
                            if (openingHour) {
                                if (openingHour.IsRestDay) return;
                                if (allDay) {
                                    let startInMin = moment(openingHour.StartTime, "HH:mm:ss").get('hour') * 60;
                                    startInMin += moment(openingHour.StartTime, "HH:mm:ss").get('minute');
                                    let endInMin = moment(openingHour.EndTime, "HH:mm:ss").get('hour') * 60;
                                    endInMin += moment(openingHour.EndTime, "HH:mm:ss").get('minute');
                                    el.start = moment(el.start).startOf('day').add(startInMin, 'm')
                                    el.end = moment(el.end).startOf('day').add(endInMin, 'm')

                                }
                            }
                        }
                        bookingsArr.push({
                            start: moment(el.start).toDate(),
                            end: moment(el.end).toDate(),
                            allDay: allDay,
                            instances: booking.instances
                        });
                    })
                });
                const results = bookingsArr.map(booking => {
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
                return results
            }
            return [];
        }
        return [];
    }

    getBlockDates(is24) {
        var self = this;
        events = [];
        if (this.props.itemModel.scheduler && this.props.itemModel.scheduler.Unavailables) {
            let unavailableActive = this.props.itemModel.scheduler.Unavailables.filter(u => u.Active === true);
            if (unavailableActive && unavailableActive.length !== 0) {

                unavailableActive.map(function (blockDate) {

                   // let fromDateTime = moment.unix(blockDate.StartDateTime).utc().format('DD/MM/YYYY hh:mm A');
                   // let ToDateTime = moment.unix(blockDate.EndDateTime).utc().format('DD/MM/YYYY hh:mm A');

                    let fromDateTimeCheck = moment.unix(blockDate.StartDateTime).utc().format('MM/DD/YYYY hh:mm A')
                    let ToDateTimeCheck = moment.unix(blockDate.EndDateTime).utc().format('MM/DD/YYYY hh:mm A')

                    if (moment(fromDateTimeCheck).format('LL') === moment(ToDateTimeCheck).format('LL')) {
                        let className = "event-dis";
                        let isAllDay = false;

                        //if (fromDateTimeCheck.includes("AM") && new Date(fromDateTimeCheck).getHours() === 0 && new Date(fromDateTimeCheck).getMinutes() === 0) {
                        //    if (ToDateTimeCheck.includes("PM") && new Date(ToDateTimeCheck).getHours() === 23 && new Date(ToDateTimeCheck).getMinutes() === 59) {
                        //        className = "event-unavailable";
                        //        isAllDay = true;
                        //    }
                        //}

                        //Fixed ARC9727
                        if ((new Date(fromDateTimeCheck).getHours() === 0 && new Date(fromDateTimeCheck).getMinutes() === 0)
                            && (new Date(ToDateTimeCheck).getHours() === 23 && new Date(ToDateTimeCheck).getMinutes() === 59)) {
                            className = "event-unavailable";
                            isAllDay = true;
                        }


                        events.push({
                           // id: blockDate.CalendarId,
                            title: 'Unavailable',
                            start: new Date(fromDateTimeCheck),
                            end: new Date(ToDateTimeCheck),
                            textColor: '#ffffff',
                            classNames: className,
                            allDay: isAllDay
                        });

                    } else {
                        var getAllDates = [];

                        let endDateManipulate = moment(ToDateTimeCheck).set({ h: 23, m: 59 });

                        getAllDates = self.getDates(fromDateTimeCheck, endDateManipulate);
                        jQuery.each(getAllDates, function (i, date) {

                            let startDate = date;
                            let endDate = moment(date).set({ h: 23, m: 59 });

                            if (i !== 0) {
                                startDate = moment(date).set({ h: 0, m: 0 });
                                startDate = startDate._d;

                            } 

                            if (i + 1 === getAllDates.length) {

                                var endHour = new Date(ToDateTimeCheck).getHours();
                                var endMinutes = new Date(ToDateTimeCheck).getMinutes();

                                if (endHour === 0 && endMinutes === 0) {
                                    endHour = 23;
                                    endMinutes = 59;
                                }

                                endDate = moment(date).set({ h: endHour, m: endMinutes });

                            } 
                            let className = "event-unavailable";
                            let isAllDay = true;

                            if (i === 0) {
                                className = "event-dis"
                                isAllDay = false;

                                var startHour = new Date(fromDateTimeCheck).getHours();
                                var endMinutes = new Date(fromDateTimeCheck).getMinutes();

                                if (startHour === 0 && endMinutes === 0) {
                                    className = "event-unavailable";
                                    isAllDay = true;
                                }
                            }
                            if (i === getAllDates.length - 1) {
                                className = "event-dis";
                                isAllDay = false;

                                var endHour = new Date(ToDateTimeCheck).getHours();
                                var endMinutes = new Date(ToDateTimeCheck).getMinutes();
                                if (endHour === 23 && endMinutes === 59 && ToDateTimeCheck.includes("PM")) {
                                    className = "event-unavailable";
                                    isAllDay = true;
                                }
                            }
                            events.push({
                              //  id: blockDate.CalendarId,
                                title: 'Unavailable',
                                start: startDate,
                                end: endDate._d,
                                textColor: '#ffffff',
                                classNames: className,
                                allDay: isAllDay
                            });
                        });
                    }            
                });
            }
        }
        let isAllDay = is24 !== undefined ? is24 : this.props.itemModel.isAllDay;
        if (isAllDay === false) {
            this.props.itemModel.scheduler.OpeningHours.forEach(function (weekDay) {
                if (weekDay.IsRestDay) {
                    var firstEvent = {
                        title: "Unavailable",
                        daysOfWeek: [(weekDay.Day - 1)]
                    };

                    firstEvent.className = 'event-unavailable';
                    firstEvent.allDay = true;
                    events.push(firstEvent);
                }

                //means trigger from parent
                if (is24 !== undefined) {
                    calendar.destroy();
                    self.init_calendar();
                    self.disableButtonActive();
                }
                //self.convertWeekDayToBlock(weekDay)
                //    .forEach(function(weekDayEvent) {
                //        events.push(weekDayEvent);
                //    });
            });
        } else {

            if (calendar) {
                calendar.destroy();
                self.init_calendar();
                self.disableButtonActive();
            }

        } 
        return events;
    }

    getDates(startDate, stopDate) {
        let dateArray = new Array();
        let currentDate = startDate;
        //while (new Date(currentDate) < new Date(stopDate)) {
        //    dateArray.push(new Date(currentDate));
        //    currentDate = new Date(currentDate);
        //    currentDate = currentDate.setDate(currentDate.getDate() + 1);
        //}

        while (new Date(currentDate).getTime() <= new Date(stopDate).getTime()) {
            dateArray.push(new Date(currentDate));
            currentDate = new Date(currentDate);
            currentDate = currentDate.setDate(currentDate.getDate() + 1);
        }

        return dateArray;
    }

    getBlockedTimeBasedOnAvailability(opening) {
        const militaryTimeFormat = 'HH:mm';
        const startTime = moment(opening.StartTime, 'HH:mm:ss');
        const endTime = moment(opening.EndTime, 'HH:mm:ss');
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
                        if (value - collection[index - 1] === 1) {
                            const group = result[result.length - 1];
                            group.push(value)
                        } else {
                            result.push([value]);
                        }
                        return result;
                    }, []);
            } else {
                //ex: check in 14:00 checkout 5:00 AM 
                const beforeStart = [...Array(startNum + 1).keys()];
                const afterEnd = [...Array(endNum + 1).keys()];
                blockedHoursArr = [beforeStart, afterEnd];
            }

            //blockedHoursArr is expected to have at most 2 blocked duration
            const blockedTimeRange = blockedHoursArr.map((blockedArr, i) => {
                if (blockedArr.length > 1) {
                    const startHour = blockedArr[0];
                    const endHour = blockedArr[blockedArr.length - 1];
                    return {
                        start: { h: startHour, m: i == 0 ? 0 : endMinNum },
                        end: { h: endHour, m: i == 1 ? 0 : startMinNum }
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
            const { scheduler } = this.props.itemModel;
            let restDays = [];
            if (scheduler) {
                if (scheduler.OpeningHours && scheduler.OpeningHours.length > 0) {
                    if (!scheduler.Overnight && !this.props.itemModel.isOverNight) {
                        scheduler.OpeningHours.map(opening => {
                            if (opening.IsRestDay) {
                                //Done on other event
                            } else {
                                const blockedTimeRange = self.getBlockedTimeBasedOnAvailability(opening);
                                if (blockedTimeRange) {
                                    for (let i = 0; i < blockedTimeRange.length; i += 1) {
                                        if (blockedTimeRange[i]) {
                                            const startStr = moment().set(blockedTimeRange[i].start).format('HH:mm');
                                            const endStr = blockedTimeRange[i].end.h == 24 ? '23:59' : moment().set(blockedTimeRange[i].end).format('HH:mm');
                                            restDays.push({
                                                title: "Unavailable",
                                                allDay: false,
                                                textColor: '#ffffff',
                                                classNames: 'event-dis',
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
                        const opening = scheduler.OpeningHours[0];
                        const blockedTimeRange = self.getBlockedTimeBasedOnAvailability(opening);
                        if (blockedTimeRange) {
                            for (let i = 0; i < blockedTimeRange.length; i += 1) {
                                if (blockedTimeRange[i]) {
                                    const startStr = moment().set(blockedTimeRange[i].start).format('HH:mm');
                                    const endStr = blockedTimeRange[i].end.h == 24 ? '23:59' : moment().set(blockedTimeRange[i].end).format('HH:mm');
                                    //if overnight should not put unavailables.

                                    //restDays.push({
                                    //    title: "Unavailable",
                                    //    allDay: false,
                                    //    textColor: '#ffffff',
                                    //    classNames: 'event-dis',
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

    init_calendar() {
        let self = this;
        let calendarDesktop = document.getElementById('itm_dtls_calendar');
        let calendarmobile = document.getElementById('mobicalender');

        const eventsPass = [
            ...this.getBookingDatesEvents(),
            ...this.getRestDayEvents(),
            ...events           
        ];

        let currentScreenSize;

        if ($("body").width() >= 768) {
            currentScreenSize = calendarDesktop;
        } else {
            currentScreenSize = calendarmobile;
        }
        calendar = new FullCalendar.Calendar(currentScreenSize, {
            initialView: 'dayGridMonth',

            headerToolbar: {

                left: 'prev,next',

                center: 'dayGridMonth,timeGridWeek,timeGridDay',

                right: 'title'

            },
            //locale: commonModule.replaceNullOrEmptyValue($("#SelectLanguage input.dd-selected-value").val(), 'en'),
            //allDayText: self.parseResource("strCommonWords_AllDay", "all-day"),
            //buttonText: {
            //    today: 'today',
            //    month: self.parseResource("strCommonWords_Month", "Month"),
            //    week: self.parseResource("strCommonWords_Week", "Week"),
            //    day: self.parseResource("strCommonWords_Day", "Day"),
            //    list: 'list'
            //},
            //monthNames: calendarTranslation.getMonthNames(),
            //dayNamesShort: calendarTranslation.getDayNamesShort(),
            //dayNames: calendarTranslation.getDayNames(),
            //monthNamesShort: calendarTranslation.getMonthNamesShort(),

            editable: false,

            droppable: false,

            events: eventsPass,

            dayMaxEventRows: 1,
            // moreLinkContent : "- Booked",

            moreLinkClassNames: "event-links",

            moreLinkClick: "week",

            eventClick: function (calEvent, jsEvent, view) { },

            eventDrop: function (event, jsEvent, ui, view) { },

            eventReceive: function (event) { }

        });
        calendar.render();
        //  });

        //  setTimeout(function () {


        $(".fc-toolbar .fc-toolbar-chunk:nth-child(2)").addClass("dmy-type");
        $(".fc-toolbar .fc-toolbar-chunk:nth-child(3)").addClass("month-Day-Title");
      //  $(".fc-toolbar .fc-toolbar-chunk:nth-child(2)").removeClass("month-Day-Title");
      //  $(".fc-toolbar .fc-toolbar-chunk:nth-child(3)").removeClass("dmy-type");

        $('.fc-prev-button,.fc-next-button').click(function () {

            self.disableButtonActive();
            self.set_background_color_eventrender();
            self.eventLinksPress();
            //From Clarence ARc 9541
            $('.fc-daygrid-day.event-bg-color').each(function () {
                var $this = $(this);
                var curFormat = $this.attr("data-date");
                $this.find(".fc-daygrid-day-top a").text(moment(curFormat, "YYYYMMDD", false).format('D'));
            });
        });


        $('.fc-daygrid-more-link').click(function () {

            self.disableButtonActive();
            self.set_background_color_eventrender();
            self.eventLinksPress();

        });

        $('.fc-dayGridMonth-button,.fc-timeGridWeek-button,.fc-timeGridDay-button').click(function (e) {

            // calendar.eventSource.refetch();
            //  calendar.eventSource.remove();
            //  calendar.destroy();
            // init_calendar(e);
            self.disableButtonActive();
            self.set_background_color_eventrender();
            self.eventLinksPress();

        });

        //$('.fc-timeGridWeek-button,.fc-timeGridDay-button, .fc-daygrid-more-link').click(function () {


        //    eventLinksPress();
        //    set_background_color_eventrender();
        //});


        self.eventLinksPress();
        self.set_background_color_eventrender();

        // Select the node that will be observed for mutations
        const targetNode = document.documentElement || document.body;


        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        const callback = function (mutationsList, observer) {
            // Use traditional 'for loops' for IE 11
            if (mutationsList == null) return;
            for (let j = 0; j < mutationsList.length; j++) {
                let mutation = mutationsList[j];
                if (mutation.type === 'childList') {
                }
                else if (mutation.type === 'attributes') {

                    if ($("body").hasClass("fc-unselectable")) {
                        setTimeout(function () {
                            self.eventLinksPress();
                            self.set_background_color_eventrender();
                        }, 300);
                    }
                }
            }
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);

        // }, 600);
    }
    disableButtonActive() {

        $(".fc-button").each(function (i, bt) {
            if ($(bt).hasClass("fc-button-active")) {
                $(bt).prop('disabled', true);
            } else {
                $(bt).removeAttr("disabled");
            }
        })
    }

    eventLinksPress() {
        $(".fc-toolbar .fc-toolbar-chunk.dmy-type").before($(".fc-toolbar .fc-toolbar-chunk.month-Day-Title"));
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

    set_background_color_eventrender() {
        let self = this;
        $('.fc-scrollgrid-sync-table td.fc-daygrid-day').each(function () {

            var $this = $(this);

            if ($this.find('a').hasClass('event-links')) {

                $this.addClass('event-bg-color');

                $this.find('a').each(function () {

                    var text = $(this).text();

                    $(this).text(text.replace('more', ' - Booked'));

                });
            }

            if ($this.find('a').hasClass('event-dis')) {
                $this.addClass('event-dis-bg-color');

            }

            if ($this.find('a').hasClass('event-unavailable')) {
                $this.addClass('event-unavailable-bg-color');

            }

        });

        $('.fc-scrollgrid.fc-scrollgrid-liquid td.fc-timegrid-col').each(function () {

            var $this = $(this);

            $this.find('a').find(".fc-event-title:contains('Booked')").parents(".fc-timegrid-event").addClass('event-bg-color');


            if ($this.find('a').hasClass('event-dis')) {
                $this.find('.event-dis').addClass('event-dis-bg-color');
            }

            if ($this.find('a').hasClass('event-unavailable')) {

                $this.find('.event-dis').addClass('event-unavailable-bg-color');

            }
        });

        //Fixed for 9856 9841
        self.eventBGEvents();
    };

    componentDidMount() {
        $('#block-end-day[type="checkbox"]').click(function () {
            //From update in story 9620 Nov 14,2021
            if ($(this).is(":checked")) {
                jQuery('#st_time').val('12:00 AM').prop('disabled', true);
                jQuery('#end_time').val('11:59 PM').prop('disabled', true);
            } else {
                jQuery('#st_time').val('').prop('disabled', false);
                jQuery('#end_time').val('').prop('disabled', false);
            }
        });
        this.getBlockDates();
        this.init_calendar();

    }
    renderBlockDates() {
        if (this.props.itemModel.scheduler) {
            var self = this;
            if (this.props.itemModel.scheduler.Unavailables) {
                let validUnavailable = this.props.itemModel.scheduler.Unavailables.filter(u => u.Active === true);

                return validUnavailable.map(function (blockDate, index) {
                    var blockDateKey = "blockDate" + index;

                    let fromDateTime = moment.unix(blockDate.StartDateTime).utc().format('DD/MM/YYYY hh:mm A');
                    let ToDateTime = moment.unix(blockDate.EndDateTime).utc().format('DD/MM/YYYY hh:mm A');

                    var blockDateLabel = fromDateTime + " - " + ToDateTime;

                    return (
                        <tr key={blockDateKey}>
                            <td>{blockDateLabel}</td>
                            <td>
                                <a href="#!" onClick={(e) => self.deleteBlockDate(blockDate.ID)}>
                                    <img src="/assets/images/delete_button.svg" />
                                </a>
                            </td>
                        </tr>
                    );
                });
            }
        }
        return "";
    }
    renderBlockDateScheduler() {
        let self = this;
        return (
            <div className="itmuplodpg-schperiod-area">
                <h5>Set a date/time range you which want to make unavailable.</h5>
                <div className="itmuplodpg-schperiod-lstsec">
                    <div className="itmuplodpg-schperiod-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Blocked date</th>
                                    {/*<th>Time</th>*/}
                                    <th>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.renderBlockDates()
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="itmuplodpg-schperiod-entersec">
                        <div className="item-form-group">
                            <div className="col-md-7">
                                <div className="row">
                                    <label>Choose start date</label>
                                    <input type="text" ref="blockStartDate" id="st_date" className="pickerdaterange" name="stdate" placeholder="DD/MM/YYYY" defaultValue data-format="DD/MM/YYY" />
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="row">
                                    <label>&nbsp;</label>
                                    <input type="text" ref="blockStartDateTime" id="st_time" className="pickerdaterange" name="sttime" placeholder="HH:MM" defaultValue />
                                </div>
                            </div>
                        </div>
                        <div className="item-form-group">
                            <div className="col-md-7">
                                <div className="row">
                                    <label>Choose end date</label>
                                    <input type="text" ref="blockEndDate" id="end_date" className="pickerdaterange" name="enddate" placeholder="DD/MM/YYYY" defaultValue data-format="DD/MM/YYY" />
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="row">
                                    <label>&nbsp;</label>
                                    <input type="text" ref="blockEndDateTime" id="end_time" className="pickerdaterange" name="endtime" placeholder="HH:MM" defaultValue />
                                </div>
                            </div>
                        </div>
                        <div className="item-form-group-">
                            <div className="col-md-12">
                                <div className="row">
                                    <div>
                                        <span className="fancy-checkbox chkbx-rmbg">
                                            <input className="chck-block-end-day" type="checkbox" name="block_day" id="block-end-day" />
                                            <label htmlFor="block-end-day"><span>Block out for full day(s)</span></label>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="item-form-group">
                            <div className="col-md-12">
                                <div className="row">
                                    <div className="itmuplodpg-schperiod-edit-btnsec"> <a href="#!" onClick={(e) => self.addBlockDate()} id="upload_cal_block">Block this date</a> </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )
    }


    convertToMilitaryTime(time) {
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var ampm = "";
        if (time.match(/\s(.*)$/)) {
            ampm = time.match(/\s(.*)$/)[1];
        }
        if (ampm === "PM" && hours < 12) hours = hours + 12;
        if (ampm === "AM" && hours === 12) hours = hours - 12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        var convertedTime = sHours + ":" + sMinutes;
        return convertedTime;
    }

    addBlockDate() {
        let self = this;
        let startDate;
        let endDate;
        let blockStartDate = this.refs.blockStartDate;
        let blockEndDate = this.refs.blockEndDate;
        let isValid = true;
        let blockStartDateTime = this.refs.blockStartDateTime;
        let blockEndDateTime = this.refs.blockEndDateTime;

        $(blockStartDate).removeClass('error-con');
        $(blockEndDate).removeClass('error-con');
        $(blockStartDateTime).removeClass('error-con');
        $(blockEndDateTime).removeClass('error-con');

        if (jQuery.trim(blockStartDate.value) === '') {
            $(blockStartDate).addClass('error-con');
            isValid = false;
        }

        if (jQuery.trim(blockEndDate.value) === '') {
            $(blockEndDate).addClass('error-con');
            isValid = false;
        }

        if (jQuery.trim(blockStartDateTime.value) === '') {
            $(blockStartDateTime).addClass('error-con');
            isValid = false;
        }

        if (jQuery.trim(blockEndDateTime.value) === '') {
            $(blockEndDateTime).addClass('error-con');
            isValid = false;
        }

        if (isValid) {
            startDate = moment(blockStartDate.value + " " + blockStartDateTime.value,'DD/MM/YYYY hh:mm A').toDate();
           // endDate = moment(blockEndDate.value + " " + blockEndDateTime.value, 'DD/MM/YYYY hh:mm A').toDate().add(86399, 'seconds');
            endDate = moment(blockEndDate.value + " " + blockEndDateTime.value,'DD/MM/YYYY hh:mm A').toDate();
           // endDate = moment(blockEndDate.value + " " + blockEndDateTime.value, 'DD/MM/YYYY hh:mm A').toDate().setSeconds(moment(blockEndDate.value + " " + blockEndDateTime.value, 'DD/MM/YYYY hh:mm A').toDate().getSeconds() + 86399);

            if (startDate > endDate) {
                $(blockStartDate).addClass('error-con');
                $(blockEndDate).addClass('error-con');
                isValid = false;
                toastr.error('Please enter valid date range', 'Oops! Something went wrong.');
            }
        }

        if (isValid) {
            if (new Date() > startDate) {
                $(blockStartDate).addClass('error-con');
                isValid = false;
                toastr.error('Please enter a future date', 'Oops! Something went wrong.');
            }
        }

        if (isValid && this.props.itemModel.scheduler && this.props.itemModel.scheduler.Unavailables) {

            let activeDates = this.props.itemModel.scheduler.Unavailables.filter(d => d.Active === true);
            let isExist = false;
            activeDates.forEach(function (blockDate) {

                let fromDateTimeCheck = moment.unix(blockDate.StartDateTime).utc().format('MM/DD/YYYY hh:mm A')
                let ToDateTimeCheck = moment.unix(blockDate.EndDateTime).utc().format('MM/DD/YYYY hh:mm A')

                if (moment(startDate).isBetween(fromDateTimeCheck, ToDateTimeCheck, undefined, '[]')) {
                    isExist = true;
                    return;
                }
                if (moment(endDate).isBetween(fromDateTimeCheck, ToDateTimeCheck, undefined, '[]')) {
                    isExist = true;
                    return;
                }
            });

            if (isExist === true) {
                isValid = false;
                $(blockStartDate).addClass('error-con');
                $(blockEndDate).addClass('error-con');
                toastr.error('Block date range already exists', 'Oops! Something went wrong.');
            }

        }

        //For Booked Dates
        //if (isValid && this.props.itemModel.scheduler && this.props.itemModel.scheduler.Unavailables) {
            //var dateRangeExists = this.props.itemModel.scheduler.Unavailables.find(function (booking) {
            //    var currentDate = new Date();
            //    currentDate = currentDate / 1000;

            //    if (booking.StartDateTime / 1000 > currentDate) {
            //        var bookingStartDateTime = moment(booking.StartDateTime);
            //        var bookingEndDateTime = moment(booking.EndDateTime);
            //        var momentStartDate = moment(startDate);
            //        var momentEndDate = moment(endDate);
            //        return ((momentStartDate >= bookingStartDateTime && momentStartDate <= bookingEndDateTime)
            //            || (momentEndDate >= bookingStartDateTime && momentEndDate <= bookingEndDateTime)
            //            || (bookingStartDateTime >= momentStartDate && bookingEndDateTime <= momentStartDate)
            //            || (bookingStartDateTime >= momentEndDate && bookingEndDateTime <= momentEndDate));
            //    }
            //});

            //if (dateRangeExists) {
            //    isValid = false;
            //    $(blockStartDate).addClass('error-con');
            //    $(blockEndDate).addClass('error-con');
            //    toastr.error('The selected date range contains bookings, please choose a different date range.', 'Oops! Something went wrong.');
            //}
        //}

        if (isValid) {
         //   var endDateAddSec = endDate.set({ h: 0, m: 0, s: 86399 });
            let getStartDate = new Date(startDate.getTime() + (1000 * 60 * (-startDate.getTimezoneOffset()))).getTime() / 1000;
            // let endDatePass = moment(blockEndDate.value + " " + blockEndDateTime.value, 'DD/MM/YYYY hh:mm A').toDate();
            let getEndDate = new Date((endDate.getTime()) + (1000 * 60 * (-endDate.getTimezoneOffset()))).getTime() / 1000;


            var blockDate = ({
                StartDateTime: getStartDate,
                EndDateTime: getEndDate,
                Active: true,
                ID: CommonModule.guidGenerator()
            });

            self.props.addBlockDate(blockDate);
            calendar.destroy();
            self.getBlockDates();

            if (!calendar || (calendar && !calendar.isRendered)) {
               self.init_calendar();
            }
         
            self.disableButtonActive();
        }
    }

    deleteBlockDate(id) {
        let self = this;
        self.props.deleteBlockDate(id);
        calendar.destroy();
        self.getBlockDates();
        self.init_calendar();
        self.disableButtonActive();
    }

    disableButtonActive() {
        $(".fc-button").each(function (i, bt) {
            if ($(bt).hasClass("fc-button-active")) {
                $(bt).prop('disabled', true);
            } else {
                $(bt).removeAttr("disabled");
            }
        })
    }

    render() {

        return (
            <React.Fragment>
                <div className="itmuplodpg-clndr-area">
                    <h5>Availability Calendar</h5>
                    <div className="itm-dtls-calendararea">
                        <div id="itm_dtls_calendar" className="fc fc-media-screen fc-direction-ltr fc-theme-standard"></div>
                        <div id="mobicalender"></div>
                    </div>
                </div>
                {this.renderBlockDateScheduler()}
            </React.Fragment>
        );
    }
}

module.exports = CalendarView;