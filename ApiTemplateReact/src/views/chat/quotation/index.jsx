'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const Moment = require('moment');
const Currency = require('currency-symbol-map');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../layouts/header').HeaderLayoutComponent;
const ChatQuotationPriceComponent = require('../quotation/price');
require('daterangepicker');

const ChatActions = require('../../../redux/chatActions');

const DiscountReasons = ['Early Payment', 'Quantity Discount', 'Pricing Discount', 'Volume Discount', 'Agreed Discount', 'Others'];
const ChargeReasons = ['Bank Charges', 'Custom Duties', 'Taxes', 'Late Delivery', 'Freight Costs', 'Price Change', 'Others'];
const QuantityOptions = ['Fixed', 'Percentage'];
var toastr = require('toastr');

const PermissionTooltip = require('../../common/permission-tooltip');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class ChatQuotationComponent extends BaseComponent {
    constructor(props) {
        super(props);

        const discountQuotation = {
            type: 'Discount',
            description: DiscountReasons[0],
            reason: DiscountReasons[0],
            quantity: 'Fixed',
            price: '0',
            total: 0
        };
        const chargeQuotation = {
            type: 'Charge',
            description: ChargeReasons[0],
            reason: ChargeReasons[0],
            quantity: '1',
            price: '0',
            total: 0
        };
        const initialQuotation = Object.assign({}, discountQuotation, { id: '' });
        const cartItem = props.chatDetail.Channel.CartItemDetail;
        var subTotal = cartItem.SubTotal

        if (this.isSpaceTimeApiTemplate()) {

            var addons = 0;

            this.props.chatDetail.Channel.CartItemDetail.AddOns.filter(d => d.Active == true).forEach(d => {
                addons += d.PriceChange;
            })

            subTotal = cartItem.SubTotal + addons;
        }

        var bookingSlot = null;

        if (this.isSpaceTimeApiTemplate()) {

            bookingSlot = cartItem.BookingSlot
            //var bookingTime = (this.formatDateTime(bookingSlot.FromDateTime, "hh:mm A"))
            //bookingSlot.FromDateTime = this.formatDate(bookingSlot.FromDateTime);
        }

        const item = {
            name: cartItem.ItemDetail.Name,
            description: cartItem.ItemDetail.BuyerDescription,
            quantity: this.isSpaceTimeApiTemplate() ? cartItem.BookingSlot.Duration : cartItem.Quantity,
            price: (cartItem.ItemDetail.Price || 0).toString(),
            total: subTotal.toFixed(2),
            variants: cartItem.ItemDetail.Variants,
            bookingSlot: this.isSpaceTimeApiTemplate() ? bookingSlot : null,
            addOns: this.isSpaceTimeApiTemplate() ? cartItem.AddOns : null
        };

        const paymentTerms = props.paymentTerms;
        const defaultPaymentTerm = paymentTerms && paymentTerms.length > 0 ? paymentTerms.find(p => p.Default == true) : null;

        this.state = {
            discountQuotation: discountQuotation,
            chargeQuotation: chargeQuotation,
            quotations: [initialQuotation],
            item: item,
            issueDate: Moment().local().format(process.env.DATE_FORMAT),
            validDate: '',
            paymentTerm: defaultPaymentTerm,
            isProcessing: false
        };

        this.childRef = React.createRef();
    }

    getAddOns() {
        var self = this;
        var addons = 0;
        if (this.isSpaceTimeApiTemplate()) {

            self.state.item.addOns.filter(d => d.Active == true).forEach(d => {
                addons += d.PriceChange;
            })
        }

        return addons
    }

    componentDidMount() {
        const self = this;


        $('#booking_date').datetimepicker({
            format: process.env.DATE_FORMAT,
        }).keypress(function (event) {
            // event.preventDefault();
        }).on("dp.change", function (e) {
            self.calculateSubTotalInModal()
        });;

        $('.time-picker').timepicker({
            'step': 15,
            'timeFormat': 'h:i A'
        }).keypress(function (event) {
            self.calculateSubTotalInModal()
            // event.preventDefault();
        }).on('changeTime', function () {
            self.calculateSubTotalInModal()
        });;


        $('#valid-datepicker').daterangepicker({
            opens: 'right',
            autoUpdateInput: false,
            locale: {
                format: process.env.DATE_FORMAT,
                cancelLabel: 'Clear'
            }
        });

        $('#valid-datepicker').on('apply.daterangepicker', (event, picker) => {
            const dateRange = picker.startDate.format(process.env.DATE_FORMAT) + ' - ' + picker.endDate.format(process.env.DATE_FORMAT);
            $('#valid-datepicker').val(picker.startDate.format(process.env.DATE_FORMAT) + ' - ' + picker.endDate.format(process.env.DATE_FORMAT));

            self.changeValidDate(dateRange);
        });

        $('#valid-datepicker').on('cancel.daterangepicker', (event, picker) => {
            $('#valid-datepicker').val('');

            self.changeValidDate('');
        });

        let { quotations } = this.state;
        quotations.forEach((quotation) => {
            quotation.id = new Date().getTime();
        });

        this.setState({
            quotations: quotations
        });


        if (self.isSpaceTimeApiTemplate()) {
            var bookingSlot = self.props.chatDetail.Channel.CartItemDetail.BookingSlot
            var bookingTime = (self.rawFormatTime(bookingSlot.FromDateTime, "hh:mm A"))
            $('#booking_date').val(self.rawFormatDate(bookingSlot.FromDateTime, process.env.DATE_FORMAT))
            $('#booking_time').val(bookingTime)
            $('#booking_hours').val(bookingSlot.Duration)
            $('#unit_textbox').val(self.props.chatDetail.Channel.CartItemDetail.Quantity)
            self.calculateSubTotalInModal();
        }
    }

    isSpaceTimeApiTemplate() {
        var self = this;
        return typeof self.props.chatDetail.Channel.CartItemDetail.BookingSlot != 'undefined' && self.props.chatDetail.Channel.CartItemDetail.BookingSlot != null;
    }

    addQuotation(event) {
        event.preventDefault();
        const self = this;

        this.props.validatePermissionToPerformAction("add-merchant-create-quotation-api", () => {
            let { chargeQuotation, quotations } = self.state;
            const newQuotation = Object.assign({}, chargeQuotation, {
                id: new Date().getTime()
            });

            quotations.push(newQuotation);

            self.setState({
                quotations: quotations
            });
        });
    }

    changeDescription(id, event) {
        event.preventDefault();

        let { quotations } = this.state;
        let quotation = quotations.find(q => q.id == id);

        if (quotation) {
            quotation.description = event.target.value;

            this.setState({
                quotations: quotations
            });
        }
    }

    changePaymentTerm(id) {
        const { paymentTerms } = this.props;
        const paymentTerm = paymentTerms.find(p => p.ID == id);

        this.setState({
            paymentTerm: paymentTerm || null
        });
    }

    changePrice(id, event) {
        event.preventDefault();

        function validate(value) {
            value = value.replace(/[^\x20-\xFF]/gi, '').replace(/[^0-9\.]/g, '');

            let array = value.split('.').slice(0, 2);

            if (array.length < 2) {
                value = value ? Number(value).toString() : '';
            } else {
                array[0] = Number(array[0]);

                if (array[1].length > 2) {
                    array[1] = array[1].substr(0, 2);
                }

                value = array.join('.');
            }

            return value;
        }

        const self = this;
        let { quotations } = this.state;
        let quotation = quotations.find(q => q.id == id);

        if (quotation) {
            quotation.price = validate(event.target.value).toString();

            this.setState({
                quotations: quotations
            }, self.updateTotals());
        }
    }

    changeQuantity(id, event) {
        event.preventDefault();

        function validate(value) {
            return value.replace(/[^0-9]/g, '');
        }

        const self = this;
        let { item, quotations } = this.state;
        let value = event.target.value;

        if (event.target.tagName.toLowerCase() == 'input') {
            value = validate(value);
        }

        if (!id) {

            item.quantity = value ? Number(value).toString() : '';

            this.setState({
                item: item
            }, self.updateTotals());

        } else {
            let quotation = quotations.find(q => q.id == id);

            if (quotation) {
                if (quotation.type.toLowerCase() == 'discount') {
                    quotation.quantity = value;
                } else {
                    quotation.quantity = value ? Number(value).toString() : '';
                }

                this.setState({
                    quotations: quotations
                }, self.updateTotals());
            }
        }
    }

    changeReason(id, event) {
        event.preventDefault();

        let { quotations } = this.state;
        let quotation = quotations.find(q => q.id == id);

        if (quotation) {
            quotation.reason = event.target.value;

            this.setState({
                quotations: quotations
            });
        }
    }

    changeType(id, type) {
        let { chargeQuotation, discountQuotation, quotations } = this.state;

        quotations.forEach((quotation) => {
            if (quotation.id == id) {
                if (type.toLowerCase() == 'discount') {
                    quotation = Object.assign(quotation, discountQuotation);
                } else {
                    quotation = Object.assign(quotation, chargeQuotation);
                }
            }
        });

        this.setState({
            quotations: quotations
        });
    }

    changeValidDate(value) {
        this.setState({
            validDate: value
        });
    }

    deleteQuotation(id, event) {
        event.preventDefault();

        const self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-create-quotation-api", () => {
            let { quotations } = self.state;

            self.setState({
                quotations: quotations.filter(q => q.id != id)
            }, self.updateTotals());
        });
    }

    updateTotals() {
        const self = this;

        let { item, quotations } = this.state;
        const quantity = item.quantity || 0;

        if (!self.isSpaceTimeApiTemplate()) {
            item.total = (quantity * parseFloat(item.price) + self.getAddOns()).toFixed(2);
        }

        quotations.forEach((quotation) => {
            if (quotation.type.toLowerCase() == 'discount') {
                const price = parseFloat(quotation.price) || 0;

                if (quotation.quantity.toLowerCase() == 'fixed') {
                    quotation.total = price;
                } else {
                    quotation.total = parseFloat((item.total * (price / 100)).toFixed(2));
                }
            } else {
                const quantity = Number(quotation.quantity) || 0;
                const price = parseFloat(quotation.price) || 0;

                quotation.total = parseFloat((quantity * price).toFixed(2));
            }
        });

        this.setState({
            item: item,
            quotations: quotations
        });
    }

    renderDescriptionAndVariants(description, variants) {
        return (
            <div>
                <div><strong>{description}</strong></div>
                {
                    variants.map((variant, index) => {
                        return (
                            <div key={index}>{variant.GroupName}: {variant.Name}</div>
                        )
                    })
                }
            </div>
        );
    }

    doEditBooking() {

        var self = this;
        var chatDetail = self.props.chatDetail;
        var itemDetail = self.props.chatDetail.Channel.ItemDetail;
        const { CartItemDetail } = self.props.chatDetail.Channel



        $('.error-con').removeClass('error-con')

        if ($('#booking_date').val().length < 1 || $('#booking_subtotal').val().length < 1 ||
            $('#booking_hours').val().length < 1 || $('#booking_time').val().length < 1 ||
            $('#unit_textbox').val().length < 1 || $('#unit_textbox').val().length < 1
        ) {

            if ($('#booking_date').val().length < 1)
                $('#booking_date').addClass('error-con')

            if ($('#booking_subtotal').val().length < 1)
                $('#booking_subtotal').addClass('error-con')

            if ($('#booking_hours').val().length < 1)
                $('#booking_hours').addClass('error-con')

            if ($('#booking_time').val().length < 1)
                $('#booking_time').addClass('error-con')

            if ($('#unit_textbox').val().length < 1)
                $('#unit_textbox').addClass('error-con')

            toastr.error("Please fill up required fields.", "Oops!");
            return
        }



        var addons = [];
        $('.add-ons-modal-container:checkbox:checked').each(function (e) {
            var tempAddon = itemDetail.AddOns.filter(d => d.ID == $(this).attr('data-id'));
            addons.push(tempAddon[0])
        })



        var { ItemDetail } = CartItemDetail
        const durationUnit = ItemDetail.DurationUnit;
        var durationCount = $('#booking_hours').val();
        var increment = durationUnit.match(/\d+/) ? durationUnit.match(/\d+/)[0] : 1;
        var selectedEndDateTime = Moment.utc($('#booking_date').val() + ' ' + $('#booking_time').val(), process.env.DATE_FORMAT + ' hh:mm a');

        if (durationUnit !== '' && typeof durationUnit !== 'undefined') {

            var tempDurationUnit = durationUnit.toLowerCase()

            if (tempDurationUnit.includes('hour')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'h')
            } else if (tempDurationUnit.includes('minute')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'm')
            } else if (tempDurationUnit.includes('day')) {
                selectedEndDateTime = selectedEndDateTime.add((durationCount * increment) - 1, 'd');
            } else if (tempDurationUnit.includes('night')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'd');
            } else if (tempDurationUnit.includes('week')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'w').subtract(1, 'd');
            } else if (tempDurationUnit.includes('month')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'M').subtract(1, 'd');
            }
        }

        const bookingSlot = {
            CartItemID: chatDetail.Channel.CartItemDetail.ID,
            SubTotal: parseFloat($('#booking_subtotal').val()),
            Quantity: $('#unit_textbox').val(),
            BookingSlot: JSON.stringify({
                FromDateTime: Moment.utc($('#booking_date').val() + ' ' + $('#booking_time').val(), process.env.DATE_FORMAT + ' hh:mm a').unix(),
                ToDateTime: selectedEndDateTime.unix(),
                Duration: $('#booking_hours').val()
            }),
            AddOns: JSON.stringify(addons)
        };

        // update the state only.
        self.setState({
            item: {
                ...self.state.item,
                total: parseFloat($('#booking_subtotal').val()).toFixed(2),
                quantity: $('#unit_textbox').val(),
                bookingSlot: {
                    ...self.state.item.bookingSlot,
                    FromDateTime: Moment.utc($('#booking_date').val() + ' ' + $('#booking_time').val(), process.env.DATE_FORMAT + ' hh:mm a').unix(),
                    ToDateTime: selectedEndDateTime.unix(),
                    Duration: $('#booking_hours').val()
                },
                addOns: addons
            }
        }, function () {
            $('.close-modal-button').click()
        })
    }

    renderAddons() {

        var self = this;

        if (self.isSpaceTimeApiTemplate()) {
            var cartItemDetail = self.props.chatDetail.Channel.CartItemDetail;
            var bookingSlot = self.props.chatDetail.Channel.CartItemDetail.BookingSlot
            const { CurrencyCode } = self.props.chatDetail.Channel.CartItemDetail.ItemDetail;

            var self = this;
            if (self.state.item.addOns) {
                var addons = self.state.item.addOns.filter(d => d.Active == true);

                return (
                    <span className="if-txt" test="test">
                        <span>Add-ons:</span>
                        <span>
                            {
                                addons.map(function (e) {
                                    return (<div>{e.Name} +{CurrencyCode} {Currency(CurrencyCode)}{e.PriceChange}</div>)
                                })
                            }
                        </span>
                    </span>
                )
            }
        }
    }

    displayModalEditBooking(e) {
        var self = this;

        $('.edit-booking-modal').modal('show');
    }

    renderEditBooking() {
        var self = this;

        if (self.isSpaceTimeApiTemplate()) {
            return (<p><a className="edit-booking" onClick={(e) => this.displayModalEditBooking(e)} href="javascript:void(0)">Edit Booking</a></p>)
        }
    }

    canRenderTimeInfo() {
        var self = this;
        var tempDurationUnit = self.props.chatDetail.Channel.CartItemDetail.ItemDetail.DurationUnit.toLowerCase()

        if (tempDurationUnit.includes('hour') || tempDurationUnit.includes('minute')) {
            return true;
        }
        else {
            return false
        }
    }

    renderItem() {

        var self = this;
        const { name, description, quantity, price, total, variants } = this.state.item;
        const subTotal = total;
        const isServiceLevel = process.env.PRICING_TYPE == 'service_level';


        function renderTableData() {
            if (self.isSpaceTimeApiTemplate()) {
                return (<React.Fragment>
                    <td className="col-qty">
                    </td>
                    <td className="col-ppu">
                    </td>
                </React.Fragment>)
            }
            else {
                return (<React.Fragment>
                    <td className="col-qty">
                        <input id="quantity" className="optional-input required" type="text" value={quantity} onChange={(e) => self.changeQuantity(null, e)} />
                    </td>
                    <td className="col-ppu">
                        <span id="price_amt" className="renderTableData">{isServiceLevel ? subTotal : price}</span>
                    </td>
                </React.Fragment>
                )
            }
        }

        function renderTimeInfo(bookingSlot) {
            var self = this;
            var tempDurationUnit = self.props.chatDetail.Channel.CartItemDetail.ItemDetail.DurationUnit.toLowerCase()
            
            if (tempDurationUnit.includes('hour') || tempDurationUnit.includes('minute')) {
                return `<p className='description-row'><span className='row-label'>Time:</span> <span className='row-value'>${self.formatTime(bookingSlot.FromDateTime)} to ${self.formatTime(bookingSlot.ToDateTime)}</span></p>`
            }
            else {
                return ''
            }
        }


        function renderCartItemDetails() {

            if (self.isSpaceTimeApiTemplate()) {
                var strintBuilder = [];
                var bookingSlot = self.state.item.bookingSlot
                var { ItemDetail } = self.props.chatDetail.Channel.CartItemDetail;

                strintBuilder.push(`<br/>`)
                strintBuilder.push(`<p className='description-row'><span className='row-label'>Date:</span> <span className-value'>${self.rawFormatDate(bookingSlot.FromDateTime)} to ${self.rawFormatDate(bookingSlot.ToDateTime)}</span></p>`)

                if (self.canShowTime(ItemDetail)) {
                    strintBuilder.push(`<p className='description-row'><span className='row-label'>Time:</span> <span className='row-value'>${self.rawFormatTime(bookingSlot.FromDateTime)} to ${self.rawFormatTime(bookingSlot.ToDateTime)}</span></p>`)
                }

                if (self.canShowDuration(ItemDetail)) {
                    strintBuilder.push(`<p className='description-row'><span className='row-label'>No of ${self.fetchDurationStr(ItemDetail)}:</span> <span className='row-value'>${bookingSlot.Duration}</span></p>`)
                }

                if (self.canShowUnit(ItemDetail)) {
                    strintBuilder.push(`<p className='description-row'><span className='row-label'>No of ${self.fetchUnitStr(ItemDetail)}:</span> <span className='row-value'>${self.props.chatDetail.Channel.CartItemDetail.Quantity}</span></p>`)
                }

                return strintBuilder.join('').toString()
            }
        }

        return (
            <tr id="item">
                <td className="col-type">
                    {/* {name} */}
                    Item
                </td>
                <td className="col-desc">
                    {/* {(variants !== null && variants.length > 0)
                        ? this.renderDescriptionAndVariants(description, variants)
                        : description
                    } */}
                    {name}
                    <div dangerouslySetInnerHTML={{ __html: renderCartItemDetails() }} />
                    {self.renderAddons()}
                    {self.renderEditBooking()}
                </td>
                {renderTableData()}
                <td className="total-com col-total">
                    <span id="price_amt" className="main-renderItem">{subTotal}</span>
                </td>
                <td className="col-empty" />
            </tr>
        );
    }

    renderPaymentTerms() {

        if (this.isSpaceTimeApiTemplate())
            return ''

        const { paymentTerm } = this.state;
        const value = paymentTerm ? paymentTerm.ID : '';

        return (
            <div className="dd-payment-terms">
                <span className="title">Payment Terms</span><br />
                <div className="select-wrapper">
                    <select name="payment-terms" id="payment-terms" className="required" value={value} onChange={(e) => this.changePaymentTerm(e.target.value)}>
                        <option value={''}>Select Settlement Terms</option>
                        {
                            this.props.paymentTerms.map((paymentTerm, index) => {
                                return (
                                    <option key={index} value={paymentTerm.ID}>{paymentTerm.Name + ' - ' + paymentTerm.Description}</option>
                                )
                            })
                        }
                    </select>
                    <i className="fa fa-angle-down" />
                </div>
            </div>
        );
    }

    renderQuotation(quotation) {
        var self = this;
        const { id, type, description, reason, quantity, price, total } = quotation;

        function renderTableData() {
            return (
                <React.Fragment>
                    <td className="col-qty">
                        {self.renderQuotationQuantity(id, type, quantity)}
                    </td>
                    <td className="col-ppu">
                        <input id={'price-' + id} maxLength={quantity.toLowerCase() == 'percentage' ? '3' : '999999'} className="per-unit required" type="text" value={price} onChange={(e) => self.changePrice(id, e)} />
                    </td>
                </React.Fragment>
            )
        }

        return (
            <tr id={'quotation-' + id} key={id}>
                <td className="col-type">
                    <div className="tbl-select">
                        <select id={'type-' + id} value={type} onChange={(e) => this.changeType(id, e.target.value)}>
                            <option value="Charge">Charge</option>
                            <option value="Discount">Discount</option>
                        </select>
                        <i className="fa fa-angle-down" />
                    </div>
                </td>
                <td className="col-desc">
                    <input className="optional-input required" type="text" id={"description-" + id} value={description} onChange={(e) => this.changeDescription(id, e)} />
                    <div className="tbl-select">
                        <select id={'reason-' + id} value={reason} onChange={(e) => this.changeReason(id, e)}>
                            {this.renderQuotationReasons(type)}
                        </select>
                        <i className="fa fa-angle-down" />
                    </div>
                </td>
                {
                    renderTableData()
                }
                <td className="total-com col-total">
                    <span id={'total-' + id}>{total}</span>
                </td>
                <td className="col-empty">
                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                        <a href="#" id={'delete-' + id} onClick={(e) => this.deleteQuotation(id, e)}><i className="btn-delete" /></a>
                    </PermissionTooltip>
                </td>
            </tr>
        );
    }

    renderQuotationQuantity(id, type, value) {
        if (type.toLowerCase() == 'discount') {
            return (
                <div className="tbl-select">
                    <select id={'quantity-' + id} data-id={id} className="discountOption" style={{ display: 'inline-block' }} value={value} onChange={(e) => this.changeQuantity(id, e)}>
                        {
                            QuantityOptions.map((option) => {
                                return (
                                    <option className="QuantityOptions" key={option} value={option}>{option}</option>
                                )
                            })
                        }
                    </select>
                    <i className="fa fa-angle-down for-discount" style={{ display: 'inline-block' }} />
                </div>
            );
        }

        return (
            <input id={'quantity-' + id} className="quantity required" type="text" style={{ display: 'inline-block' }} value={value} onChange={(e) => this.changeQuantity(id, e)} />
        );
    }

    renderQuotationReasons(type) {
        if (type.toLowerCase() == 'discount') {
            return (
                DiscountReasons.map((reason, index) => {
                    return (
                        <option key={index} value={reason}>{reason}</option>
                    )
                })
            );
        }

        return (
            ChargeReasons.map((reason, index) => {
                return (
                    <option key={index} value={reason}>{reason}</option>
                )
            })
        );
    }

    renderItemAddons(id) {

        var self = this
        var itemDetail = self.props.chatDetail.Channel.ItemDetail;
        var cartItemDetail = self.props.chatDetail.Channel.CartItemDetail
        const { CurrencyCode } = self.props.chatDetail.Channel.CartItemDetail.ItemDetail;

        function wasAddonSelected(id) {
            var result = false;

            if (self.state.item.addOns && self.state.item.addOns.length > 0) {
                result = typeof self.state.item.addOns.find(d => d.ID == id) != 'undefined';
            }

            return result;
        }

        if (this.isSpaceTimeApiTemplate() == false)
            return ''


        if (itemDetail && itemDetail.AddOns && itemDetail.AddOns.length > 0) {
            
            return (<span className="idcrtl-right full-width relation order-radio">
                {
                    itemDetail.AddOns.filter(d => d.Active == true).map((addon) => {
                        return (<span className="radio">
                            <input type="checkbox" name={`add_ons_${addon.ID}`} data-price={addon.PriceChange} data-id={addon.ID} onClick={(e) => self.calculateSubTotalInModal(e)} data-value={addon.ID} className="add-ons-modal-container" id={`add_ons_${addon.ID}`} defaultChecked={wasAddonSelected(addon.ID)} />
                            <label htmlFor={`add_ons_${addon.ID}`}>
                                <span>{addon.Name}</span>
                                <span>+{CurrencyCode} {Currency(CurrencyCode)} {addon.PriceChange}</span>
                            </label>
                        </span>)
                    })
                }
            </span>
            )
        }
    }

    calculateSubTotalInModal() {
        var self = this;
        var itemDetail = self.props.chatDetail.Channel.ItemDetail
        var subtotal = 0.0;
        var addons = 0.0;

        //calcualte the addon
        $('.add-ons-modal-container:checkbox:checked').each(function (e) {
            addons = addons + parseFloat($(this).attr('data-price'))
        })


        if (itemDetail) {
            const self = this;
            const { CurrencyCode, Price, AddOns } = itemDetail;
            const durationCount = parseFloat($('#booking_hours').val() || 0);
            const unitCount = parseFloat($('#unit_textbox').val() || 0);

            if (this.canShowDuration(itemDetail)) {
                subtotal = durationCount;
            }
            if (this.canShowUnit(itemDetail)) {
                subtotal = subtotal > 0 ? subtotal * unitCount : unitCount;
            }

            if (subtotal > 0) {
                subtotal *= parseFloat(Price);
            }

            subtotal += addons;
            subtotal = parseFloat(subtotal).toFixed(2);

            //subtotal = (parseFloat($('#booking_hours').val()) * parseFloat(itemDetail.Price) + parseFloat(addons) + chargeTotalFloat - discountTotalFloat).toFixed(2);;

            if (!isNaN(subtotal)) {
                $('#booking_subtotal').val(subtotal)
            }
            else {
                $('#booking_subtotal').val()
            }


        }

        return subtotal;
    }

    render() {
        const self = this;
        const { categories, chatDetail, user } = this.props;
        const { issueDate, validDate, quotations } = this.state;
        const { ItemDetail } = self.props.chatDetail.Channel.CartItemDetail;

        function renderQuotationTableHeaders() {


            if (self.isSpaceTimeApiTemplate()) {
                return (
                    <React.Fragment>
                        <th className="col-type">Type</th>
                        <th className="col-desc">Description</th>
                        <th className="col-qty"></th>
                        <th className="col-ppu"></th>
                        <th className="col-total">Total</th>
                        <th className="col-empty" />
                    </React.Fragment>
                )
            }
            else {
                return (
                    <React.Fragment>
                        <th className="col-type">Type</th>
                        <th className="col-desc">Description</th>
                        <th className="col-qty">Qty</th>
                        <th className="col-ppu">Price per unit</th>
                        <th className="col-total">Total</th>
                        <th className="col-empty" />
                    </React.Fragment>
                )

            }
        }

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={categories} user={user} />
                </div>
                <div className="main footer_fixed" style={{ paddingTop: '122px' }}>
                    <div className="orderlist-container">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="nav-breadcrumb">
                                        <i className="fa fa-angle-left" /> <a href={'/chat?channelId=' + chatDetail.Channel.ChannelID}>Back</a>
                                    </div>
                                    <div className="quotation-container send-quotation clearfix" style={{ display: 'block' }}>
                                        <div className="flex-inline">
                                            <div className="quotation-date-issue">
                                                <span className="title">Issue date</span><br />
                                                <div className="group-datepicker">
                                                    <input type="text" id="issue-datepicker" defaultValue={issueDate} disabled="disabled" />
                                                </div>
                                            </div>
                                            <div className="quotation-date-valid">
                                                <span className="title">Valid date</span><br />
                                                <div className="group-datepicker">
                                                    <input type="text" id="valid-datepicker" className="required" value={validDate} onChange={(e) => this.changeValidDate(e.target.value)} />
                                                    <i className="fa fa-calendar" />
                                                </div>
                                            </div>
                                            {this.renderPaymentTerms()}
                                        </div>
                                        <div className="quotation-table">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        {
                                                            renderQuotationTableHeaders()
                                                        }
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.renderItem()
                                                    }
                                                    {
                                                        quotations.map((quotation) => {
                                                            return self.renderQuotation(quotation)
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                            <div className="new-line">
                                                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                                    <a href="#" className="top-title" id="added-newline" onClick={(e) => this.addQuotation(e)}><i className="fas fa-plus fa-fw" /> Add new line</a>
                                                </PermissionTooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ChatQuotationPriceComponent ref={this.childRef}  {...this.state} {...this.props} />
                            </div>
                        </div>
                    </div>
                </div>
                <div id="cover" style={{ zIndex: '9999999' }}></div>
                {/* Modal */}
                <div id="edit-booking-modal" className="edit-booking-modal modal fade" role="dialog">
                    <div className="modal-dialog">
                        {/* Modal content*/}
                        <div className="modal-content">
                            <div className="modal-header light-modal-header">
                                <button type="button" className="close" data-dismiss="modal">x</button>
                                <h4 className="modal-title">{this.props.chatDetail.Channel.CartItemDetail.ItemDetail.Name}</h4>
                            </div>
                            <div className="modal-body">
                                <div className="modal-form-group">
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <label className="control-label" htmlFor="booking_date">Date:</label>
                                        </div>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control booking_date date-picker " onChange={(e) => self.calculateSubTotalInModal(e)} id="booking_date" name="booking_date" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-form-group" style={{ display: self.canShowTime(ItemDetail) ? '' : 'none' }}>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <label className="control-label" htmlFor="booking_time">Time:</label>
                                        </div>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control booking_time time-picker " onChange={(e) => self.calculateSubTotalInModal(e)} id="booking_time" name="booking_time" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-form-group" style={{ display: self.canShowDuration(ItemDetail) ? '' : 'none' }}>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <label className="control-label" htmlFor="booking_hours">No. of {self.fetchDurationStr(ItemDetail)}:</label>
                                        </div>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control booking_hours numbersOnlyD " onChange={(e) => self.calculateSubTotalInModal(e)} id="booking_hours" name="booking_hours" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-form-group" style={{ display: self.canShowUnit(ItemDetail) ? '' : 'none' }}>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <label className="control-label" htmlFor="unit_textbox">No. of {self.fetchUnitStr(ItemDetail)}:</label>
                                        </div>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control unit_textbox numbersOnlyD" onChange={(e) => self.calculateSubTotalInModal(e)} id="unit_textbox" name="unit_textbox" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-form-group">
                                    <label className="control-label" >Select add-ons for your service</label>
                                    <div>
                                        {
                                            self.renderItemAddons()
                                        }
                                    </div>
                                </div>
                                <div className="modal-form-group">
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <label className="control-label" htmlFor="booking_subtotal">Subtotal:</label>
                                        </div>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control booking_subtotal numbersOnlyD" id="booking_subtotal" name="booking_subtotal" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div><button type="button" data-dismiss="modal" className="btn btn-grey close-modal-button">Cancel</button></div>
                                <div><button type="button" onClick={(e) => self.doEditBooking(e)} className="btn btn-blue btn-save-booking">Save</button></div>
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        pagePermissions: state.userReducer.pagePermissions,
        chatDetail: state.chatReducer.chatDetail,
        paymentTerms: state.chatReducer.paymentTerms,
        availability: state.chatReducer.availability
    };
}

function mapDispatchToProps(dispatch) {
    return {
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
        sendOffer: (offer, callback) => dispatch(ChatActions.sendOffer(offer, callback)),
        editCartItemBookingSlot: (offer, callback) => dispatch(ChatActions.editCartItemBookingSlot(offer, callback)),
        addMember: (channelId, callback) => dispatch(ChatActions.addMember(channelId, callback)),
        createCart: (cart, callback) => dispatch(ChatActions.createCart(cart, callback))
    };
}

const ChatQuotationHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatQuotationComponent);

module.exports = {
    ChatQuotationHome,
    ChatQuotationComponent
};