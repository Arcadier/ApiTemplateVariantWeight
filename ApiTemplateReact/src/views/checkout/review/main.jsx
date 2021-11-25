'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const FooterLayout = require('../../layouts/footer').FooterLayoutComponent;
const HeaderLayout = require('../../layouts/header').HeaderLayoutComponent;
const BaseComponent = require('../../shared/base');
const { CheckoutReviewMain, mapStateToProps, mapDispatchToProps } = require(`../../extensions/${process.env.TEMPLATE}/checkout/review/main`);

class CheckoutReviewPageComponent extends BaseComponent {
    render() {
        return (
            <React.Fragment>
                <div className="header" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user}/>
                </div>
                <div className="main">
                   <CheckoutReviewMain {...this.props} />
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels}/>
                </div>
            </React.Fragment>
        );
    }
}

const CheckoutReviewPage = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(CheckoutReviewPageComponent)

module.exports = {
    CheckoutReviewPage,
    CheckoutReviewPageComponent
}
