'use strict';
var React = require('react');
var toastr = require('toastr');
var BaseComponent = require('../../../../shared/base');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class OrderListComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedCartItemID: null,
        };
    }

    componentDidMount() {
        const target =  $(".popup-area.order-item-feedback-popup");
        const cover = $("#cover");
        const self = this;
        $('.btn-feedback').click(function(e) {
            const hasFeedback = $(this).attr('has-feedback');
            if (hasFeedback == '0') {

                target.fadeIn();
                cover.fadeIn();    

                $('body').addClass('modal-open');
                const itemUrl = $(this).attr('item-url');
                const itemImgUrl = $(this).attr('item-image-url');
                const itemName = $(this).attr('item-name');
                const cartItemID = $(this).attr('cart-item-id');
                self.setState({ selectedCartItemID: cartItemID });     
                $('.ordr-dtls-item-iteminfo .item-img a').attr('href', itemUrl)
                $('.ordr-dtls-item-iteminfo .item-img a img').attr('src', itemImgUrl);
                $('.ordr-dtls-item-iteminfo .item-info-text div a').attr('href', itemUrl);
                $('.ordr-dtls-item-iteminfo .item-info-text div a').text(itemName);
            } else {
                toastr.warning('You already posted a review.', 'Failed in Posting Review')
            }            
        });

        $('#stars').on('starrr:change', function(e, value){
            $('input[name=rating_val]').val(value);
        });

        $('.close-popup-icon').click(function(e) {
            target.hide();
            cover.hide();
            $('#stars .glyphicon').removeClass('glyphicon-star');
            $('#stars .glyphicon').addClass('glyphicon-star-empty');
            $('input[name=rating_val]').val();
            $('.content-area .quote').remove();
            $('textarea[name=feedbackText]').val('');
            $('body').removeClass('modal-open');
            self.setState({ selectedCartItemID: null });                    
        });

        $('body').on('mouseout','#stars .glyphicon',function(){
            var $this = $(this);
            var rating = parseInt($this.parent('.starrr').find('.glyphicon-star').length);
            if(!rating)
                $this.parent('.starrr').next('.quote').remove();

            if( $('input[name=rating_val]').val() )
                $this.parent('.starrr').next('.quote').text(self.getQuote(rating) );

        });
    
        $('body').on('mouseenter','#stars .glyphicon',function(){
            var $this = $(this);
            var rating = parseInt($this.parent('.starrr').find('.glyphicon-star').length);
            var quote = self.getQuote(rating)
            var ob_quote = '<span class="quote">'+quote+'</span>';
            $this.parent('.starrr').next('.quote').remove();
            $this.parent('.starrr').after(ob_quote);
        });

        $('.my-btn').click(function(e) {
            const rating = $('input[name=rating_val]').val();
            const feedback = $('textarea[name=feedbackText]').val();
            if (rating === null || typeof rating === 'undefined' || rating == '') {
                toastr.warning('You forgot to select your star rating.', 'Oops! Something went wrong.');
            } else {    
                self.submitFeedback(rating, feedback);
                target.hide();
                cover.hide();
                $('#stars .glyphicon').removeClass('glyphicon-star');
                $('#stars .glyphicon').addClass('glyphicon-star-empty');
                $('input[name=rating_val]').val();
                $('.content-area .quote').remove();
                $('textarea[name=feedbackText]').val('');
                $('body').removeClass('modal-open');
                self.setState({ selectedCartItemID: null });    
            }
        });
    }

    getQuote(rating) {
        var quote = '';
        switch(rating) {
            case 1 :
                quote = 'Unsatisfied.';
                break;            
            case 2 :
                quote = 'Okay.';
                break;
            case 3 :
                quote = 'Good.';
                break;
            case 4 :
                quote = 'Great!';
                break;
            case 5 :
                quote = 'Excellent!!';
                break;
        }
        return quote;
    };

    submitFeedback(rating, feedback) {
        const self = this;
        const { selectedCartItemID } = this.state;
        if (selectedCartItemID && rating !== '') {
            this.props.submitFeedbackForCartItem({ InvoiceNo: this.props.InvoiceNo, cartId: selectedCartItemID, rating, feedback }, function (result) {
                if (result.success === true) {
                    toastr.success(result.message,'');
                }
            });
        }
    }

    getItemUrl(itemName, itemId) {
        return '/items/' + this.generateSlug(itemName) + '/' + itemId;
    }

    getLatestFulfillmentStatus(cartItem) {
        let status = '';
        const fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');

        if (fulfillmentStatuses.length > 0) {
            status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
        }

        return status == 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status;
    }

    renderShippingDetail(order) {
        const self = this;
        let shippingMethod = '';
        let shippingMethodMinimumLeadTime = 'N/A';
        let shippingMethodID = null;
        
        if (order.CartItemDetails) {
            const cartItem = order.CartItemDetails[0];
            if (cartItem.PickupAddress) {
                shippingMethod = cartItem.PickupAddress.Line1;
            } else if (cartItem.ShippingMethod) {
                shippingMethod = cartItem.ShippingMethod.Description;
                shippingMethodID = cartItem.ShippingMethod.ID;
            }

            if (this.props.shippingMethod && this.props.shippingMethod.length > 0 && shippingMethodID) {
                var shipping = this.props.shippingMethod.find(s => s && s.ID === shippingMethodID);
                var customFieldValue = JSON.parse(shipping.CustomFields[0].Values[0]);
                shippingMethodMinimumLeadTime = customFieldValue.MinimumLeadTime;
            }

            return (
                <div className="occtt-full">
                    <ul>
                        <li>
                            <span className="title">Seller</span>
                            <span>{order.MerchantDetail.DisplayName}</span>
                        </li>
                        <li>
                            <span className="title">Delivery Method</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shippingMethod}</span>
                        </li>
                        <li>
                            <span className="title">Delivery Price</span>
                            <span className="item-price">
                                <span className="item-price">
                                    {self.renderFormatMoney(order.CurrencyCode, order.Freight)}
                                </span>
                            </span>
                        </li>
                        <li>
                            <span className="title">Minimum Lead Time</span>
                            <span>{shippingMethodMinimumLeadTime}</span>
                        </li>
                        <li>
                            <span className="title">Order Status</span>
                            <span>{self.getLatestFulfillmentStatus(cartItem)}</span>
                        </li>
                    </ul>
                </div>
            )
        } else {
            return '';
        }
        
    }

    renderItem(cartItem) {
        const item = cartItem.ItemDetail;
        const itemImageUrl = item.Media !== null && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
        const itemUrl = this.getItemUrl(item.Name, item.ID);
        const itemQty = (cartItem.Quantity * 1).toLocaleString();
        let self = this;
        return (
            <React.Fragment>
                <span className="title">Item</span>
                <div className="oscctb-l">
                    <img src={itemImageUrl}></img>
                </div>
                <div className="oscctb-c">
                    <a href={itemUrl}><span className="item-name">{item.Name}</span></a>
                    <div className="item-detail">
                        {
                            item.Variants && item.Variants.length > 0 &&
                                item.Variants.map(v => 
                                    <div key={v.ID} className="oscctbc-d">
                                        <span className="title">{v.GroupName}</span>
                                        <span>{v.Name}</span>
                                    </div>
                                )
                        }
                    </div>
                </div>
                <div className="oscctbc-e">                   
                    <div className="oscctbc-d">
                        <a href={itemUrl}>
                            <span className="title">Price</span> <span className="item-price">{self.renderFormatMoney(item.CurrencyCode, item.Price)}</span>
                        </a>
                    </div>
                    <a href={itemUrl}>
                        <span className="title">Qty</span> <span>{itemQty}</span>
                    </a>
                </div>
                <div className="oscctb-r">
                    <div className="btn-feedback" item-name={item.Name} cart-item-id={cartItem.ID} item-url={itemUrl} item-image-url={itemImageUrl} has-feedback={cartItem.Feedback && cartItem.Feedback.FeedbackID > 0? '1':'0'}>
                        <span className="purchase-feedback">
                            <span className="feedback-img-sec">
                                {
                                    cartItem.Feedback && cartItem.Feedback.FeedbackID > 0?
                                        <div className="check-icon">
                                            <img src="/assets/images/done.svg"/>
                                        </div>
                                    : <i className="icon feedback"/>
                                }
                            </span>
                            <span className="feedback-message">
                                {
                                    cartItem.Feedback && cartItem.Feedback.FeedbackID > 0?
                                       'Left Feedback'
                                    : 'Leave a feedback'
                                }
                            </span>
                        </span> 
                    </div>
                 </div>
            </React.Fragment>
        );
    }
        
    render() {
        const self = this;
        const orders = this.props.orders;
        return (
            <React.Fragment>
                {
                    orders.map(function (order) {
                        return (
                            <div className="osc-container" key={order.ID}>
                                <div className="oscc-tbl oscctbl-multiorder full-width" key={order.ID}>
                                    <div className="oscct-top full-width">
                                        {
                                            order !== null &&
                                            self.renderShippingDetail(order)
                                        }
                                    </div>
                                    {
                                        order.CartItemDetails ? order.CartItemDetails.map(cartItem =>
                                            <div className="oscct-bot full-width" key={cartItem.ID}>
                                                <div className="oscctb-full" key={cartItem.ID}>
                                                    {self.renderItem(cartItem)}
                                                </div>
                                            </div>
                                        ) : ""
                                    }
                                </div>
                            </div>
                        );
                    })
                }
                <div className="popup-area order-item-feedback-popup" style={{ display: 'none' }}>
                    <div className="wrapper">
                        <div className="title-area text-capitalize">
                            <div className="pull-left">LEAVE A FEEDBACK FOR:</div>
                            <div className="pull-right">
                                <a href={'#'} className="close-popup-icon">
                                    <img src="/assets/images/icon-cross-black.png"/>
                                </a>
                            </div>
                            <div className="clearfix"/>
                        </div>
                        <div className="content-area">
                            <div className="ordr-dtls-item-itemdesc">
                                <div className="ordr-dtls-item-iteminfo">
                                    <div className="item-img">
                                        <a href={null}>
                                            <span><img src={null} className="item-preview"/></span>
                                        </a>
                                    </div>
                                    <div className="item-info-text">
                                        <div>
                                            <a href={null}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p>&nbsp;</p>
                            <p>How much do you rate this item?</p>
                            <input type="hidden" value="" name="rating_val"/>
                            <div id="stars" className="starrr"/>
                            <br/>
                            <p>
                                <textarea name="feedbackText" className="form-controler" placeholder="Leave a feedback..."/>
                            </p>
                        </div>
                        <div className="btn-area text-center">
                            <input type="button" value="SUBMIT" className="my-btn btn-red-popup"/>
                            <div className="clearfix"/>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = OrderListComponent;