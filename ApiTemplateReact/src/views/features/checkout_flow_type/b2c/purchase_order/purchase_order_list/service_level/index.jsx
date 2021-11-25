'use strict';
const React = require('react');
const Moment = require('moment');
const BaseComponent = require('../../../../../../shared/base');

class PurchaseTableContents extends BaseComponent {
    constructor(props) {
        super(props);
    }

    renderCustomHeader() {
        return (
            <thead>
                <tr>
                    <th>Order No.</th>
                    <th>Timestamp</th>
                    <th>Seller</th>
                    <th>Booking Details </th>
                    <th>Total</th>
                    <th>Order Status</th>
                    <th>Fulfillment Status</th>
                </tr>
            </thead>
        );
    }

    getBookingType(item) {
        const { DurationUnit, BookingUnit, PriceUnit } = item;
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

    showBookingTime(isOvernight, durationUnit) {
        return !isOvernight && (durationUnit 
            && (durationUnit.toLowerCase().includes('minute') 
                || durationUnit.toLowerCase().includes('hour')));
    }

    renderBookingSlotDetails(invoiceNo, merchantID, cartItem) {
        if (cartItem && cartItem.ItemDetail) {
            const item = cartItem.ItemDetail;
            const itemImageUrl = item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
            let fromDate = '';
            let toDate = '';
            let fromTime = '';
            let toTime = '';
            let checkInTime = '';
            let checkOutTime = '';

            let showBookingTime = false;
            let duration = 0;

            if (cartItem.BookingSlot) {
                fromDate = Moment.unix(cartItem.BookingSlot.FromDateTime).utc().format('DD/MM/YYYY');
                toDate = Moment.unix(cartItem.BookingSlot.ToDateTime).utc().format('DD/MM/YYYY');
                duration = cartItem.BookingSlot.Duration;
                if (item.Scheduler) {
                    showBookingTime = this.showBookingTime(item.Scheduler.Overnight, cartItem.BookingSlot.DurationUnit);
                    if (showBookingTime) {
                        fromTime = Moment.unix(cartItem.BookingSlot.FromDateTime).utc().format(process.env.TIME_FORMAT);
                        toTime = Moment.unix(cartItem.BookingSlot.ToDateTime).utc().format(process.env.TIME_FORMAT);
                    }
                    if (item.Scheduler.Overnight) {
                        if (item.Scheduler.OpeningHours && item.Scheduler.OpeningHours.length > 0) {
                            checkInTime = Moment(item.Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format('hh:mm A');
                            checkOutTime = Moment(item.Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format('hh:mm A');
                        }
                    }
                }
            }


            let bookingType = this.getBookingType(item);
            const dateStr = `Date: ${fromDate} - ${toDate}`;
            const timeStr = showBookingTime ? `Time: ${fromTime} - ${toTime}` : '';
            const checkInStr = item.Scheduler && item.Scheduler.Overnight == true? `Check-in: ${checkInTime} Check-out: ${checkOutTime}` : '';
            const durationStr = bookingType && bookingType != 'Book by unit' ? `No of ${item.DurationUnit}(s): ${duration}` : '';
            const unitStr = bookingType && bookingType != 'Book by duration' ? `No of ${item.BookingUnit}(s): ${cartItem.Quantity}` : '';
            const returnArr = [dateStr, timeStr, checkInStr, durationStr, unitStr];
            return (
                <td>
                    <a href={"/purchase/detail/" + invoiceNo + "/merchant/" + merchantID}>
                        {dateStr}
                        <br />
                        {timeStr}
                        {timeStr ? <br />: ''}
                        {checkInStr}
                        {checkInStr ? <br /> : ''}
                        {durationStr}
                        {durationStr ? <br /> : ''}
                        {unitStr}
                    </a>
                </td>
            )
        }
        return (<td><a href={"/purchase/detail/" + invoiceNo + "/merchant/" + merchantID}>-</a></td>);
    }

    renderBookingDetails(invoice) {
        if (invoice && invoice.Orders && invoice.Orders.length > 0
            && invoice.Orders[0].CartItemDetails && invoice.Orders[0].CartItemDetails.length > 0 ) {
            return this.renderBookingSlotDetails(invoice.InvoiceNo, invoice.Orders[0].MerchantDetail.ID, invoice.Orders[0].CartItemDetails[0]);

        }
        return (<td><a href={"/purchase/detail/" + invoice.InvoiceNo + "/merchant/" + invoice.Orders[0].MerchantDetail.ID}>-</a></td>);
    }

}


module.exports = PurchaseTableContents;