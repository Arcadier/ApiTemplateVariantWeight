'use strict';
var React = require('react');

class ValuePropositionPanelsHome extends React.Component {
    render() {
        return (
            <div className="section section-item">
                <div className="container">
                    <div className="group-list">
                        {this.props.panel.Details.map(function (detail, index) {
                            return (<div className="item-list-container" key={index}>
                                <div className="content">
                                    <div className="square-img">
                                        {
                                            detail.Url?
                                                <a href={'http://'+ detail.Url}>
                                                    <img src={detail.PanelMedia[0].MediaUrl} alt="" />
                                                </a>
                                            :
                                                <img src={detail.PanelMedia[0].MediaUrl} alt="" />
                                        }
                                    </div>
                                    <div className="content-title">{detail.Title}</div>
                                    <div className="content-desc">{detail.Description}</div>
                                </div>
                            </div>)
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ValuePropositionPanelsHome;