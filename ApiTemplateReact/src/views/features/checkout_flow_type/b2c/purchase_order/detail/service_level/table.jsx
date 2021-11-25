'use strict';
const React = require('react');
const Moment = require('moment');
const BaseComponent = require('../../../../../../shared/base');

class TableContentComponent extends BaseComponent {
    getItemUrl(itemName, itemId) {
        return '/items/' + this.generateSlug(itemName) + '/' + itemId;
    }

    getLatestOrderStatus(cartItem) {
        let status = "";
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');

        if (process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
            orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        }

        if (orderStatuses.length > 0) {
            orderStatuses.sort((a, b) => (a.CreatedDateTime > b.CreatedDateTime) ? 1 : -1)
            status = orderStatuses[orderStatuses.length - 1].Name;
        } else if (orderStatuses.length === 0) {
            let fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
            if (fulfillmentStatuses.length > 0) {
                status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
            }
        }
        switch (status) {
            case 'Ready For Consumer Collection':
                status = 'Ready for Pick-up';
                break;
            case 'Delivered':
                if (cartItem.BookingSlot != 'undefined' && cartItem.BookingSlot != null) {
                    status = 'Shipped';
                }
                break;
        }

        return status;
    }

    renderReview(cartItem, itemImageUrl, itemUrl) {
        const item = cartItem.ItemDetail;
        if (this.getLatestOrderStatus(cartItem).toLowerCase() == 'completed') { 
            return (<td data-th="Review">
                <div className="btn-feedback" item-name={item.Name} cart-item-id={cartItem.ID} item-url={itemUrl} item-image-url={itemImageUrl} has-feedback={cartItem.Feedback && cartItem.Feedback.FeedbackID ? '1' : '0'}>
                    <span className="purchase-feedback">
                        <span className="feedback-img-sec">
                            {
                                cartItem.Feedback && cartItem.Feedback.FeedbackID ?
                                    <div className="check-icon">
                                        <img src="/assets/images/done.svg" />
                                    </div>
                                    : <i className="icon feedback" />
                            }
                        </span>
                        <span className="feedback-message">
                            {
                                cartItem.Feedback && cartItem.Feedback.FeedbackID ? 'Left Feedback' : 'Leave a feedback'
                            }
                        </span>
                    </span>
                </div>
            </td>);
        }
        return <td data-th="Review">&nbsp;</td>;
    }

    renderQuotationData(thisProps) {
        const self = this;
        const orders = thisProps.detail.Orders;
        let currency = "";
        let ele = '';
        if (orders) {
            ele = orders.map(function (order) {
                if (order.CartItemDetails) {
                    return order.CartItemDetails.map(function (cartItem) {
                        currency = cartItem.CurrencyCode;
                        if (cartItem.AcceptedOffer && cartItem.AcceptedOffer.OfferDetails) {
                            return cartItem.AcceptedOffer.OfferDetails.map(function (detail) {
                                if (detail.Name === cartItem.ItemDetail.Name) {
                                    return "";
                                }
                                return (
                                    <tr className="extra bb-none">
                                        <td colspan="2" data-th="Service Description">
                                        	<div className="text-left">
                                                <p><span><b>{detail.Name} -</b> {detail.Description}</span></p>
                                            	{
                                            		detail.Type == 'Quantity' ?
	                                                	<span className="if-txt"> 
	                                                		<span> Qty:</span>
	                                                		<span>{detail.Quantity}</span>
	                                                	</span>
	                                                : <span>{detail.Type}</span>
                                            	}
                                            	{
	                                                detail.Type == 'Percentage' ?
	                                                    <span className="if-txt">
	                                                    	<span>Percentage: </span>
	                                                    	<span>{`${parseFloat(detail.Price * 100).toFixed(2)} %}`}</span>
	                                                    </span>
	                                                    : 
	                                                    <span className="if-txt">
	                                                    	<span className="item-price">{self.renderFormatMoney(currency, detail.Price)}</span>
	                                                    </span>
	                                            }
                                        	</div>
                                        </td>
                                        <td data-th="Review">
                                             <span className="item-price">{self.renderFormatMoney(currency, detail.TotalAmount)}</span>
                                        </td>
                                        <td data-th="Total Price">
                                            &nbsp;
                                        </td>
                                    </tr>
                                )
                            });
                        }
                    });
                }
            });
        }

        return ele;
    }
       
    showBookingTime(isOvernight, durationUnit) {
        return !isOvernight && (durationUnit 
            && (durationUnit.toLowerCase().includes('minute') 
                || durationUnit.toLowerCase().includes('hour')));
    }
    
    renderAddOns(addOns, currencyCode) {
        const self = this;
        const sortedAddOns = addOns.sort((a,b) => a.SortOrder - b.SortOrder);
        const formattedAddOns = [];
        for(let i = 0; i < sortedAddOns.length; i++) {
            formattedAddOns.push(`- ${sortedAddOns[i].Name} +${self.formatMoney(currencyCode, sortedAddOns[i].PriceChange)}`);
            formattedAddOns.push(<br key={i}/>)
        }
        return formattedAddOns;
    }

    getBookingType(item) {
        const { DurationUnit, BookingUnit, PriceUnit } = item;
        if (!DurationUnit && !BookingUnit && !PriceUnit) return null;

        if (!DurationUnit || PriceUnit.toLowerCase() == DurationUnit.toLowerCase()) {
            return 'Book by duration';
        }
        if (BookingUnit && PriceUnit.toLowerCase() == BookingUnit.toLowerCase()) {
            return 'Book by unit';
        }

        return 'Book by duration and unit';
    }

    renderAvailabilitySchedule(itemDetails) {
        if (itemDetails) {
            const { Scheduler } = itemDetails;
            if (Scheduler) {
                if (Scheduler.Overnight) {
                    if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                        const checkInTime = Moment(Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format('HH:mm');
                        const checkOutTime = Moment(Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format('HH:mm');
                        return (
                            <div className="idclt-custom-field full-width">
                            <span className="title">Availability</span>
                                <span className="custom-field">
                                    <p>
                                        Check-in: {checkInTime}
                                        <br />
                                        Check-out: {checkOutTime}
                                    </p>
                                </span>
                        </div>

                        )
                    }
                } else {
                    let label = '';
                    let scheduleArr = [];
                    if (Scheduler.AllDay) {
                        label = '<h5>Open 24/7</h5>';
                    } else {
                        label = '<h5>Availability / Opening Hours</h5>';
                    }
                    scheduleArr.push(label)
                    if (Scheduler.OpeningHours && Scheduler.OpeningHours.length > 0) {
                        var groupBy = function(xs, key) {
                          return xs.reduce(function(rv, x) {
                            (rv[x[key]] = rv[x[key]] || []).push(x);
                            return rv;
                          }, {});
                        };
                        const scheduleGroupedByDay = groupBy(Scheduler.OpeningHours, 'Day');
                        if (scheduleGroupedByDay) {
                            scheduleArr.push(...Object.keys(scheduleGroupedByDay).map(num => {
                                let day = '';
                                switch(num) {
                                    case '1':
                                        day = 'Sunday';
                                        break;
                                    case '2':
                                        day = 'Monday';
                                        break;
                                    case '3':
                                        day = 'Tuesday';
                                        break;
                                    case '4':
                                        day = 'Wednesday';
                                        break;
                                    case '5':
                                        day = 'Thursday';
                                        break;
                                    case '6':
                                        day = 'Friday';
                                        break;
                                    case '7':
                                        day = 'Saturday';
                                        break;
                                }
                                const opening = scheduleGroupedByDay[num];
                                if (opening && opening.length > 0) {
                                    if (opening.length == 1 && opening[0] && opening[0].IsRestDay) {
                                        return `<p><span>${day}:</span><span>Closed</span></p>`;
                                    }

                                    const openingsOnday = opening.map(op => {
                                        const checkInTime = Moment(op.StartTime, "HH:mm:ss").format('hh:mm A');
                                        const checkOutTime = Moment(op.EndTime, "HH:mm:ss").format('hh:mm A');
                                        return `<span>${checkInTime} - ${checkOutTime}</span>`;
                                    });
                                    const openingStr = `<p><span>${day}:</span>${openingsOnday.join('<br />')}<p>`;
                                    return openingStr;
                                }
                            }));
                        }
                    }
                    return (
                        <div className="item-opening-hours" dangerouslySetInnerHTML={{__html: scheduleArr.join("")}} >
                    
                        </div>

                    );
                }
            }
        }
        return '';
    }

    renderExtraInfo(itemDetails) {
    	if (itemDetails) {
    		if (itemDetails.Location) {
                const {
                    Line1,
                    Line2,
                    State,
                    City,
                    Country,
                    CountryCode,
                    Latitude,
                    Longitude,
                    PostCode
                } = itemDetails.Location; 
                const location = `${Line1}, ${Line2 || ''} ${City} ${Country} ${PostCode} ${State || ''}`;

                const encodedLocation = Latitude !== 0 && Longitude !== 0 ? `${Latitude}, ${Longitude}` : location;
                const srcUrl = "https://www.google.com/maps/embed/v1/place?q=" + encodeURI(encodedLocation) + "&key=" + process.env.GOOGLE_MAP_API_KEY;
                return (
                    <div className="item-address">
                        <h5><i className="fas fa-map-marker-alt" aria-hidden="true" />&nbsp;{location}</h5>
                        <iframe style={{ width: '100%', border: '0', }} frameBorder="0" src={srcUrl}></iframe>
                        <div>{this.renderAvailabilitySchedule(itemDetails)}</div>
                    </div>
                );
            }
    	}
    	return;
    }

    renderItem(cartItem, enableReviewAndRating) {
        const item = cartItem.ItemDetail;
        const itemImageUrl = item.Media !== null && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
        const itemUrl = this.getItemUrl(item.Name, item.ID);
        const itemQty = (cartItem.Quantity * 1).toLocaleString();
        let self = this;

        let fromDate = '';
        let toDate = '';
        let fromTime = '';
        let toTime = '';
        let checkInTime = '';
        let checkOutTime = '';

        let showBookingTime = false;
        let duration = 0;
        if (cartItem.BookingSlot) {
            fromDate = Moment.unix(cartItem.BookingSlot.FromDateTime).utc().format('DD/MM/YYYY');
            toDate = Moment.unix(cartItem.BookingSlot.ToDateTime).utc().format('DD/MM/YYYY');
            duration = cartItem.BookingSlot.Duration || 1;
            if (item.Scheduler) {
                showBookingTime = this.showBookingTime(item.Scheduler.Overnight, cartItem.BookingSlot.DurationUnit);
                if (showBookingTime) {
                    fromTime = Moment.unix(cartItem.BookingSlot.FromDateTime).utc().format(process.env.TIME_FORMAT);
                    toTime = Moment.unix(cartItem.BookingSlot.ToDateTime).utc().format(process.env.TIME_FORMAT);
                }
                if (item.Scheduler.Overnight) {
                    if (item.Scheduler.OpeningHours && item.Scheduler.OpeningHours.length > 0) {
                        checkInTime = Moment(item.Scheduler.OpeningHours[0].StartTime, "HH:mm:ss").format('hh:mm A');
                        checkOutTime = Moment(item.Scheduler.OpeningHours[0].EndTime, "HH:mm:ss").format('hh:mm A');
                    }
                }
            }
        }
        const totalAddOnsAmount = cartItem.AddOns.reduce(function (total, currentValue) {
            return total + currentValue.PriceChange;
        }, 0);
    	const totalPrice = (parseFloat(item.Price) * parseInt(itemQty) * parseInt(duration)) + totalAddOnsAmount - parseFloat(cartItem.DiscountAmount || 0);

        const bookingType = this.getBookingType(item);
        return (
            <tr className="brdt" key={cartItem.ID}>
                <td data-th="Service Description">
                    <div className="flex-wrap h-img-box">
                        <div className="thumb-group mr-15">
                            <img src={itemImageUrl} alt="Item" />
                        </div>
                        <div className="po-content">
                            <span className="title">{item.Name}</span>
                            <div className="item-field">
                                <span className="if-txt">
                                    <span>Date:</span>
                                    <span>{`${fromDate} - ${toDate}`}</span>
                                </span>
                                {
                                    showBookingTime ? 
                                        <span className="if-txt">
                                            <span>Time:</span>
                                            <span>{`${fromTime} - ${toTime}`}</span>
                                        </span>
                                    :''
                                }
                                {
                                    item.Scheduler && item.Scheduler.Overnight == true?
                                        <span className="if-txt">
                                            <span>{`Check-in ${checkInTime} Check-out ${checkOutTime}`}</span>
                                        </span>

                                    : ''
                                }
                                {
                                    bookingType && bookingType != 'Book by unit' ?
                                        <span className="if-txt">
                                            <span>No of {item.DurationUnit}:</span>
                                            <span className="no_of_hour">{duration}</span>
                                        </span>
                                    : ''
                                }
                                {
                                    bookingType && bookingType != 'Book by duration' ?
                                        <span className="if-txt">
                                            <span>No of {item.BookingUnit}:</span>
                                            <span className="no_of_hour">{cartItem.Quantity}</span>
                                        </span>
                                    : ''
                                }
                                {
                                    cartItem.AddOns && cartItem.AddOns.length > 0 ? 

                                        <span className="if-txt">
                                            <span>Add-ons:</span>
                                            <span>
                                            {this.renderAddOns(cartItem.AddOns, cartItem.CurrencyCode)}
                                            </span>
                                        </span>
                                    : ''
                                }
                                    
                            </div>
                        </div>
                    </div>
                </td>
                {enableReviewAndRating === true ? this.renderReview(cartItem, itemImageUrl, itemUrl) : <td data-th="Review">&nbsp;</td>}
                <td data-th="Total Price">
                    <span className="item-price">{self.renderFormatMoney(item.CurrencyCode, totalPrice)}</span>
                </td>
                <td data-th="&nbsp;">
                	{this.renderExtraInfo(item)}
                </td>
            </tr>
        );
    }

    renderItemData(thisProps) {
        const self = this;
        const orders = thisProps.detail.Orders;
        let ele = '';
        if (orders) {
            ele = orders.map(function (order) {
                if (order.CartItemDetails) {
                    return order.CartItemDetails.map(function (cartItem) {
                        return self.renderItem(cartItem, thisProps.enableReviewAndRating);
                    });
                }
            });
            return ele;
        } else {
            return null;
        }
    }

	renderCustomHeader(enableReviewAndRating) {
		return (
			<thead>
                <tr>
                    <th width="300px" className="text-left">Service Description</th>
                    {enableReviewAndRating === true ? <th>Review</th> : <th>&nbsp;</th>}
                    <th width="171px">Total Price</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
		);
	}

	renderCustomTableItems(thisProps) {
		return (
            <React.Fragment>
                {this.renderItemData(thisProps)}
                {this.renderQuotationData(thisProps)}
            </React.Fragment>
        );
	}

}

module.exports = TableContentComponent;