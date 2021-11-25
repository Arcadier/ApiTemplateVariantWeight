'use strict';
const React = require('react');
const ReactRedux = require('react-redux');

const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const PermissionTooltip = require('../../common/permission-tooltip');

const { createApprovalDepartment, updateApprovalDepartment } = require('../../../redux/approvalActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class ApprovalDepartmentAddEditComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			departmentName: '',
		}
	}

	onDeptNameChange(e) {
		this.setState({ departmentName: e.target.value })
	}

	escapeHtml(unsafe) {
	    return unsafe
	         .replace(/&/g, "&amp;")
	         .replace(/</g, "&lt;")
	         .replace(/>/g, "&gt;")
	         .replace(/"/g, "&quot;")
	         .replace(/'/g, "&#039;");
	}

	handleCheckAll() {
        //Check all
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction('edit-consumer-create-approval-department-api', () => {
			const parentCheck = $(".advanced-select .parent-check input[type=checkbox]")
	        const $this = $(parentCheck);
	        const $ul = $this.parents('ul');

	        if ($this.is(":checked")) {
	            $ul.find('input[type=checkbox]').prop("checked", true);
	            $('.item-tags').empty();
	            $('.advanced-select .dropdown-menu li a input[type=checkbox]:checked').each(function(i, obj) {
	                const selected_val = $(obj).attr('name');
	                const selectedKey = self.escapeHtml(selected_val.replace(/\s/g, ''));
	                const dataID = $(obj).data('id');
	                $("<span>" + selected_val + "<a key=" + selectedKey + " href=" + "# data-id=" + dataID +">×</a></span>").appendTo('.item-tags');
	                $(".item-tags span a").each(function(i, obj) {
	                    if ($(obj).attr('key') === 'status_0') {
	                        $(this).parent().remove();
	                    } else {
	                    	$(obj).on("click", function () {
								const theKey = $(this).attr('key');
						        $(".advanced-select .dropdown-menu li a input[type=checkbox]:checked").each(function(i, obj) {
						            if ($(this).attr('id') === theKey) {
						                $(this).attr('id', theKey).prop("checked", false);
						            }
						        });
						        $(this).parent().remove();
	                    	});
	                    }
	                });
	            });
	        } else {
	            $ul.find('input[type=checkbox]').prop("checked", false);
	            $('.advanced-select .dropdown-menu li a input[type=checkbox]').each(function(i, obj) {
	                $('.item-tags span').remove();
	            });
	        }
        });
    	
	}

	handleQKeyUp(e) {
		const input = e.target.value;
        const filter = $.trim(input.toLowerCase());
        const div = $('.advanced-select .q').parents('.dropdown').find('.dropdown-menu');
        div.find("li:not(.skip-li)").each(function() {
            const $this = $(this).find('label');
            if ($this.text().toLowerCase().indexOf(filter) > -1) {
                $this.parents('li').show();
            } else {
                $this.parents('li').hide()
            }
        });
	}

	handleTriggerClick() {
		const trigger =  $('.advanced-select .trigger');
        if ($(trigger).parent().hasClass('open')) {
            $(trigger).parent().removeClass('open');
        } else {
            $('.advanced-select .dropdown.open').removeClass('open');
            $(trigger).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
        }
	}
	
	handleCancel() {
		this.setState({ departmentName: '' });
		$(".advanced-select .x-check.parent-check input[type=checkbox").prop('checked', false);
		this.handleCheckAll();
	}

	configCheckbox() {
        //Count
        const self = this;
        $('.advanced-select .x-check input[type=checkbox]').on('change', function() {
        	if (!self.props.isAuthorizedToEdit) return;
        	const $this = $(this);
        	self.props.validatePermissionToPerformAction('edit-consumer-create-approval-department-api', () => {
	        	const $control = $this.parents('.advanced-select');
		        const model = $control.data('model');
		        const $input = $control.find('.trigger');
		        const default_val = $input.attr('data-default');
		        const selected_val = $this.data('clicked', true).attr('name');
		        const checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;
		        const selectedKey = self.escapeHtml(selected_val.replace(/\s/g, ''));
		        const theId = $this.attr('id');
		        const dataID = $this.data('id');

		        if (checked > 0) {
		            $control.addClass('choosen');
		            $("<span>" + selected_val + "<a key=" + selectedKey + " href=" + "javascript:void(0) data-id=" + dataID + ">×</a></span>").appendTo('.item-tags');

		            $(".item-tags span a").each(function(i, obj) {
		                if ($(obj).attr('key') === 'status_0') {
		                    $(this).parent().remove();
		                } else {
		                	$(obj).on("click", function () {
								const theKey = $(this).attr('key');
						        $(".advanced-select .dropdown-menu li a input[type=checkbox]:checked").each(function(i, obj) {
						            if ($(this).attr('id') === theKey) {
						                $(this).attr('id', theKey).prop("checked", false);
						            }
						        });
						        $(this).parent().remove();
	                    	});
		                }
		            });
		        } else {
		            $input.val(default_val);
		            $control.removeClass('choosen');
		        }

		        if (!$this.is(":checked")) {
		            $(".item-tags span a").each(function(i, obj) {
		                if ($(obj).attr('key') === theId) {
		                    $(this).parent().remove();
		                }
		            });
		        	$(".advanced-select .x-check.parent-check input[type=checkbox").prop('checked', false);
				}
				
				//status_0
				const unchecked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:not(:checked)').length;
				if (unchecked > 0) {
					$('#status_0').prop("checked", false);
				}
				else {
					$('#status_0').prop("checked", true);
				}
        	});
        });

        //Count on ready
        $('.advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');

        //Prevent dropdown to close
        $('.advanced-select .dropdown').on('hide.bs.dropdown', function() {
            return false;
        });

        //Close dropdown to click outside
        $('body').on('click', function(e) {
            var $target = $(e.target);
            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });
	}

	componentDidMount() {
		this.configCheckbox();
		if (this.props.selectedDepartment && this.props.selectedDepartment.Id) {
			this.setState({ departmentName: this.props.selectedDepartment.Name });
			const { WorkflowID } = this.props.selectedDepartment;
			if (WorkflowID && WorkflowID.length > 0 && this.props.workflows && this.props.workflows.TotalRecords > 0) {
				const workflows = WorkflowID.split(',');
				workflows.map(w => {
					const exists = this.props.workflows.Records.find(p => p.Id == w);
					if (typeof exists !== 'undefined' && exists !==  null  && exists.Id) {
						//$(`.advanced-select .x-check:not(.parent-check) input[data-id=${w}]`).prop('checked', true);
						$(`.advanced-select .x-check:not(.parent-check) input[data-id=${w}]`).trigger('click');
					}
				});
				if (this.props.workflows.TotalRecords && workflows.length == this.props.workflows.TotalRecords) {
					$(".advanced-select .x-check.parent-check input[type=checkbox").prop('checked', true);
				}
				$(".item-tags span a").each(function(i, obj) {
                    if ($(obj).attr('key') === 'status_0') {
                        $(this).parent().remove();
                    } else {
                    	$(obj).on("click", function () {
							const theKey = $(this).attr('key');
					        $(".advanced-select .dropdown-menu li a input[type=checkbox]:checked").each(function(i, obj) {
					            if ($(this).attr('id') === theKey) {
					                $(this).attr('id', theKey).prop("checked", false)
					            }
					        });
					        $(this).parent().remove();
                    	});
                    }
                });
			}
		}
	}

	renderWorkflowOptions() {
		const { isAuthorizedToEdit } = this.props;       
        if (this.props.workflows && this.props.workflows.TotalRecords && this.props.workflows.TotalRecords > 0) {
        	const { Records } = this.props.workflows;
        	if (Records && Records.length > 0) {
        		return (
	        		<React.Fragment>
		        		{Records.map(workflow => 
		        			<li key={workflow.Id}>
						        	<a className="x-check" href="#">
		                        		<PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="right">
						        			<input type="checkbox" disabled={!isAuthorizedToEdit} name={workflow.Reason} id={workflow.Reason.split(' ').join('')} data-id={workflow.Id} />
						        			<label htmlFor={workflow.Reason.split(' ').join('')}>{workflow.Reason}</label>
								        </PermissionTooltip>
						        	</a>
					        </li>
		        		)}
	        		</React.Fragment>
	        	);
        	}
        }
        
        return;
	}

	validateFields() {
		let hasError = false;
		$('.form-group .required').each(function(){
			$(this).removeClass('error-con');
            if(!$.trim($(this).val()) ) {
	            $(this).addClass('error-con');
	            hasError = true;
            };

            if (!$(".item-tags").children().length > 0) {
                $(".advanced-select .trigger").addClass("error-con");
                hasError = true;
            } else {
            	$(".advanced-select .trigger").removeClass("error-con");
        	};
        });
		return hasError;
	}

	createUpdateDepartment() {
		const hasError = this.validateFields();
		if (hasError) return;

		const self = this;
		if (!this.props.isAuthorizedToAdd) return;
		this.props.validatePermissionToPerformAction('add-consumer-create-approval-department-api', () => {
			let { departmentName } = self.state;
			departmentName = departmentName.trim();	
			if (departmentName !== null && departmentName.length > 0) {
				const workflowArr = [];
				$('.item-tags span a').each(function(i, obj) {
					if ($(obj).attr('key') !== 'status_0') {
						const rowID = $(obj).data('id');
						if (rowID && rowID.length > 0) {
							workflowArr.push(rowID);
						}
					}
				});
				if (workflowArr.length > 0) {
					const workflows = workflowArr.join(',');
					const request = {
						Name: departmentName,
						WorkflowID: workflows,
						WorkflowCount: workflowArr.length,
					};
					if (self.props.selectedDepartment && self.props.selectedDepartment.Id) {
						self.props.updateApprovalDepartment(self.props.selectedDepartment.Id,request, function (result) {
							if (result.success) window.location.href = "/approval/departments";
						});
					} else {
						self.props.createApprovalDepartment(request, function (result) {
							if (result.success) window.location.href = "/approval/departments";
						});
					}
				}
			} 
		});
	}

	render() {
		const { isAuthorizedToAdd, isAuthorizedToEdit } = this.props;
        const saveBtnClass = `sassy-btn sassy-btn-bg ${isAuthorizedToAdd ? '' : 'disabled'}`;
		return (
			<React.Fragment>
				<div className="header mod" id="header-section">
					<HeaderLayoutComponent user={this.props.user} />
				</div>
				<aside className="sidebar" id="sidebar-section">
					<SidebarLayoutComponent user={this.props.user} />
				</aside>
				<div className="main-content footer_fixed">
					<div className="main">
						<div className="orderlist-container">
							<div className="container-fluid">
								<div className="sc-upper">
			                        <div className="sc-u title-sc-u sc-u-mid full-width">
			                            <div className="nav-breadcrumb">
			                                <i className="fa fa-angle-left" />
			                                <a href="/approval/departments"> Back</a>
			                            </div>
			                            <span className="sc-text-big">Create New Department</span>
			                        </div>
			                    </div>
							</div>
							<div className="sassy-box no-border">
		                        <div className="sassy-box-content border">
		                            <div className="row">
		                                <div className="col-md-5">
		                                    <div className="form-group">
		                                        <label>Department Name</label>
		                                        <input type="text" className="sassy-control required" name="department_name" value={this.state.departmentName} onChange={e => this.onDeptNameChange(e)} />
		                                    </div>
		                                </div>
		                            </div>
		                            <div className="row">
		                                <div className="col-md-5">
		                                    <div className="form-group">
		                                        <label>Workflow(s)</label>
		                                        <span className="select-sassy-wrapper left">
		                                            <div className="advanced-select" data-model="Workflow">
		                                                <div className="dropdown">
		                                                    <input id="status" type="button" data-default="" value="" className="trigger" onClick={this.handleTriggerClick}/>
		                                                    <a href="#" className="btn-toggle" data-toggle="dropdown" aria-expanded="true"><b className="caret"></b></a>
		                                                    <a href={null} className="x-clear" onClick={this.handleClearClick}>×</a>
		                                                    <ul className="dropdown-menu">
		                                                        <li className="skip-li">
		                                                        	<input type="text" className="q" placeholder="Search Workflow" onKeyUp={e => this.handleQKeyUp(e)}/>
		                                                        </li>
		                                                        <li>
		                                                        	<a className="x-check parent-check" href={null}>
		                        										<PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="right">
			                                                        		<input disabled={!isAuthorizedToEdit} type="checkbox" name="status_0" id="status_0" onChange={(e) => this.handleCheckAll(e)}/>
			                                                        		<label htmlFor="status_0"> Select All</label>
			                                                        	</PermissionTooltip>
		                                                        	</a>
		                                                        </li>
		                                                        {this.renderWorkflowOptions()}
		                                                    </ul>
		                                                </div>
		                                            </div>
		                                        </span>
		                                    </div>
		                                </div>
		                            </div>
		                            <div className="item-tags">
		                            </div>
		                        </div>
		                        <div className="btn-area mt-25">
		                            <a href="#" className="sassy-btn sassy-btn-border" onClick={() => this.handleCancel()}>Cancel</a>
                                    <PermissionTooltip isAuthorized={isAuthorizedToAdd}>
		                            	<button href="#" className={saveBtnClass} onClick={() => this.createUpdateDepartment()}>Save</button>
		                            </PermissionTooltip>
		                        </div>
		                    </div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		user: state.userReducer.user,
		workflows: state.approvalReducer.workflows,
		selectedDepartment: state.approvalReducer.selectedDepartment,
		isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete
	};
}

function mapDispatchToProps(dispatch) {
	return {
		createApprovalDepartment: (options, callback) => dispatch(createApprovalDepartment(options, callback)),
		updateApprovalDepartment: (rowID, options, callback) => dispatch(updateApprovalDepartment(rowID, options, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
	};
}

const ApprovalDepartmentAddEditHome = 
	ReactRedux.connect(
		mapStateToProps,
		mapDispatchToProps
	)(ApprovalDepartmentAddEditComponent);

module.exports = {
	ApprovalDepartmentAddEditHome,
	ApprovalDepartmentAddEditComponent
};