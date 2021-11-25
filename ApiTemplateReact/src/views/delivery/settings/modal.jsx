'use strict';
var React = require('react');

class ModalComponent extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div id="modalRemove" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemove">Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </React.Fragment>
        );
    }
}

module.exports = ModalComponent;