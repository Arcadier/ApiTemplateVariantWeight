'use strict';
var React = require('react');
var EnumCoreModule = require('../../public/js/enum-core');
var HtmlEntities = require('html-entities').AllHtmlEntities;
var entities = new HtmlEntities();

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatMessagesComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatReady: false,
            membersActive: false,
            enableSending: true,
            messages: props.messages,
            messagesContainerCss: 'right-message-bar'
        }
    }

    setMessagesContainerCss(css) {
        this.setState({ messagesContainerCss: 'right-message-bar' + (css ? ' ' + css : '') });
    }

    setChatReady() {
        this.setState({
            chatReady: true
        });
    }

    isChatReady() {
        return this.state.chatReady;
    }

    sendMessage() {
        const self = this;

        let message = $('.type-area-msg .moji-text').val();
        message = message && message.trim().length >= 0 ? message.trim() : '';

        if (message.length <= 0 && self.state.enableSending && self.state.membersActive) {
            return;
        }

        this.setState({ enableSending: false });

        let type = EnumCoreModule.GetChatEmailTypes().MessageFromBuyer;
        if (self.props.itemMerchantId === self.props.mainSenderDetail.ID) {
            type = EnumCoreModule.GetChatEmailTypes().MessageFromSeller;
        }

        self.props.sendMessage(message, type, function (response) {
            $('.type-area-msg .moji-text').val('');
            self.setState({ enableSending: true });
        });
    }

    addNewMessage(message, callback) {
        let self = this;
        let messages = self.state.messages;
        messages.push({
            Message: message.body,
            SentDateTime: message.timestamp,
            Sender: message.author
        });

        self.setState({ messages: messages });

        if (callback) {
            callback();
        }
    }

    componentDidUpdate() {
        document.querySelector('.messanger-outer').scrollTo(0, document.querySelector('.messanger-outer').scrollHeight);
    }

    renderAvatarSrc(sender) {
        if (sender.Media && sender.Media.length > 0 && sender.Media[sender.Media.length - 1])
            return true;
        else
            return false;
    }

    renderMessages() {
        const self = this;
        let counter = 0;

        return (
            self.state.messages.map(function (message) {
                counter++;
                const sender = self.props.senders.find(function (member) {
                    return member.Email === message.Sender;
                });
                if (sender) {
                    return (
                        <li className="send-msg" key={counter}>
                            <div className="user-avatar">
                                <img src={self.renderAvatarSrc(sender) ? sender.Media[sender.Media.length - 1].MediaUrl : "/assets/images/default_user.svg"} alt="recive-avatar" title="recive-avatar"/>
                            </div>
                            <div className="msg-box">
                                <div dangerouslySetInnerHTML={{ __html: entities.decode(message.Message) }}/>
                                <span className="date-time-msg">{self.props.formatDateTime(message.SentDateTime, 'DD/MM/YYYY HH:mm')}</span>
                            </div>
                        </li>
                    );
                }
                else {
                    const recipient = self.props.recipients.find(function (member) {
                        return member.Email === message.Sender;
                    });

                    if (recipient) {
                        return (
                            <li className="receive-msg" key={counter}>
                                <div className="user-avatar">
                                    <img src={self.renderAvatarSrc(recipient) ? recipient.Media[recipient.Media.length - 1].MediaUrl : "/assets/images/default_user.svg"} alt="recive-avatar" title="recive-avatar" />
                                </div>
                                <div className="msg-box">
                                    <div dangerouslySetInnerHTML={{ __html: entities.decode(message.Message) }} />
                                    <span className="date-time-msg">{self.props.formatDateTime(message.SentDateTime, 'DD/MM/YYYY HH:mm')}</span>
                                </div>
                            </li>
                        );
                    }
                }
            }));
    }

    renderMessageInput() {
        const self = this;
        if (self.state.chatReady && self.state.membersActive) {
            return (
                <div className="type-area-msg">
                    <textarea className="moji-text" placeholder="Enter your message..." onKeyPress={(e) => self.sendMesageOnKeyPress(e)} />
                    <button className="msg-send-btn" onClick={() => { self.sendMessage() }}>
                        <img src="/assets/images/send-btn-arrow.svg" alt="send" title="send" />
                    </button>
                </div>
            );
        }
        else {
            let statusMessage = "Enter your message...";
            if (!self.state.chatReady) {
                statusMessage = "Please wait while channel is loading";
            }
            if (!self.state.membersActive) {
                statusMessage = "User unavailable, contact marketplace administrator for more info";
            }

            return (
                <div className="type-area-msg">
                    <textarea className="moji-text" placeholder={statusMessage} disabled style={{ background: !self.state.chatReady || !self.state.membersActive ? "#D2D2D2" : 'transparent' }}/>
                    <button className="msg-send-btn" disabled>
                        <img src="/assets/images/send-btn-arrow.svg" alt="send" title="send" />
                    </button>
                </div>
            );
        }
    }

    sendMesageOnKeyPress(e) {
        const self = this;
        if ($(".type-area-msg .moji-text").val() == "\n") {
            $(".type-area-msg .moji-text").val('');
        }

        var message = $(".type-area-msg .moji-text").val();
        if (e.which === 13 && message !== "") {
            self.sendMessage();
        }
    }

    componentDidMount() {
        const self = this;
        if (self.props.messages.length > 0) {
            const messagesLength = self.props.messages.length;
            const recentMessage = self.props.messages[messagesLength - 1];
            self.props.updateMemberLastSeenMessage(recentMessage.SID);
        }

        if (self.props.mainSenderDetail && self.props.mainSenderDetail.Active && self.props.mainSenderDetail.Visible) {
            if (self.props.mainRecipientDetail && self.props.mainRecipientDetail.Active && self.props.mainRecipientDetail.Visible) {
                self.setState({ membersActive: true });
            }
        }
        if ($('#quotation-button').length > 0) {
            $('#quotation-button').each((i, el) => {
                if (!self.props.isAuthorizedToEdit) {
                    $(el).addClass('disabled');
                    $(el).wrap(`<span class="tool-tip inline" data-toggle="tooltip" 
                    data-placement="top" data-original-title="You need permission to perform this action"></span>`)
                }

                let onClickHandler = $(el).attr("onclick");

                if (onClickHandler && onClickHandler.indexOf('/quotation/detail') >= 0) {
                    if (self.props.showMerchantActions) {
                        const index = onClickHandler.indexOf('/quotation/detail');

                        onClickHandler = onClickHandler.substring(0, index) + '/merchants' + onClickHandler.substring(index);

                        $(el).attr("onclick", onClickHandler);
                    }
                }

                $(el).unbind("click");
                
                $(el).on('click', function () {
                    if (!self.props.isAuthorizedToEdit) return;
                    self.props.validatePermissionToPerformAction('edit-consumer-chat-details-api', () => onClickHandler);
                });
            });
        }
        $('[data-toggle="tooltip"]').tooltip();
    }

    render() {
        var self = this;
        return (
            <div className={self.state.messagesContainerCss}>
                <ul className="messanger-outer">
                    {self.state.messages && self.state.messages.length > 0 ? self.renderMessages()
                        : <li>
                            <div className="empty-page-sec">
                                <img src="/assets/images/emptypage/chat-icon.svg" alt="empty page img" />
                                <div className="empty-page-title">Type your first message!</div>
                                <div className="empty-page-message">Connect with the seller here</div>
                            </div>
                        </li>
                    }
                </ul>
                {self.renderMessageInput()}
            </div>
        );
    }
}

module.exports = ChatMessagesComponent;