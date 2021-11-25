'use strict';

const React = require('react');

if (typeof window !== 'undefined') { var $ = window.$; }

class DeleteWorkflowModal extends React.Component {

	hideModal() {
		const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");
        target.fadeOut();
        cover.fadeOut();
        $(".my-btn.btn-saffron").attr('data-id', '');

	}

	handleDeleteWorkflow() {
		const self = this;
		const rowID = $(".my-btn.btn-saffron").attr('data-id');
		if (rowID !== null) this.props.deleteWorkflow(rowID, self.hideModal());
	}

	closeNotApprovedPromp() {
		const target = $(".popup-area.item-not-approved-popup");
        const cover = $("#cover");
        target.fadeOut();
        cover.fadeOut();
	}

	render() {
		return (
			<React.Fragment >
				<div className="popup-area item-remove-popup">
			        <div className="wrapper">
			            <div className="title-area text-capitalize">
			                <h1>Remove Workflow</h1>
			            </div>
			            <div className="content-area">
			                <p>You sure about removing this workflow from your list?</p>
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
			                    	onClick={() => this.handleDeleteWorkflow()} 
			                    />
			                </div>
			                <div className="clearfix" />
			            </div>		        
			        </div>
			    </div>
			    <div className="popup-area item-not-approved-popup">
			        <div className="wrapper">
			            <div className="content-area">
			                <p>Unable to delete. <br />There is currently an open requisition order that is using this workflow.</p>
			            </div>
			            <div className="btn-area">
			                <div className="text-center">
			                    <input type="button" value="Close" className="my-btn btn-black cancel_remove_not_allowed" onClick={this.closeNotApprovedPromp} />
			                </div>
			            </div>
			        </div>
			    </div>
			</React.Fragment>
		);
	}
}

module.exports = DeleteWorkflowModal;