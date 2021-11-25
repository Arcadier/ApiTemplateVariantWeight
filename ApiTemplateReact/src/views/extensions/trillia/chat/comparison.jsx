'use strict';
var React = require('react');
var ComparisonWidgetComponent = require('../../../extensions/' + process.env.TEMPLATE + '/comparison/comparison-widget/index');

class ChatComparisonComponent extends React.Component {

    render() {
        const self = this;
        return (
            <React.Fragment>
                <ComparisonWidgetComponent
                    comparisonList={self.props.comparisonList}
                    comparison={self.props.comparison}
                    comparisonToUpdate={self.props.comparisonToUpdate}
                    comparisonDetailToUpdate={self.props.comparisonDetailToUpdate}
                    getUserComparisons={self.props.getUserComparisons}
                    getComparison={self.props.getComparison}
                    createComparison={self.props.createComparison}
                    editComparison={self.props.editComparison}
                    setComparisonToUpdate={self.props.setComparisonToUpdate}
                    setComparisonDetailToUpdate={self.props.setComparisonDetailToUpdate}
                    deleteComparisonDetail={self.props.deleteComparisonDetail} />
            </React.Fragment>
        );
    }
}

module.exports = ChatComparisonComponent;