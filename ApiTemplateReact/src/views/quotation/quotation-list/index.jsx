'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const Moment = require('moment');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const FilterComponent = require('../quotation-list/filters');
const ListComponent = require('../quotation-list/list');
const PaginationComponent = require('../../common/pagination');
const QuotationActions = require('../../../redux/quotationActions');
const StatusFilters = ['Active', 'Pending'];

if (typeof window !== 'undefined') { var $ = window.$; }

class QuotationListComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const self = this;
        const { categories, user, quotationList } = self.props;
        const totalRecords = quotationList.TotalRecords;
        const pageNumber = quotationList.PageNumber;
        const pageSize = quotationList.PageSize;
        const isMerchant = user.Roles.includes('Merchant') || user.Roles.includes('Submerchant');

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={categories} user={user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={user} />
                </aside>
                <div className="main-content">
                    <div className="main less_content" style={{ paddingTop: '44px' }}>
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid left">
                                        <span className="sc-text-big ">Quotation List</span> <small>{totalRecords} entries</small>
                                    </div>
                                </div>
                                <div className="sassy-filter sm-filter">
                                    <FilterComponent
                                        filterQuotations={self.props.filterQuotations}
                                    />
                                </div>
                                <ListComponent
                                    quotations={quotationList.Records}
                                    isMerchant={isMerchant} 
                                    isMerchantAccess={this.props.isMerchantAccess}
                                />
                                <PaginationComponent
                                    totalRecords={totalRecords}
                                    pageNumber={pageNumber}
                                    pageSize={pageSize}
                                    goToPage={self.props.goToPage} />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        quotationList: state.quotationReducer.quotationList,
        filters: state.quotationReducer.filters, 
        isMerchantAccess: state.quotationReducer.isMerchantAccess
    };
}

function mapDispatchToProps(dispatch) {
    return {
        filterQuotations: (filters) => dispatch(QuotationActions.filterQuotations(filters)),
        goToPage: (pageNumber) => dispatch(QuotationActions.goToPage(pageNumber))
    };
}

const QuotationListHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(QuotationListComponent);

module.exports = {
    QuotationListHome,
    QuotationListComponent
};