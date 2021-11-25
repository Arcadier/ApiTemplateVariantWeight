const React = require('react');
var BaseComponent = require('../../shared/base');

const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class TitleComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.pageSizeOptions = [10, 20, 50, 100];
    }

    render() {
        const { totalRecords, selectedPageSize, isUserMerchant } = this.props;
        return (
            <div className="sc-upper">
                <div className="sc-u title-sc-u sc-u-mid full-width m-change">
                    <span className="sc-text-big ">Invoice List  <a href="#"><img src="/assets/images/Info.svg" /></a></span>
                    {
                        isUserMerchant &&
                        <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                            <a className="top-title mobile-only createReceipt" href="#" id="createReceipt" onClick={this.props.onCreateInvoiceClicked}><i className="fas fa-plus fa-fw"></i> Create new Invoice</a>
                        </PermissionTooltip>
                    }
                    <small>{totalRecords} entries</small>
                    <div className="mobile-only">
                        <div className="sassy-r ">
                            <select name="per-page" id="per-page" className="sassy-select" defaultValue={selectedPageSize} onChange={this.props.onChangePageSize}>
                                {
                                    this.pageSizeOptions.map((size) => {
                                        return (
                                            <option key={`pageOption${size}`} value={size}>{size}</option>
                                        )
                                    })
                                }
                            </select>
                            <label htmlFor="" className="sassy-label">Items per page</label>
                        </div>
                    </div>
                </div>
                <div className="sc-tops desktop-only">
                    {
                        isUserMerchant &&
                        <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                            <a className="top-title createReceipt" href="#" id="createReceipt" onClick={this.props.onCreateInvoiceClicked}><i className="fas fa-plus fa-fw"></i> Create new Invoice</a>
                        </PermissionTooltip>
                    }
                </div>
            </div>
        )
    }
}; 

module.exports = TitleComponent;