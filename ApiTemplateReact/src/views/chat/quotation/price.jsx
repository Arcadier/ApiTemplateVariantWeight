const React = require('react');
const Moment = require('moment');
const TwilioChat = require('twilio-chat');
const BaseComponent = require('../../shared/base');
const CommonModule = require('../../../public/js/common');
const EnumCoreModule = require('../../../public/js/enum-core');
const Toastr = require('toastr');

const PermissionTooltip = require('../../common/permission-tooltip');

class ChatQuotationPriceComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            isProcessing: false
        };
    }

    getAddonArray() {
        const { item } = this.props;
        const self = this;

        var addons = [];
        if (item.addOns && item.addOns) {
            item.addOns.forEach(d => {
                addons.push({
                    ID: d.ID
                });
            });
        }

        return addons;
    }

    isSpaceTimeApiTemplate() {
        var self = this;

        return typeof self.props.chatDetail.Channel.CartItemDetail.BookingSlot != 'undefined' && self.props.chatDetail.Channel.CartItemDetail.BookingSlot != null;
    }

    createOffer(event) {
        event.preventDefault();
        const self = this;

        this.props.validatePermissionToPerformAction("add-merchant-create-quotation-api", () => {
            const { availability, chatDetail, item, issueDate, paymentTerm, quotations, validDate } = self.props;

            if (self.state.isProcessing) return;

            let validStartDate = null;
            let validEndDate = null;

            var addons = self.getAddonArray();

            function validateValidDate() {
                let input = $('#valid-datepicker');

                if (!input.hasClass('error-con')) {
                    const dateArray = validDate.split(' - ');

                    if (dateArray.length != 2) {
                        input.addClass('error-con');
                        return;
                    }

                    validStartDate = Moment(dateArray[0].trim() + ' 00:00:00', process.env.DATE_FORMAT + ' hh:mm:ss');
                    validEndDate = Moment(dateArray[1].trim() + ' 23:59:59', process.env.DATE_FORMAT + ' hh:mm:ss');

                    const momentIssueDate = Moment(issueDate, process.env.DATE_FORMAT, true);

                    if (!validStartDate.isValid() || !validEndDate.isValid() || validStartDate > validEndDate || momentIssueDate > validStartDate) {
                        input.addClass('error-con');
                    }
                }
            }

            function validateItemQuantity() {
                let input = $('#quantity')

                if (!input.hasClass('error-con')) {
                    const moq = availability && availability.moq ? availability.moq : 0;

                    if (item.quantity <= 0 || item.quantity < moq) {
                        input.addClass('error-con');
                    }
                }
            }

            function validatePrices() {
                var isValid = true;
                quotations.forEach((quotation) => {
                    let input = $('#price-' + quotation.id);

                    if (!$(input).hasClass('error-con')) {
                        if (quotation.type.toLowerCase() == 'discount') {
                            if (quotation.quantity.toLowerCase() == 'percentage') {
                                const price = parseFloat(quotation.price);

                                if (price > 100) {
                                    $(input).addClass('error-con');
                                    isValid = false;
                                }
                            }
                        }
                    }
                });

                if (!isValid) {
                    Toastr.error('Discount must not exceed 100.', 'Oops! Something went wrong.');
                }
            }

            CommonModule.validateFields();
            validateValidDate();
            validateItemQuantity();
            validatePrices();

            let isValid = true;

            $('.required').each((index, element) => {
                if ($(element).hasClass('error-con')) {
                    isValid = false;
                }
            });

            //validate item name and description
            let itemName = item.name ? item.name.length > 128 ? item.name.slice(0, 128) : item.name : item.name;
            let itemDescription = item.description ? item.description.length > 256 ? item.name.slice(0, 256) : item.description : item.description;

            if (isValid) {
                $(".btn-loader").addClass('btn-loading');
                var offerDto = {
                    Name: itemName,
                    Description: itemDescription,
                    Type: 'Quantity',
                    IsDiscount: false,
                    Quantity: item.quantity,
                    Price: parseFloat(item.price),
                    TotalAmount: item.total
                };

                if (self.isSpaceTimeApiTemplate()) {
                    offerDto.Quantity = chatDetail.Channel.CartItemDetail.BookingSlot.Duration;
                }

                //return;

                let offerDetails = [offerDto];

                quotations.forEach((quotation) => {
                    const isDiscount = quotation.type.toLowerCase() == 'discount';
                    let quantity = 1;
                    let price = quotation.price;

                    if (isDiscount) {
                        if (quotation.quantity.toLowerCase() == 'percentage') {
                            quantity = item.quantity;
                            price = parseFloat(price) / 100;
                        }
                    } else {
                        quantity = parseInt(quotation.quantity);
                    }

                    offerDetails.push({
                        Name: quotation.reason,
                        Description: quotation.description,
                        Type: isDiscount ? quotation.quantity : 'Quantity',
                        IsDiscount: isDiscount,
                        Quantity: quantity,
                        Price: price,
                        TotalAmount: quotation.total
                    });
                });

                const offer = {
                    ToUserID: self.getMainBuyer().ID,
                    CartItemID: chatDetail.Channel.CartItemDetail.ID,
                    Quantity: item.quantity,
                    Total: self.getTotalCost(),
                    CurrencyCode: self.getCurrencyCode(),
                    ChannelID: chatDetail.Channel.ChannelID,
                    PaymentTermID: paymentTerm.ID,
                    ValidStartDate: validStartDate.format('X'),
                    ValidEndDate: validEndDate.format('X'),
                    OfferDetails: JSON.stringify(offerDetails),
                    AddOns: JSON.stringify(addons)
                };

                var cart = {
                    recipientId: self.props.chatDetail.Channel.CartItemDetail.User.ID,
                    itemId: self.props.chatDetail.Channel.ItemDetail.ID,
                    quantity: item.quantity,
                    addOns: JSON.stringify(addons),
                    force: true
                };

                if (self.isSpaceTimeApiTemplate()) {
                    cart.bookingSlot = JSON.stringify({
                        ...self.props.item.bookingSlot
                    });
                }

                if (self.isSpaceTimeApiTemplate()) {
                    self.setState({
                        isProcessing: true
                    }, function () {
                        self.addMember(() => {
                            self.props.createCart(cart, function (result) {
                                offer.CartItemID = result.ID
                                self.props.sendOffer(offer, (createdOffer) => {

                                    if (createdOffer) {
                                        self.sendChatMessage(createdOffer, () => {
                                            self.redirectToChat();
                                        });
                                    } else {
                                        $(".btn-loader").removeClass('btn-loading');
                                        self.setState({
                                            isProcessing: false
                                        });

                                        $('#cover').fadeOut();
                                        Toastr.error('Unable to create quotation.', 'Oops! Something went wrong.');
                                    }
                                });
                            });
                        });
                    });
                } else {
                    self.addMember(() => {
                        self.props.sendOffer(offer, (createdOffer) => {
                            if (createdOffer) {
                                self.sendChatMessage(createdOffer, () => {
                                    self.redirectToChat();
                                });
                            } else {
                                $(".btn-loader").removeClass('btn-loading');
                                self.setState({
                                    isProcessing: false
                                });
                                $('#cover').fadeOut();
                                Toastr.error('Unable to create quotation.', 'Oops! Something went wrong.');
                            }
                        });
                    });
                }
            }
        });
    }

    getBuyers() {
        const mainBuyer = this.getMainBuyer();

        if (mainBuyer) {
            const members = this.props.chatDetail.Channel.Members.filter(m => m.User.ID == mainBuyer.ID || m.User.AccountOwnerID == mainBuyer.ID);

            return members.map((member) => {
                return member.User;
            });
        }

        return null;
    }

    getMainBuyer() {
        const { chatDetail, user } = this.props;
        return chatDetail.Channel.Members.find(m => m.User.AccountOwnerID == null && m.User.ID != user.ID).User;
    }

    getCurrencyCode() {
        return this.props.chatDetail.Channel.CartItemDetail.CurrencyCode;
    }

    getChargeTotal() {
        let total = 0;

        this.props.quotations.forEach((quotation) => {
            if (quotation.type.toLowerCase() == 'charge') {
                total += quotation.total;
            }
        });

        return total;
    }

    getDiscountTotal() {
        let total = 0;

        this.props.quotations.forEach((quotation) => {
            if (quotation.type.toLowerCase() == 'discount') {
                total += quotation.total;
            }
        });

        return total;
    }

    getSubTotal() {
        return this.props.item.total
    }

    getTotalCost() {
        var subTotalFloat = parseFloat(this.getSubTotal())
        var chargeTotalFloat = parseFloat(this.getChargeTotal())
        var discountTotalFloat = parseFloat(this.getDiscountTotal())

        return subTotalFloat + chargeTotalFloat - discountTotalFloat;
    }

    redirectToChat() {
      //  $(".btn-loader").removeClass('btn-loading');
        return window.location = '/chat?channelId=' + this.props.chatDetail.Channel.ChannelID;
        $(".btn-loader").removeClass('btn-loading');
    }

    sendChatMessage(offer, callback) {
        const self = this;

        $.ajax({
            url: "/chat/generate-token",
            type: "GET",
            success: function (response) {
                TwilioChat.Client.create(response).then(client => {
                    client.getChannelBySid(self.props.chatDetail.Channel.ChannelID).then(channel => {
                        if (channel && channel.state && channel.state.status !== "joined" ||
                            channel && channel.channelState && channel.channelState.status !== "joined" ||
                            channel && channel.status !== "joined") {
                            channel.join().then((joinedChannel) => {
                                joinedChannel.sendMessage(offer.Message).then((id) => {
                                    callback();
                                });
                            }).catch((err) => {
                                console.log('error', err)
                            });
                        } else {
                            channel.sendMessage(offer.Message).then((id) => {
                                callback();
                            });
                        }
                    });
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }

    addMember(callback) {
        const { chatDetail } = this.props;

        const channelMembers = chatDetail.Channel.Members;
        if (channelMembers && channelMembers.length > 0) {
            const loggedUserId = this.getLoggedUserId();
            const memberDetail = channelMembers.find(m => m.User.ID == loggedUserId);

            if (!memberDetail) {
                this.props.addMember(chatDetail.Channel.ChannelID, () => {
                    callback();
                });
            } else {
                callback();
            }
        }
    }

    getLoggedUserId() {
        const user = this.props.user;

        if (user.SubBuyerID) {
            return user.SubBuyerID;
        } else if (user.SubmerchantID) {
            return user.SubmerchantID;
        }

        return user.ID;
    }

    render() {
        return (
            <div className="col-md-4">
                <div className="qutation_bill_box">
                    <div className="quote_title">
                        <h3>Quotation Price</h3>
                    </div>
                    <div className="quotation-total pull-right">
                        <span className="full-width subtotal">
                            <span className="title">Subtotal</span>
                            <span className="pull-right price">
                                {this.renderFormatMoney(this.getCurrencyCode(), this.getSubTotal())}
                            </span>
                        </span>
                        <span className="full-width freight-cost">
                            <span className="title">Charge(s)</span>
                            <span className="pull-right price">
                                {this.renderFormatMoney(this.getCurrencyCode(), this.getChargeTotal())}
                            </span>
                        </span>
                        <span className="full-width discount">
                            <span className="title">Discount(s)</span>
                            <span className="pull-right price">
                                - {this.renderFormatMoney(this.getCurrencyCode(), this.getDiscountTotal())}
                            </span>
                        </span>
                        <span className="full-width total-cost">
                            <span className="title">Total Cost</span>
                            <span className="pull-right price">
                                {this.renderFormatMoney(this.getCurrencyCode(), this.getTotalCost())}
                            </span>
                        </span>
                        <div className="send_btn">
                            <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                <a href="#" className="pull-right btn btn-sassy btn-loader" onClick={(e) => this.createOffer(e)} id="sendQuotation">Send Quotation</a>
                            </PermissionTooltip>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ChatQuotationPriceComponent;