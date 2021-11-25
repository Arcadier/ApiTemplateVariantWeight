'use strict';
var React = require('react');
var ReactRedux = require('react-redux');

class BreadcrumbComponent extends React.Component {
    renderBreadCrumbs() {
        var self = this;
        let pageTemplate = [];
        pageTemplate.push(<p key={998}><a href='/' >Home</a></p>);
        pageTemplate.push(<i key={999} className="fa fa-angle-right"></i>)

        if (self.props.itemDetails.Categories) {
            let mainParentID = "";
            let categoryToShow = [];
            let gotMainParentCategoryID = false;
            self.props.itemDetails.Categories.sort((a, b) => (a.SortOrder > b.SortOrder) ? 1 : -1)

            self.props.itemDetails.Categories.forEach(function (data, index) {
                //Main Parent
                if (data.ParentCategoryID === null && gotMainParentCategoryID === false) {
                    mainParentID = data.ID;
                    categoryToShow.push(data);
                    gotMainParentCategoryID = true;
                }
            });
            function checkParentCategory(ID) {
                self.props.itemDetails.Categories.forEach(function (data, index) {
                    //Child
                    if (data.ParentCategoryID === ID) {
                        categoryToShow.push(data);
                        checkParentCategory(data.ID);
                    }
                });
            }
            //checkParentCategory(mainParentID);

            categoryToShow.forEach(function(data, index) {
                if (categoryToShow.length - 1 == index) {
                    pageTemplate.push(<p key={index + data.ID} className='active'>{data.Name}</p>);
                } else {
                    pageTemplate.push(<p key={index + data.Name} className=''><a href={'/search?categories=' + data.ID}>{data.Name}</a></p>);
                    pageTemplate.push(<i key={index + data.ID} className="fa fa-angle-right"></i>);
                }
            });
        }

        return pageTemplate;
    }

    render() {
        return (
            <div className="h-parent-child-txt full-width">
                {this.renderBreadCrumbs()}
            </div>
        );
    }
}

module.exports = BreadcrumbComponent;