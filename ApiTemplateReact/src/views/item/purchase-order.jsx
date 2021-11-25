'use strict';
const React = require('react');
const toastr = require('toastr');
const Currency = require('currency-symbol-map');
const CommonModule = require('../../public/js/common');
const BaseComponent = require('../../views/shared/base');
const MoqComponent = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/item-details/moq');
const OriginalPriceComponent = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/item-details/original-price');
var PermissionTooltip = require('../common/permission-tooltip');

class PurchaseOrderComponent extends BaseComponent {
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
            }, function () {
                const { bulkPricing, priceValues } = self.props;
                const itemPrice = self.getItemPrice();

                self.props.updateQuantity(priceValues.quantity, itemPrice, bulkPricing);
            });
        });

        // reset values of uncontrolled react components
        if (window) {
            $(window).on('pageshow', function () {
                $('.idcrt-order-val select').each(function () {
                    $(this).val('');
                });
                $('input[name="item-qty"]').val('');
            });
        }

        this.setThumbnailImage();
    }

    componentDidUpdate() {
        if ($('span.total-stock').length > 0) {
            const item = this.getItem();
            const totalStock = item.StockLimited == false ? "&infin;" : item.StockQuantity || 0;

            $('span.total-stock').html(totalStock);
        }

        this.setThumbnailImage();
    }

    inRange(x, min, max) {
        return ((x - min) * (x - max) <= 0);
    }

    addItemToCart(e) {
        const self = this;
        if (!this.props.permissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-item-details-api', () => {
            if (self.props.processing === true) {
                return;
            }

            $('.minimum-order-not-met-error-container').hide();
            $('.not-enough-stock-error-container').hide();
            $('.required').removeClass('error-con');

            if (self.props.user.Guest && self.props.controlFlags.GuestCheckoutEnabled === false) {
                toastr.error('Feature not available yet for guest user.')
                return;
            }

            let hasEmpty = false;
            $('.idcrt-order-val .required').each(function () {
                if ($.trim(jQuery(this).val()) == '') {
                    hasEmpty = true;
                    $(this).addClass('error-con');
                }
            });
            if (hasEmpty == true) return;

            const parentItem = self.props.itemDetails;
            const { HasChildItems, ChildItems } = parentItem;
            if (HasChildItems && ChildItems.length > 0) {
                if (ChildItems[0].Variants && ChildItems[0].Variants.length > 0) {
                    if (this.state.selectedVariantIDs.size !== ChildItems[0].Variants.length) {
                        return;
                    }
                }
            }
            let item = self.getItem();
            const { priceValues } = self.props;
            if (priceValues.quantity < 1) {
                toastr.error('Please enter quantity.', 'Error!');
                $('input[name="item-qty"]').addClass('error-con');
                return;
            }

            if (item.StockLimited === true) {
                if ((parseInt(item.StockQuantity) - priceValues.quantity) < 0) {
                    $('.not-enough-stock-error-container').show();
                    $('input[name="item-qty"]').addClass('error-con');
                    return;
                }
            }

            if (self.props.user && parentItem.MerchantDetail.ID === self.props.user.ID) {
                toastr.error('This item seems to belong to you.', 'Oops! Something went wrong.');
                return;
            }

            const moq = self.getMoq();
            if (moq && moq > priceValues.quantity) {
                $('.minimum-order-not-met-error-container').show();
                $('input[name="item-qty"]').addClass('error-con');
                return;
            }

            self.props.setProcessing(true);

            let guestUserID = "";
            if (!self.props.user) {
                if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                    guestUserID = CommonModule.getCookie("guestUserID");
                }
            }

            const options = {
                pageSize: 100,
                pageNumber: 1,
                includes: null,
                guestUserID: guestUserID
            };

            self.props.getUserCarts(options, function (cartList) {
                let quantityToPass = priceValues.quantity;
                let cartItemId = null;

                if (process.env.PRICING_TYPE != 'service_level') {
                    const itemExistsInCart = cartList.find(cl => cl.ItemDetail.ID == item.ID);
                    cartItemId = itemExistsInCart ? itemExistsInCart.ID : null;

                    if (itemExistsInCart) {
                        quantityToPass = parseInt(priceValues.quantity) + parseInt(itemExistsInCart.Quantity);
                    }
                }
                const options = {
                    selectedQuantity: priceValues.quantity,
                    discount: priceValues.discount,
                    itemId: item.ID,
                    force: true,
                    isComparisonOnly: false,
                    ServiceBookingUnitGuid: null,
                    bookingSlot: null
                };

                //ARC-8246
                if (cartItemId) {
                    const { bulkPricing, priceValues } = self.props;
                    const itemPrice = self.getItemPrice();

                    if (process.env.PRICING_TYPE == 'country_level') {
                        if (bulkPricing != null) {
                            let breakNow = false;
                            bulkPricing.forEach(function (bulk) {
                                if (breakNow == true) {
                                    return false;
                                }
                                let bulkComputation = (itemPrice * quantityToPass) - (quantityToPass * bulk.Discount);
                                if (bulk.IsFixed == '0') {
                                    bulkComputation = (itemPrice * quantityToPass) - ((itemPrice * quantityToPass) * bulk.Discount) / 100;
                                }
                                if (bulk.RangeStart !== undefined) {
                                    if (self.inRange(quantityToPass, parseInt(bulk.RangeStart), parseInt(bulk.RangeEnd)) == true) {
                                        options.discount = (itemPrice * quantityToPass) - bulkComputation
                                        breakNow = true;
                                    }
                                } else {
                                    //OnwardPrice
                                    if (bulk.OnwardPrice !== undefined) {
                                        if (quantityToPass >= parseInt(bulk.OnwardPrice)) {
                                            options.discount = (itemPrice * quantityToPass) - bulkComputation
                                            breakNow = true;
                                        }
                                    }
                                }
                            })
                        }
                    }
                }

                self.props.addOrEditCart(cartItemId, quantityToPass, options,
                    (cartItem) => self.handleAddToCartSuccess(),
                    (errorMessage) => self.showMessage(errorMessage)
                );
            });
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            setTimeout(function () {
                self.props.setProcessing(false);
            }, 1000);
        });
    }

    contactSeller() {
        const self = this;
        if (!this.props.permissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-item-details-api', () => {
            if (self.props.processing === true) {
                return;
            }

            $('.minimum-order-not-met-error-container').hide();
            $('.not-enough-stock-error-container').hide();
            $('.required').removeClass('error-con');

            const userDetail = self.props.user;
            const itemDetail = self.props.itemDetails;

            if (userDetail.ID === itemDetail.MerchantDetail.ID) {
                toastr.error('Cannot open chat, this item seems to belong to you.', 'Oops! Something went wrong.');
                return;
            }

            const parentItem = self.props.itemDetails;
            let item = parentItem.HasChildItems ? self.getItem() : self.props.itemDetails;
            const priceValues = self.props.priceValues;

            const options = {
                pageSize: 100,
                pageNumber: 1,
                includes: ['CartItemDetail', 'ItemDetail', 'User']
            }
            //https://arcadier.atlassian.net/browse/ARC-9117
            let hasEmpty = false;
            $('.idcrt-order-val .required').each(function () {
                if ($.trim(jQuery(this).val()) == '') {
                    hasEmpty = true;
                    $(this).addClass('error-con');
                }
            });

            if (self.props.priceValues.quantity < 1) {
                toastr.error('Please enter quantity.', 'Error!');
                $('input[name="item-qty"]').addClass('error-con');
                return;
            }

            //https://arcadier.atlassian.net/browse/ARC-9117
            if (hasEmpty) return;

            if (item.StockLimited === true) {
                if ((parseInt(item.StockQuantity) - priceValues.quantity) < 0) {
                    $('.not-enough-stock-error-container').show();
                    $('input[name="item-qty"]').addClass('error-con');
                    return;
                }
            }

            self.props.setProcessing(true);

            self.props.getUserChannels(options, function (channels) {
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
                $(".btn-loader").addClass('btn-loading');
                getChatDetails(channel, function (chatDetails) {
                    if (chatDetails && chatDetails.Channel && chatDetails.Channel.Offer && chatDetails.Channel.Offer.Accepted) {
                        createNewChannel = true;
                    }

                    if (createNewChannel) {
                        self.props.createChatChannel({
                            recipientId: itemDetail.MerchantDetail.ID,
                            itemId: item.ID,
                            quantity: priceValues.quantity,
                            createCartItem: true
                        }, function (newChannel) {
                            $(".btn-loader").removeClass('btn-loading');
                            if (newChannel && newChannel != "") {
                                window.location = "/chat?channelId=" + newChannel.ChannelID;
                            } else {
                                toastr.error('Error creating chat channel.', 'Error!');
                                self.props.setProcessing(false);
                            }
                        });
                    }
                    else {
                        $(".btn-loader").removeClass('btn-loading');
                        toastr.error('You still have an open channel/offer for this item.', 'Oops! Something went wrong.');
                        window.location = "/chat?channelId=" + channel.ChannelID;
                    }
                });
            });
        });
    }

    getLatestCartList() {
        let guestUserID = "";

        if (this.props.user && this.props.user.Guest !== undefined) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }
        if (!this.props.user) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }

        const options = {
            pageSize: 100,
            pageNumber: 1,
            includes: null,
            guestUserID: guestUserID
        };

        this.props.getUserCarts(options, null);
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

    getItemPrice() {
        return this.getItem().Price || 0;
    }

    getMoq() {
        const { ChildItems } = this.props.itemDetails;
        let moq = '';

        if (ChildItems && ChildItems.length > 0) {
            const { CustomFields } = ChildItems[0];

            if (CustomFields && CustomFields.length > 0) {
                const moqCustomField = CustomFields.find(c => c.Code.startsWith('moq'));

                if (moqCustomField && moqCustomField.Values && moqCustomField.Values.length > 0) {
                    moq = parseFloat(moqCustomField.Values[0]).toFixed();
                }
            }
        }

        return moq;
    }

    handleAddToCartSuccess() {
        function fadeOutCart() {
            var target = $(".h-cart .h-dd-menu.add-cart");
            setTimeout(function () {
                target.removeClass('fadeout');
            }, 3000);
        }

        function isMobile() {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)) {
                return true;
            }
            return false;
        }

        const { CurrencyCode, Media, Name } = this.props.itemDetails;
        const { bulkPricing, priceValues } = this.props;
        this.getLatestCartList();
        //const cartSubTotal = (this.getItemPrice() * this.props.priceValues.quantity).toFixed(2);
        const addedItem = this.getItem();
        let image = addedItem.Media && addedItem.Media.length > 0 ? addedItem.Media[0].MediaUrl : '';

        if (!image) {
            image = Media && Media.length > 0 ? Media[0].MediaUrl : '';
        }

        $(".h-cart .h-dd-menu.add-cart").addClass('fadeout');
        $('.h-cart .h-dd-menu.add-cart.fadeout').css('display', '');
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-img > img').attr('src', image);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > p').text(Name);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .currency').text(`${CurrencyCode} ${Currency(CurrencyCode)}`);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .value').text(this.formatMoneyWithoutCurrency(priceValues.bulkPrice));
        this.props.updateQuantity(0, this.getItemPrice(), bulkPricing);
        $('input[name="item-qty"]').val('');

        $('html, body').animate({
            'scrollTop': $(".h-cart").position().top
        });
        var itemImg = $(".idclt-img > img");
        if (!isMobile()) {
            var t = window.flyToElement($(itemImg), $('.h-cart'));
        }
        fadeOutCart();
        return false;
    }

    setThumbnailImage() {
        const item = this.getItem();
        const { Media } = item;

        if (Media && Media.length > 0) {
            $('.item-main-thumbnail').attr('href', Media[0].MediaUrl);
            $('.item-main-thumbnail').attr('data-lightbox', Media.length > 1 ? 'gallery-group' : 'gallery');
            $('.item-main-thumbnail > img ').attr('src', Media[0].MediaUrl);
        }
    }

    renderQuantityAlert() {
        const { HasChildItems, ChildItems } = this.props.itemDetails;
        const { selectedVariantIDs } = this.state;
        const selectedVariantArr = [...selectedVariantIDs.values()];

        let item = null;

        if (HasChildItems && ChildItems.length > 0 && selectedVariantArr) {
            for (const ch in ChildItems) {
                const { Variants } = ChildItems[ch];
                if (Variants && Variants.length > 0 && Variants.length === selectedVariantArr.length) {
                    const VariantIds = Variants.map(v => v.ID);
                    const isMatch = selectedVariantArr.every(e => VariantIds.includes(e));
                    if (!isMatch) continue;
                    item = ChildItems[ch];
                }
            }
        } else item = this.props.itemDetails;

        if (item) {
            if (item.StockLimited == true && parseInt(item.StockQuantity) <= 5) {
                return (<span className="quantity-alert">Only {item.StockQuantity} left!</span>);
            }
        }
        return;
    }

    onVariantSelectionChange(e) {
        var self = this;


        var theItem = this.getItem();
        console.log(theItem)

        var tempWeight = '';
        var theOriginalWeight = ''
        if (self.props.itemDetails.CustomFields) {
            tempWeight = self.props.itemDetails.CustomFields.find(d => d.Code.toLowerCase().indexOf('weight'))
            if (tempWeight)
                theOriginalWeight = tempWeight.Values[0]
        }



        if (!self.props.itemDetails.ChildItems)
            return;

        if ( theOriginalWeight.length > 0) {

            var childWeight = theItem.CustomFields.find(d => d.Code.toLowerCase().indexOf('weight'))
            
            if (childWeight) {
                if (parseInt(childWeight.Values[0]) == 0) {
                    $(`[data-code="${tempWeight.Code}"]`).parent().find('.custom-field').find('p').html(theOriginalWeight)
                }
                else {
                    $(`[data-code="${tempWeight.Code}"]`).parent().find('.custom-field').find('p').html(childWeight.Values[0])
                }
            }

            return;
        }


    }

    renderVariants() {
        const { HasChildItems, ChildItems } = this.props.itemDetails;
        var self = this;

        function groupBy(xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };

        if (HasChildItems && ChildItems.length > 0) {
            const ChildItemArr = ChildItems.filter(c => c.Variants && c.Variants.length > 0);
            if (ChildItemArr && ChildItemArr.length > 0) {
                let variants = [];
                ChildItemArr.map(ch => variants.push(...ch.Variants));
                if (variants && variants.length > 0) {
                    // remove duplicates
                    variants = variants.reduce((acc, cur) => {
                        let result = acc.find(a => JSON.stringify(a) == JSON.stringify(cur));
                        if (!result)
                            return acc.concat(cur);
                        return acc;
                    }, []);
                    const variantGroups = groupBy(variants, 'GroupID');
                    return Object.values(variantGroups).map(vg =>
                        <span className="full-width" key={vg[0].GroupName}>
                            <span className="title full-width">{vg[0].GroupName}:</span>
                            <span className="idcrtl-right full-width relation">
                                <select data-variant className="full-width required" data-group-id={vg[0].GroupID} onChange={(e) => self.onVariantSelectionChange(e)}>
                                    <option value={''}></option>
                                    {
                                        vg.map(variant =>
                                            <option
                                                key={variant.ID}
                                                value={variant.ID}>
                                                {variant.Name}
                                            </option>
                                        )
                                    }
                                </select>
                            </span>
                        </span>
                    )
                }
            }
        }

        return '';
    }

    render() {
        const itemPrice = this.getItemPrice();
        const isNegotiate = this.props.itemDetails && !this.props.itemDetails.Negotiation ? "hide" : "";
        const isSpotPurchase = this.props.itemDetails && !this.props.itemDetails.InstantBuy ? "hide" : "";
        const isDisabled = this.props.permissions.isAuthorizedToAdd ? "" : "disabled";

        return (
            <div className="idcr-top pull-left w-100">
                <div className="idcrt-order-val pull-left w-100">
                    <span className="idcrt-title">Purchase Order</span>
                    <div className="idcrt-list-val">
                        {this.renderVariants()}
                        <span className="idcrtl-price full-width">
                            <span className="title">Price per item:</span>
                            <span className="idcrtl-right">
                                <div className="item-price">
                                    {this.renderFormatMoney(this.props.itemDetails.CurrencyCode, itemPrice)}
                                </div>
                            </span>
                        </span>
                        <span className="idcrtl-qty full-width">
                            <span className="title">Quantity:</span>
                            <span className="idcrtl-right">
                                <input name="item-qty" type="number" onChange={(e) => this.props.updateQuantity(e.target.value, itemPrice, this.props.bulkPricing)} className="required numbersOnly" min="0" />
                                {this.renderQuantityAlert()}
                            </span>
                        </span>
                        <MoqComponent
                            moq={this.getMoq()} />
                        <div className="error-message full-width">
                            <p className="not-enough-stock-error-container" style={{ display: 'none' }}>Not enough stock</p>
                            <p className="minimum-order-not-met-error-container" style={{ display: 'none' }}>Minimum order not met</p>
                        </div>
                    </div>
                </div>
                <div className="idcrt-order-total pull-left w-100">
                    <OriginalPriceComponent
                        bulkPricing={this.props.bulkPricing}
                        currencyCode={this.props.itemDetails.CurrencyCode}
                        priceValues={this.props.priceValues} />
                    <span className="pull-left">Sub Total:</span>
                    <span className="total-price pull-right">
                        <div className="item-price">
                            {this.renderFormatMoney(this.props.itemDetails.CurrencyCode, this.props.priceValues.bulkPrice)}
                        </div>
                    </span>
                </div>
                <div className="idcrt-order-btn pull-left w-100">
                    <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToAdd} >
                        <div className={"btn-group btn-cart " + isSpotPurchase + " " + isDisabled} id="itemAddCart" onClick={(e) => this.addItemToCart(e)}>Add to Cart</div>
                    </PermissionTooltip>
                    <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToAdd} >
                        <div className={"btn-group contact-btn btn-loader " + isNegotiate + " " + isDisabled} id="negotiate" onClick={() => this.contactSeller()}>Negotiate</div>
                    </PermissionTooltip>
                </div>
            </div>
        );
    }
}

module.exports = PurchaseOrderComponent;