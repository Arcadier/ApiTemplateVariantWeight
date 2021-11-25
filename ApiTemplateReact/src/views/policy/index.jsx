'use strict';
var React = require('react');
var ReactRedux = require('react-redux');

var HeaderLayoutComponent = require('../layouts/header').HeaderLayoutComponent;
var FooterLayout = require('../layouts/footer').FooterLayoutComponent;
var ContainerComponent = require('../extensions/' + process.env.TEMPLATE + '/policy/container');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PolicyComponent extends React.Component {

    componentDidMount() {
        var self = this;
        console.log('gggggggggggggggggg', self.props)
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main">
                    <ContainerComponent
                        policy={this.props.policy}
                        pages={this.props.pages} />
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        policy: state.policyReducer.policy,
        pages: state.policyReducer.pages,
    };
}

//function mapDispatchToProps(dispatch) {
//    return {

//    };
//}

const PolicyHome = ReactRedux.connect(
    mapStateToProps,
    null
)(PolicyComponent);

module.exports = {
    PolicyHome,
    PolicyComponent
};