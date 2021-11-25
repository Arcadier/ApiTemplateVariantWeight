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


        $('[data-react-state-name]').removeClass('error-con');

        self.setState({
            password: self.state.password.trim(),
            confirmPassword: self.state.confirmPassword.trim(),
            username: self.state.username.trim(),
        }, function() {

            if (self.state.password == '' || self.state.confirmPassword == '' || self.state.username == '') {
                $('.password, .confirm-password, .username').addClass('error-con');
                this.showMessage(EnumCoreModule.GetToastStr().Error.USER_NAME_PASSWORD_REQUIRED);
                e.preventDefault();
                return;
            }

            if (self.state.password == '' || self.state.confirmPassword == '') {
                $('.password, .confirm-password').addClass('error-con');
                this.showMessage(EnumCoreModule.GetToastStr().Error.PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED);
                e.preventDefault();
                return;
            }

            if (self.state.password != self.state.confirmPassword) {
                $('.password, .confirm-password').addClass('error-con');
                this.showMessage(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_CONFIRM_DOESNT_MATCH);
                e.preventDefault();
                return;
            }


            if (CommonModule.validateEmail(this.state.notificatonEmail) == false) {
                $('.notification-email').addClass('error-con');
                self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_EMAILS);
                e.preventDefault();
                return;
            }

            if (self.state.password.length < 6) {
                $('.password, .confirm-password').addClass('error-con')
                this.showMessage(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_MUST_CONTAIN_SIX_CHARACTERS);
                e.preventDefault();
                return;
            }

            $('#token').val(token);
            $('#frmlogin').submit();


        });

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
                                <a href="/"><img src="/assets/images/back.svg" /></a>
                                <span>Login as a Buyer</span>
                            </div>
                            <div className="lb-body full-width">
                                <span className="b-gray">Register with Us</span>
                                <div className="btn-google"> <a href={this.props.googleLoginUrl}>
                                    <i className="fa fa-google"></i> <span>Google Login</span> </a>
                                </div>
                                <div className="btn-fb"> <a href={this.props.facebookLoginUrl}>
                                    <i className="fa fa-facebook-square"></i> <span>Facebook Login</span> </a>
                                </div>
                                <span className="lbb-line"><p>or</p></span>
                                <form id="frmlogin" action="/accounts/buyer/sign-up" method="post" autoComplete="off">
                                    <div className="lbb-input">
                                        <input type="hidden"  className="input-text token " placeholder="token" id="token" name="token" data-react-state-name="token" value={this.state.token} onChange={(e) => this.onChange(e)} />
                                        <input type="text" className="input-text username" placeholder="Username" name="username" data-react-state-name="username" value={this.state.username} defaultValue={this.state.username} onChange={(e) => this.onChange(e)} />
                                        <input type="password" className="input-text password" placeholder="Password" name="password" data-react-state-name="password" value={this.state.password} defaultValue={this.state.password} onChange={(e) => this.onChange(e)} />
                                        <input type="password" className="input-text confirm-password" placeholder="Confirm Password" name="cofirm_password" data-react-state-name="confirmPassword" value={this.state.confirmPassword} defaultValue={this.state.confirmPassword} onChange={(e) => this.onChange(e)} />
                                        <input type="text" className="input-text notification-email" placeholder="Notification Email" name="email" data-react-state-name="notificatonEmail" value={this.state.notificatonEmail} defaultValue={this.state.notificatonEmail} onChange={(e) => this.onChange(e)} />
                                    </div>
                                    <br />
                                    <div className="btn-signin">
                                        <a href="#" className="submitButton" ref={self.submitButton} onClick={(e) => self.onCreateAccount(e)}>Sign Up</a>
                                    </div>
                                </form>
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
        error: state.error
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