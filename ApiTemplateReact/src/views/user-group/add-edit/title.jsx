const React = require('react');
const toastr = require('toastr');
const BaseComponent = require('../../shared/base');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class TitleComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.permissionPageType = props.isMerchantAccess ? 'merchant' : 'consumer';
        this.extraPath = props.isMerchantAccess ? '/merchants' : '';
    }

    createGroup(e) {
        const userGroup = this.props.getData();

        $('#user_group_name').removeClass('error-con');

        let hasError = false;
        if (!userGroup.Name || (userGroup.Name && userGroup.Name.length == 0)) {
            $('#user_group_name').addClass('error-con');
            hasError = true;
        }

        if (hasError) {
            return;
        }
       
        if (this.props.processing) return;

        if (!this.props.isAuthorizedToEdit) return;
        const self = this;
        this.props.validatePermissionToPerformAction(`edit-${this.permissionPageType}-create-user-group-api`, () => {
            self.props.setProcessing(true);
            if (self.props.userGroup && self.props.userGroup.ID) {
                const { ID } = self.props.userGroup;
                self.props.updateUserGroup({ ...userGroup, userGroupID: ID }, (result) => {
                    if (result) {
                        const { success, message } = result;
                        if (success) {
                            toastr.success('Group name has been updated.', 'Success!')
                            window.location.href = `${self.extraPath}/user-groups`;
                        } else {
                            toastr.error(message);
                        }
                    } else {
                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                    }
                    self.props.setProcessing(false);
                });
            } else {
                self.props.createUserGroup(userGroup, (result) => {
                    if (result) {
                        const { success, message } = result;
                        if (success) {
                            toastr.success('Group name has been created.', 'Success!')
                            window.location.href = `${self.extraPath}/user-groups`;
                        } else {
                            toastr.error(message);
                        }
                    } else {
                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                    }
                   
                    self.props.setProcessing(false);
                });
            }
        });
    }

    render() {
        const { isAuthorizedToEdit } = this.props;
        const saveBtnClass = `btn permissions-save ${isAuthorizedToEdit ? '' : 'disabled'}`;
        return (
            <div className="sc-upper">
                <div className="sc-u title-sc-u sc-u-mid full-width">
                    <div className="nav-breadcrumb">
                        <i className="fa fa-angle-left"></i> <a href={`${this.extraPath}/user-groups`}>Back</a>
                    </div>
                    <div className="flex-title">
                        <span className="sc-text-big">User Groups</span>
                        <div className="order-date pull-right align-items-center d-flex btn-permissions">
                            <a href={`${this.extraPath}/user-groups`} className="btn btn-cancel">Cancel</a>
                            <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                <a href={null} onClick={(e) => this.createGroup(e)} className={saveBtnClass}>Save</a>
                            </PermissionTooltip>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}; 

module.exports = TitleComponent;