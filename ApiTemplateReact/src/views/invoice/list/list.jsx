const React = require('react');
var BaseComponent = require('../../shared/base');

const ListItemComponent = require('./list-item');

if (typeof window !== 'undefined') { var $ = window.$; }

class ListComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }
    renderEmpty() {
        if (this.props.invoiceList && this.props.invoiceList.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/list-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">Nothing to see here.</div>
                    <div className="empty-page-message">Invoice that have been created will appear here</div>
                </div>
            )
        }
    }
    render() {
        const { invoiceList = { Records: []}, isUserMerchant = false } = this.props;
        return (
            <div className="subaccount-data-table table-responsive">
                <table className="table order-data1 sub-account tbl-department">
                    <thead>
                        <tr>
                            <th>Invoice No. </th>
                            <th>External Invoice No</th>
                            <th>Date Created</th>
                            <th>Payment Due</th>
                            <th>PO No.</th>
                            <th>{isUserMerchant ? 'Buyer' : 'Supplier'}</th>
                            <th>Amount to be collected</th>
                            <th>Payment method</th>
                            <th>Payment Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            invoiceList.map((inv, index) => {
                                return (
                                    <ListItemComponent key={`invoice-${index}`}
                                        invoice={inv}
                                        isUserMerchant={isUserMerchant}
                                        statuses={this.props.statuses}
                                        updateInvoiceStatus={this.props.updateInvoiceStatus}
                                        pagePermissions={this.props.pagePermissions}
                                    />
                                )
                            })
                        }                        
                    </tbody>
                </table>
                {this.renderEmpty()}
            </div>
        )
    }
}

module.exports = ListComponent;