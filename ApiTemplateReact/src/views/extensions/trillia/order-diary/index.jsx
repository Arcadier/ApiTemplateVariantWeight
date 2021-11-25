'use strict';
var React = require('react');

var EventFormComponent = require('./event-form');
var TabContentComponent = require('./tab-content');

var EnumCoreModule = require('../../../../public/js/enum-core');

class OrderDiaryComponent extends React.Component {
    componentDidMount() {
        this.props.fetchEvents();
    }

    render() {
        const sections = EnumCoreModule.GetOrderDiarySections();

        return (
            <React.Fragment>
                <div className="tbl-tab order-box">
                    <h3 className="activity-log-title">Activity Log</h3>
                </div>
                <EventFormComponent
                    sections={sections}
                    selectedSection={this.props.selectedSection}
                    uploadFile={this.props.uploadFile}
                    isValidUpload={this.props.isValidUpload}
                    isSuccessCreate={this.props.isSuccessCreate}
                    updateSelectedSection={this.props.updateSelectedSection}
                    setUploadFile={this.props.setUploadFile}
                    createEvent={this.props.createEvent} />
                <TabContentComponent
                    sections={sections}
                    events={this.props.events}
                    selectedTabSection={this.props.selectedTabSection}
                    updateSelectedTabSection={this.props.updateSelectedTabSection} />
            </React.Fragment>
        );
    }
}

module.exports = OrderDiaryComponent;