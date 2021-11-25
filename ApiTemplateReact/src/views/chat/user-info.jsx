'use strict';
var React = require('react');
var Moment = require('moment');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatUserInformationComponent extends React.Component {
    getDateJoined() {
        const dateJoined = Moment.unix(this.props.userDetail.DateJoined).utc().local().format('DD/MM/YYYY');
        return Moment(dateJoined, "DD/MM/YYYY").year();
    }

    renderUserName() {
        var self = this;
        const userDetail = self.props.userDetail;
        if (self.props.isNotSamePerson) {
            return (
                <h3 className="user_name" onClick={(e) => { window.location.href = '/storefront/' + userDetail.ID + '?redirectUrl=' + window.location.href }}>{userDetail.DisplayName}</h3>
            );
        }
        else {
            return (
                <h3 className="user_name">{userDetail.DisplayName}</h3>
            );
        }
    }

    componentDidMount() {
        const self = this;
        const userDetail = self.props.userDetail;
        self.props.getRecipientAddresses(userDetail.ID, function (response) {
            if (response[0]) {
                const location = response[0].Records ? response[0].Records[0].Country : null;
                if (response[0].Records && location && response[0].Records[0]) {
                    $('.user-location').text(location);
                }
            }
        });
    }

    render() {
        var self = this;
        const userDetail = self.props.userDetail;
        let imgSrc = "/assets/images/default_user.svg";
        if (userDetail.Media && userDetail.Media.length > 0 && userDetail.Media[userDetail.Media.length - 1]) {
            imgSrc = userDetail.Media[userDetail.Media.length - 1].MediaUrl;
        }

        return (
            <div>
                <div className="user-bar">
                    <a href={"/chat/inbox"} className="back"><img src="/assets/images/back-arrow.svg" alt="back to list" title="back to list" /></a>
                    <div className="user-avatar">
                        <img src={imgSrc} alt="user-avatar" title="user-avatar" />
                    </div>
                    <div className="user-info">
                        {self.renderUserName()}
                        <span className="user-location"></span>
                    </div>
                </div>
                <div className="user-sort-info">
                    <ul className="count-detial">
                        <li>Member since <span className="year-of-join">{self.getDateJoined()}</span></li>
                    </ul>
                    <p className="intro-description">{userDetail.Description}</p>
                </div>
            </div>
        );
    }
}

module.exports = ChatUserInformationComponent;