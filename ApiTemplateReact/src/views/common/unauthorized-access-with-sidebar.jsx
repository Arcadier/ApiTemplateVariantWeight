'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayoutComponent = require('../layouts/header').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../layouts/sidebar').SidebarLayoutComponent;

class UnauthorizedAccessPageWithSidebarComponent extends React.Component {
    constructor(props) {
        super(props);       
    }
    render() {
        return (
           <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayoutComponent user={this.props.user} />
                </aside>
                <div className="main-content">
                   <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="permission-message">You need permission to access this page</div>
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
    }
}

function mapDispatchToProps(dispatch) {
    return {};
}

const UnauthorizedAccessPageWithSidebarHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(UnauthorizedAccessPageWithSidebarComponent);

module.exports = {
    UnauthorizedAccessPageWithSidebarHome,
    UnauthorizedAccessPageWithSidebarComponent,
};
