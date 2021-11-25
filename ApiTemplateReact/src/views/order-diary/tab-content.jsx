'use strict';
var React = require('react');
var Moment = require('moment');
var BaseComponent = require('../shared/base')

class TabContentComponent extends BaseComponent {
    componentDidMount() {
        $('.title.desktop-hide').on('click', function(){
            $(".nav-tabs.nav-justified").toggleClass("mobi-hide");
        });

        $('.box-activity-tabs .nav-tabs.nav-justified > li > a').on('click', function(){
            $(".nav-tabs.nav-justified").addClass("mobi-hide");
        });
    }

    renderSectionTabs() {
        const self = this;
        const oneTabClass = this.props.sections && this.props.sections.length == 1 ? ' only-one-tab' : '';

        return (
            <ul className={"nav nav-tabs nav-justified mobi-hide" + oneTabClass}>
                {
                    this.props.sections.map(function (section, index) {
                        let active = '';
                        if (section.key === self.props.selectedTabSection || (index === 0 && (typeof self.props.selectedTabSection === 'undefined' || self.props.selectedTabSection === ''))) {
                            active = 'active';
                        }

                        return (
                            <li key={section.key} className={active}>
                                <a data-toggle="tab" href={"#" + section.key} onClick={(e) => self.props.updateSelectedTabSection(section.key)}>{section.value}</a>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }

    renderSectionEvents(section, index) {
        const self = this;

        let active = '';
        if (section.key === this.props.selectedTabSection || (index === 0 && (typeof this.props.selectedTabSection === 'undefined' || this.props.selectedTabSection === ''))) {
            active = 'active in';
        }

        let events = [];
        if (typeof this.props.events !== 'undefined') {
            this.props.events.map(function (event) {
                if (event.Section === section.key) {
                    events.push(event);
                }
            });
        }

        events.sort(function (e1, e2) {
            return Moment(e1.CreatedOn) < Moment(e2.CreatedOn) ? 1 : -1;
        });
        const thirdColName = section.key == 'Comments' ? 'Comment' : 'Event';
        return (
            <div key={section.key} className={"osc-container tab-pane fade " + active} id={section.key}>
                <span className="title desktop-hide">{section.value} <i className="fa fa-angle-down"></i></span>
                <div className="ph-t-table">
                    <table className="table ">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>{thirdColName}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                events.map(function (event, index) {
                                    return (
                                        <tr key={index}>
                                            <td data-th="Timestamp">{self.formatDateTime(event.CreatedOn)}</td>
                                            <td data-th="User">{event.DisplayName}</td>
                                            <td data-th={thirdColName}>{event.Event}</td>
                                            {self.renderDownload(event.Pdf)}
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    renderDownload(pdf) {
        let link = null;
        try {
            link = JSON.parse(pdf)[0].SourceUrl 
        } catch (e) {
            link = pdf;
        }
        if (link) {
            return (
                <td data-th="" className="align-right blue-bold" onClick={(e) => { window.open(link, '_blank') }} >
                    <span className="btn-view">View</span> / <span className="btn-download">Download</span>
                </td>
            )
        }

        return (
            <td data-th="" className="align-right blue-bold">

            </td>
        )
    }

    render() {
        const self = this;
        const custom = this.props.noBorder == true ? 'sassy-box no-border ' : '';
        return (
            <section className={"box-activity-tabs " + custom}>
                {this.props.customTitleHtml}
                {this.renderSectionTabs()}
                <div className="tab-content">
                    {
                        this.props.sections.map(function (section, index) {
                            return (
                                self.renderSectionEvents(section, index)
                            )
                        })
                    }
                </div>
            </section>
        );
    }
}

module.exports = TabContentComponent;