const React = require('react');
const BaseComponent = require('../../shared/base');
const PaginationComponent = require('../../common/pagination');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }
const PAGE_SIZE = 12;

class FormComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            Name: (this.props.userGroup && this.props.userGroup.Name) || '',
            SelectedUsers: ((this.props.userGroup && this.props.userGroup.Users) || []).map(u => u.ID),
            DisplayedUsers: [],
            currentPage: 1,
        };
    }

    init() {
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
        var default_val = $input.attr('data-defaultVale');
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
        if (this.props && this.props.userGroup) {
            const { Users } = this.props.userGroup;
            if (Users && Users.length > 0) {
                Users.forEach(member => $(`input[id=${member.ID}]`).prop('checked', true).change());
                if (this.props.subAccounts && this.props.subAccounts.length > 0) {
                    const toSelectAll = this.props.subAccounts.every(user => Users.some(userID => userID == user.ID));
                    if (toSelectAll) {
                        $('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', true).trigger('change');
                    }
                }
            }
            this.updateDisplayedUsers();
        }
    }

    updateDisplayedUsers(pageNumber = this.state.currentPage) {
        const maxPageNumber = Math.ceil(this.state.SelectedUsers.length / PAGE_SIZE);
        if (pageNumber == 0) pageNumber = 1;
        if (pageNumber > maxPageNumber) {
            pageNumber = maxPageNumber;
        }

        const users = this.state.SelectedUsers.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);
        this.setState({ DisplayedUsers: users, currentPage: pageNumber });
    }

    componentDidUpdate() {
        this.memberFilterCount();
    }

    componentDidMount() {
        this.init();
        this.renderGroupDetails();
    }

    handleChange(ID, isChecked) {
        const self = this;
        let selected = [...this.state.SelectedUsers];

        if (isChecked) {
            if (!this.state.SelectedUsers.includes(ID)) {
                selected = [...this.state.SelectedUsers, ID];
            }
        } else {
            selected = this.state.SelectedUsers.filter(m => m !== ID)
        }
        this.setState({ SelectedUsers: selected }, () => {
            self.updateDisplayedUsers();
            let isAllSelected = false;
            if (selected && selected.length > 0) {
                const { subAccounts } = self.props;
                if (subAccounts && subAccounts.length > 0) {
                    const subAccountIDs = subAccounts.map(u => u.ID);
                    if (subAccountIDs.every(g => selected.some(m => m == g))) {
                        isAllSelected = true;
                    }
                }
            }
            $('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', isAllSelected);
        });
    }

    handleSelectAll(isChecked) {
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction('edit-consumer-create-user-group-api', () => {
            let selected = [...self.state.SelectedUsers];
            if (isChecked) {
                if (self.props.subAccounts && self.props.subAccounts.length > 0) {
                    selected = self.props.subAccounts.map(m => m.ID);
                }
            } else {
                selected = [];
            }
            self.setState({ SelectedUsers: selected }, () => self.updateDisplayedUsers())
        });
    }

    onCheckboxChange(ID, isChecked) {
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction('edit-consumer-create-user-group-api', () => {
            self.handleChange(ID, isChecked);
        });
    }

    renderOptions() {
        const self = this;
        const { isAuthorizedToEdit } = this.props;
        if (this.props.subAccounts && this.props.subAccounts.length > 0) {
            return this.props.subAccounts.map((subAccount, index) => 
                <li key={index}>
                    <a className="x-check" href={null}>
                        <PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="right">
                            <input type="checkbox" disabled={!isAuthorizedToEdit} name={subAccount.ID} id={subAccount.ID} onChange={(e) => self.onCheckboxChange(subAccount.ID, e.target.checked)}/>
                            <label htmlFor={subAccount.ID}>{ subAccount.DisplayName || subAccount.UserName || `${subAccount.FirstName} ${subAccount.LastName}`} </label>
                        </PermissionTooltip>
                    </a>
                </li>

            )
        }
    }

    deleteMember(userID) {
        const self = this;
        if (!this.props.isAuthorizedToDelete) return;
        this.props.validatePermissionToPerformAction('delete-consumer-create-user-group-api', () => {
            $('.x-check').find(`input[type="checkbox"][id=${userID}]`).prop('checked', false);
            $('.advanced-select .dropdown-menu label:contains("Select")').parent().find('input[type="checkbox"]').prop('checked', false);
            self.handleChange(userID, false);
            self.memberFilterCount();
        });
    }

    renderTableItem(userID, index) {
        if (this.props.subAccounts && this.props.subAccounts) {
            const { subAccounts, isAuthorizedToDelete } = this.props;
            const user = subAccounts.find(u => u.ID == userID);
            if (user && user.ID) {
                return (
                    <tr key={index}>
                        <td> {user.DisplayName || user.UserName || `${user.FirstName} ${user.LastName}`} </td>
                        <td className="action-mode" data-th="">
                            <PermissionTooltip isAuthorized={isAuthorizedToDelete} extraClassOnUnauthorized={"icon-grey"}>
                                <a className="delete-group-member-act" onClick={() => this.deleteMember(user.ID)} data-id={user.ID} href={null}>
                                    <i className="icon icon-delete"></i>
                                </a>
                            </PermissionTooltip>
                        </td>
                    </tr>  
                );
            }
        }
        return;
    }

    renderUserTableContents() {
        const self = this;
        if (this.state.DisplayedUsers && this.state.DisplayedUsers.length > 0) {
            return (
                <tbody>
                    {this.state.DisplayedUsers.map((ID, index) => self.renderTableItem(ID, index))}
                </tbody>
            )
        } else {
            return (
                <tbody>
                    <tr className="notfound">
                        <td colSpan="3" className="text-center" style={{ textAlign: 'center' }}> There's nothing to see here, Select user from the field above</td>
                    </tr>
                </tbody>
            );
        }
    }

    clearAll() {
        const self = this;
        if (!this.props.isAuthorizedToDelete) return;
        this.props.validatePermissionToPerformAction('delete-consumer-create-user-group-api', () => {
            $('.x-clear').parents('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', false).trigger('change');
            self.setState({ SelectedUsers: [] }, () => self.updateDisplayedUsers())
        });
    }

    render() {
        const { isAuthorizedToEdit, isAuthorizedToDelete } = this.props;
        return (
            <React.Fragment>
                <section className="sassy-box">
                    <div className="sassy-box-content box-order-detail user-group-create-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-element">
                                    <label>Group Name</label>
                                    <input 
                                        type="text"
                                        name="group_name"
                                        maxLength="30"
                                        id="user_group_name"
                                        className="form-control required"
                                        data-react-state-name="Name"
                                        value={this.state.Name}
                                        onChange={(e) => this.onChange(e)}
                                    />
                                </div>
                                <div className="form-element">
                                    <label> Select Users</label>
                                    <div className="advanced-select" data-model="Users selected">
                                        <div className="dropdown">
                                            <input id="Merchants" type="button" data-default="Search..." value="Search..." className="trigger required" placeholder="Search..." />
                                            <PermissionTooltip isAuthorized={isAuthorizedToDelete} extraClassOnUnauthorized={"icon-grey"}>
                                                <a href={null} className="x-clear" onClick={() => this.clearAll()}>
                                                    <i className="fa  fa-times-circle"></i>
                                                </a>
                                            </PermissionTooltip>
                                            <a href="#" className="btn-toggle" data-toggle="dropdown" aria-expanded="true"><b className="caret"></b></a>
                                            <ul className="dropdown-menu">
                                                <li className="skip-li">
                                                    <input type="text" className="q" placeholder="Search..." />
                                                </li>
                                                <li>
                                                    <a className="x-check parent-check" href={null}>
                                                        <PermissionTooltip isAuthorized={isAuthorizedToEdit} placement="right">
                                                            <input type="checkbox" disabled={!isAuthorizedToEdit} name="sub_accounts_0" id="sub_accounts_0" onChange={(e) => this.handleSelectAll(e.target.checked)}/>
                                                            <label htmlFor="sub_accounts_0" > Select All</label>
                                                        </PermissionTooltip>
                                                    </a>
                                                </li>
                                                {this.renderOptions()}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                </section>
                <div className="subaccount-data-table table-responsive">
                    <table className="table order-data1 sub-account tbl-department group-member-table">
                        <thead>
                            <tr>
                                <th>Display name</th>
                                <th></th>
                            </tr>
                        </thead>
                        {this.renderUserTableContents()}
                    </table>
                    <PaginationComponent totalRecords={this.state.SelectedUsers.length} pageSize={PAGE_SIZE} pageNumber={this.state.currentPage} goToPage={(pageNumber) => this.updateDisplayedUsers(pageNumber)} />
                </div>
            </React.Fragment>
        )
    }
}; 

module.exports = FormComponent;