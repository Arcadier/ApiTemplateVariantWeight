var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');

class DropdownComponent extends BaseClassComponent {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.props.onCustomValueChanged(this.props.customFieldDefinition, e.target.value);
    }
    render() {
        let ddValue = "";
        if (this.props.customFieldValues && this.props.customFieldValues.Values) {
            ddValue = this.props.customFieldValues.Values[0];            
        }
        this.props.onCustomValueChanged(this.props.customFieldDefinition, ddValue ? ddValue :  this.props.customFieldDefinition.Options[0].Name);
        return (
            <div className="input-container">
                <span className="dropdown">{this.props.customFieldDefinition.Name}</span>
                <span className="select-option">
                    <select name="country" className="get-text required" onChange={this.onChange} defaultValue={ddValue} >
                        {
                            this.props.customFieldDefinition.Options && 
                            (
                                this.props.customFieldDefinition.Options.map((opt) => {
                                    const key = `${opt.Name}-${this.props.customFieldDefinition.Code}`;
                                    return (
                                        <option key={key} value={opt.Name}>{opt.Name}</option>
                                    )
                                })
                            )
                        }                        
                    </select>
                </span>
            </div>
        )
    }
}

module.exports = DropdownComponent;