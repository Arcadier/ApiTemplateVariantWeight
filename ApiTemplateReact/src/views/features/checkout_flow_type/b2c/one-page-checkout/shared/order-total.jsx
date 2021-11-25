'use strict';
var React = require('react');
import Currency from 'currency-symbol-map';
import BaseComponent from '../../../../../shared/base';
const PermissionTooltip = require('../../../../../common/permission-tooltip');

class OrderTotalComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            isProcessing: false
        };
    }
    getSubTotal() {
        const { invoiceDetails } = this.props;
        let subTotal = 0;
        if (invoiceDetails && invoiceDetails.Orders.length > 0) {
            const { charges, discount } = this.getChargesAndDiscounts();
            subTotal = invoiceDetails.Total - charges + discount
        }   
        return subTotal;
    }

    getChargesAndDiscounts() {
        let charges = 0;
        let discount = 0;
        const ChargeReasons = ['Bank Charges', 'Custom Duties', 'Taxes', 'Late Delivery', 'Freight Costs', 'Price Change', 'Others'];
        const QuantityOptions = ['Fixed', 'Percentage'];
        const { pendingOffer } = this.props;
        if (pendingOffer) {
            const { OfferDetails } = pendingOffer;
            if (OfferDetails && OfferDetails.length > 1) {
                const arr = OfferDetails.slice(1);
                if (arr && arr.length > 0) {
                    arr.map(quotation => {
                        if (quotation.IsDiscount) discount += parseFloat(quotation.TotalAmount);
                        else {
                            if (ChargeReasons.includes(quotation.Name)) {
                                charges += parseFloat(quotation.TotalAmount);
                            }
                        }
                    });
                }
            }
        }
        return { charges, discount };
    }

    getTotal() {
        const { invoiceDetails } = this.props;
        return invoiceDetails.Total;
    }
    
    cancelCheckout() {
        if (this.state.isProcessing) return;
        this.setState({ isProcessing: true });
        if (this.props.invoiceDetails) {
            const { invoiceDetails } = this.props;
            if (invoiceDetails && invoiceDetails.Orders && invoiceDetails.Orders.length > 0) {
                const { Orders } = invoiceDetails;
                if (Orders && Orders[0] && Orders[0].CartItemDetails) {
                    const { CartItemDetails } = Orders[0];
                    if (CartItemDetails && CartItemDetails[0]) {
                        const options = {
                            itemID: CartItemDetails[0].ItemDetail.ID,
                            userID: CartItemDetails[0].User.ID,
                            cartID: CartItemDetails[0].ID,
                            quantity: CartItemDetails[0].Quantity,
                            discountAmount: CartItemDetails[0].DiscountAmount
                        }
                        this.props.setCartToPending(options, () => {
                            this.setState({ isProcessing: false });
                            history.back()
                        });
                    }
                } 
            }
        }
        this.setState({ isProcessing: false });
    }


    renderChargesAndDiscounts() {
        const { charges, discount } = this.getChargesAndDiscounts();
        let currencyCode = '';
        if (this.props.invoiceDetails) {
            const { currencyCode } = this.props.invoiceDetails;
        }
        const isServiceLevel = process.env.PRICING_TYPE == 'service_level';
        return (
            <React.Fragment>
                <span>
                    <span className="title">Charge(s)</span>
                    <div className="item-price deliveryCost">
                        <span className="item-price">
                            {
                                this.props.pendingOffer || !isServiceLevel ? 
                                    this.renderFormatMoney(currencyCode, charges)
                                : '-'
                            }
                        </span>
                    </div>
                </span>
                <span>
                    <span className="title">Discount(s)</span>
                    <div className="item-price deliveryCost">
                        <span className="item-price">
                            - 
                            {                                
                                this.props.pendingOffer || !isServiceLevel ? 
                                    this.renderFormatMoney(currencyCode, discount)
                                : ''
                            }
                        </span>
                    </div>
                </span>
            </React.Fragment>
        );
    }

    render() {
        let self = this;
        let isDisabled = "disabled";
        let totalDeliveryCost = 0;
        if (self.props.orderSelectedDelivery && self.props.invoiceDetails.Orders) {
            self.props.invoiceDetails.Orders.forEach(function (order, i) {
                self.props.orderSelectedDelivery.forEach(function (delivery, i) {
                    if (delivery[order.ID] && delivery[order.ID].IsPickup === false) {
                        totalDeliveryCost = totalDeliveryCost + parseFloat(delivery[order.ID].ShippingCost);
                    }
                });
            });
        }

        return (
            //FIX ARC9207
            <div className="pcc-rigth pull-right">
                <div className="cbcir-box mobile_layout">
                    <div className="mobile-only text-center "> <span className="toggle_data">Click here for detail</span></div>
                    <div className="mobile-only   text-right"><img src="/assets/images/toggle_close.svg" className="closer hide" /></div>
                    <div className="toggler_area">
                        <span className="cbcir-title">Order Total</span>
                        <div className="cbcir-text">
                            <div className="pccr-text2">
                                <span>
                                    <span className="title">Subtotal</span>
                                    <div className="item-price subTotal">
                                        {this.renderFormatMoney(this.props.invoiceDetails.CurrencyCode, this.getSubTotal())}
                                    </div>
                                </span>
                                {this.renderChargesAndDiscounts()}
                                <span>
                                    <span className="title">Shipping Cost</span>
                                    <div className="item-price deliveryCost">
                                        {this.renderFormatMoney(this.props.invoiceDetails.CurrencyCode, totalDeliveryCost)}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="sort-view-mobile">
                        <div className="pccr-total">
                            <span className="pccrt-sml">Total</span>
                            <span className="total-amount">
                                <div className="item-price totalCost">
                                    {this.renderFormatMoney(this.props.invoiceDetails.CurrencyCode, parseFloat(this.getTotal()) + parseFloat(totalDeliveryCost))}
                                </div>
                            </span>
                        </div>
                        <div className="pccr-btn">
                            {this.props.permissions.isAuthorizedToAdd ? 
                                (<div className="btn-green full-btn-procced btn-loader disable" onClick={(e) => this.props.handleProceedButton()} id="btnProceedPayment">Pay Now</div>): 
                                (<div className="btn-green full-btn-procced btn-loader disable" tabindex="0" data-toggle="tooltip" data-placement="top" title="" data-original-title="You need permission to perform this action" id="btnProceedPayment">Pay Now</div>)}                            
                            <div className="btn-white desktop-only"><a href={null} onClick={(e) => this.cancelCheckout()}>Cancel</a></div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}

module.exports = OrderTotalComponent;