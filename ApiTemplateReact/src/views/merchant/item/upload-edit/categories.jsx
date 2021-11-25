'use strict';
var React = require('react');

class CategoryComponent extends React.Component {
    renderCategories() {
        let self = this;      
        return this.props.itemModel.categories.map(function (cat, i) {
            if (cat.ParentCategoryID == null && cat.ShowThis == true) {
                return self.renderCategory(cat, i);
            }
            else if (cat.ChildCategories.length > 0) {
                cat.ChildCategories.map(function (cat, i) {
                    if (cat.ShowThis == true) {
                        return self.renderCategory(cat, i);
                    }
                });
                
            }
            
        })
    }

    renderCategory(category, i) {
        let self = this;
        //recursive function to render all categories with hierarchial level
        const checkboxId = `checkboxCategory${category.ID}`;
        const isChecked = category.Selected;
        const hasChildren = category.ChildCategories.length > 0;
        const listClassName = hasChildren
            ? 'check-category parent-cat has-child-sub'
            : 'check-category parent-cat';

        return (
            <li key={category.ID +i} className={listClassName}>
                {
                    hasChildren 
                        ? <span className="cat-toggle">
                            <i className="fa fa-angle-up up"></i>
                            <i className="fa fa-angle-down down hide"></i>
                        </span>
                        : false
                }
                <input
                    type="checkbox"
                    id={checkboxId}
                    parentid={category.ParentCategoryID}
                    checked={isChecked}
                    onChange={() => { this.props.selectUnselectCategory(category.ID) }}
                />
                <label htmlFor={checkboxId}></label>
                <span>{category.Name}</span>
                {
                    hasChildren
                        ? <ul key={category.ID + i} className="sub-cat">
                            {
                                category.ChildCategories.map(child => this.renderCategory(child))
                            }
                        </ul>
                        : false
                }
            </li>
        )
    }

    //addCatLine($parent) {
    //    var $parent = $parent;
    //    var $parentulFirst = $parent.first().find("ul.sub-cat").first();
    //    var $parentulliFirst1 = $parentulFirst.children("li").last().find("label").first().innerHeight() + 5;
    //    var $parentulliFirst = $parentulFirst.closest("li").last().innerHeight();
    //    var parentnewHeight = $parentulliFirst + $parentulliFirst1;
    //    setTimeout(function () {
    //        $parent.find("li.check-category.has-child-sub").each(function () {
    //            var $ulFirst = $(this).find("ul").first();
    //            var $ulliFirst1 = $ulFirst.children("li").last().find("label").first().innerHeight() + 5;
    //            var $ulliFirst = $ulFirst.children("li").last().innerHeight();
    //            var newHeight = $ulliFirst + $ulliFirst1;
    //            $(this).append('<div class="cat-line"></div>');
    //            $(this).find(".cat-line:first").css("height", $(this).height() - newHeight + "px");
    //        });

    //        $parent.first().append('<div class="cat-line cat-linefirst"></div>');
    //        $parent.first().find(".cat-linefirst").css("height", $parent.first().height() - parentnewHeight + "px");
    //    }, 500);
    //}

    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="item-form-group">
                    <div className="col-md-12">
                        <div className="row">
                            <label>Category(s)*</label>
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="item-upload-category-container required">
                                        <div className="col-md-9">
                                            <div className="row cat-search">
                                                <input type="text" className="" name="category-name" maxLength={130}
                                                    id="categorySearch" onKeyUp={(e) => this.props.updateCategoryToSearch(e.target.value)} defaultValue={this.props.itemModel.categoryWord}/>
                                                <i className="fa fa-search" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                        <div className="checkbox-container">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <div className="col-md-9">
                                                        <div className="row">
                                                            <div className="checkbox-selection">
                                                                <span id="selectAll" onClick={(e) => this.props.selectAllOrNone("checked")} className="pull-left">Select all</span>
                                                                <span id="selectNow" onClick={(e) => this.props.selectAllOrNone("")} className="pull-right">Select none</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="checkbox-content">
                                                        <ul>
                                                            {this.renderCategories()}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = CategoryComponent;