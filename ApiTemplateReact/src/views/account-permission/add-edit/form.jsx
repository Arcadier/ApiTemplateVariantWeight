'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class FormComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            Name: (props.permissionProfile && props.permissionProfile.Name) ||'',
            SelectedUserGroups: ((props.permissionProfile && props.permissionProfile.UserGroups) || []).map(i => i.ID),
        };
    }

    init() {
        const self = this;
        $('.advanced-select .parent-check input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('ul');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find('input[type=checkbox]').prop("checked", false);
            }
        });

        //sub with parent
        $('.advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {
            var $this = $(this);
            var $ul = $this.parents('li.has-sub');
            if ($this.is(":checked")) {
                $ul.find('input[type=checkbox]').prop("checked", true);
            } else {
                $ul.find(' input[type=checkbox]').prop("checked", false);
            }
        });

        //Searching
        $('.advanced-select .q').on('keyup', function () {
            var input, filter, ul, li, a, i;
            input = $(this);
            filter = $.trim(input.val().toLowerCase());
            var div = input.parents('.dropdown').find('.dropdown-menu');
            div.find("li:not(.skip-li)").each(function () {
                var $this = $(this).find('label');
                if ($this.text().toLowerCase().indexOf(filter) > -1) {
                    $this.parents('li').show();
                } else {
                    $this.parents('li').hide()
                }
            })
        });

        //Count
        $('.advanced-select .x-check input[type=checkbox]').on('change', function () {
            var $control = $(this).parents('.advanced-select');
            var model = $control.data('model');
            var $input = $control.find('.trigger');
            var default_val = $input.attr('data-default');
            var checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;

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
        });

        //Count on ready
        $('.advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');

        //Prevent dropdown to close
        $('.advanced-select .dropdown').on('hide.bs.dropdown', function () {
            return false;
        });


        $('.advanced-select .x-clear').click(function () {
            var $this = $(this);
            $this.parents('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', false).trigger('change');
        });

        //Close dropdown to click outside
        $('body').on('click', function (e) {
            var $target = $(e.target);
            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });

        $('.advanced-select .trigger').on('click', function () {
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
            } else {
                $('.advanced-select .dropdown.open').removeClass('open');
                $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
            }
        });
    }

    memberFilterCount() {
        var $control = $('.advanced-select');
        var model = $control.data('model');
        var $input = $control.find('.trigger');
        var default_val = $input.attr('data-default');
        var checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;
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
    }

    renderGroupDetails() {
        const self = this;
        if (this.props && this.props.permissionProfile) {
            const { UserGroups } = this.props.permissionProfile;
            if (UserGroups && UserGroups.length > 0) {
                UserGroups.forEach(group => $(`input[id=${group.ID}]`).prop('checked', true).change());
                if (this.props.userGroups && this.props.userGroups.length > 0) {
                    const toSelectAll = this.props.userGroups.every(g => UserGroups.some(userID => userID == g.ID));
                    if (toSelectAll) {
                        $('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', true).trigger('change');
                    }
                }
            }
        }
    }

    componentDidUpdate() {
        this.memberFilterCount();
    }

    componentDidMount() {
        this.init();
    }

    hasSelectedAllUserGroups() {
        const { SelectedUserGroups } = this.state;
        const { userGroups } = this.props;
        if (userGroups && userGroups.length > 0 && SelectedUserGroups.length > 0) {
            const groupIDs = userGroups.map(u => u.ID);
            return groupIDs.every(g => SelectedUserGroups.some(m => m == g));
        }
        return false;
    }

    handleSelectAll(isChecked) {
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        const code = `edit-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-create-account-permission-api`;
        this.props.validatePermissionToPerformAction(code, () => {
            if (isChecked) {
                if (self.props.userGroups && self.props.userGroups.length > 0) {
                    const SelectedUserGroups = self.props.userGroups.map(u => u.ID);
                    self.setState({ SelectedUserGroups });
                }
            } else {
                self.setState({ SelectedUserGroups: [] });
            }
        });
    }

    clearAll() {
        this.setState({ SelectedUserGroups: [] });
    }

    onDropdownChange(groupID, isChecked) {
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        const code = `edit-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-create-account-permission-api`;
        this.props.validatePermissionToPerformAction(code, () => {
            let selected = self.state.SelectedUserGroups;
            if (isChecked) {
                if (!self.state.SelectedUserGroups.includes(groupID)) {
                    selected = [...selected, groupID];
                }
            } else {
                selected = selected.filter(m => m !== groupID);
            }
            self.setState({ SelectedUserGroups: selected }, () => {
                $('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', self.hasSelectedAllUserGroups());
            });
        });
    }

    renderOptions() {
        if (this.props.userGroups && this.props.userGroups.length > 0) {
            const { userGroups, isAuthorizedToEdit } = this.props;
            const { SelectedUserGroups } = this.state;
            return userGroups.map((group, index) =>
                <li key={index}>
                    <a className="x-check" href={null}>
                        <PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="right">
                            <input type="checkbox" disabled={!isAuthorizedToEdit} name={group.ID} id={group.ID} checked={SelectedUserGroups.includes(group.ID)} onChange={(e) => this.onDropdownChange(group.ID, e.target.checked)} />
                            <label htmlFor={group.ID}> {group.Name} </label>
                        </PermissionTooltip>
                    </a>
                </li>
            );
        }
    }

    renderSelectedGroups() {
        const self = this;
        const { SelectedUserGroups } = this.state;
        const { userGroups } = this.props;
        if (SelectedUserGroups && SelectedUserGroups.length > 0) {
            const groups = userGroups.filter(u => SelectedUserGroups.includes(u.ID));
            return groups.map((group, index) =>
                <div key={index}>
                    <span>{group.Name}</span>
                    <a href={null} onClick={() => self.onDropdownChange(group.ID, false)} className="delete_item">
                        <i className="icon icon-delete"></i>
                    </a>
                </div>
            );
        }
    }

    render() {
        const { isAuthorizedToEdit } = this.props;
        return (
            <React.Fragment>
                <section className="sassy-box">
                    <div className="sassy-box-content box-order-detail user-group-create-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-element">
                                    <label>Profile Name</label>
                                    <input 
                                        type="text"
                                        name="group_name"
                                        id="user_group_name"
                                        className="form-control required"
                                        data-react-state-name="Name"
                                        value={this.state.Name}
                                        maxLength={30}
                                        onChange={(e) => this.onChange(e)}
                                    />
                                </div>
                                <div className="form-element">
                                    <label> Select User Groups</label>
                                    <div className="advanced-select" data-model="Groups selected">
                                        <div className="dropdown">
                                            <input id="Merchants" type="button" data-default="Search..." value="Search..." className="trigger required" placeholder="Search..." />
                                            <a href={null} className="x-clear" onClick={() => this.clearAll()}>
                                                <i className="fa  fa-times-circle"></i>
                                            </a>
                                            <a href="#" className="btn-toggle" data-toggle="dropdown" aria-expanded="true"><b className="caret"></b></a>
                                            <ul className="dropdown-menu">
                                                <li className="skip-li">
                                                    <input type="text" className="q" placeholder="Search..." />
                                                </li>
                                                <li>
                                                    <a className="x-check parent-check" href={null}>
                                                        <PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="right">
                                                            <input type="checkbox" disabled={!isAuthorizedToEdit} name="sub_accounts_0" id="sub_accounts_0" onChange={(e) => this.handleSelectAll(e.target.checked)}/>
                                                            <label htmlFor="sub_accounts_0"> Select All</label>
                                                        </PermissionTooltip>
                                                    </a>
                                                </li>
                                                {this.renderOptions()}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-element">
                                    <div className="groupbox" id="group-member" name="Group Member">
                                        {this.renderSelectedGroups()}
                                    </div>
                                </div>
                            </div>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        )
    }
}; 

module.exports = FormComponent;