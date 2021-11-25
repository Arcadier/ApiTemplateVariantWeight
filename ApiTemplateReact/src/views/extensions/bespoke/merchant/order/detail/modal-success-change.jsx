'use strict';
var React = require('react');

class ModalStatusChangeComponent extends React.Component {
    render() {
        return (
            <div id="modalStatusChange" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                <div className="modal-dialog delete-modal-content">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="bold">
                                STATUS CHANGED
                            </h4>
                        </div>
                        <div className="modal-body">
                            <p>The order status for this item has been updated.</p>
                        </div>
                        <div className="modal-footer">
                            <div className="btn-gray" onClick={(e) => this.props.showHideSuccessMessage(false)}>Okay</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalStatusChangeComponent;