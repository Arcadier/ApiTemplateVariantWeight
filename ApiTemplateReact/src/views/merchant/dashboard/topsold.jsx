'use strict';
var React = require('react');

class TopSold extends React.Component {

    showBestProductSeller() {
        var self = this;
        if (this.props.footerTransaction && this.props.footerTransaction.length > 0) {
            return (
                this.props.footerTransaction.map(function (tran) {
                    return (
                        <tr>
                            <td data-th="Best Sellers"><span>{tran.Name}</span></td>
                            <td data-th="Item ID"><span>{tran.ID}</span></td>
                            <td data-th="Total Sales"><span>{tran.TotalSales}</span></td>
                            <td data-th="Items Sold"><span>{tran.TotalSoldQuantity}</span></td>
                        </tr>
                    )
                })
            )
        }
        else
            return null;
    }


    showEmpty() {
        var self = this;
        if (this.props.footerTransaction && this.props.footerTransaction.length > 0) {
          return ''
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
                        <div className="tbl-dash-title">Best Product Sellers</div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Best Sellers</th>
                                    <th>Item ID</th>
                                    <th>Total Sales</th>
                                    <th>Items Sold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {self.showBestProductSeller()}
                            </tbody>
                        </table>
                        {self.showEmpty()}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = TopSold;