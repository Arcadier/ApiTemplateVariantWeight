'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../shared/base');
var EnumCoreModule = require('../../../../public/js/enum-core');

class ForgotPasswordComponent extends BaseComponent {
    resetPassword() {
        let username = $('input[name="username"]').val().trim();

        if (username == '') {
            $('input[name="username"]').addClass('error-con');
            $('.field-empty').show();
            return;
        }

        $('#frmReset').submit();
    }

    render() {
        return (
            <div className="login-container">
                <div className="icon-logo"> <img src={this.props.marketplaceLogoUrl} /> </div>
                <div className="login-box">
                    <div className="lb-head full-width head-buyer"> <a href="/"><img src="/assets/images/back.svg" /></a> <span>Forgot Password</span> </div>
                    <div className="lb-body full-width">
                        <form id="frmReset" action="/accounts/forgot-password" method="post" autoComplete="off">
                            <div className="lbb-input">
                                <p align="left">What's your email or username</p>
                                <input type="hidden" className="input-text" name="type" value={this.props.type} />
                                <input type="text" className="input-text" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} placeholder="Email/Username" name="username" />
                            </div>
                            <div className="btn-signin"> <a href="#" onClick={(e) => this.resetPassword()}>Reset Password</a> </div>
                            <div className="field-empty" style={{ display: 'none' }}>
                                <p align="left">Sorry! We were unable to find an account with that email / username.</p>
                            </div>
                            <div className={this.props.success === 'true' ? "recovery-accept" : "recovery-accept hide"}>
                                <p align="left">A recovery email has been sent to the email address associated with this account.</p>
                            </div>
                        </form>
                        <span className="lbb-text"><a href={"/accounts/" + this.props.type + "/sign-in"}>Back</a></span>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        marketplaceLogoUrl: state.marketplaceLogoUrl,
        success: state.success,
        type: state.type
    }
}

function mapDispatchToProps(dispatch) {
    return {}
}

const ForgotPasswordHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ForgotPasswordComponent)

module.exports = {
    ForgotPasswordHome,
    ForgotPasswordComponent
}