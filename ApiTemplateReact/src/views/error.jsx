'use strict';
var React = require('react');
class Error extends React.Component {
    render() {
        return <div>{this.props.message}</div>;
    }
}
module.exports = Error;