const React = require('react');
const BaseComponent = require('../../shared/base');
const PaginationComponent = require('../../common/pagination');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class ListComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.permissionPageType = props.isMerchantAccess ? 'merchant' : 'consumer';
        this.extraPath = props.isMerchantAccess ? '/merchants' : '';
    }

    showConfirmationModal() {
        const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");
        target.fadeIn();
        cover.fadeIn();
    }

    handleDeleteUserGroupBtnClick(ID) {
        const self = this;
        if (!this.props.isAuthorizedToDelete) return;
        this.props.validatePermissionToPerformAction(`delete-${this.permissionPageType}-user-groups-api`, () => {
            self.showConfirmationModal();
            self.props.selectUserGroup(ID);
        });
    }

    onEditGroupBtnClick(ID) {
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction(`edit-${this.permissionPageType}-user-groups-api`, () => window.location.href = `${self.extraPath}/user-groups/detail/${ID}`);
    }
    renderEmpty() {
        if (this.props.userGroups != null && this.props.userGroups.Records.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/user-group-empty.svg" alt="empty page img" />
                    <div className="empty-page-title">Nothing to see here.</div>
                    <div className="empty-page-message">Start by creating new group</div>
                </div>
            )
        }
    }
    render() {
        const { isAuthorizedToEdit, isAuthorizedToDelete } = this.props;
        const { TotalRecords, Records, PageNumber, PageSize } = this.props.userGroups

        return (
            <div className="subaccount-data-table table-responsive">
                <table className="table order-data1 sub-account tbl-department">
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>No. of Users </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            TotalRecords > 0 && Records.map((record, index) => 
                                <tr className="account-row" key={index} data-key={index} data-id={record.ID}>
                                    <td>{record.Name}</td>
                                    <td>{record.Users.length}</td>
                                    <td data-th="Action">
                                        <a href={null} onClick={() => this.onEditGroupBtnClick(record.ID)} className="edit_item">
                                            <PermissionTooltip isAuthorized={isAuthorizedToEdit} extraClassOnUnauthorized={"icon-grey"}>
                                                <i className="icon icon-edit"></i>
                                            </PermissionTooltip>
                                        </a>
                                        <a href={null} onClick={() => this.handleDeleteUserGroupBtnClick(record.ID)}>
                                            <PermissionTooltip isAuthorized={isAuthorizedToDelete}>
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
                    goToPage={(pageNumber) => this.props.searchUserGroups({ pageNumber })}
                />
            </div>
        )
    }
}; 

module.exports = ListComponent;