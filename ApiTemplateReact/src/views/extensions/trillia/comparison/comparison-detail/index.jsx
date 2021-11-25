'use strict';
var React = require('react');
var FooterLayout = require('../../../../layouts/footer').FooterLayoutComponent;
var ReactRedux = require('react-redux');
var HeaderLayout = require('../../../../layouts/header').HeaderLayoutComponent;
var Breadcrumb = require('../comparison-detail/breadcrumb');
var ComparisonDetailTable = require('../comparison-detail/detail');
var ComparisonList = require('../comparison-detail/list');
var ComparisonModal = require('../comparison-detail/modal');
var ComparisonActions = require('../../../../../redux/comparisonActions');
var BaseComponent = require('../../../../../views/shared/base');

class ComparisonDetailComponent extends BaseComponent {
    getComparisonDetailCount() {
        let detailCount = 0;
        if (this.props.comparison) {
            detailCount = this.props.comparison.ComparisonDetails.length;
        }
        
        return detailCount;
    }

    render() {
        return (
            <React.Fragment>
                <div className="header" id="header-section">
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
                                    />
                                </div>
                            </div>
                            <div className="clearfix" />
                            <div className="row no-pad">
                                <ComparisonDetailTable formatMoney={this.renderFormatMoney}
                                    comparison={this.props.comparison}
                                    setComparisonDetailToUpdate={this.props.setComparisonDetailToUpdate}
                                    createPurchaseDetail={this.props.createPurchaseDetail}
                                    comparableCustomFields={this.props.comparableCustomFields}
                                />
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
        user: state.userReducer.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getComparison: (id, includes) => dispatch(ComparisonActions.getComparison(id, includes)),
        setComparisonToUpdate: (id) => dispatch(ComparisonActions.setComparisonToUpdate(id)),
        setComparisonDetailToUpdate: (id) => dispatch(ComparisonActions.setComparisonDetailToUpdate(id)),
        deleteComparisonDetail: () => dispatch(ComparisonActions.deleteComparisonDetail()),
        clearAllComparisonDetails: () => dispatch(ComparisonActions.clearAllComparisonDetails()),
        createPurchaseDetail: (cartItemIds, comparisonDetailId) => dispatch(ComparisonActions.createPurchaseDetail(cartItemIds, comparisonDetailId))
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