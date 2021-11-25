'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayout = require('../layouts/header').HeaderLayoutComponent;
const FooterLayout = require('../layouts/footer').FooterLayoutComponent;
const MerchantInfo = require('./merchant-info');
const ItemList = require('./item-list');
const Pagination = require('../common/pagination');
const StoreFrontAnalytics = require('./storefront-google-analytics');

const storeFrontActions = require('../../redux/storefrontActions');
const activityLogActions = require('../../redux/ActivityLogAction');

class StoreFrontPageComponent extends React.Component {
    constructor(props) {
        super(props);
        this.goToPage = this.goToPage.bind(this);

    }

    componentDidMount() {
    }

    goToPage(pageNo, filters) {
        const sellerid = this.props.merchantUser.ID;
        window.location = "/storefront/" + sellerid + "?pageNo=" + pageNo + "&&keyword=" + filters.keyword;
    }

    render() {
        const filters = {
            keyword: this.props.keyword
        }
        
        return (
            <React.Fragment>
                <StoreFrontAnalytics
                    analyticsApiAccess={this.props.analyticsApiAccess}
                    baseUrl={process.env.BASE_URL}
                    merchantUser={this.props.merchantUser}
                    onAddPageAnaylytics={this.props.onAddPageAnaylytics}                    
                    onHasPageAnaylytics={this.props.onHasPageAnaylytics}
                />
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                </div>
                <div className="main">
                    <div className="store-container" id="store-container">
                        <div className="container">
                            <br />
                            <MerchantInfo merchantTotalVisits={this.props.merchantTotalVisits} customFieldDefinitions={this.props.customFieldDefinitions} allMerchantFeedback={this.props.allMerchantFeedback} merchantFeedback={this.props.merchantFeedback} merchantUser={this.props.merchantUser} sellerCountry={this.props.sellerCountry} ReviewAndRating={this.props.ReviewAndRating} />
                            <ItemList allMerchantFeedback={this.props.allMerchantFeedback} searchMerchantFeedback={this.props.searchMerchantFeedback} merchantFeedback={this.props.merchantFeedback} itemDetails={this.props.items} keyword={this.props.keyword} searchStoreFront={this.props.searchStoreFront} updateKeyWord={this.props.updateKeyWord} merchantID={this.props.merchantUser.ID} ReviewAndRating={this.props.ReviewAndRating} userPreferredLocationId={this.props.userPreferredLocationId}/>
                            <Pagination totalRecords={this.props.items.TotalRecords} pageNumber={this.props.items.PageNumber} pageSize={this.props.items.PageSize} goToPage={this.goToPage} filters={filters} />
                        </div>
                    </div>
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
        items: state.itemsReducer.items,
        keyword: state.itemsReducer.keyword,
        merchantUser: state.merchantReducer.user,
        user: state.userReducer.user,
        userPreferredLocationId: state.userReducer.userPreferredLocationId,
        sellerCountry: state.merchantReducer.sellerCountry,
        merchantFeedback: state.merchantReducer.merchantFeedback,
        allMerchantFeedback: state.merchantReducer.allMerchantFeedback,
        ReviewAndRating: state.merchantReducer.ReviewAndRating,
        customFieldDefinitions: state.itemsReducer.customFieldDefinitions,
        merchantTotalVisits: state.itemsReducer.merchantTotalVisits,
        analyticsApiAccess: state.merchantReducer.analyticsApiAccess,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateKeyWord: (e) => dispatch(storeFrontActions.updateKeyWord(e.target.value)),
        searchStoreFront: (keyword, merchantID, pageNo) => dispatch(storeFrontActions.searchStoreFront(keyword, merchantID, pageNo)),
        searchMerchantFeedback: (options) => dispatch(storeFrontActions.getMerchantFeedback(options)),
        onAddPageAnaylytics: (data) => dispatch(activityLogActions.addPageAnaylytics(data)),
        onHasPageAnaylytics: (options, callback) => dispatch(activityLogActions.hasPageAnaylytics(options, callback))
    };
}

const StoreFrontPage = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(StoreFrontPageComponent);

module.exports = {
    StoreFrontPage,
    StoreFrontPageComponent
};
