'use strict';
const React = require('react');
const BaseComponent = require('../shared/base');

class PermissionTooltip extends React.Component {
    constructor(props) {
        super(props);       
    }
   
    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip()
    }

    disableChildren(child) {
        const props = {
            style: {
                pointerEvents: 'none'
            }
        };

        return React.cloneElement(child, props);
    }

    render() {
        const { isAuthorized, placement, extraClassOnUnauthorized } = this.props;
        if (isAuthorized) return this.props.children;

        return (
            <span className={`tool-tip inline ${extraClassOnUnauthorized || ''}`} data-toggle="tooltip" data-placement={placement || "auto top"} title="" data-original-title="You need permission to perform this action">
                {React.Children.map(this.props.children, child => this.disableChildren(child))}
            </span>
        );
    }
}

module.exports = PermissionTooltip;