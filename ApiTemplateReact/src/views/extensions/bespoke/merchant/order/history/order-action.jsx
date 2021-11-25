'use strict';
var React = require('react');

class OrderActionComponent extends React.Component {
    render() {
        const self = this;
        return (
            <div className="pull-right">
                <div className="order-search-input pull-right">
                    <input type="text" name="" placeholder="Search by Invoice ID" defaultValue={this.props.keyword} onKeyUp={(e) => this.props.searchOrder(e)} />
                    <i className="fa fa-search"></i>
                </div>
                <div className="status-btn-pr">
                    <a href="#" className="status-btn change-order-status" onClick={(e) => this.props.showHideChangeStatusModal(true)}>Change Status</a>
                </div>
            </div>
        );
    }
}

module.exports = OrderActionComponent;