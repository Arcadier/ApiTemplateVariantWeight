'use strict';
var React = require('react');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var BaseComponent = require('../../../shared/base');

class ModalDeleteComponent extends BaseComponent {

    componentDidUpdate() {
        if (this.props.itemToDelete) {
            $('.popup-area.item-remove-popup').fadeIn();
            $('#cover').fadeIn();
        } else {
            $('.popup-area.item-remove-popup').fadeOut();
            $('#cover').fadeOut();
        }
    }

    cancelDelete() {
        this.props.setItemToDelete(null);
    }

    deleteItem() {
        this.props.deleteItem();
    }

    render() {
        return (
            <React.Fragment>
                <div className="popup-area item-remove-popup" style={{ display: 'none' }}>
                    <div className="wrapper">
                        <div className="title-area text-capitalize">
                            <h1>REMOVE ITEM</h1>
                        </div>
                        <div className="content-area">
                            <p>You sure about removing this item from your list? (It'll be gone forever!)</p>
                        </div>
                        <div className="btn-area">
                            <div className="pull-left">
                                <input type="button" defaultValue="CANCEL" className="my-btn btn-black cancel_remove" onClick={(e) => this.cancelDelete()} />
                            </div>
                            <div className="pull-right">
                                <input data-key="item" data-id={1} type="button" defaultValue="Okay" className="my-btn btn-saffron confirm_remove" onClick={(e) => this.deleteItem()} />
                            </div>
                            <div className="clearfix" />
                        </div>
                    </div>
                </div>
                <div id="cover" style={{ display: 'none' }}></div>
            </React.Fragment>
        );
    }
}

module.exports = ModalDeleteComponent;