'use strict';

var React = require('react');
var BaseComponent = require('../../../../shared/base');
class ListComponent extends BaseComponent {

    render() {
        const self = this;

        return (
            <table className="table order-data item-area" id="tbl-comparison-list">
                <thead>
                    <tr >
                        <th width="30%">LIST NAME</th>
                        <th width="25%" className="text-center">DATE CREATED</th>
                        <th width="25%" className="text-center">PRODUCTS</th>
                        <th width="15%"></th>
                    </tr>
                </thead>
                <tbody>
                {
                    this.props.comparisons.map(function (comparison, index) {
                        return (
                            <tr key={comparison.ID} className="item-row" data-key="item" data-id={comparison.ID}>
                                <td data-th="LIST NAME"><a href={"/comparison/detail?comparisonId=" + comparison.ID} className="list-name" data-id=''>{comparison.Name}</a></td>
                                <td className="text-center" data-th="DATE CREATED">
                                    {self.formatDateTime(comparison.CreatedDateTime)}</td>
                                <td className="text-center" data-th="PRODUCT">{comparison.ComparisonDetails.length}</td>
                                <td data-th="Action">
                                   
                                        <a href="javascript:void(0)" className="edit_item" data-id={comparison.ID}
                                            onClick={() => self.props.showComparisonAddEdit(comparison.ID, comparison.Name)}>
                                            <i className="icon icon-edit"></i>
                                        </a>
                                        <a href="javascript:void(0)" className="openModalRemove"
                                            data-id={comparison.ID} data-toggle="modal"
                                        onClick={() => self.props.showDeleteModalDialog(comparison.ID, comparison.Name)}>
                                            <i className="icon icon-delete"></i></a>
                                        
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        );
    }
}

module.exports = ListComponent;