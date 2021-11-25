'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../shared/base');
var EnumCoreModule = require('../../public/js/enum-core');

var HeaderLayoutComponent = require('../layouts/header').HeaderLayoutComponent;
var FooterLayoutComponent = require('../layouts/footer').FooterLayoutComponent;
var AccountActions = require('../../redux/accountAction');

const PermissionTooltip = require('../common/permission-tooltip');

const resetButtonBtnReset = {
    background: "#000",
    display: "block",
    width: "100%",
    padding: "10px 0",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer"
}

class ChangePasswordComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            oldPassword: '',
            password: '',
            confirmPassword: '',
            successfullyChanged: false
        };
    }
    cancelResetPassword() {
        window.location = window.location.origin;
        window.location = window.history.back()
    }
    changePassword(e) {
        $(".msg-error-sec").addClass('hide');
        $('.input-text').removeClass('error-con');
        var self = this;

        if (self.state.oldPassword !== '' && self.state.password !== '' && self.state.password != self.state.confirmPassword) {
            // this.showMessage(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_CONFIRM_DOESNT_MATCH);
            $(".msg-error-sec").removeClass('hide');
            $('.input-text').addClass('error-con');
            e.preventDefault();
            return;
        }

        if (self.state.password !== '' && self.state.password.length < 6) {
            this.showMessage(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.PASSWORD_MUST_CONTAIN_SIX_CHARACTERS);
            $('.new-password-confirm').addClass('error-con');
            e.preventDefault();
            return;
        }

        let hasEmpty = false;
        if (self.state.oldPassword === '') {
            hasEmpty = true;
            $('.old-password').addClass('error-con');
            e.preventDefault();
        }

        if (self.state.password === '') {
            hasEmpty = true;
            $('.new-wordpass').addClass('error-con');
            e.preventDefault();
        }

        if (self.state.confirmPassword === '') {
            hasEmpty = true;
            $('.new-password-confirm').addClass('error-con');
            e.preventDefault();
        }

        if (hasEmpty === true) {
            this.showMessage(EnumCoreModule.GetToastStr().Error.PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED);
            return;
        }

        const { oldPassword, password, confirmPassword } = self.state;
        self.props.changeUserPassword({
            oldPassword,
            password,
            confirmPassword,
            resetPasswordToken: null
        }, function (success) {
            self.setState({ successfullyChanged: success });
            
            if (!success) {
                self.setState({
                    oldPassword: '',
                    password: '',
                    confirmPassword: '',
                    successfullyChanged: false
                });
                self.showMessage(EnumCoreModule.GetToastStr().Error.PASSWORD_ERRORS.OLD_PASSWORD_DOESNT_MATCH);
                $('.old-password').addClass('error-con');
            } else {
                window.location = "/";
            }
            return;
        });
    }

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip()
    }

    render() {
        var self = this;
        
        return (
            <React.Fragment>
                <div className='page-reset' id='change-password-page'>
                    <div className='header mod' id='header-section'>
                        <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                    </div>
                    <div className='main'>
                        <div className='reset-container'>
                            <span>Change Password</span>
                            <div className={self.state.successfullyChanged == false ? 'reset-content' : 'reset-content hide'}>
                                <div className="reset-input">
                                    <p align="left">Old Password</p>
                                    <input type="text" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} type="password" className="input-text new-password old-password" placeholder="Old Password" name="old_password" data-react-state-name="oldPassword" value={self.state.oldPassword} onChange={(e) => this.onChangeNoWhiteSpaceAllowed(e)} />
                                    <p align="left">New Password</p>
                                    <input type="text" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} type="password" className="input-text new-password new-wordpass" placeholder="New Password" name="new_password" data-react-state-name="password" value={self.state.password} onChange={(e) => this.onChangeNoWhiteSpaceAllowed(e)} />
                                    <p align="left">Confirm Password</p>
                                    <input type="text" onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)} type="password" className="input-text new-password-confirm" placeholder="Confirm New Password" name="reconfirm_password" data-react-state-name="confirmPassword" value={self.state.confirmPassword} onChange={(e) => this.onChangeNoWhiteSpaceAllowed(e)} />
                                </div>
                                <div className="msg-error-sec hide"><span className="pass-not-match">Your passwords do not match</span></div>
                                <div className='reset-button'>
                                    <div className='btn-cancel' onClick={(e) => self.cancelResetPassword()}>Cancel</div>                                    
                                    {this.props.isAuthorizedToEdit ?
                                        (<div className='btn-reset' id='btnReset' onClick={(e) => self.changePassword(e)}>Save</div>) :
                                        (<div className="pull-right" style={{ padding: "0" }}>
                                            <span className="tool-tip" data-toggle="tooltip" data-placement="top" title="" data-original-title="You need permission to perform this action">
                                                <div className="btn-reset disabled" id="btnReset" style={resetButtonBtnReset}>Save</div>
                                            </span>
                                        </div>)
                                    }
                                </div>
                            </div>
                            <div className={self.state.successfullyChanged == true ? 'reset-success ' : ' reset-success hide'}>
                                <div className="reset-success-content">
                                    <span className="check-icon">
                                        <i className="fa fa-check" />
                                    </span>
                                </div>
                                <span>Your password has been reset.</span>
                            </div>
                        </div>
                    </div>
                    <div className="footer" id="footer-section">
                        <FooterLayoutComponent panels={this.props.panels} />
                    </div>
                </div>
            </React.Fragment>
        )
    }
}


function mapStateToProps(state, ownProps) {
    return {
        success: state.changePasswordReducer.success,
        user: state.userReducer.user,
        isAuthorizedToEdit: state.userReducer.isAuthorizedToEdit
    }
}

function mapDispatchToProps(dispatch) {
    return {
        changeUserPassword: (options, callback) => dispatch(AccountActions.changeUserPassword(options, callback))
    }
}

const ChangePasswordHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ChangePasswordComponent)

module.exports = {
    ChangePasswordHome,
    ChangePasswordComponent
}