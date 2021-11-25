const React = require('react');
var BaseComponent = require('../../shared/base');

if (typeof window !== 'undefined') { var $ = window.$; }

class POModalComponent extends BaseComponent {
    constructor(props) {
        super(props);        
        this.state = {
            searchPONumber: '', 
            selectedOrderPONum: '',
            // selectedOrderId: '', 
            showError: false
        }
        this.onChange = this.onChange.bind(this);
        this.selectInvoice = this.selectInvoice.bind(this);
        this.createInvoiceFromPO = this.createInvoiceFromPO.bind(this);
        this.verifyPO = this.verifyPO.bind(this);
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
        if (e.target.name.toLowerCase() == 'selectedorderponum') {
            this.verifyPO(e.target.value);
        }
    }

    selectInvoice(poNum) {
        this.verifyPO(poNum);
        this.setState({
            selectedOrderPONum: poNum
        });
        $('#poOptionsDropdown').removeClass('open');
    }

    verifyPO (poNum) {
        const po = this.props.purchaseOrders.filter((item) => (item.PurchaseOrderNo.toLowerCase() === poNum.toLowerCase()));
        if (po && po.length > 0) {
            this.setState({
                showError: false
            });
        }
        else {
            this.setState({
                showError: true
            });
        }
    }

    createInvoiceFromPO(e) {
        const self = this;
        e.preventDefault();

        this.props.validatePermissionToPerformAction(`add-${this.props.permissionPageType}-invoices-api`, () => {
            const poNum = $('#metric_affected').val();
            let hasError = false;
            if (poNum) {
                const po = self.props.purchaseOrders.filter((item) => ($.trim(item.PurchaseOrderNo) === $.trim(poNum)));
                if (po && po.length > 0) {
                    window.location.href = '/merchants/invoice/create?purchaseOrderId=' + po[0].ID;
                }
                else {

                    let po = this.props.purchaseOrders.filter((item) => ($.trim(item.CosmeticNo) === $.trim(poNum)));

                    if (po)
                        return window.location = '/merchants/invoice/create?purchaseOrderId=' + po[0].ID;
                    else
                        hasError = true;


                }
            }
            else {
                hasError = true;
            }

            if (hasError) {
                self.setState({
                    showError: true
                });
            }
        });
    }

    render() {
        let { purchaseOrders } = this.props;
        const { searchPONumber, selectedOrderPONum, showError } = this.state;
        if (searchPONumber) {
            purchaseOrders = purchaseOrders.filter(item => item.PurchaseOrderNo.toLowerCase().includes(searchPONumber.toLowerCase()));
        }
        //ARC10131 remove value
        return (
            <React.Fragment>
                <div id="modalHavePO" className="filter-modal modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog compare-delete-modal-content">
                        <div className="modal-content">
                            <i className='fas fa-times' data-dismiss="modal"></i>
                            <div className="modal-body">
                                <form id="po-form" autoComplete="off">
                                    <p align="left">Select the PO No.</p>
                                    <span className="select-sassy-wrapper" id="po_no-container">
                                        <div className="advanced-select" data-model="P.O. Number">
                                            <div id="poOptionsDropdown" className="dropdown">
                                                <input 
                                                    id="metric_affected" 
                                                    name="selectedOrderPONum" 
                                                    type="text" 
                                                    placeholder="PO Number" 
                                                    data-default=""                                                     
                                                    className="form-control sassy-control po-number" 
                                                    required="" 
                                                  
                                                    onChange={this.onChange}
                                                />
                                                <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                                <a href="#" className="x-clear"><i className="fa  fa-times-circle"></i></a>
                                                <ul className="dropdown-menu">
                                                    <li className="skip-li">
                                                        <input 
                                                            type="text" 
                                                            name="searchPONumber"
                                                            className="q" 
                                                            placeholder="Search P.O. Number" 
                                                            value={searchPONumber} 
                                                            onChange={this.onChange}
                                                        />
                                                    </li>
                                                    {/* checkbox and immediate label id must unique for every checkbox */}
                                                    {/* <li><a className="x-check parent-check" href="javascript:void(0)"><input type="checkbox" name="metric_0" id="metric_0"><label for="metric_0"> Select All</label></a></li> */}
                                                    {
                                                        purchaseOrders.map((order, index) => {
                                                            return (<li key={order.ID}>
                                                                <a className="x-check" onClick={() => (this.selectInvoice(order.PurchaseOrderNo))}>
                                                                    <input type="checkbox" name={order.PurchaseOrderNo} id={`po_${index}`} />
                                                                    <label htmlFor={`po_${index}`}> {order.CosmeticNo != null && order.CosmeticNo != "" ? order.CosmeticNo :  order.PurchaseOrderNo}</label>
                                                                </a>
                                                            </li>)
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </span>
                                </form>
                                <div>
                                    { showError &&
                                        <div className="po-warning">
                                            <span className="po-exist">PO number does not exist</span>
                                        </div>
                                    }
                                    <div className="clearfix"></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray btn-gray-border" data-dismiss="modal">Cancel</div>
                                <div className="btn-blue" id="poSubmit" onClick={this.createInvoiceFromPO}>Yes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
};

module.exports = POModalComponent;