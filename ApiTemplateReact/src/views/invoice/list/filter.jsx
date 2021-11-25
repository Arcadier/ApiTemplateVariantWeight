const React = require('react');
var BaseComponent = require('../../shared/base');
require('daterangepicker');

if (typeof window !== 'undefined') { var $ = window.$; }

class InvoiceListFilterComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            filterStatusOptions: '',
            filterPaymentMethodOptions: '', 
            filterPaymentDueOptions: '', 
            filterUserOptions: '',
            timestamp: ''
        }
        this.onChange = this.onChange.bind(this);      
        this.pageSizeOptions = [10, 20, 50, 100];        
    }

    componentDidMount() {
        const self = this;       
        //Filter Range Calendar
        $('#filter-datepicker').daterangepicker({
            autoUpdateInput: false,
            opens: 'left',
            locale: {
                cancelLabel: 'Clear'
            }
        });
  
        //$('#filter-datepicker').val('Timestamp');
        $('#filter-datepicker').on('apply.daterangepicker', function(ev, picker) {
            self.props.onTimestampChanged(picker.startDate.utc(true).format(), picker.endDate.utc(true).format());
            self.setState({
                timestamp: picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY') 
            });
            //$(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            $(this).addClass('filled');
        });
  
        $('#filter-datepicker').on('cancel.daterangepicker', function(ev, picker) {
            self.props.onTimestampChanged(null, null);
            self.setState({
                timestamp: ''
            });
            //$(this).val('');
            $(this).removeClass('filled');
        });
        //Filter Range Calendar 
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    render() {
        let { isUserMerchant = false, users = [], statuses = [], paymentGateways = [], paymentDues = [], selectedPageSize } = this.props;
        const { filterUserOptions, filterStatusOptions, filterPaymentMethodOptions, filterPaymentDueOptions, timestamp } = this.state;

        //User
        let userType = isUserMerchant ? 'Buyer' : 'Supplier';
        let filterUserLabel = userType;
        let selectedUser = 0;
        if (users) {
            users.forEach(user => {
                if (user.isChecked && user.ID != '0') {
                    filterUserLabel = user.DisplayName;
                    selectedUser += 1;
                }
            });
        }
        if (selectedUser > 1) {
            filterUserLabel = `${selectedUser} ${userType}`
        }
        if (!!filterUserOptions) {
            users = users.filter((item) => item.DisplayName.toLowerCase().includes(filterUserOptions.toLowerCase()));
        }

        //Status
        let filterStatusLabel = 'Status';
        let selectedStatus = 0;
        if (statuses) {
            statuses.forEach(status => {
                if (status.isChecked && status.Name !== 'Select All') {
                    filterStatusLabel = status.Name;
                    selectedStatus += 1;
                }
            })
        }
        if (selectedStatus > 1) {
            filterStatusLabel = `${selectedStatus} Payment Status`;
        }        
        if (!!filterStatusOptions) {
            statuses = statuses.filter((item) => item.Name.toLowerCase().includes(filterStatusOptions.toLowerCase()));
        }

        //Payment Methods
        let filterPaymentMethodLabel = 'Payment Method';
        let selectedPaymentMethod = 0;
        if (paymentGateways) {
            paymentGateways.forEach(g => {
                if (g.isChecked && g.Code != "0") {
                    filterPaymentMethodLabel = g.Gateway;
                    selectedPaymentMethod += 1;
                }
            })
        }
        if (selectedPaymentMethod > 1) {
            filterPaymentMethodLabel = `${selectedPaymentMethod} Payment Method`;
        }
        if (!!filterPaymentMethodOptions) {
            paymentGateways = paymentGateways.filter((item) => item.Gateway.toLowerCase().includes(filterPaymentMethodOptions.toLowerCase()));
        }

        //Payment Due
        let filterPaymentDueLabel = 'Payment Due';
        let selectedPaymentDue = 0;
        if (paymentDues) {
            paymentDues.forEach(p => {
                if (p.isChecked && p.ID != '0') {
                    filterPaymentDueLabel = p.Value;
                    selectedPaymentDue += 1;
                }
            });
        }
        if (selectedPaymentDue > 1) {
            filterPaymentDueLabel = `${selectedPaymentDue} Payment Due;`
        }
        if (!!filterPaymentDueOptions) {
            paymentDues = paymentDues.filter((item) => item.Value.toLowerCase().includes(filterPaymentDueOptions.toLowerCase()));
        }

        return( 
            <div className="sassy-filter lg-filter">
                <form action="" id="search" onSubmit={this.props.applyFilter}>
                    <div className="sassy-flex">
                        <div className="sassy-l grey_filter">
                            <div>
                                <div className="group-search">
                                    <div className="group-search-flex">
                                    <label htmlFor="" className="sassy-label">Filter by:</label>
                                        <span className="sassy-search">
                                            <input 
                                                className="form-control" 
                                                name="keywords" 
                                                id="keywords" 
                                                placeholder="Search" 
                                                value={this.props.keywords}
                                                onChange={this.props.onSearchKeywordChanged}
                                            />
                                            <input 
                                                type="submit" 
                                                className="searh-btn" 
                                            />
                                        </span>
                                        <div className="filter-list-date-sec sassy-datepicker">
                                            <div className="group-datepicker">
                                                <input 
                                                    type="text" 
                                                    name="timestamp" 
                                                    id="filter-datepicker" 
                                                    placeholder="Timestamp" 
                                                    autoComplete="off" 
                                                    value={timestamp}                                                    
                                                />
                                                <b className="caret"></b>
                                            </div>
                                        </div>
                                        <span className="select-sassy-wrapper">
                                            <div className="advanced-select" data-model="supplier ">
                                                <div className="dropdown">
                                                    <input id="user" type="button" data-default={userType} value={filterUserLabel} className="trigger" />
                                                    <a href="#" className="btn-toggle" data-toggle="dropdown">
                                                        <b className="caret"></b>
                                                    </a>
                                                    {(selectedUser > 0) && <a href="#" className="x-clear" style={{ display: 'inline-block' }} onClick={() => this.props.onClearSelectedItems('users')}><i className="fa  fa-times-circle"></i></a>}
                                                    <ul className="dropdown-menu">
                                                        <li className="skip-li">
                                                            <input type="text"
                                                                className="q"
                                                                placeholder="Search"
                                                                name='filterUserOptions'
                                                                onChange={this.onChange}
                                                                value={this.state.filterUserOptions}
                                                            />
                                                        </li>
                                                        {/* checkbox and immediate label id must unique for every checkbox */}
                                                        {
                                                            users.map((u, index) => {
                                                                return (
                                                                    <li key={`userkey-${index}`}>
                                                                        <a className={index == 0 ? "x-check parent-check" : "x-check"} href="#">
                                                                            <input
                                                                                type="checkbox"
                                                                                name={`U_${index}`}
                                                                                id={`U_${index}`}
                                                                                checked={!!u.isChecked}
                                                                                onChange={(e) => {
                                                                                    this.props.onSearchUserCheckboxChanged(u.ID);
                                                                                }}
                                                                            />
                                                                            <label htmlFor={`U_${index}`}> {u.DisplayName}</label>
                                                                        </a>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                        </span>
                                        <span className="select-sassy-wrapper">
                                            <div className="advanced-select" data-model="Payment Due">
                                                <div className="dropdown">
                                                    <input id="Paymentdue" type="button" data-default="Payment Due" value={filterPaymentDueLabel} className="trigger" />
                                                    <a href="#" className="btn-toggle" data-toggle="dropdown">
                                                        <b className="caret"></b>
                                                    </a>
                                                    {(selectedPaymentDue > 0) && <a href="#" className="x-clear" style={{display: 'inline-block'}} onClick={() => this.props.onClearSelectedItems('paymentdues')}><i className="fa  fa-times-circle"></i></a>}
                                                    <ul className="dropdown-menu">
                                                        <li className="skip-li">
                                                            <input 
                                                                type="text" 
                                                                className="q" 
                                                                placeholder="Search" 
                                                                name='filterPaymentDueOptions'
                                                                onChange={this.onChange}
                                                                value={this.state.filterPaymentDueOptions}
                                                            />
                                                        </li>
                                                        {/* checkbox and immediate label id must unique for every checkbox */}
                                                        {
                                                            paymentDues.map((p, index) => {
                                                                return (
                                                                    <li key={`duekey-${index}`}>
                                                                        <a className={index == 0 ? "x-check parent-check" : "x-check"} href="#">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                name={`Pd_${index}`} 
                                                                                id={`Pd_${index}`} 
                                                                                checked={!!p.isChecked}                                                                                
                                                                                onChange={(e) => {
                                                                                    this.props.onSearchPaymentDueCheckboxChanged(p.ID);
                                                                                }}  
                                                                            />
                                                                            <label htmlFor={`Pd_${index}`}> {p.Value}</label>
                                                                        </a>
                                                                    </li>
                                                                )
                                                            })
                                                        }                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                        </span>
                                        <span className="select-sassy-wrapper">
                                            <div className="advanced-select" data-model="Payment Method">
                                                <div className="dropdown">
                                                    <input id="Paymentmethod" type="button" data-default="Payment Method" value={filterPaymentMethodLabel} className="trigger" />
                                                    <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                                    {(selectedPaymentMethod > 0) && <a href="#" className="x-clear" style={{display: 'inline-block'}} onClick={() => this.props.onClearSelectedItems('paymentmethods')}><i className="fa  fa-times-circle"></i></a>}
                                                    <ul className="dropdown-menu">
                                                        <li className="skip-li">
                                                            <input 
                                                                type="text" 
                                                                className="q" 
                                                                placeholder="Search" 
                                                                name='filterPaymentMethodOptions'
                                                                onChange={this.onChange}
                                                                value={this.state.filterPaymentMethodOptions}
                                                            />
                                                        </li>
                                                        {/* checkbox and immediate label id must unique for every checkbox */}
                                                        { 
                                                            paymentGateways.map((g, index) => {
                                                                return (
                                                                    <li key={`gatewaykey-${index}`}>
                                                                        <a className={index == 0 ? "x-check parent-check" : "x-check"} href="#">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                name={`Pm_${index}`} 
                                                                                id={`Pm_${index}`} 
                                                                                checked={!!g.isChecked}                                                                                
                                                                                onChange={(e) => {
                                                                                    this.props.onSearchPaymentMethodCheckboxChanged(g.Code);
                                                                                }}  
                                                                            />
                                                                            <label htmlFor={`Pm_${index}`}> {g.Gateway}</label>
                                                                        </a>
                                                                    </li>
                                                                )
                                                            })
                                                        }                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                        </span>
                                        <span className="select-sassy-wrapper">
                                            <div className="advanced-select" data-model="Payment Status">
                                                <div className="dropdown">
                                                    <input id="PaymentStatus" type="button" data-default="Status" value={filterStatusLabel} className="trigger" />
                                                    <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                                    { (selectedStatus > 0) && <a href="#" className="x-clear" style={{display: 'inline-block'}} onClick={() => this.props.onClearSelectedItems('statuses')}><i className="fa  fa-times-circle"></i></a> }                                                    
                                                    <ul className="dropdown-menu">
                                                        <li className="skip-li">
                                                            <input 
                                                                type="text" 
                                                                className="q" 
                                                                placeholder="Search" 
                                                                name='filterStatusOptions'
                                                                onChange={this.onChange}
                                                                value={this.state.filterStatusOptions}
                                                            />
                                                        </li>
                                                        {/* checkbox and immediate label id must unique for every checkbox */}                                                        
                                                        {
                                                            statuses.map((status, index) => {
                                                                return (
                                                                    <li key={`statuskey-${status.Name}`}>
                                                                        <a className={index == 0 ? "x-check parent-check" : "x-check"} href="#">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                name={`St_${index}`} 
                                                                                id={`St_${index}`}    
                                                                                checked={!!status.isChecked}                                                                                
                                                                                onChange={(e) => {
                                                                                    this.props.onSearchStatusCheckboxChanged(status.Name);
                                                                                }}                                                                             
                                                                            />
                                                                            <label htmlFor={`St_${index}`}> {status.Name}</label>
                                                                        </a>
                                                                    </li>
                                                                )
                                                            })
                                                        }                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                        </span>
                                        <input type="submit" className="btn btn-sassy" value="Apply" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sassy-r">
                            <span className="select-sassy-wrapper sassy-arrow">
                                <select name="per-page" id="per-page" className="sassy-select" defaultValue={selectedPageSize} onChange={this.props.onChangePageSize}>
                                    {
                                        this.pageSizeOptions.map((size) => {
                                            return (
                                                <option key={`pageOption${size}`} value={size}>{size}</option>
                                            )
                                        })
                                    }
                                </select>                                
                            </span>
                            <label htmlFor="" className="sassy-label">Items per page</label>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
};

module.exports = InvoiceListFilterComponent;