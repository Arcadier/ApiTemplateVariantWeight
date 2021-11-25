'use strict'

let React = require('react');
let Entities = require('html-entities').XmlEntities;
var EnumCoreModule = require('../../../../../src/public/js/enum-core');
let toastr = require('toastr');
let Moment = require('moment');

const PermissionTooltip = require('../../../common/permission-tooltip');

class CustomFieldComponent extends React.Component {
    componentDidUpdate() {
        this.destroyCKEditors();
        this.initializeCKEditor();
        this.handleDateTime();
        this.initializePdf();
    }

    destroyCKEditors() {
        const { customFields } = this.props.itemModel;
        if (CKEDITOR.instances) {
            for (const instance in CKEDITOR.instances) {
                let isExist = false;
                if (customFields) {
                    isExist = customFields.find(c => c.Code == instance) != null;
                }
                if (!isExist) {
                    CKEDITOR.instances[instance].destroy(true);
                }
            }
        }
    }

    handleDateTime() {
        $(document).ready(function(){ 
            $('.datepicker').datetimepicker({
                format: 'DD/MM/YYYY',
            });

            $('.timepicker').datetimepicker({
                format: 'LT'
            });
        });
    }

    componentDidMount() {
        const self = this;

        this.initializeCKEditor();
        this.handleDateTime();
        this.initializePdf();
    }

    renderValues(property, values, valCtr) {
        let pdfFilename = "";
        let isPdfPath = false;
        let self = this;
        if (property.DataInputType != null) {
            if (property.DataInputType.toLowerCase() == "upload") {
                if (property.Values && property.Values.length > 0) {
                    if (property && property.Values[0] && (property.Values[0].startsWith('http://') || property.Values[0].startsWith('https://'))) {
                        isPdfPath = true;
                        var splitUrl = property.Values[0].split('/');
                        var filename = splitUrl[splitUrl.length - 1];
                        var index = filename.indexOf('_');

                        pdfFilename = filename.substring(index + 1);
                    } else {
                        pdfFilename = property.Values[0];
                    }
                }
            }
        }
        const entities = new Entities();

        return values.map(function (propertyValue, index) {
            let first = "";
            if (valCtr > 1) {
                first = ",";
            }

            valCtr--;
            if (property.DataInputType != null) {
                if (property.DataInputType.toLowerCase() == "upload" && isPdfPath) {
                    return (
                        <a key={index} href={propertyValue} target="_blank">{pdfFilename}</a>
                    )
                }
                else {
                    return propertyValue
                }
            }
        });
    }

    initializeCKEditor() {
        const editors = $('.ck-editor-element');
        for (let i = 0; i < editors.length; ++i) {
            if (!CKEDITOR.instances[$(editors[i]).attr('id')]) {
                CKEDITOR.replace($(editors[i]).attr('id'), {
                    toolbar: [
                        { name: 'document', groups: ['document', 'doctools'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-'] },
                        { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
                        { name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['-', 'SelectAll', '-'] },
                        { name: 'forms' },
                        '/',
                        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-'] },
                        { name: 'links', items: ['Link', 'Unlink'] },
                        { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar'] },
                        '/',
                        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                        { name: 'colors', items: ['TextColor', 'BGColor', 'youtube'] },

                        //removing toolbar, 
                        // { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },  
                        // { name: 'others', items: [ '-' ] }
                        // { name: 'about', items: [ 'About' ] }
                    ]
                });     //this is how to remove the status bar  below,
               
                CKEDITOR.config.removePlugins = 'elementspath';
                CKEDITOR.config.resize_enabled = true;
            }
        }

        if (this.props.itemModel.customFields !== null) {
            this.props.itemModel.customFields.map(function (cf, i) {
                if (cf.DataInputType.toLowerCase() === "formattedtext") {
                    $("input, textarea, select").each(function (i, el) {
                        if ($(this).hasClass('ck-editor-element')) {
                            let finalCode = $(el).attr("data-custom-field-type").replace("formattedText_", "");
                            if (finalCode === cf.Code) {
                                let editor = CKEDITOR.instances[$(el).attr("data-custom-field-type")];
                                if (editor) {
                                    if (editor && cf.Values && cf.Values[0]) {
                                        editor.setData(cf.Values[0]);
                                    }
                                } else {
                                    toastr.error("Failed to Retrieve FormattedtextValue");
                                }
                            }
                        }
                    });
                }
            });
        } 
    }

    initializePdf() {
        const self = this;

        $('.pdf-upload').on('click', function (e, isValidated) {
            e.stopPropagation();

            //ARC10803
            if (isValidated === false) {
                e.preventDefault();
                self.validatePdfPermissionOnClick($(this).data('code'));
                return;
            }

            return true;
        });
    }

    renderFormattedText(data, asterisk, value, i) {
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }

        if (data.DataInputType.toLowerCase() === "formattedtext") {
            value = "";
        }

        return (
            <div className="col-md-6" key={i}>
                <label>{data.Name}{asterisk}</label>
                <textarea name={"formattedText_" + data.Code} data-custom-field-type={"formattedText_" + data.Code}
                    className={"ck-editor-element " + isRequired} data-is-mandatory={data.IsMandatory}
                    id={"formattedText_" + data.Code}
                    defaultValue={value} data-code={data.Code} />
            </div>
        )
    }

    renderVideo(data, asterisk, value, i) {
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }
        return (
            <div className="col-md-6" key={i}>
                <label>{data.Name}{asterisk}</label>
                <textarea name="video-link" id="video-link"
                    className={"video-link " + isRequired} data-is-mandatory={data.IsMandatory}
                    onChange={(e) => this.props.onTextChange(e.target.value, data.Code)}
                    defaultValue={value} data-code={data.Code} />
            </div>
        )
    }

    maxNumber(e,maxNum,self,code) {
        var input = e.target.value;
        if (maxNum < input) {
            e.preventDefault();
        } else {
            self.props.onTextChange(e.target.value, code)
        }
    }

    renderDecimalTextField(data, asterisk, value, i) {
        let nameOfClass = "numberDecimalOnly";
        if (data.DataFieldType.toLowerCase() === "int") {
            nameOfClass = "numbersOnly";
        }
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = " required";
        }

        return (
            <div className="col-md-6" key={i}>
                <label>{data.Name}{asterisk}</label>
                <input type="text" className={nameOfClass + isRequired}
                    data-is-mandatory={data.IsMandatory} data-code={data.Code}
                    defaultValue={value} data-min={data.MinValue} data-max={data.MaxValue}
                    onChange={(e) => this.props.onTextChange(e.target.value, data.Code)}
                    maxLength={130} />
            </div>
        )
    }

    renderTextField(data, asterisk, value, i) {
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }
        return (
            <div className="col-md-6" key={i}>
                <label>{data.Name}{asterisk}</label>
                <input type="text" className={"custom-field " + isRequired}
                    data-is-mandatory={data.IsMandatory} data-code={data.Code}
                    onChange={(e) => this.props.onTextChange(e.target.value, data.Code)}
                    defaultValue={value} maxLength={130} />
            </div>
        )
    }

    renderDateTime(data, asterisk, value, i) {
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }
        let date = "";
        let time = "";
        if (value > 1) {
            date = Moment.unix(value).utc().local().format('DD/MM/YYYY');
            time = Moment.unix(value).utc().local().format('HH:mm A');
        }

      //  let time = this.props.formatTime(value);
        return (
           <div className=" item-form-group" key={i}>
                <label>{data.Name}{asterisk}
                </label>
                <div className= "col-md-6">
                    <div className="col-md-6">
                        <input data-name={data.Name} data-is-mandatory={data.IsMandatory}
                            data-format="DD/MM/YYY" placeholder="DD/MM/YYY" data-code={data.Code} type="text"
                            className={"datepicker-txt datepicker " + isRequired} defaultValue={date} />
                        <span className="input-group-addon"><span className="glyphicon glyphicon-calendar" />
                        </span>
                    </div>
                    {
                        data.DataFieldType == 'datetime' ? 
                            <div className="col-md-6">
                                <input data-name={data.Name} data-is-mandatory={data.IsMandatory}
                                    data-format="hh:mm" placeholder="00:00" data-code={data.Code} type="text"
                                    className={"datepicker-txt timepicker " + isRequired} defaultValue={time} />
                                <span className="input-group-addon"><span className="glyphicon glyphicon-time" />
                                </span>
                            </div>
                        : <div className="col-md-6"/>
                    }
                    
                </div>
            </div>
        )
    }

    renderLocation(data, asterisk, value, i) {
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }
        let textData = value[0];
        if (textData) {
            if (textData === "" || textData.length === 0) {
                textData = " ";
            } else if (textData && textData.length > 0) {
                if (textData[0] === "") {
                    textData = " ";
                }
            }
            else if (value[0] == null) {
                textData = " ";
            }
        } else {
            textData = " ";
        }

        let googleMapKey = process.env.GOOGLE_MAP_API_KEY;
        let srcUrl = "https://www.google.com/maps/embed/v1/place?q=" + encodeURI(textData) + "&key=" + googleMapKey;

        return (
            <div className="col-md-6" key={i}>
                <label>{data.Name}{asterisk}</label>
                <input data-name={data.Name} data-is-mandatory={data.isMandatory}
                    className={"location-value " + isRequired} data-code={data.code}
                    type="text" name="location" placeholder="Type the location name here"
                    defaultValue={value}
                    onChange={(e) => this.props.onTextChange(e.target.value, data.Code)}/>
                <div className="map-area" key={i}>
                    <div style={{ "overflow": 'hidden', "width": '568px', "height": '336px', "resize": 'none', "maxWidth": '100%' }}>
                        <div id="embed-map-display" style={{ height: '100%', width: '100%', 'maxWidth': '100%' }}>
                            <iframe style={{ height: '100%', width: '100%', border: '0', }} frameBorder="0"
                                src={srcUrl}></iframe>
                        </div>
                    </div>
                </div >
            </div>
            )
    }

    renderPercentage(data, asterisk, value, i) {
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }
        return (
            <div className="col-md-6 percentage" key={i}
                data-is-mandatory={data.isMandatory}
                data-code={data.code}>
                <label>{data.Name}{asterisk}</label>
                <input type="text" className={"numberDecimalOnly100Percent " + isRequired}
                    name="custom-field" defaultValue={value}
                    onChange={(e) => this.props.onTextChange(e.target.value, data.Code)}
                    maxLength={130} />
                <span>%</span>
            </div>
        )
    }

    renderEmail(data, asterisk, value, i) {

        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }

        return (
            <div className="col-md-6" key={i}
                data-is-mandatory={data.isMandatory}
                data-code={data.code}>
                <label>{data.Name}{asterisk}</label>
                <input type="text" className={"emailOnly " + isRequired}
                    name="custom-field"
                    defaultValue={value}
                    maxLength={130}
                    maxLength={130}
                    onChange={(e) => this.props.onTextChange(e.target.value, data.Code)}/>
            </div>
        );
    }

    renderCheckBoxes(data, asterisk, value, i) {
        if (typeof data.Options === 'undefined') {
            return
        }

        return (
            <div className="col-md-6" key={i}
                data-is-mandatory={data.isMandatory}>
                <label>{data.Name}{asterisk}</label>
                <div>
                    {this.renderCheckBox(data.Options, data.Code, value, i, asterisk)}
                </div>
            </div>
        )
    }

    renderCheckBox(options, code, values, i, asterisk) {
      
        let self = this;

        return options.map(function(option) {
            let isChecked = "";
            if (values != null) {
                values.forEach(function(value) {
                    if (value == option.Name) {
                        isChecked = "checked";
                    }
                });
            }
            let isRequired = "";
            let isMandatory = false;
            if (asterisk == "*") {
                isRequired = "required";
                isMandatory = true;
            }
            return (
                <div className="fancy-checkbox checkbox-sm" key={option.Name + code + i}>
                    <input className={isRequired} type="checkbox"
                           data-is-mandatory={isMandatory}
                           name="custom-field"
                           data-group={code}
                           id={code + option.Name}
                           checked={isChecked}
                           onChange={(e) => self.props.checkboxClickedCustomField(option.Name, code)}/>
                    <label htmlFor={code + option.Name}>{option.Name} </label>
                </div>
            );
        });
    }

    renderDropBoxes(data, asterisk, values, i) {

        if (typeof data.Options === 'undefined') {
            return
        }

        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }
        let selectedValue = "";
        data.Options.map(function (option) {
            if (values != null) {
                values.forEach(function (value) {
                    if (value == option.Name) {
                        selectedValue = option.Name;
                    }
                });
            }
        });
        return (
            <div className="col-md-6" data-code={data.Code} key={data.Code + i}
                 data-is-mandatory={data.isMandatory}>
                <label>{data.Name}{asterisk}</label>
                <select className={isRequired} data-name={data.Name} data-is-mandatory={data.isMandatory}
                        onChange={(e) => this.props.dropDownChange(e, data.Code)}
                        name="additional-desc"
                        defaultValue={selectedValue}>
                    <option value="" className="hidden"></option>
                    {this.renderDropBox(data.Options, data.Code, i)}
                </select>
            </div>
        );
    }

    renderDropBox(options, code, i) {
        return options.map(function(option) {

            return (
                <option value={option.Name} data-code={code} key={option.Name + code + i}>
                    {option.Name}
                </option>
            );
        });
    }

    renderPDF(data, asterisk, value, i) {
        let isRequired = "";
        if (asterisk == "*") {
            isRequired = "required";
        }    
        return (
            <div className="col-md-6" key={i}>
                <label>
                    {data.Name}{asterisk}
                </label>
                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToAdd} extraClassOnUnauthorized={'icon-grey'}>
                    <div id={"pdf-btn" + data.Code} className={"btn-upload btn " + isRequired}>
                        <input id={"pdf-" + data.Code} type="file" data-code={data.Code} className={isRequired + ' pdf-upload'}
                            accept="application/pdf" onChange={(e) => this.onFileChange(e, data.Code)} />
                        <img src="https://bootstrap.arcadier.com/marketplace/images/image_add_white.svg" alt="" />
                        <img src="https://bootstrap.arcadier.com/marketplace/images/pdf.svg" alt="" />
                    </div>
                </PermissionTooltip>
                <span className="file-name">
                    {value}
                </span>
                <div className="responce" />
                <div id={"pip" + data.Code} className="pipcontent" />
            </div>
        );
    }

    validatePdfPermissionOnClick(code) {
        this.props.validatePermissionToPerformAction("add-merchant-create-item-api", () => {
            $('#pdf-' + code).trigger('click', true);
        });
    }

    onFileChange(e, code) {
        const self = this;
        const file = e.target.files[0];

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

        this.props.validatePermissionToPerformAction("add-merchant-create-item-api", () => {
            const fileReader = new FileReader();
            fileReader.onloadend = function (evt) {
                if (evt.target.readyState === FileReader.DONE) {
                    const uint = new Uint8Array(evt.target.result);
                    let bytes = [];
                    uint.forEach((byte) => {
                        bytes.push(byte.toString(16));
                    });
                    const hex = bytes.join('').toUpperCase();

                    if (EnumCoreModule.GetOrderDiaryValidFileTypes().includes(getMimetype(hex))) {
                        var data = {
                            "Code": code,
                            "Filename": file.name
                        }
                        self.props.setPDFFile(data);
                    } else {
                        toastr.error("Invalid File");
                    }
                }
            };

            if (file != undefined && file != null) {
                const blob = file.slice(0, 4);
                fileReader.readAsArrayBuffer(blob);
            }
        });
    }

    renderCustomField(customField, i) {
        
        let asterisk = "";
        if (customField.IsMandatory) {
            asterisk = "*";
        }
        let values = [];
        if (customField.Values != null) {
            values = this.renderValues(customField, customField.Values, customField.Values.length );
        }

        let newSet = false;
        //Rendering Initial
        if (i === 0 || i % 2 === 0) {
            newSet = true;
        }
        if (customField.DataInputType) {
            //FormattedText
            if (customField.DataInputType.toLowerCase() === "formattedtext") {
                return this.renderFormattedText(customField, asterisk, values, i);
            }
            //TextField //HyperLink
            if (customField.DataInputType.toLowerCase() === "textfield" || customField.DataInputType.toLowerCase().includes("hyperlink")) {
                return this.renderTextField(customField, asterisk, values, i);
            }
            //Decimal and Int
            if (customField.DataInputType.toLowerCase() === "number") {
                return this.renderDecimalTextField(customField, asterisk, values, i);
            }
            //Video
            if (customField.DataInputType.toLowerCase() === "textarea") {
                return this.renderVideo(customField, asterisk, values, i);
            }
            //Date and Time}
            if (customField.DataInputType.toLowerCase() === "datetime") {
                return this.renderDateTime(customField, asterisk, values, i);
            }
            //Location
            if (customField.DataInputType.toLowerCase() === "location") {
                return this.renderLocation(customField, asterisk, values, i);
            }
            //Checkbox
            if (customField.DataInputType.toLowerCase() === "checkbox") {
                return this.renderCheckBoxes(customField, asterisk, values, i);
            }
            //Dropdown
            if (customField.DataInputType.toLowerCase() === "dropdown") {
                return this.renderDropBoxes(customField, asterisk, values, i);
            }
            //PDF
            if (customField.DataInputType.toLowerCase() === "upload") {
                return this.renderPDF(customField, asterisk, values, i);
            }
            //Percentage
            if (customField.DataInputType.toLowerCase() === "percentage") {
                return this.renderPercentage(customField, asterisk, values, i);
            }
            //Email
            if (customField.DataInputType.toLowerCase() === "email") {
                return this.renderEmail(customField, asterisk, values, i);
            }
        }

     
    }

    renderCustomFields() {
        
        let self = this;
        
        if (this.props.itemModel.customFields !== null) {
            return this.props.itemModel.customFields.map(function (cf, i) {
                return self.renderCustomField(cf, i);
            });
        } else {
            return false;
        }
    }

    render() {
        return (
            <div id="customfields" className="item-form-group">
                {this.renderCustomFields()}
            </div>
        )
    }
}

module.exports = CustomFieldComponent;