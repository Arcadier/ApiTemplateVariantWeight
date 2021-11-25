'use strict';
var React = require('react');
var HTMLparse = require('html-react-parser');
var inboxAction = require('../../../redux/inboxAction');
var ReactRedux = require('react-redux');
var HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;

var FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;
var PaginationComponent = require('../../common/pagination');
var SearchComponent = require('../../chat/inbox/search');

var BaseComponent = require('../../shared/base');
class ChatComponent extends BaseComponent {

    componentDidMount() {

    }

    getCurrency(message) {

        if (message == null) return '';

        if (message.CartItemDetail && message.CartItemDetail !== null && message.CartItemDetail.CurrencyCode != null) return message.CartItemDetail.CurrencyCode;
        if (message.ItemDetail && message.ItemDetail !== null && message.ItemDetail.CurrencyCode) return message.ItemDetail.CurrencyCode;
        return '';
    }

    getSubtotalAmount(message) {
        if (message == null) return '';
        let subTotal = '';
        if (message.CartItemDetail !== null && message.CartItemDetail.SubTotal != null) {
            subTotal = message.CartItemDetail.SubTotal;
            if (message.CartItemDetail.AddOns && message.CartItemDetail.AddOns.length > 0) {
                message.CartItemDetail.AddOns.map(addOn => subTotal += parseFloat(addOn.PriceChange || 0));
            }
        }

        if (this.props.inboxDatas && this.props.inboxDatas.length > 0) {
            Array.from(this.props.inboxDatas).map(function (item, index) {
                if (item.channel.ChannelID === message.ChannelID && item.channel.Offer) {
                    subTotal = item.channel.Offer.Total;
                }
            });
        }

        return subTotal;
    }

    getItemPrice(message) {
        if (message == null) return '';
        if (message.CartItemDetail !== null && message.CartItemDetail.ItemDetail != null) return message.CartItemDetail.ItemDetail.Price;
        if (message.CartItemDetail !== null && message.ItemDetail != null) return message.ItemDetail.Price;
        return '';
    }

    getMerchantId(message) {
        if (message.CartItemDetail !== null) return message.CartItemDetail.User.ID;

        if (message.ItemDetail && message.ItemDetail.MerchantDetail !== null) return message.ItemDetail.MerchantDetail.ID;
    }

    getDisplayImage(userId, message) {
        if (message == null) return '';
        let merchantID = "";

        if (message.CartItemDetail !== null && message.CartItemDetail.ItemDetail != null && message.CartItemDetail.ItemDetail.MerchantDetail)
            merchantID = message.CartItemDetail.ItemDetail.MerchantDetail.ID;

        if (message.ItemDetail && message.ItemDetail.MerchantDetail !== null)
            merchantID = message.ItemDetail.MerchantDetail.ID;

        if (userId === merchantID) {
            if (message.CartItemDetail !== null && message.CartItemDetail.User.Media && message.CartItemDetail.User.Media.length > 0) {
                return message.CartItemDetail.User.Media[message.CartItemDetail.User.Media.length - 1].MediaUrl;
            } else {
                if (message.CartItemDetail && message.CartItemDetail.User) {
                    const user = message.CartItemDetail.User;
                    const { Members } = message;

                    if (Members && Members.length > 0) {
                        const member = Members.find(m => m.User && m.User.ID == user.ID);

                        if (member && member.User.Media && member.User.Media.length > 0) {
                            return member.User.Media[member.User.Media.length - 1].MediaUrl;
                        }
                    }
                }
            }
        } else {
            if (message.CartItemDetail !== null && message.CartItemDetail.ItemDetail != null && message.CartItemDetail.ItemDetail.MerchantDetail != null) {
                return message.CartItemDetail.ItemDetail.MerchantDetail.Media[message.CartItemDetail.ItemDetail.MerchantDetail.Media.length - 1].MediaUrl;
            }
            if (message.CartItemDetail !== null && message.ItemDetail != null) return message.ItemDetail.Media;
        }

        return '/assets/images/default_user.svg';
    }

    renderMainBoxDisplay(data) {
        let self = this;
        let hasOffer = false;
        let offerQuantity = null;
        let inboxData = null;
        let chatMessageRecent = '';

        if (this.props.inboxDatas) {
            this.props.inboxDatas.forEach(function (thisData) {
                if (data.ChannelID === thisData.channel.ChannelID) {
                    inboxData = thisData;
                    if (thisData.channel.Offer) {
                        hasOffer = true;
                        offerQuantity = inboxData.channel.Offer.Quantity;
                    }
                }
            })
            if (inboxData.messages && inboxData.messages.Records && inboxData.messages.Records.length === 1) {
                // if message is html code
                if (new RegExp(/<\/?[a-z][\s\S]*>/i).test(inboxData.messages.Records[inboxData.messages.Records.length - 1].Message)) {
                    var isMessageOffer = false;
                    var isMessageAccepted = false;

                    var theMessage = inboxData.messages.Records[inboxData.messages.Records.length - 1].Message;
                    const htmlMsg = HTMLparse(theMessage);
                    // check if latest message is an offer
                    if ((htmlMsg.props && htmlMsg.props.className == 'offer-box' && hasOffer && htmlMsg.props.children.length === 3 && htmlMsg.props.children[1].props.className == "offer-box-deal") || theMessage.indexOf('/quotation/detail?id=') > 0) {
                        isMessageOffer = true;
                    }

                    if (theMessage.indexOf('accepted-quotation') > 0) {
                        isMessageAccepted = true;
                    }

                    let messageContent = typeof htmlMsg[1] === 'string' ? (!!htmlMsg[2] ? htmlMsg[2] : '') : htmlMsg[1];
                    return (
                        <div className="col-md-7">
                            <p className="inbox-item-name">{data.CartItemDetail !== null ? data.CartItemDetail.ItemDetail.Name : data.ItemDetail.Name}</p>
                            {isMessageOffer ? <div className="offer_status">
                                <span>Sent an offer:</span>
                                <p className="price">{self.renderFormatMoney(inboxData.channel.Offer && inboxData.channel.Offer.CurrencyCode ? inboxData.channel.Offer.CurrencyCode : null, inboxData.channel.Offer && inboxData.channel.Offer.Total ? inboxData.channel.Offer.Total : 0)}</p>
                                {
                                    process.env.PRICING_TYPE == 'service_level' ? '' :
                                        <span>Order Quantity: {offerQuantity !== null ? offerQuantity : data.CartItemDetail !== null ? data.CartItemDetail.Quantity : data.ItemDetail.StockQuantity}</span>
                                }

                            </div>
                                : <div>
                                    <p className="sort-msg-description">
                                        {messageContent}
                                    </p>
                                </div>
                            }

                        </div>
                    );
                }
                chatMessageRecent = inboxData.messages.Records[inboxData.messages.Records.length - 1].Message;
            }
            return (
                <div className="col-md-7">
                    {/* <p className="inbox-item-name">{data.CartItemDetail !== null ? data.CartItemDetail.ItemDetail.Name : data.ItemDetail.Name}</p> */}
                    <p className="sort-msg-description">{chatMessageRecent}</p>
                </div>
            );

        }
    }

    renderDetails(message) {
        const self = this;
        const userId = self.props.currentUser.ID;
        let messageStatus = "enquiry";
        let messageTextStatus = "ENQUIRY";
        let sentFrom = '';

        if (userId !== self.getMerchantId(message)) {
            if (message.ItemDetail && message.ItemDetail.MerchantDetail) {
                sentFrom = message.CartItemDetail !== null ?
                    message.CartItemDetail.User.DisplayName :
                    message.ItemDetail.MerchantDetail.DisplayName;
            }
        } else {
            if (message.ItemDetail && message.ItemDetail.MerchantDetail) {
                sentFrom = message.CartItemDetail !== null ? message.ItemDetail.MerchantDetail.DisplayName : self.props.currentUser.DisplayName;
            } else {
                if (message.CartItemDetail && message.CartItemDetail.ItemDetail && message.CartItemDetail.ItemDetail.MerchantDetail)
                    sentFrom = message.CartItemDetail !== null ? message.CartItemDetail.ItemDetail.MerchantDetail.DisplayName : self.props.currentUser.DisplayName;
            }
        }

        if (this.props.inboxDatas) {
            this.props.inboxDatas.forEach(function (inboxData) {
                if (inboxData.messages && inboxData.messages.Records && inboxData.messages.Records[0]) {
                    if (message.ChannelID === inboxData.channel.ChannelID) {
                        if (inboxData.channel && inboxData.channel.Offer !== null) {
                            messageStatus = "pre-approved";
                            messageTextStatus = "PRE-APPROVED";
                            if (inboxData.channel.Offer.Accepted === true) {
                                messageStatus = "accepted";
                                messageTextStatus = "ACCEPTED";
                            }

                            if (inboxData.channel.Offer.Declined === true) {
                                messageStatus = "declined";
                                messageTextStatus = "DECLINED";
                            }
                            if (inboxData.channel.Offer.MessageType && inboxData.channel.Offer.MessageType.toLowerCase() === "cancelled") {
                                messageStatus = "cancelled";
                                messageTextStatus = "CANCELLED";
                            }
                        }
                    }
                }
            });
        }

        return (
            <React.Fragment>
                <div className="col-md-3" key={message.ID}>
                    <span className="inbox-not-read"></span>
                    <div className="user-avatar">
                        <img src={self.getDisplayImage(userId, message)} title="user-avatar" />
                    </div>
                    <div className="user-info">
                        <h3 className="user_name">{sentFrom}</h3>
                        <span className="time_status">{self.formatDateTime(message.ModifiedDateTime)}</span>
                    </div>
                </div>
                {
                    self.renderMainBoxDisplay(message)
                }
                <div className="col-md-2">
                    <div className="text-center">{self.renderFormatMoney(self.getCurrency(message), self.getSubtotalAmount(message))}</div>
                    <div className="text-center"><span className={messageStatus} onClick={(e) => this.props.goChannelMessages(e)}>{messageTextStatus}</span></div>
                </div>
            </React.Fragment>
        );
    }

    renderMenu() {
        if (typeof this.props.currentUser !== 'undefined' && this.props.currentUser != null && this.props.currentUser.Roles != null) {
            return (<HeaderLayoutComponent categories={this.props.messages.length > 0 ? this.props.categories : []} user={this.props.currentUser} />);
        }

        return '';
    }

    render() {
        let self = this;
        const messages = this.props.messages;
        const filters = {
            keyword: this.props.keyword
        };

        const inboxPanelClass = messages.TotalRecords > 0 ? 'inbox-panel-outer' : 'inbox-panel-outer hide';
        let emptyState = messages.TotalRecords > 0 ? 'hide' : '';
        let pagingState  = messages.TotalRecords < 0 ? 'hide' : '';
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    {this.renderMenu()}
                </div>
                <div className="main">
                    <div className="inbox-container">
                        <div className="container">
                            <SearchComponent searchInbox={this.props.searchInbox} />
                            <div className={inboxPanelClass}>
                                {
                                    messages.Records.map(function (message) {
                                        let isRecent = "";
                                        self.props.inboxDatas.forEach(function (data) {
                                            if (data.channel.ChannelID === message.ChannelID) {
                                                if (data.isNewMessage === true) {
                                                    isRecent = "recent";
                                                }
                                            }
                                        })
                                        let classBox = "";
                                        return (
                                            <div className={"panel-box " + isRecent} key={message.ChannelID} onClick={() => window.location.href = '/chat?channelId=' + message.ChannelID}>
                                                {self.renderDetails(message)}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className={emptyState}>
                                <div className="empty-page-sec">
                                    <img src="/assets/images/emptypage/message-icon.svg" alt="empty page img" />
                                    <div className="empty-page-title">Empty inbox?</div>
                                    <div className="empty-page-message">No messages has been sent between users</div>
                                </div>
                            </div>
                            <PaginationComponent pagingState={pagingState}
                                totalRecords={messages.TotalRecords}
                                pageNumber={messages.PageNumber}
                                pageSize={messages.PageSize}
                                goToPage={this.props.goToPage}
                                filters={filters} />
                        </div>
                    </div>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        messages: state.inboxReducer.messages,
        keyword: state.inboxReducer.keyword,
        currentUser: state.userReducer.user,
        inboxDatas: state.inboxReducer.inboxDatas
    };
}

function mapDispatchToProps(dispatch) {
    return {
        searchInbox: (e) => dispatch(inboxAction.searchInbox(e)),
        goToPage: (pageNo, filters) => dispatch(inboxAction.goToPage(pageNo, filters))
    };
}

const ChatInboxPage = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatComponent);

module.exports = {
    ChatInboxPage,
    ChatComponent
};
