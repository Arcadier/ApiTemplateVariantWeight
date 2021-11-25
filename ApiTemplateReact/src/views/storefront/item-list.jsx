'use strict';
const React = require('react');
const BaseComponent = require('../shared/base');

class ItemList extends BaseComponent {
    componentDidMount() {
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            $('.pagination').hide()

            if ($(e.target).attr('href') != '#item-reviews') {
                $('.pagination').show()
            }
        });
    }

    renderRating(AverageRating) {
        const self = this;
        return (
            <div className="item-rating ">
                <span className="stars"><span style={{ width: `${AverageRating * 20 || 0}%` }} /></span>
                <span className="feedback-text hide">({`${AverageRating * 20 || 0}%`} positive feedback)</span>
            </div>
        );
    }

    renderItemList() {
        const self = this;

        return (
            this.props.itemDetails.Records.map(function (itemDetail) {
                let detailLink = "/items/" + self.generateSlug(itemDetail.Name) + '/' + itemDetail.ID;
                const { AverageRating } = itemDetail;

                function renderFormatWrapper() {
                    const locationPrice = (self.props.userPreferredLocationId && itemDetail && itemDetail.ChildItems && itemDetail.ChildItems[0]) ? itemDetail.ChildItems[0].Price || 0 : 0;
                    const price = process.env.PRICING_TYPE == 'country_level' ? locationPrice : itemDetail.Price;
                    return self.renderFormatMoney(itemDetail.CurrencyCode, price);
                }

                return (
                    <div key={itemDetail.ID} className="col-md-3 col-sm-4 col-xs-6 xs-mb-15">
                        <a href={detailLink} className="item-box-small">
                            <div className="item-image">
                                <img src={itemDetail.Media ? itemDetail.Media[0].MediaUrl : ""} alt={itemDetail.Name} title={itemDetail.Name} className="img-responsive" />
                            </div>
                            <div className="item-detail">
                                <h4 className="item-name">{itemDetail.Name}</h4>
                                <div className="item-price">
                                    {renderFormatWrapper()}
                                </div>
                                {self.props.ReviewAndRating === true ? self.renderRating(AverageRating):''}
                            </div>
                        </a>
                    </div>
                );
            })
        );
    }

    searchOrUpdateKeyword(e) {
        let self = this;
        if (e.key === 'Enter') {
            self.props.searchStoreFront(self.props.keyword, self.props.merchantID, self.props.itemDetails.PageNumber);
            self.props.searchMerchantFeedback({
                keyword: self.props.keyword,
                merchantID: self.props.merchantID,
                pageNo: 0,
                pageSize: 15
            })
        }
        else {
            self.props.updateKeyWord(e);
        }
    }

    renderReviews() {
        
        var self = this;

        if (!self.props.merchantFeedback || typeof self.props.merchantFeedback == 'undefined')
            return ''

        return (
            <React.Fragment>
                <div>
                    <div>
                        {
                            self.props.merchantFeedback.Records.map(function (feedback) {
                                return (
                                    <div className="cart-item-row" data-id={1} key={feedback.FeedbackID}>
                                        <div className="cart-item-box-left">
                                            <div className="cart-item-img"> <img src={feedback.Item.Media? feedback.Item.Media[0].MediaUrl:''}/> </div>
                                        </div>
                                        <div className="cart-item-box-desc">
                                            <div>
                                                <div className="col-md-7 col-xs-6">
                                                    <h3><a href="#">{feedback.Item.Name}</a></h3>
                                                </div>
                                                <div className="col-md-5 col-xs-6">
                                                    <div className="storefront-date">{self.formatDateTime(feedback.CreatedDateTime)}</div>
                                                </div>
                                                <div className="clearfix"/>
                                            </div>
                                            <div className="storefront-desc">
                                                <div className="cart-top-sec-left"><img src={feedback.User.Media[0].MediaUrl} align="absmiddle" width={40}/><span className="cart-publish-merchant">{feedback.User.FirstName} {feedback.User.LastName}</span></div>
                                                <div className="cart-top-sec-left">
                                                    <div className="store-rating">
                                                        <span className="stars"><span style={{ width: `${feedback.AverageRating * 20 || 0}%` }}/></span>
                                                    </div>
                                                </div>
                                                <div className="clearfix"/>
                                            </div>
                                            <div className="cart-item-desc">{feedback.Message}</div>
                                            {self.renderReviewReplies(feedback.Replies)}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </React.Fragment>
        )
    }

    getMerchantFeedBackTotalRecords() {

        var self = this;

        if (!self.props.merchantFeedback || typeof self.props.merchantFeedback == 'undefined')
            return 0;

        return self.props.merchantFeedback.TotalRecords;
    }

    doSearch() {
        
        var self = this;
        self.props.searchStoreFront(self.props.keyword, self.props.merchantID, self.props.itemDetails.PageNumber)
        self.props.searchMerchantFeedback({
            keyword: self.props.keyword,
            merchantID: self.props.merchantID,
            pageNo: 1,
            pageSize: 15
        })
    }

    renderReviewColumn() {
        var self = this;
        return <li><a data-toggle="tab" onClick={() => self.tabOnClick("review")} href="#item-reviews">Item Reviews <span>({self.getMerchantFeedBackTotalRecords()})</span></a></li>

    }

    renderReviewReplies(replies) {
        const self = this;
        let elements = [];
        
        if (replies != null && replies.length > 0) {
            elements.push(<div className="reply-divider"></div>);

            replies.map((reply) => {
                elements.push(
                    <div className="review-box">
                        <div className="reply-from">Reply from:</div>
                        <div className="user-avtar"> <a href="#"><img src={reply.User.Media[0].MediaUrl} width={40} /></a> </div>
                        <div className="review-detail">
                            <div className="review-head">
                                <h6><b>{reply.User.FirstName} {reply.User.LastName}</b></h6>
                                <p>{self.formatDateTime(reply.CreatedDateTime)}</p>
                            </div>
                            <div className="review-body">{reply.Message}</div>
                        </div>
                    </div>
                )
            });

            return elements;
        }

        return null;
    }
    renderEmpty() {
        if (this.props.itemDetails && this.props.itemDetails.Records && this.props.itemDetails.Records.length === 0) {
            return (
                <React.Fragment>
                    <div className="empty-page-sec itemList">
                        <img src="/assets/images/emptypage/bag-icon.svg" alt="empty page img" />
                        <div className="empty-page-title">Nothing to see here.</div>
                        <div className="empty-page-message">It seems like our merchant have not listed an item</div>
                    </div>
                    <div className="empty-page-sec reviewList hide">
                        <img src="/assets/images/emptypage/item-icon.svg" alt="empty page img" />
                        <div className="empty-page-title">Nothing to see here.</div>
                        <div className="empty-page-message">Be the first customer to leave a review</div>
                    </div>
                </React.Fragment>

            )
        }
    }
    tabOnClick(type) {
        if (type === "review" && this.props.merchantFeedback && this.props.merchantFeedback.Records && this.props.merchantFeedback.Records.length === 0) {
            $(".reviewList").removeClass("hide");
            $(".itemList").addClass("hide");
        } else {
            if (this.props.itemDetails && this.props.itemDetails.Records && this.props.itemDetails.Records.length === 0) {
                $(".reviewList").addClass("hide");
                $(".itemList").removeClass("hide");
            }

        }
    }
    render() {
        let self = this;
        return (
            <React.Fragment>
                <div className="sc-upper">
                    <div className="sc-u sc-u-mid full-width bord-botm">
                        <div className="pull-left">
                            <ul className="item-link">
                                <li className="active"><a data-toggle="tab" onClick={() => self.tabOnClick("sell")} href="#item-for-sell">Items For Sale<span className="avail-item">({self.props.itemDetails.TotalRecords})</span></a></li>
                                {self.props.ReviewAndRating === true ? self.renderReviewColumn() : ''}
                            </ul>
                        </div>
                        <div className="pull-right">
                            <div className="order-search-input border-rad-null pull-right">
                                <input type="text" name="" onKeyUp={(e) => self.searchOrUpdateKeyword(e)} defaultValue={self.props.keyword} />
                                <i className="fa fa-search" onClick={(e) => self.doSearch(e)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="product-list">
                    <div className="tab-content">
                        <div id="item-for-sell" className="tab-pane fade in active">
                            <div className="row">
                                {this.renderItemList()}
                            </div>
                        </div>
                        <div id="item-reviews" className="tab-pane fade storefront-review">
                            {self.props.ReviewAndRating === true ? self.renderReviews():''}
                        </div>
                        {this.renderEmpty()}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = ItemList;