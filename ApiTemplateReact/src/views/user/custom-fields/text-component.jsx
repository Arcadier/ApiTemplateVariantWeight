var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');

class TextComponent extends BaseClassComponent {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.props.onCustomValueChanged(this.props.customFieldDefinition, e.currentTarget.value);
    }

    render() {
        console.log('text', this.props);
        let txtValue = '';
        if (this.props.customFieldValues && this.props.customFieldValues.Values) {
            txtValue = this.props.customFieldValues.Values[0];
        }
        let css = "input-text ";
        if (this.props.customFieldDefinition.IsMandatory) {
            css += "required";
        }
        return (
            <div className="input-container"> <span className="additional-one">{this.props.customFieldDefinition.Name}</span>
                <input type="text" className={css} name="additional-one" placeholder="" onChange={this.onChange} defaultValue={txtValue} />
            </div>
        )
    }
}

module.exports = TextComponent;