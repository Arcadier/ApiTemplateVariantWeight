'use strict';
var React = require('react');
var Entities = require('html-entities').XmlEntities;
const isServiceLevel = process.env.PRICING_TYPE === 'service_level';
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

var slick;
if (typeof window !== 'undefined') {
    slick = require('slick-carousel');
}

class ComparisonTableComponent extends React.Component {
    initCarousel() {
        $('.compare-slider').slick({
            infinite: false,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    }

    componentDidMount() {
        let self = this;
        $(window).resize(function () {
            self.titleHeight();
            self.tabHeight();
            self.eqHeight();
        });
        setInterval(function () {
            $(window).ready(function () {
                self.titleHeight();
                self.tabHeight();
                self.eqHeight();
                $(window).resize(function () {
                    self.titleHeight();
                    self.tabHeight();
                    self.eqHeight();
                });
            });
        }, 1000);
        if (!$('.compare-slider').hasClass('slick-initialized')) {
            this.initCarousel();
        }
    }

    componentWillUpdate() {
        let self = this;
        $(window).resize(function () {
            self.titleHeight();
            self.tabHeight();
            self.eqHeight();
        });
        setInterval(function () {
            $(window).ready(function () {
                self.titleHeight();
                self.tabHeight();
                self.eqHeight();
                $(window).resize(function () {
                    self.titleHeight();
                    self.tabHeight();
                    self.eqHeight();
                });
            });
        }, 1000);
        if ($('.compare-slider').hasClass('slick-initialized')) {
            $('.compare-slider').slick('unslick');
        }
    }

    componentDidUpdate() {
        let self = this;
        $(window).resize(function () {
            self.titleHeight();
            self.tabHeight();
            self.eqHeight();
        });
        setInterval(function () {
            $(window).ready(function () {
                self.titleHeight();
                self.tabHeight();
                self.eqHeight();
                $(window).resize(function () {
                    self.titleHeight();
                    self.tabHeight();
                    self.eqHeight();
                });
            });
        }, 1000);

        if (!$('.compare-slider').hasClass('slick-initialized')) {
            this.initCarousel();
        }
    }

    tabHeight() {
        var counter = 1;
        while ($(".cmparpg-list-tr.tr" + counter).length > 0) {
            var height = $(".cmparpg-list-tr.tr" + counter).height();
            $(".th" + counter).css("height", height);
            
            counter++;
            if($(".th" + counter).height() > $(".tr" + counter).height()){
                var height = $(".th" + counter).height();
                $(".tr" + counter).height(height);
                        
            };
        };
    }

    eqHeight() {
        var counter = 1;
        while ($(".tr" + counter).length > 0) {
            var maxHeight = 71
            $(".tr" + counter).each(function () {
                if ($(this).height() > maxHeight) { maxHeight = $(this).height(); }
            });
            $(".tr" + counter).height(maxHeight);
            counter++;
        };
    }

    titleHeight() {
        var maxHeight = 0;
        $(".cmparpg-title.text-center").each(function () {
           if ($(this).height() > maxHeight) {
               maxHeight = $(this).height();
           }
        });

        $(".cmparpg-title.text-center").height(maxHeight);
        $(".page-compare .spacer-40").height($(".cmparpg-title.text-center").outerHeight(true));
    }

    formatNumber(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    renderFieldNames() {
        const self = this;
        const comparison = this.props.comparison;
        const comparableCustomFields = this.props.comparableCustomFields;

        if (comparison.ComparisonDetails.length === 0) {
            return (
                <div />
            );
        }

        var el = [];

        el.push(
            <div key="original-price" className="cmparpg-list-tr text-center th2">
                <div className="cmparpg-list-td cmparpg-list-tdname">Original Price</div>
            </div>
        );

        el.push(
            <div key="buyer-description" className="cmparpg-list-tr text-center th3">
                <div className="cmparpg-list-td cmparpg-list-tdname">Description</div>
            </div>
        );

        let thCounter = 4;
        comparableCustomFields.forEach(function (customField) {
            const className = "cmparpg-list-tr text-center th" + thCounter;
            thCounter++;
            el.push(
                <div key={customField.Code} className={className}>
                    <div className="cmparpg-list-td cmparpg-list-tdname">{customField.Name}</div>
                </div>
            );
        });

        return el;
    }

    showDeleteModal(id) {
        this.props.setComparisonDetailToUpdate(id);
        $('#modalRemove').modal('show');
    }

    renderItem(item) {
        let discount = 0;
        if (item.CartItem.DiscountAmount) {
            discount = item.CartItem.DiscountAmount;
        }
        let total = item.CartItem.SubTotal
        if (item && item.Offer) {
            total = item.Offer.Total;
        }

        let duration = 0;
        if (isServiceLevel) {            
            if (item.CartItem && item.CartItem.BookingSlot && item.CartItem.ItemDetail) {
                let addOnPrice = 0;
                if (item.CartItem.AddOns && item.CartItem.AddOns.length > 0) {
                    item.CartItem.AddOns.forEach(function (addOn) {
                        addOnPrice += addOn.PriceChange;
                    });
                }
                
                total = item.CartItem.SubTotal + addOnPrice;
            }
        }

        //remove discount from Comparison Table
        //1255 - When Item have a Bulk Pricing , Price of item in the Comparison table should be the discounted Price
        total = isServiceLevel ? this.props.formatMoney(item.CartItem.CurrencyCode, total) : this.props.formatMoney(item.CartItem.CurrencyCode, total - discount);
        let mediaUrl = item.CartItem.ItemDetail.Media ? item.CartItem.ItemDetail.Media[0].MediaUrl : '';
        let qty = '';
        if (isServiceLevel) {
            if (!item.CartItem.ItemDetail.DurationUnit || item.CartItem.ItemDetail.PriceUnit === item.CartItem.ItemDetail.DurationUnit) {
                qty = `No of ${item.CartItem.BookingSlot.DurationUnit}: ${item.CartItem.BookingSlot.Duration}`;
            }
            else if (item.CartItem.ItemDetail.PriceUnit === item.CartItem.ItemDetail.BookingUnit) {
                qty = `No of ${item.CartItem.ItemDetail.BookingUnit}: ${item.CartItem.Quantity}`;
            }
            else {
                qty = `No of ${item.CartItem.ItemDetail.PriceUnit}: ${item.CartItem.Quantity}`;
            }
        }
        else {
            qty = `Qty: ${this.formatNumber(item.CartItem.Quantity)} `;
        }
        //let qty = isServiceLevel ? `No of ${item.CartItem.BookingSlot.DurationUnit}: ${item.CartItem.BookingSlot.Duration}` : 
        return (
           
            <div>
                <span className="cmparpg-title  text-center">{item.CartItem.ItemDetail.MerchantDetail.DisplayName}</span>
                <span />
                <div className="cmparpg-list-tr tr1 text-center" style={{ "height": "278px" }}>
                    <div className="cmparpg-list-td text-center">
                        <div className="cmparpg-prdct-img">
                            <img src={mediaUrl} />
                        </div>
                        <h4 className="cmparpg-prdct-title">{item.CartItem.ItemDetail.Name}</h4>
                        <div className="divider-sort" />
                        <div className=" cmparpg-price">
                            <span />
                            <span>{total}</span>
                        </div>
                        <div className="cmparg-qty">{qty} </div>
                        {this.props.permissions.isAuthorizedToDelete ?
                            (<a className="btn-remove-prdct openModalRemove top" tabIndex="0">
                                <i className="fa fa-trash" onClick={() => this.showDeleteModal(item.ID)} />
                            </a>) :
                            (<a href="javascript:void(0);" class="btn-remove-prdct openModalRemove top" tabindex="0" data-toggle="tooltip" data-placement="top" title="" data-original-title="You need permission to perform this action">
                                <i class="fa fa-trash"></i>
                            </a>)
                        }
                    </div>
                </div>
            </div>
        );
    }

    renderComparisonFieldValues(fields, currencyCode, originalPrice, durationUnit) {
        let self = this;
        let comparableCustomFields = self.props.comparableCustomFields;
        const entities = new Entities();

        let el = [];

        el.push(
            <div key="OriginalPrice" className="cmparpg-list-tr tr2 text-center">
                <div className="cmparpg-list-td">{self.props.formatMoney(currencyCode, originalPrice)}{isServiceLevel && `/${durationUnit}` }</div>
            </div>
        );

        var buyerDescription = fields.find(f => f.Key == 'BuyerDescription');
        if (buyerDescription) {
            el.push(
                <div key="BuyerDescription" className="cmparpg-list-tr tr3 text-center">
                    <div className="cmparpg-list-td">{buyerDescription.Value}</div>
                </div>
            );
        } else {
            el.push(
                <div key="BuyerDescription" className="cmparpg-list-tr tr3 text-center">
                    <div className="cmparpg-list-td"></div>
                </div>
            );
        }

        let trCounter = 4;
        comparableCustomFields.forEach(function (customField) {
            let isExist = false;
            let className = "cmparpg-list-tr tr" + trCounter + " text-center";
            trCounter++;

            fields.forEach(function (field) {
                if (field.Key == customField.Code) {
                    isExist = true;
                    if (customField.DataInputType.toLowerCase() === 'formattedtext') {
                        let decodeValue = entities.decode(field.Value);
                        el.push(
                            <div key={customField.Code} className={className}>
                                <div className="cmparpg-list-td" dangerouslySetInnerHTML={{ __html: decodeValue }}></div>
                            </div>
                        );
                    } else {
                        el.push(
                            <div key={customField.Code} className={className}>
                                <div className="cmparpg-list-td">{field.Value}</div>
                            </div>
                        );
                    }
                }
            });

            if (!isExist) {
                el.push(
                    <div key={customField.Code} className={className}>
                        <div className="cmparpg-list-td"></div>
                    </div>
                );
            }
        });

        return el;
    }

    renderComparisonDetails() {
        const self = this;
        const comparison = self.props.comparison;
        var el = comparison.ComparisonDetails.map(function (item) {
            let originalPrice = item.CartItem.ItemDetail.Price;
            let priceUnit = null;
            if (item.CartItem.ItemDetail.DurationUnit) {
                priceUnit = item.CartItem.ItemDetail.PriceUnit
                //durationUnit = item.CartItem.ItemDetail.DurationUnit;
            }
            return (
                <div key={item.ID} className="col-sm-4 ">
                    {self.renderItem(item)}
                    {self.renderComparisonFieldValues(item.ComparisonFields, item.CartItem.CurrencyCode, originalPrice, priceUnit)}
                    <div className="cmparpg-list-tr cmparpg-list-btntr cmparpg-list-btnextr">
                        <div className="cmparpg-list-td cmparpg-list-tdname"></div>
                        <div className="cmparpg-list-td"></div>
                        <div className="cmparpg-list-td"></div>
                    </div>
                </div>
            );
        })

        return el;
    }

    createPurchaseDetail(cartItemId, comparisonDetailId) {
        const cartItemIds = [cartItemId];
        this.props.createPurchaseDetail(cartItemIds, comparisonDetailId);
    }

    render() {
        return (
            <React.Fragment>
                <div>
                    <div className="col-sm-2 col-xs-4 max-w">
                        <span className="spacer-40" />
                        <div className="cmparpg-list-tr text-center th1">
                            <div className="cmparpg-list-td cmparpg-list-tdname" />
                        </div>
                        {this.renderFieldNames()}
                    </div>
                    <div className="col-sm-10 pull-left">
                        <div className="compare-slider">
                            {this.renderComparisonDetails()}
                        </div>
                        <div className="cmparpg-list-tr cmparpg-list-btntr cmparpg-list-btnextr">
                            <div className="cmparpg-list-td cmparpg-list-tdname" />
                            <div className="cmparpg-list-td" />
                            <div className="cmparpg-list-td" />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
module.exports = ComparisonTableComponent;