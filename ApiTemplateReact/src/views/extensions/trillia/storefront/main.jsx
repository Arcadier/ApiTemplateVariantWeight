'use strict';
var React = require('react');

var MerchantInfo = require('./merchant-info');
var ItemList = require('./item-list');
var Pagination = require('../../../../views/common/pagination');
var ReactRedux = require('react-redux');

class StoreFrontMainComponent extends React.Component {
    constructor(props) {
        super(props);
        this.goToPage = this.goToPage.bind(this);
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
                <MerchantInfo merchantUser={this.props.merchantUser} sellerCountry={this.props.sellerCountry} />
                <ItemList itemDetails={this.props.items} keyword={this.props.keyword} searchStoreFront={this.props.searchStoreFront} updateKeyWord={this.props.updateKeyWord} merchantID={this.props.merchantUser.ID} />
                <Pagination totalRecords={this.props.items.TotalRecords} pageNumber={this.props.items.PageNumber} pageSize={this.props.items.PageSize} goToPage={this.goToPage} filters={filters} />
            </React.Fragment>
        );
    }
}

module.exports = StoreFrontMainComponent