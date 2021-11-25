'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

class ModalDeleteUserComponent extends BaseComponent {
    cancelDelete() {
        this.props.setUserToDelete(null);
    }

    confirmDelete() {
        this.props.deleteUser();
    }

    componentDidUpdate() {
        if (this.props.userToDelete) {
            $('.item-remove-popup').fadeIn();
            $('#cover').fadeIn();
        } else {
            $('.item-remove-popup').fadeOut();
            $('#cover').fadeOut();
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="popup-area item-remove-popup" style={{ display: 'none' }}>
                    <div className="wrapper">
                        <div className="title-area text-capitalize">
                            <h1>REMOVE ACCOUNT</h1>
                        </div>
                        <div className="content-area">
                            <p>You sure about removing this Account from your list?</p>
                            <p>(It'll be gone forever!)</p>
                        </div>
                        <div className="btn-area">
                            <div className="pull-left">
                                <input type="button" defaultValue="CANCEL" className="my-btn btn-black cancel_remove" onClick={(e) => this.cancelDelete()} />
                            </div>
                            <div className="pull-right">
                                <input data-key="item" data-id="" type="button" defaultValue="Okay" className="my-btn btn-saffron confirm_remove" onClick={(e) => this.confirmDelete()} />
                            </div>
                            <div className="clearfix" />
                        </div>
                    </div>
                </div>
                <div id="cover"></div>
            </React.Fragment>
        );
    }
}

module.exports = ModalDeleteUserComponent;