'use strict';
const React = require('react');
const PaginationComponent = require('../../common/pagination');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class ListComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    showConfirmationModal() {
        const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");
        target.fadeIn();
        cover.fadeIn();
    }

    handleDeletePermissionProfileBtnClick(ID) {
        if (!this.props.isAuthorizedToDelete) return;
        const self = this;
        const code = `delete-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-account-permissions-api`;
        this.props.validatePermissionToPerformAction(code, () => {
            self.showConfirmationModal();
            self.props.selectPermissionProfile(ID);
        });
    }

    onEditProfileBtnClick(ID) {
        if (!this.props.isAuthorizedToEdit) return;
        const code = `edit-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-account-permissions-api`;
        const extraPath = this.props.isMerchantAccess ? '/merchants' : '';
        this.props.validatePermissionToPerformAction(code, () => window.location.href = `${extraPath}/account-permissions/detail/${ID}`);
    }
    renderEmpty() {
        if (this.props.permissionProfiles != null && this.props.permissionProfiles.Records.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/key-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">No permission profile yet.</div>
                    <div className="empty-page-message">When you create permissions profile it will be listed here</div>
                </div>
            )
        }
    }
    render() {
        const { permissionProfiles } = this.props;
        const TotalRecords = (permissionProfiles && permissionProfiles.TotalRecords) || 0;
        const PageNumber = (permissionProfiles && permissionProfiles.PageNumber) || 1;
        const PageSize = (permissionProfiles && permissionProfiles.PageSize) || 20;
        const Records = (permissionProfiles && permissionProfiles.Records) || [];

        return (
            <div className="subaccount-data-table table-responsive">
                <table className="table order-data1 sub-account tbl-department">
                    <thead>
                        <tr>
                            <th>Profile Name</th>
                            <th>Number of Group</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            TotalRecords > 0 && Records.map((record, index) => 
                                <tr className="account-row" key={index} data-key={index} data-id={record.ID}>
                                    <td>{record.Name}</td>
                                    <td>{record.UserGroups.length}</td>
                                    <td data-th="Action">
                                        <a href="#" onClick={() => this.onEditProfileBtnClick(record.ID)} className="edit_item">
                                            <PermissionTooltip isAuthorized={this.props.isAuthorizedToEdit} extraClassOnUnauthorized={"icon-grey"}>
                                                <i className="icon icon-edit"></i>
                                            </PermissionTooltip>
                                        </a>
                                        <a href="#" onClick={() => this.handleDeletePermissionProfileBtnClick(record.ID)}>
                                            <PermissionTooltip isAuthorized={this.props.isAuthorizedToDelete}>
                                                <i className="icon icon-delete"></i>
                                            </PermissionTooltip>
                                        </a>
                                    </td>
                                </tr>
                            )
                        }
                        
                    </tbody>
                </table>
                {this.renderEmpty()}
                <PaginationComponent
                    totalRecords={TotalRecords}
                    pageNumber={PageNumber}
                    pageSize={PageSize}
                    goToPage={(pageNumber) => this.props.searchPermissionProfiles({ pageNumber })}
                />
            </div>
        )
    }
}; 

module.exports = ListComponent;