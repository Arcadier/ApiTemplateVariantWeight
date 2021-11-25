'use strict';
const React = require('react');
const BaseComponent = require('../../../../../../shared/base');

class ModalEditBooking extends BaseComponent {
    onSaveBooking(e) {
        let bookDate = $('#booking_date').val();
        let bookTime = $('#booking_time').val();
        if (bookDate === '' || bookTime === '')
            return;
        this.props.onUpdateBookingSlot(bookDate, bookTime);
    }
    render() {
        return (
            <div id="edit-booking-modal" className="edit-booking-modal modal fade" role="dialog">
                <div className="modal-dialog">
                    {/* Modal content*/}
                    <div className="modal-content">
                        <div className="modal-header light-modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <h4 className="modal-title">Edit Bookings</h4>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form-group">
                                <div className="row">
                                    <div className="col-sm-4">
                                        <label className="control-label" htmlFor="booking_date">Date:</label>
                                    </div>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control booking_date date-picker required" id="booking_date" name="booking_date" placeholder />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-form-group">
                                <div className="row">
                                    <div className="col-sm-4">
                                        <label className="control-label" htmlFor="booking_time">Time:</label>
                                    </div>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control booking_time time-picker required" id="booking_time" name="booking_time" placeholder />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div><button type="button" data-dismiss="modal" className="btn btn-grey">Cancel</button></div>
                            <div><button type="button" className="btn btn-blue btn-save-booking" onClick={(e) => this.onSaveBooking(e)}>Save</button></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    
        
    }
}

module.exports = ModalEditBooking;