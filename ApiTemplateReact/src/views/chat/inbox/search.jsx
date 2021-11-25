'use strict';

var React = require('react');
var ReactRedux = require('react-redux');
class SearchChatComponent extends React.Component {
    constructor(props) {
        super(props);
        this.searchMessages = this.searchMessages.bind(this);
        this.inputChange = this.inputChange.bind(this);
        this.state = {
            keyword: ''
        };
    }
    searchMessages(e) {
        if (e.keyCode == 13) {
            this.props.searchInbox(e.target.value);
        }
    }
    inputChange(e) {
        this.setState({
            keyword: e.target.value
        })
    }
    render() {
        const self = this;
        return (
            <React.Fragment>
                <div className="sc-upper">
                    <div className="sc-u sc-u-mid full-width">
                        <div className="pull-left">
                            <span className="sc-text-big">Inbox</span>
                        </div>
                        <div className="pull-right">
                            <div className="order-search-input border-rad-null pull-right" >
                                <input type="text" placeholder="Search by name & messages" name="" onKeyUp={this.searchMessages} defaultValue={this.props.keyword} onChange={this.inputChange} />
                                <i className="fa fa-search" onClick={(e) => self.props.searchInbox(this.state.keyword)}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = SearchChatComponent;

