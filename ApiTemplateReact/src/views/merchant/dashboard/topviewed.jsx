'use strict';
var React = require('react');

class TopViewed extends React.Component {

    componentDidUpdate() {
        var self = this;
    }

    showTopViewed() {
        var self = this;
        if (this.props.topViewedTransaction && this.props.topViewedTransaction.length > 0) {
            return (
                this.props.topViewedTransaction.map(function(tran) {
                    return (
                        <tr>
                            <td data-th="Best Sellers"><span>{tran.ItemName}</span></td>
                            <td data-th="Item ID"><span>{tran.ItemGuid}</span></td>
                            <td data-th="Total Sales"><span>{tran.TotalSales}</span></td>
                            <td data-th="Items Sold"><span>{tran.ItemSold}</span></td>
                        </tr>
                    );
                })
            );
        } else
            return null;
    }

    showEmpty() {
        var self = this;
        if (this.props.topViewedTransaction && this.props.topViewedTransaction.length > 0) {
            return '';
        }
        else
           return self.props.graphEmpty()
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="tbl-dash">
                    <div className="ph-t-table">
                        <div className="tbl-dash-title">Top Viewed Items</div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Most Viewed</th>
                                    <th>Item ID</th>
                                    <th>Total Sales</th>
                                    <th>Items Sold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {self.showTopViewed()}
                            </tbody>
                        </table>
                        {self.showEmpty()}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = TopViewed;