'use strict';
const React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
const PermissionTooltip = require('../../common/permission-tooltip');

class AddressSettingsButton extends BaseClassComponent {

    redirectTo() {
        if (this.isMerchant() === false) {
            this.props.updateUserToOnboard(this.props.user.Onboarded);
        } else {
            $('.nav-pills > .active').next('li').find('a').trigger('click');
        }
    }

    isMerchant() {
        if (this.props.user.Roles) {
            const temp = this.props.user.Roles.filter(x => x.toLowerCase() === 'merchant' || x.toLowerCase() === 'submerchant');
            if (temp.length > 0) return true;
        }
        return false;
    }

    render() {
        var self = this;
        return (
            <div className="settings-button">
                <div className="btn-previous pull-left" onClick={(e) => { $('.nav-pills a:first').tab('show'); }}>Previous</div>
                <div className="pull-right">
                    <PermissionTooltip isAuthorized={self.props.addressPermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                        <div className="btn-save pull-right" onClick={(e) => this.redirectTo()}>
                            {this.isMerchant() ? 'Next' : 'Save'}
                        </div>
                    </PermissionTooltip>

                </div>
            </div>
        )
    }
}

module.exports = AddressSettingsButton;