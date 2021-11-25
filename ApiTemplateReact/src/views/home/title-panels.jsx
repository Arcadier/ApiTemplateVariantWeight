'use strict';
var React = require('react');

class TitlePanelsHome extends React.Component {
    render() {
        var self = this;
        return (
            <React.Fragment>
                {this.props.panel.Details.map(function (detail, index) {
                    return (<div className="section section-text" data-id={detail.ID} key={index} id={self.props.panel.ID}>
                        <div className="t-d-text">
                            <span className="t-d-title">{detail.Title}</span>
                            <p className="t-d-description">{detail.Description}</p>
                        </div>
                    </div>)
            })}
            </React.Fragment>
        );
    }
}

module.exports = TitlePanelsHome;