'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');

class ModalCreateComponent extends BaseComponent {
    componentDidMount() {
        //$("#filterApplyIcon").on("click", function () {
        //    $("#modalHavePO").modal("show");
        //});

        //$("#poSubmit").on("click", function () {
        //    if ($(".noPOpart input:checkbox").is(':checked')) {
        //        window.location.href = "create-goods-receipt-no-po.html";
        //    }
        //    if ($('#modalHavePO .advanced-select #metric_affected').val().length) {
        //        window.location.href = "create-goods-receipt.html";
        //    }
        //});

        //Check all       
        $('#modalHavePO .advanced-select .parent-check input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('ul');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find('input[type=checkbox]').prop("checked", false);
            }
        });

        //sub with parent        
        $('#modalHavePO .advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('li.has-sub');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find(' input[type=checkbox]').prop("checked", false);
            }
        });

        //Serching        
        $('#modalHavePO .advanced-select .q').on('keyup', function () {
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
        $('#modalHavePO .advanced-select .x-check input[type=checkbox]').on('change', function () {
            var $control = $(this).parents('.advanced-select');
            var model = $control.data('model');
            var $input = $control.find('.form-control:eq(0)');
            var default_val = $input.attr('data-default');
            var checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;
            $(".advanced-select .x-check input[type=checkbox]:checked").prop("checked", false);
            $(this).prop("checked", true);
            if (checked) {
                $input.val($control.find('.x-check input[type=checkbox]:checked + label').text());
                $control.addClass('choosen');
                $('#modalHavePO .advanced-select .dropdown').removeClass('open');
            } else {
                $input.val(default_val);
                $control.removeClass('choosen');
            }
        });

        //Count on ready        
        //$('#modalHavePO .advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');

        //Prevent dropdown to close        
        $('#modalHavePO .advanced-select .dropdown').on('hide.bs.dropdown', function () {
            return false;
        });

        $('#modalHavePO .advanced-select .x-clear').click(function () {
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

        $('#modalHavePO .advanced-select input[type=text]').focusin(function () {
            $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
        });

        $("#modalHavePO").on("hide.bs.modal", function () {
            $("#metric_affected").val('');
        });
    }

    createReceipt() {
        const orderNo = $('#metric_affected').val().trim();
        //ARC10131
        if (orderNo) {
            const order = this.props.orders.find(o => o.PurchaseOrderNo == orderNo);

            if (order) {
                return window.location = '/receiving-note/create?id=' + order.ID;
            } else {
                let po = this.props.orders.find(o => o.CosmeticNo == orderNo);

                if (po)
                    return window.location = '/receiving-note/create?id=' + po.ID;
                else
                    $('.po-exist').show();
            }
        }

        $('.po-exist').show();
    }

    render() {
        return (
            <div id="modalHavePO" className="filter-modal modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                <div className="modal-dialog compare-delete-modal-content">
                    <div className="modal-content"> <i className="fas fa-times" data-dismiss="modal" />
                        <div className="modal-body">
                            <p align="left">Select the PO No.</p>
                            <span className="select-sassy-wrapper" id="po_no-container">
                                <div className="advanced-select" data-model="P.O. Number">
                                    <div className="dropdown">
                                        <input id="metric_affected" name="metric_affected" type="text" placeholder="PO Number" data-default="" defaultValue="" className="form-control sassy-control po-number" autoComplete="off" />
                                        <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret" /></a>
                                        <a href="#" className="x-clear"><i className="fa  fa-times-circle" /></a>
                                        <ul className="dropdown-menu">
                                            <li className="skip-li"><input type="text" className="q" placeholder="Search P.O. Number" /></li>
                                            {
                                                this.props.orders.map((order, index) => {
                                                    return (
                                                        <li key={index}><a className="x-check" href="#"><input type="checkbox" name={order.PurchaseOrderNo} id={'po_' + index} /><label htmlFor={'po_' + index}> {order.CosmeticNo != null && order.CosmeticNo != "" ? order.CosmeticNo : order.PurchaseOrderNo}</label></a></li>   
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </span>
                            <div>
                                <div className="po-warning">
                                    <span className="po-exist" style={{ display: 'none' }}>PO number does not exist</span>
                                    <span className="po-not-belong" style={{ display: 'none' }}>PO number does not belong to this main account</span>
                                </div>
                                <div className="clearfix" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="btn-gray btn-gray-border" data-dismiss="modal">Cancel</div>
                            <div className="btn-blue" id="poSubmit" onClick={(e) => this.createReceipt()}>Yes</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalCreateComponent;