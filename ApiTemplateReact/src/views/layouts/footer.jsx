'use strict';
var React = require('react');
var ReactRedux = require('react-redux');

if (typeof window !== 'undefined') {
    var $ = window.$;
}
var panelActions = require('../../redux/panelAction');
var policyActions = require('../../redux/policyActions');
var marketplaceActions = require('../../redux/marketplaceActions');
var EnumCore = require('../../public/js/enum-core');
var CommonModule = require('../../../src/public/js/common.js');

class FooterLayoutComponent extends React.Component {

    componentDidMount() {
        if ((this.props.panels == null || this.props.panels.length == 0) && this.props.loadPanels != null) {
            this.props.loadPanels();
        }

        if (typeof this.props.getContentPages === 'function') {
            this.props.getContentPages(true);
            //Cookie UN641
            this.props.loadMarketplaceInfo();
           
        }
    }
    
    acceptCookie() {
        CommonModule.createCookie("acceptCookiePolicy", 1, 1);
        $('.cookie-bar').fadeOut(1000, function ()
        {
            $('.cookie-bar').remove();
        });
    }
    renderCookie() {
        let learnMoreTitle = '';
        let cookieTitle = '';
        let learnMoreUrl = '#';
        let acceptButtonTitle = '';
       
        if (this.props.cookieData) {
            CommonModule.changeFavicon(this.props.favIconData);
            this.props.cookieData.forEach(function (cf) {
                if (cf.Name.toLowerCase() === "message" && cf.Values) {
                    cookieTitle = cf.Values[0];
                }
                if (cf.Name.toLowerCase() === "accept button" && cf.Values) {
                    acceptButtonTitle = cf.Values[0];
                }
                if (cf.Name.toLowerCase() === "cookie policy link button" && cf.Values) {
                    learnMoreTitle = cf.Values[0];
                }
                if (cf.Name.toLowerCase() === "button url" && cf.Values) {
                    learnMoreUrl = cf.Values[0];
                }
            });

            if (CommonModule.getCookie("acceptCookiePolicy") === 1) {
                return '';
            }
        } else {
            return '';
        }
        if (typeof window !== 'undefined') {
            return (
                <div className="cookie-bar">
                    <div className="flex-cookier-bar">
                        <p>{cookieTitle} <a href={learnMoreUrl} target="_blank">{learnMoreTitle}</a></p>
                        <a className="cookie-btn" href="#" onClick={(e) => this.acceptCookie(e)}>{acceptButtonTitle}</a>
                    </div>
                </div>
            );
        }
        return '';
    } 
    renderSocialMediaLinks() {
        if (typeof this.props.panels !== 'undefined' && this.props.panels !== null && this.props.panels.length > 0) {
            let externalLinks = this.props.panels.find(p => p.Type === 'ExternalLinkFooter');

            if (typeof externalLinks !== 'undefined') {
                let links = [];
                let details = externalLinks.Details;
                let facebook = details.find(d => d.Title == 'Facebook');
                let instagram = details.find(d => d.Title == 'Instagram');
                let linkedIn = details.find(d => d.Title == 'LinkedIn');
                let twitter = details.find(d => d.Title == 'Twitter');

                if (facebook.Url) {
                    links.push(<li key="facebook"><a target="_blank" href={'https://www.facebook.com/' + facebook.Url}><img src="/assets/images/fb.svg" alt="facboook" title="facebook" className="img-responsive" /></a></li>);
                }
                if (instagram.Url) {
                    links.push(<li key="instagram"><a target="_blank" href={'https://www.instagram.com/' + instagram.Url}><img src="/assets/images/insta.svg" alt="Instagram" title="Instagram" className="img-responsive" /></a></li>);
                }
                if (linkedIn.Url) {
                    links.push(<li key="linkedIn"><a target="_blank" href={'https://www.linkedin.com/' + linkedIn.Url}><img src="/assets/images/linkedin.svg" alt="linkedin" title="linkedin" className="img-responsive" /></a></li>);
                }
                if (twitter.Url) {
                    links.push(<li key="twitter"><a target="_blank" href={'https://www.twitter.com/' + twitter.Url}><img src="/assets/images/twitter.svg" alt="twitter" title="twitter" className="img-responsive" /></a></li>);
                }

                return links;
            }
        }

        return '';
    }

    renderPolicyLinks() {
        if (typeof this.props.pages !== 'undefined' && this.props.pages != null && this.props.pages.length > 0) {
            let policies = [];
            let pages = this.props.pages;
            let about = EnumCore.GetPolicyMappingByKey('About');
            let terms = EnumCore.GetPolicyMappingByKey('Terms');
            let privacy = EnumCore.GetPolicyMappingByKey('Privacy');
            let returns = EnumCore.GetPolicyMappingByKey('Return');
            let contact = EnumCore.GetPolicyMappingByKey('Contact');
            let faq = EnumCore.GetPolicyMappingByKey('Faq');

            if (pages.find(p => p.Title === about.value)) {
                policies.push(<li key='about-us'><a href={'/policy/' + about.url} target="_blank" rel="noopener noreferrer">{about.name}</a></li>);
            }
            if (pages.find(p => p.Title === terms.value)) {
                policies.push(<li key='terms'><a href={'/policy/' + terms.url} target="_blank" rel="noopener noreferrer">{terms.name}</a></li>);
            }
            if (pages.find(p => p.Title === privacy.value)) {
                policies.push(<li key='privacy-policy'><a href={'/policy/' + privacy.url} target="_blank" rel="noopener noreferrer">{privacy.name}</a></li>);
            }
            if (pages.find(p => p.Title === returns.value)) {
                policies.push(<li key='return-policy'><a href={'/policy/' + returns.url} target="_blank" rel="noopener noreferrer">{returns.name}</a></li>);
            }
            if (pages.find(p => p.Title === contact.value)) {
                policies.push(<li key='contact-us'><a href={'/policy/' + contact.url} target="_blank" rel="noopener noreferrer">{contact.name}</a></li>);
            }
            if (pages.find(p => p.Title === faq.value)) {
                policies.push(<li key='faq'><a href={'/policy/' + faq.url} target="_blank" rel="noopener noreferrer">{faq.name}</a></li>);
            }

            return policies;
        }

        return '';
    }

    renderCopyRightContent() {
        if (process.env.TEMPLATE === 'bespoke') return this.props.marketplaceName;
        return 'Trillia &copy; 2019 All rights reserved';
    }

    render() {
        return (           
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-6 col-sm-6">
                        <ul className="footer-navigation">
                            {this.renderPolicyLinks()}
                        </ul>
                    </div>
                    <div className="col-md-6 col-sm-6 text-right">
                        <p className="copy-right">{this.renderCopyRightContent()}</p>
                        <ul className="footer-social-navigation">
                            {this.renderSocialMediaLinks()}
                        </ul>
                    </div>
                </div>
                <div>
                    {this.renderCookie()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        panels: state.panelsReducer.panels,
        pages: state.contentPageReducer.pages,
        cookieData: state.marketplaceReducer.customFields,
        favIconData: state.marketplaceReducer.favIconData,
        marketplaceName: state.marketplaceReducer.name
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadPanels: () => dispatch(panelActions.asyncLoadingPanels()),
        getContentPages: (isContentExclude) => dispatch(policyActions.getPages(isContentExclude)),
        loadMarketplaceInfo: () => dispatch(marketplaceActions.getInfo())
    }
}

const FooterLayout = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(FooterLayoutComponent)

module.exports = {
    FooterLayout,
    FooterLayoutComponent
}