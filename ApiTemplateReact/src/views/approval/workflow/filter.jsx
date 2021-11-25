'use strict';
const React = require('react');
const PageItemCountComponent = require('../../common/page-item-count');


class WorkflowPageFilter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pageSize: 20,
        }
        
        this.handleKeyPress = this.handleKeyPress.bind(this);
	}
	
	handlePageSizeSelect(pageSize) {
		this.props.filterApprovalList(pageSize, this.props.workflows ? this.props.workflows.PageNumber : 1, "Workflows");
		this.setState({ pageSize });
	}

	componentDidMount() {
		$(".trigger").on("click", function() {
			$(".op-val").show();
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
            } else {
                $('.advanced-select .dropdown.open').removeClass('open');
                $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
            }
		});

		$('body').on('click', function(e) {
            const $target = $(e.target);
            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });

        $('.advanced-select .x-clear').click(function() {
            const $this = $(this);
            $this.parents('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', false).trigger('change');
        });

        $('body').on('keyup', '.advanced-select.number #min', function() {
            const $this = $(this);
            const val = parseInt($.trim($this.val()));
            $('.op-min').text(val ? val : '0');
        });

        $('body').on('keyup', '.advanced-select.number #max', function() {
            const $this = $(this);
            const val = parseInt($.trim($this.val()));
            $('.op-max').text(val ? val : '0');
        });
    }
    
    handleKeyPress(e) {
        if (e.key === "Enter") {
            this.applyFilters();
        }
    }

	applyFilters() {
		const pageSize =  this.state.pageSize;
		const keyword = $("input[name=keywords]").val();
		const min = $("input[name=min]").val();
		const max = $("input[name=max]").val();

		this.props.updateSearchFilters({
			keyword: keyword && keyword.trim().length > 0 ?  keyword.trim() : null,
			minimumWorkflowCount: min ? parseInt(min) : null, 
			maximumWorkflowCount: max ? parseInt(max) : null,
		});
        const tableName = "Workflows";
        $(".op-val").hide();
		this.props.filterApprovalList(pageSize, 1, tableName);
	}

	render() {
		return (
			<React.Fragment>
				<div className="sassy-filter lg-filter">
                    <div className="sassy-flex">
                        <div className="sassy-l">
                            <div>
                                <div className="group-search">
                                    <div className="group-search-flex">
                                        <label htmlFor="" className="sassy-label">Filter by:</label>
                                        <span className="sassy-search">
                                            <input className="form-control" name="keywords" id="keywords" placeholder="Keywords" onKeyPress={this.handleKeyPress} />
                                            <input type="button" className="searh-btn" onClick={() => this.applyFilters()} />
                                        </span>
                                        <span className="select-sassy-wrapper grey-side right">
                                            <div className="advanced-select number" data-model="Workflow Configured Affected">
                                                <div className="dropdown">
                                                    <input id="workflow_configured" type="button" data-default="Workflow Configured" value="Workflow Configured " className="trigger" />
                                                    <span className="op-val" style={{ display: 'none'}}><span className="op-min">0</span> - <span className="op-max">0</span></span>
                                                    <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                                    <a href={null} className="x-clear">×</a>
                                                    <ul className="dropdown-menu">
                                                        <li><input type="text" name="min" id="min" className="numbersOnlyD" /></li>
                                                        <li>-</li>
                                                        <li><input type="text" name="max" id="max" className="numbersOnlyD" /></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </span>
                                        <input type="button" className="btn btn-sassy" value="Apply" onClick={() => this.applyFilters()}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <PageItemCountComponent 
                        	onChange={(val) => this.handlePageSizeSelect(val)} 
                        	value={this.state.pageSize}
                        />
                    </div>
	            </div>
            </React.Fragment>
		)
	}
}


module.exports = WorkflowPageFilter;