'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const Currency = require('currency-symbol-map');
const Numeral = require('numeral');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const BaseComponent = require('../../shared/base');
const PermissionTooltip = require('../../common/permission-tooltip');
const { createApprovalWorkflow } = require('../../../redux/approvalActions');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

if (typeof window !== 'undefined') { var $ = window.$; }


class CreateApprovalWorkflowComponent extends BaseComponent {
	constructor(props) {
		super(props);
		this.state = {
			workflowName: '',
            isSaving: false
		}
	}

	showConfirm(id, key) {
		const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");

        target.fadeIn();
        cover.fadeIn();

        $(".my-btn.btn-saffron").attr('data-key', key);
        $(".my-btn.btn-saffron").attr('data-id', id);
	}
	renderApprovers() {
        return (
            <React.Fragment>
                <table className="table approver-table">
                    <thead>
                        <tr>
                            <th>For Purchases Up To</th>
                            <th>Approval(s) Needed</th>
                            <th>Approver(s) <span className="compulsory-approver-txt">*compulsory / veto approver is <span>highlighted</span></span></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody />
                </table>
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/list-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">Nothing to see here.</div>
                    <div className="empty-page-message">This is where the list of added workflow that are approved will appear</div>
                </div>
            </React.Fragment>

        )
	}

	renderSelectedApproverTable() {
		return (
			<div className="sassy-table">
                <table className="table tbl-approver">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Compulsory / Veto</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
		);
	}

	onMaxAmountChange() {
		const inputField = $(".is-unlimited");
		if (inputField.is(":checked")) {
		    $('input[name=range_from]')
                .prop('disabled', true)
                .removeClass('required')
                .val('');
		} else {
            $('input[name=range_from]')
                .prop('disabled', false)
                .addClass('required');
        }

	}
 	
 	drawApproverTbl() {
        $('.tbl-approver tbody').html('');
        const self = this;
        $('.advanced-select .approver_merchant:checked').each(function() {
            const randomId = Math.floor(Math.random() * Math.floor(9999));
            const $this = $(this);
            const name = $this.data('merchant');
            const ID = $this.data('id');
            //TODO use react components for rendering approvers
            const deleteIcon = '<a href="#" class="delete_item" data-id="' + randomId + '"><i class="icon icon-delete"></i></a>';
            const delButton = self.props.isAuthorizedToDelete ? deleteIcon : (`<span class="tool-tip inline icon-grey" data-toggle="tooltip" 
                data-placement="top" data-original-title="You need permission to perform this action"> ${deleteIcon} </span>`);
            const template = 
            	`<tr class="item-approver-` + randomId + `">
                    <td data-th="Name" data-user-id=${ID}>` + name + `</td>
                    <td data-th="Compulsary">
                        <label for="item-` + randomId + `" class="sassy-checkbox"><input type="checkbox" id="item-` + randomId + `"><span></span></label>
                    </td>
                    <td data-th="">` + delButton + `</td>
                </tr>`;
            $('.tbl-approver tbody').append(template);
            $('[data-toggle="tooltip"]').tooltip();

        });

       	$('.tbl-approver .delete_item').on('click', function() {
            const $this = $(this);
            if (!self.props.isAuthorizedToDelete) return;
            self.props.validatePermissionToPerformAction('delete-consumer-create-approval-workflow-api', () => {
                self.showConfirm($(this).attr('data-id').toString(), "approver");
            });
        });
    }

	onParentCheckChange(e) {
        //$('.advanced-select .approver_merchant').eq(0).trigger('change');
        if (!!e && !!e.originalEvent) {
            return false;
        }
		const $cbox = $('.advanced-select .parent-check input[type=checkbox]');
        const $ul = $cbox.parents('ul');
        if ($cbox.is(":checked")) {
            $ul.find('input[type=checkbox]').prop("checked", true);
        } else {
            $ul.find('input[type=checkbox]').prop("checked", false);
        }
	}

    updateCountDisplay(e) {
        const $control = $('.advanced-select .x-check input[type=checkbox]').parents('.advanced-select');
        const model = $control.data('model');
        const $input = $control.find('.form-control:eq(0)');
        const default_val = $input.attr('data-default');
        const checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;

        if (checked === 1) {
            $input.val($control.find('.x-check:not(.parent-check) input[type=checkbox]:checked + label').text());
            $control.addClass('choosen');
        } else if (checked > 0) {
            $control.addClass('choosen');
            if (checked > 1) {
                $input.val(checked + ' ' + model);
            }
        } else {
            $input.val(default_val);
            $control.removeClass('choosen');            
        }

        const unchecked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:not(:checked)').length;
        if (unchecked > 0) {
            $('.parent-check input[type=checkbox]').prop("checked", false);
        }
        else {
            $('.parent-check input[type=checkbox]').prop("checked", true);
        }
    }

	configSelectForm() {
		const self = this;
		$('.advanced-select .parent-check input').on('change', function() {
            $('.advanced-select .approver_merchant').eq(0).trigger('change');
        });

		$('.advanced-select .approver_merchant').on('change', () => self.drawApproverTbl());

        //Count
        $('.advanced-select .x-check input[type=checkbox]').on('change', self.updateCountDisplay);

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

        $('.advanced-select input[type=text]').focusin(function() {
            $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
        });

        //Toggle sub items
        $('.advanced-select li.has-sub .toggle-sub').on('click', function(e) {
            var $this = $(this);

            var $icon = $this.find('.x-arrow');
            var $ul = $this.next('.sub-items');
            $ul.slideToggle();

            $this.parents('.dropdown').addClass('open');

            if ($icon.hasClass('x-arrow-down')) {
                $icon.removeClass('x-arrow-down');
                $icon.addClass('x-arrow-up');
            } else {
                $icon.removeClass('x-arrow-up');
                $icon.addClass('x-arrow-down');
            }
        });

	}

	onQKeyUp() {
        const input = $('.advanced-select .q');
        const filter = $.trim(input.val().toLowerCase());
        const div = input.parents('.dropdown').find('.dropdown-menu');
        div.find("li:not(.skip-li)").each(function() {
            const $this = $(this).find('label');
            if ($this.text().toLowerCase().indexOf(filter) > -1) {
                $this.parents('li').show();
            } else {
                $this.parents('li').hide();
            }
        });
	}

    renderSubAccounts() {
        if (this.props.subAccounts.TotalRecords > 0) {
            const { Records } = this.props.subAccounts;
            return Records.map(sub => {
                const accName = `${sub.FirstName} ${sub.LastName}`; 
                return (
                    <li key={sub.ID}>
                        <a className="x-check" href={null}>
                            <input className="approver_merchant" type="checkbox" name={sub.ID} defaultValue={sub.ID} data-permission="Main Owner" data-merchant={accName} data-id={sub.ID} id={sub.ID} />
                            <label htmlFor={sub.ID}>{accName}</label>
                        </a>
                    </li>
                );
            })
        }
        return '';
    }

    clearSelected() {
        $('.advanced-select .parent-check input').prop('checked', false);
        this.onParentCheckChange();
        this.updateCountDisplay();
        this.drawApproverTbl();
    }

	renderAddWorkflowForm() {
        const currency = this.props.currencyCode ? 
            `${this.props.currencyCode} ${Currency(this.props.currencyCode)}` : 'USD $';
		return (
			<div className="add-workflow-wrapper">
				<div className="form-group">
                    <label htmlFor="">Maximum Purchase Amount</label>
                    <div className="flex-input-group">
                        <input className="sassy-control numbersWithD required" name="range_from" type="number" placeholder={currency} required="required" />
                        <div className="chk_box">
                            <label htmlFor="item-1" className="sassy-checkbox">
	                            <input type="checkbox" className="is-unlimited" id="item-1" onChange={this.onMaxAmountChange}/>
	                            <span />
                            </label>
                            &nbsp;
                            Is Unlimited
                        </div>
                    </div>
				</div>
				<div className="form-group">
                    <label htmlFor="">Approval(s) Needed</label>
                    <div className="flex-input-group">
                        <input className="sassy-control required numbersOnlyD spin-visible" name="minimum_approver" min="0" type="number" placeholder="" />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="">Approver</label>
                    <div className="link-group">
                        <div className="form-group field-merchant selectbox l-i-i">
                            <div className="advanced-select sassy-control" data-model="Users Selected" id="approver_dropdown">
                                <div className="dropdown">
                                    <input id="approver_users" name="approver_users" type="text" placeholder="Select Users" data-default="Select Users" defaultValue="Select Users" className="form-control" />
                                    <a href="#" className="btn-toggle" data-toggle="dropdown" aria-expanded="true"><b className="fa fa-angle-down"></b></a>
                                    <a href="#" className="x-clear" onClick={(e) => { 
                                            e.preventDefault();
                                            this.clearSelected();
                                        }}>×</a>
                                    <ul className="dropdown-menu">
                                        <li className="skip-li"><input type="text" className="q" placeholder="Search Users" onKeyUp={this.onQKeyUp}/></li>
                                        <li>
                                        	<a className="x-check parent-check" href={null}>
                                        		<input type="checkbox" name="metric_0" id="metric_0" onChange={this.onParentCheckChange}/>
                                        		<label htmlFor="metric_0"> Select All</label>
                                        	</a>
                                        </li>
                                        {this.renderSubAccounts()}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>  
	            </div>
	            {this.renderSelectedApproverTable()}
			</div>
		);
	}

	showSavePopup() {
        const target = $(".popup-area.item-save-popup");
        const cover = $("#cover");
        target.fadeIn();
        cover.fadeIn();
	}

	handleAddWorkflow() {
		let error = false;
		const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction('edit-consumer-create-approval-workflow-api', () => {
            if ($('.unlimited-row').length) {
                return false;
            } else {
                $("#approver_dropdown").removeClass("error-con");
                $('.add-workflow .required').each(function() {
                    const $this = $(this);
                    $this.removeClass('error-con');
                    if (!$.trim($this.val())) {
                        $this.addClass('error-con');
                        if ($this.attr('name') == "minimum_approver") {
                            $("#approver_dropdown").addClass("error-con");
                        }
                        error = true;
                    }
                });
                
                const minimum_approver = parseInt($('input[name=minimum_approver]').val());
                const arryApprover = [];

                $('.tbl-approver tbody tr').each(function() {
                    const checked = $(this).find('input[type=checkbox]').is(":checked");
                    const name = $(this).children('td').eq(0).text();
                    const userID = $(this).children('td').eq(0).data('user-id');
                    if (checked) {
                        arryApprover.push(`<span class="highlightted-user" data-user-id=${userID}>` + name + `</span>`);
                    } else {
                        arryApprover.push(`<span data-user-id=${userID}>` + name + `</span>`);
                    }
                });

                if (arryApprover.length < minimum_approver) {
                    $("#approver_dropdown").addClass("error-con");
                    error = true;
                }

                if (!error) {

                    let price_from = parseFloat($('input[name=range_from]').val()).toFixed(2);
                    const approver = '-';

                    const itemId = Math.floor(Math.random() * Math.floor(9999));

                    let currencyCode = self.props.currencyCode || 'USD';

                    let unlimited = '';

                    if ($('.is-unlimited').is(":checked")) {
                        price_from = 'Unlimited';
                        currencyCode = '';
                        unlimited = 'unlimited-row';
                    }
                    
                    const purchaseRange = price_from !== 'Unlimited' ?`
                        <span class="currencyCode">${currencyCode}</span>
                        <span class="currencySymbol"> ${Currency(currencyCode)}</span>
                        <span class="priceAmount"> ${self.formatAmountWithCommaSeparator(price_from)}</span>
                    ` : 'Unlimited' ;
                    var sortedApprover =  arryApprover.sort((a,b) => b.includes("highlightted-user") - a.includes("highlightted-user"));
                    //TODO use react components for rendering added flow
                    const deleteIcon = '<a href="#" class="delete_item" data-id="' + itemId + '"><i class="icon icon-delete"></i></a>';
                    const delButton = self.props.isAuthorizedToDelete ? deleteIcon : (`<span class="tool-tip inline icon-grey" data-toggle="tooltip" 
                        data-placement="top" data-original-title="You need permission to perform this action"> ${deleteIcon} </span>`);
                    var template = `
                        <tr class="item-approver-` + itemId + ` ` + unlimited + `" data-amount=${price_from}>
                            <td data-th="Purchase Range" data-price=${price_from}>  ${purchaseRange} </td>
                            <td data-th="Minimum Approver">` + minimum_approver + `</td>
                            <td data-th="Approver">
                                ` + sortedApprover.join(", ") + `
                            </td>
                            <td data-th="">`
                                + delButton + 
                            `</td>
                        </tr>`;

                    $('.approver-table tbody').append(template);
                    $('[data-toggle="tooltip"]').tooltip();
                    var $wrapper = $('.approver-table tbody');
                    $wrapper.find('tr').sort(function(a, b) {
                        return +parseFloat(a.getAttribute('data-amount')) - + parseFloat(b.getAttribute('data-amount'));
                    }).appendTo($wrapper);
                    $(`.item-approver-${itemId} a.delete_item`).on('click', function() {
                        const $this = $(this);
                        if (!self.props.isAuthorizedToDelete) return;
                        self.props.validatePermissionToPerformAction('delete-consumer-create-approval-workflow-api', () => {
                            self.showConfirm($this.attr('data-id').toString(), "approver");
                        });
                    });
                    
                    if ($('.is-unlimited').is(":checked")) {
                        $('.workflow-overlay').removeClass('_m');
                    }
                    
                    self.clearSelected();
                    $('.add-workflow .required').val('');
                    $('.is-unlimited').prop('checked', false);
                    self.onMaxAmountChange();
                    $(".empty-page-sec").addClass("hide");
                }
            }
        });
	}

	onCancelRemove() {
		const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");
        target.fadeOut();
        cover.fadeOut();
        $(".my-btn.btn-saffron").attr('data-id', '');
	}

	onConfirmRemove() {
		const self = this;
		const that = $('.confirm_remove');
        const id = that.attr('data-id');
        const key = that.attr('data-key');

        let target = ''
        if (key == 'item') {
            target = $('.account-row[data-id=' + id + ']');
        }

        if (key == 'approver') {
            target = $('.item-approver-' + id);
            if (target.hasClass('unlimited-row')) {
                $('.workflow-overlay').addClass('_m');
            }
        }
        target.fadeOut(500, function() {
            target.remove();
            self.onCancelRemove();
        });
	}

	renderRemovePopup() {
		return (
			<div className="popup-area item-remove-popup">
		        <div className="wrapper">
		            <div className="title-area text-capitalize">
		                <h1>Remove Item</h1>
		            </div>
		            <div className="content-area">
		                <p>You sure about removing this Item from your list?</p>
		                <p>(It'll be gone forever!)</p>
		            </div>
		            <div className="btn-area">
		                <div className="pull-left">
		                    <input type="button" value="Cancel" className="my-btn btn-black cancel_remove" onClick={this.onCancelRemove}/>
		                </div>
		                <div className="pull-right">
		                    <input data-key="" data-id="" type="button" value="Okay" className="my-btn btn-saffron confirm_remove" onClick={() => this.onConfirmRemove()}/>
		                </div>
		                <div className="clearfix"></div>
		            </div>
		        </div>
		    </div>
		)
	}

	onCancelSave() {
		const target = $(".popup-area.item-save-popup");
        const cover = $("#cover");

        target.fadeOut();
        cover.fadeOut();
	}

	renderSavePopup() {
		return (
			<div className="popup-area item-save-popup">
		        <div className="wrapper">
		            <div className="title-area">
		                <h1>Save the approval workflow</h1>
		            </div>
		            <div className="content-area">
		                <p>Are you sure you want to save the workflow?<br />Approval workflow cannot be edited after saving.</p>
		            </div>
		            <div className="btn-area">
		                <div className="pull-left">
		                    <input type="button" value="Cancel" className="my-btn btn-black cancel_save" onClick={this.onCancelSave}/>
		                </div>
		                <div className="pull-right">
		                    <a href="#" className="my-btn btn-saffron" onClick={(e) => this.onCreateApprovalWorkflow(e)}>Save</a>
		                </div>
		                <div className="clearfix" />
		            </div>
		        </div>
		    </div>
		);
	}

    onCreateApprovalWorkflow(e) {
        e.preventDefault();
        const workflowTable = $('.table.approver-table tr');
        const Workflows = [];
        const self = this;

        if (self.state.isSaving) return;
        self.setState({ isSaving: true });
        
        workflowTable.each(function(index, row) {
            // skip table heading
            let maxPurchaseAmount = 0;
            let isUnlimited = false;
            let minApprover = 0;
            let approvers = [];
            if (index !== 0) {
                const purchaseAmtCol = $(row).find("td:nth-child(1)");
                if ($(row).hasClass('unlimited-row')) {
                    isUnlimited = true;
                } else {
                    maxPurchaseAmount = parseFloat($(purchaseAmtCol).data('price'));
                }
                
                const minApproverCol = $(row).find("td:nth-child(2)");
                minApprover = parseInt($(minApproverCol).html());

                const approverCol = $(row).find("td:nth-child(3)");
                const list = $(approverCol).find('span');
                if (list && list.length > 0) {
                    list.each(function (i, span) {
                        approvers.push({
                            UserID: $(span).data('user-id'),
                            IsCompulsory: $(span).hasClass('highlightted-user'),
                        });
                    });
                }
                Workflows.push({
                    MaximumPurchase: {
                        Unlimited: isUnlimited,
                        Currency: self.props.currencyCode || '',
                        Amount: maxPurchaseAmount
                    },
                    ApprovalsNeeded: minApprover,
                    Approvers: approvers,
                })
            }
        })
        const Reason = self.state.workflowName.trim();
        this.props.createApprovalWorkflow({
            Reason,
            Workflows
        }, function(result) {
            if (result.success) window.location.href = "/approval/workflows";
            else {
                self.setState({ isSaving: false });
            }
        })

    }

    handleSave() {
        const self = this;
        if (!this.props.isAuthorizedToAdd) return;
        this.props.validatePermissionToPerformAction('add-consumer-create-approval-workflow-api', () => {
            const $workflow_name = $('input[name=workflow_name]');
            let hasError = false;
            $workflow_name.removeClass('error-con');
            if (!$.trim($workflow_name.val())) {
                $workflow_name.addClass('error-con');
                hasError = true;
            }

            if (!hasError) {
                self.showSavePopup();
            }
        });
    }

    componentDidMount() {
        this.configSelectForm();
    }

	render() {
        const { isAuthorizedToAdd, isAuthorizedToEdit } = this.props;
        const saveBtnClass = `action-btn action-save ${isAuthorizedToAdd ? '' : 'disabled'}`;
        const addNewWorkflowBtnClass = `sassy-btn sassy-btn-bg btn-save-workflow ${isAuthorizedToEdit ? '' : 'disabled'}`;
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
			                                <a href="/approval/workflows"> Back</a>
			                            </div>
			                            <span className="sc-text-big">
			                            	Create Approval Workﬂow
			                            </span>
			                            <span className="compulsory-approver-txt">
			                            	Approval workflow cannot be edited after saving.
			                            </span>
			                        </div>
			                    </div>
			                    <div className="sassy-box no-border">
			                    	<div className="sassy-box-content border">
			                    		<div className="row">
			                                <div className="col-md-5">
			                                    <div className="form-group">
			                                        <label>Reason</label>
			                                        <input 
			                                        	type="text"
			                                        	className="sassy-control required"
			                                        	data-react-state-name="workflowName"
			                                        	name="workflow_name"
			                                        	value={this.state.workflow_name}
			                                        	onChange={(e) => this.onChange(e)}
			                                        />
			                                    </div>
			                                </div>
			                                <div className="clearfix" />
			                            </div>
			                            <div className="row">
			                            	<div className="col-md-12">
			                            		<div className="sassy-table wrap-tbl-approver">
			                            			{this.renderApprovers()}
			                            		</div>
			                            		<div className="group-add-workflow active">
				                            		<div className="add-workflow">
				                            			{this.renderAddWorkflowForm()}
				                            			<div className="btn-area mt-25">
                                                            <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
		                                                      <button href="#" className={addNewWorkflowBtnClass} onClick={() => this.handleAddWorkflow()}>Add New Flow</button>
                                                            </PermissionTooltip>
                                                        </div>
				                            			<div className="workflow-overlay _m" />
				                            		</div>
				                            	</div>
			                            	</div>
			                            </div>
			                    	</div>
			                    	<div className="row mt-15">
			                            <div className="col-sm-12">
			                                <div className="save-actions">
			                                    <button type="button" className="action-btn action-cancel"><a href="/approval/workflows">Cancel</a></button>
			                                    <PermissionTooltip isAuthorized={isAuthorizedToAdd}>
                                                    <button type="button" className={saveBtnClass} onClick={() => this.handleSave()}>Save</button>
                                                </PermissionTooltip>
                                            </div>
			                            </div>
			                        </div>
			                    </div>
							</div>
						</div>
					</div>
				</div>
				{this.renderRemovePopup()}
				{this.renderSavePopup()}
				<div id="cover" />
			</React.Fragment>
		);
	}
}


function mapStateToProps(state, ownProps) {
	return {
		user: state.userReducer.user,
        subAccounts: state.userReducer.subAccounts,
        currencyCode: state.approvalReducer.currencyCode,
        isAuthorizedToAdd: state.userReducer.pagePermissions.isAuthorizedToAdd,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        isAuthorizedToDelete: state.userReducer.pagePermissions.isAuthorizedToDelete        
	}
}

function mapDispatchToProps(dispatch) {
	return {
        createApprovalWorkflow: (workflow, callback) => dispatch(createApprovalWorkflow(workflow, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
	}
}

const CreateApprovalWorkflowHome =  
	ReactRedux.connect(
		mapStateToProps,
		mapDispatchToProps
	)(CreateApprovalWorkflowComponent);


module.exports = {
	CreateApprovalWorkflowHome,
	CreateApprovalWorkflowComponent
};