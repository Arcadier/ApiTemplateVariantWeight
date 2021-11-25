'use strict';
var React = require('react');
const PermissionTooltip = require('../../common/permission-tooltip');

class ComparisonDetailListComponent extends React.Component {
    setSelectedComparison() {
        $('#comparisonList').val(this.props.selectedComparisonId);
    }

    componentDidMount() {
        var self = this;
        self.setSelectedComparison();

        $("#exportPDF").on("click", function () {
            $("#modalPDF").modal("show");
        });

        $('body').on('click', '#btnSend', function () {
            var $form = $('#modalPDF');
            var $name = $form.find('#emailPDF');
            var names = $.trim($name.val()).split(',');
            var i;
            //validate all email
            if (names) {
                let hasError = false;
                for (i = 0; i < names.length; i++) {
                    if (names[i]) {
                        if (!self.validateEmail(names[i])) {
                            $name.addClass('error-con');
                            hasError = true;
                            break;
                        }
                    }
                }
                if (hasError) {
                    return false;
                }
            }
            else {
                $name.addClass('error-con');
            }            
            for (i = 0; i < names.length; i++) {
                if (names[i]) {
                    self.props.exportToPDF(self.props.selectedComparisonId, name);
                }
            }
            $form.modal('hide');
            $name.val('');
            //if (!self.validateEmail(name)) {
            //    $name.addClass('error-con');
            //} else {
            //    self.props.exportToPDF(self.props.selectedComparisonId, name);
            //    $name.removeClass('error-con');
            //    $form.modal('hide');
            //    $name.val('');
            //}
        });
    }

    componentDidUpdate() {
        this.setSelectedComparison();
    }

    validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
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
                    <div className="col-md-6 col-sm-6">
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
                    <div className="col-md-6 col-sm-6">
                        <ul className="compare-tab">
                            <li><span>{this.props.comparisonDetailCount}</span> products added</li>
                            <li>
                                <PermissionTooltip isAuthorized={this.props.permissions.isAuthorizedToDelete}>
                                    <span id="clearAll" onClick={() => this.showDeleteAllModal()}>Clear all</span>
                                </PermissionTooltip>
                            </li>
                            <li><a id="exportPDF" className="pdf-button" href="javascript:void(0);">Export to PDF</a></li>
                        </ul>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
module.exports = ComparisonDetailListComponent;