'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var CommonModule = require('./../../../public/js/common');
var BaseComponent = require('./../../shared/base');
var EnumCoreModule = require('./../../../public/js/enum-core');

if (typeof window !== 'undefined') { var $ = window.$; }

class SubAccountRegistrationComponent extends BaseComponent {
    signUp(event) {
        var e = false;
        $('.required').removeClass('error-con');
        $('.user-already-exist').text('');
        $('.pass-error-sec').text('');
        $('.pass-not-match').text('');
        $('.email-error-sec').text('');

        $('.register-sec .required').each(function () {
            if ($.trim($(this).val()) == '') {
                e = true;
                $(this).addClass('error-con');
            }
        });

        var uname = $('#username').val();
        if ($.trim(uname) != '') {
            if (uname == 'username') {
                e = true;
                $('.user-already-exist').text('This username is already taken.');
            } else if (/\s/.test(uname)) {
                e = true;
                $('.user-already-exist').text('Username must not contain spaces');
            }
        }

        var pass1 = $('#password').val();
        var pass2 = $('#confirmPassword').val();

        if ($.trim(pass1) != '') {
            if ($.trim(pass1).length < 6) {
                e = true;
                $('#password').addClass('error-con');
                $('.pass-error-sec').text('Password cannot be less than 6 characters.');
            }
        }

        if ($.trim(pass1) != $.trim(pass2)) {
            e = true;
            $('#password,#confirmPassword').addClass('error-con');
            $('.pass-not-match').text('Your passwords do not match');
        }

        var em = $('#email').val();

        if ($.trim(em) != '') {
            if (!CommonModule.validateEmail(em)) {
                e = true;
                $('#email').addClass('error-con');
                $('.email-error-sec').text('Please enter valid email address');
            }
        }

        if (e) {
            event.preventDefault();
        }
    }

    componentDidMount() {
        CommonModule.init();

        if (this.props.isSuccessRegister === false) {
            this.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_SUB_MERCHANT_REGISTRATION);
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="header user-login affix-top" data-offset-top="0" data-spy="affix">
                    <div className="container">
                        <div className="logo"><img src={this.props.logoUrl} /></div>
                        <div className="clearfix"></div>
                    </div>
                </div>
                <div className="main">
                    <div className="container">
                        <div className="loing-section login-subacnt-section">
                            <h1 className="login-title">Create Sub-Account Login</h1>
                            <div className="register-sec active">
                                <form name="frmaccount" id="frmaccount" action="/subaccount/register" method="post">
                                    <input type="hidden" name="token" id="token" value={this.props.token} />
                                    <div className="login-subacnt-inarea">
                                        <div className="row signin-form-group">
                                            <div className="col-md-6">
                                                <label>First Name</label>
                                                <input type="text" name="firstName" id="firstName" className="singfrm-txtbox required" />
                                            </div>
                                            <div className="col-md-6">
                                                <label>Last Name</label>
                                                <input type="text" name="lastName" id="lastName" className="singfrm-txtbox required" />
                                            </div>
                                        </div>
                                        <div className="signin-form-group">
                                            <label>Your Email / Username</label>
                                            <input type="text" name="username" id="username" className="singfrm-txtbox required" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} />
                                            <div className="msg-error-sec"><span className="user-already-exist" /></div>
                                        </div>
                                        <div className="signin-form-group">
                                            <label>Your Password</label>
                                            <input type="password" name="password" id="password" className="singfrm-txtbox required" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} />
                                            {/* Comment: Not part of bootstrap, need to add this to display password error */}
                                            <div className="msg-error-sec"><span className="pass-error-sec" /></div>
                                            {/* End Comment */}
                                        </div>
                                        <div className="signin-form-group">
                                            <label>Reconfirm Password</label>
                                            <input type="password" name="confirmPassword" id="confirmPassword" className="singfrm-txtbox required" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} />
                                            <div className="msg-error-sec"><span className="pass-not-match" /></div>
                                        </div>
                                        {/* if seller sing up, this field will be not shown */}
                                        {/* Buyer sign up only */}
                                        <div className="signin-form-group">
                                            <label>Notification Email</label>
                                            <input type="text" name="email" id="email" className="singfrm-txtbox required" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} />
                                            <div className="msg-error-sec"><span className="email-error-sec" /></div>
                                        </div>
                                        {/* End Buyer sign up only */}
                                        <div className="signin-form-group text-center">
                                            <input type="submit" onClick={(e) => this.signUp(e)} name="account-submit" id="account-submit" className="black-btn" defaultValue="Create Account" />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        token: state.subAccountReducer.token,
        isSuccessRegister: state.subAccountReducer.isSuccessRegister,
        logoUrl: state.marketplaceReducer.logoUrl
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

const SubAccountRegistrationHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(SubAccountRegistrationComponent);

module.exports = {
    SubAccountRegistrationHome,
    SubAccountRegistrationComponent
};