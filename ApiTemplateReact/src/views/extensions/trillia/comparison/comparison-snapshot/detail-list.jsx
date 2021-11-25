'use strict';
var React = require('react');
var BaseComponent = require('../../../../shared/base');

class DetailListComponent extends BaseComponent {
    render() {
        const self = this;

        return (
            this.props.snapshots.map(function (snapshot, index) {
                return (
                    <table key={'table-' + index}>
                        <tr>
                            <td><b>Seller Name</b></td>
                            <td>{snapshot.sellerName}</td>
                        </tr>
                        <tr>
                            <td><b>Item Name</b></td>
                            <td>{snapshot.itemName}</td>
                        </tr>
                        <tr>
                            <td><b>Price</b></td>
                            <td>
                                <div className="price">{self.renderFormatMoney(snapshot.currencyCode, snapshot.itemPrice)}</div>
                            </td>
                        </tr>
                        <tr>
                            <td><b>Quantity</b></td>
                            <td>{snapshot.quantity}</td>
                        </tr>
                        <tr>
                            <td><b>Original Price</b></td>
                            <td>
                                <div className="price">{self.renderFormatMoney(snapshot.currencyCode, snapshot.originalPrice)}</div>
                            </td>
                        </tr>
                        {
                            snapshot.fields.map(function (field, index) {
                                return (
                                    <tr key={'row-' + index}>
                                        <td><b>{field.name}</b></td>
                                        <td>{field.value}</td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                )
            })
        );
    }
}

module.exports = DetailListComponent;