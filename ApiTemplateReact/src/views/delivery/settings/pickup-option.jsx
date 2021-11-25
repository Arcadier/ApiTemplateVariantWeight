'use strict';
var React = require('react');

var BaseClassComponent = require('../../shared/base.jsx');
var EnumCoreModule = require('../../../../src/public/js/enum-core.js');

const PermissionTooltip = require('../../common/permission-tooltip');

class PickupComponent extends BaseClassComponent {
    constructor(props) {
        super(props);

        this.state = {
            addressCreateState: ''
        };
    }

    componentDidMount() {

    }

    showDeleteModal(deleteObjectId) {
        var self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-delivery-methods-api", () => {
            self.setState({
                deleteObjectId: deleteObjectId
            }, function () {
                $('#modalRemovePickupLocation').modal('show');
            });
        });
    }

    doDelete() {
        var self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-delivery-methods-api", () => {
            $('#modalRemovePickupLocation').modal('hide');
            self.props.deleteAddress(self.state.deleteObjectId);
        });
    }

    doCreateAddress() {
        var self = this;

        this.props.validatePermissionToPerformAction("add-merchant-delivery-methods-api", () => {
            if (self.state.addressCreateState.length < 1) {
                self.showMessage(EnumCoreModule.GetToastStr().Error.PLEASE_FILL_OUT_THE_REQUIRED_FIELD_TO_PROCEED)
                return;
            }

            var addedValue = {
                "Line1": self.state.addressCreateState,
                'Pickup': true
            }

            self.props.createAddress((addedValue));

            self.setState(
                {
                    addressCreateState: ''
                }, function () {
                });

            $('.addpickup-option input.input-text').val('');
        });
    }

    showPickupOption() {
        var self = this;
        if (this.props.pickupLocations && this.props.pickupLocations.length > 0) {
            return (
                this.props.pickupLocations.map(function (pickUp) {
                    return (
                        <li className="parent-r-b" key={pickUp.ID}>
                            <span className="pickup-name">{pickUp.Line1}</span>
                            <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={'icon-grey'}>
                                <span className="pickup-remove openModalRemove pull-right" onClick={(e) => self.showDeleteModal(pickUp.ID)}>
                                    <i className="fa fa-times" />
                                </span>
                            </PermissionTooltip>
                        </li>
                    )
                })
            )
        }
        else
            return ('')
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div id="modalRemovePickupLocation" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemove" onClick={(e) => self.doDelete()}>Okay</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ds-content">
                    <div className="dsc-table">
                        <div className="dsct-top full-width">
                            <div className="pull-left">
                                <span className="dsct-text">Pick-up Options</span>
                                <p className="dsct-p">Define the full address where the buyer can pick-up from</p>
                            </div>
                        </div>
                        <div className="ph-t-table">
                            <span className="dsctn-text full-width">Name</span>
                            <ul className="pickup-options full-width">
                                {self.showPickupOption()}
                            </ul>
                            <div className="addpickup-option">
                                <input type="text" className="input-text required" data-react-state-name="addressCreateState" defaultValue={this.state.addressCreateState} onChange={(e) => this.onChange(e)} />
                                <div className="pull-right">
                                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                        <div className="btn-add-pickup" id="btnAddPickupOption" onClick={(e) => self.doCreateAddress()}>Add Pick-up Option</div>
                                    </PermissionTooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        );
    }
}

module.exports = PickupComponent;