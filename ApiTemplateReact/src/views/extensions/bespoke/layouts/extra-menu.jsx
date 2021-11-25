'use strict';
var React = require('react');

class ExtraMenuComponent extends React.Component {
    componentDidMount() {
        $(".h-cart a").hover(
            function() {
                $(".h-dd-menu.h-cart-menu").removeClass('hide-me');
                $(".h-dd-menu.h-cart-menu").slideDown();
            }, 
            function() {
                if (!$(".h-dd-menu.h-cart-menu").is(':hover')) {
                    $(".h-dd-menu.h-cart-menu").slideUp("fast", () => $(".h-dd-menu.h-cart-menu").addClass('hide-me'));
                }
            }
        );

        $(".h-dd-menu.h-cart-menu").hover(
            function() {
                $(".h-dd-menu.h-cart-menu").removeClass('hide-me');
                $(".h-dd-menu.h-cart-menu").slideDown();
            },
            function() {
                $(".h-dd-menu.h-cart-menu").slideUp("fast", () => $(".h-dd-menu.h-cart-menu").addClass('hide-me'));
            }
        );

    }

    renderCartIcon() {
        if (this.props.isDeliveryComponent == true && this.props.isMerchant == true) return null;

        let cartUrl = '/cart';
        
        return (
            <li className="h-cart">
                <a href={cartUrl}>
                    <i className="fa fa-shopping-cart"></i>
                    (<span className="cart-count" id="latest-cart-count">0</span>)
                </a>
                <div className="h-dd-menu h-cart-menu hide-me" style={{ overflow: 'hidden', outline: 'none', cursor: 'grab', display: 'none' }} tabIndex="3">
                    <div className="h-cart-mid"> 
                        <ul />
                    </div>
                    <div className="h-cart-bot">
                        <a href="/cart" className="btn-view-cart"> View Cart </a>
                    </div>
                </div>
                <div className="h-dd-menu add-cart">
                    <div className="h-cart-top">Item has been added!</div>
                    <div className="h-cart-mid">
                        <ul>
                            <li className="cart-item">
                                <div className="item-img">
                                    <span className="helper" />
                                    <img src={null}/>
                                </div>
                                <div className="item-info">
                                    <p/>
                                    <div className="item-price">
                                      <span className="currency"/>
                                      <span className="value"  />
                                   </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="h-cart-bot">
                        <a href={cartUrl} className="btn-view-cart"> View Cart </a>
                    </div>
                </div>
            </li>
        )
    }

    renderInboxIcon() {
        return this.props.user && this.props.user.ID ?
            <li className="h-mail">
                <a href="/chat/inbox">
                    <i className="fa fa-envelope"></i>
                    <span> (<span className="cart-count" id="unreadMessagesCount">{this.props.unreadCount || 0}</span>)</span>
                </a>
            </li>
        : '';
    }
    render() {
        return (
            <React.Fragment>
               {this.renderInboxIcon()}
                {this.renderCartIcon()}
            </React.Fragment>
        )
    }

}

module.exports = ExtraMenuComponent;