'use strict';

const React = require('react');
const ReactRedux = require('react-redux');
const PaginationComponent = require('../common/pagination');
const BaseComponent = require('../shared/base');

class ItemLogDetailsComponent extends BaseComponent {
    renderMessages() {
        const self = this;
        if (this.props.messages != null && this.props.messages.length > 0) {
            var html = this.props.messages.map(function(message) {
                return (
                    <tr key={message.ID}>
                        <td>{self.formatDateTime(message.AtDateTime, process.env.DATETIME_FORMAT)}</td>
                        <td> {self.formatDateTime(message.AtDateTime, process.env.TIME_FORMAT)}</td>
                        <td>{message.ItemID}</td>
                        <td>{message.Item !== undefined ? message.Item.Name : ''}</td>
                        <td>{message.Type}</td>
                        <td>{message.UserID}</td>
                        <td>{message.Username}</td>
                    </tr>
                );
            });
            return html;
        }
        return <tr></tr>;
    }
    renderEmpty() {
        if (this.props.messages && this.props.messages.length === 0) {
            return (
                <div className="empty-page-sec">
                    <img src="/assets/images/emptypage/activity-log-icon.svg" alt="empty page img" />
                    <div className="empty-page-title">Nothing to see here.</div>
                    <div className="empty-page-message">Activities will be recorded here</div>
                </div>
            )
        }
    }
    render() {
        const self = this;
        return (
            <React.Fragment>
                <div id='tab-login' className='tab-pane fade in active'>
                    <div className='subaccount-data-table'>
                        <table className='table order-data sub-account' id='tbl-login'>
                            <thead>
                                <tr>
                                    <th>Start Date Time</th>
                                    <th>End Date Time</th>
                                    <th>Item ID</th>
                                    <th>Item Name</th>
                                    <th>Type</th>
                                    <th>User ID</th>
                                    <th>Username</th>
                                </tr>
                            </thead>
                            <tbody>
                                {self.renderMessages()}
                            </tbody>
                        </table>
                        {this.renderEmpty()}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = ItemLogDetailsComponent;
