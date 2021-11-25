'use strict';
const React = require('react');
const toastr = require('toastr');
const Moment = require('moment');
const EnumCoreModule = require('../../../../../public/js/enum-core');
const BaseComponent = require('../../../../shared/base');
const PermissionTooltip = require('../../../../common/permission-tooltip');

class SellerInfoComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    validateBookingDetails() {
        const self = this;
        let isEmptyBookingDetails = false;

        $('.required').removeClass('error-con');
        $('.idcrt-order-val .required').each(function () {
            if ($.trim($(this).val()) == '') {
                isEmptyBookingDetails = true;
            }
        });

        if (self.props.user.Guest && self.props.controlFlags.GuestCheckoutEnabled === false) {
            toastr.error('Feature not available for guest user.')
            return { isBookingValid: false };
        }
        
        const durationCount = this.props.purchaseOrder.state.durationCount || 1;

        const selectedDate = $('#selectedDate').val() || Moment().format('MM/DD/YYYY');
        let selectedTime = '';
        if (this.props.purchaseOrder.doShowTimePicker()) {
            selectedTime = $('#selectedTime').val() || Moment().format('hh:mm A');
        }

        //get service opening hours based on selected date 
        const openingSchedule = this.props.purchaseOrder.getOpeningSchedule();
        let serviceStartTimeOnDay = '';
        let serviceEndTimeOnDay = '';

        const selectedDay = Moment(selectedDate, 'MM/DD/YYYY').format('dddd');
        if (openingSchedule && openingSchedule.length > 0) {
            let opening = openingSchedule.find(op => op.day == selectedDay);
            if (opening) {
                serviceStartTimeOnDay = opening.startTime;
                serviceEndTimeOnDay = opening.endTime;
            }
        }
        
        // get 24h format of selected time, service start & end time
        let selectedTimeOn24HFormat = '00:00';
        let startTimeOn24HFormat = '00:00';
        let endTimeOn24HFormat = '00:00';
        if (serviceEndTimeOnDay !== '') {
            selectedTimeOn24HFormat = Moment(selectedTime, 'hh:mm A').format('HH:mm');
            startTimeOn24HFormat = Moment(serviceStartTimeOnDay, 'hh:mm A').format('HH:mm');
            endTimeOn24HFormat = Moment(serviceEndTimeOnDay, 'hh:mm A').format('HH:mm');
        }
        
        const durationUnit = this.props.purchaseOrder.getDurationStr().toLowerCase();
        const isAllDay = this.props.purchaseOrder.props.itemDetails.Scheduler.AllDay;
        const increment = durationUnit.match(/\d+/) ?  durationUnit.match(/\d+/)[0] : 1;
        if (!isEmptyBookingDetails) {
            // validate if selected time is same or after service start time
            if (durationUnit.includes('hour') || durationUnit.includes('minute')) {
                if (serviceStartTimeOnDay !== '') {
                    if (Moment(selectedTimeOn24HFormat, 'HH:mm').diff(Moment(startTimeOn24HFormat, 'HH:mm')) < 0) {
                        toastr.error('Your start time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                        return { isBookingValid: false };
                    }
                }
            }

            // validate if selected time is within the service start and end time
            if (serviceEndTimeOnDay !== '' && !isAllDay && this.props.purchaseOrder.doShowTimePicker()) {
                let isBeforeStartTime = Moment(selectedTimeOn24HFormat, 'HH:mm').diff(Moment(startTimeOn24HFormat, 'HH:mm')) < 0;
                let isAfterEndTime = Moment(endTimeOn24HFormat, 'HH:mm').diff(Moment(selectedTimeOn24HFormat, 'HH:mm')) < 0;
                if (!isBeforeStartTime && !isAfterEndTime) {
                    let selectedDateTime = Moment(`${selectedDate} ${selectedTime.length > 0 ? selectedTime : '12:00 AM'}`, 'MM/DD/YYYY hh:mm A');
                    let endDateTime = Moment(`${selectedDate} ${serviceEndTimeOnDay}`, 'MM/DD/YYYY hh:mm A');
                    if (durationUnit.includes('hour')) {
                        selectedDateTime = Moment(selectedDateTime).add(durationCount * increment, 'h');
                    } else if (durationUnit.includes('minute')) {
                        const totalMinutes = durationCount * increment;
                        selectedDateTime = Moment(selectedDateTime).add(parseInt(totalMinutes / 60), 'hours').add(parseInt(totalMinutes % 60), 'minutes');
                    }
                    
                    if (Moment(endDateTime, 'HH:mm').diff(Moment(selectedDateTime, 'HH:mm')) < 0) {
                        toastr.error('Your end time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                        return { isBookingValid: false };
                    }
                } else {
                    toastr.error('Your end time has to be within the specified operating hours.', 'Oops! Something went wrong.');
                    return { isBookingValid: false };
                }
            }
        }

        // get end date from selected date and time
        const selectedStartDateTime = Moment(`${selectedDate} ${selectedTime.length > 0 ? selectedTime : '12:00 AM'}`, 'MM/DD/YYYY hh:mm A');
        let selectedEndDateTime = Moment(`${selectedDate} ${selectedTime.length > 0 ? selectedTime : '12:00 AM'}`, 'MM/DD/YYYY hh:mm A');;
        if (durationUnit !== '' && typeof durationUnit !== 'undefined') {
            if (durationUnit.includes('hour')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'h')
            } else if (durationUnit.includes('minute')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'm')
            } else if (durationUnit.includes('day')) {
                selectedEndDateTime = selectedEndDateTime.add((durationCount * increment) - 1, 'd');
            } else if (durationUnit.includes('night')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'd');
            } else if (durationUnit.includes('week')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'w').subtract(1, 'd');
            } else if (durationUnit.includes('month')) {
                selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'M').subtract(1, 'd');
            } else if (durationUnit.match(/\d+/)) {
                //ARC10113
                if (this.props.itemDetails && this.props.itemDetails.Scheduler) {
                    let isOverNight = this.props.itemDetails.Scheduler.Overnight;
                    if (isOverNight === true) {
                        selectedEndDateTime = selectedEndDateTime.add(durationCount * increment, 'd');
                    } else {
                        selectedEndDateTime = selectedEndDateTime.add((durationCount * increment) - 1, 'd');
                    }
                }

            }
        }

        if (!isEmptyBookingDetails) {
            // check if selected booking datetime is within blocked dates
            const blockedDates = this.props.purchaseOrder.getBlockedDates();
            if (blockedDates && blockedDates.length > 0) {
                let blockedDaysErrCount = 0;
                //validate selected datetime on blockdates within opening schedule
                blockedDates.map(blockedDate => {
                    const is24HoursOpen = isAllDay && openingSchedule && openingSchedule.length == 0;
                    if (is24HoursOpen) {
                        if (durationUnit.includes('hour') || durationUnit.includes('minute')) {
                            if (Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '[)')) {
                                blockedDaysErrCount += 1;
                            }
                            if (Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '(]')) {
                                blockedDaysErrCount += 1;
                            }
                            if (selectedStartDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '[)')) {
                                blockedDaysErrCount += 1;
                            }
                            if (selectedEndDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '(]')) {
                                blockedDaysErrCount += 1;
                            }
                        } else {
                            const date = Moment(blockedDate.start).format('MM/DD/YYYY');
                            const isUnavailable = Moment(date) >= Moment(Moment(selectedStartDateTime).format('MM/DD/YYYY')) && Moment(date) <= Moment(Moment(selectedEndDateTime).format('MM/DD/YYYY'));
                            if (isUnavailable) blockedDaysErrCount += 1;
                        }
                    } else {
                        const isOvernight = this.props.purchaseOrder.props.itemDetails.Scheduler.Overnight;
                        const openingSched = isOvernight ? openingSchedule[0] : openingSchedule.find(op => op.day == selectedDay);
                        if (durationUnit.includes('hour') || durationUnit.includes('minute')) {
                            if (Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '[)')) {
                                blockedDaysErrCount += 1;
                            }
                            if (Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A').isBetween(selectedStartDateTime, selectedEndDateTime, undefined, '(]')) {
                                blockedDaysErrCount += 1;
                            }
                            if (selectedStartDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '[)')) {
                                blockedDaysErrCount += 1;
                            }
                            if (selectedEndDateTime.isBetween(Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A'), Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A'), undefined, '(]')) {
                                blockedDaysErrCount += 1;
                            }
                        } else {
                            const selectedDates = this.props.purchaseOrder.getDatesBetweenRange(Moment(selectedStartDateTime), Moment(selectedEndDateTime).add(23, 'h'));
                            selectedDates.map(date => {
                                const startDateTime = Moment(date + ' ' + openingSched.startTime, 'MM/DD/YYYY hh:mm A');
                                const endDateTime = Moment(date + ' ' + openingSched.endTime, 'MM/DD/YYYY hh:mm A');
                                if (Moment(blockedDate.start, 'MM/DD/YYYY hh:mm A').isBetween(startDateTime, endDateTime, undefined, '[)')) {
                                    blockedDaysErrCount += 1;
                                }
                                if (Moment(blockedDate.end, 'MM/DD/YYYY hh:mm A').isBetween(startDateTime, endDateTime, undefined, '(]')) {
                                    blockedDaysErrCount += 1;
                                }
                            });
                        }

                    }
                });
                
                if (blockedDaysErrCount > 0) {
                    toastr.error('Your selected booking period contains unavailable dates.', 'Oops! Something went wrong.');
                    return { isBookingValid: false };
                }
            }
            const restDays = this.props.purchaseOrder.getRestDays();
            const selectedDates = this.props.purchaseOrder.getDatesBetweenRange(Moment(selectedStartDateTime), Moment(selectedEndDateTime).add(23, 'h'));
            
            // validate if selected date falls on rest days
            if (durationUnit.includes('day') && increment == 1) {
                let hasUnavailableDate = false;
                if (selectedDates && selectedDates.length > 0 && restDays && restDays.length > 0) {
                    for (let i = 0; i < selectedDates.length > 0; i++) {
                        if (restDays.includes(Moment(selectedDates[i], 'MM/DD/YYYY').format('dddd'))) {
                            hasUnavailableDate = true;
                            break;
                        }
                    }
                }
                if (hasUnavailableDate) {
                    toastr.error('Your selected booking period contains unavailable dates.', 'Oops! Something went wrong.');
                    return { isBookingValid: false };
                }
            }
        }
        
        return { isBookingValid: true, selectedStartDateTime, selectedEndDateTime };
    }

    getBookingSlotData(selectedStartDateTime, selectedEndDateTime) {
        const { itemDetails } = this.props;
        const bookingSlot = {};

        if (itemDetails) {
            if (itemDetails.Scheduler) {
                bookingSlot.TimeZoneID = itemDetails.Scheduler.TimeZoneID;
            }

            bookingSlot.DurationUnit = itemDetails.DurationUnit;
            bookingSlot.Duration = this.props.purchaseOrder.state.durationCount || 1;
            if (process.env.PRICING_TYPE === 'service_level') {
                bookingSlot.Duration = this.props.purchaseOrder.state.durationCount || 0;
            }
            if (selectedStartDateTime && selectedEndDateTime) {
                const FromDateTime = selectedStartDateTime.toDate();
                const ToDateTime = selectedEndDateTime.toDate();
                bookingSlot.FromDateTime = new Date(FromDateTime.getTime() + (1000 * 60 * (-FromDateTime.getTimezoneOffset()))).getTime()/1000;
                bookingSlot.ToDateTime = new Date(ToDateTime.getTime() + (1000 * 60 * (-ToDateTime.getTimezoneOffset()))).getTime()/1000;
            }

            const options = {
                selectedQuantity: 0,
                discount: 0,
                itemId: itemDetails.ID,
                force: true,
                isComparisonOnly: false,
                serviceBookingUnitGuid: itemDetails.ServiceBookingUnitGuid,
                bookingSlot: bookingSlot
            };

            if (this.props.purchaseOrder.state.selectedAddOns && this.props.purchaseOrder.state.selectedAddOns.length > 0) {
                options.addOns = this.props.purchaseOrder.state.selectedAddOns.map(addOnId => { return { ID: addOnId } });    
            }
            return options;
        }
        return {};
    }

    contactSupplier() {
        const self = this;

        if (this.props.processing === true) {
            return;
        }

        const { isBookingValid, selectedStartDateTime, selectedEndDateTime } = this.validateBookingDetails();
        if (!isBookingValid) return;

        const userDetail = self.props.user;
        const itemDetail = self.props.itemDetails;

        if (userDetail.ID === itemDetail.MerchantDetail.ID) {
            toastr.error('Cannot open chat, this item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }

        let item = self.props.itemDetails;
        const priceValues = self.props.priceValues;

        const options = {
            pageSize: 100,
            pageNumber: 1,
            includes: ['CartItemDetail', 'ItemDetail', 'User']
        }
        
        this.props.setProcessing(true);

        this.props.getUserChannels(options, function (channels) {
            let createNewChannel = false;
            let channel = null;

            //TODO: adjust API to include and check for open channels with pending offer
            if (channels && channels.TotalRecords === 0) {
                createNewChannel = true;
            }
            else {
                for (let i = 0; i < channels.TotalRecords; i++) {
                    let tempChannel = channels.Records[i];
                    if (tempChannel && tempChannel.ItemDetail) {
                        if (tempChannel.ItemDetail.ID === item.ID) {
                            channel = tempChannel;
                            break;
                        }
                        if (tempChannel && tempChannel.CartItemDetail && tempChannel.CartItemDetail.ItemDetail.ID === item.ID) {
                            channel = tempChannel;
                            break;
                        }
                    }
                }
                createNewChannel = !channel;
            }

            function getChatDetails(channel, callback) {
                if (channel) {
                    self.props.getChatDetails(channel.ChannelID, function (details) {
                        callback(details);
                    });
                } else {
                    callback();
                }
            }

            getChatDetails(channel, function (chatDetails) {
                if (chatDetails && chatDetails.Channel && chatDetails.Channel.Offer && chatDetails.Channel.Offer.Accepted) {
                    createNewChannel = true;
                }

                if (createNewChannel) {
                    const quantity = self.props.purchaseOrder.state.unitCount || 1;
                    const options = self.getBookingSlotData(selectedStartDateTime, selectedEndDateTime);
                    self.props.createChatChannel({
                        recipientId: itemDetail.MerchantDetail.ID,
                        itemId: item.ID,
                        quantity: quantity,
                        serviceBookingUnitGuid: options.serviceBookingUnitGuid,
                        bookingSlot: options.bookingSlot,
                        addOns: options.addOns,
                        createCartItem: true
                    }, function (newChannel) {
                        if (newChannel && newChannel != "" && newChannel.ChannelID != null) {
                            window.location = "/chat?channelId=" + newChannel.ChannelID;
                        } else {
                            if (newChannel.Code == 'INSUFFICIENT_STOCK') {
                                self.showMessage(EnumCoreModule.GetToastStr().Error.INSUFFICIENT_STOCK);
                            } else if (newChannel.Code == 'INVALID_SERVICE_BOOKING') {
                                self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_SERVICE_BOOKING);
                            } else {
                                toastr.error('Error creating chat channel.', 'Error!');
                            }
                            self.props.setProcessing(false);
                        }
                    });
                }
                else {
                    toastr.error('You still have an open channel/offer for this item.', 'Oops! Something went wrong.');
                    window.location = "/chat?channelId=" + channel.ChannelID;
                }
            });
        });
    }

    handleContactSupplierBtnClick() {
        if (!this.props.permissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-item-details-api', () => this.contactSupplier());
    }

    compare() {
        const self = this;

        function validateComparison(itemId, callback) {
            const comparison = self.props.comparison;
            let existingComparisonDetail = {};

            if (comparison !== 'undefined' && $.isEmptyObject(comparison) === false) {
                if (comparison.ComparisonDetails) {
                    existingComparisonDetail = comparison.ComparisonDetails.find(p => p.CartItem != null && p.CartItem.ItemDetail != null &&
                        p.CartItem.ItemDetail.ID === itemId && p.Offer == null);

                    if (typeof callback === 'function') {
                        if (existingComparisonDetail) {
                            callback(existingComparisonDetail.CartItemID);
                        } else {
                            callback(null);
                        }
                    }
                }
            }
        }

        function getComparisonFields(parentItem) {
            let comparables = [];

            comparables.push({
                key: 'BuyerDescription',
                value: parentItem.BuyerDescription
            });

            comparables.push({
                key: 'ItemName',
                value: parentItem.Name
            });

            if (parentItem.CustomFields) {
                parentItem.CustomFields.forEach(function (customField) {
                    if (customField.IsComparable === true) {
                        comparables.push({
                            key: customField.Code,
                            value: customField.Values.length > 1 ? JSON.stringify(customField.Values) : customField.Values[0]
                        });
                    }
                })
            }

            return comparables;
        }

        function getItem() {
            if (self.props.itemDetails.Media) {
                $('.item-main-thumbnail').attr('href', self.props.itemDetails.Media[0].MediaUrl);
                $('.item-main-thumbnail').attr('data-lightbox', self.props.itemDetails.Media.length > 1 ? 'gallery-group' : 'gallery');
                $('.item-main-thumbnail > img ').attr('src', self.props.itemDetails.Media[0].MediaUrl);
            }

            return self.props.itemDetails;
        }
        
        if (!this.props.permissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-item-details-api', () => {
            if (self.props.user.Guest == true) {
                let loc = (location.pathname + location.search).substr(1);
                location.href = `/accounts/non-private/sign-in?returnUrl=${loc}`;
                return;
            }

            if (self.props.processing === true) {
                return;
            }

            const parentItem = self.props.itemDetails;
            const { HasChildItems, ChildItems } = parentItem;
            if (HasChildItems && ChildItems.length > 0) {
                if (ChildItems[0].Variants && ChildItems[0].Variants.length > 0) {
                    if (self.state.selectedVariantIDs.size !== ChildItems[0].Variants.length) {
                        return;
                    }
                }
            }

            const item = getItem();
            const { priceValues } = self.props;

            if (self.props.user && parentItem.MerchantDetail.ID === self.props.user.ID) {
                toastr.error('This item seems to belong to you.', 'Oops! Something went wrong.');
                return;
            }

            self.props.setProcessing(true);

            validateComparison(item.ID,
                function (comparisonCartItemId) {
                    const { isBookingValid, selectedStartDateTime, selectedEndDateTime } = self.validateBookingDetails();
                    if (!isBookingValid) return;
                    let quantity = self.props.purchaseOrder.state.unitCount || 0;
                    //if (process.env.PRICING_TYPE === 'service_level') {
                    //    if (!self.props.purchaseOrder.state.unitCount) {
                    //        quantity = self.props.purchaseOrder.state.durationCount || 0;
                    //    }                    
                    //}
                    const options = self.getBookingSlotData(selectedStartDateTime, selectedEndDateTime);
                    options.selectedQuantity = quantity;
                    options.isComparisonOnly = true;
                    
                    self.props.addOrEditCart(comparisonCartItemId, quantity, options,
                        function (cartItem) {
                            if (comparisonCartItemId !== cartItem.ID) {
                                self.props.createComparisonDetail(cartItem.ID, 'CartItem', getComparisonFields(parentItem));
                                self.props.deleteCartItem(cartItem.ID, self.props.user.ID);
                            } else {
                                self.props.updateComparisonDetail(cartItem.ID, cartItem.Quantity, cartItem.SubTotal, cartItem.DiscountAmount, cartItem.AddOns);
                            }

                            self.props.showHideWidget(true);
                        },
                        function (errorMessage) {
                            self.showMessage(errorMessage)
                        }
                    )
                }
            )

            setTimeout(function () {
                self.props.setProcessing(false);
            }, 1000);
        });
    }

    renderCompareLink() {
        const self = this;
        const isDisabled = this.props.permissions.isAuthorizedToAdd ? "" : "icon-grey";
        if (self.props.controlFlags && self.props.controlFlags.ComparisonEnabled === true) {
            return (
                <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToAdd} >
                    <a onClick={() => self.compare()} className={"blue-ico-link " + isDisabled} href="#">
                        <i className="fa fa-th-list"></i>
                        Compare
                    </a>
                </PermissionTooltip>

            );
        }
        else {
            return null;
        }
    }

    render() {
        const isDisabled = this.props.permissions.isAuthorizedToAdd ? "" : "icon-grey";
        let self = this;
        let storeFrontUrl = "/storefront/" + self.props.merchantDetails.ID;
        let merchantImage = "";

        let isNegotiate = "";
        if (self.props.itemDetails.Negotation === false) {
            isNegotiate = "hide";
        }

        if (self.props.merchantDetails.Media && self.props.merchantDetails.Media.length > 0 && self.props.merchantDetails.Media[self.props.merchantDetails.Media.length - 1]) {
            merchantImage = self.props.merchantDetails.Media[self.props.merchantDetails.Media.length - 1].MediaUrl;
        }
        return (
            <div className="idcl-mid">
                <div className="idclm-content">
                    <div className="idclmc-img">
                        <span className="helper"></span> <img src={merchantImage} />
                    </div>
                    <div className="idclmc-name">
                        <a href={storeFrontUrl} className="seller-name">{self.props.merchantDetails.DisplayName}</a>
                    </div>
                    <div className="idclmc-contact">
                        <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToAdd}>
                            <a onClick={() => this.handleContactSupplierBtnClick()} className={"blue-ico-link " + isNegotiate + " " + isDisabled} href="#">
                                <i className="fa fa-envelope"></i>
                                Contact Supplier
                            </a>
                        </PermissionTooltip>
                        {this.renderCompareLink()}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SellerInfoComponent;