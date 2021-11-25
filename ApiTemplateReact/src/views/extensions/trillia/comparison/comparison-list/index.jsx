'use strict';

let React = require('react');
let ReactRedux = require('react-redux');

let HeaderLayoutComponent = require('../../../../layouts/header').HeaderLayoutComponent;
let FooterLayoutComponent = require('../../../../layouts/footer').FooterLayoutComponent;

let ListComponent = require('../comparison-list/list');
let ModalAddEditComponent = require('../comparison-list/modal-add-edit');
let ModalDeleteComponent = require('../comparison-list/modal-delete');
let PaginationComponent = require('../../../../common/pagination');

let ComparisonActions = require('../../../../../redux/comparisonActions');

let Moment = require('moment');

class ComparisonListComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    showComparisonAddEdit(comparisonId, comparisonName) {
        const self = this;
        var $form = $('#frm-comparison');
        var $name = $form.find('#list_name');
        $name.val('');
        if (typeof comparisonId !== 'undefined') {
            self.setEvaluationToUpdate(comparisonId, comparisonName);
        }

        $('#modal-add-comparison-list').modal('show');
    }
    showDeleteModalDialog(comparisonId, name) {
        const self = this;
        if (typeof comparisonId !== 'undefined')
            self.setEvaluationToUpdate(comparisonId, name);

        $('#modalRemove').modal('show');

    }
   
    render() {

        // const  comparisonToUpdate = this.props.comparisonToUpdate;
        const self = this;

        //UN 627
        if (self.props.comparisons && self.props.comparisons.Records) {
            self.props.comparisons.Records.sort(function (e1, e2) {
                return Moment(e1.CreatedDateTime) < Moment(e2.CreatedDateTime) ? 1 : -1;
            });
        }

        return (
            <React.Fragment>
                <div className="header" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.currentUser} />
                </div>
                <div className="main">
                    <div className="orderlist-container">
                        <div className="container">
                            <div className="h-parent-child-txt full-width">
                                <p><a href="/">Home</a></p>
                                <i className="fa fa-angle-right"></i>
                                <p className="active">My Comparison Table</p>
                            </div>
                            <div className="sc-upper">
                                <div className="sc-u sc-u-mid full-width">
                                    <div className="pull-left">
                                        <span className="sc-text-big">My Comparison Table</span>
                                    </div>
                                    <div className="pull-right">
                                        <div className="status-btn-pr">
                                            <button className="status-btn btn-modal-comparison-list" onClick={(e) => self.showComparisonAddEdit()}>Add New List</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="oreder-data-table">
                                        
                                <ListComponent
                                    comparisons={self.props.comparisons.Records}
                                    showComparisonAddEdit={this.showComparisonAddEdit}
                                    editEvaluationList={this.props.editEvaluationList}
                                    showDeleteModalDialog={this.showDeleteModalDialog}
                                    setEvaluationToUpdate={this.props.setEvaluationToUpdate} />

                                <PaginationComponent
                                    totalRecords={self.props.comparisons.TotalRecords}
                                    pageNumber={self.props.comparisons.PageNumber}
                                    pageSize={self.props.comparisons.PageSize}
                                    goToPage={this.props.goToPage} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayoutComponent panels={this.props.panels} />
                </div>
                <ModalAddEditComponent addEvaluationList={this.props.addEvaluationList}
                    editEvaluationList={this.props.editEvaluationList}
                    comparisonList={this.props.comparisonToUpdate}
                   
                    setEvaluationToUpdate={this.props.setEvaluationToUpdate} />
                <ModalDeleteComponent
                    reloadEvaluationListPage={this.props.reloadEvaluationListPage}
                    comparisonList={this.props.comparisonToUpdate}
                    deleteEvaluationList={this.props.deleteEvaluationList} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        comparisons: state.comparisonReducer.comparisonList,
        comparisonToUpdate: state.comparisonReducer.comparisonToUpdate,
        currentUser: state.userReducer.user
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        setEvaluationToUpdate: (id, name) => dispatch(ComparisonActions.setEvaluationToUpdate(id, name)),
        reloadEvaluationListPage: () => dispatch(ComparisonActions.reloadEvaluationListPage()),
        addEvaluationList: (name) => dispatch(ComparisonActions.createEvaluation(name)),
        editEvaluationList: (id, name) => dispatch(ComparisonActions.editEvaluation(id, name)),
        deleteEvaluationList: (id, callback) => dispatch(ComparisonActions.deleteEvaluation(id,callback)),
        goToPage: (pageNo) => dispatch(ComparisonActions.goToPage(pageNo))

    }
}

const ComparisonList = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ComparisonListComponent)

module.exports = {
    ComparisonList,
    ComparisonListComponent
}