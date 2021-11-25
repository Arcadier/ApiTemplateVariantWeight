'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    user: null,
    transactions: [],
    headerTransaction: [],
    headerTransactionGrowthRate: [],
    footerTransaction: [],
    salesTransaction: [],
    topViewedTransaction: [],
    headerTotalVisits: [],
    googleAnalytics: null,
    analyticsApiAccess: null,
    baseUrl: ''
};

function dashboardReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_REPORTS: {
            if (action.reportType == 'transactions' && action.source == 'menuTop') {
                return Object.assign({}, state, {
                    headerTransaction: action.transaction.Records
                })
            }
            else if (action.reportType == 'transactions' && action.source == 'menuTopGrowthRate') {
                return Object.assign({}, state, {
                    headerTransactionGrowthRate: action.transaction.Records
                })
            }
            else if (action.reportType == 'transactions' && action.source == 'salesGraph') {
                return Object.assign({}, state, {
                    salesTransaction: action.transaction.Records
                })
            }
            else if (action.reportType == 'headerTotalVisits') {
                return Object.assign({}, state, {
                    headerTotalVisits: action.transaction.Records
                })
            }
            else if (action.reportType == "topViewed") {
                return Object.assign({}, state, {
                    topViewedTransaction: action.transaction.Records
                })
            }
            else if (action.reportType == "items") {
                return Object.assign({}, state, {
                    footerTransaction: action.transaction.Records
                })
            }
            else {

            }
        }
        default:
            return state
    }
};

module.exports = {
    dashboardReducer: dashboardReducer
}