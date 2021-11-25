var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');

class CheckboxComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.state = {
            css: 'd-flex-column parent-checkbox'
        };        
    }

    onChange(e) {
        this.props.onCustomCheckboxChanged(this.props.customFieldDefinition, e.target.getAttribute('data-name'), e.target.checked);
    }

    componentDidMount() {
        if (this.props.customFieldDefinition.IsMandatory) {
            this.setState({
                css: 'd-flex-column parent-checkbox required'
            });
        }
    }

    render() {
        return (
            <div className="input--container">
                <span className="checkbox">{this.props.customFieldDefinition.Name}</span>
                <div className={this.state.css}>
                    {
                        this.props.customFieldDefinition.Options && 
                        (
                            this.props.customFieldDefinition.Options.map((opt) => {
                                const key = `${this.props.customFieldDefinition.Code}-${opt.Name}`;
                                let isChecked = false;
                                if (this.props.customFieldValues && this.props.customFieldValues.Values) {
                                    const opts = this.props.customFieldValues.Values.find(f => (f == opt.Name));
                                    if (opts) {
                                        isChecked = true;
                                    }
                                }
                                return (
                                    <div key={key} className="fancy-checkbox checkbox-sm">
                                        <input type="checkbox" id={key} name={key} data-name={opt.Name} onChange={this.onChange} defaultChecked={isChecked} />
                                        <label htmlFor={key}>{opt.Name}</label>
                                    </div>
                                )
                            })
                        )
                    }
                </div>
            </div>
        )
    }
}

module.exports = CheckboxComponent;