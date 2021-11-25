'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../shared/base');
var EnumCoreModule = require('../../../../public/js/enum-core');
var AccountActions = require('../../../../redux/accountAction');
var CommonModule = require('../../../../../src/public/js/common.js');

class BuyerSignUpComponent extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            confirmPassword: '',
            notificatonEmail: '',
            token: ''
        };

        this.submitButton = React.createRef();
    }

    onCreateAccount(e) {
        var self = this;

        let search = window.location.search;
        let params = new URLSearchParams(search);
        let token = params.get('token');


        $('[data-react-state-name]').removeClass('error-con')

        self.setState({
            password: self.state.password.trim(),
            confirmPassword: self.state.confirmPassword.trim(),
            username: self.state.username.trim(),
        }, function () {

            var hasError = 0;
            var errPrompt = [];

            if (self.state.password == '' || self.state.confirmPassword == '' || self.state.username == '') {
                $('.password, .confirm-password, .username').addClass('error-con')
                errPrompt.push(EnumCoreModule.GetToastStr().Error.USER_NAME_PASSWORD_REQUIRED);
                hasError = 1;
            }

            if (self.state.password == '' || self.state.confirmPassword == '') {
                $('.password, .confirm-password').addClass('error-con')
                errPrompt.push(EnumCoreModule.GetToastStr().Error.PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED);
                hasError = 1;
            }

            if (self.state.password != self.state.confirmPassword) {
                $('.password, .confirm-password').addClass('error-con')
                errPrompt.push(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_CONFIRM_DOESNT_MATCH);
                hasError = 1;
            }


            if (CommonModule.validateEmail(this.state.notificatonEmail) == false) {
                $('.notification-email').addClass('error-con')
                errPrompt.push(EnumCoreModule.GetToastStr().Error.INVALID_EMAILS);
                hasError = 1;
            }

            if (self.state.password.length < 6) {
                $('.password, .confirm-password').addClass('error-con')
                errPrompt.push(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_MUST_CONTAIN_SIX_CHARACTERS);
                hasError = 1;
            }

            if (hasError) {
                e.persist();
                this.showMessage(errPrompt[0]);
                return;
            }

            $('#token').val(token)
            $('#frmlogin').submit();
          
        })
        e.preventDefault();
        return false;
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

    renderSignups() {
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

                logins.push(self.renderCustomSignUp());

                if (index < sortedLogins.length - 1) {
                    logins.push(self.renderDivider(2));
                }
            }
        });

        if (logins.length == 0) {
            logins.push(self.renderFacebook());
            logins.push(self.renderGoogle());
            logins.push(self.renderDivider(1));
            logins.push(self.renderCustomSignUp());
        }

        return logins;
    }
    renderGoogle() {
        return (
            <div key="google" className="btn-google"> 
                <a href={this.props.googleLoginUrl}>
                <i className="fa fa-google"></i> <span>Google Login</span> </a>
            </div>
        );
    }

    renderFacebook() {
        return (
            <div key="facebook" className="btn-fb"> 
                <a href={this.props.facebookLoginUrl}>
                <i className="fa fa-facebook-square"></i> <span>Facebook Login</span> </a>
            </div>
        );
    }

    renderCustomSignUp() {
        const self = this;
        return (
            <form key="custom-signup" id="frmlogin" action="/accounts/buyer/sign-up" method="post" autoComplete="off">
                <div className="lbb-input">
                    <input type="hidden"  className="input-text token " placeholder="token" id="token" name="token" data-react-state-name="token" value={this.state.token} onChange={(e) => this.onChange(e)} />
                    <input type="text" className="input-text username" placeholder="Username" name="username" data-react-state-name="username" value={this.state.username} onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onChange={(e) => this.onChange(e)} />
                    <input type="password" className="input-text password" placeholder="Password" name="password" data-react-state-name="password" value={this.state.password} onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onChange={(e) => this.onChange(e)} />
                    <input type="password" className="input-text confirm-password" placeholder="Confirm Password" name="cofirm_password" data-react-state-name="confirmPassword" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} value={this.state.confirmPassword} onChange={(e) => this.onChange(e)} />
                    <input type="text" className="input-text notification-email" placeholder="Notification Email" name="email" data-react-state-name="notificatonEmail" value={this.state.notificatonEmail} onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onChange={(e) => this.onChange(e)} />
                </div>
                <br />
                <div className="btn-signin">
                    <a href="#" className="submitButton" ref={self.submitButton} onClick={(e) => self.onCreateAccount(e)}>Sign Up</a>
                </div>
            </form>        
        );
    }

    renderCustomFacebook() {
        return (
            <div key="custom-facebook" className="btn-fb">
                <a href={this.props.customFacebookLoginUrl}>
                    <i className="fa fa-facebook-square"></i><span>{this.props.customFacebookDisplayName || 'Continue with Admin Facebook'}</span>
                </a>
            </div>
        );
    }

    renderCustomGoogle() {
        return (
            <div key="custom-google" className="btn-google">
                <a href={this.props.customGoogleLoginUrl}>
                    <i className="fa fa-google"></i><span>{this.props.customGoogleDisplayName || 'Continue with Admin Google'}</span>
                </a>
            </div>
        );
    }

    renderDivider(index) {
        return (
            <span key={'divider-' + index} className="lbb-line"><p>or</p></span>
        );
    }
    componentDidMount() {
        var self = this;

        $('.input-text').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                self.submitButton.current.click()
            }
        });

        if (this.props.error == 'invalid-signup') {
            this.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_LOGIN_CREDENTIALS);
        }
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div id="login-page">
                    <div className="login-container">
                        <div className="icon-logo"> <img src={this.props.marketplaceLogoUrl} /> </div>
                        <div className="login-box">
                            <div className="lb-head full-width head-buyer">
                                <a href="/"><img src="/assets/images/back.svg" /></a>
                                <span>Login as a Buyer</span>
                            </div>
                            <div className="lb-body full-width">
                                <span className="b-gray">Register with Us</span>
                               {this.renderSignups()}

                                <div className="lbb-bottom-text">
                                    <span>Already a member?</span>
                                    <span><a href="/accounts/buyer/sign-in">Login</a></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        type: state.type,
        host: state.type,
        googleLoginUrl: state.googleLoginUrl,
        facebookLoginUrl: state.facebookLoginUrl,
        marketplaceLogoUrl: state.marketplaceLogoUrl,
        marketplaceInfo :state.marketplaceInfo,
        customFacebookDisplayName: state.customFacebookDisplayName,
        customGoogleDisplayName: state.customGoogleDisplayName,
        loginConfigurationSettings: state.loginConfigurationSettings,
        customFacebookLoginUrl: state.customFacebookLoginUrl,
        customGoogleLoginUrl: state.customGoogleLoginUrl,
        error: state.error,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        registerWithUsernameAndPassword: (options, callback) => dispatch(AccountActions.registerWithUsernameAndPassword(options, callback))
    }
}

const BuyerSignUpReduxConnect = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(BuyerSignUpComponent)

module.exports = {
    BuyerSignUpReduxConnect,
    BuyerSignUpComponent
}