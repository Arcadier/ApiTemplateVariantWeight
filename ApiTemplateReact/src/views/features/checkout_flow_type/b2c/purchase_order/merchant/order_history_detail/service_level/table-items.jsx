'use strict';
const React = require('react');
const BaseComponent = require('../../../../../../../../views/shared/base');
var Moment = require('moment');
let CalendarComponent = require('../service_level/calendar');
var Currency = require('currency-symbol-map');

class TableItemsComponent extends BaseComponent {
    showBookingTime(durationUnit) {
        return durationUnit
            && (durationUnit.toLowerCase().includes('minute')
                || durationUnit.toLowerCase().includes('hour')
                || durationUnit.toLowerCase().includes('night'));
    }
    renderBookingDurations() {
        let self = this;
        const cartItem = this.props.detail.Orders[0].CartItemDetails[0];
        const { ItemDetail, BookingSlot } = cartItem;
        const bookingType = this.fetchBookingType(ItemDetail).toLowerCase();
        let fromDate = '';
        let toDate = '';
        let fromTime = '';
        let toTime = '';
        let showBookingTime = false;
        let durationUnit = '';
        let bookingUnit = '';

        if (BookingSlot) {
            var mFromDate = Moment.unix(BookingSlot.FromDateTime);
            var mToDate = Moment.unix(BookingSlot.ToDateTime);

            fromDate = mFromDate.subtract(mFromDate.utcOffset(), 'm').format(process.env.DATE_FORMAT);
            toDate = mToDate.subtract(mToDate.utcOffset(), 'm').format(process.env.DATE_FORMAT);
            fromTime = Moment.unix(BookingSlot.FromDateTime).utc().format(process.env.TIME_FORMAT);
            toTime = Moment.unix(BookingSlot.ToDateTime).utc().format(process.env.TIME_FORMAT);

            showBookingTime = this.showBookingTime(BookingSlot.DurationUnit);
        }

        const timeString = showBookingTime ? `${fromTime} to ${toTime}` : '';
        if (bookingType.indexOf('unit') >= 0) {
            var bUnit = ItemDetail.BookingUnit;
            if (bUnit && !bUnit.endsWith('(s)')) {
                bUnit = bUnit + '(s)';
            }

            bookingUnit = 'No. of ' + bUnit + ': ' + cartItem.Quantity;
        }

        if (bookingType.indexOf('duration') >= 0) {
            let dUnit = ItemDetail.DurationUnit ? ItemDetail.DurationUnit : '';
            if (dUnit && !dUnit.endsWith('(s)')) {
                dUnit = dUnit + '(s)';
            }

            if (dUnit) {
                dUnit = dUnit.charAt(0).toUpperCase() + dUnit.slice(1);
            }

            let duration = BookingSlot ? BookingSlot.Duration : '';

            durationUnit = 'No. of ' + dUnit + ': ' + duration;
        }
       
        durationUnit = durationUnit ? [durationUnit, <br />] : '';
        bookingUnit = bookingUnit ? [bookingUnit, <br />] : '';

        return (
            <div className="item-field">
                <span className="if-txt">
                    <span>Date:</span>
                    <span>{fromDate} to {toDate}</span>
                </span>
                <span className="if-txt">
                    <span>{showBookingTime ? 'Time:' :''} </span>
                    <span>{timeString}</span>
                </span>
                <span className="if-txt">
                    <span> {durationUnit ? durationUnit : ''} </span>
                   
                </span>
                <span className="if-txt">
                    <span> {bookingUnit ? bookingUnit : ''}</span>
                  
                </span>
                <span className="if-txt">
                    <span>Add-ons:</span>
                    <span>
                        {
                            cartItem.AddOns.map(function (addons, index) {
                                return (<div> - {addons.Name}  +{ self.renderFormatMoney(self.props.detail.CurrencyCode, addons.PriceChange)} <br />
                                </div>);
                            })
                        }
                    </span>
                </span>
                <button className="btn btn-cancel-order mt-15 w-65 edit-booking">Edit Booking</button>
            </div>

          )
    }
    componentDidMount() {
     
        var self = this;
        $(window).load(function () {
            $('td').each(function () {
                var th = $(this).closest('table').find('th').eq(this.cellIndex);
                var thContent = $(th).html();
                $(this).attr('data-th', thContent);
            });


            $('body').on('click', '.slrordrlst-refnd-chk', function () {
                order_itemstatus_popup(this);
            });
            $('body').on('change', '.order-item-status-popup', function () {
                order_itemstatus_popup(this);
            });

        });

        $(document).ready(function () {
            jQuery(".btn-saffron").click(function () {
                $(this).parents(".popup-area").hide();
                jQuery("#cover").hide();
            });

            $('body').on('click', '.title.desktop-hide', function () {
                $(".nav-tabs.nav-justified").toggleClass("mobi-hide");
            });
            $('body').on('click', '.box-activity-tabs .nav-tabs.nav-justified > li > a', function () {
                $(".nav-tabs.nav-justified").addClass("mobi-hide");
            });
            $("body").on('click', '.btn-feedback', function () {
                if ($(this).hasClass("lefted")) {
                    $('selector').click(false);
                } else {
                    $(this).find(".purchase-feedback").addClass("selected");
                    giveItemFeedback();
                }
            });
            $('body').on('click', '.delete_project', function () {
                var id = $(this).data('id');
                show_conformation(id, 'item');
            });

            $('body').on('click', '.cancel_remove', function () {
                cancel_remove();
            });

            $('body').on('click', '.confirm_remove', function () {
                confirm_remove(this);
            });


            // modal booking
            $(document).on('click', '.edit-booking', function () {
                $('.edit-booking-modal').modal('show');
            });

            $(document).on('click', '.btn-save-booking', function () {
                var validate = true;

                $('.edit-booking-modal .required').each(function () {

                    var value = $.trim($(this).val());

                    $(this).removeClass('error-con');
                    if (!value) {
                        $(this).addClass('error-con');
                        validate = false;
                    }

                });

                if (validate) {
                    $('.edit-booking-modal').modal('hide');
                }

            });

            //$('.date-picker').datetimepicker({
            //    format: 'MM/DD/YYYY',
            //}).keypress(function (event) { event.preventDefault(); });

            //$('.time-picker').timepicker({
            //    'step': 15,
            //    'timeFormat': 'h:i A'
            //}).keypress(function (event) { event.preventDefault(); });

            // modal booking

            $('body').on('click', '#addNewEntry', function () {
                var hasError = false;
                $('.box-activity-log .required').each(function () {
                    $(this).removeClass('error-con');
                    if (!$.trim($(this).val())) {
                        $(this).addClass('error-con');
                        hasError = true;
                    }
                });
            });

        });


        function order_refunded_updater() {
            $(".order-item-status-popup").attr("disabled", true);
            $("#cancelOrder").attr("disabled", true);
            $("#cover").hide();
        }


        function order_itemstatus_popup(obj) {
            var target = jQuery(".popup-area.order-itemstatus-popup");
            var cover = jQuery("#cover");
            target.fadeIn();
            cover.fadeIn();
        }
        $('body').on('click', '#cancelOrder', function () {
            var target = jQuery(".popup-area.order-cancel-popup");
            var cover = jQuery("#cover");
            target.fadeIn();
            cover.fadeIn();
        });

        function delete_item(id) {
            show_conformation(id, 'item');
        }

        function cancel_remove() {
            var target = jQuery(".popup-area.item-remove-popup");
            var cover = jQuery("#cover");
            target.fadeOut();
            cover.fadeOut();
            jQuery(".my-btn.btn-saffron").attr('data-id', '');
        }

        function show_conformation(id, key) {
            var target = jQuery(".popup-area.item-remove-popup");
            var cover = jQuery("#cover");
            target.fadeIn();
            cover.fadeIn();
            jQuery(".my-btn.btn-saffron").attr('data-key', key);
            jQuery(".my-btn.btn-saffron").attr('data-id', id);
        }

        function confirm_remove(ele) {
            var that = jQuery(ele);
            var id = that.attr('data-id');
            var key = that.attr('data-key');
            target = ''
            if (key == 'item') {
                target = jQuery('.account-row[data-id=' + id + ']');
            }

            target.fadeOut(500, function () {
                target.remove();
                cancel_remove();
            });
        }

        function giveItemFeedback(obj) {

            var target = $(".popup-area.order-item-feedback-popup");
            var cover = $("#cover");
            target.fadeIn();
            cover.fadeIn();
            $('body').addClass('modal-open');
            $('#stars').on('starrr:change', function (e, value) {
                $('input[name=rating_val]').val(value);
            });
        };

        function submitFeedback() {
            $(".popup-area.order-item-feedback-popup").hide();
            $("#cover").hide();
            $(".feedback-img-sec .icon.feedback").hide();
            $(".purchase-feedback.selected .feedback-img-sec").append('<div class="check-icon"><img src="images/done.svg"></div>');
            $(".purchase-feedback.selected .feedback-message").text('Left feedback');
            $(".purchase-feedback.selected").parents(".btn-feedback").addClass("lefted");
            $('body').removeClass('modal-open');
        };

        // var bookedTrans = resources.Translate("strCommonWords_Booked", "Booked").ToString();
        //var blockoutTrans = resources.Translate("strCommonWords_Blockout", "Blockout").ToString();
        //const officersIds = officers.map(officer => o{ title:officer.});
        //  var bookings = this.getBookings(self.props.detail.Orders[0].Bookings ? self.props.detail.Orders[0].Bookings : []);
        // let all_events = bookings;

        function closePopup(closePopup) {
            $("." + closePopup).hide();
            $("#cover").hide();
            $('body').removeClass('modal-open');
        };
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        function set_background_color_eventrender() {
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
        };
    }

    renderOfferDetailType(offer) {
        var self = this;
        switch (offer.Type) {
            case 'Quantity': 
                return (
                    <React.Fragment>
                        <span className="if-txt">
                            <span>
                                Qty:
                            </span>
                            <span>
                                {offer.Quantity}
                            </span>
                        </span>
                        <span class="if-txt">
                            <span>{self.props.detail.CurrencyCode }</span>
                            <span>{`${Currency(self.props.detail.CurrencyCode)}${offer.Price}`}</span>
                        </span>
                    </React.Fragment>
                )
            case 'Percentage':
                return (
                    <React.Fragment>
                        <span className="if-txt">
                            <span>Percentage:</span>
                            <span>{`${parseFloat(offer.Price * 100).toFixed(0)} %`}</span>
                        </span>
                    </React.Fragment>
                )
            case 'Fixed':
                return (
                    <React.Fragment>
                        <span className="if-txt">
                            <span>{offer.Type}</span>
                        </span>
                        <span class="if-txt">
                            <span>{self.props.detail.CurrencyCode}</span>
                            <span>{`${Currency(self.props.detail.CurrencyCode)}${offer.Price}`}</span>
                        </span>
                    </React.Fragment>
                )
        }        
    }

    renderOfferDetails() {
        var self = this;
        const orders = this.props.detail.Orders;
        if (!orders[0].OfferDetails)
            return '';
        
        let ele = '';
        if (orders) {
            ele = orders.map(o => {
                    if (o.CartItemDetails) {
                        return (
                            o.CartItemDetails.map(cart => {
                                if (cart.AcceptedOffer && cart.AcceptedOffer.OfferDetails) {
                                    return (
                                        cart.AcceptedOffer.OfferDetails.map(offer => {
                                            if (offer.Name === cart.ItemDetail.Name) {
                                                return '';
                                            }
                                            else {
                                                return (
                                                    <tr className="extra bb-none">
                                                        <td colSpan={2}>
                                                            <div className="text-left">
                                                                <p>
                                                                    <span>
                                                                        <b> {offer.Name} -</b> {offer.Description}
                                                                    </span>
                                                                </p>
                                                                
                                                                {
                                                                    this.renderOfferDetailType(offer)
                                                                }
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="item-price">
                                                                <span className="currencyCode"></span>
                                                                <span className="currencySymbol"></span>
                                                                <span className="priceAmount">{self.renderFormatMoney(self.props.detail.CurrencyCode, offer.TotalAmount)}</span>
                                                            </div>
                                                        </td>
                                                        <td data-th="Total Price">&nbsp;</td>
                                                    </tr>                                                    
                                                );
                                            }
                                        })
                                    );
                                }                                
                            })
                        );
                    }                    
                })            
        }
        return ele;
    }
    renderDayNames(num) {
        let parseDay = '';
        if (num === 2) {
            parseDay = "Monday";
        } else if (num === 3) {
            parseDay = "Tuesday";
        } else if (num === 4) {
            parseDay = "Wednesday";
        } else if (num === 5) {
            parseDay = "Thursday";
        } else if (num === 6) {
            parseDay = "Friday";
        } else if (num === 7) {
            parseDay = "Saturday";
        } else if (num === 1) {
            parseDay = "Sunday";
        }
        return parseDay;
    }
    renderAvailabilitySchedules() {
        if (this.props.detail.Orders[0].CartItemDetails[0].ItemDetail) {
            const { Scheduler } = this.props.detail.Orders[0].CartItemDetails[0].ItemDetail;
            if (Scheduler) {
                if (Scheduler.Overnight) {
                    if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                        const checkInTime = Moment(Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format('hh:mm A');
                        const checkOutTime = Moment(Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format('hh:mm A');
                        return (
                            <div className="idclt-custom-field full-width">
                                <span className="title">Availability</span>
                                <span className="custom-field">
                                    <p>
                                        Check-in: {checkInTime}
                                        <br />
                                        Check-out: {checkOutTime}
                                    </p>
                                </span>
                            </div>

                        )
                    }
                } else {
                    let label = '';
                    let scheduleArr = [];
                    if (Scheduler.AllDay) {
                        label = 'Open 24/7';
                    } else {
                        label = 'Opening Hours or Check-in/Check-out';
                    }

                    if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                        var groupBy = function (xs, key) {
                            return xs.reduce(function (rv, x) {
                                (rv[x[key]] = rv[x[key]] || []).push(x);
                                return rv;
                            }, {});
                        };
                        const scheduleGroupedByDay = groupBy(Scheduler.OpeningHours, 'Day');
                        if (scheduleGroupedByDay) {
                            scheduleArr = Object.keys(scheduleGroupedByDay).map(num => {
                                let day = '';
                                switch (num) {
                                    case '1':
                                        day = 'Sunday';
                                        break;
                                    case '2':
                                        day = 'Monday';
                                        break;
                                    case '3':
                                        day = 'Tuesday';
                                        break;
                                    case '4':
                                        day = 'Wednesday';
                                        break;
                                    case '5':
                                        day = 'Thursday';
                                        break;
                                    case '6':
                                        day = 'Friday';
                                        break;
                                    case '7':
                                        day = 'Saturday';
                                        break;
                                }
                                const opening = scheduleGroupedByDay[num];
                                if (opening && opening.length > 0) {
                                    if (opening.length == 1 && opening[0] && opening[0].IsRestDay) {
                                        return `${day}: Closed`;
                                    }

                                    const openingsOnday = opening.map(op => {
                                        const checkInTime = Moment(op.StartTime, "HH:mm:ss").format('hh:mm A');
                                        const checkOutTime = Moment(op.EndTime, "HH:mm:ss").format('hh:mm A');
                                        return `${checkInTime} - ${checkOutTime}`;
                                    });
                                    const openingStr = `${day}: ${openingsOnday.join('\n')}`;
                                    return openingStr;
                                }
                            });
                        }
                    }
                    return (
                        <div className="idclt-custom-field full-width">
                            <span className="title">{label}</span>
                            {
                                scheduleArr && scheduleArr.length > 0 ?
                                    <span className="custom-field">
                                        {scheduleArr.map(s => <p key={s}>{s}</p>)}
                                    </span>
                                    : ''
                            }
                        </div>

                    );
                }
            }
        }
        return '';
    }

    formatDateTime(timestamp, format) {
        if (typeof format === 'undefined') {
            format = process.env.DATETIME_FORMAT;
        }

        if (typeof timestamp === 'number') {
            return Moment.unix(timestamp).utc().format(format);
        } else {
            return Moment.utc(timestamp).local().format(format);
        }
    }

    renderReview(cartItem, itemUrl) {
        if (cartItem && cartItem.Feedback && cartItem.Feedback.FeedbackID) {
            return (
                <a href={itemUrl}>
                    <span className="purchase-feedback">
                        <span className="feedback-img-sec">
                            <i className="icon feedback" />
                        </span>
                        <span className="feedback-message">
                            New review!
                            </span>
                    </span>
                </a>
            )
        }
        else {
            return (
                cartItem.Feedback && cartItem.Feedback.FeedbackID ?
                    <a href={itemUrl}><i className="icon icon-review_black" />
                        <span className="new-review">New Review!</span></a>
                    : <i className="icon icon-review-old"></i>
            )
        }
    }

    getItemUrl(itemName, itemId) {
        return '/items/' + this.generateSlug(itemName) + '/' + itemId;
    }

    render() {
        var self = this;
        const cartItem = self.props.detail.Orders[0].CartItemDetails[0];
        let bookingSlot = self.props.detail.Orders[0].CartItemDetails[0].BookingSlot;
        let itemDetail = self.props.detail.Orders[0].CartItemDetails[0].ItemDetail;
        let location = self.props.detail.Orders[0].CartItemDetails[0].ItemDetail.Location;

        let fromDateTime = bookingSlot ? this.formatDateTime(bookingSlot.FromDateTime) : '';
        let toDateTime = bookingSlot ? this.formatDateTime(bookingSlot.ToDateTime) : '';

        let DateTimeFrom = fromDateTime ? fromDateTime.slice(0, 10) : ''
        let DateTimeTo = toDateTime ? toDateTime.slice(0, 10) : ''
        let FromHour = fromDateTime ? fromDateTime.slice(10) : ''
        let ToHour = toDateTime ? toDateTime.slice(10) : ''

        let itemName = itemDetail ? itemDetail.Name : '';
        let itemID = itemDetail ? itemDetail.ID : '';
        let duration = bookingSlot ? bookingSlot.Duration : '';
        const itemUrl = this.getItemUrl(itemDetail.Name, itemDetail.ParentID ? itemDetail.ParentID : itemDetail.ID);
        let subTotal = cartItem.SubTotal;
        if (cartItem.AddOns) {
            cartItem.AddOns.forEach(a => {
                subTotal += a.PriceChange;
            });
        }

        let address = [];
        address.push(location.Line1);
        address.push(location.Line2);
        address.push(location.City);
        address.push(location.State);
        address.push(location.Country);
        address.push(location.PostCode);
        
        return (
            <React.Fragment>
                <tr className="brdt">
                    <td>
                        <div className="flex-wrap h-img-box">
                            <div className="thumb-group">
                                <img src={self.props.detail.Orders[0].CartItemDetails[0].ItemDetail.Media[0].MediaUrl} alt="Item" />
                            </div>
                            <div className="po-content">
                                <span className="title">{self.props.detail.Orders[0].CartItemDetails[0].ItemDetail.Name}</span>
                                <h5><i className="fas fa-map-marker-alt" aria-hidden="true" />
                                    {' ' + address.filter(a => a).join(', ')}</h5>
                                {this.renderBookingDurations()}

                                
                            </div>
                        </div>
                    </td>
                    <td>
                        {/*<div class="btn-feedback" >*/}
                        {self.renderReview(cartItem, itemUrl)}                        
                        {/*</div>*/}
                    </td>
                    <td><div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{this.renderFormatMoney(self.props.detail.CurrencyCode, subTotal)}</span></div></td>
                    <td><div className="item-address">
                        <CalendarComponent itemModel={this.props.detail.Orders[0].CartItemDetails[0].ItemDetail}
                            bookings={this.props.detail.Orders[0].Bookings} />
                        <div>
                            <div className="item-opening-hours">
                                <h5>Availability / Opening Hours</h5>
                                {self.renderAvailabilitySchedules()}
                            </div>
                        </div>
                    </div></td>
                </tr>
                {self.renderOfferDetails()}
            </React.Fragment>

        );
    }
}

module.exports = TableItemsComponent;
