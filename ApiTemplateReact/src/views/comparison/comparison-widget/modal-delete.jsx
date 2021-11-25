'use strict';
var React = require('react');

class ModalDeleteComponent extends React.Component {
    onDeleteClick() {
        this.props.deleteComparisonDetail();

        $('#modalRemove').modal('hide');
    }

    render() {
        return (
            <div id="modalRemove" className="modal fade delete_item" role="dialog" data-backdrop="static" data-keyboard="false">
                <div className="modal-dialog compare-delete-modal-content">
                    <div className="modal-content">
                        <div className="modal-body">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <p align="center">Are you sure you want to delete the product <br />
                                from this list? </p>
                        </div>
                        <div className="modal-footer">
                            <div className="btn-gray" data-dismiss="modal">Cancel</div>
                            <div className="btn-green confirm_remove" data-dismiss="" onClick={(e) => this.onDeleteClick()}>Okay</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalDeleteComponent;