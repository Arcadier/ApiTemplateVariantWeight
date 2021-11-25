'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class Detail extends React.Component {

    renderBillingAddress() {
        const { requisitionDetail } = this.props;
        if (requisitionDetail && requisitionDetail.Orders && requisitionDetail.Orders.length > 0) {
            const { BillingToAddress, ConsumerDetail } = requisitionDetail.Orders[0];
            if (!BillingToAddress || !ConsumerDetail) return;
            const buyerDisplayName = ConsumerDetail.DisplayName;
            const buyerContact = ConsumerDetail.PhoneNumber;
            const buyerEmail = ConsumerDetail.Email;
            return (
                <tbody>
                    <tr>
                        <th>Billing Address :</th>
                    </tr>
                    <tr>
                        <td data-th="Billing Address :">
                            <span className="highlight-text">{buyerDisplayName}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span className="highlight-text">{BillingToAddress.Name}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {BillingToAddress.Line1 || ''}<br />
                            {BillingToAddress.City}<br />
                            {BillingToAddress.State}<br />
                            {BillingToAddress.Country}<br />
                            {BillingToAddress.PostCode}<br />
                        </td>
                    </tr>
                    <tr>
                        <td>     
                            <a href={`tel:${buyerContact}`}>{buyerContact}</a><span className="text-spacer"></span>
                        </td>
                    </tr>
                    <tr>
                        <td>      
                            <a href={`mailto:${buyerEmail}`}>{buyerEmail}</a>
                        </td>
                    </tr>
                </tbody>
                
            );
        }
        return;
    }

    renderSupplierDetails() {
        const { requisitionDetail } = this.props;
        if (requisitionDetail && requisitionDetail.Orders && requisitionDetail.Orders.length > 0) {
            const { MerchantDetail, DeliveryFromAddress } = requisitionDetail.Orders[0];
            if (!MerchantDetail || !DeliveryFromAddress) return;
            return (
                <tbody>
                    <tr>
                        <th>Supplier :</th>
                    </tr>
                    <tr>
                        <td data-th="Supplier :">
                            <span className="highlight-text">{MerchantDetail.DisplayName}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span className="highlight-text">{`${DeliveryFromAddress.Name}`}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {DeliveryFromAddress.Line1 || ''}<br />
                            {DeliveryFromAddress.City}<br />
                            {DeliveryFromAddress.State}<br />
                            {DeliveryFromAddress.Country}<br />
                            {DeliveryFromAddress.PostCode}<br />
                        </td>               
                    </tr>
                </tbody>
                
            )
        }
        return;
    }

    renderShippingAddress() {
        const { requisitionDetail } = this.props;
        if (requisitionDetail && requisitionDetail.Orders && requisitionDetail.Orders.length > 0) {
            const { DeliveryToAddress } = requisitionDetail.Orders[0];
            if (!DeliveryToAddress) return;
            return (
                <tbody>
                    <tr>
                        <th>Shipping Address :</th>
                    </tr>
                    <tr>
                        <td data-th="Shipping Address :">
                            <span className="highlight-text">{DeliveryToAddress.Name}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>   
                            {DeliveryToAddress.Line1 || ''}<br />
                            {DeliveryToAddress.City}<br />
                            {DeliveryToAddress.State}<br />
                            {DeliveryToAddress.Country}<br />
                            {DeliveryToAddress.PostCode}<br />
                        </td>                     
                    </tr>
                </tbody>
                
            );
        }
        return;
    }

    renderRequisitionDetails() {
        const { requisitionDetail } = this.props;
        if (requisitionDetail) {
            const { RequisitionOrderNo, RequestorName, MetaData, Status, Orders, CosmeticNo } = requisitionDetail;
            let shippingMethod = '';
            let paymentTerms = '';
            if (Orders && Orders.length > 0) {
                if (Orders[0].PaymentTerm) {
                    paymentTerms = Orders[0].PaymentTerm.Name;
                }

                if (Orders[0].CartItemDetails && Orders[0].CartItemDetails.length > 0) {
                    const cartItem = Orders[0].CartItemDetails[0];
                    shippingMethod = cartItem.CartItemType == 'pickup' ? cartItem.PickupAddress.Line1 : cartItem.ShippingMethod.Description;

                    if (cartItem.AcceptedOffer && cartItem.AcceptedOffer.PaymentTerm && paymentTerms === '') {
                        paymentTerms = cartItem.AcceptedOffer.PaymentTerm.Name;
                    }
                }
            }
            let departmentName = '-';
            let reason = '-';

            if (MetaData) {
                const data = JSON.parse(MetaData);
                const { Department, Workflow } = data;
                if (Department && Department.Name) departmentName = Department.Name;
                if (Workflow && Workflow.Reason) reason = Workflow.Reason;
            }
            return (
                <tbody>
                    <tr>
                        <th>Requisition No. : </th>
                        <td data-th="Requisition Status :">{CosmeticNo != null && CosmeticNo != "" ? CosmeticNo : RequisitionOrderNo}</td>
                    </tr>
                    <tr>
                        <th>Requisition Status :</th>
                        <td data-th="Requisition Status :">{Status}</td>
                    </tr>
                    <tr>
                        <th>Requestor Name :</th>
                        <td data-th="Requisition Status :">{RequestorName}</td>
                    </tr>
                    <tr>
                        <th>Department Name :</th>
                        <td data-th="Requisition Status :">{departmentName}</td>
                    </tr>
                    <tr>
                        <th>Reason :</th>
                        <td data-th="Requisition Status :">{reason}</td>
                    </tr>
                    <tr>
                        <th>Payment Terms :</th>
                        <td data-th="Requisition Status :">{paymentTerms}</td>
                    </tr>
                    <tr>
                        <th>Shipping Method :</th>
                        <td data-th="Requisition Status :">{shippingMethod}</td>
                    </tr>
                </tbody>
            );
        }
        return;
    }

	render() {
		return (
			<React.Fragment>
				<section className="sassy-box">
					<div className="sassy-box-content box-order-detail">
                        <div className="row">
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-6">
                                        <table className="canon-table purchase-address-sec">
                                            {this.renderBillingAddress()}
                                        </table>
                                    </div>
                                    <div className="col-md-6"></div>
                                </div>
                                <div className="spacer-20"></div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <table className="canon-table purchase-address-sec">
                                            {this.renderSupplierDetails()}
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <table className="canon-table purchase-address-sec">
                                            {this.renderShippingAddress()}
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <table className="canon-table">
                                    {this.renderRequisitionDetails()}
                                </table>
                            </div>
                        </div>
                    </div>
				</section>
			</React.Fragment>
		);
	}
}

module.exports = Detail;