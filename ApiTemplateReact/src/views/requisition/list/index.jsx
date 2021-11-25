'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const FilterComponent = require('../list/filters');
const ListComponent = require('../list/list');
const PaginationComponent = require('../../common/pagination');
const RequisitionActions = require('../../../redux/requisitionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class RequisitionListComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.goToPage = this.goToPage.bind(this);
    }

    componentDidMount() {
        const self = this;        
    }

    goToPage(pageNumber) {
        let filters = this.props.filters;
        filters.PageNumber = pageNumber;
        this.props.filterRequisitions(filters);
    }

    render() {
        const self = this;
        const { requisitionList, categories, user, statuses, filterRequisitions, setStatusFilter, filters, suppliers, setSupplierFilter } = self.props;
        const { TotalRecords } = requisitionList;
        const { PageNumber, PageSize } = filters;

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={categories} user={user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid full-width">
                                        <span className="sc-text-big ">Requisition Order</span> <small style={{fontWeight: '700'}}>{TotalRecords} entries</small>
                                    </div>
                                </div>
                                <FilterComponent
                                    statuses={statuses}
                                    suppliers={suppliers}
                                    filters={filters}
                                    filterRequisitions={filterRequisitions}
                                    setStatusFilter={setStatusFilter}
                                    setSupplierFilter={setSupplierFilter}
                                />
                                <ListComponent
                                    requisitions={requisitionList.Records}
                                />
                                <PaginationComponent
                                    totalRecords={TotalRecords}
                                    pageNumber={PageNumber}
                                    pageSize={PageSize}
                                    goToPage={self.goToPage} />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
};

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        requisitionList: state.requisitionReducer.requisitionList, 
        categories: state.requisitionReducer.categories, 
        statuses: state.requisitionReducer.statuses, 
        filters: state.requisitionReducer.filters, 
        suppliers: state.requisitionReducer.suppliers
    };
}

function mapDispatchToProps(dispatch) {
    return {
        filterRequisitions: (filters) => dispatch(RequisitionActions.filterRequisitions(filters)), 
        setStatusFilter: (id) => dispatch(RequisitionActions.setStatusFilter(id)),
        setSupplierFilter: (id) => dispatch(RequisitionActions.setSupplierFilter(id))
    };
};

const RequisitionListHome = ReactRedux.connect(
    mapStateToProps, 
    mapDispatchToProps
)(RequisitionListComponent);

module.exports = {
    RequisitionListHome,
    RequisitionListComponent
};