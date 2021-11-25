var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');

class InputContainerComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="set-inputs">
                {this.props.components.map((c) => {
                    return (
                        c
                    )
                })}
            </div>
        )
    }
}

module.exports = InputContainerComponent;