'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const HeaderLayoutComponent = require('../../layouts/header').HeaderLayoutComponent;
const FooterLayoutComponent = require('../../layouts/footer').FooterLayoutComponent;
const BaseComponent = require('../../shared/base');

class PaymentGatewayCancelComponent extends BaseComponent {
    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main">
                    <div className="error-pg-container">
                        <div className="container">
                            <a href="/cart" className="error-back"><i className="fa fa-angle-left" /> Back</a>
                            <div className="error-msg-txt">
                                <div>Sorry! Please checkout again.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayoutComponent panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

const PaymentGatewayCancelHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(PaymentGatewayCancelComponent);

module.exports = {
    PaymentGatewayCancelHome,
    PaymentGatewayCancelComponent,
};