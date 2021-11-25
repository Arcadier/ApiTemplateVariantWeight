'use strict';
const React = require('react');

class SettingsButton extends React.Component {

	handleNext() {

        if (this.isMerchant() === true) {
            //Merchant Condition
            $('.nav-pills a:last').tab('show');
            //this.props.updateUserToOnboard(this.props.user.Onboarded, false);
        } else {
            //Buyer Condition
            window.location = "/";
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
		return (
            <div className="settings-button">
                <div className="btn-previous pull-left" onClick={(e) => { $('.nav-pills a:first').tab('show'); }}>Previous</div>
                <div className="btn-save pull-right" onClick={(e) => this.handleNext()}>{this.isMerchant() ? 'Next' : 'Save'}</div>
            </div>

		)
	}
}

module.exports = SettingsButton;