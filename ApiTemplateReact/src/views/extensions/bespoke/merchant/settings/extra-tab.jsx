'use strict';
const React = require('React');

class ExtraTab extends React.Component {
	render() {
		return (
            <li><a data-toggle='tab' href='#Payment'>Payment</a></li>
		)
	}
}

module.exports = ExtraTab;