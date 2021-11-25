'use strict';
var React = require('react');
var ReactRedux = require('react-redux');

var EnumCore = require('../../../../public/js/enum-core');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ContainerComponent extends React.Component {
    renderLinks() {
        let links = [];
        let about = EnumCore.GetPolicyMappingByKey('About');
        let terms = EnumCore.GetPolicyMappingByKey('Terms');
        let privacy = EnumCore.GetPolicyMappingByKey('Privacy');
        let returns = EnumCore.GetPolicyMappingByKey('Return');
        /*let contact = EnumCore.GetPolicyMappingByKey('Contact');*/
        let faq = EnumCore.GetPolicyMappingByKey('Faq');
        if (this.props.policy.Title !== "FAQ") {
            if (this.props.pages.find(p => p.Title === about.value)) {
                links.push(<li className={this.props.policy.Title == about.value ? 'active' : ''}><a href={'/policy/' + about.url}>{about.name}</a></li>);
            }
            if (this.props.pages.find(p => p.Title === terms.value)) {
                links.push(<li className={this.props.policy.Title == terms.value ? 'active' : ''}><a href={'/policy/' + terms.url}>{terms.name}</a></li>);
            }
            if (this.props.pages.find(p => p.Title === privacy.value)) {
                links.push(<li className={this.props.policy.Title == privacy.value ? 'active' : ''}><a href={'/policy/' + privacy.url}>{privacy.name}</a></li>);
            }
            if (this.props.pages.find(p => p.Title === returns.value)) {
                links.push(<li className={this.props.policy.Title == returns.value ? 'active' : ''}><a href={'/policy/' + returns.url}>{returns.name}</a></li>);
            }
            /* if (this.props.pages.find(p => p.Title === contact.value)) {
                 links.push(<li className={this.props.policy.Title == contact.value ? 'active' : ''}><a href={'/policy/' + contact.url}>{contact.name}</a></li>);
             }*/
        }

        return links;
    }
    renderFaqContent() {
        let faqList = [];
        var isArr = Array.isArray(this.props.policy.Content);
        faqList = isArr ? this.props.policy.Content : JSON.parse(this.props.policy.Content);
        faqList.sort((a, b) => (a.SortOrder > b.SortOrder) ? 1 : -1)
        return (
            <div className="faq-container">
                <span>FAQ</span>
            <div className="faq-content">
                <ul>
                {
                    faqList.map(faq => {
                    return (
                        <li>
                            <div className="h-faq">
                                <span>Q: {faq.Title}</span>
                                <i className="fa-open fa fa-angle-down"></i>
                                <i className="fa-close fa fa-minus hide"></i>
                             </div>
                             <div className="h-body">
                                <span>Answer:</span>
                                <p dangerouslySetInnerHTML={{ __html: faq.HtmlContent.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '') }} />
                            </div>
                        </li>
                    );
                    })
                }
                </ul>
                </div>
            </div>
        );
    }
    componentDidMount() {
        $(".faq-content > ul > li").click(function () {
            var $this = $(this);
            if ($this.hasClass("open")) {
                $(".faq-content > ul > li.open").removeClass("open");
                $(".faq-content > ul > li .fa-open").removeClass("hide");
                $(".faq-content > ul > li .fa-close").addClass("hide");
                $(".faq-content > ul > li").find(".h-body").css("display", "none");
            }
            else {
                $(".faq-content > ul > li.open").removeClass("open");
                $(".faq-content > ul > li .fa-open").removeClass("hide");
                $(".faq-content > ul > li .fa-close").addClass("hide");
                $(".faq-content > ul > li").find(".h-body").css("display", "none");
                $this.addClass("open");
                $(".faq-content > ul > li.open").find(".h-body").css("display", "block");
                $(".faq-content > ul > li.open .fa-close").removeClass("hide");
                $(".faq-content > ul > li.open .fa-open").addClass("hide");
            }
        });
    }
    render() {
        let isHide = "";
        if (this.props.policy.Title.toLowerCase() === "contact us" || this.props.policy.Title.toLowerCase() === "faq") {
            isHide = "hide";
        }

        return (
            <div className="info-container custom-field">
                <div className={"tab-title " + isHide}>{this.props.policy.name}</div>
                <ul className={"nav nav-pills " + isHide}>
                    {this.renderLinks()}
                </ul>{this.props.policy.Title === "FAQ" ? this.renderFaqContent() :
                    <div className="tab-content" dangerouslySetInnerHTML={{ __html: (this.props.policy.Content || '') }}>
                    </div>
                }
            </div>
        );
    }
}

module.exports = ContainerComponent;