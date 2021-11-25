'use strict';

var React = require('react');

class ModalAddEditComponent extends React.Component {
    constructor(props) {
        super(props)
        this.saveData = this.saveData.bind(this);
    }

    onSave(event) {
        if (event.which === 13 || event.keyCode == 13 || event.which === undefined) {
            this.saveData();
        }
    }

    saveData() {
        const self = this;
        const { comparisonList } = this.props;
        let permissionCode = typeof comparisonList.ID === 'undefined' ? 'add-consumer-comparison-tables-api' : 'edit-consumer-comparison-tables-api';

        this.props.validatePermissionToPerformAction(permissionCode, () => {
            var $form = $('#frm-comparison');
            var $name = $form.find('#list_name');
            var name = $.trim($name.val());

            if (!name) {
                $name.addClass('error-con');
                return;
            } else {
                $name.removeClass('error-con');
                $('#modal-add-comparison-list').modal('hide');
            }

            if (self.props.comparisonList.ID === undefined) {
                self.props.addEvaluationList(name);
            } else {
                self.props.editEvaluationList(self.props.comparisonList.ID, name);
            }
        });      
    }

    onChange(event) {
        const self = this;
        let value = '';
        let dataId = '';
        if (typeof event !== 'undefined') {
            value = event.target.value;
            dataId = event.target.dataset.id;
        }

        if (value === '') {
            $('#listName').val('');
            $('#listName').attr('data-id', '');
        }

        self.props.setEvaluationToUpdate(dataId, value);
    }

    componentDidMount() {
        if (this.props.comparisonList === null) {
            $('#listName').val('');
        }
    }

    render() {
        return (
            <div id="modal-add-comparison-list" className="modal fade x-boot-modal" role="dialog">
                <div className="modal-dialog">
                    <form method="POST" id="frm-comparison" action="javascript:void(0);">
                        {/* Modal content */}
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
                                <h4 className="modal-title" align="center">Add/Edit list</h4>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="list_name">List Name</label>
                                    <input type="text" name="list_name" id="list_name" className="form-control required" onKeyUp={(e) => this.onSave(e)} onChange={(e) => this.onChange(e)} value={this.props.comparisonList ? this.props.comparisonList.Name : ''} data-id={this.props.comparisonList ? this.props.comparisonList.ID : ''} />
                                </div>
                            </div>
                            <div className="modal-footer text-center">
                                <button type="button" className="btn btn-green btn-save-comparison-list" onClick={(e) => this.onSave(e)}>Save</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

module.exports = ModalAddEditComponent;