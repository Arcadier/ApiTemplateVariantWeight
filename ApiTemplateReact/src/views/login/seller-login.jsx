'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../shared/base');
var EnumCoreModule = require('../../public/js/enum-core');
let CommonModule = require('../../public/js/common.js');
// ARC-8702
const iconStyles = {
    fontFamily: 'FontAwesome',
    fontWeight: 'normal'
}

class SellerLoginComponent extends BaseComponent {
    componentDidMount() {
        let self = this;

        if (typeof window !== 'undefined') {
            var $ = window.$;
        }

        if (this.props.error && this.props.error === '5') {
            this.showMessage(EnumCoreModule.GetToastStr().Error.UNREGISTERED_LOGIN_ACCOUNT);
        } else if (this.props.error && this.props.error === '2') {
            this.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_TOKEN);
        } else if (this.props.error) {
            this.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_LOGIN_CREDENTIALS);
        }
    }

    loginWithUsernameAndPassword() {
        let username = $('input[name="username"]').val().trim();
        let password = $('input[name="password"]').val().trim();

        if (username == '' || password == '') {
            this.showMessage(EnumCoreModule.GetToastStr().Error.REQUIRED_LOGIN_CREDENTIALS);
            return;
        }

        $('#frmlogin').submit();
    }

    handleKeyPress(event) {
        if (event.which === 13 || event.keyCode == 13) {
            if ($("#password").val() == "" || $("#username").val() == "") {
                this.showMessage(EnumCoreModule.GetToastStr().Error.REQUIRED_LOGIN_CREDENTIALS);
                return;
            } else {
                $('#frmlogin').submit();
            }
        }
    }

    getSortedLogins() {
        let sortedLogins = [];

        if (this.props.loginConfigurationSettings) {
            const loginConfigurationSettings = this.props.loginConfigurationSettings;

            Object.keys(loginConfigurationSettings).forEach(function (key) {
                if (key.indexOf('enable-') >= 0 && loginConfigurationSettings[key] == 'true') {
                    const loginType = key.replace('enable-', '');

                    if (loginConfigurationSettings['sort-' + loginType]) {
                        sortedLogins.push({
                            key: loginType,
                            value: loginConfigurationSettings['sort-' + loginType]
                        });
                    }
                }
            });
        }

        return sortedLogins.sort((a, b) => (a.value > b.value) ? 1 : -1);
    }

    renderLogins() {
        const self = this;

        const sortedLogins = this.getSortedLogins();
        let logins = [];

        sortedLogins.forEach(function (config, index) {
            if (config.key.toLowerCase() === 'facebook') {
                logins.push(self.renderFacebook());
            } else if (config.key.toLowerCase() === 'google') {
                logins.push(self.renderGoogle());
            } else if (config.key.toLowerCase() === 'custom-facebook') {
                logins.push(self.renderCustomFacebook());
            } else if (config.key.toLowerCase() === 'custom-google') {
                logins.push(self.renderCustomGoogle());
            } else if (config.key.toLowerCase() === 'custom-login') {
                if (logins.length > 0) {
                    logins.push(self.renderDivider(1));
                }

                logins.push(self.renderCustomLogin());

                if (index < sortedLogins.length - 1) {
                    logins.push(self.renderDivider(2));
                }
            }
        });

        if (logins.length == 0) {
            logins.push(self.renderFacebook());
            logins.push(self.renderGoogle());
            logins.push(self.renderDivider(1));
            logins.push(self.renderCustomLogin());
        }

        return logins;
    }

    renderGoogle() {
        return (
            <div key="google" className="btn-google">
                <a href={this.props.googleLoginUrl}>
                    <i style={iconStyles} className="fa fa-google"></i><span>Google Login</span>
                </a>
            </div>
        );
    }

    renderFacebook() {
        return (
            <div key="facebook" className="btn-fb">
                <a href={this.props.facebookLoginUrl}>
                    <i style={iconStyles} className="fa fa-facebook-square"></i><span>Facebook Login</span>
                </a>
            </div>
        );
    }

    renderCustomLogin() {
        return (
            <form key="custom-login" id="frmlogin" action="/accounts/seller/sign-in" className="custom-login" method="post" autoComplete="off">
                <div className="lbb-input">
                    <input type="text" className="input-text" placeholder="Email/Username" id="username" name="username" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onKeyPress={(e) => this.handleKeyPress(e)} />
                    <input type="password" className="input-text" placeholder="Password" id="password" name="password" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onKeyPress={(e) => this.handleKeyPress(e)} autoComplete="off" />
                </div>
                <div className="btn-signin">
                    <a href="#" onClick={(e) => this.loginWithUsernameAndPassword()}>Sign In</a>
                </div>
            </form>
        );
    }

    renderCustomFacebook() {
        return (
            <div key="custom-facebook" className="btn-fb">
                <a href={this.props.customFacebookLoginUrl}>
                    <i style={iconStyles} className="fa fa-facebook-square"></i><span>{this.props.customFacebookDisplayName || 'Continue with Admin Facebook'}</span>
                </a>
            </div>
        );
    }

    renderCustomGoogle() {
        return (
            <div key="custom-google" className="btn-google">
                <a href={this.props.customGoogleLoginUrl}>
                    <i style={iconStyles} className="fa fa-google"></i><span>{this.props.customGoogleDisplayName || 'Continue with Admin Google'}</span>
                </a>
            </div>
        );
    }

    renderDivider(index) {
        return (
            <span key={'divider-' + index} className="lbb-line or-container">
                <p>or</p>
            </span>
        );
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
        const self = this;

        return (
            <React.Fragment>
                <div className="login-container">
                    <div className="icon-logo"><img src={this.props.marketplaceLogoUrl}></img></div>
                    <div className="login-box">
                        <div className="lb-head full-width head-seller">
                            <a href="/">
                                <img src="/assets/images/back.svg"></img>
                            </a>
                            <span>Login as a Seller</span></div>
                        <div className="lb-body full-width"><span className="b-gray">Sign In</span>
                            {this.renderLogins()}
                            <span className="lbb-text">
                                <a href="/accounts/seller/forgot-password">Forgotten your password?</a>
                            </span>
                            <div className="lbb-bottom-text hide">
                                <span>Not a member?</span>
                                <span>
                                    <a href="register-seller.html">Join now</a>
                                </span>
                            </div>
                        </div>
                    </div>
                    {this.renderCookie()}
                </div>
            </React.Fragment>
        );
    }
}
function mapStateToProps(state, ownProps) {


    return {
        type: state.type,
        host: state.host,
        facebookLoginUrl: state.facebookLoginUrl,
        googleLoginUrl: state.googleLoginUrl,
        customFacebookLoginUrl: state.customFacebookLoginUrl,
        customGoogleLoginUrl: state.customGoogleLoginUrl,
        marketplaceLogoUrl: state.marketplaceLogoUrl,
        error: state.error,
        loginConfigurationSettings: state.loginConfigurationSettings,
        cookieData: state.cookieData,
        customFacebookDisplayName: state.customFacebookDisplayName,
        customGoogleDisplayName: state.customGoogleDisplayName
    }
}

function mapDispatchToProps(dispatch) {
    return {}
}

const SellerLoginHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(SellerLoginComponent)

module.exports = {
    SellerLoginHome,
    SellerLoginComponent
}
