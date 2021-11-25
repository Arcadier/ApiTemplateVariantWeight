'use strict';
var React = require('react');
var SellerExtraMenuComponent = require('../layouts/extra-menu');

class HeaderLayoutBottomComponent extends React.Component {
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
        return (
            <div className="header-bottom">
                <div className="container">
                    <ul className="header-menus">
                        <li className="h-logo">
                            <a href={this.renderHomepageUrl()}>
                                <img src={this.props.logoUrl} />
                            </a>
                        </li>
                        <li className="h-extramenus pull-right">
                            <ul>
                                <SellerExtraMenuComponent unreadCount={this.props.unreadCount} />
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