'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../shared/base');
var EnumCoreModule = require('../../../../public/js/enum-core');

class ResetPasswordComponent extends BaseComponent {
    componentDidMount() {
        if (this.props.success == 'true') {
            if (this.props.isPrivatemarketPlace=='true' || this.props.isPrivatemarketPlace==true)
                setTimeout(() => window.location.href = '/accounts/sign-in', 5000);
            else
                setTimeout(() => window.location.href = '/accounts/non-private/sign-in', 5000);
        }
    }
    resetPassword(e) {
        var newPassword = $('input[name="new_password"]').val().trim();
        var reconfirmPassword = $('input[name="reconfirm_password"]').val().trim();

        $('.required').each(function () {
            $(this).removeClass('error-con');
        });

        if (newPassword == '' || reconfirmPassword == '') {
            this.showMessage(EnumCoreModule.GetToastStr().Error.PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED);
            if (newPassword == '') {
                $('input[name="new_password"]').addClass('error-con');
            }
            if (reconfirmPassword == '') {
                $('input[name="reconfirm_password"]').addClass('error-con');
            }
            e.preventDefault();
            return;
        }

        if (newPassword != reconfirmPassword) {
            $('input[name="new_password"]').addClass('error-con');
            $('input[name="reconfirm_password"]').addClass('error-con');
            this.showMessage(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_CONFIRM_DOESNT_MATCH);
            e.preventDefault();
            return;
        }

        if (newPassword.length < 6) {
            $('input[name="new_password"]').addClass('error-con');
            this.showMessage(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_MUST_CONTAIN_SIX_CHARACTERS);
            e.preventDefault();
            return;
        }

        $('#frmReset').submit();
    }

    render() {
        return (
            <div className="login-container">
                <div className={this.props.success === 'true' ? "reset-content hide" : "reset-content"}>
                    <div className="icon-logo">
                        <img src={this.props.marketplaceLogoUrl} />
                    </div>
                    <div className="login-box">
                        <div className="lb-head full-width head-buyer">
                            <span>Reset Password</span>
                        </div>
                        <div className="lb-body full-width">
                            <form id="frmReset" action="/accounts/reset-password" method="post" autoComplete="off">
                                <div className="lbb-input">
                                    <p align="left">Your New Password</p>
                                    <input className="input-text required" type="password" placeholder="Your New Password" name="new_password" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} />
                                </div>
                                <div className="lbb-input">
                                    <p align="left">Reconfirm New Password</p>
                                    <input className="input-text required" type="password" placeholder="Reconfirm New Password" name="reconfirm_password" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} />
                                </div>
                                <div className="btn-signin">
                                    <a id="btnReset" href="#" onClick={(e) => this.resetPassword(e)}>Reset Password</a>
                                </div>
                                <input className="input-text" type="hidden" name="userId" value={this.props.userId} />
                                <input className="input-text" type="hidden" name="token" value={this.props.token} />
                            </form>
                        </div>
                    </div>
                </div>
                <div className={this.props.success === 'true' ? "reset-success" : "reset-success hide"}>
                    <div className="reset-success-content">
                        <span className="check-icon">
                            <i className="fa fa-check"></i>
                        </span>
                    </div>
                    <span>Your password has been reset.</span>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        marketplaceLogoUrl: state.marketplaceLogoUrl,
        userId: state.userId,
        token: state.token,
        success: state.success,
        isPrivatemarketPlace: state.isPrivatemarketPlace
    }
}

function mapDispatchToProps(dispatch) {
    return {}
}

const ResetPasswordHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ResetPasswordComponent)

module.exports = {
    ResetPasswordHome,
    ResetPasswordComponent
}