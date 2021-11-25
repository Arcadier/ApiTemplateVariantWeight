'use strict';
var React = require('react');

var FooterLayout = require('../layouts/footer').FooterLayoutComponent;

var HeaderLayout = require('../../views/layouts/header').HeaderLayoutComponent;
var HomepageWithPanel = require('../../views/home/home-page-panels').HomepageWithPanelCompenent;

class Homepage extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayout categories={this.props.categories} user={this.props.user}  />
                </div>
                <div className="main" id="homepage-list">
                    <HomepageWithPanel panels={this.props.panels} collapsableCategories={this.props.collapsableCategories} categories={this.props.categories} layoutItemCount={this.props.layoutItemCount} user={this.props.user} items={this.props.items} numberOfCategories={this.props.numberOfCategories}  />
                </div>
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

module.exports = Homepage;