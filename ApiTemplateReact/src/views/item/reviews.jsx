'use strict';
const React = require('React');
const BaseComponent = require('../../views/shared/base');
const toastr = require('toastr');

if (typeof window !== 'undefined') {
    const $ = window.$;
}

class ReviewsComponent extends BaseComponent {
	componentDidMount() {
		$('#toggle-rating').on('click',
            function() {
                var $this = $(this);

                $(".rating-summary").slideToggle();

                if ($this.hasClass('active'))
                    $this.removeClass('active');
                else
                    $this.addClass('active');
            }
        );
	}

	renderAverageRating() {
		const { feedback } = this.props;
		let average, positiveFeedbackPercentage = 0;
		if (feedback !== null && feedback !== undefined) {
			const {  Average, PositiveFeedbackPercentage } = feedback;
 			average = Average.toFixed(1);
 			positiveFeedbackPercentage = PositiveFeedbackPercentage;
		}
		return (
			<React.Fragment>
				<div className="review-item-star">
					<span className="stars">
						<span style={{ width: `${average * 20}%` }} />
					</span>
				</div>
            	<div className="review-voted-percent">
            		&nbsp;<b>{average}</b>({`${positiveFeedbackPercentage}`}% Positive Feedback)
            	</div>
	        </React.Fragment>
		)
	}

	getUserMedia(user) {
		if (user.Media && user.Media.length > 0) return user.Media[user.Media.length - 1].MediaUrl;
		return '';
	}

	renderReplies(replies) {
		const self = this;
		return (
			<React.Fragment>
				<ul>
					{
						replies.map(reply => {
							return (
								< li >
									<div className="reply-divider"></div>
									<div className="review-box">
										<div className="reply-from">Reply from:</div>
										<div className="user-avtar"> <a href="#"><img src={this.getUserMedia(reply.User)} alt="" /></a> </div>
										<div className="review-detail">
											<div className="review-head">
												<h6><b>{self.props.useDisplayName ?  reply.User.DisplayName : `${reply.User.FirstName} ${reply.User.LastName}`}</b></h6>
												<p>{this.formatDateTime(reply.CreatedDateTime, 'DD/MM/YYYY, hh:mm')}</p>
											</div>
											<div className="review-body">{reply.Message}</div>
										</div>
									</div>
								</li>
							)

						})
					}
				</ul>

			</React.Fragment>
		);

	}

	showReplyModal(feedbackId) {
		const self = this;

		let shouldProceed = true;
		if (this.props.user && this.props.feedback) {
			this.props.feedback.ItemReviews.forEach(function (review) {
				if (review.Replies && review.FeedbackID === feedbackId) {
					review.Replies.forEach(function (reply) {
						if (reply.User.ID === self.props.user.ID) {
							shouldProceed = false;
						}
					});
				}

			});
		}
		if (shouldProceed) {
			self.props.selectedFeedBack(feedbackId);
			$('#replyModal').modal('show');
		}
		else {
			$('#replyModal').modal('hide');
			toastr.error("Already Replied in this Review.")
		}
	}

	renderReviewList() {
		const { feedback, user, itemDetails } = this.props;
		if (!feedback && feedback === undefined) return;
		const { ItemReviews } = feedback;
		return (
			<ul> 
				{
					ItemReviews.map((review, index) => 
						<li key={index}>
			            	<div className="review-box">
				                <div className="user-avtar"> <a href="#"><img src={this.getUserMedia(review.User)} alt=""/></a> </div>
				                <div className="review-detail">
				                  <div className="review-head">
				                    <h6><b>{this.props.useDisplayName ?  review.User.DisplayName : `${review.User.FirstName} ${review.User.LastName}`}</b></h6>
				                    <div className="item-rating text-right pull-right">
				                    	<span className="stars">
				                    		<span style={{ width: `${review.ItemRating * 20}%` }} />
				                    	</span>
				                    </div>
				                    <p>{this.formatDateTime(review.CreatedDateTime, 'DD/MM/YYYY, hh:mm')}</p>
				                  </div>
									<div className="review-body">{review.Message}</div>
									{
										user && itemDetails.MerchantDetail && user.ID === itemDetails.MerchantDetail.ID ?
											<a href="#" onClick={(e) => this.showReplyModal(review.FeedbackID)} data-toggle="modal" data-target="#replyModal" className="review-reply">Reply</a>
											: ""
									}
				                </div>
				            </div>
				            {
				            	review.Replies && review.Replies.length > 0 ? 
					            	this.renderReplies(review.Replies)
					            : null
				            }

			            </li>
					)
				}
			</ul>
		);
	}

	renderSummaryTable() {
		let summary = [];
		const { feedback } = this.props;
		if (feedback !== null && feedback !== undefined) summary = feedback.RatingSummary;
		const arr = [...Array(5).keys()].map(i => i+1).reverse();
		const getValue = key => {
			if (summary.length == 0) return 0;
			let rating = summary.find(r => r.Star == key);
			if (rating) return rating.Count;
		}
		const summaryEval = ['Unsatisfied.', 'Okay.', 'Good.', 'Great!', 'Excellent!'];
		const getClassName = key => getValue(key) > 0 ? 'text-black' : '';
		return (
			<tbody>
				{arr.map(val => 
					<tr className={getClassName(val)} key={val}>
						<td style={{ width: '145px'}}><span className="stars"><span style={{ width: val*20}}></span></span></td>
						<td>{summaryEval[val-1]}</td>
						<td>{getValue(val)}</td>    
					</tr>
				)}
			</tbody>
		);
	}

    renderReview() {
        let self = this;
        return (
            <div className="item-review-section">
                <div className="item-detail-left-inner">
                    <h3 className="review-title">Reviews</h3>
                    <div className="item-review-wrap">
                        <div className="item-review-l">
                            {this.renderAverageRating()}
                        </div>
                        <div className="item-review-r">
                            <a href={null} id="toggle-rating" className="active">
                                <i className="fa fa-angle-down" />
                            </a>
                        </div>
                        <div className="clearfix" />
                    </div>
                    <div className="rating-summary" style={{ display: 'none' }}>
                        <h6>Rating Summary</h6>
                        <table className="w-100">
                            {this.renderSummaryTable()}
                        </table>
                    </div>
                    <div className="list-review">
                        {this.renderReviewList()}
                    </div>
                </div>
            </div>
        );
	}

	render() {
			 return (this.props.ReviewAndRating === true ? this.renderReview() : '');
	}
}

module.exports = ReviewsComponent;