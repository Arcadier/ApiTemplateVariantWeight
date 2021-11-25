'use strict';
var React = require('react');

var EventFormComponent = require('./event-form');
var TabContentComponent = require('./tab-content');
var EnumCoreModule = require('../../../../../../../../public/js/enum-core');


class OrderDiaryComponent extends React.Component {
    componentDidMount() {
        this.props.fetchEvents(this.props.page || null);
    }

    render() {
        //b2c dont have OrderDiary
        return "";
        const sections = this.props.sections || EnumCoreModule.GetOrderDiarySections();
        return (
            <React.Fragment>
                <section className="sassy-box no-border box-activity-log">
                    <h2 className="sassy-title">Order Activity Log</h2>
                    <EventFormComponent
                        sections={sections}
                        page={this.props.page}
                        selectedSection={this.props.selectedSection}
                        uploadFile={this.props.uploadFile}
                        isValidUpload={this.props.isValidUpload}
                        isSuccessCreate={this.props.isSuccessCreate}
                        updateSelectedSection={this.props.updateSelectedSection}
                        setUploadFile={this.props.setUploadFile}
                        createEvent={this.props.createEvent}
                        showDropdownPlaceholder={this.props.showDropdownPlaceholder}
                        showBorder
                    />
                </section>
                <TabContentComponent
                    sections={sections}
                    events={this.props.events}
                    selectedTabSection={this.props.selectedTabSection}
                    updateSelectedTabSection={this.props.updateSelectedTabSection}
                    noBorder
                />
            </React.Fragment>
        );
    }
}

module.exports = OrderDiaryComponent;