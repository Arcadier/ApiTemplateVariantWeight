'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');
const Moment = require('moment');
require('daterangepicker');

class FilterComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            isProcessing: false
        };

        this.onTimestampChanged = this.onTimestampChanged.bind(this);

        this.startDateFilter = null;
        this.endDateFilter = null;
    }

    onTimestampChanged(startDate, endDate) {
        this.startDateFilter = startDate;
        this.endDateFilter = endDate;
    }

    applyFilter(e) {
        e.preventDefault();

        const self = this;

        if (this.state.isProcessing) return;

        const $timestamp = $('#filter-datepicker');
        $timestamp.removeClass('error-con');

        function getTimestamp() {
            const $timestamp = $('#filter-datepicker');
            $timestamp.removeClass('error-con');

            const value = $timestamp.val();

            if (value) {
                const range = value.split('-');

                if (range.length == 2) {
                    const startDate = Moment(range[0].trim(), 'DD/MM/YYYY', true);
                    const endDate = Moment(range[1].trim(), 'DD/MM/YYYY', true);

                    if (startDate.isValid() && endDate.isValid() && startDate < endDate) {
                        return {
                            startDate: startDate.format('X'),
                            endDate: endDate.format('X')
                        };
                    }
                }
            } else {
                return {
                    startDate: null,
                    endDate: null
                }
            }

            $timestamp.addClass('error-con');
            return false;
        }

        function getSuppliers() {
            let suppliers = [];

            $('.advanced-select .x-check:not(.parent-check) input[type=checkbox]:checked').each((index, checkbox) => {
                suppliers.push($(checkbox).data('supplier-id'));
            });

            return suppliers;
        }

        if (this.startDateFilter && this.endDateFilter && (this.startDateFilter > this.endDateFilter)) {
            $timestamp.addClass('error-con');
            return false;
        }

        this.setState({
            isProcessing: true
        });

        const options = {
            keyword: $('#keywords').val().trim(),
            startDate: this.startDateFilter ? Moment(this.startDateFilter).format('X') : undefined, //timestamp.startDate,
            endDate: this.endDateFilter ? Moment(this.endDateFilter).format('X') : undefined, //timestamp.endDate,
            merchantIds: getSuppliers().join(',')
        };

        this.props.filterReceivingNotes(options, () => {
            self.setState({
                isProcessing: false
            });
        });

        // const timestamp = getTimestamp();

        // if (timestamp) {
            
        // }
    }

    componentDidMount() {
        const self = this;

        $('#filter-datepicker').daterangepicker({
            autoUpdateInput: false,
            opens: 'left',
            locale: {
                cancelLabel: 'Clear'
            }
        });

        $('#filter-datepicker').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            self.onTimestampChanged(picker.startDate.utc(true).format(), picker.endDate.utc(true).format());
            $(this).addClass('filled');
        });

        $('#filter-datepicker').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            self.onTimestampChanged(null, null);
            $(this).removeClass('filled');
        });

        //Check all
        $('.group-search .advanced-select .parent-check input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('ul');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find('input[type=checkbox]').prop("checked", false);
            }
        });

        //sub with parent
        $('.group-search .advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('li.has-sub');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find(' input[type=checkbox]').prop("checked", false);
            }
        });

        //Serching
        $('.group-search .advanced-select .q').on('keyup', function () {
            var input, filter, ul, li, a, i;
            input = $(this);
            filter = $.trim(input.val().toLowerCase());
            var div = input.parents('.dropdown').find('.dropdown-menu');
            div.find("li:not(.skip-li)").each(function () {
                var $this = $(this).find('label');
                if ($this.text().toLowerCase().indexOf(filter) > -1) {
                    $this.parents('li').show();
                } else {
                    $this.parents('li').hide()
                }
            })
        });

        //Count
        $('.group-search .advanced-select .x-check input[type=checkbox]').on('change', function () {
            var $control = $(this).parents('.advanced-select');
            var model = $control.data('model');
            var $input = $control.find('.trigger');
            var default_val = $input.attr('data-default');
            var checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;
            if (checked === 1) {
                $input.val($control.find('.x-check:not(.parent-check) input[type=checkbox]:checked + label').text());
                $control.addClass('choosen');
            } else if (checked > 0) {
                $control.addClass('choosen');
                if (checked > 1) {
                    $input.val(checked + ' ' + model);
                }
            } else {
                $input.val(default_val);
                $control.removeClass('choosen');
            }
        });

        //Count on ready
        $('.group-search .advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');

        //Prevent dropdown to close
        $('.group-search .advanced-select .dropdown').on('hide.bs.dropdown', function () {
            return false;
        });

        $('.group-search .advanced-select .x-clear').click(function () {
            var $this = $(this);
            $this.parents('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', false).trigger('change');

        });

        //Close dropdown to click outside
        $('body').on('click', function (e) {
            var $target = $(e.target);
            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });

        $('.group-search .advanced-select .trigger').on('click', function () {
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
            } else {
                $('.advanced-select .dropdown.open').removeClass('open');
                $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
            }
        });

        //Toggle sub items
        $('.group-search .advanced-select li.has-sub .toggle-sub').on('click', function (e) {
            var $this = $(this);
            var $icon = $this.find('.x-arrow');
            var $ul = $this.next('.sub-items');
            $ul.slideToggle();
            $this.parents('.dropdown').addClass('open');
            if ($icon.hasClass('x-arrow-down')) {
                $icon.removeClass('x-arrow-down');
                $icon.addClass('x-arrow-up');
            } else {
                $icon.removeClass('x-arrow-up');
                $icon.addClass('x-arrow-down');
            }
        });
    }

    render() {
        return (
            <div className="sassy-l grey_filter">
                <div>
                    <div className="group-search">
                        <div className="group-search-flex">
                            <label className="sassy-label">Filter by:</label>
                            <span className="sassy-search">
                                <input className="form-control" name="keywords" id="keywords" placeholder="Search" defaultValue="" />
                                <input type="submit" className="searh-btn" />
                            </span>
                            <div className="filter-list-date-sec sassy-datepicker">
                                <div className="group-datepicker">
                                    <input type="text" name="timestamp" id="filter-datepicker" placeholder="Timestamp" defaultValue="" /><b className="caret" />
                                </div>
                            </div>
                            <span className="select-sassy-wrapper">
                                <div className="advanced-select" data-model="Supplier_Buyer">
                                    <div className="dropdown">
                                        <input id="Supplier_Buyer" type="button" data-default="Supplier" defaultValue="Supplier" className="trigger" /><a href="#" className="btn-toggle" data-toggle="dropdown"> <b className="caret" /></a>
                                        <a href="#" className="x-clear"><i className="fa fa-times-circle" /></a>
                                        <ul className="dropdown-menu">
                                            <li className="skip-li"><input type="text" className="q" placeholder="Search Supplier" /></li>
                                            <li><a className="x-check parent-check" href="#"><input type="checkbox" name="Supplier_Buyer_all" id="Supplier_Buyer_all" /><label htmlFor="Supplier_Buyer_all"> Select All</label></a></li>
                                            {
                                                this.props.suppliers.map((supplier, index) => {
                                                    return (
                                                        <li key={index}><a className="x-check" href="#"><input type="checkbox" name={'Supplier_Buyer_' + index} id={'Supplier_Buyer_' + index} data-supplier-id={supplier.ID} /><label htmlFor={'Supplier_Buyer_' + index}> {supplier.DisplayName} </label></a></li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </span>
                            <input type="submit" className="btn btn-sassy" value="Apply" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = FilterComponent;