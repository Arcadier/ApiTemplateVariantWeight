'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../shared/base');
var EnumCoreModule = require('../../public/js/enum-core');
var AccountActions = require('../../redux/accountAction');
var CommonModule = require('../../public/js/common.js');

class NonPrivateSignUpComponent extends BaseComponent {

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
        //let params = new URLSearchParams(search);
        let token = null;
        //let isSeller = params.get('isSeller');
        //isSeller = isSeller == 'true';

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

            $('#frmlogin').submit();
          
        })
        e.preventDefault();
        return false;
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
                                <a href={`/accounts/non-private/sign-in?isSeller=${this.props.isSeller || false}`}><img src="/assets/images/back.svg" /></a>
                                <span>Register with Us</span>
                            </div>
                            <div className="lb-body full-width">
                                <form id="frmlogin" action="/accounts/non-private/sign-up" method="post" autoComplete="off">
                                    <div className="lbb-input">
                                        <input type="hidden" className="input-text isSeller" placeholder="isSeller" id="isSeller" name="isSeller" data-react-state-name="isSeller" value={this.props.isSeller || false} />
                                        <input type="text" className="input-text username" placeholder="Username" name="username" data-react-state-name="username" value={this.state.username} onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onChange={(e) => this.onChange(e)} />
                                        <input type="password" className="input-text password" placeholder="Password" name="password" data-react-state-name="password" value={this.state.password} onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)}  onChange={(e) => this.onChange(e)} />
                                        <input type="password" className="input-text confirm-password" placeholder="Confirm Password" name="cofirm_password" data-react-state-name="confirmPassword" value={this.state.confirmPassword} onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onChange={(e) => this.onChange(e)} />
                                        <input type="text" className="input-text notification-email" placeholder="Notification Email" name="email" data-react-state-name="notificatonEmail" value={this.state.notificatonEmail} onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} onChange={(e) => this.onChange(e)} />
                                    </div>
                                    <br />
                                    <div className="btn-signin">
                                        <a href="#" className="submitButton" ref={self.submitButton} onClick={(e) => self.onCreateAccount(e)}>Sign Up</a>
                                    </div>
                                    <div className="lbb-bottom-text">
                                        <span>Already a member?</span>
                                        <span><a href={`/accounts/non-private/sign-in?isSeller=${this.props.isSeller || false}`}>Login</a></span>
                                    </div>
                                </form>
                                
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
        error: state.error,
        isSeller: state.isSeller
    }
}

function mapDispatchToProps(dispatch) {
    return {
        registerWithUsernameAndPassword: (options, callback) => dispatch(AccountActions.registerWithUsernameAndPassword(options, callback))
    }
}

const NonPrivateSignUpReduxConnect = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(NonPrivateSignUpComponent)

module.exports = {
    NonPrivateSignUpReduxConnect,
    NonPrivateSignUpComponent
}