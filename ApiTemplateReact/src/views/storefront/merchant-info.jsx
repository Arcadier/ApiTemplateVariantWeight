'use strict';
const React = require('react');
const BaseComponent = require('../shared/base');
const moment = require('moment');

class MerchantInfo extends BaseComponent {

    setMediaUrl(merchantUser) {

        const latestIndex = merchantUser && merchantUser.Media ? merchantUser.Media.length - 1 : 0;
        if (merchantUser.Media[latestIndex])
            return merchantUser.Media[latestIndex].MediaUrl

        return ''
    }

    getAllMerchantAverage() {

        var self = this;

        if (self.props.allMerchantFeedback) {
            if (typeof self.props.allMerchantFeedback == 'undefined' ||
                typeof self.props.allMerchantFeedback.Records == 'undefined' ||
                self.props.allMerchantFeedback != [] && !self.props.allMerchantFeedback ||
                self.props.allMerchantFeedback.TotalRecords < 1 ||
                self.props.allMerchantFeedback.Records < 1) {
                return 0
            }

            var total = self.props.allMerchantFeedback.Records.map(feedback => feedback.AverageRating).reduce((accumulator, feedback) => feedback + accumulator);
            var average = (total / (self.props.allMerchantFeedback.TotalRecords * 5)) * 100;

            return average.toFixed(2);
        }
        return 0;
    }
    renderRating() {
        var self = this;
        return (
            <div className="store-rating">
                <span className="stars"><span style={{ width: `${self.getAllMerchantAverage()}%` }} /></span>
                <span className="feedback-text">({`${self.getAllMerchantAverage()}%`} positive feedback)</span>
            </div>
        );
    }

    renderCustomFieldData() {
        var self = this;
        const { customFieldDefinitions } = self.props;

        var htmlElements = [];
        var propertyListing = [];

        if (customFieldDefinitions && customFieldDefinitions.Records) {
            propertyListing = customFieldDefinitions.Records.filter(r => r.GroupName !== "" || r.GroupName !== null);
        }

        var propertyListingValue = self.props.merchantUser.CustomFields;

        //ARC-10486
        if (propertyListing && propertyListing.length > 0) {
            const propertyInputTypeViewOrder = ["image", "textfield", "dropdown", "checkbox", "datetime", "hyperlink / url", "upload"];
            propertyListing = propertyListing.sort((a, b) => propertyInputTypeViewOrder.indexOf(a.DataInputType.toLowerCase()) - propertyInputTypeViewOrder.indexOf(b.DataInputType.toLowerCase()));
        }

        propertyListing.forEach(function (propList, index) {
            var filteredValue = null;

            if (propertyListingValue) {
                filteredValue = propertyListingValue.filter(d => d.Code == propList.Code);
            }

            if (filteredValue && filteredValue.length > 0 && typeof (filteredValue) != 'undefined') {
                var theValue = filteredValue[0];

                if (propList.DataInputType.toLowerCase() == 'textfield' && !["user_seller_location", "user_preferred_location"].includes(propList.Name.toLowerCase())) {
                    htmlElements.push(<p key={index}><span>{theValue.Values[0]}</span></p>);
                } else if (propList.DataInputType.toLowerCase() == 'dropdown') {
                    htmlElements.push(<p key={index}><span>{theValue.Values[0]}</span></p>);
                } else if (propList.DataInputType.toLowerCase() == 'checkbox') {
                    theValue.Values.forEach(function (f, ind) {
                        htmlElements.push(<p key={index + '-' + ind}><span>{f}</span></p>);
                    });
                } else if (propList.DataInputType.toLowerCase() == 'upload') {
                    htmlElements.push(<p key={index}><img src="/assets/images/pdf-icon.svg" alt="location-icon.svg" align="absmiddle" />&nbsp;<a target="_blank" href={theValue.Values[0]}><span>Download {theValue.Values[0].substr(0, 24)}&hellip;</span></a></p>);
                } else if (propList.DataInputType.toLowerCase() == 'datetime') {
                    let datetime = moment.unix(theValue.Values[0]).utc().local().format('DD/MM/YYYY hh:mm A');
                    htmlElements.push(<p key={index}><span>{datetime}</span></p>);
                } else if (propList.DataInputType.toLowerCase() == 'image') {
                    if (theValue.Values[0]) {
                        htmlElements.push(<div key={index} className="merchant-right-img"><img height="150" align="absmiddle" target="_blank" src={theValue.Values[0]} /></div>);
                    }
                } else if (propList.DataInputType.toLowerCase() == 'hyperlink / url') {
                    if (theValue.Values[0].indexOf('http') == 0 || theValue.Values[0].indexOf('https') == 0) {
                        htmlElements.push(<p key={index}><a target="_blank" href={theValue.Values[0]}><span>{theValue.Values[0]}</span></a></p>);
                    } else {
                        htmlElements.push(<p key={index}><a target="_blank" href={"https://" + theValue.Values[0]}><span>{theValue.Values[0]}</span></a></p>);
                    }
                }
            }
        });

        var userLocation = null;
        if (self.props.merchantUser.CustomFields) {
            userLocation = self.props.merchantUser.CustomFields.filter(d => d.Name == "user_seller_location");
        }

        if (userLocation && userLocation.length > 0 && userLocation[0].Values && userLocation[0].Values.length > 0) {
            htmlElements.push(<p key={'location'}><img src="/assets/images/location.svg" />{userLocation[0].Values[0]}</p>);
        }
        htmlElements.push(<p key={'visitor'}>{self.props.merchantTotalVisits} Visitors</p>);
        htmlElements.push(<p key={'order'}>{self.props.merchantUser.TotalSuccessfulOrderCount} Successful orders</p>);
        htmlElements.push(<p key={'member'}>Member since {self.rawFormatDateTime(self.props.merchantUser.DateJoined, "MMMM/YYYY")}</p>);

        return htmlElements;
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="store-detail-box">
                    <div className="col-sm-8">
                        <div className="thumb-outer">
                            <img src={self.setMediaUrl(self.props.merchantUser)} alt="" title="" />
                        </div>
                        <div className="store-description">
                            <h3 className="merchant-name">{self.props.merchantUser.DisplayName}</h3>
                            <span className="user-location">{self.props.sellerCountry}</span>
                            {self.props.ReviewAndRating === true ? self.renderRating() : ''}
                            <p className="merchant-description">
                                {self.props.merchantUser.Description}
                            </p>
                            <ul className="count-detial">
                                <li>Member since <span className="year-of-join">{self.formatYear(self.props.merchantUser.DateJoined)}</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="storefron-top-right">
                            <div className="store-location-box">
                                <div>{this.renderCustomFieldData()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = MerchantInfo;