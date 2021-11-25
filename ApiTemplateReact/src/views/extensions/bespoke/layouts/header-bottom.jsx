'use strict';
var React = require('react');
var UserExtraMenuComponent = require('./extra-menu');

class HeaderLayoutBottomComponent extends React.Component {
    searchMessages(e) {
        if (e.keyCode == 13) {
            this.gotoSearch(e);
        }
    }
    gotoSearch(event) {
        if (event.target.tagName.toLowerCase() === 'input' && event.which !== 13) {
            return;
        }

        const keywords = $('.h-search-bar input').val();
        let categories = $('.h-search-bar select').val();
        if (categories === "All Catgories") {
            categories = "";
        }
        window.location.href = '/search?keywords=' + keywords + "&categories=" + categories;
    }

    renderHeaderPanel() {
        var self = this;
        if (this.props.panels != null) {
            var headerPanel = this.props.panels.map(function (panel, index1) {
                if (panel.Type == 'ExternalLinkHeader' && panel.Details && panel.Details.length >= 1) {
                    return (
                        <li className="h-more" key={index1} onClick={(e) => self.props.showBannerMenu(e)} >
                            <span>More</span>
                            <i className="fa fa-angle-down"></i>
                            <ul className="h-dd-menu hide-me" style={{ overflow: 'hidden', outline: 'currentcolor none medium', cursor: 'grab', display: 'none' }} tabIndex="1">
                                {panel.Details.map(function (detail, index2) {
                                    return (<li key={index2}><a href={detail.Url}>{detail.Title}</a></li>)
                                })}
                            </ul>
                        </li>)
                }
            });
            return headerPanel;
        } else {
            return '';
        }
    }

    renderCategories() {
        if (this.props.categories != null) {
            var categoryViews = this.props.categories.map(function (item, index) {
                return (
                    <option value={item.ID} key={item.ID}>{item.Name}</option>);
            });
            return categoryViews;
        } else {
            return '';
        }
    }

    renderHomepageUrl() {
        if (this.props.homepageUrl) {
            if (this.props.homepageUrl.startsWith('http')) {

                return this.props.homepageUrl;
            }

            return process.env.PROTOCOL + '://' + this.props.homepageUrl;
        }

        return '/';
    }

    render() {
        const self = this;

        let guestUserID = "";
        if (this.props.guestUserID && this.props.guestUserID !== "") {
            guestUserID = this.props.guestUserID;
        }

        return (
            <div className="header-bottom">
                <div className="container">
                    <ul className="header-menus">
                        <li className="h-logo">
                            <a href={this.renderHomepageUrl()}>
                                <img src={this.props.logoUrl} />
                            </a>
                        </li>
                        <li className="h-search">
                            <div className="h-search-bar">
                                <div className="h-search-input">
                                    <input type="text" placeholder="Search..." onKeyDown={(e) => self.searchMessages(e)} defaultValue={decodeURIComponent((this.props.keyword + '').replace(/\+/g, '%20'))} />
                                    <i className="fa fa-search" onClick={(e) => self.gotoSearch(e)}></i>
                                </div>
                                <div className="h-search-category">
                                    <select>
                                        <option value="All Catgories">All Categories</option>
                                        {this.renderCategories()}
                                    </select>
                                    <i className="fa fa-angle-down"></i>
                                </div>
                            </div>
                        </li>
                        <li className="h-extramenus">
                            <ul>
                                <li className="h-mobi-search mobi-show" onClick={(e) => this.props.searchMobile(e)}>
                                    <i className="fa fa-search"></i>
                                </li>
                                <UserExtraMenuComponent unreadCount={this.props.unreadCount} user={this.props.user} isDeliveryComponent={this.props.isDeliveryComponent} isMerchant={this.props.isMerchant} guestUserID={guestUserID} />
                                {this.renderHeaderPanel()}
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

module.exports = HeaderLayoutBottomComponent;