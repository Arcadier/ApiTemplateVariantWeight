'use strict';
var React = require('react');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');
var actionTypes = require('../../redux/actionTypes');

class PaginationComponent extends React.Component {
    showPrevious() {
        if (typeof this.props.totalRecords === "undefined" || this.props.totalRecords <= 0 || this.props.totalRecords <= this.props.pageSize) {
            return null;
        }

        return (
            <li className="pag_prev">
                <a href="#" aria-label="Previous" onClick={(e) => this.goToPage(this.props.pageNumber - 1)}>
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        );
    }

    showNext() {
        if (typeof this.props.totalRecords === "undefined" || this.props.totalRecords <= 0 || this.props.totalRecords <= this.props.pageSize) {
            return null;
        }

        return (
            <li className="pag_next">
                <a href="#" aria-label="Next" onClick={(e) => this.goToPage(this.props.pageNumber + 1)}>
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        );
    }

    showPages() {
        if (typeof this.props.totalRecords === "undefined" || this.props.totalRecords <= 0) {
            return null;
        }
        //use for pagination ellipsis
        let totalPages = Math.ceil(this.props.totalRecords / this.props.pageSize);
        var current = this.props.pageNumber,
            last = totalPages,
            delta = 4,
            left = current - delta,
            right = current + delta + 1,
            range = [],
            l;

        let pageList = [];
        range.push(1)
        for (let i = current - delta; i <= current + delta; i++) {
            if (i >= left && i < right && i < last && i > 1) {
                range.push(i);
            }
        }
        if (last != 1) range.push(last);
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    pageList.push(l + 1);
                } else if (i - l !== 1 && range.length >= 6) {
                    pageList.push('...');
                }
            }
            pageList.push(i);
            l = i;
        }
        //end ellipsis
        return (
            pageList.map((i, index) => {
                let classValue = i === this.props.pageNumber ? "numeros active" : "numeros";
                return (
                    <li key={index} className={classValue}><a href="#" onClick={(e) => this.goToPage(i)}>{i}</a></li>
                )
            })
        );
    }

    goToPage(pageNo) {
        if (typeof this.props.goToPage === "function") {
            let totalPages = Math.ceil(this.props.totalRecords / this.props.pageSize);
            if (pageNo != this.props.pageNumber && pageNo > 0 && pageNo <= totalPages) {
                this.props.goToPage(pageNo, this.props.filters);
            }
        }
    }

    render() {
        var self = this;
        if (this.props.pagingState && this.props.pagingState === "hide") {
            return "" ;
        }
        return (
            <nav className="text-center">
                <ul className="pagination">
                    {self.showPrevious()}
                    {self.showPages()}
                    {self.showNext()}
                </ul>
            </nav>
        );
    }
}

module.exports = PaginationComponent;