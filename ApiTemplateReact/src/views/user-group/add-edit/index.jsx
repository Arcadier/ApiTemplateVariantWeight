'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const TitleComponent = require('./title');
const FormComponent = require('./form');
const { createUserGroup, updateUserGroup } = require('../../../redux/userGroupActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

const { PROCESSING } = require('../../../redux/actionTypes');

if (typeof window !== 'undefined') { var $ = window.$; }

class AddEditUserGroupComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.formComponent = React.createRef();
        this.getData = this.getData.bind(this);
    }

    getData() {
        if (this.formComponent && this.formComponent.current) {
            const { Name, SelectedUsers } = this.formComponent.current.state;
            return { Name, SelectedUsers };
        }
        return {};
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
                                    getData={this.getData}  
                                    setProcessing={this.props.setProcessing}
                                    processing={this.props.processing}
                                    createUserGroup={this.props.createUserGroup}
                                    updateUserGroup={this.props.updateUserGroup}
                                    userGroup={this.props.userGroup}
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    isAuthorizedToEdit={this.props.isAuthorizedToEdit}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                                <FormComponent
                                    subAccounts={this.props.subAccounts}
                                    userGroup={this.props.userGroup}
                                    ref={this.formComponent}
                                    isAuthorizedToEdit={this.props.isAuthorizedToEdit}
                                    isAuthorizedToDelete={this.props.isAuthorizedToDelete}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
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
        user: state.userReducer.user,
        isMerchantAccess: state.userGroupReducer.isMerchantAccess,
        subAccounts: state.userGroupReducer.subAccounts,
        processing: state.userGroupReducer.processing,
        userGroup: state.userGroupReducer.userGroup,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setProcessing: (processing) => dispatch({ type: PROCESSING, processing: processing }),
        createUserGroup: (options, callback) => dispatch(createUserGroup(options, callback)),
        updateUserGroup: (options, callback) => dispatch(updateUserGroup(options, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const AddEditUserGroupHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(AddEditUserGroupComponent);

module.exports = {
    AddEditUserGroupHome,
    AddEditUserGroupComponent
};