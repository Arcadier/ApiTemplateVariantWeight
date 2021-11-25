'use strict';
import React from 'react';
import Currency from 'currency-symbol-map';
import BaseComponent from '../../../../shared/base';

class OrderSummary extends BaseComponent {
	getShippingOptionCost() {
        let shippingOptionCost = 0;
        const { orderSelectedDelivery } = this.props;
        if (orderSelectedDelivery) {
            for (let opt in orderSelectedDelivery.values()) {
                shipping_cost += parseFloat(opt && !opt.isPickup ? opt.ShippingCost : 0);
            }
        } else {
            return this.getFreight();
        }

        return shippingOptionCost.toFixed(2);
    }

    getTotal() {
        var self = this;
        let total = 0;
        
        total = parseFloat(this.getSubTotal()) + parseFloat(this.getShippingOptionCost());

        if (total === 0) {
            total = parseFloat(self.props.invoiceDetails.Total);
        }

        return total.toFixed(2);
    }

    getSubTotal() {
        let subTotal = 0;
        const { Orders } = this.props.invoiceDetails;
        if (Orders && Orders.length > 0) {
        	Orders.map(order => {
        		let orderSubTotal = 0;
        		if (order && order.CartItemDetails && order.CartItemDetails.length > 0) {
        			order.CartItemDetails.map(cartItem => orderSubTotal += parseFloat(cartItem.SubTotal) || 0 );
        		}
        		subTotal += orderSubTotal;
        	});
        }
        return subTotal.toFixed(2);
    }

    getFreight() {
        let freight = 0;
        const { Orders } = this.props.invoiceDetails;
        if (Orders && Orders.length > 0) {
            Orders.map(order => {
                if (order.Freight) {
                    freight += order.Freight;
                }
            });
        }
        return freight.toFixed(2);
    }

    renderTitle() {
        if (typeof this.props.showEdit !== 'undefined' && !this.props.showEdit) {
            return (
                <span className="title">Delivery Address</span>
            );
        }

        return (
            <span className="title full-width">
                Delivery Address
                <span className="sbcir-btn">
                	<a href={`/checkout/${this.props.previous}?invoiceNo=${this.props.invoiceDetails.InvoiceNo}`}>Edit </a>
                </span>
            </span>
        )
    }

	renderAddress() {
		const { address } = this.props;
		const { FirstName, LastName, Address1, PostalCode, State, City, Country } = address;
		return (
		    <div className="pccr-text1">
	    		<span>{`${FirstName} ${LastName || ''}`}</span>
	    		<span>{Address1}</span>
	    		<span>{City}</span>
	    		<span>{State}</span>
	    		<span>{Country}</span>
	    		<span>{PostalCode}</span> 
	    	</div>
		);
    }

    render() {
        var self = this;
		return (
			<div className="pcc-rigth pull-right">
				<div className="cbcir-box">
					<span className="cbcir-title">Order Summary</span>
		            <div className="cbcir-text">
                        {this.renderTitle()}
		            	{this.renderAddress()}
		            	<div className="pccr-text2">
		            		<span>
		            			<span className="title">Sub-Total</span>
			                	<div className="item-price subTotal">
			                		<span className="currency"> {`${this.props.invoiceDetails.CurrencyCode} ${Currency(this.props.invoiceDetails.CurrencyCode)}`} </span>
                                    <span className="sub-total value">{self.formatAmountWithCommaSeparator(self.getSubTotal())}</span>
			                	</div>
		                	</span>
		                	<span>
		                		<span className="title">Delivery Cost</span>
		                		<div className="item-price deliveryCost">
		                			<span className="currency"> {`${this.props.invoiceDetails.CurrencyCode} ${Currency(this.props.invoiceDetails.CurrencyCode)}`} </span>
                                    <span className="delivery-costs value">{this.getFreight()}</span>
		                		</div>
		                	</span>
		                </div>
		            </div>
		            <div className="pccr-total">
		            	<span className="pccrt-sml">Total</span>
		            	<span className="total-amount">
		              		<div className="item-price totalCost">
			                	<span className="currency"> {`${this.props.invoiceDetails.CurrencyCode} ${Currency(this.props.invoiceDetails.CurrencyCode)}`} </span>
                                <span className="total-cost value">{self.getTotal()}</span>
		              		</div>
		            	</span>
		            </div>
		            <div className="pccr-btn">
                        <div className="btn-green full-btn-procced disable" onClick={(e) => this.props.handleProceedButton()} id="btnProceedPayment">{this.props.submitText}</div>
		                <div className="btn-white"><a href={`/checkout/${this.props.previous}?invoiceNo=${this.props.invoiceDetails.InvoiceNo}`}>Previous</a></div>
		            </div>
	        	</div>
        	</div>
		);
	}
}

module.exports = OrderSummary;