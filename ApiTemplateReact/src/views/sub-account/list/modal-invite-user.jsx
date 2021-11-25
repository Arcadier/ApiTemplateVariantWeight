'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');
const EnumCoreModule = require('../../../public/js/enum-core');
const CommonModule = require('../../../public/js/common');

class ModalInviteUserComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            isProcessing: false
        };
    }

    closeModal() {
        $('#modal-create-account').modal('hide');
        $('#cover').fadeOut();
    }

    sendInvitations(e) {
        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        var $button = $(e.target);
        $button.attr('disabled', true);

        let isValidEmails = true;
        let trimEmails = [];
        const emails = $('input[name="invite_mail"]').val().trim();

        emails.split(',').forEach((email) => {
            email = email.trim();
            if (!CommonModule.validateEmail(email)) {
                isValidEmails = false;
            }

            trimEmails.push(email);
        });

        if (isValidEmails) {
            this.props.sendInvitations(emails, $(e.target).data('registration-type'), (error) => {
                this.closeModal();

                if (!error) {
                    this.showMessage(EnumCoreModule.GetToastStr().Success.SUCCESS_SUB_ACCOUNT_INVITE);
                } else {
                    this.showMessage(EnumCoreModule.GetToastStr().Error.FAILED_SUB_ACCOUNT_INVITE);
                }

                this.setState({
                    isProcessing: false
                });

                //enable button upon modal show event
                //$button.attr('disabled', false);
            });
        } else {
            this.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_SUB_ACCOUNT_EMAILS);

            this.setState({
                isProcessing: false
            });

            $button.attr('disabled', false);
        }
    }

    render() {
        return (
            <div id="modal-create-account" className="modal fade x-boot-modal in" role="dialog" style={{ display: 'none', paddingRight: '17px' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" onClick={() => this.closeModal()}>&times;</button>
                            <h4 className="modal-title" align="center">Invite Buyer Sub-Account</h4>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-12 text-center">
                                    <p>Send an invitation to someone to give them access to your user account<br /> Use commas to separate multiple recipients</p>
                                    <input type="text" name="invite_mail" className="form-control light required" placeholder="e.g: example@email.com, example2@gmail.com" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer text-center">
                            <button type="button" className="btn-green" data-registration-type="BuyerSubAccount" onClick={(e) => this.sendInvitations(e)}>Send</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalInviteUserComponent;