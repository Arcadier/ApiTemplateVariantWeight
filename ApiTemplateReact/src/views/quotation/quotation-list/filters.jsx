'use strict';

const React = require('react');
var BaseComponent = require('../../shared/base');

if (typeof window !== 'undefined') { var $ = window.$; }

class QuotationListFilterComponent extends BaseComponent {
    applyFilter() {
        const self = this;
        let filters = {
            keywords: $('#keywords').val(),
            isAccepted: $('#status_1').is(':checked') ? true : null,
            isPending: $('#status_2').is(':checked') ? true : null,
            isCancelled: $('#status_3').is(':checked') ? true : null,
            isDeclined: $('#status_4').is(':checked') ? true : null,
            itemsPerPage: $('#per-page').val(),
        };
        self.props.filterQuotations(filters);
    }

    handleKeyDown(event) {
        if (event.which == 13 || event.keyCode == 13) {
            this.applyFilter();
            return false;
        }

        return true;
    }

    componentDidMount() {
        $(document).ready(function () {

            /* Advanced select */
            //Check all
            $('.advanced-select .parent-check input[type=checkbox]').on('change', function (e) {
                var $this = $(this);
                var $ul = $this.parents('ul');
                if ($this.is(":checked")) {
                    $ul.find('input[type=checkbox]').prop("checked", true);
                } else {
                    $ul.find('input[type=checkbox]').prop("checked", false);
                }
            });

            //sub with parent
            $('.advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {
                var $this = $(this);
                var $ul = $this.parents('li.has-sub');
                if ($this.is(":checked")) {
                    $ul.find('input[type=checkbox]').prop("checked", true);
                } else {
                    $ul.find(' input[type=checkbox]').prop("checked", false);
                }
            });

            //Serching
            $('.advanced-select .q').on('keyup', function () {
                var input, filter, ul, li, a, i, div;
                input = $(this);
                filter = $.trim(input.val().toLowerCase());
                div = input.parents('.dropdown').find('.dropdown-menu');
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
            $('.advanced-select .x-check input[type=checkbox]').on('change', function () {
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
            $('.advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');

            //Prevent dropdown to close
            $('.advanced-select .dropdown').on('hide.bs.dropdown', function () {
                return false;
            });

            $('.advanced-select .x-clear').click(function () {
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

            $('.advanced-select .trigger').on('click', function () {
                if ($(this).parent().hasClass('open')) {
                    $(this).parent().removeClass('open');
                } else {
                    $('.advanced-select .dropdown.open').removeClass('open');
                    $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
                }
            });

            //Toggle sub items
            $('.advanced-select li.has-sub .toggle-sub').on('click', function (e) {
                var $this = $(this);
                //$this.parents('.dropdown').addClass('open--');
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
            /* Advanced select */
        });
    }

    componentDidUpdate() {
        var selectedCount = $('.advanced-select .x-check:not(.parent-check) input[type=checkbox]:checked').length;
        var model = $('.advanced-select').data('model');

        if (selectedCount > 0) {
            if (selectedCount > 1) {
                $('.advanced-select').find('.trigger').val(selectedCount + ' ' + model);
            } else {
                $('.advanced-select').find('.trigger').val($('.advanced-select .x-check:not(.parent-check) input[type=checkbox]:checked + label').text());
            }
        } else {
            $('.advanced-select').find('.trigger').val($('.advanced-select').find('.trigger').data('default'));
        }
    }

    render() {
        const self = this;
        return (
            <div className="sassy-flex">
                <div className="sassy-l">
                    <div>
                        <div className="group-search">
                            <div className="group-search-flex">
                                <label className="sassy-label">Filter by:</label>
                                <span className="sassy-search">
                                    <input className="form-control" name="keywords" id="keywords" placeholder="Keywords" onKeyDown={(e) => this.handleKeyDown(e)} />
                                    <input type="button" className="searh-btn" onClick={() => self.applyFilter()} />
                                </span>
                                <span className="select-sassy-wrapper right">
                                    <div className="advanced-select" data-model="Status Selected">
                                        <div className="dropdown">
                                            <input id="status" type="button" data-default="Status" value="Status" className="trigger" />
                                            <a href="#" className="btn-toggle" data-toggle="dropdown" aria-expanded="true"><b className="caret"></b></a>
                                            <a href="#" className="x-clear"><i className="fa  fa-times-circle"></i></a>
                                            <ul className="dropdown-menu">
                                                <li className="skip-li"><input type="text" className="q" placeholder="Search Status" /></li>
                                                <li><a className="x-check parent-check" href="#"><input type="checkbox" name="status_0" id="status_0" /><label htmlFor="status_0"> Select All</label></a></li>
                                                <li><a className="x-check" href="#"><input type="checkbox" name="status_1" id="status_1" /><label htmlFor="status_1"> Approved</label></a></li>
                                                <li><a className="x-check" href="#"><input type="checkbox" name="status_2" id="status_2" /><label htmlFor="status_2"> Pending</label></a></li>
                                                <li><a className="x-check" href="#"><input type="checkbox" name="status_3" id="status_3" /><label htmlFor="status_3"> Cancelled</label></a></li>
                                                <li><a className="x-check" href="#"><input type="checkbox" name="status_4" id="status_4" /><label htmlFor="status_4"> Declined</label></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </span>
                                <input type="button" className="btn btn-sassy" value="Apply" onClick={() => self.applyFilter()} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sassy-r">
                    <span className="select-sassy-wrapper sassy-arrow right">
                        <select name="per-page" id="per-page" className="sassy-select" defaultValue={'20'}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </span>
                    <label className="sassy-label">Items per page</label>
                </div>
            </div>
        );
    }
}

module.exports = QuotationListFilterComponent;