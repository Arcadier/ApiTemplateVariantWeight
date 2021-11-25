'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const toastr = require('toastr');

const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;

const TitleComponent = require('./title');
const FilterComponent = require('./filter');
const ListComponent = require('./list');

const { filterUserGroups, deleteUserGroup, selectUserGroup } = require('../../../redux/userGroupActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class UserGroupListComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    searchUserGroups(options) {
        const { userGroups } = this;
        this.filterUserGroups({
            keyword: options && options.keyword !== null ? options.keyword : this.keyword,
            pageSize: (options && options.pageSize) || (userGroups && userGroups.PageSize) || 20,
            pageNumber: (options && options.pageNumber) || (userGroups && userGroups.PageNumber) || 1,
        });
    }

    hideConfirmationModal() {
        this.props.selectUserGroup(null);
        const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");
        target.fadeOut();
        cover.fadeOut();
    }

    handleDeleteSelectedUserGroup() {
        const self = this;
        this.props.deleteUserGroup((result) => {
            if (result) {
                const { success, message } = result;
                if (!success) {
                    if (message !== null) {
                        toastr.error(message);
                    } else {
                        toastr.error('Please try again later.', 'Oops! Something went wrong.');
                    }
                }
            } else {
                toastr.error('Please try again later.', 'Oops! Something went wrong.');
            }
        });
        this.hideConfirmationModal();
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <TitleComponent 
                                    userGroups={this.props.userGroups}
                                    keyword={this.props.keyword}
                                    filterUserGroups={this.props.filterUserGroups}
                                    searchUserGroups={this.searchUserGroups}
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    isAuthorizedToAdd={this.props.isAuthorizedToAdd}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                                <FilterComponent 
                                    userGroups={this.props.userGroups}
                                    keyword={this.props.keyword}
                                    filterUserGroups={this.props.filterUserGroups}
                                    searchUserGroups={this.searchUserGroups}
                                />
                                <ListComponent 
                                    userGroups={this.props.userGroups}
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    keyword={this.props.keyword}
                                    filterUserGroups={this.props.filterUserGroups}
                                    searchUserGroups={this.searchUserGroups}
                                    selectUserGroup={this.props.selectUserGroup}
                                    isAuthorizedToEdit={this.props.isAuthorizedToEdit}
                                    isAuthorizedToDelete={this.props.isAuthorizedToDelete}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div id="cover"></div>
                <div className="popup-area item-remove-popup">
                    <div className="wrapper">
                        <div className="title-area text-capitalize">
                            <h1>REMOVE ITEM
                            </h1>
                        </div>
                        <div className="content-area">
                            <p>You sure about removing this item from your list?</p>
                            <p>(It'll be gone forever!)</p>
                        </div>
                        <div className="btn-area">
                            <div className="pull-left">
                                <input type="button" value="CANCEL" className="my-btn btn-black cancel_remove" onClick={() => this.hideConfirmationModal()} />
                            </div>
                            <div className="pull-right">
                                <input onClick={() => this.handleDeleteSelectedUserGroup() } type="button" value="Okay" className="my-btn btn-saffron confirm_remove" />
                            </div>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        userGroups: state.userGroupReducer.userGroups,
        keyword: state.userGroupReducer.keyword,
        isMerchantAccess: state.userGroupReducer.isMerchantAccess,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete
    };
}

function mapDispatchToProps(dispatch) {
    return {
        filterUserGroups: (filters) => dispatch(filterUserGroups(filters)),
        deleteUserGroup: (callback) => dispatch(deleteUserGroup(callback)),
        selectUserGroup: (userGroupID) => dispatch(selectUserGroup(userGroupID)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const UserGroupListHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(UserGroupListComponent);

module.exports = {
    UserGroupListHome,
    UserGroupListComponent
};