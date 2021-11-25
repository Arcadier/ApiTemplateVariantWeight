'use strict';
var React = require('react');

class ModalDeleteComparisonComponent extends React.Component {
    onDeleteClick(e) {
        this.props.deleteEvaluationList(e, this.props.reloadEvaluationListPage);
        $('#modalRemove').modal('hide');
    }
    render() {
        return (
            <div id="modalRemove" className="modal fade delete_item" role="dialog" data-backdrop="static" data-keyboard="false">
                <div className="modal-dialog compare-delete-modal-content">
                    <div className="modal-content">
                        <div className="modal-body">
                            <p align="center">Are you sure you want to remove this list ? <br /> ( all data will be gone forever)</p>
                        </div>
                        <div className="modal-footer">
                            <div className="btn-gray" data-dismiss="modal">Cancel</div>
                            <div className="btn-green confirm_remove" data-dismiss="modal" onClick={(e) => this.onDeleteClick(this.props.comparisonList.ID)}>Okay</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalDeleteComparisonComponent;