'use strict';
const React = require('React');
const BaseComponent = require('../../shared/base');

const PermissionTooltip = require('../../common/permission-tooltip');

class PaymentTermComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $('#modalRemovePaymentTerm').on('hide.bs.modal', function (e) {
            $('#btnRemovePaymentTerm').attr('data-payment-term-id', '');
        });
        $('[data-toggle="tooltip"]').tooltip()
    }

    deletePaymentTerm(e) {
        const self = this;

        this.props.validatePermissionToPerformAction("delete-merchant-payment-terms-api", () => {
            self.props.deletePaymentTerm($(e.target).attr('data-payment-term-id'));
            $('#modalRemovePaymentTerm').modal('hide');
        });
    }

    handlePrevious() {
        $('.nav-pills > .active').prev('li').find('a').trigger('click');
    }

    handleSave() {
        const self = this;
        if (!this.props.pagePermissions.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction("add-merchant-payment-terms-api", () => {
            let hasEmpty = false;

            $('#tbl-terms tbody input[type="text"]').each((index, element) => {
                $(element).removeClass('error-con');

                if ($(element).val().trim() == '') {
                    $(element).addClass('error-con');
                    hasEmpty = true;
                }
            });


            if (!hasEmpty) {
                {
                    self.props.savePaymentTerms(() => {
                        self.props.updateUserToOnboard(self.props.user.Onboarded, true);
                    });
                }
            }
        });
    }

    showConfirmDelete(id) {
        this.props.validatePermissionToPerformAction("delete-merchant-payment-terms-api", () => {
            $('#modalRemovePaymentTerm').modal('show');
            $('#btnRemovePaymentTerm').attr('data-payment-term-id', id);
        });
    }

    addPaymentTerm() {
        const self = this;
        this.props.validatePermissionToPerformAction("add-merchant-payment-terms-api", () => {
            self.props.addPaymentTerm();
        });
    }

    renderPaymentTerms(paymentTerms) {
        const self = this;

        if (paymentTerms) {
            return (
                paymentTerms.map((paymentTerm, index) => {
                    const id = paymentTerm.ID;

                    return (
                        <tr className={"item-" + id} key={id}>
                            <td width="125px">
                                <input type="text" className="form-control" value={paymentTerm.Name} onChange={(e) => self.props.updatePaymentTerm(id, 'Name', e.target.value)} />
                            </td>
                            <td>
                                <input type="text" className="form-control" value={paymentTerm.Description} onChange={(e) => self.props.updatePaymentTerm(id, 'Description', e.target.value)} />
                            </td>
                            <td className="text-center">
                                <label className="sassy-radio" htmlFor={"default-" + id}>
                                    <input id={"default-" + id} checked={paymentTerm.Default} type="radio" name="default" onChange={(e) => self.props.updatePaymentTerm(id, 'Default', e.target.checked)} /><span />
                                </label>
                            </td>
                            <td>
                                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToDelete} extraClassOnUnauthorized={''}>
                                    <a href="#" className="delete-item" data-id={""} onClick={(e) => self.showConfirmDelete(id)}>
                                        <img src="/assets/images/delete_btn.svg" alt="" />
                                    </a>
                                </PermissionTooltip>
                            </td>
                        </tr>
                    )
                })
            );
        }

        return null;
    }

    render() {
        return (
            <React.Fragment>
                <div id="Paymentterms" className="tab-pane fade">
                    <h6 className="tiny-title">Payment Terms <a href="#" onClick={(e) => e.preventDefault()}><img src="/assets/images/Info.svg" width={15} /></a></h6>
                    <div className="terms-box">
                        <div className="wrap">
                            <div className="table-responsive">
                                <table className="table" id="tbl-terms">
                                    <thead>
                                        <tr>
                                            <th width="110px">Name</th>
                                            <th>Terms and Condition</th>
                                            <th className="text-center">Default</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.renderPaymentTerms(this.props.paymentTerms)}
                                    </tbody>
                                </table>
                            </div>

                            <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                                <a className="add-link" href="#" onClick={(e) => this.addPaymentTerm()}><i className="fa fa-plus fa-fw" /> Add Payment Term</a>
                            </PermissionTooltip>
                        </div>
                    </div>
                    <div className="settings-button">
                        <div className="btn-previous pull-left" onClick={() => this.handlePrevious()}>Previous</div>
                        <div
                            className={`btn-add pull-right save-payment-terms ${this.props.pagePermissions.isAuthorizedToAdd ? '' : 'icon-grey'}`}
                            data-toggle={this.props.pagePermissions.isAuthorizedToAdd ? '' : 'tooltip'}
                            data-placment="top"
                            data-original-title="You need permission to perform this action"
                            onClick={(e) => this.handleSave()}
                        >
                            Save
                        </div>
                    </div>
                </div>
                <div id="modalRemovePaymentTerm" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false" style={{ display: 'none' }}>
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal">Cancel</div>
                                <div className="btn-green" id="btnRemovePaymentTerm" data-payment-term-id={""} onClick={(e) => this.deletePaymentTerm(e)}>Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
	}
}

module.exports = PaymentTermComponent;