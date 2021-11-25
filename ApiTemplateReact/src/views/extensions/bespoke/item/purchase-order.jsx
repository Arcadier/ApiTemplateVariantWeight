'use strict';
const React = require('react');
const toastr = require('toastr');
const Currency = require('currency-symbol-map');

const BaseComponent = require('../../../../views/shared/base');
const EnumCoreModule = require('../../../../public/js/enum-core');
const CommonModule = require('../../../../public/js/common');
class PurchaseOrderComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedVariantIDs: new Map(),
        }
    }

    componentDidMount() {
        const self = this;
        $('select').on('change', function() {
            const groupID = $(this).attr('data-group-id');
            self.setState({ 
                selectedVariantIDs: self.state.selectedVariantIDs.set(groupID, this.value)
            })
        });
    }      
    getLatestCartList() {

        let guestUserID = "";
        //if (!this.props.user) {
        //    if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
        //        guestUserID = CommonModule.getCookie("guestUserID");
        //    }
        //}

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
            pageSize: 1000,
            pageNumber: 1,
            includes: null,
            guestUserID: guestUserID
        }
        this.props.getUserCarts(options, null);
    }

    addItemToCart(e) {

        const self = this;
        $('.quantity-alert').hide();
        $('.required').removeClass('error-con');
        let hasEmpty = false;
        $('.idcrt-order-val .required').each(function(){  
            if($.trim(jQuery(this).val()) == '') {
                hasEmpty =true;
                $(this).addClass('error-con');
            }
        });
        if (hasEmpty == true) return;

        if (this.props.processing === true) {
            return;
        }

        // guest user
        if (!this.props.user) {
          //  toastr.info('Feature not available yet for guest user.')
          //  return;
        }

        const parentItem = this.props.itemDetails;
        const { HasChildItems, ChildItems } = parentItem;
        if (HasChildItems && ChildItems.length > 0) {
            if (ChildItems[0].Variants && ChildItems[0].Variants.length > 0) {
                if (this.state.selectedVariantIDs.size !== ChildItems[0].Variants.length) {
                    return;
                }
            }
        }
        let item = this.getItem();
        const { priceValues } = this.props;
        if (priceValues.quantity < 1) {
            return;
        }

        if (item.StockLimited === true) {
            if ((parseInt(item.StockQuantity) - priceValues.quantity) < 0) {
                $('.quantity-alert').text(`Only ${item.StockQuantity} left!`);
                $('.required').addClass('error-con');
                $('.quantity-alert').show();
                return;
            }

            if (parseInt(item.StockQuantity) <= 0) {
                $(".contact-btn").attr("disabled", true);
                return;
            }
        }

        if (this.props.user && parentItem.MerchantDetail.ID === this.props.user.ID) {
            toastr.error('This item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }

        this.props.setProcessing(true);

        let guestUserID = "";
        if (!this.props.user) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }

        const options = {
            pageSize: 1000,
            pageNumber: 1,
            includes: null,
            guestUserID: guestUserID
        }

        this.props.getUserCarts(options, function(cartList) {
            const itemExistsInCart = cartList.find(cl => cl.ItemDetail.ID == item.ID);
            const cartItemId = itemExistsInCart ? itemExistsInCart.ID : null;

            let quantityToPass = priceValues.quantity;
            if (itemExistsInCart) {
                quantityToPass = parseInt(priceValues.quantity) + parseInt(itemExistsInCart.Quantity);
            }

            self.props.addOrEditCart(cartItemId, quantityToPass, 0, item.ID, true,
                (cartItem) =>  self.handleAddToCartSuccess(),
                (errorMessage) => {
                    self.showMessage({
                        ...errorMessage,
                        body: 'Item visibility has been disabled (by marketplace Administrator or Merchant).'
                    });
                }
            )
        });
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        setTimeout(function () {
            self.props.setProcessing(false);
        }, 1000);
    }

    contactSeller() {
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
                for (let i = 0; i < channels.TotalRecords; i++) {
                    let tempChannel = channels.Records[i];
                    if (tempChannel && tempChannel.ItemDetail) {
                        if (tempChannel.ItemDetail.ID === item.ID) {
                            channel = tempChannel;
                            break;
                        }
                    }
                }
                
                createNewChannel = !channel;
            }

            if (createNewChannel) {
                self.props.createChatChannel({
                    recipientId: itemDetail.MerchantDetail.ID,
                    itemId: item.ID,
                    quantity: priceValues.quantity,
                    createCartItem: false
                }, function(newChannel) {
                    if (newChannel != null && newChannel !== "") {
                        window.location = "/chat/enquiry?channelId=" + newChannel.ChannelID;
                    } else {
                        toastr.error('Error creating chat channel.', 'Error!');
                        self.props.setProcessing(false);
                    }
                });
            }
            else {
                window.location = "/chat?channelId=" + channel.ChannelID;
            }
        });
    }

    groupBy(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

    renderVariants() {
        let item = {};
        const { HasChildItems, ChildItems } = this.props.itemDetails;
        if (HasChildItems && ChildItems.length > 0) {
            const childItemsArr = ChildItems.filter(c => c.Variants && c.Variants.length > 0);
            if (childItemsArr && childItemsArr.length > 0) {
                let Variants = [];
                childItemsArr.map(ch => Variants.push(...ch.Variants));
                if (Variants && Variants.length > 0) {
                    // remove duplicates
                    Variants = Variants.reduce((res, itm) => {
                        let result = res.find(item => JSON.stringify(item) == JSON.stringify(itm));
                        if (!result) return res.concat(itm);
                        return res;
                    }, []);
                    const VariantGroups = this.groupBy(Variants, 'GroupID');
                    return Object.values(VariantGroups).map(vg => 
                        <span className="full-width" key={vg[0].GroupName}>
                            <span className="title full-width">{vg[0].GroupName}:</span>
                            <span className="idcrtl-right full-width relation">
                                <select className="full-width required" data-group-id={vg[0].GroupID}>
                                    <option value={null}></option>
                                    {
                                        vg.map(variant => 
                                            <option 
                                                key={variant.ID}
                                                value={variant.ID}
                                                data-react-variant-name={variant.Name}
                                                data-react-variant-group-id={variant.GroupID}
                                            > 
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

    formatNumberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    getItem() {

        const { HasChildItems, ChildItems } = this.props.itemDetails;
        const { selectedVariantIDs } = this.state;
        const selectedVariantArr = [...selectedVariantIDs.values()];
        // get child item with variants that matches the current selected variants
        if (HasChildItems && ChildItems.length > 0 && selectedVariantArr) {
            for (const ch in ChildItems) {
                const { Variants } = ChildItems[ch];
                if (Variants && Variants.length > 0 && Variants.length === selectedVariantArr.length) {
                    const VariantIds = Variants.map(v => v.ID);
                    const isMatch = selectedVariantArr.every(e => VariantIds.includes(e)); 
                    if (!isMatch) continue;
                    if (ChildItems[ch].Media && ChildItems[ch].Media.length > 0) {
                        $('.item-main-thumbnail').attr('href', ChildItems[ch].Media[0].MediaUrl)
                        $('.item-main-thumbnail').attr('data-lightbox', 'gallery')
                        $('.item-main-thumbnail > img ').attr('src', ChildItems[ch].Media[0].MediaUrl)
                    }
                    return ChildItems[ch];
                }
            }
        }

        $('.item-main-thumbnail').attr('href', this.props.itemDetails.Media[0].MediaUrl);
        $('.item-main-thumbnail').attr('data-lightbox', this.props.itemDetails.Media.length > 1 ? 'gallery-group' : 'gallery');
        $('.item-main-thumbnail > img ').attr('src', this.props.itemDetails.Media[0].MediaUrl);
        return this.props.itemDetails;
    }
    getItemPrice() {
        const self = this;
        const { selectedVariantIDs } = this.state;
        let price = this.props.itemDetails.Price;
        if (selectedVariantIDs.size > 0) {
            price = this.getItem().Price || 0;
        }
        return price;
    }

    fadeOutCart() {
        var target = $(".h-cart .h-dd-menu.add-cart");
        setTimeout(function () {
            target.removeClass('fadeout');
        }, 3000);
    }

    isMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)) {
            return true;
        }
        return false;
    }

    handleAddToCartSuccess() {
        const { CurrencyCode, Media, Name } = this.props.itemDetails;
        this.getLatestCartList();
        const cartSubTotal = (this.getItemPrice() * this.props.priceValues.quantity).toFixed(2);
        const addedItem = this.getItem();
        $(".h-cart .h-dd-menu.add-cart").addClass('fadeout');
        $('.h-cart .h-dd-menu.add-cart.fadeout').css('display', '');
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-img > img').attr('src', addedItem.Media[0].MediaUrl || Media[0].MediaUrl);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > p').text(Name);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .currency').text(`${CurrencyCode} ${Currency(CurrencyCode)}`);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .value').text(cartSubTotal);
        //this.props.updateSubTotal(0, this.getItemPrice());
        $('input[name="item-qty"]').val('');

        $('html, body').animate({
            'scrollTop': $(".h-cart").position().top
        });
        var itemImg = $(".idclt-img > img");
        if (!this.isMobile()) {
            var t = window.flyToElement($(itemImg), $('.h-cart'));
        }
        this.fadeOutCart();
        return false;
    }

    render() {
        let self = this;
        const priceValue = this.getItemPrice();
        const subTotal = self.props.priceValues.subtotal || 0;

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
                                    {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, priceValue)}
                                </div>
                            </span>
                        </span>
                        <span className="idcrtl-qty full-width" style={{ margin: 0 }}>
                            <span className="title">Quantity:</span>
                            <span className="idcrtl-right">
                                <input name="item-qty" type="number" onChange={(e) => this.props.updateSubTotal(e.target.value || 0, priceValue)} className="required numbersOnly" min="0" />
                                <span className="quantity-alert" style={{ display: 'none'}}/>
                            </span>
                        </span>
                    </div>
                </div>
                <div className="idcrt-order-total pull-left w-100">
                    Sub Total:
                    <span className="total-price pull-right">
                        <div className="item-price">
                            {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, subTotal)}
                        </div>
                    </span>
                </div>
                <div className="idcrt-order-btn pull-left w-100">
                    <div className="btn-group btn-cart" id="itemAddCart" onClick={(e) => this.addItemToCart(e)}>Add to Cart</div>
                    <div className="btn-group contact-btn" id="negotiate" onClick={() => this.contactSeller()}>Contact Seller</div>
                </div>
            </div>
        );
    }
}

module.exports = PurchaseOrderComponent;