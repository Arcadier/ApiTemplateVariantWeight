'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const DetailComponent = require('../quotation-detail/detail');
const PriceComponent = require('../quotation-detail/price');
const ModalComponent = require('../quotation-detail/modal');
const QuotationActions = require('../../../redux/quotationActions');
const CartActions = require('../../../redux/cartActions');
const EnumCoreModule = require('../../../public/js/enum-core');
const { validatePermissionToPerformAction } = require('../../../redux/accountPermissionActions');

class QuotationDetailComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            isProcessing: false,
            modalProcess: 'CANCEL QUOTATION'
        };

        this.openRemoveModal = this.openRemoveModal.bind(this);
        this.cancelQuotation = this.cancelQuotation.bind(this);
        this.declineQuotation = this.declineQuotation.bind(this);
        this.generateInvoiceByCartItem = this.generateInvoiceByCartItem.bind(this);
        this.generateOrderByCartItem = this.generateOrderByCartItem.bind(this);
    }

    cancelQuotation() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        $('#modalRemove').fadeOut();

        this.props.cancelQuotation((errorMessage) => {
            if (!errorMessage) {
                $(".btn-loader-cancel").removeClass("btn-loading");
                return window.location = '/chat?channelId=' + quotation.ChannelID;
            }

            self.setState({
                isProcessing: false
            });
            $(".btn-loader-cancel").removeClass("btn-loading");
            $('#modalRemove').modal('hide');
            self.showMessage(EnumCoreModule.GetToastStr().Error.CANCEL_QUOTATION_FAILED);
        });
    }

    getCurrencyCode() {
        const { quotation } = this.props;
        return quotation.CartItemDetail ? quotation.CartItemDetail.CurrencyCode : null;
    }

    getItemImageUrl() {
        const { quotation } = this.props;

        if (quotation.CartItemDetail) {
            if (quotation.CartItemDetail.ItemDetail && quotation.CartItemDetail.ItemDetail.Media) {
                return quotation.CartItemDetail.ItemDetail.Media[0].MediaUrl;
            }
        }

        return '';
    }

    getQuotationStatus() {
        const { quotation } = this.props;

        if (quotation.Accepted) {
            return 'Approved';
        } else if (quotation.Declined) {
            return 'Declined';
        } else if (quotation.MessageType == 'CANCELLED') {
            return 'Cancelled';
        }

        return 'Pending';
    }

    isLoggedUserMerchant() {
        const { user } = this.props;

        if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
            return true;
        }

        return false;
    }

    declineQuotation() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        $('#modalRemove').fadeOut();

        this.props.declineQuotation((errorMessage) => {
            if (!errorMessage) {
             //   if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                    $(".btn-loader-cancel").removeClass("btn-loading");
             //   }
                return window.location = '/chat?channelId=' + quotation.ChannelID;
            }

            self.setState({
                isProcessing: false,
                modalProcess: 'CANCEL QUOTATION'
            });

          //  if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                $(".btn-loader-cancel").removeClass("btn-loading");
         //   }

            $('#modalRemove').modal('hide');
            self.showMessage(EnumCoreModule.GetToastStr().Error.DECLINE_QUOTATION_FAILED);
        });
    }

    generateInvoiceByCartItem() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction("edit-consumer-quotation-details-api", () => {

            self.props.generateInvoiceByCartItem([quotation.CartItemDetail.ID], (invoiceNo) => {

                if (invoiceNo) {
                    return window.location = "/checkout/one-page-checkout?invoiceNo=" + invoiceNo;
                }

                self.setState({
                    isProcessing: false
                });
                $(".btn-loader").removeClass('btn-loading');
                self.showMessage(EnumCoreModule.GetToastStr().Error.CREATE_INVOICE_FAILED);
            });
        });
    }

    generateOrderByCartItem() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });
        if (!this.props.isAuthorizedToEdit) return;
        this.props.validatePermissionToPerformAction("edit-consumer-quotation-details-api", () => {
            self.props.getItemDetails(quotation.CartItemDetail.ItemDetail.ID, (result) => {
                if (result) {
                    self.props.generateOrderByCartItem([quotation.CartItemDetail.ID], (orderId) => {
                        if (orderId) {
                            return window.location = "/checkout/one-page-checkout?orderId=" + orderId;
                        }

                        self.setState({
                            isProcessing: false
                        });
                        $(".btn-loader").removeClass('btn-loading');
                        self.showMessage(EnumCoreModule.GetToastStr().Error.CREATE_ORDER_FAILED);
                        self.setState({
                            isProcessing: false
                        });
                    });
                }
                else {
                    self.showMessage(EnumCoreModule.GetToastStr().Error.CREATE_ORDER_FAILED);
                    self.setState({
                        isProcessing: false
                    });
                }
            });
        });
    }

    isSpaceTimeApiTemplate() {
        const { quotation } = this.props;
        var self = this;
        return typeof quotation.CartItemDetail.BookingSlot != 'undefined' && quotation.CartItemDetail.BookingSlot != null;
    }


    getAddons() {
        const { quotation } = this.props;
        var self = this;
        var addOns = 0;

        if (self.isSpaceTimeApiTemplate()) {
            var cartItemDetail = quotation.CartItemDetail;

            var self = this;
            if (cartItemDetail.AddOns) {
                var addons = cartItemDetail.AddOns;

                addons.forEach(function (e) {
                    addOns += e.PriceChange;
                })
            }
        }

        return addOns;
    }

    openRemoveModal(modalProcess) {
        if (!this.props.isAuthorizedToEdit) return;
        const self = this;
        const type = modalProcess == "DECLINE QUOTATION" ? "consumer" : "merchant"
        this.props.validatePermissionToPerformAction(`edit-${type}-quotation-details-api`, () => {
            self.setState({
                modalProcess: modalProcess
            }, () => {
                $('#modalRemove').modal('show');
            });
        });
    }

    componentDidMount() {
    }

    render() {
        const { quotation } = this.props;
        const extraPath = this.props.isMerchantAccess ? '/merchants' : '';

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={null} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main less_content" style={{ paddingTop: '46px' }}>
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <div className="sc-upper">
                                    <div className="sc-u title-sc-u sc-u-mid full-width">
                                        <div className="nav-breadcrumb">
                                            <i className="fa fa-angle-left" /> <a href={`${extraPath}/quotation/list`}>Back</a>
                                        </div>
                                        <span className="sc-text-big">Quote Number : {quotation.CosmeticNo != null && quotation.CosmeticNo != "" ? quotation.CosmeticNo : quotation.QuoteNo}</span>
                                    </div>
                                    <div className="sc-tops">
                                    </div>
                                </div>
                                <div className="quote-detail-table buyer-quotation-detail">
                                    <table className="table quote-data table-items">
                                        <tbody>
                                            <tr>
                                                <td data-th="Action">
                                                    Issue date
                                                    <span>{this.formatDate(quotation.CreatedDateTime)}</span>
                                                </td>
                                                <td data-th="Action">
                                                    Valid date
                                                    <span>{this.formatDate(quotation.ValidStartDate)} - {this.formatDate(quotation.ValidEndDate)}</span>
                                                </td>
                                                <td data-th="Action">
                                                    Supplier
                                                    <span>{quotation.FromUserName}</span>
                                                </td>
                                                <td data-th="Action">
                                                    Buyer
                                                    <span>{quotation.ToUserName}</span>
                                                </td>
                                                <td data-th="Action">
                                                    Payment Terms
                                                    <span>{quotation.PaymentTerm ? quotation.PaymentTerm.Name : null}</span>
                                                </td>
                                                <td data-th="Action">
                                                    Quotation Status
                                                    <span>{this.getQuotationStatus()}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="subaccount-data-table">
                                    <div className="row">
                                        <DetailComponent
                                            isSpaceTimeApiTemplate={this.isSpaceTimeApiTemplate()}
                                            addOnsAmount={this.getAddons()}
                                            details={quotation.OfferDetails}
                                            cartItemDetail={quotation.CartItemDetail}
                                            currencyCode={this.getCurrencyCode()}
                                            itemImageUrl={this.getItemImageUrl()} />
                                        <PriceComponent
                                            addOnsAmount = {this.getAddons()}
                                            cartItemDetail={quotation.CartItemDetail}
                                            details={quotation.OfferDetails}
                                            currencyCode={this.getCurrencyCode()}
                                            isMerchant={this.isLoggedUserMerchant()}
                                            status={this.getQuotationStatus()}
                                            generateInvoiceByCartItem={this.generateInvoiceByCartItem}
                                            generateOrderByCartItem={this.generateOrderByCartItem}
                                            openRemoveModal={this.openRemoveModal}
                                            buyerdocs={this.props.buyerdocs}
                                            isAuthorizedToEdit={this.props.isAuthorizedToEdit}
                                            validatePermissionToPerformAction={this.props.validatePermissionToPerformAction}
                                        />
                                        <div className="clearfix" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ModalComponent modalProcess={this.state.modalProcess}
                    cancelQuotation={this.cancelQuotation}
                    declineQuotation={this.declineQuotation} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        quotation: state.quotationReducer.quotationDetail,
        buyerdocs: state.quotationReducer.buyerdocs,
        isAuthorizedToEdit: state.userReducer.pagePermissions.isAuthorizedToEdit,
        isMerchantAccess: state.userReducer.isMerchantAccess
    };
}

function mapDispatchToProps(dispatch) {
    return {
        cancelQuotation: (callback) => dispatch(QuotationActions.cancelQuotation(callback)),
        declineQuotation: (callback) => dispatch(QuotationActions.declineQuotation(callback)),
        generateInvoiceByCartItem: (cartItemIds, callback) => dispatch(QuotationActions.generateInvoiceByCartItem(cartItemIds, callback)),
        generateOrderByCartItem: (cartItemIds, callback) => dispatch(QuotationActions.generateOrderByCartItem(cartItemIds, callback)),
        getItemDetails: (itemId, callback) => dispatch(CartActions.getItemDetails(itemId, callback)),
        validatePermissionToPerformAction: (code, callback) => dispatch(validatePermissionToPerformAction(code, callback)),
    };
}

const QuotationDetailHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(QuotationDetailComponent);

module.exports = {
    QuotationDetailHome,
    QuotationDetailComponent
};