'use strict';
let React = require('react');
var ReactRedux = require('react-redux');

let FooterLayout = require('../../layouts/footer').FooterLayoutComponent;
let HeaderLayout = require('../../layouts/header').HeaderLayoutComponent;
var ChatActions = require('../../../redux/chatActions');
var TwilioChat = require('twilio-chat');

class TransactionCompleteComponent extends React.Component {
    render() {
        let isRegistered = "";
        let isGuest = "hide";
        if (this.props.user != null && this.props.user.Guest == false) {
            isRegistered = "hide"
            isGuest = "";
        }

        let urlAction = "/accounts/non-private/sign-in";

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main">
                    <div className="transaction-complete-container">
                        <div className="container">
                            <div className="tcc-content">
                                <div className="tccc-top">
                                    <span className="tccct-icon">
                                        <span>
                                            <span><i className="fa fa-check"></i></span>
                                        </span>
                                    </span>
                                    <span className="tccc-text">Transaction Complete</span>
                                </div>
                                <div className="tccc-bot">
                                    <span className="title">Your Invoice Id is:</span>
                                    <span className="inv-text">{this.props.invoiceDetails.CosmeticNo != null && this.props.invoiceDetails.CosmeticNo != "" ? this.props.invoiceDetails.CosmeticNo : this.props.invoiceDetails.InvoiceNo}</span>
                                    <span className="inv-desc">You will receive an order confirmation email shortly. If you have any enquiry, please contact our staff.</span>
                                    <div className={"tccct-btn " + isGuest}>
                                        <div className="btn-black"><a href="/purchase/history">Purchase History</a></div>
                                        <div className="btn-return"><a href="/">Return home</a></div>
                                    </div>
                                    <div className={"tccct-btn " + isRegistered}>
                                        <div className="btn-desc">Sign up now to save your address for next time!</div>
                                        <div className="btn-signup"><a href={urlAction}>Sign up</a></div>
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
        user: state.settingsReducer.user,
        invoiceDetails: state.settingsReducer.invoiceDetails,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getOfferByCartItemId: (cartItemId, callback) => dispatch(ChatActions.getOfferByCartItemId(cartItemId, callback)),
        acceptOffer: (options, callback) => dispatch(ChatActions.acceptOffer(options, callback))
    }
}

const TransactionCompletePage = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(TransactionCompleteComponent)

module.exports = {
    TransactionCompletePage,
    TransactionCompleteComponent
}