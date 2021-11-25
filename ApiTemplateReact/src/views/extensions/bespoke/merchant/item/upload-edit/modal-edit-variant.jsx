'use strict';
var React = require('react');
var BaseComponent = require('../../../../../shared/base');

class ModalEditVariantComponent extends BaseComponent {
    componentDidUpdate() {
        const { selectedVariant } = this.props;

        if (selectedVariant) {
            $('.popup-tag-update').fadeIn();
        } else {
            $('.popup-tag-update').fadeOut();
        }
    }

    closeModal(e) {
        e.preventDefault();
        this.props.updateSelectedVariant();
    }

    updateSelectedVariant(e, isSubmit) {
        e.preventDefault();

        const { selectedVariant } = this.props;
        let name = '';

        if (isSubmit) {
            name = null;
        } else {
            name = e.target.value;
        }

        this.props.updateSelectedVariant(null, name, isSubmit);
    }

    render() {
        const { selectedVariant } = this.props;

        return (
            <div style={{ display: 'none' }} className="popup-tag-update">
                <div className="popup-wrapper">
                    <h4>Change</h4>
                    <input id="" type="text" className="form-control" value={selectedVariant ? selectedVariant.name : ''} onChange={(e) => this.updateSelectedVariant(e, false)}/>
                    <div className="popup-btn text-right">
                        <a href="#" onClick={(e) => this.closeModal(e)} className="btn btn-default">Cancel</a>
                        <a href="#" onClick={(e) => this.updateSelectedVariant(e, true)} className="btn btn-okay btn-black">Okay</a>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalEditVariantComponent;