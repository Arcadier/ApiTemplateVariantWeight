'use strict';
var React = require('react');

class ModalStatusChangeComponent extends React.Component {
    render() {
        return (
            <div className="popup-area order-itemstatus-popup">
                <div className="wrapper">
                    <div className="title-area text-capitalize">
                        <h1 className="text-center">STATUS CHANGED</h1>
                    </div>
                    <div className="content-area text-center">
                        <p>The order status for this item has been updated.</p>
                    </div>
                    <div className="btn-area text-center">
                        <input data-key data-id type="button" defaultValue="Okay" className="my-btn btn-saffron" onClick={(e) => this.props.showHideSuccessMessage(false)} />
                        <div className="clearfix" />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ModalStatusChangeComponent;