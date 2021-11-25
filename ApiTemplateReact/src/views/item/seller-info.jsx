'use strict';
const React = require('react');
const toastr = require('toastr');
const BaseComponent = require('../../views/shared/base');
const EnumCoreModule = require('../../public/js/enum-core');
var PermissionTooltip = require('../common/permission-tooltip');

class SellerInfoComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedVariantIDs: new Map(),
        }
    }

    componentDidMount() {
        const self = this;
        $('.idcrt-order-val select').on('change', function () {
            const groupID = $(this).attr('data-group-id');
            self.setState({
                selectedVariantIDs: self.state.selectedVariantIDs.set(groupID, this.value)
            })
        });
    }
    
    getItem() {
        const { HasChildItems, ChildItems } = this.props.itemDetails;
        const { selectedVariantIDs } = this.state;
        const selectedVariantArr = [...selectedVariantIDs.values()];
        let item = this.props.itemDetails;

        // get child item with variants that matches the current selected variants
        if (HasChildItems && ChildItems.length > 0 && selectedVariantArr) {
            for (const ch in ChildItems) {
                const { Variants } = ChildItems[ch];
                if (Variants && Variants.length === selectedVariantArr.length) {
                    const variantIds = Variants.map(v => v.ID);
                    const isMatch = selectedVariantArr.every(e => variantIds.includes(e));
                    if (!isMatch) continue;

                    item = ChildItems[ch];
                }
            }
        }

        return item;
    }

    contactSupplier() {
        const self = this;
        const userDetail = self.props.user;
        const itemDetail = self.props.itemDetails;

        if (this.props.processing == true) return;

        let item = itemDetail.HasChildItems ? this.getItem() : itemDetail;
        if (userDetail.ID === itemDetail.MerchantDetail.ID) {
            toastr.error('Cannot open chat, this item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }

        this.props.setProcessing(true);

        const options = {
            pageSize: 100,
            pageNumber: 1,
            includes: ['CartItemDetail', 'ItemDetail', 'User']
        };

        self.props.getUserChannels(options, function (channels) {
            let createNewChannel = false;
            let channel = null;

            //TODO: adjust API to include and check for open channels with pending offer
            if (channels && channels.TotalRecords === 0) {
                createNewChannel = true;
            } else {
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
                    self.props.createChatChannel({
                        recipientId: itemDetail.MerchantDetail.ID,
                        itemId: item.ID,
                        quantity: 0,
                        createCartItem: true
                    }, function (newChannel) {
                        if (newChannel && newChannel !== "") {
                            window.location = "/chat?channelId=" + newChannel.ChannelID;
                        } else {
                            toastr.error('Error creating chat channel.', 'Error!');
                            self.props.setProcessing(false);
                        }
                    });
                } else {
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

            const item = self.getItem();
            const { priceValues } = self.props;

            if (self.props.user && parentItem.MerchantDetail.ID === self.props.user.ID) {
                toastr.error('This item seems to belong to you.', 'Oops! Something went wrong.');
                return;
            }

            self.props.setProcessing(true);

            validateComparison(item.ID,
                function (comparisonCartItemId) {
                    const options = {
                        selectedQuantity: priceValues.quantity,
                        discount: priceValues.discount,
                        itemId: item.ID,
                        force: true,
                        isComparisonOnly: true
                    }
                    self.props.addOrEditCart(comparisonCartItemId, priceValues.quantity, options,
                        function (cartItem) {
                            if (cartItem && cartItem.ID) {
                                if (comparisonCartItemId !== cartItem.ID) {
                                    self.props.createComparisonDetail(cartItem.ID, 'CartItem', getComparisonFields(parentItem));
                                    self.props.deleteCartItem(cartItem.ID, self.props.user.ID);
                                } else {
                                    self.props.updateComparisonDetail(cartItem.ID, cartItem.Quantity, cartItem.SubTotal, cartItem.DiscountAmount);
                                }
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
                        <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToAdd} >
                            <a onClick={() => this.handleContactSupplierBtnClick()} className={"blue-ico-link " + isNegotiate + " " + isDisabled } href="#">
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