'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const TitleComponent = require('./title');
const FormComponent = require('./form');
const PermissionTableComponent = require('./permission-table');

const { createPermissionProfile, updatePermissionProfile } = require('../../../redux/accountPermissionActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

const { PROCESSING } = require('../../../redux/actionTypes');

if (typeof window !== 'undefined') { var $ = window.$; }

class AddEditPermissionProfileComponent extends React.Component {
    constructor(props) {
        super(props);
        this.formComponent = React.createRef();
        this.permissionComponent = React.createRef();
        this.getData = this.getData.bind(this);
    }

    getData() {
        if (this.formComponent && this.formComponent.current && this.permissionComponent && this.permissionComponent.current) {
            const { Name, SelectedUserGroups } = this.formComponent.current.state;
            const { LinkedPermissions } = this.permissionComponent.current.state;
            return { Name, SelectedUserGroups, LinkedPermissions };
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
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    setProcessing={this.props.setProcessing}
                                    processing={this.props.processing}
                                    getData={this.getData}
                                    createPermissionProfile={this.props.createPermissionProfile}
                                    permissionProfile={this.props.permissionProfile}
                                    updatePermissionProfile={this.props.updatePermissionProfile}
                                    isAuthorizedToEdit={this.props.isAuthorizedToEdit}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                                <FormComponent
                                    userGroups={this.props.userGroups}
                                    ref={this.formComponent}
                                    permissionProfile={this.props.permissionProfile}
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    isAuthorizedToEdit={this.props.isAuthorizedToEdit}
                                    validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                />
                                <PermissionTableComponent
                                    permissions={this.props.permissions}
                                    ref={this.permissionComponent}
                                    permissionProfile={this.props.permissionProfile}
                                    pageNameOverrides={this.props.pageNameOverrides}
                                    isMerchantAccess={this.props.isMerchantAccess}
                                    isAuthorizedToEdit={this.props.isAuthorizedToEdit}
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
        processing: state.accountPermissionReducer.processing,
        userGroups: state.accountPermissionReducer.userGroups,
        permissions: state.accountPermissionReducer.permissions,
        permissionProfile: state.accountPermissionReducer.permissionProfile,
        pageNameOverrides: state.accountPermissionReducer.pageNameOverrides,
        isMerchantAccess: state.accountPermissionReducer.isMerchantAccess,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setProcessing: (processing) => dispatch({ type: PROCESSING, processing: processing }),
        createPermissionProfile: (options, callback) => dispatch(createPermissionProfile(options, callback)),
        updatePermissionProfile: (options, callback) => dispatch(updatePermissionProfile(options, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const AddEditPermissionProfileHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(AddEditPermissionProfileComponent);

module.exports = {
    AddEditPermissionProfileHome,
    AddEditPermissionProfileComponent
};