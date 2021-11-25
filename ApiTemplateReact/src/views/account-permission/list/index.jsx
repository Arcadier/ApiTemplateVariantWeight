'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const toastr = require('toastr');

const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;

const TitleComponent = require('./title');
const FilterComponent = require('./filter');
const ListComponent = require('./list');

const { filterPermissionProfiles, deletePermissionProfile, selectPermissionProfile } = require('../../../redux/accountPermissionActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class AccountPermissionListComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    hideConfirmationModal() {
        this.props.selectPermissionProfile(null);
        const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");
        target.fadeOut();
        cover.fadeOut();
    }


    handleDeleteSelectedPermissionProfile() {
        const self = this;
        this.props.deletePermissionProfile((result) => {
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

    searchPermissionProfiles(options) {
        const { permissionProfiles } = this;
        
        this.filterPermissionProfiles({
            keyword: options && options.keyword !== undefined && options.keyword !== null ? options.keyword : this.keyword,
            pageSize: (options && options.pageSize) || (permissionProfiles && permissionProfiles.PageSize) || 20,
            pageNumber: (options && options.pageNumber) || (permissionProfiles && permissionProfiles.PageNumber) || 1,
        });
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
                                    permissionProfiles={this.props.permissionProfiles}
                                    keyword={this.props.keyword}
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    filterPermissionProfiles={this.props.filterPermissionProfiles}
                                    searchPermissionProfiles={this.searchPermissionProfiles}
                                    isAuthorizedToAdd={this.props.isAuthorizedToAdd}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                                <FilterComponent 
                                    permissionProfiles={this.props.permissionProfiles}
                                    keyword={this.props.keyword}
                                    filterPermissionProfiles={this.props.filterPermissionProfiles}
                                    searchPermissionProfiles={this.searchPermissionProfiles}
                                />
                                <ListComponent 
                                    permissionProfiles={this.props.permissionProfiles}
                                    keyword={this.props.keyword}
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    filterPermissionProfiles={this.props.filterPermissionProfiles}
                                    searchPermissionProfiles={this.searchPermissionProfiles}
                                    selectPermissionProfile={this.props.selectPermissionProfile}
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
                                <input onClick={() => this.handleDeleteSelectedPermissionProfile()} type="button" value="Okay" className="my-btn btn-saffron confirm_remove" />
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
        permissionProfiles: state.accountPermissionReducer.permissionProfiles,
        keyword: state.accountPermissionReducer.keyword,
        isMerchantAccess: state.accountPermissionReducer.isMerchantAccess,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete
    };
}

function mapDispatchToProps(dispatch) {
    return {
        filterPermissionProfiles: (filters) => dispatch(filterPermissionProfiles(filters)),
        selectPermissionProfile: (ID) => dispatch(selectPermissionProfile(ID)),
        deletePermissionProfile: (callback) => dispatch(deletePermissionProfile(callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const AccountPermissionListHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountPermissionListComponent);

module.exports = {
    AccountPermissionListHome,
    AccountPermissionListComponent
};