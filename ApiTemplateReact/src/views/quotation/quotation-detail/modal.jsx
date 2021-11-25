'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class ModalComponent extends BaseComponent {
    handleOkay() {
        const { modalProcess } = this.props;

        if (modalProcess == 'CANCEL QUOTATION') {
            return this.props.cancelQuotation();
        }

        this.props.declineQuotation();
    }

    render() {
        //ARC 9831
        let btnClassName = "btn-green btn-loader-cancel";

        return (
            <div id="modalRemove" className="modal fade in" role="dialog" data-backdrop="static" data-keyboard="false" style={{ display: 'none' }}>
                <div className="modal-dialog compare-delete-modal-content">
                    <div className="modal-content">
                        <div className="modal-body">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <p align="center">Are you sure you want to decline this quotation?</p>
                        </div>
                        <div className="modal-footer">
                            <div className="btn-gray" data-dismiss="modal">Cancel</div>
                            <div className={btnClassName} id="btnRemoveEvlist" onClick={(e) => this.handleOkay()}>Okay</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalComponent;