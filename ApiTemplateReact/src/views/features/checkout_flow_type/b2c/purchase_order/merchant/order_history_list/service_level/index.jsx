'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../../../../../../shared/base');
const Moment = require('moment');

class BookingDetails extends BaseComponent {
    gotoPurchaseDetails() {
        window.location = '/merchants/order/detail/' + this.props.invoice.InvoiceNo;
    }

    showBookingTime(durationUnit) {
        return durationUnit
            && (durationUnit.toLowerCase().includes('minute')
                || durationUnit.toLowerCase().includes('hour')
                || durationUnit.toLowerCase().includes('night'));
    }
             
    renderBookingDurations() {

        if (this.props.invoice.Orders[0].CartItemDetails == null) {
            return "";
        }
        const cartItem = this.props.invoice.Orders[0].CartItemDetails[0];
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

        let timeString = showBookingTime ? `Time: ${fromTime} to ${toTime}` : '';
        //ARC 9737
        if (ItemDetail.Scheduler.Overnight && ItemDetail.Scheduler.Overnight === true) {
            if (ItemDetail.Scheduler.OpeningHours && ItemDetail.Scheduler.OpeningHours.length > 0) {
                let checkInTime = Moment(ItemDetail.Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format('hh:mm A');
                let checkOutTime = Moment(ItemDetail.Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format('hh:mm A');

                timeString = `Check-in: ${checkInTime} Check-out: ${checkOutTime}`;
            }
        }

        

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
            <td onClick={() => { this.gotoPurchaseDetails() }} data-th="Booking Details">
                Date: {fromDate} to {toDate}<br />
                {timeString}
                {timeString ? <br /> : ''}
                {durationUnit}
                {bookingUnit}
            </td>
        );
    }

    render() {
        return this.renderBookingDurations();
    }
}

module.exports = BookingDetails;