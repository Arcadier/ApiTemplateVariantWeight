'use strict';
let React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

let EnumCoreModule = require('../../../../../../public/js/enum-core');
const PermissionTooltip =  require('../../../../../common/permission-tooltip');

class EventFormComponent extends React.Component {
    componentDidUpdate() {
        if (typeof window !== 'undefined') {
            if (this.props.isSuccessCreate === true) {
                $('input[name="entry_event"]').val('');
            }

            if (this.props.isValidUpload === false) {
                $('div.upload-entry-file').addClass('error-con');
            } else {
                $('div.upload-entry-file').removeClass('error-con');
            }
        }
    }

    onDropdownChange(e) {
        this.props.updateSelectedSection(e.target.value);
    }

    browseFile() {
        $("#order-diary-file[type='file']").click();
    }

    onFileChange(e) {
        const self = this;
        const file = e.target.files[0];
        const fileReader = new FileReader();

        const getMimetype = (signature) => {
            switch (signature) {
                case '89504E47':
                    return 'image/png';
                case '47494638':
                    return 'image/gif';
                case '25504446':
                    return 'application/pdf';
                case 'FFD8FFDB':
                case 'FFD8FFE0':
                case 'FFD8FFE1':
                    return 'image/jpeg';
                case '504B0304':
                    return 'application/zip';
                default:
                    return 'Unknown filetype';
            }
        };

        fileReader.onloadend = function(evt) {
            if (evt.target.readyState === FileReader.DONE) {
                const uint = new Uint8Array(evt.target.result);
                let bytes = [];
                uint.forEach((byte) => {
                    bytes.push(byte.toString(16));
                });
                const hex = bytes.join('').toUpperCase();

                if (EnumCoreModule.GetOrderDiaryValidFileTypes().includes(getMimetype(hex))) {
                    self.props.setUploadFile(file.name, true);
                } else {
                    self.props.setUploadFile('Invalid file selected.', false);
                    file.value = '';
                }
            }
        };

        if (file != undefined && file != null) {
            const blob = file.slice(0, 4);
            fileReader.readAsArrayBuffer(blob);
        }
    }

    addNewEvent() {
        if (!this.props.isAuthorizedToAdd) return;
        const self = this;
        this.props.validatePermissionToPerformAction('add-consumer-purchase-order-details-api', () => {
            if (self.validInput()) {
                const event = $('input[name="entry_event"]').val();
                let formData;

                if (self.props.uploadFile !== '') {
                    formData = new FormData();
                    $.each($('#order-diary-file[type="file"]')[0].files, function (i, file) {
                        formData.append('file-' + i, file);
                    });
                }

                self.props.createEvent(event, formData);

                $('#order-diary-file[type="file"]')[0].value = '';
            }
        });
    }

    validInput() {
        $('.required').each(function () {
            if ($(this).val() === '') {
                $(this).addClass('error-con');
            }
            else {
                $(this).removeClass('error-con');
            }
        });

        return $('.error-con').length <= 0;
    }

    renderSectionDropdown() {
        return (
            <React.Fragment>
                <select className="required" name="entry_section" value={this.props.selectedSection} onChange={(e) => this.onDropdownChange(e)}>
                    <option value="">Please select option</option>
                    {
                        this.props.sections.map(function(section) {
                            return (
                                <option key={section.key} value={section.key}>{section.value}</option>
                            );
                        })
                    }
                </select>
                <i className="fa fa-angle-down"></i>
            </React.Fragment>
        );
    }

    render() {
        const { isAuthorizedToAdd } = this.props;
        const addEntryBtnClass = `sassy-black-btn ${isAuthorizedToAdd ? '' : 'disabled'}`;
        return (
            <div className="order-grey-box">
                <div className="entry-form-prnt">
                    <div className="flex-wrapper">
                        <div className="select-section">
                            <label className="label-bold">Stage</label>
                            <div className="input-outer">
                                {this.renderSectionDropdown()}
                            </div>
                        </div>
                        <div className="events">
                            <label className="label-bold">Event</label>
                            <div className="input-outer">
                                <input type="text" className="event-text required" name="entry_event" />
                            </div>
                        </div>
                        <div className="upload-entry-file" onClick={(e) => this.browseFile()}>
                            <span className="icon-upload"><i className="fa fa-download"></i> </span><span>Upload File</span>
                            <div style={{ display: 'none' }}>
                                <input id="order-diary-file" type="file" accept="application/pdf" onChange={(e) => { this.onFileChange(e) }} />    
                            </div>
                        </div>
                        <span>{this.props.uploadFile}</span>
                        <div className="added-entry"></div>
                        <div className="entry-btns">
                            <PermissionTooltip isAuthorized={isAuthorizedToAdd}>
                                <button className={addEntryBtnClass} id="addNewEntry" onClick={(e) => this.addNewEvent()}>Add new entry</button>
                            </PermissionTooltip>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = EventFormComponent;