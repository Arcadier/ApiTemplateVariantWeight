'use strict';
var React = require('react');

class ComparisonDetailListComponent extends React.Component {
    setSelectedComparison() {
        $('#comparisonList').val(this.props.selectedComparisonId);
    }

    componentDidMount() {
        this.setSelectedComparison();
    }

    componentDidUpdate() {
        this.setSelectedComparison();
    }

    getComparison(comparisonId) {
        this.props.getComparison(comparisonId, ['CartItem']);
        if (window.history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?comparisonId=${comparisonId}`;
            window.history.pushState({path:newurl},'',newurl);
        }
    }

    showDeleteAllModal() {
        this.props.setComparisonToUpdate(this.props.selectedComparisonId);
        $('#modalRemoveAll').modal('show');
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-element">
                            <select id="comparisonList" onChange={(e) => this.getComparison(e.target.value)}>
                                {Array.from(self.props.comparisonList).map(function (comparison, index) {
                                    return (
                                        <option key={comparison.ID} value={comparison.ID}>{comparison.Name}</option>
                                        );
                                })}
                            </select>
                            <i className="fa fa-angle-down" />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <ul className="compare-tab">
                            <li><span>{this.props.comparisonDetailCount}</span> products added</li>
                            <li><span id="clearAll" onClick={() => this.showDeleteAllModal()}>Clear all</span></li>
                            <li><a href="/">Continue Browsing</a></li>
                        </ul>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
module.exports = ComparisonDetailListComponent;