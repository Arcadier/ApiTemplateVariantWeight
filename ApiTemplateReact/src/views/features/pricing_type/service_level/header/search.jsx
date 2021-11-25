'use strict';
const React = require('React');
const Moment = require('moment');
const BaseComponent = require('../../../../shared/base');
require('daterangepicker');

class SearchComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.dateFormat = process.env.DATE_FORMAT;
        this.searchType = process.env.SEARCH_TYPE;
        this.searchEnableDate = process.env.SEARCH_ENABLE_DATE == 'true';
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        let startTimestamp = '';
        let endTimestamp = '';
        let dateRange = '';
        let isAllDates = false;

        if (urlParams.has('location')) {
            $('.h-spacetime-search-location input').val(decodeURIComponent(urlParams.get('location')));
        }
        if (urlParams.has('isAllDates')) {
            const value = urlParams.get('isAllDates').toLowerCase();

            if (value == 'true') {
                isAllDates = true;
            }
        }
        if (!isAllDates) {
            if (urlParams.has('startTimestamp')) {
                startTimestamp = urlParams.get('startTimestamp');
            }
            if (urlParams.has('endTimestamp')) {
                endTimestamp = urlParams.get('endTimestamp');
            }

            if (startTimestamp && endTimestamp) {
                startTimestamp = Moment(startTimestamp, 'X', true);
                endTimestamp = Moment(endTimestamp, 'X', true);

                if (startTimestamp.isValid() && endTimestamp.isValid()) {
                    startTimestamp = startTimestamp.utc().format(this.dateFormat);
                    endTimestamp = endTimestamp.utc().format(this.dateFormat);

                    dateRange = startTimestamp + ' - ' + endTimestamp;
                } else {
                    startTimestamp = '';
                    endTimestamp = '';
                }
            }
        } else {
            dateRange = 'All Dates';
        }

        $('.h-spacetime-search-date .rangepicker').daterangepicker({
            autoUpdateInput: false,
            locale: {
                format: this.dateFormat,
                cancelLabel: 'Clear',
                applyLabel: 'Apply',
            }
        });

        $('.h-spacetime-search-date .rangepicker').on('apply.daterangepicker', (event, picker) => {
            if ($('.input-alldates').is(":checked")) {
                $(event.target).val('All Dates');
            } else {
                $(event.target).val(picker.startDate.format(this.dateFormat) + ' - ' + picker.endDate.format(this.dateFormat));
            }
        });

        $('.h-spacetime-search-date .rangepicker').on('cancel.daterangepicker', (event, picker) => {
            $(event.target).val('');
        });

        $(document).on('change', '.input-alldates', function () {
            if ($(this).is(":checked")) {
                $('.calendar-table').addClass('ol_disabled');
            } else {
                $('.calendar-table').removeClass('ol_disabled');
            }
        });

        if ($('.daterangepicker .drp-calendar.right').length > 0) {
            $('.calendar-table').before(`<div class="block-alldates">
                    <span class="block-check"><input `+ (isAllDates ? 'checked' : '') + ` type="checkbox" class="input-alldates"></span>
                    <span class="block-check-txt">All Dates</span>
                </div>`);
            $('.daterangepicker .drp-calendar.right').hide();
            $('.daterangepicker .drp-calendar.left').prepend('<div class="custom-top-45 custom-daterangepicker-append next available"><span></span></div>');
        }

        if (this.searchType != 'keyword' && this.props.searchGooglePlaces) {
            $('.h-spacetime-search-location input').autocomplete({
                source: (req, res) => {
                    var keyword = $('.h-spacetime-search-location input').val();

                    if (keyword) {
                        this.props.searchGooglePlaces(keyword, (places) => {
                            res(places);
                        });
                    } else {
                        res([]);
                    }
                }
            });
        }

        if (startTimestamp && endTimestamp) {
            $('.h-spacetime-search-date .rangepicker').data('daterangepicker').setStartDate(startTimestamp);
            $('.h-spacetime-search-date .rangepicker').data('daterangepicker').setEndDate(endTimestamp);
        }

        $('.h-spacetime-search-date .rangepicker').val(dateRange);

        if (isAllDates) {
            $('.calendar-table').addClass('ol_disabled');
        }
    }

    onKeyDown(e) {
        if (e.keyCode == 13) {
            this.gotoSearch(e);
        }
    }

    gotoSearch(e) {
        const keyword = $('.h-spacetime-search-looking input').val();
        const location = $('.h-spacetime-search-location input').val();
        const range = $('.h-spacetime-search-date .rangepicker').val();
        $('.h-spacetime-search-date .rangepicker').removeClass('error-con');

        let startTimestamp = '';
        let endTimestamp = '';
        const isAllDates = range.toLowerCase() == 'all dates' ? true : false;

        if (range && !isAllDates) {
            const array = range.split('-');

            if (array.length < 2) {
                $('.h-spacetime-search-date .rangepicker').addClass('error-con');
                return;
            }

            const startDate = Moment(array[0].trim(), this.dateFormat, true);
            const endDate = Moment(array[1].trim(), this.dateFormat, true);

            if (!startDate.isValid() || !endDate.isValid() || startDate > endDate) {
                $('.h-spacetime-search-date .rangepicker').addClass('error-con');
                return;
            }

            startTimestamp = startDate.add(startDate.utcOffset(), 'm').format('X');
            endTimestamp = endDate.add(endDate.utcOffset(), 'm').add(1439, 'm').format('X');
        }

        let params = [];
        if (this.searchType && this.searchType != 'location') {
            params.push('keywords=' + encodeURIComponent(keyword));
        }
        if (this.searchType && this.searchType != 'keyword') {
            params.push('location=' + encodeURIComponent(location));
        }
        if (this.searchEnableDate) {
            params.push('startTimestamp=' + startTimestamp);
            params.push('endTimestamp=' + endTimestamp);
            params.push('isAllDates=' + isAllDates);
        }

        if (sessionStorage.getItem('userLatitude') && sessionStorage.getItem('userLongitude')) {
            params.push('userLatitude=' + sessionStorage.getItem('userLatitude'));
            params.push('userLongitude=' + sessionStorage.getItem('userLongitude'));
        }

        window.location.href = '/search?' + params.join('&');
    }

    renderKeyword() {
        if (this.searchType && this.searchType != 'location') {
            return (
                <div className="h-spacetime-search-looking">
                    <input type="text"
                        placeholder="Service you are looking for?"
                        defaultValue={this.props.keyword}
                        autoComplete="off"
                        onKeyDown={(e) => this.onKeyDown(e)} />
                </div>
            );
        }

        return null;
    }

    renderLocation() {
        if (this.searchType && this.searchType != 'keyword') {
            return (
                <div className="h-spacetime-search-location">
                    <i className="fas fa-map-marker-alt" />
                    <input type="text"
                        placeholder="Location"
                        defaultValue={''}
                        autoComplete="off"
                        onKeyDown={(e) => this.onKeyDown(e)} />
                </div>
            );
        }

        return null;
    }

    renderDate() {
        if (this.searchEnableDate) {
            return (
                <div className="h-spacetime-search-date">
                    <i className="fas fa-calendar" />
                    <input type="text"
                        placeholder="Date"
                        className="rangepicker"
                        autoComplete="off"
                        onKeyDown={(e) => this.onKeyDown(e)} />
                </div>
            );
        }

        return null;
    }

    render() {
        return (
            <div className="h-spacetime-search-bar">
                <div className="h-spacetime-search-bar">
                    {this.renderKeyword()}
                    {this.renderLocation()}
                    {this.renderDate()}
                    <div className="h-spacetime-search-button">
                        <button onClick={(e) => this.gotoSearch(e)}>
                            <i className="fas fa-search" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SearchComponent;