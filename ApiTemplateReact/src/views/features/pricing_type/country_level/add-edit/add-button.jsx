'use strict';
var React = require('react');
const PermissionTooltip = require('../../../../common/permission-tooltip');

class AddButtonComponent extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className="pull-right">
                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'} placement={'bottom'}>
                        <div className="un-btn-upload" id="itemUpload" onClick={() => this.props.uploadOrEditItem()}><a>Add Item</a></div>
                    </PermissionTooltip>
                </div>
            </React.Fragment>
        )
    }
}
module.exports = AddButtonComponent;