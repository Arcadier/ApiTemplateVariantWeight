'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const TitleComponent = require('./title');
const FilterComponent = require('./filter');
const PageItemCountComponent = require('../../common/page-item-count');
const ModalInviteUserComponent = require('./modal-invite-user');
const ModalDeleteUserComponent = require('./modal-delete-user');
const PaginationComponent = require('../../common/pagination');
const FooterComponent = require('./footer');
const SubAccountActions = require('../../../redux/subAccountActions');
const EnumCoreModule = require('../../../public/js/enum-core');
const PermissionTooltip = require('../../common/permission-tooltip');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class SubAccountListComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            pageCount: 20
        };

        this.goToPage = this.goToPage.bind(this);
        this.sendInvitations = this.sendInvitations.bind(this);
        this.showDelete = this.showDelete.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.showInviteModal = this.showInviteModal.bind(this);

        this.permissionPageType = props.isMerchantAccess ? 'merchant' : 'consumer';
    }

    handlePageSizeChange(value) {
        this.setState({ pageCount: parseInt(value) });
        this.props.search(value, 1, this.props.keyword);
    }

    handleCheckboxChange(event, user, type, checked) {
        event.preventDefault();

        if (this.isUserEditable(user)) {
            if (!this.isLoggedUserMerchant()) {
                if (!checked) {
                    alert('Select at least one option.');
                }
            } else {
                const role = type == 'buyer' ? 'Subbuyer' : 'Submerchant';

                if (checked) {
                    this.props.addRole(user.ID, role);
                } else if (user.Roles.length > 1) {
                    this.props.deleteRole(user.ID, role);
                } else {
                    alert('Select at least one option.');
                }
            }
        }
    }

    isLoggedUserMerchant() {
        const user = this.props.user;

        if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
            return true;
        }

        return false;
    }

    isUserEditable(user) {
        const loggedUser = this.props.user;

        if (!loggedUser.AccountOwnerID && loggedUser.ID == user.ID) {
            return false;
        }

        if (loggedUser.AccountOwnerID) {
            if ((loggedUser.AccountOwnerID == user.ID) || (loggedUser.Roles.includes('Submerchant') && loggedUser.SubmerchantID == user.ID) || (loggedUser.SubBuyerID == user.ID)) {
                return false
            }
        }

        return true;
    }

    isUserMerchant(user) {
        if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
            return true;
        }

        return false;
    }

    isUserBuyer(user) {
        if (user.Roles.includes('User') || user.Roles.includes('Merchant') || user.Roles.includes('Subbuyer')) {
            return true;
        }

        return false;
    }

    goToPage(pageNumber) {
        this.props.search(null, pageNumber, this.props.keyword);
    }

    sendInvitations(emails, registrationType, callback) {
        this.props.sendInvitations(emails, registrationType, callback);
    }

    showDelete(userId) {
        if (!this.props.isAuthorizedToDelete) return;
        const self = this;
        this.props.validatePermissionToPerformAction(`delete-${this.permissionPageType}-sub-accounts-api`, () => {
            self.props.setUserToDelete(userId);
        });
    }

    showInviteModal(e) {
        const btn = $(`#${e.target.id}`);
        if (!this.props.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction(`add-${this.permissionPageType}-sub-accounts-api`, () => {
            $('#modal-create-account').modal('show');
            $('#cover').fadeIn();
            $('#modal-create-account').find('.modal-title').html(btn.data('modal-title'));
            $('#modal-create-account').find('button[type="button"]').data('registration-type', btn.data('registration-type'));
            $('#modal-create-account').find('button[type="button"]').attr('disabled', false);
            $('#modal-create-account').find('input[name="invite_mail"]').val('');
        });
    }

    componentDidMount() {
        $('#filter-form').on('submit', () => {
            return false;
        });
    }

    renderCheckbox(index, type, user) {
        const isChecked = type == 'buyer' ? this.isUserBuyer(user) : this.isUserMerchant(user);

        return (
            <div className={isChecked ? 'checkbox_sub active' : 'checkbox_sub'}>
                <label htmlFor={type + index}>
                    {isChecked ? <i className="fas fa-check blue-tick" /> : null}
                </label>
                <input type="checkbox" id={type + index} checked={isChecked} onChange={(e) => this.handleCheckboxChange(e, user, type, e.target.checked)} />
            </div>
        );
    }

    renderDeleteButton(account) {
        if (!this.isUserEditable(account)) {
            return (
                <td className="action-cell mobi-text-right" data-th=""></td>
            );
        }

        return (
            <td className="action-cell mobi-text-right" data-th="">
                <PermissionTooltip isAuthorized={this.props.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                    <a data-id="" className="delete_project"><i className="icon icon-delete" onClick={(e) => this.showDelete(account.ID)} /></a>
                </PermissionTooltip>
            </td>
        );
    }

    renderInviteMerchantLink() {
        if (this.isLoggedUserMerchant()) {
            return (
                <PermissionTooltip isAuthorized={this.props.isAuthorizedToAdd} extraClassOnUnauthorized={"icon-grey"}>
                    <a className="top-title" href="#" onClick={this.showInviteModal} id="inviteMerchantSubAccounts" data-registration-type="MerchantSubAccount" data-modal-title="Invite Merchant Sub-Account"><i className="fas fa-plus fa-fw" /> Invite Merchant Sub-Account</a>
                </PermissionTooltip>
            );
        }

        return null;
    }

    renderLoginId(user) {
        if (user.UserName != null) {
            const userName = user.UserName;

            if (userName.startsWith('Facebook')) {
                return (<i className='fb-logo' />);
            } else if (userName.startsWith('Google')) {
                return (<i className='google-logo' />);
            } else {
                return userName;
            }
        }

        return null;
    }

    renderSubAccountsHeader() {
        const self = this;

        return (
            <tr>
                <th className="left-phrase">Login ID</th>
                <th className="left-phrase">Name</th>
                <th className="left-phrase">Notification Email</th>
                <th>Buyer</th>
                {self.isLoggedUserMerchant() ? <th>Merchant</th> : null}
                <th />
            </tr>
        );
    }

    renderSubAccounts(accounts) {
        const self = this;
            return (
                accounts.map((user, index) => {
                    return (
                        <tr key={index} className="account-row " data-key="item" data-id={user.ID}>
                            <td data-th="Login ID">{self.renderLoginId(user)}</td>
                            <td data-th="Name">{typeof user.FirstName == 'undefined' || user.FirstName == null ? '' : user.FirstName} {typeof user.LastName == 'undefined' || user.LastName == null ? '' : user.LastName}  </td>
                            <td data-th="Notification Email">{user.Email}</td>
                            <td data-th="Buyer">
                                {self.renderCheckbox(index, 'buyer', user)}
                            </td>
                            {
                                self.isLoggedUserMerchant() ?
                                    <td data-th="Merchant">
                                        {self.renderCheckbox(index, 'merchant', user)}
                                    </td>
                                    : null
                            }
                            {self.renderDeleteButton(user)}
                        </tr>
                    )
                })
            );        
    }

    renderEmpty() {
        if (this.props.subAccounts && this.props.subAccounts.Records.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/key-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">No sub-accounts yet.</div>
                    <div className="empty-page-message">Invite sub-account users to help you manage your marketplace</div>
                </div>
            )
        }
    }
    render() {
        const { TotalRecords = 0, PageSize = 0, PageNumber = 0, Records = [] } = this.props.subAccounts || {};
        let paginationState = (this.props.subAccounts && this.props.subAccounts.Records.length === 0 ? "hide" : "");
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main" style={{ paddingTop: '44px' }}>
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <TitleComponent title={"Account List"} entries={TotalRecords} />
                                    <div className="sc-tops">
                                        <PermissionTooltip isAuthorized={this.props.isAuthorizedToAdd} extraClassOnUnauthorized={"icon-grey"}>
                                            <a className="top-title" href="#" id="inviteBuyerSubAccounts" onClick={this.showInviteModal} data-registration-type="BuyerSubAccount" data-modal-title="Invite Buyer Sub-Account"><i className="fas fa-plus fa-fw" /> Invite Buyer Sub-Account</a>
                                        </PermissionTooltip>
                                        {
                                            this.isLoggedUserMerchant() ? this.renderInviteMerchantLink() : ''
                                        }
                                    </div>
                                </div>

                                <div className="sassy-filter sm-filter">
                                    <form id="filter-form">
                                        <div className="sassy-flex">
                                            <FilterComponent search={this.props.search} />
                                            <PageItemCountComponent onChange={this.handlePageSizeChange} value={this.state.pageCount} />
                                        </div>
                                    </form>
                                </div>
                                <div className="subaccount-data-table table-responsive">
                                    <table className="table order-data1 sub-account">
                                        <thead>
                                            {this.renderSubAccountsHeader(Records)}
                                        </thead>
                                        <tbody>
                                            {this.renderSubAccounts(Records)}
                                        </tbody>
                                    </table>
                                    {this.renderEmpty()}
                                    <PaginationComponent pagingState={paginationState} totalRecords={TotalRecords} pageSize={PageSize} pageNumber={PageNumber} goToPage={this.goToPage} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <ModalInviteUserComponent sendInvitations={this.sendInvitations} />
                    <ModalDeleteUserComponent userToDelete={this.props.userToDelete} setUserToDelete={this.props.setUserToDelete} deleteUser={this.props.deleteUser} />
                    <FooterComponent />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        isMerchantAccess: state.subAccountReducer.isMerchantAccess,
        subAccounts: state.subAccountReducer.subAccounts,
        userToDelete: state.subAccountReducer.userToDelete,
        keyword: state.subAccountReducer.keyword,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete
    };
}

function mapDispatchToProps(dispatch) {
    return {
        addRole: (userId, role) => dispatch(SubAccountActions.addRole(userId, role)),
        deleteRole: (userId, role) => dispatch(SubAccountActions.deleteRole(userId, role)),
        deleteUser: () => dispatch(SubAccountActions.deleteUser()),
        search: (pageSize, pageNumber, keyword) => dispatch(SubAccountActions.search(pageSize, pageNumber, keyword)),
        sendInvitations: (emails, registrationType, callback) => dispatch(SubAccountActions.sendInvitations(emails, registrationType, callback)),
        setUserToDelete: (userId) => dispatch(SubAccountActions.setUserToDelete(userId)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const SubAccountListHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(SubAccountListComponent);

module.exports = {
    SubAccountListHome,
    SubAccountListComponent
};