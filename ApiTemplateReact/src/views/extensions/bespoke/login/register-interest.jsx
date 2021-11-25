'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var CommonModule = require('../../../../../src/public/js/common.js');
var EnumCoreModule = require('../../../../public/js/enum-core');
var BaseComponent = require('../../../shared/base');
var AccountActions = require('../../../../redux/accountAction');

class RegisterInterestComponent extends BaseComponent {
	constructor(props) {
		super(props);
	}

	registerInterest(e) {
		const self = this;
		var name = $('input[name="interest_name"]').val().trim();
        var email = $('input[name="interest_email"]').val().trim();
        var type = $('input[name="intrested"]:checked').val();
        var hasError = 0;
        var errPrompt = [];
        $('.required').removeClass('error-con');        	
        if (name == '' || email == '' || !type) {
        	if (name == '') $('.interested-name').addClass('error-con');
        	if (email == '') $('.interested-email').addClass('error-con');
        	if (typeof type == 'undefined' || type == null) $('.account-type').addClass('error-con');
        	
            errPrompt.push(EnumCoreModule.GetToastStr().Error.PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED);
            e.preventDefault();
            hasError = 1;
        }

        if (CommonModule.validateEmail(email) == false) {
            $('.interested-email').addClass('error-con');
            errPrompt.push(EnumCoreModule.GetToastStr().Error.INVALID_EMAILS);
            e.preventDefault();
            hasError = 1;
        }

        if (hasError === 1) {
            self.showMessage(errPrompt[0]);
            return;
        }
        e.preventDefault();

        self.props.createInterestedUser({ name, email, type }, function (result) {
			const { Result } = result;
			if (Result === false) {
				// $('.required').val('');
				// $('input[name="intrested"]').prop('checked', false);
				self.showMessage({
					type: 'error',
					header: 'Oops! Something went wrong.',
					body: 'Failed to send the interest form, please try again.',
				});
			}
		});
	}

	render () {
		return (
			<React.Fragment>
				<div className="login-container">
					<div className="reset-content">
						<div className="icon-logo"> <img src={this.props.marketplaceLogoUrl} /> </div>
						<div className="login-box">
							<div className="lb-head full-width head-buyer"> 
								<a href="/">
									<img src="/assets/images/back.svg" />
								</a>
								<span>Register your interest below!</span> 
							</div>
							<div className="lb-body full-width"> 
								<div className="lbb-input">
									<p align="left">Your Name</p>
									<input type="text" className="input-text interested-name required"  name="interest_name" maxlength="150" />
								</div> 
								<div className="lbb-input">
									<p align="left">Email</p>
									<input type="text" className="input-text interested-email required"  name="interest_email" maxlength="150" />
								</div> 
		                        <div className="fancy-radio">
		                            <label style={{ 'paddingLeft': 0}}>
		                                <input type="radio" className="account-type required" name="intrested" value="buyer" checked />
		                                &nbsp;I am interested in being a buyer
		                            </label>
		                            <label style={{ 'paddingLeft': 0}}>
		                                <input type="radio" className="account-type required" name="intrested" value="seller"/>
		                                &nbsp;I am interested in being a seller
		                            </label>
		                        </div>
								<div className="btn-signin"> <a href="#" onClick={(e) => this.registerInterest(e)}> Send</a></div>
		                        <a href="/">Back</a>
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
        marketplaceLogoUrl: state.marketplaceLogoUrl,
    }
}

function mapDispatchToProps(dispatch) {
    return {
    	createInterestedUser: (options, callback) => dispatch(AccountActions.createInterestedUser(options, callback)),
    };
}

const RegisterInterestHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(RegisterInterestComponent)

module.exports = {
	RegisterInterestHome,
	RegisterInterestComponent
}