'use strict';
var React = require('react');

var EventFormComponent = require('./event-form');
var TabContentComponent = require('./tab-content');
var EnumCoreModule = require('../../../../../../../../public/js/enum-core');


class OrderDiaryComponent extends React.Component {
    componentDidMount() {
        console.log('-----------------------------------------gggggggggggg', this.props)
        this.props.fetchEvents(this.props.page || null);
    }

    render() {
        const sections = this.props.sections || EnumCoreModule.GetOrderDiarySections();
        return (
            <React.Fragment>
                <section className="sassy-box po-activity-section">
                    <div className="box-activity-log">
                        <h2 className="sassy-title">Add Order Activity Log</h2>
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
                            customUploadLabel={"Attachment"}
                            isAuthorizedToAdd={this.props.pagePermissions.isAuthorizedToAdd}
                            validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                        />
                    </div>
                    <TabContentComponent
                        sections={sections}
                        events={this.props.events}
                        selectedTabSection={this.props.selectedTabSection}
                        updateSelectedTabSection={this.props.updateSelectedTabSection}
                        customTitleHtml={<h2 className="sassy-title">Order Activity Log</h2>}
                    />
                </section>
            </React.Fragment>
        );
    }
}

module.exports = OrderDiaryComponent;