'use strict';
var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
const UserPreferredLocationComponent = require('../../features/pricing_type/' + process.env.PRICING_TYPE + '/user-settings/preferred-location');

var EnumCoreModule = require('../../../../src/public/js/enum-core.js');
var CommonModule = require('../../../../src/public/js/common.js');

var TextComponent = require('../custom-fields/text-component');
var HyperlinkComponent = require('../custom-fields/hyperlink-component');
var CheckboxComponent = require('../custom-fields/checkbox-component');
var DropdownComponent = require('../custom-fields/dropdown-component');
var DateComponent = require('../custom-fields/date-component');
var ImageComponent = require('../custom-fields/image-component');
var PdfComponent = require('../custom-fields/pdf-component'); 
var InputContainerComponent = require('../custom-fields/input-container-component'); 
var Moment = require('moment');

const PermissionTooltip = require('../../common/permission-tooltip');

var $ = require('jQuery');

class ProfileSettingsComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        this.sellerLocation = this.getSellerLocation();
        let componentState = {
            Email: this.props.user.Email,
            sellerLocation: this.sellerLocation,
        }
        this.state = {            
            ...componentState
        };
        this.CustomFields = this.props.user.CustomFields;  
        if (!this.CustomFields) {
            this.CustomFields = [];
        }
        this.uploadProfileImage = this.uploadProfileImage.bind(this);

        this.ximg_crop = null;
        this.CanvasCrop = null;
        this.rot = 0
        this.ratio = 1;
        this.fileOriginalName = '';
        this.renderUserCustomField = this.renderUserCustomField.bind(this);
        this.onCustomValueChanged = this.onCustomValueChanged.bind(this);        
        this.onCustomCheckboxChanged = this.onCustomCheckboxChanged.bind(this);
        this.onCustomFileChanged = this.onCustomFileChanged.bind(this);
        this.onCustomDateChanged = this.onCustomDateChanged.bind(this);
        this.gotoNextTab = this.gotoNextTab.bind(this);
        this.validateFields = this.validateFields.bind(this);

        this.permissionPageType = props.componentType != 'merchant' ? 'consumer' : 'merchant';
    }

    componentDidMount() {
        var self = this;
        let src = null;

        if (src == null) {
            var mediaCount = this.props.user.Media ? this.props.user.Media.length : 0;
            if (mediaCount >= 1 && typeof this.props.user.Media[mediaCount - 1] != 'undefined') {
                src = this.props.user.Media[mediaCount - 1].MediaUrl;
            }
        }

        if (src === null) {
            src = '/assets/images/blank.png';
        }
        this.setState({
            MediaUrl: src
        }, function () {
            // for image size and position
            $('#myModal').find('.thumbBox').css('width', 248);
            $('#myModal').find('.thumbBox').css('height', 248);
            $('#myModal').find('.imageBox').css('width', 250);
            $('#myModal').find('.imageBox').css('height', 250);

            //<---Cropping

            self.CanvasCrop = $.CanvasCrop({
                cropBox: ".imageBox",
                thumbBox: ".thumbBox",
                imgSrc: src,
                limitOver: 2
            });
        });

        $('#upload-file').on("change", function () {
            $(".tools").removeClass("hide");
            self.fileOriginalName = event.target.files[0].name;
            var reader = new FileReader();
            reader.onload = function (e) {
                self.CanvasCrop = $.CanvasCrop({
                    cropBox: ".imageBox",
                    imgSrc: e.target.result,
                    limitOver: 2
                });
                self.rot = 0;
                self.ratio = 1;
            }
            reader.readAsDataURL(this.files[0]);
        });

        $("#rotateLeft").on("click", function () {
            self.rot -= 90;
            self.rot = self.rot < 0 ? 270 : self.rot;
            self.CanvasCrop.rotate(self.rot);
        });

        $("#rotateRight").on("click", function () {
            self.rot += 90;
            self.rot = self.rot > 360 ? 90 : self.rot;
            self.CanvasCrop.rotate(self.rot);
        });

        $("#alertInfo").on("click", function () {
            $(".tools").addClass("hide");
            var canvas = document.getElementById("visbleCanvas");
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            jQuery('#upload-file').val('');
        });

        $("#my-range").on("change", function () {
            self.CanvasCrop.scale($(this).val());
        });

        if (this.props.componentType != 'merchant') {
            $('.descripton-textbox').removeClass('required')
            $('.seller-location-textbox').removeClass('required')
        }
    }

    xcropImagePopup(x, xtrgt, w, h) {
        let self = this;
        w = w / 2;
        h = h / 2;
        self.ximg_crop = xtrgt;
        $('#myModal').modal('show');
        $('#myModal').find('.imageBox').css('width', w);
        $('#myModal').find('.imageBox').css('height', h);
    }

    uploadProfileImage(data) {
        if (data.Base64Data.indexOf('blank.png') > 0) {
            $.get("/assets/images/blank.png", function (data) {
                var s = new XMLSerializer().serializeToString(data.documentElement)
                this.setState({
                    MediaUrl: s,
                    MediaOriginalFileName: data.OriginalName
                });
            });
        }
        else {
            this.setState({
                MediaUrl: data.Base64Data,
                MediaOriginalFileName: data.OriginalName
            });
        }

    }

    validateProfileFields() {
        $(".error-con").removeClass("error-con");
        $('.required.error-con').removeClass("error-con");
        $(".required").each(function (index, element) {
            var $this = $(element);
            $this.removeClass("error-con");
            let isAddressField = $this.data() && $this.data().reactStateComponentName && $this.data().reactStateComponentName == "Address";
            if ($this.val() == "" && $this.val().length < 1 && typeof isAddressField == 'undefined' && $this.find(".custom-image").length === 0) {
                $this.addClass("error-con");
            }

            if ($this.find(".custom-image").length > 0) {
                //PDF validation
                if ($this.find(".isPdf").length > 0 && $this.find(".isPdf").val() === "") {
                    $this.addClass("error-con");
                }

                //Img validation
                if ($this.find(".isImage").length > 0 && $this.find(".imgpreview").attr('src').indexOf("img-placeholder.png") > 0 ) {
                    $this.addClass("error-con");
                }
            }


        });

        $(".fancy-checkbox").parent('.required').each(function () {
            if ($(this).find('[type="checkbox"]').is(":checked") == true) {
                $(this).removeClass("error-con");
            }            
        });        
    }

    gotoNextTab(e) {
        var self = this;
        var $tab = $(e.target).parents('.tab-pane');
        var $parent = $tab.attr('id');

        self.validateFields(e, $parent);
    }

    validateFields(e, $parent) {
        var self = this;
        self.validateProfileFields();
        var error = $('#Profile').find('.error-con').length > 0;

        if (!error && CommonModule.validateEmail(this.state.Email) == false) {
            self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_EMAILS);
            $('.user-email').addClass('error-con');
            e.preventDefault();
            error = true;
            return;
        }

        if (!error && $('.media-url-container').attr('src').indexOf('images/blank.png') > 0) {
            self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_PROFILE_PICTURE);
            $('.media-url-container').addClass('error-con');
            e.preventDefault();
            error = true;
            return;
        }

        if (!error) {
            if ($parent == 'Profile') {
                self.doUpdateUserInfo();
                $('.setting-tab >ul >li:eq(1) a').trigger('click', true);
            }
            if ($parent == 'Address') {
                $('.setting-tab >ul >li:eq(2) a').click();
            }
        }
    }

    onChangeSetStateCallBack() {
        super.onChangeSetStateCallBack();
    }

    doUpdateUserInfo() {
        const { customFieldDefinition } = this.props;

        const objectWithoutKey = (object, key) => {
            const { [key]: deletedKey, ...otherKeys } = object;
            return otherKeys;
        }

        var self = this;
        var newUserInfo = Object.assign({}, self.state);
        newUserInfo = objectWithoutKey(newUserInfo, "sellerLocation");

        if (this.props.componentType == 'merchant') {
            let code = '';
            var userLocationObject = customFieldDefinition.find((d) => d.Name == 'user_seller_location')

            if (typeof userLocationObject != 'undefined') {
                code = userLocationObject.Code;
            }
            else if (typeof self.props.user.CustomFields != 'undefined' && self.props.user.CustomFields != null) {
                code = self.props.user.CustomFields[0].Code
            }

            newUserInfo.CustomFields = [];
            newUserInfo.CustomFields.push({
                Code: code,
                Values: [self.state.sellerLocation],
                DataFieldType: 'string'
            });
        }

        if (customFieldDefinition && customFieldDefinition.length > 0) {
            const userPreferredLocationDefinition = customFieldDefinition.find((d) => d.Code.startsWith('user_preferred_location'));

            if (userPreferredLocationDefinition) {
                if (typeof this.userPreferredLocationComponent.getUserPreferredLocation == 'function') {
                    const userPreferredLocation = this.userPreferredLocationComponent.getUserPreferredLocation();

                    if (userPreferredLocation) {
                        if (!newUserInfo.CustomFields) {
                            newUserInfo.CustomFields = [];
                        }

                        newUserInfo.CustomFields.push({
                            Code: userPreferredLocationDefinition.Code,
                            Values: [userPreferredLocation],
                            DataFieldType: 'string'
                        });
                    }
                }
            }
        }

        this.CustomFields.forEach((customField) => {
            if (customField.DataInputType === "datetime") {
                delete customField.DateValue;
                delete customField.TimeValue;
            }
        });

        if (newUserInfo.CustomFields) {
            if (this.CustomFields && this.CustomFields.length > 0) {
                const myArrayFiltered = this.CustomFields.filter((el) => {
                    return newUserInfo.CustomFields.some((f) => {
                        return f.Code !== el.Code;
                    });
                });
                newUserInfo.CustomFields = [...myArrayFiltered, ...newUserInfo.CustomFields];
            }
            //newUserInfo.CustomFields = [...newUserInfo.CustomFields, ...this.CustomFields];
        }
        else {
            newUserInfo.CustomFields = this.CustomFields;    
        }

        self.props.updateUserInfo(newUserInfo, (error) => {
            self.showMessage(error);
            return false;
        });
    }

    getSellerLocation() {
        var self = this;
        var customField = '';
        if (this.props.componentType == 'merchant') {
            if (self.props.user.CustomFields && self.props.user.CustomFields.length > 0) {
                self.props.user.CustomFields.map(function (cf) {
                    if (cf.Name == 'user_seller_location') {
                        customField =  cf.Values[0];
                    }
                });
            }
        }
        return customField;
    }

    renderOpenId() {
        if (this.props.userLogins != null) {
            const firstOpenId = this.props.userLogins[0];
            if (firstOpenId.LoginProvider.startsWith('Facebook')) {
                return (<span> <i className='fa fa-facebook-square' /> </span>);
            } else if (firstOpenId.LoginProvider.startsWith('Google')) {
                return (<span> <i className='fa fa-google-square' /> </span>);
            } else if (firstOpenId.LoginProvider.startsWith('Arcadier')) {
                return (<span> <i className='fa fa-arcadier-square' /> </span>);
            }
        }
        return '';
    }

    isNumber(e) {
        if (!e.clipboardData) {
            var charCode = (e.which) ? e.which : e.keyCode;
            if ((charCode < 48 || charCode > 57)) {
                e.preventDefault();
            }

            return;
        }

        e.target.value = e.clipboardData.getData('text').replace(/[^\x20-\xFF]/gi, '').replace(/[^0-9]/g, '');
        e.preventDefault();
    }

    isMerchant() {
        if (this.props.user.Roles) {
            const temp = this.props.user.Roles.filter(x => x.toLowerCase() === 'merchant' || x.toLowerCase() === 'submerchant');
            if (temp.length > 0) return true;

        }
        return false;
    }

    createCustomFieldComponent(dataInputType, customFieldDefinition, customFieldValues) {
        const commonProps = {
            customFieldDefinition: customFieldDefinition,
            customFieldValues: customFieldValues,
        };

        const permissionProps = {
            pagePermissions: this.props.pagePermissions,
            permissionPageType: this.permissionPageType,
            validatePermissionToPerformAction: this.props.validatePermissionToPerformAction
        };

        switch (dataInputType) {
            case 'textfield':
                return <TextComponent {...commonProps} onCustomValueChanged={this.onCustomValueChanged} />;
            case 'dropdown':
                return <DropdownComponent {...commonProps} onCustomValueChanged={this.onCustomValueChanged} />;
            case 'checkbox':
                return <CheckboxComponent {...commonProps} onCustomCheckboxChanged={this.onCustomCheckboxChanged} />;
            case 'upload':
                return <PdfComponent {...commonProps}
                    {...permissionProps}
                    onCustomFileChanged={this.onCustomFileChanged} />;
            case 'datetime':
                return <DateComponent {...commonProps} onCustomDateChanged={this.onCustomDateChanged} />;
            case 'image':
                return <ImageComponent {...commonProps}
                    {...permissionProps}
                    onCustomFileChanged={this.onCustomFileChanged} />;
            case 'hyperlink / URL':
                return <HyperlinkComponent {...commonProps} onCustomValueChanged={this.onCustomValueChanged} />;
            default:
                return null;
        }
    }

    generateTempId() {
        var str = Math.random().toString();
        var n = str.lastIndexOf(".");
        str = str.substring(n + 1, str.length - n);
        return str;
    }

    onCustomDateChanged(customFieldDef, value, isDate) {
        if (customFieldDef && value) {
            if (this.CustomFields) {
                let customField = (this.CustomFields && this.CustomFields.length > 0) ? this.CustomFields.find(f => (f.Code === customFieldDef.Code)) : null;
                if (customField) {
                    if (customField.Values && customField.Values.length > 0) {
                        customField.DateValue = Moment.unix(customField.Values[0]).utc().local().format('DD/MM/YYYY');
                        customField.TimeValue = Moment.unix(customField.Values[0]).utc().local().format('hh:mm A');
                    }
                    if (isDate) {
                        customField.DateValue = value;
                    }
                    else {
                        customField.TimeValue = value;
                    }
                    if (customField.DateValue && customField.TimeValue) {
                        customField.Values = [];
                        var strDate = `${customField.DateValue} ${customField.TimeValue}`;
                        var newDate = Moment(strDate, "DD/MM/YYYY hh:mm A").unix();
                        customField.Values.push(newDate);
                    }
                }
                else {
                    customField = {
                        Code: customFieldDef.Code,
                        DataInputType: customFieldDef.DataInputType,
                        DataFieldType: customFieldDef.DataFieldType,
                        IsComparable: customFieldDef.IsComparable,
                        Name: customFieldDef.Name,
                        Values: []
                    };
                    if (isDate) {
                        customField.DateValue = value;
                    }
                    else {
                        customField.TimeValue = value;
                    }
                    if (customField.DateValue && customField.TimeValue) {
                        customField.Values = [];
                        var strDate = `${customField.DateValue} ${customField.TimeValue}`;
                        var newDate = Moment(strDate, "DD/MM/YYYY hh:mm A").unix();
                        customField.Values.push(newDate);
                    }
                    this.CustomFields.push(customField);
                }
            }            
        }
    }

    onCustomFileChanged(customFieldDefinition, value, fileName) {
        if (customFieldDefinition && value) {
            let customField = (this.CustomFields && this.CustomFields.length > 0) ? this.CustomFields.find(f => (f.Code === customFieldDefinition.Code)) : null;
            if (customField) {
                customField.Filename = fileName;
                customField.File = value;
                customField.DataInputType = customFieldDefinition.DataInputType;
            }
            else {
                customField = {
                    Code: customFieldDefinition.Code,
                    DataInputType: customFieldDefinition.DataInputType,
                    DataFieldType: customFieldDefinition.DataFieldType,
                    IsComparable: customFieldDefinition.IsComparable,
                    Name: customFieldDefinition.Name,
                    Values: [],
                    File: value,
                    Filename: fileName
                };
                this.CustomFields.push(customField);
            }
        }
    }

    onCustomCheckboxChanged(customFieldDefinition, name, isCheck) {
        if (customFieldDefinition.Code && name) {
            let customField = (this.CustomFields && this.CustomFields.length > 0) ? this.CustomFields.find(f => (f.Code === customFieldDefinition.Code)) : null;
            if (customField) {
                if (isCheck) {
                    customField.Values.push(name);
                }
                else {
                    customField.Values = customField.Values.filter(r => r != name);
                }
            }
            else {
                if (isCheck) {
                    customField = {
                        Code: customFieldDefinition.Code,
                        DataFieldType: customFieldDefinition.DataFieldType,
                        IsComparable: customFieldDefinition.IsComparable,
                        Name: customFieldDefinition.Name,
                        Values: [name]
                    };
                    this.CustomFields.push(customField);
                }
            }
        }
    }

    onCustomValueChanged(customFieldDefinition, value) {
        if (customFieldDefinition && value) {
            let customField = (this.CustomFields && this.CustomFields.length > 0) ? this.CustomFields.find(f => (f.Code === customFieldDefinition.Code)) : null;
            if (customField) {
                customField.Values = [];
                customField.Values.push(value);
            }
            else {
                customField = {
                    Code: customFieldDefinition.Code,
                    DataFieldType: customFieldDefinition.DataFieldType,
                    IsComparable: customFieldDefinition.IsComparable,
                    Name: customFieldDefinition.Name,
                    Values: []
                };
                customField.Values.push(value);
                this.CustomFields.push(customField);
            }
        }
    }

    showProfileImagePopup(e) {
        const self = this;
        const target = e.target;

        this.props.validatePermissionToPerformAction(`edit-${this.permissionPageType}-profile-api`, () => {
            var img = $(target).find('img');
            self.xcropImagePopup(null, img, 500, 500);
        });
    }

    cropProfileImage() {
        const self = this;

        this.props.validatePermissionToPerformAction(`edit-${this.permissionPageType}-profile-api`, () => {
            var src = self.CanvasCrop.getDataURL("jpeg");
            var tv = jQuery('#upload-file').val();
            if (jQuery.trim(tv) != '') {
                if (self.ximg_crop.is('img')) {
                    self.ximg_crop.attr('src', src);
                } else {
                    self.ximg_crop.css('background-image', src);
                }
            }

            self.uploadProfileImage({ Base64Data: src, OriginalName: self.fileOriginalName });
        });
    }

    renderUserCustomField() {
        const { customFieldDefinition } = this.props;
        const { CustomFields } = this.props.user;
        
        if (customFieldDefinition && customFieldDefinition.length > 0) {
            let groupNames = [];
            if (this.isMerchant()) {
                groupNames = ["ConsumerMerchant", "Merchant"]
            }
            else {
                groupNames = ["ConsumerMerchant", "Consumer"]
            }
            const userCustomFieldDefinitions = customFieldDefinition.filter(f => groupNames.includes(f.GroupName));
            let containerList = [];
            let keyCtr = 0;
            for (let customFieldCtr = 0; customFieldCtr < userCustomFieldDefinitions.length; customFieldCtr++) {
                let currentCustomFieldDef = userCustomFieldDefinitions[customFieldCtr];
                let currentCustomFieldValue = null;
                if (CustomFields) {
                    currentCustomFieldValue = CustomFields.find(f => (f.Code === currentCustomFieldDef.Code));
                }
                let nextCustomFieldDef = null;
                let nextCustomFieldValue = null;
                if (customFieldCtr + 1 < userCustomFieldDefinitions.length) {
                    nextCustomFieldDef = userCustomFieldDefinitions[customFieldCtr + 1];
                    if (CustomFields) {
                        nextCustomFieldValue = CustomFields.find(f => (f.Code === nextCustomFieldDef.Code));
                    }                    
                }
                
                if (!nextCustomFieldDef) {
                    containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(currentCustomFieldDef.DataInputType, currentCustomFieldDef, currentCustomFieldValue)]} />);
                    break;
                }
                else {                           
                    if (currentCustomFieldDef.DataInputType === "datetime" || nextCustomFieldDef.DataInputType === "datetime") {
                        if (currentCustomFieldDef.DataFieldType === "datetime") {
                            containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(currentCustomFieldDef.DataInputType, currentCustomFieldDef, currentCustomFieldValue)]} />);
                            continue;
                        }
                        else {
                            if (nextCustomFieldDef.DataFieldType === "datetime") {
                                containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(currentCustomFieldDef.DataInputType, currentCustomFieldDef, currentCustomFieldValue)]} />);
                                continue;
                            }
                        }                        
                    }
                    else if (currentCustomFieldDef.DataInputType === "checkbox" || nextCustomFieldDef.DataInputType === "checkbox") {
                        if (currentCustomFieldDef.DataInputType === "checkbox" && nextCustomFieldDef.DataInputType !== "checkbox") {
                            containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(currentCustomFieldDef.DataInputType, currentCustomFieldDef, currentCustomFieldValue)]} />);
                            continue;
                        }
                        if (currentCustomFieldDef.DataInputType !== "checkbox" && nextCustomFieldDef.DataInputType === "checkbox") {
                            containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(currentCustomFieldDef.DataInputType, currentCustomFieldDef, currentCustomFieldValue)]} />);
                            continue;
                        }
                        if (currentCustomFieldDef.DataInputType === "checkbox" && nextCustomFieldDef.DataInputType === "checkbox") {
                            containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(currentCustomFieldDef.DataInputType, currentCustomFieldDef, currentCustomFieldValue)]} />);
                            containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(nextCustomFieldDef.DataInputType, nextCustomFieldDef, nextCustomFieldValue)]} />);
                            customFieldCtr++;
                            continue;
                        }
                    }
                    else {
                        containerList.push(<InputContainerComponent key={`InputContainer${++keyCtr}`} components={[this.createCustomFieldComponent(currentCustomFieldDef.DataInputType, currentCustomFieldDef, currentCustomFieldValue), this.createCustomFieldComponent(nextCustomFieldDef.DataInputType, nextCustomFieldDef, nextCustomFieldValue)]} />);
                        customFieldCtr++;
                        continue;
                    }
                }
            }
            return (
                containerList.map((c) => (c))
            )
        }
        return null;
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div id='myModal' className='modal-image-cropsec modal fade' role='dialog'>
                    <div className='modal-dialog'>
                        <button type='button' className='close' data-dismiss='modal' aria-label='Close'> <span aria-hidden='true'>&times;</span> </button>
                        <div className='modal-content'>
                            <div className='imageBox'>
                                <div className='thumbBox'></div>
                            </div>
                            <div className='upload-wapper'> Upload Item
                            <input type='file' id='upload-file' accept='image/*' />
                            </div>
                            <div className='tools clearfix hide'>
                                <div className='btn btn-default' title='rotate-left' id='rotateLeft'> <i className='fa fa-rotate-left' style={{ fontSize: '12px' }}></i> </div>
                                <div className='btn btn-default' title='rotate-right' id='rotateRight'> <i className='fa fa-rotate-right' style={{ fontSize: '12px' }}></i> </div>
                                <div className='btn btn-danger btn-cancel' title='Cancel' id='alertInfo'> <i className='glyphicon glyphicon-remove'></i> </div>
                                <div className='btn btn-success btn-ok' title='Crop' id='crop' data-dismiss='modal' aria-label='Close' onClick={(e) => this.cropProfileImage()}> <i className='glyphicon glyphicon-ok'></i> </div>
                                <input className='cr-slider ' id='my-range' type='range' step='0.001' aria-label='zoom' min='0.5' max='3.5000' />
                            </div>
                        </div>
                    </div>
                </div>
                <div id='Profile' className='tab-pane fade in active'>
                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                        <div className='profile-img' onClick={(e) => this.showProfileImagePopup(e)}>
                            <img src={this.state.MediaUrl} className="media-url-container" />
                            <button className='btn-change'>Change</button>
                        </div>
                    </PermissionTooltip>
                    <div className='set-content'>
                        <div className='pdc-inputs'>
                            <div className='set-inputs'>
                                <div className='input-container'> <span className='title'>Display Name</span>
                                    <input type='text' className='input-text required' name='display_name' placeholder='Enter your display name' onChange={(e) => self.onChange(e)} defaultValue={this.props.user.DisplayName} data-react-state-name='DisplayName' />
                                </div>
                                <div className='input-container'> <span className='title'>Open ID</span>
                                    <div className='open-id'>{self.renderOpenId()}</div>
                                </div>
                            </div>
                            <div className={self.props.componentType != 'merchant' ? 'set-inputs hide' : 'set-inputs'}>
                                <div className='user-setting-textarea'> <span className='title'>Description</span>
                                    <textarea maxLength="1500" className='input-text descripton-textbox' onChange={(e) => self.onChange(e)} defaultValue={this.props.user.Description} data-react-state-name='Description' />
                                </div>
                            </div>
                            <div className='set-inputs'>
                                <div className='input-container'> <span className='title'>First Name</span>
                                    <input type='text' className='input-text required' name='first_name' placeholder='First Name' onChange={(e) => self.onChange(e)} defaultValue={this.props.user.FirstName} data-react-state-name='FirstName' />
                                </div>
                                <div className='input-container'> <span className='title'>Last Name</span>
                                    <input type='text' className='input-text required' name='last_name' placeholder='Last Name' onChange={(e) => self.onChange(e)} defaultValue={this.props.user.LastName} data-react-state-name='LastName' />
                                </div>
                            </div>
                            <div className='set-inputs'>
                                <div className='input-container'> <span className='title'>Email</span>
                                    <input type='email' className='input-text required emailOnly user-email' name='email' placeholder='Email' onChange={(e) => self.onChange(e)} defaultValue={this.props.user.Email} data-react-state-name='Email' />
                                </div>
                                <div className='input-container'> <span className='title'>Contact No.</span>
                                    <input type='text' className='input-text required' name='contact' placeholder='Phone Number' onChange={(e) => self.onChange(e)} defaultValue={this.props.user.PhoneNumber} data-react-state-name='PhoneNumber' onKeyPress={(e) => this.isNumber(e)} onPaste={(e) => this.isNumber(e)} />
                                </div>
                            </div>
                            <div className='set-inputs'>
                                <UserPreferredLocationComponent
                                    ref={(ref) => this.userPreferredLocationComponent = ref}
                                    customFieldDefinition={this.props.customFieldDefinition}
                                    userCustomFields={this.props.user.CustomFields}
                                    getLocations={this.props.getLocations}
                                    createCustomFieldDefinition={this.props.createCustomFieldDefinition} />
                                <div className={self.props.componentType != 'merchant' ? 'input-container hide' : 'input-container' }>
                                    <span className='title'>Seller Location</span>
                                    <input type='email' className='input-text seller-location-textbox' name='seller-location' placeholder='' onChange={(e) => self.onChange(e)} defaultValue={self.sellerLocation} data-react-state-name='sellerLocation' />
                                </div>
                            </div>
                            <hr style={{ marginTop: "0px", borderTop: "2px solid #ddd" }} />
                            {this.renderUserCustomField()}                            
                        </div>
                    </div>
                    <div className='settings-button'>
                        <div className='btn-next pull-right profile-next' onClick={(e) => self.gotoNextTab(e)}>Next</div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = ProfileSettingsComponent;
