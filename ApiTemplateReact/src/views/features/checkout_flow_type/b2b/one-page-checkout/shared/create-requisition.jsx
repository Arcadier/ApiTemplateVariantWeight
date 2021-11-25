'use strict';
const React = require('react');

class CreateRequisitionComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedDepartmentID: null,
            selectedWorkflowID: null,
            amountExceedsWorkflow: false,
		};
	}

	componentDidMount() {
		$("#department-reason").prop("disabled", true);
	}
	
	renderDepartmentOptions() {
		const { departments } = this.props;
		if (departments && departments.TotalRecords > 0 && departments.Records) {
			return departments.Records.map(department => 
				<option 
					value={department.Id}
					key={department.Id} 
					data-id={department.Id} 
					data-workflow-id={department.WorkflowID}
				>
					{department.Name}
				</option>
			);
		}
		return;
	}

	renderReasonOptions() {
		const { workflows } = this.props;
        const { selectedDepartmentID } = this.state;
		if (workflows && workflows.TotalRecords > 0 && selectedDepartmentID && selectedDepartmentID !== "") {
            const workflowIDStr = $(`#department-select option[data-id=${selectedDepartmentID}]`).data('workflow-id') || '';
            const workflowArr = workflowIDStr.split(',');
            let workflowOpts = [];
            if (workflowArr && workflowArr.length > 0) {
                workflowOpts = workflowArr.map(wf => workflows.Records.find(w => w.Id == wf))
                workflowOpts = workflowOpts.filter(w => typeof w !== 'undefined' && w !== null && w.Active == 1);
            }
            return (<React.Fragment>
                <option value="">Select Reason </option>
                {workflowOpts.map(workflow => <option key={workflow.Id} value={workflow.Id} data-values={workflow.Values}>{workflow.Reason}</option>)}
            </React.Fragment>)
		}
        return (<option value=""></option>);
	}

    handleDepartmentChange(e) {
        $("#department-reason").prop("disabled", true);
        this.setState({ selectedDepartmentID: e.target.value });
		if (e.target.value !== "") $("#department-reason").prop("disabled", false);
        this.validateWorkflowAmount(null);
	}

    validateWorkflowAmount(selectedId) {
        let isAmountExceeding = false;
        const { workflows } = this.props;
        this.setState({ selectedWorkflowID: selectedId });
        if (workflows && workflows.TotalRecords > 0 && selectedId !== null && selectedId !== '') {
            const workflow = workflows.Records.find(i => i.Id == selectedId);
            if (workflow && typeof workflow !== 'undefined' && workflow.Values) {
                let parsedValues = JSON.parse(workflow.Values);
                const { MaximumPurchase } = parsedValues[parsedValues.length - 1];
                const totalCost = $(".item-price.totalCost").data('grand-total');
                if (MaximumPurchase && parseFloat(MaximumPurchase.Amount) < parseFloat(totalCost) && MaximumPurchase.Unlimited == false) {
                    isAmountExceeding = true;
                }
            }
        }
        this.setState({ amountExceedsWorkflow: isAmountExceeding });
    }

    handleReasonChange(e) {
        const selectedId = e.target.value;
        this.validateWorkflowAmount(selectedId);
    }

    getPaymentTerms() {
        if (this.props.orderDetails.PaymentTerm) {
            return `${this.props.orderDetails.PaymentTerm.Name} - ${this.props.orderDetails.PaymentTerm.Description}`;
        }
        return '';
    }

    hasNoWorkflowForOrderTotal() {
        return this.state.amountExceedsWorkflow;
    }

    getSelectedDepartmentID() {
        return this.state.selectedDepartmentID;
    }

    getSelectedWorkflowID() {
        return this.state.selectedWorkflowID;
    }

	render() {
		return (
			<React.Fragment>
				<div className="pc-content full-width requisition-information tab-container tabcontent" id="requisition-container">
                    <div className="panel-box">
                        <div className="sc-upper panel-box-title">
                            <div className="sc-u sc-u-mid full-width">
                                <div className="bl_dark">
                                    <span className="sc-text-big">
                                    	Create Requisition 
                                    	<i className="tog-icon angle2"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="panel-box-content clearfix" style={{ display: 'none' }}>
                            <div className="pcc-left pull-left pdc-inputs review">
                                <div className="flex-inline requisition-sources">
                                    <div className="requisition-options">
                                        <span className="title">Department</span>
                                        <div className="pccl-payment-method">
                                            <select id="department-select" onChange={(e) => this.handleDepartmentChange(e)}>
                                                <option value="">Select Department</option>
                                                {this.renderDepartmentOptions()}
                                            </select>
                                            <i className="fa fa-angle-down"></i>
                                        </div>
                                    </div>
                                    <div className="requisition-options">
                                        <span className="title">Reason</span>
                                        <div className="pccl-payment-method">
                                            <select id="department-reason" onChange={(e) => this.handleReasonChange(e)}>    
                                            	{this.renderReasonOptions()}
                                            </select>
                                            <i className="fa fa-angle-down"></i>
                                        </div>
                                        {
                                            this.state.amountExceedsWorkflow?
                                                <span className="department-reason-error">No available workflows for order amount, edit selected reason or choose another.</span>
                                            : ''
                                        }
                                    </div>
                                </div>
                                <div className="pc-processbar" style={{ marginTop: '10px'}}>
                                    <ul>
                                        <li className="active">
                                            <span className="icon">
                                                <i className="fa fa-check"></i>
                                            </span>
                                            <span className="pcul-text">Request</span>
                                        </li>
                                        <li className="active">
                                            <span className="pb-line"></span>
                                        </li>
                                        <li className="active">
                                            <span className="icon additional-margin-top">
                                                <i className="fa fa-check"></i>
                                            </span>
                                            <span className="pcul-text">Pending
                                            </span>
                                        </li>
                                        <li>
                                            <span className="pb-line"></span>
                                        </li>
                                        <li>
                                            <span className="icon disable"><i className="fa fa-circle"></i></span>
                                            <span className="pcul-text">Approved</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex-inline requisition-sources paymnet-scheme">
                                    <div className="requisition-options">
                                        <span className="title">Payment Terms</span>
                                        <div className="pccl-payment-method">
                                           {this.getPaymentTerms()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
			</React.Fragment>
		);
	}
}

module.exports = CreateRequisitionComponent;