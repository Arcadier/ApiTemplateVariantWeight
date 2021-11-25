'use strict';

const React = require('react');

if (typeof window !== 'undefined') { var $ = window.$; }

class DeleteDepartmentModal extends React.Component {

	hideModal() {
		const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");
        target.fadeOut();
        cover.fadeOut();
        $(".my-btn.btn-saffron").attr('data-id', '');

	}

	handleDeleteDepartment() {
		const self = this;
		const rowID = $(".my-btn.btn-saffron").attr('data-id');
		if (rowID !== null) this.props.deleteApprovalDepartment(rowID, self.hideModal());
	}

	render() {
		return (
			<div className="popup-area item-remove-popup">
		        <div className="wrapper">
		            <div className="title-area text-capitalize">
		                <h1>REMOVE ITEM</h1>
		            </div>
		            <div className="content-area">
		                <p>You sure about removing this item from your list?</p>
		                <p>(It'll be gone forever!)</p>
		            </div>
		            <div className="btn-area">
		                <div className="pull-left">
		                    <input type="button" value="CANCEL" className="my-btn btn-black cancel_remove" onClick={() => this.hideModal()} />
		                </div>
		                <div className="pull-right">
		                    <input 
		                    	data-key=""
		                    	data-id=""
		                    	type="button"
		                    	value="Okay"
		                    	className="my-btn btn-saffron confirm_remove" 
		                    	onClick={() => this.handleDeleteDepartment()} 
		                    />
		                </div>
		                <div className="clearfix" />
		            </div>		        
		        </div>
		    </div>
		);
	}
}

module.exports = DeleteDepartmentModal;