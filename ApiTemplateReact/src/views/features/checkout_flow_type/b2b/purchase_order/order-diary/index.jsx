'use strict';
var React = require('react');

var EventFormComponent = require('./event-form');
var TabContentComponent = require('./tab-content');

let EnumCoreModule = require('../../../../../../public/js/enum-core');

class OrderDiaryComponent extends React.Component {
    componentDidMount() {
        this.props.fetchEvents();
    }

    render() {
        const sections = EnumCoreModule.GetOrderDiarySections();

        return (

            <React.Fragment>
                <section className="sassy-box no-border box-activity-log">
                    <h2 className="sassy-title">Order Activity Log</h2>
                    <div className="sassy-box-content border">
                        <EventFormComponent
                            sections={sections}
                            selectedSection={this.props.selectedSection}
                            uploadFile={this.props.uploadFile}
                            isValidUpload={this.props.isValidUpload}
                            isSuccessCreate={this.props.isSuccessCreate}
                            updateSelectedSection={this.props.updateSelectedSection}
                            setUploadFile={this.props.setUploadFile}
                            createEvent={this.props.createEvent}
                            isAuthorizedToAdd={this.props.isAuthorizedToAdd}
                            validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                        />
                    </div>
                </section>

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