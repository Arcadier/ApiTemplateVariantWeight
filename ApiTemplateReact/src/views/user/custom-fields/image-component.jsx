var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
const PermissionTooltip = require('../../common/permission-tooltip');

class ImageComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        let src = '/assets/images/img-placeholder.png';
        if (props.customFieldValues && props.customFieldValues.Values && props.customFieldValues.Values.length > 0 && props.customFieldValues.Values[0]) {
            src = props.customFieldValues.Values[0];
        }
        this.state = {
            fileName: '',
            src: src
        }
        this.onImageChange = this.onImageChange.bind(this);
    }

    componentDidMount() {
        const self = this;

        $('.image-upload').on('click', function (e, isValidated) {
            e.stopPropagation();

            if (!isValidated) {
                e.preventDefault();
                self.validatePermissionOnClick($(this).data('image'));
                return;
            }

            return true;
        });
    }

    validatePermissionOnClick(code) {
        this.props.validatePermissionToPerformAction(`edit-${this.props.permissionPageType}-profile-api`, () => {
            $('#image-' + code).trigger('click', true);
        });
    }

    onImageChange(e) {
        const self = this;
        let files = e.target.files;

        this.props.validatePermissionToPerformAction(`edit-${this.props.permissionPageType}-profile-api`, () => {
            self.setState({
                fileName: files[0].name
            }, () => {
                let reader = new FileReader();
                reader.onload = r => {
                    self.props.onCustomFileChanged(self.props.customFieldDefinition, r.target.result, self.state.fileName);
                    self.setState({
                        src: r.target.result
                    });
                };
                reader.readAsDataURL(files[0]);
            });
        });
    }

    render() {
        let css = "input-upload ";
        if (this.props.customFieldDefinition.IsMandatory) {
            css += "required";
        }
        return (
            <div className="input-container">
                <div className={css}>
                    <span className="custom-image">{this.props.customFieldDefinition.Name}</span>
                    <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                        <div className="input-flex">
                            <input type="text" className="input-text custom-image-text isImage" name="custom_image" placeholder="Browse..." value={this.state.fileName} />
                            <div className="btn-upload btn" style={{ borderRadius: "0px" }}>
                                <input id={'image-' + this.props.customFieldDefinition.Code}
                                    data-image={this.props.customFieldDefinition.Code}
                                    class='image-upload'
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => this.onImageChange(e)} />
                                    Upload
                            </div>
                        </div>
                    </PermissionTooltip>
                    <div><img src={this.state.src} className="img-responsive imgpreview" /></div>
                </div>
            </div>
        )
    }
}

module.exports = ImageComponent;