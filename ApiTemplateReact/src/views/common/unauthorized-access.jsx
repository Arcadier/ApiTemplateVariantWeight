'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayoutComponent = require('../layouts/header').HeaderLayoutComponent;

class UnauthorizedAccessPageComponent extends React.Component {
    constructor(props) {
        super(props);       
    }
   
    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent user={this.props.user} />
                </div>
                <div className="main">
                    <div className="container">     
                        <div className="permission-message">You need permission to access this page</div>
                    </div>
                </div>
            </React.Fragment>
        )
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

const UnauthorizedAccessPageHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(UnauthorizedAccessPageComponent);

module.exports = {
    UnauthorizedAccessPageHome,
    UnauthorizedAccessPageComponent,
};
