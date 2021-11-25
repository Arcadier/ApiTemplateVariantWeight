'use strict';
var React = require('react');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ComparisonDetailModalComponent extends React.Component {
    deleteComparisonDetail() {
        this.props.deleteComparisonDetail();
        $('#modalRemove').modal('hide');
    }

    clearAllComparisonDetails() {
        this.props.clearAllComparisonDetails();
        $('#modalRemoveAll').modal('hide');
    }

    render() {
        return (
            <React.Fragment>
            <div>
                    <div id='cartItemEdit' className='modal fade' role='dialog'>
                        <div className='modal-dialog cart-edit-item'>
                        <div className='modal-content'>
                                <div className='modal-header'>
                            <button type='button' className='close' data-dismiss='modal'>�</button>
                            <h4 className='modal-title'>Selected Item name</h4>
                            <div className='item-price' id='totalPrice'> <span className='currency'>SGD $</span> <span className='value'>0</span> </div>
                          </div>
                            <div className='modal-body'>
                                  <div className='item-field'>
                                <span className='title'>
                                        <span>Colours:</span>
                                            <span className='select-option'>
                                                <select>
                                                    <option>White</option>
                                                <option>Blue</option>
                                                <option>Red</option>
                                              </select>
                                    <i className='fa fa-angle-down' />
                                  </span>
                                      </span>
                                <span className='title'>
                                          <span>Size:</span>
                                          <span className='select-option'>
                                    <select>
                                                <option>Small</option>
                                                    <option>Medium</option>
                                                    <option>Large</option>
                                              </select>
                                                <i className='fa fa-angle-down' />
                                  </span>
                                        </span>
                                        <span className='title'>
                                        <span>Quantity:</span>
                                        <input type='text' id='quantityVal' />
                                      </span>
                              </div>
                                </div>
                            <div className='modal-footer'>
                            <div className='btn-gray' data-dismiss='modal'>Cancel</div>
                                    <div className='btn-blue' data-dismiss='modal'>Save</div>
                          </div>
                            </div>
                      </div>
                    </div>
                    <div id="modalPDF" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false" style={{ display: 'none' }}>

                        <div className="modal-dialog compare-delete-modal-content">

                            <div className="modal-content">

                                <div className="modal-body">

                                    <p align="left">We will send the PDF to your email address</p>

                                    <input type="email" id="emailPDF" name="email" placeholder="Email Address" multiple/>

                                </div>

                                <div className="modal-footer">

                                    <div className="btn-gray" data-dismiss="modal">Cancel</div>

                                    <div className="btn-blue" id="btnSend">Send</div>

                                </div>

                            </div>

                        </div>
                    </div>
                <div id='modalRemove' className='modal fade' role='dialog' data-backdrop='static' data-keyboard='false'>
                        <div className='modal-dialog compare-delete-modal-content'>
                    <div className='modal-content'>
                              <div className='modal-body'>
                                  <p style={{ textAlign: 'center' }}>Are you sure you want to delete the product from this list?</p>
                                </div>
                              <div className='modal-footer'>
                                  <div className='btn-gray' data-dismiss='modal'>Cancel</div>
                                    <div className='btn-green' id='btnRemove' onClick={() => this.deleteComparisonDetail()}>Okay</div>
                                </div>
                            </div>
                  </div>
                    </div>
                <div id='modalRemoveAll' className='modal fade' role='dialog' data-backdrop='static' data-keyboard='false'>
                <div className='modal-dialog compare-delete-modal-content'>
                    <div className='modal-content'>
                              <div className='modal-body'>
                                    <p style={{ textAlign: 'center' }}>Are you sure you want to clear all products from this list? ( It will be gone forever)</p>
                            </div>
                              <div className='modal-footer'>
                                    <div className='btn-gray' data-dismiss='modal'>Cancel</div>
                                  <div className='btn-green' id='btnRemove' onClick={() => this.clearAllComparisonDetails()}>Okay</div>
                                </div>
                            </div>
                        </div>
              </div>
                <div id='modalUnableOrder' className='modal fade' role='dialog' data-backdrop='static' data-keyboard='false' style={{ display: 'none' }}>
                        <div className='modal-dialog'>
                    <div className='modal-content'>
                              <div className='modal-body text-center'>
                                    <h4>Unable to order item</h4>
                                    <p>The following Item details have been updated<br /> please remove and add the item(s) / offer(s) again to compare the latest information before ordering</p>
                                    <div id='updatedItems'>
                                        <div><strong /></div>
                                    </div>
                                    <br />
                                    <div className='modal-footer text-center'>
                                        <button className='btn-green' data-dismiss='modal'>Okay</button>
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
module.exports = ComparisonDetailModalComponent;
