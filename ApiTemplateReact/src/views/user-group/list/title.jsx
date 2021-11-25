const React = require('react');
const BaseComponent = require('../../shared/base');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class TitleComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.permissionPageType = props.isMerchantAccess ? 'merchant' : 'consumer';
        this.extraPath = props.isMerchantAccess ? '/merchants' : '';
    }

    handlePageSizeChange(e) {
        this.props.searchUserGroups({ pageSize: parseInt(e.target.value) });
    }

    onAddGroupBtnClick() {
        const self = this;
        if (!this.props.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction(`add-${this.permissionPageType}-user-groups-api`, () => window.location.href = `${self.extraPath}/user-groups/create`);
    }
    
    render() {
        const totalRecords = (this.props.userGroups && this.props.userGroups.TotalRecords) || 0;
        const pageSize = `${(this.props.userGroups && this.props.userGroups.PageSize) || "20"}`;
        const { isAuthorizedToAdd } = this.props;
        return (
            <div className="sc-upper">
                <div className="sc-u title-sc-u sc-u-mid full-width m-change"> 
                    <span className="sc-text-big ">
                        User Groups
                        &nbsp;
                        <a href="https://arcadier.zendesk.com/knowledge/articles/4402442606361/en-us?brand_id=114094406594" target="_blank">
                            <img src="/assets/images/Info.svg" />
                        </a>
                    </span>
                    <PermissionTooltip isAuthorized={isAuthorizedToAdd} extraClassOnUnauthorized={"icon-grey"}>
                        <a className="top-title mobile-only createReceipt" onClick={() => this.onAddGroupBtnClick()} href="#" id="createReceipt">
                            <i className="fas fa-plus fa-fw"></i>
                            Add new user groups
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
                        <a className="top-title createReceipt" onClick={() => this.onAddGroupBtnClick()} href="#"  id="createReceipt">
                            <i className="fas fa-plus fa-fw"></i> Add new user groups
                        </a> 
                    </PermissionTooltip>
                </div>
            </div>
        )
    }
}; 

module.exports = TitleComponent;