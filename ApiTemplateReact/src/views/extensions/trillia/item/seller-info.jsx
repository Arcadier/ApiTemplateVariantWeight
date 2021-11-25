'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var toastr = require('toastr');
var actionTypes = require('../../../../redux/actionTypes');

class SellerInfoComponent extends React.Component {

    getItemByCountry(parentItem, callback) {
        const self = this;
        let item = {};

        if (parentItem.HasChildItems && parentItem.ChildItems) {
            parentItem.ChildItems.forEach(function (child) {
                if (child.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    item = child;
                }
            })
        }

        if (typeof callback === 'function') {
            callback(item);
        }
    }

    contactSupplier() {
        const self = this;
        const userDetail = self.props.user;
        const itemDetail = self.props.itemDetails;

        if (userDetail.ID === itemDetail.MerchantDetail.ID) {
            toastr.error('Cannot open chat, this item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }

        const parentItem = self.props.itemDetails;
        let item = self.props.itemDetails;
        const priceValues = self.props.priceValues;

        if (parentItem.HasChildItems) {
            if (process.env.TEMPLATE === 'trillia') {
                this.getItemByCountry(parentItem, function (result) {
                    item = result;
                });
            }
        }

        const options = {
            pageSize: 1000,
            pageNumber: 1,
            includes: ['CartItemDetail', 'ItemDetail', 'User']
        }
        self.props.getUserChannels(options, function (channels) {
            let createNewChannel = false;
            let channel = null;

            //TODO: adjust API to include and check for open channels with pending offer
            if (channels && channels.TotalRecords === 0) {
                createNewChannel = true;
            }
            else {
                channel = channels.Records.find(p => p.CartItemDetail.ItemDetail.ID === item.ID);
                createNewChannel = !channel;
            }

            if (createNewChannel) {
                self.props.createChatChannel({
                    recipientId: itemDetail.MerchantDetail.ID,
                    itemId: item.ID,
                    quantity: 0,
                    createCartItem: process.env.TEMPLATE !== 'bespoke'
                }, function (newChannel) {
                    if (newChannel && newChannel !== "") {
                        window.location = "/chat/enquiry?channelId=" + newChannel.ChannelID;
                    }
                    else {
                        toastr.error('Error creating chat channel.', 'Error!');
                    }
                })
            }
            else {
                toastr.error('You still have an open channel/offer for this item.', 'Oops! Something went wrong.');
                window.location = "/chat?channelId=" + channel.ChannelID;
            }
        });
    }

    render() {
        let self = this;
        let storeFrontUrl = "/storefront/" + self.props.merchantDetails.ID;
        let merchantImage = "";
        if (self.props.merchantDetails.Media && self.props.merchantDetails.Media[0]) {
            merchantImage = self.props.merchantDetails.Media[0].MediaUrl;
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
                        <a onClick={() => this.contactSupplier()}>
                            <span className="btn-contact">Contact Supplier
                                <i className="fa fa-envelope"></i>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SellerInfoComponent;