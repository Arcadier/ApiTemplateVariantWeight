'use strict';
const React = require('react');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class TitleComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    handlePageSizeChange(e) {
        const { PageSize, PageNumber, TotalRecords, } = this.props.permissionProfiles;
        const newPageSize = parseInt(e.target.value);
        const options = {
            pageSize: newPageSize
        }

        if (newPageSize > PageSize) {
            const maxPageNumber = Math.ceil(TotalRecords / newPageSize);
            if (PageNumber > maxPageNumber) {
                options.pageNumber = maxPageNumber
            }  
        }

        this.props.searchPermissionProfiles(options);
    }

    onAddProfileBtnClick() {
        if (!this.props.isAuthorizedToAdd) return;
        const code = `add-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-account-permissions-api`;
        const extraPath = this.props.isMerchantAccess ? '/merchants' : '';
        this.props.validatePermissionToPerformAction(code, () => window.location.href = `${extraPath}/account-permissions/create`);
    }

    render() {
        const totalRecords = (this.props.permissionProfiles && this.props.permissionProfiles.TotalRecords) || 0;
        const pageSize = `${(this.props.permissionProfiles && this.props.permissionProfiles.PageSize) || "20"}`;
        const { isAuthorizedToAdd } = this.props;

        return (
            <div className="sc-upper">
                <div className="sc-u title-sc-u sc-u-mid full-width m-change"> 
                    <span className="sc-text-big ">
                        Account Permissions &nbsp;
                        <a href="https://arcadier.zendesk.com/knowledge/articles/4402476593305/en-us?brand_id=114094406594" target="_blank">
                            <img src="/assets/images/Info.svg" />
                        </a>
                    </span>
                    <PermissionTooltip isAuthorized={isAuthorizedToAdd} extraClassOnUnauthorized={"icon-grey"}>
                        <a className="top-title mobile-only createReceipt" href="#" onClick={() => this.onAddProfileBtnClick()} id="createReceipt">
                            <i className="fas fa-plus fa-fw"></i>
                            Add new profile
                        </a>
                    </PermissionTooltip>
                    <small>{totalRecords} entries</small> 
                    <div className="mobile-only">
                        <div className="sassy-r"> 
                            <span className="select-sassy-wrapper sassy-arrow">                                        
                                <select 
                                    name="per-page"
                                    id="per-page"
                                    className="sassy-select"
                                    value={pageSize}
                                    onChange={(e) => this.handlePageSizeChange(e)}
                                >                                            
                                    <option value="10">10</option>                                            
                                    <option value="20">20</option>                                            
                                    <option value="50">50</option>                                            
                                    <option value="100">100</option>                                  
                                </select>                                    
                            </span>
                            <label htmlFor="" className="sassy-label">Items per page</label>
                        </div>
                    </div>
                </div>
                <div className="sc-tops desktop-only">
                    <PermissionTooltip isAuthorized={isAuthorizedToAdd} extraClassOnUnauthorized={"icon-grey"}>
                        <a className="top-title createReceipt" onClick={() => this.onAddProfileBtnClick()} href="#" id="createReceipt">
                            <i className="fas fa-plus fa-fw"></i> Add new profile
                        </a>
                    </PermissionTooltip>
                </div>
            </div>
        )
    }
}; 

module.exports = TitleComponent;