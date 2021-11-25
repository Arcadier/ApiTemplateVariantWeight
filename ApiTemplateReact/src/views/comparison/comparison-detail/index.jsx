'use strict';
var React = require('react');
var FooterLayout = require('../../layouts/footer').FooterLayoutComponent;
var ReactRedux = require('react-redux');
var HeaderLayout = require('../../layouts/header').HeaderLayoutComponent;
var Breadcrumb = require('../comparison-detail/breadcrumb');
var ComparisonDetailTable = require('../comparison-detail/detail');
var ComparisonList = require('../comparison-detail/list');
var ComparisonModal = require('../comparison-detail/modal');
var ComparisonActions = require('../../../redux/comparisonActions');
var BaseComponent = require('../../../views/shared/base');

class ComparisonDetailComponent extends BaseComponent {
    getComparisonDetailCount() {
        let detailCount = 0;
        if (this.props.comparison) {
            detailCount = this.props.comparison.ComparisonDetails.length;
        }
        
        return detailCount;
    }

    componentDidMount() {
    }

    render() {
        
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main" style={{ "paddingTop": "120px" }}>
                    <div className="cart-container">
                        <div className="container">
                            <Breadcrumb />
                            <div className="row mt-25">
                                <div className="col-sm-2 col-xs-4 max-w" />
                                <div className="col-sm-10">
                                    <ComparisonList comparisonDetailCount={this.getComparisonDetailCount()}
                                        comparisonList={this.props.comparisonList}
                                        getComparison={this.props.getComparison}
                                        selectedComparisonId={this.props.comparison.ID}
                                        setComparisonToUpdate={this.props.setComparisonToUpdate}
                                        exportToPDF={this.props.exportToPDF}
                                        permissions={this.props.permissions}
                                    />
                                </div>
                            </div>
                            <div className="clearfix" />
                            <div className="row no-pad" style={{ display: this.props.comparison && this.props.comparison.ComparisonDetails && this.props.comparison.ComparisonDetails.length > 0 ? "block" : "none" }}>
                                <ComparisonDetailTable formatMoney={this.renderFormatMoney}
                                    comparison={this.props.comparison}
                                    setComparisonDetailToUpdate={this.props.setComparisonDetailToUpdate}
                                    createPurchaseDetail={this.props.createPurchaseDetail}
                                    comparableCustomFields={this.props.comparableCustomFields}
                                    permissions={this.props.permissions}
                                />
                            </div>
                            <div className="row" style={{ display: this.props.comparison && this.props.comparison.ComparisonDetails && this.props.comparison.ComparisonDetails.length > 0 ? "none" : "block" }}>
                                <div className="empty-page-sec">
                                    <img src="/assets/images/emptypage/compare-list.svg" alt="empty page img" />
                                    <div className="empty-page-title">Nothing to see here.</div>
                                    <div className="empty-page-message">You have no items to compare at the moment</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ComparisonModal deleteComparisonDetail={this.props.deleteComparisonDetail}
                        clearAllComparisonDetails={this.props.clearAllComparisonDetails}/>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}
function mapStateToProps(state, ownProps) {
    return {
        comparisonList: state.comparisonReducer.comparisonList,
        comparison: state.comparisonReducer.comparison,
        comparisonToUpdate: state.comparisonReducer.comparisonToUpdate,
        comparisonDetailToUpdate: state.comparisonReducer.comparisonDetailToUpdate,
        invoiceNumber: state.comparisonReducer.invoiceNumber,
        redirectToDelivery: state.comparisonReducer.redirectToDelivery,
        comparableCustomFields: state.comparisonReducer.comparableCustomFields,
        user: state.userReducer.user,
        permissions: state.userReducer.permissions
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getComparison: (id, includes) => dispatch(ComparisonActions.getComparison(id, includes)),
        setComparisonToUpdate: (id) => dispatch(ComparisonActions.setComparisonToUpdate(id)),
        setComparisonDetailToUpdate: (id) => dispatch(ComparisonActions.setComparisonDetailToUpdate(id)),
        deleteComparisonDetail: () => dispatch(ComparisonActions.deleteComparisonDetail()),
        clearAllComparisonDetails: () => dispatch(ComparisonActions.clearAllComparisonDetails()),
        createPurchaseDetail: (cartItemIds, comparisonDetailId) => dispatch(ComparisonActions.createPurchaseDetail(cartItemIds, comparisonDetailId)),
        exportToPDF: (comparisonId, emailAddress) => dispatch(ComparisonActions.exportToPDF(comparisonId, emailAddress)),
    }
}

const ComparisonDetail = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ComparisonDetailComponent)

module.exports = {
    ComparisonDetail,
    ComparisonDetailComponent
}