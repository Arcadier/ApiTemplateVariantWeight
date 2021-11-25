'use strict';
var React = require('react');
const InvoiceDetailComponent = require('../../../../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/invoice-detail');
const BillingAddressComponent = require('../../../../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/billing-address');
const SellerAddressComponent = require('../../../../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/seller-address');
const ShippingAddressComponent = require('../../../../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/shipping-address');
const OrderItemsComponent = require('../../../../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/order-items');
const RequisitionComponent = require('../../../../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/requisition-detail');
const OrderTotalComponent = require('../../../../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/order-total');

class FeatureCreateInvoiceB2bComponent extends React.Component {

    render() {
        return (
            <React.Fragment>
                <div className="nav-breadcrumb mt-15">
                    <i className="fa fa-angle-left"></i> <a href="/merchants/invoice/list">Back</a>
                </div>
                <div className="sc-upper">
                    <div className="sc-u title-sc-u sc-u-mid full-width">
                        <span className="sc-text-big">Create Invoice</span>
                    </div>
                </div>
                <InvoiceDetailComponent {...this.props} />
                <section className="sassy-box">
                    <div className="sassy-box-content box-order-detail">
                        <div className="row">
                            <div className="col-md-4">
                                <BillingAddressComponent {...this.props} />
                            </div>
                            <div className="col-md-4"></div>
                            <div className="col-md-4">
                                <RequisitionComponent {...this.props} />
                            </div>
                            <div className="spacer-20"></div>
                            <div className="col-md-12">
                                <div className="row">
                                    <div className="col-md-4">
                                        <SellerAddressComponent {...this.props} />
                                    </div>
                                    <div className="col-md-4">
                                        <ShippingAddressComponent {...this.props} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <OrderItemsComponent {...this.props} />
                <OrderTotalComponent {...this.props} />
            </React.Fragment>
        );
    }
}

module.exports = FeatureCreateInvoiceB2bComponent;