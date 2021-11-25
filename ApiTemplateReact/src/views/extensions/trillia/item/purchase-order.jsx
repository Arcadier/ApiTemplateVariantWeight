'use strict';
var React = require('react');
var toastr = require('toastr');

var BaseComponent = require('../../../../views/shared/base');
var EnumCoreModule = require('../../../../public/js/enum-core');

class PurchaseOrderComponent extends BaseComponent {
    addItemToCart() {
        const self = this;

        if (this.props.processing === true) {
            return;
        }

        const parentItem = this.props.itemDetails;
        let item = this.props.itemDetails;
        const priceValues = this.props.priceValues;

        if (parentItem.HasChildItems) {
            if (process.env.TEMPLATE === 'trillia') {
                this.getItemByCountry(parentItem, function (result) {
                    item = result;
                })
            }
        }

        if (priceValues.quantity < 1) {
            toastr.error('Please enter quantity.', 'Error!');
            return;
        }

        $('.not-enough-stock-error-container').hide();
        $('.minimum-order-not-met-error-container').hide();

        if (item.StockLimited === true) {
            if ((parseInt(item.StockQuantity) - priceValues.quantity) < 0) {
                $('.not-enough-stock-error-container').show();
                return;
            }

            if (parseInt(item.StockQuantity) <= 0) {
                $(".compare-btn").attr("disabled", true);
                return;
            }
        }

        this.props.setProcessing(true);

        if (process.env.TEMPLATE === 'trillia') {
            this.validateMOQ(item.CustomFields, priceValues.quantity, function() {
                self.validateComparison(item.ID,
                    function (comparisonCartItemId) {
                        self.props.addOrEditCart(comparisonCartItemId, priceValues.quantity, priceValues.discount, item.ID, true,
                            function (cartItem) {
                                if (comparisonCartItemId !== cartItem.ID) {
                                    self.props.createComparisonDetail(cartItem.ID, 'CartItem', self.getComparisonFields(parentItem));
                                } else {
                                    self.props.updateComparisonDetail(cartItem.ID, cartItem.Quantity, cartItem.SubTotal, cartItem.DiscountAmount);
                                }

                                self.props.showHideWidget(true);
                            },
                            function (errorMessage) {
                                self.showMessage(errorMessage);
                            }
                        )
                    }
                )
            });
        }

        setTimeout(function () {
            self.props.setProcessing(false);
        }, 1000);
    }

    validateMOQ(customFields, quantity, callback) {
        let moq = 0;

        if (customFields) {

            customFields.forEach(function (customField) {
                if (customField.Name.toLowerCase() == 'moq') {
                    customField.Values.forEach(function (value) {
                        moq = parseFloat(value);
                    });
                }
            });
        }

        if (quantity >= moq) {
            if (typeof callback === 'function') {
                callback();
            }
        } else {
            $('.minimum-order-not-met-error-container').show();
        }
    }

    validateComparison(itemId, callback) {
        const comparison = this.props.comparison;
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

    getComparisonFields(parentItem) {
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

    negotiate() {
        const self = this;
        if (this.props.processing === true) {
            return;
        }
        this.props.setProcessing(true);

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
                })
            }
        }

        if (priceValues.quantity < 1) {
            toastr.error('Please enter quantity.', 'Error!');
            return;
        }

        const options = {
            pageSize: 1000,
            pageNumber: 1,
            includes: ['CartItemDetail', 'ItemDetail', 'User']
        }
        this.props.getUserChannels(options, function (channels) {
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
                        quantity: priceValues.quantity,
                        createCartItem: process.env.TEMPLATE !== 'bespoke'
                    }, function (newChannel) {
                        if (newChannel && newChannel !== "") {
                            window.location = "/chat/enquiry?channelId=" + newChannel.ChannelID;
                        }
                        else {
                            toastr.error('Error creating chat channel.', 'Error!');
                            self.props.setProcessing(false);
                        }
                    })
                }
                else {
                    window.location = "/chat?channelId=" + channel.ChannelID;
                }
            });
        });
    }

    formatNumberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    renderPrice() {
        let self = this;
        if (this.props.itemDetails.ChildItems != null) {
            let ele = this.props.itemDetails.ChildItems.map(function (itemDetail, index) {
                if (itemDetail.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    return (
                        <div key={index} className="item-price">
                            {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, itemDetail.Price)}
                        </div>
                    )
                }
            })
            return ele;
        } else {
            return (
                <div className="item-price">
                    {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, self.props.itemDetails.Price)}
                </div>
            )
        }
    }

    render() {
        let self = this;
        let priceValue = this.props.itemDetails.Price;
        let bulks = [];
        let moq = 0;
        if (this.props.itemDetails.ChildItems != null) {
            this.props.itemDetails.ChildItems.forEach(function (itemDetail) {
                if (itemDetail.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    priceValue = itemDetail.Price;
                    if (itemDetail.CustomFields != null) {
                        itemDetail.CustomFields.forEach(function (childCustomField) {
                            if (childCustomField.Name.toLowerCase() == 'moq') {
                                childCustomField.Values.forEach(function (value) {
                                    moq = parseFloat(value).toFixed();
                                });
                            }
                            if (childCustomField.Name.toLowerCase() == 'bulkpricing') {
                                childCustomField.Values.forEach(function (value) {
                                    let parsebulk = JSON.parse(value);
                                    parsebulk.forEach(function (bulk) {
                                        let bulkValues = {
                                            ID: bulk.Id,
                                            RangeStart: bulk.RangeStart,
                                            RangeEnd: bulk.RangeEnd,
                                            isPercentage: bulk.IsFixed == '0' ? true : false,
                                            Discount: bulk.Discount,
                                            OnwardPrice: bulk.OnwardPrice
                                        };
                                        bulks.push(bulkValues);
                                    })
                                })
                            }
                        })
                    }
                }
            });
        }
        return (
            <div className="idcr-top pull-left w-100">
                <div className="idcrt-order-val pull-left w-100">
                    <span className="idcrt-title">Purchase Order</span>
                    <div className="idcrt-list-val">
                        <span className="idcrtl-price full-width">
                            <span className="title">Price per item:</span>
                            <span className="idcrtl-right">
                                {this.renderPrice()}
                            </span>
                        </span>
                        <span className="idcrtl-qty full-width">
                            <span className="title">Quantity:</span>
                            <span className="idcrtl-right">
                                <input name="item-qty" type="number" onChange={(e) => this.props.updateQuantity(e, priceValue, bulks)} className="numbersOnlyD" min="0" />
                            </span>
                        </span>
                        <span className="idcrtl-moq full-width">
                            <span className="title">Minimum Order:</span>
                            <span className="idcrtl-right">
                                <span className="moq-val">{this.formatNumberWithCommas(moq)}</span>
                            </span>
                        </span>
                        <div className="error-message full-width">
                            <p className="not-enough-stock-error-container" style={{ display: 'none' }}>Not enough stock</p>
                            <p className="minimum-order-not-met-error-container" style={{ display: 'none' }}>Minimum order not met</p>
                        </div>
                    </div>
                </div>
                <div className="idcrt-order-total group-buy pull-left w-100">
                    <span className={"pull-left realPrice " + self.props.haveBulk}>Original Price:</span>
                    <span className={"total-price pull-right " + self.props.haveBulk}>
                        <div className="realPrice">
                            <del>
                                {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, self.props.priceValues.originalPrice)}
                            </del>
                        </div>
                    </span>
                    <div className="clearfix"></div>
                    <span className="pull-left">Sub Total:</span><span className="total-price pull-right">
                        <div className="item-price">
                            {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, self.props.priceValues.bulkPrice)}
                        </div>
                    </span>
                </div>
                <div className="idcrt-order-btn pull-left w-100">
                    <div className="btn-group compare-btn" id="itemAddCompare" onClick={(e) => this.addItemToCart()}>Add to Evaluation</div>
                    <div className="btn-group" id="negotiate" onClick={() => this.negotiate()}>Negotiate</div>
                </div>
            </div>
        );
    }
}

module.exports = PurchaseOrderComponent;