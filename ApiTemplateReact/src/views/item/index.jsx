'use strict';
var React = require('react');
var ReactRedux = require('react-redux');

var HeaderLayoutComponent = require('../../views/layouts/header').HeaderLayoutComponent;
var FooterLayout = require('../../views/layouts/footer').FooterLayoutComponent;
var BaseComponent = require('../../views/shared/base');

var { ItemDetailMainComponent, mapStateToProps, mapDispatchToProps } = require('../features/pricing_type/' + process.env.PRICING_TYPE + '/item-details/index');

class ItemDetailComponent extends BaseComponent {
    getUserMedia(user) {
        if (user.Media && user.Media.length > 0) return user.Media[user.Media.length - 1].MediaUrl;
        return '';
    }

    addReplyClick(feedbackId) {
        this.itemDetail.props.addReplyFeedBack(feedbackId);
        $('#replyModal').modal('hide');
    }

    renderPopUp() {
        let self = this;
        if (this.props.feedback) {
            let review = {};
            this.props.feedback.ItemReviews.map(function (data) {
                if (data.isSelected && data.isSelected === true) {
                    review = data;
                }
            });
            if (JSON.stringify(review) !== '{}') {
                return (
                    <div id="replyModal" className="modal fade" role="dialog">
                        <div className="modal-dialog">
                            {/* Modal content*/}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal">×</button>
                                    <h4 className="modal-title">REPLY TO: </h4>
                                </div>
                                <div className="modal-body">
                                    <div className="review-box">
                                        <div className="user-avtar"> <a href="#"><img src={self.getUserMedia(review.User)} alt="" /></a> </div>
                                        <div className="review-detail">
                                            <div className="review-head">
                                                <h6><b>{`${review.User.FirstName} ${review.User.LastName}`}</b></h6>
                                                <div className="item-rating text-right pull-right">
                                                    <span className="stars">
                                                        <span style={{ width: `${review.ItemRating * 20}%` }} />
                                                    </span>
                                                </div>
                                                {/* <div class="item-rating text-right"><img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_negative.svg"></div> */}
                                                <p>{self.formatDateTime(review.CreatedDateTime, 'DD/MM/YYYY, hh:mm')}</p>
                                            </div>
                                            <div className="review-body">{review.Message}</div>
                                        </div>
                                    </div>
                                    <div className="comment-area">
                                        <textarea rows={8} className="form-control" onChange={(e) => this.itemDetail.props.updateMessage(e.target.value)} placeholder="Leave a comment..." defaultValue={this.itemDetail.props.message} />
                                    </div>
                                </div>
                                <div className="modal-footer text-center">
                                    <button type="button" onClick={(e) => this.addReplyClick(review.FeedbackID)} className="btn btn-default">Reply</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div id="replyModal" className="modal fade" role="dialog">
                        <div className="modal-dialog">
                            {/* Modal content*/}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal">×</button>
                                    <h4 className="modal-title">REPLY TO: </h4>
                                </div>
                                <div className="modal-body">
                                    <div className="review-box">
                                        <div className="user-avtar"> <a href="#"><img src="images/place_user.jpg" alt="images" /></a> </div>
                                        <div className="review-detail">
                                            <div className="review-head">
                                                <h6><b>Buyer1</b></h6>
                                                <div className="item-rating text-right pull-right"><span className="stars"><span style={{ width: '99px' }} /></span></div>
                                                {/* <div class="item-rating text-right"><img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_positive.svg"> <img align="absmiddle" src="images/star_negative.svg"></div> */}
                                                <p>DD/MM/YYYY, HH:MM</p>
                                            </div>
                                            <div className="review-body">This seller is great, really recommended to buy from him, 10/10 will buy again.</div>
                                        </div>
                                    </div>
                                    <div className="comment-area">
                                        <textarea rows={8} className="form-control" placeholder="Leave a comment..." defaultValue={""} />
                                    </div>
                                </div>
                                <div className="modal-footer text-center">
                                    <button type="button" className="btn btn-default">Reply</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        } 
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} ControlFlags={this.props.controlFlags}/>
                </div>
                <div className="main">
                    <ItemDetailMainComponent {...this.props}
                        ref={(ref) => this.itemDetail = ref} />
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
                {this.renderPopUp()}
            </React.Fragment>
        );
    }
}

const ItemDetailsHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ItemDetailComponent)

module.exports = {
    ItemDetailsHome,
    ItemDetailComponent
}