'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

const PermissionTooltip = require('../../common/permission-tooltip');

class ModalAddEditComponent extends React.Component {
    componentDidUpdate() {
        if (typeof window !== 'undefined') {
            $('input[name="listname"]').val('');

            if ($.isEmptyObject(this.props.comparisonToUpdate) === false) {
                $('input[name="listname"]').val(this.props.comparisonToUpdate.Name);
            }
        }
    }

    onSaveClick() {
        const permissionCode = typeof this.props.comparisonToUpdate.ID === 'undefined' ? 'add-consumer-comparison-widget-api' : 'edit-consumer-comparison-widget-api';

        this.props.validatePermissionToPerformAction(permissionCode, () => {
            let input = $('input[name="listname"]');
            let name = input.val().trim();

            if (name === '') {
                input.addClass('error-con');
            } else {
                if ($.isEmptyObject(this.props.comparisonToUpdate)) {
                    this.props.createComparison(name);
                } else {
                    this.props.editComparison(name);
                }

                $('.bs-example-modal-sm').modal('hide');
            }
        });        
    }

    render() {
        let isAuthorized = this.props.isAuthorizedToAdd;

        if (this.props.comparisonToUpdate && typeof this.props.comparisonToUpdate.ID !== 'undefined') {
            isAuthorized = this.props.isAuthorizedToEdit;
        }

        return (
            <div className="modal list-pop fade bs-example-modal-sm" tabIndex="-1" role="dialog" aria-labelledby="mySmallModalLabel">
                <div className="modal-dialog modal-sm" role="document">
                    <div className="modal-content">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <div className="pop-header">
                        </div>
                        <div className="pop-form-element">
                            <label>Comparison Table Name</label>
                            <input type="text" name="listname" />
                        </div>
                        <div className="pop-footer">
                            <div className="row-10">
                                <div className="col-sm-6 col-xs-6">
                                    <button className="close-list-btn " data-dismiss="modal" aria-label="Close" type="button">Cancel</button>
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <PermissionTooltip isAuthorized={isAuthorized} >
                                        <button className={isAuthorized ? "list-save-btn" : "list-save-btn disabled"} data-dismiss="" type="button" onClick={(e) => this.onSaveClick()}>Save</button>
                                    </PermissionTooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalAddEditComponent;