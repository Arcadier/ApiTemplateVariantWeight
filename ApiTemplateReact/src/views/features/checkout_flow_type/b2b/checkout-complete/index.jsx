'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const HeaderLayout = require('../../../../layouts/header').HeaderLayoutComponent;
const FooterLayout = require('../../../../layouts/footer').FooterLayoutComponent;
const BaseComponent = require('../../../../shared/base');

class CheckoutCompleteComponent extends BaseComponent {
    render() {
        const { ID, RequisitionOrderNo,CosmeticNo } = this.props.requisitionDetail;
       // let requisitionNo = this.props.req
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main" style={{ paddingTop: '117px' }}>
                    <div className="transaction-complete-container">
                        <div className="container">
                            <div className="tcc-content">
                                <div className="tccc-top">
                                    <span className="tccct-icon">
                                        <span>
                                            <span><i className="fa fa-check" /></span>
                                        </span>
                                    </span>
                                    <span className="tccc-text">Order Requisition Created</span>
                                </div>
                                <div className="tccc-bot">
                                    <span className="title">Your Requisition Order No. is:</span>
                                    <span className="inv-text">{CosmeticNo != null && CosmeticNo != "" ? CosmeticNo : RequisitionOrderNo}</span>
                                    <span className="inv-desc">Once your requisition order has been approved, a Purchase Order will be sent to the supplier automatically.</span>
                                    <div className="tccct-btn">
                                        <div className="btn-black requisition-btn">
                                            <a href={'/requisition/detail?id=' + ID}>Requisition Order</a>
                                        </div>
                                        <div className="btn-return">
                                            <a href="/">Return home</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        requisitionDetail: state.requisitionReducer.requisitionDetail,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

const CheckoutCompleteHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(CheckoutCompleteComponent);

module.exports = {
    CheckoutCompleteHome,
    CheckoutCompleteComponent,
};