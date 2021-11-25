var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
const PermissionTooltip = require('../../common/permission-tooltip');

class PdfComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        let fileName = '';
        if (props.customFieldValues && props.customFieldValues.Values && props.customFieldValues.Values.length > 0) {
            fileName = props.customFieldValues.Values[0].split('/').pop().substr(47);
        }
        this.state = {
            fileName: fileName
        };

        this.onPDFChange = this.onPDFChange.bind(this);
    }

    componentDidMount() {
        const self = this;

        $('.pdf-upload').on('click', function (e, isValidated) {
            e.stopPropagation();

            if (!isValidated) {
                e.preventDefault();
                self.validatePermissionOnClick($(this).data('pdf'));
                return;
            }

            return true;
        });
    }

    onPDFChange(e) {
        const self = this;
        let files = e.target.files;

        this.props.validatePermissionToPerformAction(`edit-${this.props.permissionPageType}-profile-api`, () => {
            self.setState({
                fileName: files[0].name
            }, () => {
                let reader = new FileReader();
                reader.onload = r => {
                    self.props.onCustomFileChanged(self.props.customFieldDefinition, r.target.result, self.state.fileName);
                };
                reader.readAsDataURL(files[0]);
            });
        });
    }

    validatePermissionOnClick(code) {
        this.props.validatePermissionToPerformAction(`edit-${this.props.permissionPageType}-profile-api`, () => {
            $('#pdf-' + code).trigger('click', true);
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
                            <input type="text" className="input-text custom-image-text isPdf" name="custom_image" placeholder="Browse..." value={this.state.fileName} />
                            <div className="btn-upload btn" style={{ borderRadius: "0px" }}>
                                <input id={'pdf-' + this.props.customFieldDefinition.Code}
                                    data-pdf={this.props.customFieldDefinition.Code}
                                    class='pdf-upload'
                                    type="file" accept="application/pdf"
                                    onChange={(e) => this.onPDFChange(e)} />
                                Upload
                            </div>
                        </div>
                    </PermissionTooltip>
                </div>
            </div>
        )
    }
}

module.exports = PdfComponent;