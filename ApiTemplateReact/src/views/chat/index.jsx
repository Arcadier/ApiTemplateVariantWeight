'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var FooterLayout = require('../layouts/footer').FooterLayoutComponent;
var HeaderLayoutComponent = require('../../views/layouts/header').HeaderLayoutComponent;
var UserInformation = require('../../views/chat/user-info');
var ItemInformation = require('../../views/chat/item-info');
var Messages = require('../../views/chat/messages');
var QuotationActions = require('../../views/chat/quotation-actions');
var BaseComponent = require('../../views/shared/base');
var ChatActions = require('../../redux/chatActions');
var TwilioChat = require('twilio-chat');
var EnumCoreModule = require('../../public/js/enum-core');
const { validatePermissionToPerformAction } = require('../../redux/accountPermissionActions');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            channel: null
        }

        this.sendMessage = this.sendMessage.bind(this);
        this.updateMemberLastSeenMessage = this.updateMemberLastSeenMessage.bind(this);
    }

    initialize() {
        let self = this;
        $.ajax({
            url: "/chat/generate-token",
            type: "GET",
            success: function (response) {
                TwilioChat.Client.create(response).then(client => {
                    client.getChannelBySid(self.props.channelId).then(channel => {

                        // join the general channel
                        channel.join().catch(function (err) {
                            //commented temporarily. has member already exists error
                            //console.error("Couldn't join channel " + channel.friendlyName + ' because ' + err);
                        });

                        // listen for new messages sent to the channel
                        channel.on('messageAdded', function (message) {
                            self.messages.addNewMessage(message, function () {
                                self.updateMemberLastSeenMessage(message.sid);
                                // todo
                                // createActivity();
                            });
                            if (message.body.indexOf('data-msg-type=\"sent-quotation\"') >= 0
                                || message.body.indexOf('data-msg-type=\"cancelled-quotation\"') >= 0
                                || message.body.indexOf('data-msg-type=\"declined-quotation\"') >= 0) {
                                window.location.reload();
                            }
                        });

                        self.setState({ channel: channel });
                    });

                    // join the channel event
                    client.on('channelJoined', function (joinedChannel) {
                        self.messages.setChatReady();
                    });
                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }

    sendMessage(message, type, callback) {
        const self = this;
        const channel = self.state.channel;
        const user = self.props.user;
        if (channel) {
            const channelMembers = self.props.chatDetail.Channel.Members;
            if (channelMembers && channelMembers.length > 0) {
                const loggedUserId = self.getLoggedUserId();
                const memberDetail = channelMembers.find(m => m.User != null && m.User.ID == loggedUserId);
                let userDisplayName = user.UserName;

                if (user.FirstName && user.LastName) {
                    userDisplayName = user.FirstName + ' ' + user.LastName;
                }

                const htmlMessage = `<span class=\"user-container\">${userDisplayName}</span>
	                                 <p>${message}</p>`;

                if (!memberDetail) {
                    self.props.addMember(self.props.channelId, function () {
                        self.props.sendChatMessage(htmlMessage, () => {
                            if (callback) {
                                callback(null);
                            }
                        });
                    });
                } else {
                    self.props.sendChatMessage(htmlMessage, () => {
                        if (callback) {
                            callback(null);
                        }
                    });
                }
            }
        }
    }

    getEmailOptions(emailType) {
        const self = this;
        const recipientDetail = self.getMainRecipientDetail();
        const senderDetail = self.getMainSenderDetail();
        if (emailType === EnumCoreModule.GetChatEmailTypes().MessageFromBuyer) {
            return [{
                ChannelId: self.state.channel.sid,
                EmailType: EnumCoreModule.GetChatEmailTypes().MessageFromBuyer,
                SellerName: recipientDetail.FirstName + ' ' + recipientDetail.LastName,
                SellerDisplayName: '',
                ConsumerFirstName: senderDetail.FirstName,
                ConsumerEmail: senderDetail.Email,
                SellerEmail: recipientDetail.Email
            }];
        }
        else if (emailType === EnumCoreModule.GetChatEmailTypes().MessageFromSeller) {
            return [{
                ChannelId: self.state.channel.sid,
                EmailType: EnumCoreModule.GetChatEmailTypes().MessageFromSeller,
                SellerName: senderDetail.FirstName + ' ' + senderDetail.LastName,
                SellerDisplayName: '',
                ConsumerFirstName: recipientDetail.FirstName,
                ConsumerEmail: recipientDetail.Email,
                SellerEmail: senderDetail.Email
            }];
        }
        else if (emailType === EnumCoreModule.GetChatEmailTypes().NewOffer) {
            return [{
                ChannelId: self.state.channel.sid,
                EmailType: EnumCoreModule.GetChatEmailTypes().NewOffer,
                SellerName: senderDetail.FirstName + ' ' + senderDetail.LastName,
                SellerDisplayName: senderDetail.DisplayName,
                ConsumerFirstName: recipientDetail.FirstName,
                ConsumerEmail: recipientDetail.Email,
                SellerEmail: senderDetail.Email
            }];
        }
        else if (emailType === EnumCoreModule.GetChatEmailTypes().OfferDelined) {
            return [{
                ChannelId: self.state.channel.sid,
                EmailType: EnumCoreModule.GetChatEmailTypes().OfferDelined,
                SellerName: recipientDetail.FirstName + ' ' + recipientDetail.LastName,
                SellerDisplayName: '',
                ConsumerFirstName: senderDetail.FirstName,
                ConsumerEmail: senderDetail.Email,
                SellerEmail: recipientDetail.Email
            }];
        }
    }

    getMainRecipientDetail() {
        const self = this;
        const channelMembers = self.props.chatDetail.Channel.Members;

        if (channelMembers && channelMembers.length > 0) {
            const recipientDetail = channelMembers.find(function (member) {
                return member.User.ID !== self.props.user.ID && member.User.AccountOwnerID === null;
            });

            return recipientDetail.User;
        }
        return null;
    }

    getMainSenderDetail() {
        const self = this;
        const channelMembers = self.props.chatDetail.Channel.Members;

        if (channelMembers && channelMembers.length > 0) {
            const recipientDetail = channelMembers.find(function (member) {
                return member.User.ID === self.props.user.ID && member.User.AccountOwnerID === null;
            });

            return recipientDetail.User;
        }
        return null;
    }

    getMembersList(type) {
        const self = this;
        const channelMembers = self.props.chatDetail.Channel.Members;

        let members = [];
        if (channelMembers && channelMembers.length > 0) {
            const mainAccountDetail = type === 'sender' ? self.getMainSenderDetail() : self.getMainRecipientDetail();
            members.push(mainAccountDetail);
            channelMembers.map(function (member) {

                if (member.User != null && member.User.AccountOwnerID != null && member.User.AccountOwnerID && mainAccountDetail.ID && member.User.AccountOwnerID === mainAccountDetail.ID) {
                    members.push(member.User);
                }
            });

            return members;
        }
        return null;
    }

    getItemDetail() {
        const self = this;
        const itemDetail = self.props.chatDetail.Channel.CartItemDetail !== null ?
            self.props.chatDetail.Channel.CartItemDetail.ItemDetail : self.props.chatDetail.Channel.ItemDetail;

        if (itemDetail) {
            return itemDetail;
        }
        return null;
    }

    getCartItemDetail() {
        const self = this;
        const cartItemDetail = self.props.chatDetail.Channel.CartItemDetail !== null ?
            self.props.chatDetail.Channel.CartItemDetail : self.props.chatDetail.Channel.ItemDetail;
        if (cartItemDetail) {
            return cartItemDetail;
        }
        return null;
    }

    getOrderQuantity() {
        const self = this;
        let orderQuantity = self.getCartItemDetail() && self.getCartItemDetail().Quantity ? self.getCartItemDetail().Quantity : 0;
        if (self.props.chatDetail.Channel.Offer) {
            orderQuantity = self.props.chatDetail.Channel.Offer.Quantity;
        }

        return orderQuantity;
    }

    getQuotation() {
        const self = this;
        if (self.props.offer) {
            return self.props.offer;
        }

        return null;
    }

    getMessages() {
        const self = this;
        return self.props.chatDetail.Messages.Records;
    }

    getChannelMemberDetail() {
        const self = this;
        const channelMembers = self.props.chatDetail.Channel.Members;
        var loggedUserId = self.getLoggedUserId();

        //check if sub merchant
        if (self.props.user.Roles && self.props.user.Roles.includes('Submerchant')) {
            loggedUserId = self.props.user.ID;
        }
        if (self.props.user.SubBuyerID) {
            loggedUserId = self.props.user.ID;
        }

        let memberDetail = null;
        for (let member of channelMembers) {
            if (member.User && member.User != null && member.User.ID === loggedUserId) {
                memberDetail = member;
                break;
            }
        }
        return memberDetail;
    }

    showMerchantActions() {
        const self = this;
        return self.getItemDetail() && self.getItemDetail().MerchantDetail && self.getItemDetail().MerchantDetail.ID === self.props.user.ID;
    }

    isNotSamePerson() {
        const self = this;
        return self.getItemDetail() && self.getItemDetail().MerchantDetail && self.getItemDetail().MerchantDetail.ID !== self.props.user.ID;
    }

    updateMemberLastSeenMessage(messageId) {
        const self = this;
        const memberDetail = self.getChannelMemberDetail();

        if (memberDetail && memberDetail.LastMessageSID != messageId) {
            self.props.updateMemberLastSeenMessage(memberDetail.ChannelMemberID, messageId);
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

    componentDidMount() {
        const self = this;
        self.initialize();

        if (this.showMerchantActions() === false) {
            $('.page-chat').addClass('buyer-offer');
        };

        if (this.showMerchantActions() === true) {
            $('.page-chat').addClass('page-seller seller-chat-offer');
        };

        $(".intro-description").niceScroll({ cursorcolor: "#000", cursorwidth: "6px", cursorborderradius: "5px", cursorborder: "1px solid transparent", touchbehavior: true, horizrailenabled: false });

        if ($('.user-product-info').children().length === 0) {
            $('.user-product-info').removeClass("user-product-info");
        }
        if (typeof error != 'undefined') {
            if (error == 'merchant-not-found') {
                self.showMessage({
                    type: "error",
                    body: "This page is no longer accessible.",
                    header: "Sorry!"
                });
            }
        }
    }

    renderMenu() {
        if (typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Roles != null) {
            return <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />;
        }

        return '';
    }

    render() {
        const self = this;
        const itemMerchantId = self.getItemDetail() && self.getItemDetail().MerchantDetail ? self.getItemDetail().MerchantDetail.ID : 0;
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main" style={{ paddingTop: "120px" }}>
                    <div className="chat-container">
                        <div className="container">
                            <div className="chat-box-parent">
                                <div className="left-info-bar">
                                    <UserInformation userDetail={self.getMainRecipientDetail()}
                                        showMerchantActions={self.showMerchantActions()}
                                        isNotSamePerson={self.isNotSamePerson()}
                                        getRecipientAddresses={self.props.getRecipientAddresses}
                                    />
                                    <div className="user-product-info">
                                        <ItemInformation itemDetail={self.getItemDetail()}
                                            renderFormatMoney={self.renderFormatMoney}
                                            orderQuantity={self.getOrderQuantity()}
                                            cartItemDetail={self.getCartItemDetail()}
                                        />
                                        <QuotationActions ref={(ref) => this.quotationAction = ref}
                                            quotation={self.getQuotation()}
                                            showMerchantActions={self.showMerchantActions()}
                                            channelId={self.props.channelId}
                                            isAuthorizedToAdd={this.props.pagePermissions.isAuthorizedToAdd}
                                            isAuthorizedToEdit={this.props.pagePermissions.isAuthorizedToEdit}
                                            validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                        />
                                    </div>
                                </div>
                                <Messages ref={(ref) => this.messages = ref}
                                    mainSenderDetail={self.getMainSenderDetail()}
                                    mainRecipientDetail={self.getMainRecipientDetail()}
                                    messages={self.getMessages()}
                                    currenUserEmail={self.props.user.Email}
                                    formatDateTime={self.formatDateTime}
                                    sendMessage={self.sendMessage}
                                    itemMerchantId={itemMerchantId}
                                    updateMemberLastSeenMessage={self.updateMemberLastSeenMessage}
                                    senders={self.getMembersList('sender')}
                                    recipients={self.getMembersList('recipient')}
                                    showMerchantActions={this.showMerchantActions()}
                                    isAuthorizedToEdit={this.props.pagePermissions.isAuthorizedToEdit}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={self.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        channelId: state.chatReducer.channelId,
        chatDetail: state.chatReducer.chatDetail,
        offer: state.chatReducer.chatDetail.Channel.Offer,
        itemDetail: state.chatReducer.itemDetail,
        hasBulk: state.chatReducer.hasBulk,
        isItemDisabled: state.chatReducer.isItemDisabled,
        invoiceNo: state.chatReducer.invoiceNo,
        pagePermissions: state.userReducer.pagePermissions
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getRecipientAddresses: (userId, callback) => dispatch(ChatActions.getRecipientAddresses(userId, callback)),
        updateMemberLastSeenMessage: (memberId, messageId) => dispatch(ChatActions.updateMemberLastSeenMessage(memberId, messageId)),
        addMember: (channelId, callback) => dispatch(ChatActions.addMember(channelId, callback)),
        sendChatMessage: (message, callback) => dispatch(ChatActions.sendChatMessage(message, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const ChatComponentHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatComponent);

module.exports = {
    ChatComponentHome,
    ChatComponent
};