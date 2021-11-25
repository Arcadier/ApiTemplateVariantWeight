'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../shared/base');
var EnumCoreModule = require('../../public/js/enum-core');

class ForgotPasswordComponent extends BaseComponent {
    resetPassword() {
        $('#frmReset').submit();
    }

    componentDidMount() {
        if (this.props.success === 'false') {
            $('input[name="username"]').addClass('error-con');
        }
    }

    render() {
        let backUrl = `/accounts/${this.props.type}/sign-in`;
        if (this.props.type === 'non-private') {
            backUrl += `?isSeller=${this.props.isSeller || false}`;
        }

        return (
            <div className="login-container">
                <div className="icon-logo"> <img src={this.props.marketplaceLogoUrl} /> </div>
                <div className="login-box">
                    <div className="lb-head full-width head-buyer">
                        <a href={backUrl}>
                            <img src="/assets/images/back.svg" /></a> <span>Forgot Password</span>
                    </div>
                    <div className="lb-body full-width">
                        <form id="frmReset" action="/accounts/forgot-password" method="post" autoComplete="off">
                            <div className="lbb-input">
                                <p align="left">What's your email or username</p>
                                <input type="hidden" className="input-text" name="type" value={this.props.type} />
                                <input type="hidden" className="input-text" name="isSeller" value={this.props.isSeller || false} />
                                <input type="text" className="input-text required" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} placeholder="Email/Username" name="username" />
                            </div>
                            <div className="btn-signin"> <a href="#" onClick={(e) => this.resetPassword()}>Reset Password</a> </div>
                            <div className="field-empty" style={{ display: this.props.success === 'false' ? 'block' : 'none'}}>
                                <p align="left">Sorry! We were unable to find an account with that email / username.</p>
                            </div>
                            <div className={this.props.success === 'true' ? "recovery-accept" : "recovery-accept hide"}>
                                <p align="left">A recovery email has been sent to the email address associated with this account.</p>
                            </div>
                        </form>
                        <span className="lbb-text"><a href={backUrl}>Back</a></span>
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
        type: state.type,
        isSeller: state.isSeller
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