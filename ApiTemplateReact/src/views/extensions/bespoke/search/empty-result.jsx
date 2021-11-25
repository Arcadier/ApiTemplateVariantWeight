'use strict';
var React = require('react');
var BaseComponent = require('../../../shared/base');

class EmptySearchResultComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            suggestedItems: []
        };
    }

    componentDidMount() {
        const self = this;
        $.ajax({
            url: "/search/items/ajax",
            type: "GET",
            data: {
                pageSize: 8,
                pageNumber: 1,
                tags: null,
                withChildItems: false,
                sort: "item_desc",
                keywords: null,
                minPrice: null,
                maxPrice: null,
                categories: null,
                customFields: null,
                customValues: null,
                sellerId: null
            },
            success: function (response) {
                if (response && response.TotalRecords > 0) {
                    self.setState({
                        suggestedItems: response.Records
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
    render() {
        const self = this;
        return (
            <div className="item-no-result-msg">
                <div className="no-result-red">Sorry!</div>
                <img src="/assets/images/no_result.svg" />
                <div className="no-result-text">
                    <span>We couldn't find anything that matches. <br />Would you like to review your search, and you can check out what others are looking at below.</span>
                </div>
                <div className="product-list">
                    <div className="tab-content">
                        <div id="item-for-sell" className="tab-pane fade in active">
                            <div className="row">
                                {Array.from(self.state.suggestedItems).map(function (item, index) {
                                    const { averageRating } = item;
                                    const stars = averageRating ? averageRating * 20 : 0;
                                    return (
                                        <div className="col-md-3 col-sm-4 col-xs-6 xs-mb-15" key={item.ID}>
                                            <a href={"/items/" + self.generateSlug(item.Name) + "/" + item.ID} className="item-box-small">
                                                <div className="item-image">
                                                    <img src={item.Media[0].MediaUrl} alt={item.Name} title={item.Name} className="img-responsive" />
                                                </div>
                                                <div className="item-detail">
                                                    <h4 className="item-name">{item.Name}</h4>
                                                    <div className="item-price">
                                                        {self.renderFormatMoney(item.CurrencyCode, item.Price)}
                                                    </div>
                                                    <div className="store-rating"><span className="stars"><span style={{ width: `${stars}%` }}></span></span></div>
                                                </div>
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div id="item-reviews" className="tab-pane fade storefront-review">
                    </div>
                </div>
                <div className="clearfix" />
            </div>
        );
    }
}

module.exports = EmptySearchResultComponent;