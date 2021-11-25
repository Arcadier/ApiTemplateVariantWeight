var React = require('react');
var Numeral = require('numeral');
var Moment = require('moment');
var Currency = require('currency-symbol-map');
var Toastr = require('toastr');
var EnumCoreModule = require('../../../src/public/js/enum-core.js');

class BaseClassComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    onChange(event) {
        var self = this;

        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const reactStateName = target.getAttribute('data-react-state-name');

        self.setState({
            [reactStateName]: value
        }, function () {
            self.onChangeSetStateCallBack(reactStateName);
        });
    }

    onChangeNoWhiteSpaceAllowed(event) {
        var self = this;

        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const reactStateName = target.getAttribute('data-react-state-name');

        if (event.which == 32) {
            return false;
        }
            

        self.setState({
            [reactStateName]: value
        }, function () {
            self.onChangeSetStateCallBack(reactStateName);
        });
    }

    avoidWhiteSpaceOnKeyDown(event) {
        if (event.which == 32) {
            event.preventDefault();
            return false;
        }
    }

    onChangeSetStateCallBack(stateName) {
    }


    //----------------------------------------------------------------------- SpaceTIME 
    canShowTime(itemDetails) {
        if (itemDetails) {
            const { Scheduler, DurationUnit } = itemDetails;
            if (Scheduler) {
                return !Scheduler.Overnight && (DurationUnit
                    && (DurationUnit.toLowerCase().includes('minute')
                        || DurationUnit.toLowerCase().includes('hour')));
            }
        }
        return false;
    }

    canShowDuration(itemDetails) {
        const bookingType = this.fetchBookingType(itemDetails);
        return bookingType != null && bookingType != 'Book by unit';
    }


    canShowUnit(itemDetails) {
        const bookingType = this.fetchBookingType(itemDetails);
        return bookingType != null && bookingType !== 'Book by duration';
    }

    fetchBookingType(itemDetails) {
        if (itemDetails) {
            const { DurationUnit, BookingUnit, PriceUnit } = itemDetails;
            if (!DurationUnit && !BookingUnit && !PriceUnit) return null;

            if (!DurationUnit || PriceUnit.toLowerCase() == DurationUnit.toLowerCase()) {
                return 'Book by duration';
            }
            if (BookingUnit && PriceUnit.toLowerCase() == BookingUnit.toLowerCase()) {
                return 'Book by unit';
            }

            return 'Book by duration and unit';
        }
        return '';
    }

    fetchDurationStr(itemDetails) {
        if (itemDetails) {
            const { DurationUnit } = itemDetails

            return DurationUnit && DurationUnit.length > 0 ?
                `${DurationUnit.charAt(0).toUpperCase() + DurationUnit.slice(1)}`
                : '';
        }
        return '';
    }

    fetchUnitStr(itemDetails) {
        if (itemDetails) {
            const { BookingUnit } = itemDetails

            return BookingUnit && BookingUnit.length > 0 ?
                `${BookingUnit.charAt(0).toUpperCase() + BookingUnit.slice(1)}`
                : '';
        }
        return '';
    }
    //----------------------------------------------------------------------- SpaceTIME 

    renderFormatMoney(currencyCode, amount, priceUnit) {
        let format = process.env.MONEY_FORMAT;

        if (typeof currencyCode === 'undefined' || currencyCode == null) currencyCode = process.env.DEFAULT_CURRENCY;

        if (typeof amount === 'undefined' || isNaN(amount)) {
            //adjusting for un1056
            return (
                <React.Fragment>
                    <span className="currencyCode">{currencyCode}</span>
                    <span className="currencySymbol"> {Currency(currencyCode)}</span>
                </React.Fragment>
            );
        }

        if (currencyCode === "empty") {
            //adjusting for un1056
            return (
                <React.Fragment>
                    <span className="priceAmount"> {Numeral(amount).format(format)}</span>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <span className="currencyCode">{currencyCode}</span>
                <span className="currencySymbol"> {Currency(currencyCode)}</span>
                <span className="priceAmount"> {Numeral(amount).format(format)}</span>
                {priceUnit ? <span className="time-split"> / {priceUnit}</span> : null}
            </React.Fragment>   
        );
    }

    formatMoney(currencyCode, amount, priceUnit) {
        // base function for non-jsx purpose like html placeholder
        let format = process.env.MONEY_FORMAT;
        if (typeof currencyCode === 'undefined') currencyCode = process.env.DEFAULT_CURRENCY;

        let value = currencyCode + ' ' + Currency(currencyCode);

        if (typeof amount != 'undefined' && amount != null) {
            value = value + ' ' + Numeral(amount).format(format);
        }

        if (priceUnit) {
            value = value + ' / ' + priceUnit;
        }

        return value;
    }

    formatMoneyWithoutCurrency(amount) {
        const format = process.env.MONEY_FORMAT;
        let value = '';

        if (typeof amount != 'undefined' && amount != null) {
            value = Numeral(amount).format(format);
        }

        return value;
    }

    formatDateTime(timestamp, format) {
        if (typeof format === 'undefined') {
            format = process.env.DATETIME_FORMAT;
        }

        if (typeof timestamp === 'number') {
            return Moment.unix(timestamp).utc().local().format(format);
        } else {
            return Moment.utc(timestamp).local().format(format);
        }
    }

    formatDate(timestamp) {
        let format = process.env.DATE_FORMAT;
        return this.formatDateTime(timestamp, format);
    }

    formatTime(timestamp) {
        let format = process.env.TIME_FORMAT;
        return this.formatDateTime(timestamp, format);
    }

    rawFormatDateTime(timestamp, format) {
        if (typeof format === 'undefined') {
            format = process.env.DATETIME_FORMAT;
        }

        if (typeof timestamp === 'number') {
            return Moment.unix(timestamp).utc().format(format);
        } else {
            return Moment(timestamp).format(format);
        }
    }

    rawFormatDate(timestamp) {
        let format = process.env.DATE_FORMAT;
        return this.rawFormatDateTime(timestamp, format);
    }

    rawFormatTime(timestamp, format) {

        if (typeof format === 'undefined') {
            format = process.env.TIME_FORMAT;
        }
        
        return this.rawFormatDateTime(timestamp, format);
    }

    formatYear(timestamp) {
        let format = process.env.YEAR_FORMAT;
        return this.formatDateTime(timestamp, format);
    }

    formatAmountWithCommaSeparator(totalAmount) {
        let format = process.env.MONEY_FORMAT;
        return Numeral(totalAmount).format(format);
    }

    showMessage(toastStr) {
        if (toastStr.type == 'error') {
            Toastr.error(toastStr.body, toastStr.header);
        }
        else if (toastStr.type == 'success') {
            Toastr.success(toastStr.body, toastStr.header);
        }
    }

    generateSlug(itemName) {
        const slug = itemName.replace(/[^a-zA-Z0-9\-]/g, "");
        return slug ? slug : '-';
    }

    validateFields(selector) {
        if (selector) {
            selector = selector + ' ';
        } else {
            selector = '';
        }

        $(selector + ".error-con").removeClass("error-con");
        $(selector + '.required .error-con').removeClass("error-con");
        $(selector + ".required").each(function (index, element) {
            var $this = $(element);
          
            $this.removeClass("error-con");
        
            if ($this.val() == "" && $this.val().length < 1) {
                $this.addClass("error-con");
            }
        })
    }

    formatNumberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    formatNumberWithCommaAndDecimal(number, places = 2) {
        let value = '';

        if (places <= 0) {
            places = 2;
        }

        try {
            value = parseFloat(number).toFixed(places);

            let parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            value = parts.join('.');
        } catch (e) { }

        return value;
    }

    getUnique(arr, index) {

        const unique = arr
            .map(e => e[index])

            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)

            // eliminate the dead keys & store unique objects
            .filter(e => arr[e]).map(e => arr[e]);

        return unique;
    }
}

module.exports = BaseClassComponent;