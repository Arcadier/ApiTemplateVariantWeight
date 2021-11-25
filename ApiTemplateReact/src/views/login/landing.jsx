'use strict';
let React = require('react');
let ReactRedux = require('react-redux');
let Store = require('../../redux/store.js');
let actionTypes = require('../../redux/actionTypes');
let BaseComponent = require('../shared/base');
let EnumCoreModule = require('../../public/js/enum-core');

let ExtraLandingComponentTemplate = require('../extensions/' + process.env.TEMPLATE + '/login/landing');
let CommonModule = require('../../../src/public/js/common.js');

class LandingComponent extends BaseComponent {

    componentDidMount() {
        let self = this;

        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get('error');

        if (typeof myParam != 'undefined') {
            if (myParam == '1' || myParam == 'invalid-token') {
                self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_TOKEN);
            }
            else if (myParam == 'invalid-login') {
                self.showMessage(EnumCoreModule.GetToastStr().Error.UNREGISTERED_LOGIN_ACCOUNT);
            }
            CommonModule.changeFavicon(self.props.favIconData);
        }
        
        if (window.sessionStorage && window.sessionStorage.getItem('isSuccessInterestedUser') == 'true') {
            window.sessionStorage.removeItem('isSuccessInterestedUser')
            self.showMessage({
                type: 'success',
                header: 'Success',
                body: 'Your registration has been saved successfully.',
            });
        }

    }

    acceptCookie() {
        CommonModule.createCookie("acceptCookiePolicy", 1, 1);
        $('.cookie-bar').fadeOut(1000, function () {
            $('.cookie-bar').remove();
        });
    }
    renderCookie() {
        let learnMoreTitle = '';
        let cookieTitle = '';
        let learnMoreUrl = '#';
        let acceptButtonTitle = '';

        if (this.props.cookieData) {
            this.props.cookieData.forEach(function (cf) {
                if (cf.Name.toLowerCase() === "message" && cf.Values) {
                    cookieTitle = cf.Values[0];
                }
                if (cf.Name.toLowerCase() === "accept button" && cf.Values) {
                    acceptButtonTitle = cf.Values[0];
                }
                if (cf.Name.toLowerCase() === "cookie policy link button" && cf.Values) {
                    learnMoreTitle = cf.Values[0];
                }
                if (cf.Name.toLowerCase() === "button url" && cf.Values) {
                    learnMoreUrl = cf.Values[0];
                }
            });
            if (typeof window !== 'undefined') {
                if (CommonModule.getCookie("acceptCookiePolicy") !== 1) {
                    return (
                        <div className="container-fluid">
                            <div className="cookie-bar">
                                <div className="flex-cookier-bar">
                                    <p>{cookieTitle} <a href={learnMoreUrl} target="_blank">{learnMoreTitle}</a></p>
                                    <a className="cookie-btn" href="javascript:void(0)" onClick={(e) => this.acceptCookie(e)}>{acceptButtonTitle}</a>
                                </div>
                            </div>
                        </div>
                    );
                }
            }

        }
    } 

    render() {
        let buyerHref = '/accounts/buyer/sign-in';
        let sellerHref = '/accounts/seller/sign-in';

        if (this.props.chatChannelId && this.props.chatChannelId.length > 1) {
            buyerHref = "/accounts/buyer/sign-in?chatChannelId=" + this.props.chatChannelId;
            sellerHref = "/accounts/seller/sign-in?chatChannelId=" + this.props.chatChannelId;
        }

        return (
            <React.Fragment>                
                <div className="landing-box">
                    <img src={this.props.backgroundImage} />
                    <span>{this.props.aboutUs}</span>
                </div>
                <div className="landing-login">
                    {
                        this.props.isMerchantRestrictedOnly ? '' :
                        <div className="btn-login-buyer">
                            <a href={buyerHref}>Login as a Buyer <i className="fa fa-angle-right" /> </a>
                        </div>
                    }
                    <div className="btn-login-seller">
                        <a href={sellerHref}>Login as a Seller <i className="fa fa-angle-right"/> </a>
                    </div>
                </div>
                <ExtraLandingComponentTemplate />
                {this.renderCookie()}
            </React.Fragment>
        );
    }
}


function mapStateToProps(state, ownProps) {
    return {
        aboutUs: state.aboutUs,
        backgroundImage: state.backgroundImage,
        cookieData: state.cookieData,
        favIconData: state.favIconData,
        chatChannelId: state.chatChannelId,
        isMerchantRestrictedOnly: state.isMerchantRestrictedOnly
    };
}

function mapDispatchToProps(dispatch) {
    return {
    }
}

const LandingReduxConnect = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(LandingComponent)

module.exports = {
    LandingReduxConnect,
    LandingComponent
}


