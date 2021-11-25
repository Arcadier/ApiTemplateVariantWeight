'use strict';
const React = require('react');
const PermissionTooltip = require('../../common/permission-tooltip');

if (typeof window !== 'undefined') { var $ = window.$; }

class PermissionTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            AllViewEnabled: false,
            AllAddEnabled: false,
            AllEditEnabled: false,
            AllDeleteEnabled: false,
            LinkedPermissions: ((props.permissionProfile && props.permissionProfile.Permissions) || []),
        }
    }

    componentWillMount() {
        this.setState({
            AllViewEnabled: this.isAllOfAccessTypeEnabled("view"),
            AllAddEnabled: this.isAllOfAccessTypeEnabled("add"),
            AllEditEnabled: this.isAllOfAccessTypeEnabled("edit"),
            AllDeleteEnabled: this.isAllOfAccessTypeEnabled("delete"),
        });
    }

    isAllOfAccessTypeEnabled(type) {
        //checks if all permissions starting with var type is enabled
        const self = this;
        if (this.props && this.props.permissions && this.props.permissions.length > 0) {
            const { LinkedPermissions } = this.state;
            const { permissions } = this.props;
            const permissionCodes = permissions.filter(p => p.Code.startsWith(type.toLowerCase())).map(p => p.Code);
            return permissionCodes.every(p => LinkedPermissions.includes(p));
        }
        return false;
    }

    onHeaderCheckboxChange(type, isChecked) {
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        const code = `edit-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-create-account-permission-api`;
        this.props.validatePermissionToPerformAction(code, () => {
            const hasViewDisabled = type == "view" && !isChecked;
            const hasNonViewEnabled = isChecked && ["add", "edit", "delete"].includes(type);

            const updatedStateValues = {
                LinkedPermissions: self.state.LinkedPermissions
            }
            const permissionCodes = self.props.permissions.filter(p => p.Code.startsWith(type)).map(p => p.Code);
            if (isChecked) {
                updatedStateValues.LinkedPermissions = [...updatedStateValues.LinkedPermissions, ...permissionCodes];
                // add all view permission counterpart if other access type is enabled
                if (["add", "edit", "delete"].includes(type)) {
                    let pattern = "";
                    switch (type) {
                        case "add":
                            pattern = new RegExp(/^add-/, "g");
                            break;
                        case "edit":
                            pattern = new RegExp(/^edit-/, "g");
                            break;
                        case "delete":
                            pattern = new RegExp(/^delete-/, "g");
                            break;
                    }
                    let viewPermissionCodes = permissionCodes.map(p => p.replace(pattern, 'view-'));

                    if (self.props.isMerchantAccess && type == 'add') {
                        const index = viewPermissionCodes.indexOf('view-merchant-chat-details-api');

                        if (index >= 0) {
                            viewPermissionCodes[index] = 'view-consumer-chat-details-api';
                        }
                    }

                    updatedStateValues.LinkedPermissions = [...updatedStateValues.LinkedPermissions, ...viewPermissionCodes]
                }
            } else {
                updatedStateValues.LinkedPermissions = updatedStateValues.LinkedPermissions.filter(p => !permissionCodes.includes(p));
                // remove all permissions if view is disabled
                if (type == "view") {
                    updatedStateValues.LinkedPermissions = [];
                }
            }
            
            // update state values for display
            switch (type) {
                case "view":
                    updatedStateValues.AllViewEnabled = isChecked;
                    break;
                case "add":
                    updatedStateValues.AllAddEnabled = isChecked;
                    break;
                case "edit":
                    updatedStateValues.AllEditEnabled = isChecked;
                    break;
                case "delete":
                    updatedStateValues.AllDeleteEnabled = isChecked;
                    break;
            }

            if (hasNonViewEnabled) {
                updatedStateValues.AllViewEnabled = self.isAllOfAccessTypeEnabled("view");
            }
            if (hasViewDisabled) {
                updatedStateValues.AllAddEnabled = false;
                updatedStateValues.AllEditEnabled = false;
                updatedStateValues.AllDeleteEnabled = false;
            }
            updatedStateValues.LinkedPermissions = [...new Set(updatedStateValues.LinkedPermissions)];

            self.setState({ ...updatedStateValues });
        });
    }

    onCheckboxChange(permission, isChecked) {
        const self = this;
        if (!this.props.isAuthorizedToEdit) return;
        const code = `edit-${this.props.isMerchantAccess ? 'merchant' : 'consumer'}-create-account-permission-api`;
        this.props.validatePermissionToPerformAction(code, () => {
            let updatedStateValues = {
                LinkedPermissions: self.state.LinkedPermissions
            }       
            const permissionCodeWithoutAccessPrefix = permission.Code.replace(new RegExp(/^(view-)|(add-)|(delete-)|(edit-)/, "g"), '');
            if (isChecked) {
                updatedStateValues.LinkedPermissions = [...updatedStateValues.LinkedPermissions, permission.Code];
                // enable View if any of the other access types are enabled
                if (["Add", "Edit", "Delete"].includes(permission.AccessType)) {
                    let viewPermissionCode = `view-${permissionCodeWithoutAccessPrefix}`;

                    if (self.props.isMerchantAccess && permission.Code == 'add-merchant-chat-details-api') {
                        viewPermissionCode = viewPermissionCode.replace('view-merchant', 'view-consumer');
                    }

                    updatedStateValues.LinkedPermissions = [...updatedStateValues.LinkedPermissions, viewPermissionCode];
                }
            } else {
                updatedStateValues.LinkedPermissions = updatedStateValues.LinkedPermissions.filter(p => p !== permission.Code);
                // disable other types if access to view is disabled
                if ("View" == permission.AccessType) {
                    const addCodeStr = `add-${permissionCodeWithoutAccessPrefix}`;
                    const editCodeStr = `edit-${permissionCodeWithoutAccessPrefix}`;
                    const deleteCodeStr = `delete-${permissionCodeWithoutAccessPrefix}`;

                    updatedStateValues.LinkedPermissions = updatedStateValues.LinkedPermissions.filter(p => ![addCodeStr, editCodeStr, deleteCodeStr].includes(p));

                    if (self.props.isMerchantAccess && permission.Name == 'Chat Details' && permission.PageType == 'Consumer') {
                        updatedStateValues.LinkedPermissions = updatedStateValues.LinkedPermissions.filter(p => !['add-merchant-chat-details-api'].includes(p));
                    }

                    updatedStateValues = {
                        ...updatedStateValues,
                        AllViewEnabled: false,
                        AllAddEnabled: false,
                        AllEditEnabled: false,
                        AllDeleteEnabled: false
                    };
                } else {
                    switch (permission.AccessType.toLowerCase()) {
                        case "add":
                            updatedStateValues.AllAddEnabled = false;
                            break;
                        case "edit":
                            updatedStateValues.AllEditEnabled = false;
                            break;
                        case "delete":
                            updatedStateValues.AllDeleteEnabled = false;
                            break;
                    }
                }
            }
            updatedStateValues.LinkedPermissions = [...new Set(updatedStateValues.LinkedPermissions)];
            self.setState({ ...updatedStateValues }, () => {
                //update value of header checkbox
                const enableAccessTypeHeaderCheckbox = self.isAllOfAccessTypeEnabled(permission.AccessType);
                if (enableAccessTypeHeaderCheckbox) {
                    switch (permission.AccessType.toLowerCase()) {
                        case "view":
                            self.setState({ AllViewEnabled: enableAccessTypeHeaderCheckbox });
                            break;
                        case "add":
                            self.setState({ AllAddEnabled: enableAccessTypeHeaderCheckbox });
                            break;
                        case "edit":
                            self.setState({ AllEditEnabled: enableAccessTypeHeaderCheckbox });
                            break;
                        case "delete":
                            self.setState({ AllDeleteEnabled: enableAccessTypeHeaderCheckbox });
                            break;
                    }
                }
            });
        });
    }

    getPages() {
        let pages = [];

        if (this.props.permissions && this.props.permissions.length > 0) {
            const Permissions = this.props.permissions;
            const consumerPageType = 'Consumer';
            const merchantPageType = 'Merchant';

            const self = this;

            pages = [
                {
                    Name: "Homepage",
                    Permissions: Permissions.filter(p => p.Name === "Home" && p.PageType == consumerPageType),
                },
                {
                    Name: "Purchase Order History List",
                    Permissions: Permissions.filter(p => p.Name === "Purchase Orders" && p.PageType == consumerPageType),
                    Pages: [
                        {
                            Name: "Purchase Order History Details",
                            Permissions: Permissions.filter(p => p.Name === "Purchase Order Details" && p.PageType == consumerPageType),
                        }
                    ]
                },
                {
                    Name: "Quotation List",
                    Permissions: Permissions.filter(p => p.Name === "Quotations" && p.PageType == consumerPageType),
                    Pages: [
                        {
                            Name: "Quotation Details",
                            Permissions: Permissions.filter(p => p.Name === "Quotation Details" && p.PageType == consumerPageType),
                        }
                    ]
                },
                {
                    Name: "Requisition Order List",
                    Permissions: Permissions.filter(p => p.Name === "Requisition Orders" && p.PageType == consumerPageType),
                    Pages: [
                        {
                            Name: "Requisition Order Details",
                            Permissions: Permissions.filter(p => p.Name === "Requisition Order Details" && p.PageType == consumerPageType),
                        }
                    ]
                },
                {
                    Name: "Receiving Notes List",
                    Permissions: Permissions.filter(p => p.Name === "Receiving Notes" && p.PageType == consumerPageType),
                    Pages: [
                        {
                            Name: "Receiving Notes Details Page",
                            Permissions: Permissions.filter(p => p.Name === "Receiving Note Details" && p.PageType == consumerPageType),
                        },
                        {
                            Name: "Create Receiving Notes",
                            Permissions: Permissions.filter(p => p.Name === "Create Receiving Note" && p.PageType == consumerPageType),
                        }
                    ]
                },
                {
                    Name: "Invoice List",
                    Permissions: Permissions.filter(p => p.Name === "Invoices" && p.PageType == consumerPageType),
                    Pages: [
                        {
                            Name: "Invoice Details",
                            Permissions: Permissions.filter(p => p.Name === "Invoice Details" && p.PageType == consumerPageType),
                        }
                    ]
                },
                {
                    Name: 'Sub Account',
                    LabelOnly: true,
                    Pages: [
                        {
                            Name: "Account List",
                            Permissions: Permissions.filter(p => p.Name === "Sub-Accounts" && p.PageType == consumerPageType),
                        },
                        {
                            Name: "Activity Logs",
                            Permissions: Permissions.filter(p => p.Name === "Activity Logs" && p.PageType == consumerPageType),
                        },
                        {
                            Name: "User Groups",
                            Permissions: Permissions.filter(p => p.Name === "User Groups" && p.PageType == consumerPageType),
                            Pages: [
                                {
                                    Name: "Create User Group",
                                    Permissions: Permissions.filter(p => p.Name === "Create User Group" && p.PageType == consumerPageType),
                                }
                            ],
                        },
                        {
                            Name: "User Permission Page",
                            Permissions: Permissions.filter(p => p.Name === "Account Permissions" && p.PageType == consumerPageType),
                            Pages: [
                                {
                                    Name: "Create User Permission",
                                    Permissions: Permissions.filter(p => p.Name === "Create Account Permission" && p.PageType == consumerPageType),
                                }
                            ],
                        },
                    ]
                },
                {
                    Name: "Inbox",
                    Permissions: Permissions.filter(p => p.Name === "Inbox" && p.PageType == consumerPageType),
                    Pages: [
                        {
                            Name: "Chat Details Page",
                            Permissions: Permissions.filter(p => p.Name === "Chat Details" && (p.PageType == consumerPageType || (p.AccessType == 'Add' && p.PageType == merchantPageType))),
                        }
                    ]
                },
                {
                    Name: "User Settings",
                    LabelOnly: true,
                    Pages: [
                        {
                            Name: "Profile",
                            Permissions: Permissions.filter(p => p.Name === "Profile" && p.PageType == consumerPageType),
                        },
                        {
                            Name: "Address",
                            Permissions: Permissions.filter(p => p.Name === "Addresses" && p.PageType == consumerPageType),
                        },
                    ]
                },
                {
                    Name: "Item Details",
                    Permissions: Permissions.filter(p => p.Name === "Item Details" && p.PageType == consumerPageType),
                },
                {
                    Name: "Comparison Table List",
                    Permissions: Permissions.filter(p => p.Name === "Comparison Tables" && p.PageType == consumerPageType),
                    Pages: [
                        {
                            Name: "Comparison Table Details",
                            Permissions: Permissions.filter(p => p.Name === "Comparison Table Details" && p.PageType == consumerPageType),
                        },
                    ]
                },
                {
                    Name: "Cart Page List",
                    Permissions: Permissions.filter(p => p.Name === "Cart" && p.PageType == consumerPageType),
                },
                {
                    Name: function () {
                        const checkoutPageName = "One Page Checkout";
                        const page = (self.props.pageNameOverrides || []).find(p => p.Reference == checkoutPageName);
                        return (page != null && page.Name) || checkoutPageName;
                    }(),
                    Permissions: Permissions.filter(p => p.Name === "Checkout" && p.PageType == consumerPageType),
                },
                {
                    Name: "Search Results Page",
                    Permissions: Permissions.filter(p => p.Name === "Item Search" && p.PageType == consumerPageType),
                },
                {
                    Name: "About Us",
                    Permissions: Permissions.filter(p => p.Name === "About Us" && p.PageType == consumerPageType),
                },
                {
                    Name: "Terms of Service",
                    Permissions: Permissions.filter(p => p.Name === "Terms of Service" && p.PageType == consumerPageType),
                },
                {
                    Name: "Privacy Policy",
                    Permissions: Permissions.filter(p => p.Name === "Privacy Policy" && p.PageType == consumerPageType),
                },
                {
                    Name: "Return Policy",
                    Permissions: Permissions.filter(p => p.Name === "Return Policy" && p.PageType == consumerPageType),
                },
                {
                    Name: "Contact",
                    Permissions: Permissions.filter(p => p.Name === "Contact Us" && p.PageType == consumerPageType),
                },
                {
                    Name: "FAQ",
                    Permissions: Permissions.filter(p => p.Name === "FAQ" && p.PageType == consumerPageType),
                },
                {
                    Name: "Comparison Widget",
                    Permissions: Permissions.filter(p => p.Name === "Comparison Widget" && p.PageType == consumerPageType),
                },
                {
                    Name: "Approval",
                    LabelOnly: true,
                    Pages: [
                        {
                            Name: "Approval Toggle/Settings",
                            Permissions: Permissions.filter(p => p.Name === "Approval Settings" && p.PageType == consumerPageType),
                        },
                        {
                            Name: "Workflow",
                            Permissions: Permissions.filter(p => p.Name === "Approval Workflows" && p.PageType == consumerPageType),
                            Pages: [
                                {
                                    Name: "Create Workflow",
                                    Permissions: Permissions.filter(p => p.Name === "Create Approval Workflow" && p.PageType == consumerPageType),
                                },
                                {
                                    Name: "View Workflow Details",
                                    Permissions: Permissions.filter(p => p.Name === "Approval Workflow Details" && p.PageType == consumerPageType),
                                },
                            ]
                        },
                        {
                            Name: "Department",
                            Permissions: Permissions.filter(p => p.Name === "Approval Departments" && p.PageType == consumerPageType),
                            Pages: [
                                {
                                    Name: "Create Department",
                                    Permissions: Permissions.filter(p => p.Name === "Create Approval Department" && p.PageType == consumerPageType),
                                },
                            ]
                        },
                    ]
                },
                {
                    Name: "Change Password",
                    Permissions: Permissions.filter(p => p.Name === "Change Password" && p.PageType == consumerPageType),
                },
            ];
        }

        return pages;
    }

    getPagesMerchant() {
        let pages = [];

        if (this.props.permissions && this.props.permissions.length > 0) {
            const Permissions = this.props.permissions;
            const consumerPageType = 'Consumer';
            const merchantPageType = 'Merchant';

            pages = [
                {
                    Name: "Purchase Order History List",
                    Permissions: Permissions.filter(p => p.Name === "Purchase Orders" && p.PageType == merchantPageType),
                    Pages: [
                        {
                            Name: "Purchase Order History Details",
                            Permissions: Permissions.filter(p => p.Name === "Purchase Order Details" && p.PageType == merchantPageType),
                        }
                    ]
                },
                {
                    Name: "Quotation List",
                    Permissions: Permissions.filter(p => p.Name === "Quotations" && p.PageType == merchantPageType),
                    Pages: [
                        {
                            Name: "Quotation Details",
                            Permissions: Permissions.filter(p => p.Name === "Quotation Details" && p.PageType == merchantPageType),
                        }
                    ]
                },
                {
                    Name: "Invoice List",
                    Permissions: Permissions.filter(p => p.Name === "Invoices" && p.PageType == merchantPageType),
                    Pages: [
                        {
                            Name: "Invoice Details",
                            Permissions: Permissions.filter(p => p.Name === "Invoice Details" && p.PageType == merchantPageType),
                        },
                        {
                            Name: "Create Invoice",
                            Permissions: Permissions.filter(p => p.Name === "Create Invoice" && p.PageType == merchantPageType),
                        }
                    ]
                },
                {
                    Name: 'Sub Account',
                    LabelOnly: true,
                    Pages: [
                        {
                            Name: "Account List",
                            Permissions: Permissions.filter(p => p.Name === "Sub-Accounts" && p.PageType == merchantPageType),
                        },
                        {
                            Name: "Activity Logs",
                            Permissions: Permissions.filter(p => p.Name === "Activity Logs" && p.PageType == merchantPageType),
                        },
                        {
                            Name: "User Groups",
                            Permissions: Permissions.filter(p => p.Name === "User Groups" && p.PageType == merchantPageType),
                            Pages: [
                                {
                                    Name: "Create User Group",
                                    Permissions: Permissions.filter(p => p.Name === "Create User Group" && p.PageType == merchantPageType),
                                }
                            ],
                        },
                        {
                            Name: "User Permission Page",
                            Permissions: Permissions.filter(p => p.Name === "Account Permissions" && p.PageType == merchantPageType),
                            Pages: [
                                {
                                    Name: "Create User Permission",
                                    Permissions: Permissions.filter(p => p.Name === "Create Account Permission" && p.PageType == merchantPageType),
                                }
                            ],
                        },
                    ]
                },
                {
                    Name: "Inbox",
                    Permissions: Permissions.filter(p => p.Name === "Inbox" && p.PageType == consumerPageType && p.AccessType == 'View'),
                    Pages: [
                        {
                            Name: "Chat Details Page",
                            Permissions: Permissions.filter(p => p.Name === "Chat Details" && ((p.PageType == consumerPageType && p.AccessType == 'View') || (p.PageType == merchantPageType && p.AccessType == 'Add'))),
                        },
                        {
                            Name: "Create Quotation",
                            Permissions: Permissions.filter(p => p.Name === "Create Quotation" && p.PageType == merchantPageType),
                        }
                    ]
                },
                {
                    Name: "User Settings",
                    LabelOnly: true,
                    Pages: [
                        {
                            Name: "Profile",
                            Permissions: Permissions.filter(p => p.Name === "Profile" && p.PageType == merchantPageType),
                        },
                        {
                            Name: "Address",
                            Permissions: Permissions.filter(p => p.Name === "Addresses" && p.PageType == merchantPageType),
                        },
                        {
                            Name: "Payment",
                            Permissions: Permissions.filter(p => p.Name === "Payment Methods" && p.PageType == merchantPageType),
                        },
                        {
                            Name: "Payment Term",
                            Permissions: Permissions.filter(p => p.Name === "Payment Terms" && p.PageType == merchantPageType),
                        }
                    ]
                },
                {
                    Name: "Item Upload",
                    Permissions: Permissions.filter(p => p.Name === "Create Item" && p.PageType == merchantPageType),
                },
                {
                    Name: "Item Details",
                    Permissions: Permissions.filter(p => p.Name === "Item Details" && p.PageType == consumerPageType),
                },
                {
                    Name: "Dashboard",
                    Permissions: Permissions.filter(p => p.Name === "Dashboard" && p.PageType == merchantPageType),
                },
                {
                    Name: "Inventory List",
                    Permissions: Permissions.filter(p => p.Name === "Inventory" && p.PageType == merchantPageType),
                },
                {
                    Name: "Delivery/Shipping",
                    Permissions: Permissions.filter(p => p.Name === "Delivery Methods" && p.PageType == merchantPageType),
                    Pages: [
                        {
                            Name: "Delivery Option/Add",
                            Permissions: Permissions.filter(p => p.Name === "Delivery Option" && p.PageType == merchantPageType),
                        }
                    ]
                },
                {
                    Name: "Change Password",
                    Permissions: Permissions.filter(p => p.Name === "Change Password" && p.PageType == consumerPageType),
                },
            ];
        }

        return pages;
    }

    renderPermissionTableItems() {
        const self = this;
        const pages = !this.props.isMerchantAccess ? this.getPages() : this.getPagesMerchant();

        if (pages && pages.length > 0) {
            return pages.map((page, index) => self.renderPermissionTableItem(page, index));
        }
        return;
    }

    renderPermissionTableItem(page, index, depth = 0, arr = []) {
        const self = this;
        var classStr = "";
        if (depth == 1) {
            classStr = 'with-subs'
        } else if (depth == 2) {
            classStr = 'with-subs with-subs-subs';
        } else if (depth == 3) {
            classStr = 'with-subs with-subs-4subs';
        }

        if (page.Permissions && page.Permissions.length > 0) {
            arr.push(
                <tr className={classStr} key={index}>
                    <td data-title="Page Name">
                        {depth > 0 ? <i className="icon icon-sub"></i> : ''}
                        {page.Name}
                    </td>
                    {this.renderCheckboxRow(page.Permissions)}
                </tr>
            );
        }

        if (page.LabelOnly && page.Pages.some(p => p.Permissions && p.Permissions.length > 0)) {
            arr.push(
                <tr  key={index}>
                    <td data-title="Page Name">
                        {page.Name}
                    </td>
                    <td colSpan="4" />
                </tr>
            );
        }

        if (page.Pages && page.Pages.length > 0) {
            page.Pages.forEach((sub, subIndex) => arr = self.renderPermissionTableItem(sub, `${index}-${subIndex}`, depth + 1, arr));
        }

        return arr;
    }

    renderCheckboxRow(permissions) {
        const { isAuthorizedToEdit } = this.props;
        const accessTypes = ["View", "Add", "Edit", "Delete"];
        return accessTypes.map(type => {
            let permission = permissions.find(p => p.AccessType == type);
            if (permission && permission.Code) {
                return (
                    <td data-title={type}>
                        <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                            <div className=" fancy-checkbox">
                                    <input
                                        type="checkbox"
                                        id={permission.Code}
                                        className={`blslst-cmn-${type.toLowerCase()}`}
                                        value="1"
                                        disabled={!isAuthorizedToEdit}
                                        checked={this.state.LinkedPermissions.includes(permission.Code)}
                                        onChange={(e) => this.onCheckboxChange(permission, e.target.checked)}
                                    />
                                    <label htmlFor={permission.Code}>&nbsp;</label>
                            </div>
                        </PermissionTooltip>
                    </td>
                );
            } else {
                return (<td data-title={type}><div className=" fancy-checkbox" /></td>);
            }
        });
    }

    render() {
        const { isAuthorizedToEdit } = this.props;
        return (
            <React.Fragment>
                <p className="add-admn-prmsn-prgf">Select the page permissions for this profile. </p>
                <section className="sassy-box">
                    <div className="sassy-box-content permission-table">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Page Name</th>
                                                <th className="text-center">
                                                    <div className="align-items-center d-flex" style={{ display: 'flex' }}>
                                                        <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                                            <div className="fancy-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    id="blslst-cmn-chkalview"
                                                                    className="blslst-cmn-chk-allview"
                                                                    value="1"
                                                                    disabled={!isAuthorizedToEdit}
                                                                    checked={this.state.AllViewEnabled}
                                                                    onChange={(e) => this.onHeaderCheckboxChange("view", e.target.checked)}
                                                                />
                                                                <label htmlFor="blslst-cmn-chkalview">View</label>
                                                            </div>
                                                        </PermissionTooltip>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div className="align-items-center d-flex" style={{ display: 'flex' }}>
                                                        <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                                            <div className="fancy-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    id="blslst-cmn-chkaladd"
                                                                    className="blslst-cmn-chk-alladd"
                                                                    value="1"
                                                                    disabled={!isAuthorizedToEdit}
                                                                    checked={this.state.AllAddEnabled}
                                                                    onChange={(e) => this.onHeaderCheckboxChange("add", e.target.checked)}
                                                                />
                                                                <label htmlFor="blslst-cmn-chkaladd">Add</label>
                                                            </div>
                                                        </PermissionTooltip>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div className="align-items-center d-flex" style={{ display: 'flex' }}>
                                                        <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                                            <div className=" fancy-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    id="blslst-cmn-chkaledit"
                                                                    className="blslst-cmn-chk-alledit"
                                                                    value="1"
                                                                    disabled={!isAuthorizedToEdit}
                                                                    checked={this.state.AllEditEnabled}
                                                                    onChange={(e) => this.onHeaderCheckboxChange("edit", e.target.checked)}
                                                                />
                                                                <label htmlFor="blslst-cmn-chkaledit">Edit</label>
                                                            </div>
                                                        </PermissionTooltip>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div className="align-items-center d-flex" style={{ display: 'flex' }}>
                                                        <PermissionTooltip isAuthorized={isAuthorizedToEdit}>
                                                            <div className=" fancy-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    id="blslst-cmn-chkaldelete"
                                                                    className="blslst-cmn-chk-alldelete"
                                                                    value="1"
                                                                    disabled={!isAuthorizedToEdit}
                                                                    checked={this.state.AllDeleteEnabled}
                                                                    onChange={(e) => this.onHeaderCheckboxChange("delete", e.target.checked)}
                                                                />
                                                                <label htmlFor="blslst-cmn-chkaldelete">Delete</label>
                                                            </div>
                                                        </PermissionTooltip>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                           {this.renderPermissionTableItems()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        )
    }
}; 

module.exports = PermissionTable;