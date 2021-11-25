'use strict';

var React = require('react');
var BaseComponent = require('../../shared/base');
const PermissionTooltip = require('../../common/permission-tooltip');

class ListComponent extends BaseComponent {
    componentDidMount() {
        $('td').each(function () {
            var th = $(this).closest('table').find('th').eq(this.cellIndex);
            var thContent = $(th).html();
            if (!thContent) {
                thContent = 'Action';
            }
            $(this).attr('data-th', thContent);

        });
        $('body').on('click', '.sub-account.clickable tbody tr', function () {
            var id = $(this).data('id');
            window.location.href = 'seller-quotation-view.html?ref=' + id;
        });

    }
    renderEmpty() {
        if (this.props.comparisons && this.props.comparisons.length === 0) {
            return (
                <tr className="item-row" data-key="item" data-id="1" data-date="2019-05-27 13:00">
                    <td colspan="4">
                        <div className="empty-page-sec">
                            <img src="/assets/images/emptypage/compare-list.svg" alt="empty page img" />
                            <div className="empty-page-title">Nothing to see here.</div>
                            <div className="empty-page-message">You have not created your own list of comparisons</div>
                        </div>
                    </td>
                </tr>

            )
        }
    }
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
                                    <PermissionTooltip isAuthorized={self.props.permissions.isAuthorizedToEdit} >
                                        <a href="javascript:void(0)" className="edit_item" data-id={comparison.ID}
                                            onClick={() => self.props.showComparisonAddEdit(comparison.ID, comparison.Name)}>
                                            <i className="icon icon-edit"></i>
                                        </a>
                                    </PermissionTooltip>
                                    <PermissionTooltip isAuthorized={self.props.permissions.isAuthorizedToDelete} >
                                        <a href="javascript:void(0)" className="openModalRemove"
                                            data-id={comparison.ID} data-toggle="modal"
                                        onClick={() => self.props.showDeleteModalDialog(comparison.ID, comparison.Name)}>
                                            <i className="icon icon-delete"></i></a>
                                    </PermissionTooltip>
                                </td>
                            </tr>
                        )
                    })
                    }
                    {this.renderEmpty()}
                </tbody>

            </table>
        );
    }
}

module.exports = ListComponent;