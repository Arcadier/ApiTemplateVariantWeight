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