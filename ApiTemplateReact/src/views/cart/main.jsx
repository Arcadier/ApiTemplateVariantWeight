'use strict';
const React = require('react');
const toastr = require('toastr');

const HeaderLayout = require('../layouts/header').HeaderLayoutComponent;
const FooterLayout = require('../layouts/footer').FooterLayoutComponent;
const ReactRedux = require('react-redux');

const BaseComponent = require('../shared/base');
const cartActions = require('../../redux/cartActions');
const actionTypes = require('../../redux/actionTypes');
const CommonModule = require('../../public/js/common');
const { OrderSummary,  customMapDispatchToProps } = require('./order-summary');
const CustomMethods = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/cart/custom');
const PermissionTooltip = require('../common/permission-tooltip');
const { validatePermissionToPerformAction } = require('../../redux/accountPermissionActions');

class CartPageComponent extends CustomMethods {
    constructor(props) {
        super(props);
    }

    itemUrl(itemName, itemId) {
        return "/items/" + this.generateSlug(itemName) + "/" + itemId;
    }

    arrangeMerchants() {
        let self = this;
        let merchantsIds = [];
        let arrangedCartItems = [];
        if (this.props.cartPageModel.cartList) {
            //Filtering Merchants
            this.props.cartPageModel.cartList.forEach(function (cart) {
                if (merchantsIds.length > 0) {
                    if (merchantsIds.includes(cart.ItemDetail.MerchantDetail.ID) > 0) {
                        merchantsIds.splice($.inArray(cart.ItemDetail.MerchantDetail.ID, merchantsIds), 1);
                        merchantsIds.push(cart.ItemDetail.MerchantDetail.ID);
                    } else {
                        merchantsIds.push(cart.ItemDetail.MerchantDetail.ID);
                    }
                } else if (merchantsIds.length === 0) {
                    merchantsIds.push(cart.ItemDetail.MerchantDetail.ID);
                }              
            });
            //Arranging Items            
            merchantsIds.forEach(function (merchantId) {
                let merchantItems = [];
                self.props.cartPageModel.cartList.forEach(function (cart) {
                    if (merchantId === cart.ItemDetail.MerchantDetail.ID) {
                        merchantItems.push(cart);
                    }
                });
                arrangedCartItems.push(merchantItems);
            });
           
        }        
        self.props.arrangeItemCarts(arrangedCartItems);
    }
    
    componentDidMount() {
        this.arrangeMerchants();
        //Check If Have Guest
        if (this.props.user && this.props.user.Guest === true && CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
            this.props.user.ID = CommonModule.getCookie("guestUserID");
        }

        var self = this;
    }

    componentDidUpdate() {
        let self = this;
        $(".openModalRemove").on("click", function () {
            self.props.validatePermissionToPerformAction("delete-consumer-cart-api", () => {
                var $parent = $(this).parents(".parent-r-b");
                $parent.addClass("modal-delete-open");
                $("#modalRemove").modal("show");
                let cartId = $(this).attr("id");
                self.props.deleteSelectCartId(cartId);
            });     
        });
        $("#modalRemove .btn-gray").on("click", function (e) {
            $(".parent-r-b").removeClass("modal-delete-open");
            e.stopImmediatePropagation();
            $("#modalRemove").modal("hide");
            self.props.deleteSelectCartId("");
        });
        $("#modalRemove #btnRemove").on("click", function (e) {
            self.props.validatePermissionToPerformAction("delete-consumer-cart-api", () => {
                $("#modalRemove").modal("hide");
                //$(".parent-r-b.modal-delete-open").remove(); 
                e.stopImmediatePropagation();
                self.props.deleteCartItem(self.props.cartPageModel.cartItemToDelete, self.props.user.ID);
            });
        });

        $(".cart-edit").on("click", function (e) {
            const $this = $(this);
            self.props.validatePermissionToPerformAction("edit-consumer-cart-api", () => {
                let cartId = $this.attr("id");
                e.stopImmediatePropagation();
                self.props.editCartItem(cartId);
                $("#cartItemEdit").modal("show");
            });            
        });

        let guestUserID = "";
        if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
            guestUserID = CommonModule.getCookie("guestUserID");
            if (guestUserID !== this.props.user.ID) {
                guestUserID = "";
            }
        }
        const options = {
            pageSize: 1000,
            pageNumber: 1,
            includes: null,
            guestUserID: guestUserID
        }

        self.props.getUserCarts(options, null);

    }

    renderVariants(itemDetail) {
        const { locationVariantGroupId } = this.props;

        if (itemDetail && itemDetail.Variants) {
            let el = [];
            itemDetail.Variants.forEach(function (variant, i) {
                if (variant.GroupID != locationVariantGroupId) {
                    el.push(
                        <span key={i} className="if-txt">
                            <span>{variant.GroupName}:</span>
                            <span>{variant.Name}</span>
                        </span>
                    );
                }
            });
            return el;
        }
    }

    renderItemInfo(item) {
        const itemImageUrl = item.Media && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
        if (item && item.Variants && item.Variants.length > 0) {
            return (
                <div className="flex-wrap">
                    <div className="thumb-group">
                        <img data-src={itemImageUrl} className="lazyload" />
                    </div>
                    <div>
                        <span>
                            {item.Name}
                            <div className="item-field">
                                {this.renderVariants(item)}
                            </div>
                        </span>
                    </div>
                </div>
            );
        }
        return (
            <div className="thumb-group">
                <img data-src={itemImageUrl} className="lazyload" />
                <span> {item.Name} </span>
            </div>
        )
    }

    renderCartItem() {
        let self = this;
        let el = [];
        if (this.props.cartPageModel.cartList && this.props.cartPageModel.cartList.length > 0 && this.props.cartPageModel.isArranged === true) {
            if (typeof this.customRenderCartItem == 'function') {
                return this.customRenderCartItem(this.props.cartPageModel.cartList, self.props.itemSelect);
            }
            this.props.cartPageModel.cartList.forEach(function (merchantsId, indx) {
                let itemImageUrl = '';
                let sellerName = '';
                let elChild = [];
                let merchantId = '';
                let isChecked = 'checked';
                merchantsId.forEach(function (cart,i) {
                    if (cart.ItemDetail && cart.ItemDetail.Media && cart.ItemDetail.Media[0]) {
                        itemImageUrl = cart.ItemDetail.Media[0].MediaUrl;
                    }
                    if (cart.ItemDetail && cart.ItemDetail.MerchantDetail) {
                        sellerName = cart.ItemDetail.MerchantDetail.DisplayName;
                        merchantId = cart.ItemDetail.MerchantDetail.ID;
                    }
                    if (cart.isChecked === '') {
                        isChecked = '';
                    }
                    let hrefID = cart.ItemDetail.ID;
                    if (cart.ItemDetail.ParentID) {
                        hrefID = cart.ItemDetail.ParentID;
                    }

                    elChild.push(
                        <tr key={i}>
                            <td width="30">
                                <span className="fancy-checkbox full-width">
                                    <input type="checkbox"
                                        id={cart.ID}
                                        name="item-options[]"
                                        checked={cart.isChecked}
                                        onChange={() => { self.props.itemSelect(cart.ID, "") }} 
                                    />
                                    <label htmlFor={cart.ID} />
                                </span>
                            </td>
                            <td data-th="Item">
                                {self.renderItemInfo(cart.ItemDetail)}
                            </td>
                            <td data-th="Quantity">
                               {(cart.Quantity * 1).toLocaleString()}
                            </td>
                            <td data-th="Price per Item" className="price-per-item">
                                {self.renderFormatMoney(cart.ItemDetail.CurrencyCode, cart.ItemDetail.Price)}
                            </td>
                            <td className="text-right total-price" data-th="Total Price">
                                {self.renderFormatMoney(cart.ItemDetail.CurrencyCode, (cart.SubTotal - (cart.DiscountAmount || 0)))}
                            </td>
                            <td>
                                <div className="cart-act">
                                    <PermissionTooltip isAuthorized={self.props.isAuthorizedToEdit} extraClassOnUnauthorized="icon-grey">
                                        <span id={cart.ID} className="cart-item-edit cart-edit">
                                            <a href="#">Edit</a>
                                        </span>
                                    </PermissionTooltip>
                                    <PermissionTooltip isAuthorized={self.props.isAuthorizedToDelete} extraClassOnUnauthorized="icon-grey">
                                        <span id={cart.ID} className="cbcr-delete openModalRemove">
                                            <i className="fa fa-trash"></i>
                                        </span>
                                    </PermissionTooltip>
                                </div>
                            </td>
                        </tr>
                    )
                });
                if (sellerName) {
                    el.push(
                        <div className="cart-box full-width" key={indx}>
                            <div className="cb-header">  
                                <div className="cb-checkbox">
                                    <span className="fancy-checkbox full-width">
                                        <input type="checkbox" id={merchantId}
                                            name="item-options[]"
                                            checked={isChecked}
                                            onChange={() => { self.props.itemSelect("", merchantId) }} />
                                        <label htmlFor={merchantId} />
                                    </span>
                                </div>
                                <span className="cb-seller">{sellerName}</span>
                            </div>
                            <div className="cb-content  parent-r-b">
                                <div className="table-responsive">
                                    <table className="table cart-items">
                                        <thead>
                                            <tr>
                                                <th>&nbsp;</th>
                                                <th>Item</th>
                                                <th>Quantity</th>
                                                <th>Price per Item</th>
                                                <th className="text-right">Total Price</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {elChild}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="cart-options aligned">
                                    <span className="title">Payment Terms</span><br />
                                    <div className="pccl-payment-method">
                                        {self.getMerchantPaymentTerms(merchantId)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

            }); 
            return el;
        } else {
            return "";
        }
    }

    getMerchantPaymentTerms(merchantId) {
        if (this.props.cartPageModel && this.props.cartPageModel.merchantPaymentTerms) {
            const { merchantPaymentTerms } = this.props.cartPageModel;
            if (merchantPaymentTerms && merchantPaymentTerms.length > 0) {
                const merchantInfo = merchantPaymentTerms.find(p => p.merchantID == merchantId);
                if (merchantInfo && typeof merchantInfo !== 'undefined' && merchantInfo.paymentTerms && merchantInfo.paymentTerms.length > 0) {
                    const { paymentTerms } = merchantInfo;
                    const defaultPaymentTerm = paymentTerms.find(p => p.Default == true);
                    if (defaultPaymentTerm) {
                        return `${defaultPaymentTerm.Name} - ${defaultPaymentTerm.Description}`;
                    }
                }
            }
        }
        return '';
    }

    renderEditPopup() {
        let self = this;
        let cartItem = {};
        if (this.props.cartPageModel.cartList && this.props.cartPageModel.cartList.length > 0 && this.props.cartPageModel.isArranged === true) {
            this.props.cartPageModel.cartList.forEach(function (merchantsId) {
                merchantsId.forEach(function (cart) {
                    if (cart.ID === self.props.cartPageModel.cartItemToEdit) {
                        cartItem = cart;
                    }
                });
            });

            if ($.isEmptyObject(cartItem) === false) {
                let el = [];
                let elChild = [];
                let StockLimited = cartItem.variantModel.quantityModel.StockLimited;
                let maxQuantity = StockLimited ? cartItem.variantModel.quantityModel.StockQuantity : 0;
                let minQuantity = cartItem.variantModel.quantityModel.MOQ || 0;
                if (minQuantity < 1) {
                    if (cartItem.ItemDetail.CustomFields) {
                        const moqCustoms = cartItem.ItemDetail.CustomFields.filter(r => r.Code.includes('moq'));
                        if (moqCustoms && moqCustoms.length > 0) {
                            const moqCustom = moqCustoms[0];
                            minQuantity = moqCustom.Values[0] * 1;
                        }
                    }
                }
                let selectedQuantity = cartItem.variantModel.quantityModel.Quantity;
                let subTotal = cartItem.variantModel.quantityModel.SubTotal;
                let discountAmount = cartItem.variantModel.quantityModel.DiscountAmount || 0;

                if (cartItem.variantModel && cartItem.variantModel.variantDataList) {
                    let variantGroups = [];
                    let variantCombo = [];

                    //ALL VARIANTS
                    cartItem.variantModel.variantDataList.forEach(function (child) {
                        child.Variants.forEach(function (variant) {
                            if (variantGroups.length !== 0) {
                                variantGroups.map(function (vg, i) {
                                    if (vg.ID === variant.GroupID) {
                                        variantGroups.splice($.inArray(vg, variantGroups), 1);
                                    }
                                });
                            }

                            if (variantCombo.length !== 0) {
                                variantCombo.map(function (vc, i) {
                                    if (vc.ID === variant.ID && vc.GroupID === variant.GroupID) {
                                        variantCombo.splice($.inArray(vc, variantCombo), 1);
                                    }
                                });
                            }

                            variantCombo.push({
                                Group: variant.GroupName,
                                GroupID: variant.GroupID,
                                Name: variant.Name,
                                ID: variant.ID,
                                ItemID: child.ID
                            });

                            variantGroups.push({
                                GroupName: variant.GroupName,
                                ID: variant.GroupID
                            });
                        });

                    });

                    variantGroups.forEach(function (group, ind) {
                        let selectedVariant = {};
                        if (cartItem.variantModel.variantsSelected) {
                            cartItem.variantModel.variantsSelected.forEach(function (variant) {
                                if (variant.GroupID === group.ID) {
                                    selectedVariant = variant;
                                }
                            });
                        }
                        let variantNameList = [];
                        let elVariantChild = [];

                        variantCombo.forEach(function (varcom, i) {
                            if (varcom.GroupID === group.ID) {
                                if (variantNameList.length !== 0) {
                                    variantNameList.map(function (vn, i) {
                                        if (vn.ID === varcom.ID) {
                                            variantNameList.splice($.inArray(vn, variantNameList), 1);
                                        }
                                    });
                                }

                                variantNameList.push({
                                    Name: varcom.Name,
                                    ID: varcom.ID
                                });
                            }                            
                        });
                        if (variantNameList) {
                            variantNameList.forEach(function (vnl,i) {
                                elVariantChild.push(
                                    <option key={vnl.ID} value={vnl.ID}>{vnl.Name}</option>
                                )
                            });
                        }

                        elChild.push(
                            <span className="title" key={group.ID}>
                                <span>{group.GroupName}:</span>
                                <span className="select-option">
                                    <select  className="required" key={group.ID} value={selectedVariant.ID} onChange={(e) => self.props.TempoChangeVariant(cartItem.ID, group.ID, e.target.value)}>
                                        {elVariantChild}
                                    </select>
                                    <i className="fa fa-angle-down" />
                                </span>
                            </span>
                        )
                    });
                }


                el.push(<div id="cartItemEdit" className="modal fade in" key="carteditz" role="dialog">
                    <div className="modal-dialog cart-edit-item">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">×</button>
                                <h4 className="modal-title">{cartItem.ItemDetail.Name}</h4>
                            </div>
                            <div className="modal-body">
                                <div className="item-field">
                                    {elChild}
                                    <span key="quant" className="title">
                                        <span>Quantity:</span>
                                        <input maxquantity={maxQuantity} minquantity={minQuantity} className="numbersOnly required" type="text" value={selectedQuantity} onChange={(e) => self.onUpdateQuantity(cartItem.ID, e.target.value, maxQuantity, minQuantity)} id="quantityVal" />
                                    </span>
                                    <span className="title">
                                        <span>Price Per Item:</span>
                                        <span>{self.renderFormatMoney(cartItem.ItemDetail.CurrencyCode, cartItem.variantModel.quantityModel.Price)}</span>
                                    </span>
                                    <span className="title">
                                        <span>Subtotal:</span>
                                        <span>
                                            <div className="item-price" id="totalPrice">
                                                {self.renderFormatMoney(cartItem.ItemDetail.CurrencyCode, subTotal - discountAmount)}
                                            </div>
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-blue" data-dismiss="modal" onClick={(e) => self.onUpdateCartBtnClick(cartItem.ID, maxQuantity, minQuantity)}>Save</div>
                            </div>
                        </div>
                    </div>
                </div>
                );
                return el;
            }
        }
    }

    validateQuantityField(quantity, maxQuantity, minQuantity) {
        this.validateFields();
        if ($("#cartItemEdit #quantityVal").hasClass('error-con')) {
            $("#cartItemEdit .btn-blue").attr('data-dismiss', '');
            return { error: true, message: 'Quantity field is empty.' };
        }

        if (parseInt(maxQuantity) !== 0) {
            if (parseInt(quantity) > parseInt(maxQuantity)) {
                $("#quantityVal").addClass('error-con');
                $("#cartItemEdit .btn-blue").attr('data-dismiss', '');
                return { error: true, message: 'Item has insufficient stock.'}
            }
        }

        if (parseInt(minQuantity) !== 0) {
            if (parseInt(quantity) < parseInt(minQuantity)) {
                $("#quantityVal").addClass('error-con');
                $("#cartItemEdit .btn-blue").attr('data-dismiss', '');
                return { error: true, message: 'Required minimum order quantity not reached.'};
            }
        }
        $("#cartItemEdit .btn-blue").attr('data-dismiss', 'modal');
        return { error: false };
    }

    onUpdateQuantity(cartItemID, quantity, maxQuantity, minQuantity) {
        this.validateQuantityField(quantity, maxQuantity, minQuantity);
        this.props.TempoChangeQuantity(cartItemID, quantity);
    }

    onUpdateCartBtnClick(cartItemID, maxQuantity, minQuantity) {
        this.props.validatePermissionToPerformAction("edit-consumer-cart-api", () => {
            const quantity = $("#quantityVal").val();
            const result = this.validateQuantityField(quantity, maxQuantity, minQuantity);
            if (!result.error) {
                this.props.SaveSelectedVariant(cartItemID, quantity, this.props.user.ID);
            } else {
                toastr.error(result.message);
            }
        });        
    }

    renderDeletePopup() {
        return (
            <div id="modalRemove" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                <div className="modal-dialog delete-modal-content">
                    <div className="modal-content">
                        <div className="modal-body">
                            <p className="text-center">Are you sure want to delete this item?</p>
                        </div>
                        <div className="modal-footer">
                            <div className="btn-gray btndeletepopup" data-dismiss="modal">Cancel</div>
                            <div className="btn-green" id="btnRemove">Okay</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {        
        let isEmpty = (this.props.cartPageModel.cartList && this.props.cartPageModel.cartList.length !== 0) ? 'hide' : '';
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} ControlFlags={this.props.controlFlags}/>
                </div>
                <div className="main">
                    <div className="cart-container">
                        <div className="container">
                            <div className="h-parent-child-txt full-width">
                                <p><a href="/">Home</a></p>
                                <i className="fa fa-angle-right" />
                                <p className="active">My Cart</p>
                            </div>
                            <div className={"pull-right " + isEmpty}>
                                <span className="cart-continue-shopping ">
                                    <a href="/">Continue Shopping</a>
                                </span>
                            </div>
                            <div className={"cart-empty " + isEmpty}>
                                <div className="cart-top-sec-left2">
                                    <img className="cart-empty-image" src="/assets/images/cart_icon.svg" alt="cart-empty" /></div>
                                <div className="cart-top-sec-right2">
                                    <p className="seems-cart-empty-txt">It seems like your cart is empty</p>
                                    <p className="start-search-add-txt">Start searching and adding!</p>
                                </div>
                            </div>
                            <div className="idc-left">
                                {this.renderCartItem()}
                            </div>
                            <OrderSummary
                                cartPageModel={this.props.cartPageModel}
                                checkoutPressedCallback={this.checkoutPressedCallback}
                                CheckoutButtonPressed={this.props.CheckoutButtonPressed}
                                validateCarts={this.props.validateCarts}
                                user={this.props.user}
                                processing={this.props.processing}
                                setProcessing={this.props.setProcessing}
                                controlFlags={this.props.controlFlags}
                                getItemDetails={this.props.getItemDetails}
                            />
                        </div>
                    </div>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
                {this.renderEditPopup()}
                {this.renderDeletePopup()}
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        cartPageModel: state.cartReducer.cartPageModel,
        user: state.userReducer.user,
        controlFlags: state.marketplaceReducer.ControlFlags,
        locationVariantGroupId: state.marketplaceReducer.locationVariantGroupId,
        processing: state.cartReducer.processing,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit, 
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete, 
    };
}

function mapCommonDispatchToProps(dispatch) {
    return {
        itemSelect: (obj, merchantID) => dispatch(cartActions.itemSelect(obj, merchantID)),
        editCartItem: (cartID) => dispatch(cartActions.editCartItem(cartID)),
        TempoChangeQuantity: (cartID, quantity) => dispatch(cartActions.TempoChangeQuantity(cartID, quantity)),
        TempoChangeVariant: (cartID, groupName, variantName) => dispatch(cartActions.TempoChangeVariant(cartID, groupName, variantName)),
        SaveSelectedVariant: (cartId,maxQuantity,userId) => dispatch(cartActions.SaveSelectedVariant(cartId,maxQuantity,userId)),
        deleteSelectCartId: (cartID) => dispatch(cartActions.deleteSelectCartId(cartID)),
        deleteCartItem: (cartId, userId) => dispatch(cartActions.deleteCartItem(cartId, userId)),
        arrangeItemCarts: (itemCarts) => dispatch(cartActions.arrangeItemCarts(itemCarts)),
        getUserCarts: (options, callback) => dispatch(cartActions.getUserCarts(options, callback)),
        getItemDetails: (itemId, callback) => dispatch(cartActions.getItemDetails(itemId, callback)),
        setProcessing: (processing) => dispatch({ type: actionTypes.PROCESSING, processing: processing }),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...mapCommonDispatchToProps(dispatch),
        ...customMapDispatchToProps(dispatch)
    }
}

const CartPage = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
    
)(CartPageComponent)

module.exports = {
    CartPage,
    CartPageComponent
}
