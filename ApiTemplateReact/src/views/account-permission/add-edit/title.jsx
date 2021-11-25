const React = require('react');
const toastr = require('toastr');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class TitleComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    createProfile(e) {
        if (this.props.processing) return;
        $('#user_group_name').removeClass('error-con');
        $('#group-member').removeClass('error-con');

        this.props.setProcessing(true);        

        const profile = this.props.getData();
        let hasError = false;
        if (!profile.Name || (profile.Name && profile.Name.length == 0)) {
            $('#user_group_name').addClass('error-con');
            hasError = true;
        }

        if (!profile.SelectedUserGroups || (profile.SelectedUserGroups && profile.SelectedUserGroups.length == 0 )) {
            $('#group-member').addClass('error-con');
            hasError = true;
        }

        if (hasError) {
            this.props.setProcessing(false);        
            return;        
        }

        const extraPath = this.props.isMerchantAccess ? '/merchants' : '';
        if (!this.props.isAuthorizedToEdit) return;
        const self = this;
        const code = `edit-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-create-account-permission-api`;
        this.props.validatePermissionToPerformAction(code, () => {
            if (self.props.permissionProfile && self.props.permissionProfile.ID) {
                const { ID } = self.props.permissionProfile;
                self.props.updatePermissionProfile({ ...profile, permissionProfileID: ID }, (result) => {
                    if (result) {
                        const { success, message } = result;
                        if (success) {
                            window.location.href = `${extraPath}/account-permissions`;
                            toastr.success('Profile has been updated.', 'Success!')
                        } else {
                            toastr.error(message);
                        }
                    } else {
                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                    }
                    self.props.setProcessing(false);
                });
            } else {
                self.props.createPermissionProfile(profile, (result) => {
                    if (result) {
                        const { success, message } = result;
                        if (success) {
                            window.location.href = `${extraPath}/account-permissions`;
                        } else {
                            toastr.error(message);
                        }
                    } else {
                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                    }
                   
                    self.props.setProcessing(false);
                });
            }
        })
   }

    render() {
        const { isAuthorizedToEdit } = this.props;
        const extraPath = this.props.isMerchantAccess ? '/merchants' : '';
        const saveBtnClass = `btn permissions-save ${isAuthorizedToEdit ? '' : 'disabled'}`;
        return (
            <div className="sc-upper">
                <div className="sc-u title-sc-u sc-u-mid full-width">
                    <div className="nav-breadcrumb">
                        <i className="fa fa-angle-left"></i> <a href={`${extraPath}/account-permissions`}>Back</a>
                    </div>
                    <div className="flex-title">
                        <span className="sc-text-big">Account Permissions</span>
                        <div className="order-date pull-right align-items-center d-flex btn-permissions">
                            <a href={`${extraPath}/account-permissions`} className="btn btn-cancel">Cancel</a>
                            <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                <a href={null} onClick={(e) => this.createProfile(e)} className={saveBtnClass}>Save</a>
                            </PermissionTooltip>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}; 

module.exports = TitleComponent;