'use strict';
var React = require('react');
var ReactRedux = require('react-redux');

var ItemsHome = require('../../views/home/items');
var CategoriesHome = require('../../views/home/categories').CategoriesHomeComponent;
var BannersHome = require('../../views/home/banners');
var TitlePanelsHome = require('../../views/home/title-panels');
var CallToActionPanelsHome = require('../../views/home/call-to-action-panels');
var ValuePropositionPanelsHome = require('../../views/home/value-proposition-panels');
var BaseComponent = require('../shared/base');
var EnumCoreModule = require('../../public/js/enum-core');

var categoryActions = require('../../redux/categoryActions');

class HomepageWithPanelCompenent extends BaseComponent {

    componentDidMount() {
        let self = this;

        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');

        if (typeof error != 'undefined') {
            if (error == 'invalid-token') {
                self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_TOKEN);
            }
            if (error == 'merchant-not-found') {
                self.showMessage({ 
                    type: "error",
                    body: "This page is no longer accessible.",
                    header: "Sorry!"
                });
            }
        }
    }

    getBannerPanel() {
        if (this.props.panels != null) {
            const bannerPanel = this.props.panels.filter(p => p.Type.toLowerCase() === 'slider');
            if (bannerPanel && bannerPanel.length > 0) {
                return bannerPanel[0];
            }
        }
        return null;
    }

    renderDefault() {
        return (
            <React.Fragment>
                <CategoriesHome categories={this.props.categories} numberOfCategories={this.props.numberOfCategories} collapsableCategories={this.props.collapsableCategories} />
                <ItemsHome items={this.props.items} itemLayoutCount={this.props.itemLayoutCount} user={this.props.user} userPreferredLocationId={this.props.userPreferredLocationId} />
            </React.Fragment>
        )
    }

    renderPanels() {
        var self = this;
        var panelViews = this.props.panels.map(function (panel, index) {
            if (panel.Type == 'Categories') {
                if (panel.IsVisible)
                    return (<CategoriesHome categories={self.props.categories} numberOfCategories={self.props.numberOfCategories} loadMore={self.props.loadMore} collapsableCategories={self.props.collapsableCategories}  loadLess={self.props.loadLess} key={index} />)
            } else if (panel.Type == 'LatestItems') {
                if (panel.IsVisible)
                    return (<ItemsHome items={self.props.items} key={index} layoutItemCount={self.props.layoutItemCount} userPreferredLocationId={self.props.userPreferredLocationId} isBespoke={self.props.isBespoke} user={self.props.user} />)
            } else if (panel.Type == 'Title') {
                return (<TitlePanelsHome panel={panel} key={index} />)
            } else if (panel.Type == 'CalltoAction') {
                return (<CallToActionPanelsHome panel={panel} key={index} />)
            } else if (panel.Type == 'ValueProposition') {
                return (<ValuePropositionPanelsHome panel={panel} key={index} />)
            }
        });
        return panelViews;
    }

    render() {
        console.log('this.props.user', this.props.user);
        
        return (
            <div className="home-pg-container">
                <BannersHome panel={this.getBannerPanel()} />
                <div className="category-list-outer">
                    <div className="container-fluid">
                        <div className="row">
                            {this.props.panels != null ? this.renderPanels() : this.renderDefault()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        userPreferredLocationId: state.userReducer.userPreferredLocationId,
        categories: state.categoryReducer.categories,
        numberOfCategories: state.categoryReducer.numberOfCategories,
        panels: state.panelsReducer.panels,
        items: state.itemsReducer.items,
        layoutItemCount: state.settingsReducer.layoutItemCount,
        collapsableCategories: state.settingsReducer.collapsableCategories,
        isBespoke: state.settingsReducer.isBespoke
    }
}

function mapDispatchToProps(dispatch) {
    return {
        loadMore: () => dispatch(categoryActions.loadMore()),
        loadLess: () => dispatch(categoryActions.loadLess())
    }
}

const HomepageWithPanelHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(HomepageWithPanelCompenent)

module.exports = {
    HomepageWithPanelHome,
    HomepageWithPanelCompenent
}