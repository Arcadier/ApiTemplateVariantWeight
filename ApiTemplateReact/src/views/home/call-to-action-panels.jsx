'use strict';
var React = require('react');

class CallToActionPanelsHome extends React.Component {
    getBackgroundStyle() {
        if (this.props.panel != null && this.props.panel.Details != null
            && this.props.panel.Details.length > 0
            && this.props.panel.Details[0].PanelMedia != null
            && this.props.panel.Details[0].PanelMedia.length > 0) {
            return { 'backgroundImage': 'linear-gradient(rgba(0, 0, 0, 0.298039), rgba(0, 0, 0, 0.2)), url("' + this.props.panel.Details[0].PanelMedia[0].MediaUrl + '")' };
        }
    }

    formatUrl(url) {
        if (url) {
            if (!url.startsWith('http')) {
                url = "http\://" + url;
            }
        }

        return url;
    }

    render() {
        const self = this;

        return (
            <div className="section section-banner" style={this.getBackgroundStyle()}>
                <div className="container">
                    {this.props.panel.Details.map(function (detail, index) {
                        return (<div className="section-banner-content" data-id={detail.ID} key={index}>
                            <div className="title-text">{detail.Title}</div>
                            <div className="desc-text">{detail.Description}</div>
                            <div className="button-text"><a href={self.formatUrl(detail.Url)}>{detail.UrlDescription}</a></div>
                        </div>)
                    })}
                </div>
            </div>
        );
    }
}

module.exports = CallToActionPanelsHome;