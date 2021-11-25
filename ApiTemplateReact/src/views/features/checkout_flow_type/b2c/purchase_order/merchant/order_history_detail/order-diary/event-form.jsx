'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var EnumCoreModule = require('../../../../../../../../public/js/enum-core');


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
    
    removeDuplicate(arr){
        var tmp = [];
        for(var i = 0; i < arr.length; i++){
            if(tmp.indexOf(arr[i]) == -1){
            tmp.push(arr[i]);
            }
        }
        return tmp;
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
                    var inputObj = $('.upload-entry-file input');
                    var names = [];
                    for (var i = 0; i < $(inputObj).get(0).files.length; ++i) {
                        names.push($(inputObj).get(0).files[i].name);
                        var ext = names[i].split('.').pop();
                        names = self.removeDuplicate(names);
                        if(ext=="pdf"){
                          $.each(names, function( index, obj ) {
                            $(`<div class="contract-item" key="`+"file"+[index]+`"><i class="fas fa-download"></i> <span>`+obj+`</span>
                                      <a href="#" class="contract-remove" ><i class="fa fa-times" key="`+"file"+[index]+`"></i></a></div>`).prependTo('.uploaded-contracts');
                            var seen = {};
                            $('.contract-item').each(function() {
                                    var txt =  $('.contract-item').text();
                                    if (seen[txt])
                                         $('.contract-item').remove();
                                    else
                                        seen[txt] = true;
                            });
                            $('.uploaded-contracts').show();
                          });
                        }
                    }
                    $('body').on('click','.contract-remove', function(e){
                        var theKey = e.target.getAttribute("key");
                        $(".contract-item").each(function(i, obj ) {
                            if( $(obj).attr("key") === theKey){
                                var itemRemove = $(obj).attr("key", theKey).text();
                                names.splice( $.inArray(itemRemove,names) ,1 );
                                $(obj).attr("key", theKey).remove();
                                $('#order-diary-file[type="file"]')[i].value = '';
                            } 
                        });
                        e.preventDefault();
                    });

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

    addNewEvent(e) {
        if (this.validInput()) {
            const btn = $("#addNewEntry").prop('disabled', true);

            const event = $('input[name="entry_event"]').val();
            let formData;

            if (this.props.uploadFile !== '') {
                formData = new FormData();
                $.each($('#order-diary-file[type="file"]')[0].files, function (i, file) {
                    formData.append('file-' + i, file);
                });
            }
            this.props.createEvent(event, formData, this.props.page || null);
            $(".uploaded-contracts").html("");
            $('#order-diary-file[type="file"]')[0].value = '';
            $('input[name="entry_event"]').val('');
            setTimeout(function(){ btn.prop('disabled', false); }, 3000);
        }

    }

    validInput() {
        $('.required').each(function () {
            if ($(this).val() === '' && $(this).attr('id') !== 'booking_date' && $(this).attr('id') !=='booking_time') {
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
                    {this.props.showDropdownPlaceholder == false ? null : 
                        <option value="">Please select option</option>}
                    {
                        this.props.sections.map(function(section) {
                            if (section.key == 'Approvals') return <option key={section.key} value={section.key} style={{display: 'none'}}>{section.value}</option>;
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
        const border = this.props.showBorder == true ? 'border' : '';
        return (
            <div className={"sassy-box-content " + border}>
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
                                <span className="icon-upload">
                                    <i className="fa fa-download"></i>
                                </span>
                                <span>&nbsp;{this.props.customUploadLabel || 'Upload File'}</span>
                                <div style={{ display: 'none'}}>
                                    <input id="order-diary-file" accept="application/pdf" type="file" onChange={(e) => { this.onFileChange(e) }}/>
                                </div>
                                <div className="uploaded-contracts"></div>
                             
                            </div>
                        </div>
                        <div className="added-entry"></div>
                        <div className="entry-btns">
                            <button className="sassy-black-btn" id="addNewEntry" onClick={(e) => this.addNewEvent(e)}>Add new entry</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = EventFormComponent;